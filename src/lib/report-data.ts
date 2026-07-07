import type { ResearchData } from '@/app/report/[leadId]/page';

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
    const { rawSourceLedger: _rawSourceLedger, ...clientSafeResearch } = research;
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
    return clientSafeResearch;
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
      googlePlaceEnrichment: parsed.research.googlePlaceEnrichment,
      localEntityTrustScore: parsed.research.localEntityTrustScore,
    } as ResearchData;
  } catch {
    return null;
  }
}
