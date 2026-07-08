import type { ResearchData } from '@/app/report/[leadId]/page';


const CLIENT_REPORT_ALLOWED_KEYS = new Set([
  'leadId','businessName','website','city','contactName','competitor','niche','nicheLabel',
  'appearedCount','totalPrompts','competitorAppearedCount','competitorTotalPrompts','statusBand','serviceVisibility',
  'promptResults','platformScores','costEstimate','competitorMention','competitorLine','competitorCategories','whyThisMatters','recommendedNextStep','processedAt',
  'socialPresence','competitorSocial','socialNarrative','revenueLoss','leadsLost','recoveryPotential','socialVsVisibility',
  'aiDiscovery','technicalReadiness','competitorMode','suppliedCompetitors','internalCompetitorSuggestions','competitorValidations',
  'googlePlaceEnrichment','localEntityTrustScore','googlePlaceMatchState','visibilityEvidenceSource','aiAnswerEvidenceAvailable','webSearchFallbackUsed','evidenceWarnings',
  'queryFanout','batteryVersion','promptPlanMetadata','categoryScorecard','sourceLedger','executionFailures','valueProposition','pricingInfo','estimatedRevenueGap',
]);

const BLOCKED_CLIENT_REPORT_KEYS = new Set([
  'rawSourceLedger','rawResults','debug','diagnostics','operatorNotes','manualReview','clientReadyDeliverable','internalOnly','autoDiscoveredCompetitors'
]);

export function assertClientReportPayload(research: Record<string, unknown>): ResearchData {
  for (const key of Object.keys(research)) {
    if (BLOCKED_CLIENT_REPORT_KEYS.has(key)) throw new Error(`Blocked client report payload key: ${key}`);
    if (!CLIENT_REPORT_ALLOWED_KEYS.has(key)) throw new Error(`Unknown client report payload key: ${key}`);
  }
  const required = ['businessName','website','city','appearedCount','totalPrompts','statusBand','serviceVisibility','promptResults'];
  for (const key of required) {
    if (!(key in research)) throw new Error(`Missing client report payload key: ${key}`);
  }
  if (!Array.isArray(research.promptResults)) throw new Error('Invalid client report payload: promptResults must be an array');
  return research as ResearchData;
}

function googlePlaceMatchState(gpe: any): { status: 'matched' | 'not_confidently_matched' | 'not_found' | 'unavailable'; label: string; warnings: string[] } {
  if (!gpe) return { status: 'unavailable', label: 'Google profile verification unavailable', warnings: [] };
  const warnings = Array.isArray(gpe.warnings) ? gpe.warnings.map(String) : [];
  if (!gpe.placeId && !gpe.displayName) return { status: gpe.validationStatus === 'unavailable' ? 'unavailable' : 'not_found', label: 'Google profile not found', warnings };
  if (gpe.confidence === 'high' || gpe.validationStatus === 'validated') return { status: 'matched', label: 'Google profile confidently matched', warnings };
  return { status: 'not_confidently_matched', label: 'Google profile not confidently matched', warnings: warnings.length ? warnings : ['The closest Google result did not confidently match this business, website, or region.'] };
}

function extractBalancedJson(text: string, start: number): string | null {
  let braceCount = 0;
  let jsonEnd = -1;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '{') braceCount += 1;
    if (text[i] === '}') braceCount -= 1;
    if (braceCount === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
  return jsonEnd > start ? text.substring(start, jsonEnd) : null;
}

export function parseResearchDataFromNotes(notes?: string | null): ResearchData | null {
  const infrastructureCitationHost = /^(vertexaisearch\.cloud\.google\.com|googleusercontent\.com|gstatic\.com|googleapis\.com|cloud\.google\.com)$/i;
  const sanitizeClientResearch = (research: Record<string, unknown>) => {
    const { rawSourceLedger: _rawSourceLedger, rawResults: _rawResults, debug: _debug, diagnostics: _diagnostics, ...clientSafeResearch } = research;
    if (Array.isArray(clientSafeResearch.promptResults)) {
      clientSafeResearch.promptResults = clientSafeResearch.promptResults.map((row: Record<string, unknown>) => ({
        ...row,
        citations: Array.isArray(row.citations)
          ? row.citations.filter((url) => {
              try { return !infrastructureCitationHost.test(new URL(String(url)).hostname.replace(/^www\./, '').toLowerCase()); }
              catch { return false; }
            })
          : [],
      }));
    }
    const matchState = googlePlaceMatchState(clientSafeResearch.googlePlaceEnrichment);
    clientSafeResearch.googlePlaceMatchState = matchState;
    if (!clientSafeResearch.serviceVisibility) clientSafeResearch.serviceVisibility = 'Limited visibility in this snapshot.';
    if (!clientSafeResearch.website) clientSafeResearch.website = '';
    if (!clientSafeResearch.city) clientSafeResearch.city = '';
    if (!clientSafeResearch.contactName) clientSafeResearch.contactName = '';
    if (!clientSafeResearch.competitor) clientSafeResearch.competitor = '';
    return assertClientReportPayload(clientSafeResearch);
  };
  const notesStr = notes || '';
  if (!notesStr.trim()) return null;

  const legacyMarker = 'RESEARCH_DATA:';
  const legacyIdx = notesStr.indexOf(legacyMarker);
  if (legacyIdx >= 0) {
    try {
      return sanitizeClientResearch(JSON.parse(notesStr.slice(legacyIdx + legacyMarker.length)) as Record<string, unknown>) as ResearchData;
    } catch {
      // Fall through to the current pipeline JSON format.
    }
  }

  // Current pipeline stores a balanced JSON blob followed by review notes:
  // { preflight, competitorMode, competitors, research: {...} }\n[Review: ...]
  const jsonStart = notesStr.lastIndexOf('{"preflight"');
  if (jsonStart === -1) return null;

  const jsonBlob = extractBalancedJson(notesStr, jsonStart);
  if (!jsonBlob) return null;

  try {
    const parsed = JSON.parse(jsonBlob);
    if (!parsed?.research) return null;
    const clientSafeResearch = sanitizeClientResearch(parsed.research as Record<string, unknown>);
    const googlePlaceEnrichment = parsed.preflight?.googlePlaceEnrichment || parsed.research.googlePlaceEnrichment;
    const googlePlaceState = googlePlaceMatchState(googlePlaceEnrichment);
    return {
      ...clientSafeResearch,
      nicheLabel: parsed.preflight?.nicheLabel,
      technicalReadiness: {
        score: parsed.preflight?.aiReadinessScore,
        hasLlmsTxt: Boolean(parsed.preflight?.hasLlmsTxt),
        hasSchema: Boolean(parsed.preflight?.hasSchema),
        contentQuality: parsed.preflight?.contentQuality,
        hasReviews: Boolean(parsed.preflight?.hasReviews),
        hasBlog: Boolean(parsed.preflight?.hasBlog),
        indexedPages: parsed.preflight?.indexedPages ?? null,
      },
      competitorMode: parsed.competitorMode || (parsed.competitors?.length > 0 ? 'client_provided' : 'client_only'),
      suppliedCompetitors: Array.isArray(parsed.preflight?.paidIntake?.competitors) && parsed.preflight.paidIntake.competitors.length > 0
        ? parsed.preflight.paidIntake.competitors
            .map((competitor: { name?: unknown; website?: unknown }) => ({
              name: typeof competitor.name === 'string' ? competitor.name.trim() : '',
              website: typeof competitor.website === 'string' ? competitor.website.trim() : '',
            }))
            .filter((competitor: { name: string; website: string }) => competitor.name)
            .slice(0, 2)
        : (parsed.competitors || []).map((name: string) => ({ name, website: '' })).slice(0, 2),
      internalCompetitorSuggestions: parsed.research.internalCompetitorSuggestions,
      competitorValidations: parsed.research.competitorValidations,
      googlePlaceEnrichment,
      googlePlaceMatchState: googlePlaceState,
      localEntityTrustScore: parsed.research.localEntityTrustScore,
    } as ResearchData;
  } catch {
    return null;
  }
}
