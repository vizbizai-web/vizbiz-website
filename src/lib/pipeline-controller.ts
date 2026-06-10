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
import { buildEvidenceFirstQueries, preflightScan } from "@/lib/preflight-engine";
import { sendNicheResolutionAlertTelegram } from "@/lib/telegram-alerts";
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

function normalizeClientDeclaredNiche(value?: string | null): { niche: string; nicheLabel: string; businessType: string } | null {
  const label = (value || "").trim();
  if (!label) return null;
  const lower = label.toLowerCase();
  if (/endermologie|\blpg\b|body\s+contour|cellulite|lymphatic|skin\s+ton/.test(lower)) {
    return {
      niche: "endermologie_clinic",
      nicheLabel: "Endermologie / Body Contouring Clinic",
      businessType: label,
    };
  }
  return {
    niche: lower.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "local_business",
    nicheLabel: label.replace(/\s+/g, " "),
    businessType: label,
  };
}

function parsePaidIntakePayload(notes?: string | null): any | null {
  const notesStr = notes || "";
  const paidIntakeMatch = notesStr.match(/PAID_INTAKE:(\{[\s\S]*?\})(?=\n[A-Z_]+:|$)/);
  if (!paidIntakeMatch) return null;
  try {
    return JSON.parse(paidIntakeMatch[1]);
  } catch {
    return null;
  }
}

function parseClientDeclaredNiche(notes?: string | null): string {
  const paidIntake = parsePaidIntakePayload(notes);
  if (typeof paidIntake?.businessCategory === "string" && paidIntake.businessCategory.trim()) {
    return paidIntake.businessCategory.trim();
  }
  const notesStr = notes || "";
  const noteMatches = Array.from(notesStr.matchAll(/ClientBusinessCategory:\s*([^|\n]+)/gi));
  const latestMatch = noteMatches.at(-1);
  if (latestMatch?.[1]?.trim()) {
    return latestMatch[1]
      .replace(/\.\s*(?:TZ|Locale|UTM|Referrer):[\s\S]*$/i, "")
      .trim();
  }

  try {
    const parsed = JSON.parse(notesStr);
    const candidates = [
      parsed?.clientDeclaredNiche,
      parsed?.preflight?.clientDeclaredNiche,
      parsed?.paidIntake?.businessCategory,
      parsed?.preflight?.paidIntake?.businessCategory,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
  } catch {
    // Non-JSON notes are expected for fresh intakes and Telegram append logs.
  }

  return "";
}

function hasTelegramDeclaredNicheOverride(notes?: string | null): boolean {
  const notesStr = notes || "";
  if (/Source:\s*telegram_use_submitted/i.test(notesStr)) return true;
  try {
    const parsed = JSON.parse(notesStr);
    return parsed?.nicheResolution?.conflictResolution === "use_submitted"
      || parsed?.preflight?.nicheResolution?.conflictResolution === "use_submitted"
      || parsed?.operatorRevision?.reason?.includes("use declared service")
      || parsed?.preflight?.operatorRevision?.reason?.includes("use declared service")
      || parsed?.confidenceReason?.includes("Client-declared business category overrides automated classification")
      || parsed?.preflight?.confidenceReason?.includes("Client-declared business category overrides automated classification");
  } catch {
    return false;
  }
}

function applyClientDeclaredNicheOverride<T extends { niche?: string; nicheLabel?: string; businessType?: string; services?: string[]; customerSegments?: string[]; market?: string; suggestedSearchQueries?: string[]; competitorSearchQueries?: string[]; confidenceReason?: string; nicheConfidence?: number }>(
  profile: T,
  declaredNiche: string,
  city?: string,
): T {
  const normalized = normalizeClientDeclaredNiche(declaredNiche);
  if (!normalized) return profile;
  const services = [normalized.businessType];
  const evidenceQueries = buildEvidenceFirstQueries({
    businessType: normalized.businessType,
    services,
    market: profile.market || city || "",
    intakeCity: city,
  });
  return {
    ...profile,
    niche: normalized.niche,
    nicheLabel: normalized.nicheLabel,
    businessType: normalized.businessType,
    services,
    suggestedSearchQueries: evidenceQueries.suggestedSearchQueries,
    competitorSearchQueries: evidenceQueries.competitorSearchQueries,
    nicheConfidence: 100,
    confidenceReason: `Client-declared business category overrides automated classification: ${normalized.nicheLabel}. Search queries were regenerated from the declared business category so stale automated prompts cannot survive.`,
  };
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
  options: { force?: boolean; researchMode?: ResearchMode; revisionReason?: string } = {}
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
    const paidIntakePayload = parsePaidIntakePayload(lead.notes);
    const declaredNiche = parseClientDeclaredNiche(lead.notes);
    const telegramDeclaredOverride = hasTelegramDeclaredNicheOverride(lead.notes);
    // Parse submitted competitors before preflight so diagnostic logging can prove
    // whether competitor text contaminated the exact classifier input.
    const competitors: string[] = (() => {
      if (Array.isArray(paidIntakePayload?.competitors)) {
        const paidCompetitors = paidIntakePayload.competitors
          .map((competitor: { name?: unknown }) => typeof competitor.name === "string" ? competitor.name.trim() : "")
          .filter((name: string) => name.length > 0)
          .slice(0, 2);
        if (paidCompetitors.length > 0) return paidCompetitors;
      }
      const compStr = lead.competitor || "";
      if (!compStr) return [];
      return compStr.split(",").map((c: string) => c.trim()).filter((c: string) => c.length > 0).slice(0, 2);
    })();
    const rawPreflightResult = await preflightScan(lead.website, lead.city, lead.dealershipName, {
      leadId,
      submittedPrimaryService: telegramDeclaredOverride ? null : declaredNiche || null,
      allowBlockedNicheResolution: telegramDeclaredOverride && Boolean(declaredNiche),
      competitors,
      onNicheBlocked: async (resolved) => {
        const submitted = resolved.conflict.declaredCandidate || declaredNiche || "none";
        const websiteCandidate = resolved.conflict.websiteCandidate || resolved.businessNiche.value || "insufficient evidence";
        await sendNicheResolutionAlertTelegram({
          leadId,
          businessName: lead.dealershipName,
          submitted,
          websiteCandidate,
          status: resolved.status,
          explanation: resolved.conflict.explanation,
        });
      },
    });
    const preflightResult = applyClientDeclaredNicheOverride(rawPreflightResult, declaredNiche, lead.city);
    if (declaredNiche) {
      console.warn(`[pipeline] Client-declared niche override for ${leadId}: "${declaredNiche}" → ${preflightResult.niche}`);
    }

    // 6. Competitors were parsed before preflight for diagnostics and are reused
    // here for competitor mode/state preservation. Force reruns may replace
    // notes, so notes-only competitor mode detection loses submitted competitors.

    // 7. Determine competitorMode. Prefer explicit stored metadata, but any
    // submitted competitor names must keep the rerun in client_provided mode.
    const modeMatch = lead.notes?.match(/CompetitorMode:\s*(\w+)/);
    const competitorMode = modeMatch?.[1] === "client_provided" || competitors.length > 0 ? "client_provided" : "client_only";

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
      customerSegments: (preflightResult as any).customerSegments || [],
      siteLanguage: preflightResult.siteLanguage,
      searchLanguage: preflightResult.searchLanguage,
      market: preflightResult.market,
      primaryMarket: (preflightResult as any).primaryMarket || preflightResult.market,
      serviceAreas: (preflightResult as any).serviceAreas || [],
      serviceAreaEvidence: (preflightResult as any).serviceAreaEvidence || null,
      promptMarketStrategy: (preflightResult as any).promptMarketStrategy || "primary_market_only",
      searchLangCode: preflightResult.searchLangCode,
      suggestedSearchQueries: preflightResult.suggestedSearchQueries,
      competitorSearchQueries: preflightResult.competitorSearchQueries,
      clientDeclaredNiche: declaredNiche || null,
      operatorRevision: options.revisionReason ? {
        reason: options.revisionReason,
        requestedAt: new Date().toISOString(),
        source: "mission_control_needs_fix",
      } : undefined,
      paidIntake: paidIntakePayload,
      customerQuestions: Array.isArray(paidIntakePayload?.customerQuestions) ? paidIntakePayload.customerQuestions : [],
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
      nicheResolution: (preflightResult as any).nicheResolution || null,
      profileHash: (preflightResult as any).profileHash || null,
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
  options: { force?: boolean; researchMode?: ResearchMode; revisionReason?: string } = {}
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
      operatorRevision: options.revisionReason ? {
        reason: options.revisionReason,
        requestedAt: new Date().toISOString(),
        source: "mission_control_needs_fix",
      } : preflightProfile.operatorRevision,
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
  options: { force?: boolean; researchMode?: ResearchMode; revisionReason?: string } = {}
): Promise<StageResult[]> {
  const results: StageResult[] = [];
  const mode = options.researchMode || "free";

  // Preflight
  const preflightResult = await runPreflightStage(leadId, { force: options.force, researchMode: mode, revisionReason: options.revisionReason });
  results.push(preflightResult);
  if (!preflightResult.success && !preflightResult.skipped) return results;

  // Research
  const researchResult = await runResearchStage(leadId, { force: options.force, researchMode: mode, revisionReason: options.revisionReason });
  results.push(researchResult);
  if (!researchResult.success && !researchResult.skipped) return results;

  return results;
}
