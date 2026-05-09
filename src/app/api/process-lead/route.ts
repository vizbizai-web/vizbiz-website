/**
 * Lead Processing API Route
 *
 * Status flow: new → researching → pending_review → approved (by Vlad)
 * On error: new → researching → new (retry)
 */

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

  let msg = `🔍 RESEARCH READY FOR REVIEW\n\n`;
  msg += `${businessName} (${city})\n`;
  msg += `Lead: ${leadId}\n`;
  msg += `Niche: ${result.niche} ${nicheOk ? '✅' : '❌ GENERIC'}\n`;
  msg += `Appearances: ${result.appearedCount}/${result.totalPrompts}\n`;
  msg += `Band: ${result.statusBand}\n\n`;

  if (userComps.length > 0) {
    msg += `User competitors: ${userComps.join(', ')}\n`;
    msg += `  Found in results: ${userCompsFound.length > 0 ? userCompsFound.join(', ') : 'NONE ⚠️'}\n`;
  }

  if (junkComps.length > 0) {
    msg += `\n🗑️ Junk competitors: ${junkComps.join(', ')}\n`;
  }

  if (brandPrompts.length > 0 && brandAppeared === 0) {
    msg += `\n⚠️ Zero brand appearances (${brandPrompts.length} brand queries)\n`;
  }

  const topComps = result.promptResults
    .filter(p => p.competitorName && p.competitorAppeared)
    .reduce((acc, p) => { acc[p.competitorName!] = (acc[p.competitorName!] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sorted = Object.entries(topComps).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (sorted.length > 0) {
    msg += `\nTop discovered competitors:\n`;
    for (const [name, count] of sorted) {
      msg += `  • ${name} (${count}/${result.totalPrompts})\n`;
    }
  }

  msg += `\nReport stays "processing" until approved.`;
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
    try {
      const body = await request.clone().json().catch(() => ({}));
      targetLeadId = body?.leadId || null;
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
        if (pfIdx >= 0) {
          try {
            const rawAfter = lead.notes.slice(pfIdx + 10);
            const jsonStart = rawAfter.indexOf('{');
            const jsonEnd = rawAfter.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              preflightProfile = JSON.parse(rawAfter.slice(jsonStart, jsonEnd + 1));
            }
          } catch { /* ignore */ }
        }

        // If no preflight data, run a live website scrape + LLM classification
        if (!preflightProfile && lead.website) {
          try {
            console.info(`[process-lead] No preflight data — running live website scan for ${lead.website}`);
            preflightProfile = await preflightScan(lead.website);
            console.info(`[process-lead] Live scan: niche=${preflightProfile.niche}, score=${preflightProfile.aiReadinessScore}`);
          } catch (err) {
            console.warn(`[process-lead] Live preflight scan failed:`, err);
          }
        }

        // Use preflight niche (from website scrape + LLM) if available, otherwise keyword fallback
        let nicheConfig;
        if (preflightProfile?.niche && preflightProfile.niche !== 'local_business' && preflightProfile.niche !== 'unknown') {
          console.info(`[process-lead] Using preflight niche: ${preflightProfile.niche} (LLM-classified from website)`);
          // Import niche config for prompt templates
          nicheConfig = getNicheByName(preflightProfile.niche) || detectNiche(lead.dealershipName, lead.website);
        } else {
          nicheConfig = detectNiche(lead.dealershipName, lead.website);
          console.info(`[process-lead] Using keyword niche: ${nicheConfig.niche} (no preflight data)`);
        }
        console.info(`[process-lead] Final niche: ${nicheConfig.niche}`);

        let competitors: string[] = [];
        if (lead.competitor && lead.competitor.trim() !== "") {
          competitors = [lead.competitor.trim()];
        } else {
          competitors = await discoverCompetitors(lead.dealershipName, lead.website, lead.city, lead.competitor);
          const genericCompetitors = ['local competitors', 'nearby businesses', 'similar companies'];
          const allGeneric = competitors.length > 0 && competitors.every(c => genericCompetitors.includes(c));
          if (competitors.length === 0 || allGeneric) {
            const nicheDefaults: Record<string, string[]> = {
              fine_jewelry: ["Brilliant Earth", "Blue Nile", "Vrai"],
              car_dealership: ["local dealerships", "other dealers in the area"],
              spray_tanning: ["local spray tan studios", "other tanning salons"],
              beauty_salon: ["local salons", "other beauty studios"],
              dental: ["local dental practices", "other dentists in the area"],
              real_estate: ["local real estate agents", "other agencies"],
              fitness: ["local gyms and trainers", "other fitness studios"],
              mobile_bar: ["local cocktail bars", "event bartending services"],
            };
            competitors = nicheDefaults[nicheConfig.niche] || genericCompetitors;
          }
        }


        const researchResult = await runResearch(lead.dealershipName, lead.website, lead.city, competitors, preflightProfile);
        console.info(`[process-lead] Research completed: ${researchResult.appearedCount}/${researchResult.totalPrompts}`);


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
          processedAt: new Date().toISOString(),
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
