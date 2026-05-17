/**
 * Pipeline Controller — Orchestrates VizBiz lead processing stages.
 *
 * Each stage is independently callable and idempotent.
 * Stages: intake → preflight → research → review → report
 *
 * Usage:
 *   POST /api/pipeline/preflight  { leadId }
 *   POST /api/pipeline/research   { leadId }
 *   POST /api/pipeline/process    { leadId }   // orchestrates all stages
 */

import {
  getLeadByLeadId,
  acquireLock,
  releaseLock,
  updatePipelineState,
  updateLead,
  isStageComplete,
  type LeadRow,
  type PipelineStage,
} from "@/lib/google-sheets";
import { preflightScan } from "@/lib/preflight-engine";
import { runResearch } from "@/lib/research-runner";

// ─── Research Mode ───────────────────────────────────────────────────

export type ResearchMode = "free" | "paid" | "full";

// ─── Cost Control Constants ────────────────────────────────────────────
// These are the single sources of truth for pipeline cost/depth.
// Do NOT duplicate these in other files.

export const PIPELINE_LIMITS = {
  free: {
    sonarPrompts: 5,
    firecrawlPages: 5,
    runCompetitorDiscovery: false,
    runCompetitorAnalysis: false,
    runFullSeoAudit: false,
    runGooglePlacesEnrichment: true,
    runSocialSignals: false,
    runQueryFanout: false,
    runYouTubeScoring: false,
    sonarModel: "sonar",
  },
  paid: {
    sonarPrompts: 20,
    firecrawlPages: 15,
    runCompetitorDiscovery: true,
    runCompetitorAnalysis: true,
    runFullSeoAudit: true,
    runGooglePlacesEnrichment: true,
    runSocialSignals: true,
    runQueryFanout: true,
    runYouTubeScoring: true,
    sonarModel: "sonar",
  },
  full: {
    sonarPrompts: 30,
    firecrawlPages: 25,
    runCompetitorDiscovery: true,
    runCompetitorAnalysis: true,
    runFullSeoAudit: true,
    runGooglePlacesEnrichment: true,
    runSocialSignals: true,
    runQueryFanout: true,
    runYouTubeScoring: true,
    sonarModel: "sonar-pro",
  },
} as const;

export type ResearchModeConfig = typeof PIPELINE_LIMITS[ResearchMode];

export function getResearchModeConfig(mode: ResearchMode): ResearchModeConfig {
  return PIPELINE_LIMITS[mode];
}

// ─── Stage Result ─────────────────────────────────────────────────────

export interface StageResult {
  success: boolean;
  stage: PipelineStage;
  leadId: string;
  skipped?: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

// ─── Lock Owner Identity ─────────────────────────────────────────────

function getLockOwner(): string {
  // Use hostname + random suffix for uniqueness across concurrent invocations
  const host = process.env.VERCEL_REGION || process.env.HOSTNAME || "local";
  const pid = process.pid;
  return `${host}-${pid}-${Date.now().toString(36)}`;
}

// ─── Stage: PREFLIGHT ────────────────────────────────────────────────

export async function runPreflightStage(
  leadId: string,
  options: { force?: boolean; researchMode?: ResearchMode } = {}
): Promise<StageResult> {
  const owner = getLockOwner();
  const mode = options.researchMode || "free";

  // 1. Get lead
  const lead = await getLeadByLeadId(leadId);
  if (!lead) return { success: false, stage: "preflight", leadId, error: "Lead not found" };

  // 2. Idempotency check
  if (!options.force && isStageComplete(lead, "preflight")) {
    return { success: true, stage: "preflight", leadId, skipped: true };
  }

  // 3. Acquire lock
  const locked = await acquireLock(leadId, owner);
  if (!locked) {
    return { success: false, stage: "preflight", leadId, error: `Lead locked by another process` };
  }

  try {
    // 4. Update state → running
    const now = new Date().toISOString();
    await updatePipelineState(leadId, {
      status: "preflight_running",
      researchStatus: "pending",
      lastStage: "preflight",
      preflightStartedAt: now,
    });

    // 5. Run preflight
    console.info(`[pipeline] Preflight starting for ${leadId}: ${lead.dealershipName} (${lead.website})`);
    const preflightResult = await preflightScan(lead.website, lead.city);

    // 6. Parse competitorMode from notes
    const modeMatch = lead.notes?.match(/CompetitorMode:\s*(\w+)/);
    const competitorMode = modeMatch?.[1] === "client_provided" ? "client_provided" : "client_only";

    // 7. Parse competitors from notes
    const competitors: string[] = (() => {
      const compStr = lead.competitor || "";
      if (!compStr) return [];
      return compStr.split(",").map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    })();

    // 8. Store preflight data in notes
    const preflightJson = JSON.stringify({
      niche: preflightResult.niche,
      nicheLabel: preflightResult.nicheLabel,
      valueProposition: preflightResult.valueProposition,
      pricingInfo: preflightResult.pricingInfo,
      estimatedRevenueGap: preflightResult.estimatedRevenueGap,
      aiReadinessScore: preflightResult.aiReadinessScore,
      businessType: preflightResult.businessType,
      targetAudience: preflightResult.targetAudience,
      services: preflightResult.services,
      siteLanguage: preflightResult.siteLanguage,
      searchLanguage: preflightResult.searchLanguage,
      market: preflightResult.market,
      searchLangCode: preflightResult.searchLangCode,
      suggestedSearchQueries: preflightResult.suggestedSearchQueries,
      competitorSearchQueries: preflightResult.competitorSearchQueries,
      socialLinks: preflightResult.socialLinks,
      contactInfo: preflightResult.contactInfo,
      schemaOrg: preflightResult.schemaOrg,
      openGraph: preflightResult.openGraph,
      googleBusiness: preflightResult.googleBusiness,
      hasLlmsTxt: preflightResult.hasLlmsTxt,
      hasSchema: preflightResult.hasSchema,
      contentQuality: preflightResult.contentQuality,
      googlePlaceEnrichment: (preflightResult as any).googlePlaceEnrichment || null,
      localEntityTrustScore: (preflightResult as any).localEntityTrustScore || null,
      seoAudit: preflightResult.seoAudit ? {
        overallScore: preflightResult.seoAudit.overallScore,
        issues: preflightResult.seoAudit.issues.length,
        schemaTypes: preflightResult.seoAudit.schemaTypes,
      } : null,
      // v2 metadata
      competitorMode,
      competitors,
      researchMode: mode,
    });

    // 9. Update state → complete
    const completedAt = new Date().toISOString();
    await updatePipelineState(leadId, {
      status: "preflight_complete",
      lastStage: "preflight",
      preflightCompletedAt: completedAt,
    });

    // Update notes with preflight JSON (separate call to avoid conflict with pipelineState)
    await updateLead(leadId, {
      notes: preflightJson,
      competitorMode,
      clientProvidedCompetitors: competitors.join(","),
      snapshotAppeared: `${preflightResult.aiReadinessScore}/100`,
      visibilityBand: preflightResult.aiReadinessScore >= 60 ? "Strong" : preflightResult.aiReadinessScore >= 35 ? "Moderate" : "Weak",
    });

    console.info(`[pipeline] Preflight complete for ${leadId}: niche=${preflightResult.niche}, score=${preflightResult.aiReadinessScore}`);

    return {
      success: true,
      stage: "preflight",
      leadId,
      data: {
        niche: preflightResult.niche,
        score: preflightResult.aiReadinessScore,
        competitorMode,
        researchMode: mode,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[pipeline] Preflight FAILED for ${leadId}:`, errMsg);

    // Increment retry count
    const lead = await getLeadByLeadId(leadId);
    const retryCount = (lead?.retryCount || 0) + 1;

    await updatePipelineState(leadId, {
      status: "preflight_failed",
      lastStage: "preflight",
      lastError: errMsg,
      retryCount,
    });

    return { success: false, stage: "preflight", leadId, error: errMsg };
  } finally {
    await releaseLock(leadId, owner);
  }
}

// ─── Stage: RESEARCH ─────────────────────────────────────────────────

export async function runResearchStage(
  leadId: string,
  options: { force?: boolean; researchMode?: ResearchMode } = {}
): Promise<StageResult> {
  const owner = getLockOwner();
  const mode = options.researchMode || "free";
  const modeConfig = getResearchModeConfig(mode);

  // 1. Get lead
  const lead = await getLeadByLeadId(leadId);
  if (!lead) return { success: false, stage: "research", leadId, error: "Lead not found" };

  // 2. Idempotency check
  if (!options.force && isStageComplete(lead, "research")) {
    return { success: true, stage: "research", leadId, skipped: true };
  }

  // 3. Require preflight data
  let preflightProfile: any = null;
  let competitorMode: "client_only" | "client_provided" = "client_only";
  let competitors: string[] = [];

  try {
    const notesStr = lead.notes || "";
    const lastJsonStart = notesStr.lastIndexOf('{"niche"');
    if (lastJsonStart >= 0) {
      const jsonStr = notesStr.substring(lastJsonStart);
      const parsed = JSON.parse(jsonStr);
      preflightProfile = parsed;
      competitorMode = parsed.competitorMode || "client_only";
      competitors = parsed.competitors || [];
    }
  } catch {
    // Try to parse as full object
    try {
      const parsed = JSON.parse(lead.notes || "{}");
      preflightProfile = parsed.preflight || parsed;
      competitorMode = parsed.competitorMode || "client_only";
      competitors = parsed.competitors || [];
    } catch {
      return { success: false, stage: "research", leadId, error: "No valid preflight data in notes" };
    }
  }

  if (!preflightProfile) {
    return { success: false, stage: "research", leadId, error: "No preflight data found" };
  }

  // 4. Acquire lock
  const locked = await acquireLock(leadId, owner);
  if (!locked) {
    return { success: false, stage: "research", leadId, error: "Lead locked by another process" };
  }

  try {
    // 5. Update state → running
    const now = new Date().toISOString();
    await updatePipelineState(leadId, {
      status: "researching",
      researchStatus: "running",
      lastStage: "research",
      researchStartedAt: now,
    });

    // 6. Run research with mode config
    console.info(`[pipeline] Research starting for ${leadId}: mode=${mode}, prompts=${modeConfig.sonarPrompts}, competitors=${competitors.join(",") || "none"}`);
    const researchResult = await runResearch(
      lead.dealershipName,
      lead.website,
      lead.city,
      competitors,
      preflightProfile,
      {
        competitorMode,
        maxPrompts: modeConfig.sonarPrompts,
        tier: mode,
      }
    );

    // 7. Store research data
    const researchJson = JSON.stringify({
      preflight: preflightProfile,
      competitorMode,
      competitors,
      research: {
        appearedCount: researchResult.appearedCount,
        totalPrompts: researchResult.totalPrompts,
        statusBand: researchResult.statusBand,
        promptResults: researchResult.promptResults,
        competitorMention: researchResult.competitorMention,
        revenueLoss: researchResult.revenueLoss,
        niche: researchResult.niche,
        // Use lead data for these fields (not on ResearchResult)
        city: lead.city,
        website: lead.website,
        contactName: lead.contactName,
        businessName: lead.dealershipName,
        socialPresence: researchResult.socialPresence,
        competitorSocial: researchResult.competitorSocial,
        socialNarrative: researchResult.socialNarrative,
        socialVsVisibility: researchResult.socialVsVisibility,
        aiDiscovery: researchResult.aiDiscovery,
        serviceVisibility: researchResult.serviceVisibility,
        internalCompetitorSuggestions: researchResult.internalCompetitorSuggestions,
        competitorValidations: researchResult.competitorValidations,
        googlePlaceEnrichment: researchResult.googlePlaceEnrichment,
        localEntityTrustScore: researchResult.localEntityTrustScore,
      },
    });

    const completedAt = new Date().toISOString();
    await updatePipelineState(leadId, {
      status: "pending_review",
      researchStatus: "complete",
      lastStage: "research",
      researchCompletedAt: completedAt,
    });

    // Update notes with research data
    await updateLead(leadId, {
      notes: researchJson,
      snapshotAppeared: `${researchResult.appearedCount} of ${researchResult.totalPrompts}`,
      visibilityBand: researchResult.statusBand,
      serviceVisibility: researchResult.serviceVisibility || "",
      internalCompetitorSuggestions: JSON.stringify(researchResult.internalCompetitorSuggestions || []),
      placesValidationStatus: (researchResult.competitorValidations?.length ?? 0) > 0 ? "complete" : "skipped",
      sonarValidationStatus: "complete",
    });

    console.info(`[pipeline] Research complete for ${leadId}: ${researchResult.appearedCount}/${researchResult.totalPrompts} appearances (${researchResult.statusBand})`);

    return {
      success: true,
      stage: "research",
      leadId,
      data: {
        appeared: researchResult.appearedCount,
        total: researchResult.totalPrompts,
        band: researchResult.statusBand,
        mode,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[pipeline] Research FAILED for ${leadId}:`, errMsg);

    const lead = await getLeadByLeadId(leadId);
    const retryCount = (lead?.retryCount || 0) + 1;

    await updatePipelineState(leadId, {
      status: "research_failed",
      researchStatus: "failed",
      lastStage: "research",
      lastError: errMsg,
      retryCount,
    });

    return { success: false, stage: "research", leadId, error: errMsg };
  } finally {
    await releaseLock(leadId, owner);
  }
}

// ─── Orchestrator: Run all pending stages ─────────────────────────────

export async function runAllStages(
  leadId: string,
  options: { force?: boolean; researchMode?: ResearchMode } = {}
): Promise<StageResult[]> {
  const results: StageResult[] = [];
  const mode = options.researchMode || "free";

  // Preflight
  const preflightResult = await runPreflightStage(leadId, { force: options.force, researchMode: mode });
  results.push(preflightResult);
  if (!preflightResult.success && !preflightResult.skipped) return results;

  // Research
  const researchResult = await runResearchStage(leadId, { force: options.force, researchMode: mode });
  results.push(researchResult);
  if (!researchResult.success && !researchResult.skipped) return results;

  return results;
}
