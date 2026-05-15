/**
 * Lead Processing API Route
 *
 * Status flow: new → researching → pending_review → approved (by Vlad)
 * On error: new → researching → new (retry)
 *
 * This endpoint is deliberately slow — it runs multiple API stages sequentially
 * with rate limiting to avoid timeouts and API errors.
 * Expected total time: 60-120 seconds per lead.
 */

// Allow up to 5 minutes for processing (Vercel pro max is 300s)
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { getLeadsByStatus, getLeadByLeadId, updateLeadResearchResults } from "@/lib/google-sheets";
import { detectNiche, getNicheByName } from "@/lib/niche-detector";
import { discoverCompetitors } from "@/lib/competitor-discovery";
import { runResearch } from "@/lib/research-runner";
import { isJunkCompetitor, JUNK_COMPETITOR_PATTERNS } from "@/lib/junk-filter";
import { preflightScan } from "@/lib/preflight-engine";

/**
 * Send Vlad a Telegram review alert with research summary
 */
async function sendVladReviewAlert(
  leadId: string,
  businessName: string,
  city: string,
  userCompetitors: string,
  result: Awaited<ReturnType<typeof runResearch>>,
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  
  const compNames = new Set<string>();
  for (const p of result.promptResults) {
    if (p.competitorName) compNames.add(p.competitorName);
  }
  const junkComps = [...compNames].filter(c => isJunkCompetitor(c));
  const nicheOk = result.niche !== 'local_business';
  const resolvedName = result.resolvedName || businessName;
  const brandPrompts = result.promptResults.filter(p => p.prompt.toLowerCase().includes(resolvedName.toLowerCase().split(' ')[0]));
  const brandAppeared = brandPrompts.filter(p => p.businessAppeared).length;
  const userComps = userCompetitors.split(',').map(c => c.trim()).filter(Boolean);
  const userCompsFound = userComps.filter(uc => {
    const key = uc.toLowerCase().split('.')[0].slice(0, 4);
    return [...compNames].some(cn => cn.toLowerCase().includes(key));
  });

  const reportUrl = `https://vizbiz.ai/report/${leadId}?token=owner_vlad`;
  const mcUrl = `https://vizbiz.ai/mission-control/leads/${leadId}`;
  const isWeak = result.statusBand === 'Weak';
  const nicheLabel = nicheOk ? result.niche.replace(/_/g, ' ') : `${result.niche} ⚠️`;

  let msg = `Research done for ${businessName} (${city}).\n\n`;
  msg += `Niche: ${nicheLabel}\n`;
  msg += `Appeared: ${result.appearedCount}/${result.totalPrompts} prompts\n`;
  msg += `Band: ${result.statusBand}\n`;

  if (userComps.length > 0) {
    msg += `Their competitors: ${userComps.join(', ')}\n`;
    msg += `  Found in results: ${userCompsFound.length > 0 ? userCompsFound.join(', ') : 'none'}\n`;
  }

  const topComps = result.promptResults
    .filter(p => p.competitorName && p.competitorAppeared)
    .reduce((acc, p) => { acc[p.competitorName!] = (acc[p.competitorName!] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sorted = Object.entries(topComps).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (sorted.length > 0) {
    msg += `\nTop competitors found:\n`;
    for (const [name, count] of sorted) {
      msg += `  • ${name} (${count}/${result.totalPrompts})\n`;
    }
  }

  msg += `\n📋 View report: ${reportUrl}\n`;
  msg += `📊 Mission Control: ${mcUrl}\n\n`;

  // Vlad's recommendation
  if (isWeak && nicheOk) {
    msg += `My take: approve this one. Zero visibility in a clear niche — textbook prospect. I'll draft the outreach email as soon as you say go.`;
  } else if (!nicheOk) {
    msg += `⚠️ Niche came back generic — might need a rerun. Check the report first.`;
  } else {
    msg += `They're showing up okay. Still worth reaching out with a "protect your lead" angle.`;
  }

  msg += `\n\nReply: /approve ${leadId} | /hold ${leadId} | /rerun ${leadId}`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: '6960754854', text: msg }),
  });
}

export async function POST(request: Request) {
  try {
    console.info("[process-lead] Starting lead processing");

    let targetLeadId: string | null = null;
    let forceRerun = false;
    try {
      const body = await request.clone().json().catch(() => ({}));
      targetLeadId = body?.leadId || null;
      forceRerun = body?.force === true;
    } catch { /* not JSON */ }

    let newLeads;
    if (targetLeadId) {
      const lead = await getLeadByLeadId(targetLeadId);
      if (!lead) {
        return NextResponse.json({ success: false, message: `Lead ${targetLeadId} not found` }, { status: 404 });
      }
      newLeads = [lead];
      console.info(`[process-lead] Processing specific lead: ${targetLeadId}`);
    } else {
      newLeads = await getLeadsByStatus("new");
    }

    if (newLeads.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No new leads found" });
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const lead of newLeads) {
      try {
        console.info(`[process-lead] Processing lead ${lead.leadId}: ${lead.dealershipName}`);

        await updateLeadResearchResults(lead.leadId, { status: "researching", researchStatus: "running" });

        // Extract PreFlight profile from notes (contains LLM-classified niche from website scrape)
        let preflightProfile: any = undefined;
        const pfIdx = (lead.notes || '').indexOf('PREFLIGHT:');
        if (pfIdx >= 0 && !forceRerun) {
          try {
            const rawAfter = lead.notes.slice(pfIdx + 10);
            const jsonStart = rawAfter.indexOf('{');
            const jsonEnd = rawAfter.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              preflightProfile = JSON.parse(rawAfter.slice(jsonStart, jsonEnd + 1));
              console.info(`[process-lead] Using cached preflight data`);
            }
          } catch { /* ignore */ }
        } else if (forceRerun) {
          console.info(`[process-lead] Force rerun — ignoring cached preflight data`);
        }

        // -- STAGE 1: Preflight Intelligence --
        // Scrape website + LLM classification (10-20s)
        if (!preflightProfile && lead.website) {
          try {
            console.info(`[process-lead] STAGE 1: Running live website scan for ${lead.website}`);
            preflightProfile = await preflightScan(lead.website);
            console.info(`[process-lead] STAGE 1 complete: niche=${preflightProfile.niche}, score=${preflightProfile.aiReadinessScore}, confidence=${(preflightProfile as any)?.nicheConfidence || 'N/A'}`);
          } catch (err) {
            console.warn(`[process-lead] STAGE 1 FAILED:`, err);
          }
        }

        // Check niche confidence
        const nicheConfidence = (preflightProfile as any)?.nicheConfidence || 50;
        if (nicheConfidence < 50) {
          console.warn(`[process-lead] ⚠️ LOW NICHE CONFIDENCE (${nicheConfidence}/100): ${(preflightProfile as any)?.confidenceReason || 'unknown reason'}`);
          console.warn(`[process-lead] Business: ${lead.dealershipName}, Niche: ${preflightProfile?.niche}, BusinessType: ${(preflightProfile as any)?.businessType || 'N/A'}`);
        }

        // Use preflight niche (from website scrape + LLM) if available
        // IMPORTANT: Trust the LLM classification even if niche isn't in our database.
        // Generate dynamic prompts from the niche name instead of discarding it.
        let nicheConfig;
        if (preflightProfile?.niche && preflightProfile.niche !== 'local_business' && preflightProfile.niche !== 'unknown') {
          console.info(`[process-lead] Using preflight niche: ${preflightProfile.niche} (LLM-classified from website)`);
          const knownConfig = getNicheByName(preflightProfile.niche);
          if (knownConfig) {
            nicheConfig = knownConfig;
          } else {
            // Niche not in our database — generate dynamic config from the LLM classification
            const { generateDynamicNicheConfig } = await import('@/lib/niche-detector');
            nicheConfig = generateDynamicNicheConfig(preflightProfile.niche, preflightProfile.nicheLabel);
            console.info(`[process-lead] Generated dynamic niche config for: ${preflightProfile.niche}`);
          }
        } else {
          nicheConfig = detectNiche(lead.dealershipName, lead.website);
          console.info(`[process-lead] Using keyword niche: ${nicheConfig.niche} (no preflight data)`);
        }
        console.info(`[process-lead] Final niche: ${nicheConfig.niche}`);

        // -- STAGE 2: Competitor Discovery --
        // Uses preflight data to find real competitors (5-15s with rate limiting)
        // ALWAYS runs discoverCompetitors — even when user provides a competitor,
        // it gets validated. If validation fails, auto-discovery kicks in.
        console.info(`[process-lead] STAGE 2: Discovering competitors for ${lead.dealershipName}...`);
        const competitors = await discoverCompetitors(lead.dealershipName, lead.website, lead.city, lead.competitor || undefined, {
          competitorSearchQueries: preflightProfile?.competitorSearchQueries,
          businessType: preflightProfile?.businessType,
          services: preflightProfile?.services,
          market: preflightProfile?.market,
        });
        if (competitors.length === 0) {
          console.info(`[process-lead] STAGE 2 complete: No validated competitors found`);
        } else {
          const source = lead.competitor?.trim() ? 'user-provided (validated)' : 'auto-discovered';
          console.info(`[process-lead] STAGE 2 complete: Found ${competitors.length} competitors (${source}): ${competitors.join(', ')}`);
        }

        // Pause between stages to avoid API pressure
        await new Promise(r => setTimeout(r, 2000));

        // -- STAGE 3: AI Visibility Research --
        // Runs 20 searches with rate limiting (~25-40s)
        console.info(`[process-lead] STAGE 3: Running AI visibility research...`);
        const researchResult = await runResearch(lead.dealershipName, lead.website, lead.city, competitors, preflightProfile);
        console.info(`[process-lead] STAGE 3 complete: ${researchResult.appearedCount}/${researchResult.totalPrompts} appearances`);


        const researchJson = JSON.stringify({
          businessName: researchResult.resolvedName || lead.dealershipName,
          website: lead.website,
          city: lead.city,
          contactName: lead.contactName,
          niche: researchResult.niche,
          appearedCount: researchResult.appearedCount,
          totalPrompts: researchResult.totalPrompts,
          statusBand: researchResult.statusBand,
          serviceVisibility: researchResult.serviceVisibility,
          promptResults: researchResult.promptResults,
          competitorMention: researchResult.competitorMention,
          competitorLine: researchResult.competitorLine,
          competitorCategories: researchResult.competitorCategories,
          whyThisMatters: researchResult.whyThisMatters,
          revenueLoss: researchResult.revenueLoss || 0,
          leadsLost: researchResult.leadsLost || 0,
          recoveryPotential: researchResult.recoveryPotential || "",
          processedAt: new Date().toISOString(),
          socialPresence: researchResult.socialPresence,
          competitorSocial: researchResult.competitorSocial,
          socialNarrative: researchResult.socialNarrative,
          socialVsVisibility: researchResult.socialVsVisibility,
        });

        // Save as pending_review — Vlad must approve before report goes live
        await updateLeadResearchResults(lead.leadId, {
          status: "pending_review",
          researchStatus: "complete",
          snapshotAppeared: `${researchResult.appearedCount} of ${researchResult.totalPrompts} prompts`,
          visibilityBand: researchResult.statusBand,
          serviceVisibility: researchResult.serviceVisibility,
          notes: `RESEARCH_DATA:${researchJson}`,
        });

        console.info(`[process-lead] Lead ${lead.leadId} research complete — awaiting Vlad review`);

        // Send Vlad review alert (non-blocking)
        sendVladReviewAlert(lead.leadId, lead.dealershipName, lead.city, lead.competitor, researchResult).catch(() => {});

        processedCount++;
      } catch (error) {
        console.error(`[process-lead] Error processing lead ${lead.leadId}:`, error);
        try {
          await updateLeadResearchResults(lead.leadId, {
            status: "new",
            researchStatus: "failed",
            notes: `Auto-processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
          });
        } catch { /* ignore */ }
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      totalLeads: newLeads.length,
    });
  } catch (error) {
    console.error("[process-lead] Fatal error:", error);
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return POST(new Request("http://localhost/api/process-lead", { method: "POST" }));
}
