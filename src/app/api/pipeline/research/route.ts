/**
 * Pipeline Phase 3: RESEARCH (async, 60-120s)
 *
 * Runs AI visibility prompts (20 queries), competitor discovery, social signals.
 * Updates Sheets, then fires review phase.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead, updateLeadResearchResults } from "@/lib/google-sheets";
import { runResearch } from "@/lib/research-runner";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/research] Starting for ${leadId}`);

  try {
    // Get lead from Sheets
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // Update research status
    await updateLeadResearchResults(leadId, {
      researchStatus: "running",
      notes: lead.notes,
    });

    // Parse preflight JSON from notes
    let preflightProfile: Parameters<typeof runResearch>[4] | undefined = undefined;
    try {
      // The notes field contains the preflight JSON blob
      const notesStr = lead.notes || "";
      const jsonStart = notesStr.indexOf("{");
      if (jsonStart !== -1) {
        // Find the last JSON object in notes (most recent preflight)
        const lastJsonStart = notesStr.lastIndexOf('{"niche"');
        if (lastJsonStart !== -1) {
          const jsonStr = notesStr.substring(lastJsonStart);
          // Find the end of the JSON object by matching braces
          let braceCount = 0;
          let jsonEnd = -1;
          for (let i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i] === '{') braceCount++;
            if (jsonStr[i] === '}') braceCount--;
            if (braceCount === 0) { jsonEnd = i + 1; break; }
          }
          if (jsonEnd > 0) {
            const parsed = JSON.parse(jsonStr.substring(0, jsonEnd));
            preflightProfile = {
              niche: parsed.niche,
              valueProposition: parsed.valueProposition || "",
              pricingInfo: parsed.pricingInfo || null,
              estimatedRevenueGap: parsed.estimatedRevenueGap || { low: 0, high: 0, currency: "USD" },
              aiReadinessScore: parsed.aiReadinessScore || 0,
              businessType: parsed.businessType,
              targetAudience: parsed.targetAudience,
              services: parsed.services,
              siteLanguage: parsed.siteLanguage,
              searchLanguage: parsed.searchLanguage,
              market: parsed.market,
              searchLangCode: parsed.searchLangCode,
              suggestedSearchQueries: parsed.suggestedSearchQueries,
              competitorSearchQueries: parsed.competitorSearchQueries,
              socialLinks: parsed.socialLinks,
            };
            console.info(`[pipeline/research] Loaded preflight profile: niche=${parsed.niche}, score=${parsed.aiReadinessScore}, queries=${parsed.suggestedSearchQueries?.length || 0}`);
          }
        }
      }
    } catch (parseErr) {
      console.warn(`[pipeline/research] Could not parse preflight JSON from notes, continuing without it:`, parseErr);
    }

    // Extract competitors and competitor mode from the lead data
    const competitors = lead.competitor
      ? lead.competitor.split(",").map(c => c.trim()).filter(Boolean)
      : [];

    // Parse competitorMode from notes (set by intake route)
    let competitorMode: "client_provided" | "client_only" = "client_only";
    const modeMatch = lead.notes?.match(/CompetitorMode:\s*(\w+)/);
    if (modeMatch) {
      competitorMode = modeMatch[1] === "client_provided" ? "client_provided" : "client_only";
    } else if (competitors.length > 0) {
      // Fallback: if competitors exist but mode wasn't explicitly set
      competitorMode = "client_provided";
    }

    console.info(`[pipeline/research] Competitor mode: ${competitorMode}, competitors: ${competitors.join(", ") || "none"}`);

    // Run research
    const result = await runResearch(
      lead.dealershipName,
      lead.website,
      lead.city,
      competitors,
      preflightProfile,
      "free",
      competitorMode
    );

    // Update Sheets with research results
    await updateLeadResearchResults(leadId, {
      status: "researching",
      researchStatus: "complete",
      snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
      visibilityBand: result.statusBand,
      serviceVisibility: result.serviceVisibility,
      notes: JSON.stringify({
        preflight: preflightProfile,
        competitorMode,
        competitors,
        research: {
          appearedCount: result.appearedCount,
          totalPrompts: result.totalPrompts,
          statusBand: result.statusBand,
          competitorMention: result.competitorMention,
          niche: result.niche,
          revenueLoss: result.revenueLoss,
          leadsLost: result.leadsLost,
          promptResults: result.promptResults,
          socialPresence: result.socialPresence,
          competitorSocial: result.competitorSocial,
          socialNarrative: result.socialNarrative,
          internalCompetitorSuggestions: result.internalCompetitorSuggestions,
        },
      }),
    });

    console.info(`[pipeline/research] Complete for ${leadId}: ${result.appearedCount}/${result.totalPrompts} (${result.statusBand})`);

    // Fire review phase in background
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/pipeline/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    }).catch((err) => {
      console.error(`[pipeline/research] review trigger failed for ${leadId}:`, err);
    });

    return NextResponse.json({
      success: true,
      leadId,
      appeared: result.appearedCount,
      total: result.totalPrompts,
      band: result.statusBand,
    });
  } catch (error) {
    console.error(`[pipeline/research] Failed for ${leadId}:`, error);

    // Update status to failed
    try {
      await updateLeadResearchResults(leadId, {
        researchStatus: "failed",
        notes: `Research failed at ${new Date().toISOString()}: ${error instanceof Error ? error.message : String(error)}`,
      });
    } catch (updateErr) {
      console.error(`[pipeline/research] Failed to update error status:`, updateErr);
    }

    return NextResponse.json({ success: false, error: "Research failed", leadId }, { status: 500 });
  }
}
