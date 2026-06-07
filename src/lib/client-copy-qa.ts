export type ClientCopyQAResult = {
  ok: boolean;
  blockedTerms: string[];
  warnings: string[];
  textPreview: string;
};

const BLOCKED_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "internal client framing", pattern: /\bthe client named\b/i },
  { label: "paid-report workflow language", pattern: /\bpaid report should\b/i },
  { label: "auto-discovery internal language", pattern: /\bauto[-\s]?discovered\b/i },
  { label: "random competitor/internal rationale", pattern: /\brandom\s+auto[-\s]?discovered\s+competitors?\b/i },
  { label: "operator-only language", pattern: /\boperator[-\s]?(approved|approval|review)\b/i },
  { label: "manual-review rescue language", pattern: /\bmanual review\b/i },
  { label: "human-correction language", pattern: /\bhuman correction\b/i },
  { label: "pipeline jargon", pattern: /\bpipeline\b/i },
  { label: "client-ready/internal deliverable language", pattern: /\bclient[-\s]?ready deliverable\b/i },
  { label: "raw draft marker", pattern: /\[(EMAIL DRAFT|EMAIL HTML|RESEARCH BRIEF)\]/i },
  { label: "internal-only label", pattern: /\binternal only\b/i },
  { label: "debug/stub language", pattern: /\b(TODO|stub|fake success|canned demo|placeholder array)\b/i },
];

const WARNING_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "one-provider framing", pattern: /\bPerplexity-only\b/i },
  { label: "keywordy prompt wording", pattern: /\bbest\s+[a-z0-9\s-]+\s+in\s+[a-z0-9\s-]+\b/i },
  { label: "overpromised guarantee", pattern: /\bguarantee(?:d|s)?\s+(?:ranking|recommendation|placement|results?)\b/i },
  { label: "exact fixes exposed in free copy", pattern: /\b(exact schema|full prompt list|complete fix map|implementation code)\b/i },
];

export function stripHtmlForClientCopyQA(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&mdash;/gi, "—")
    .replace(/&rarr;/gi, "→")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function runClientCopyQA(input: string): ClientCopyQAResult {
  const normalized = stripHtmlForClientCopyQA(input);
  const blockedTerms = BLOCKED_PATTERNS
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ label }) => label);
  const warnings = WARNING_PATTERNS
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ label }) => label);

  return {
    ok: blockedTerms.length === 0,
    blockedTerms,
    warnings,
    textPreview: normalized.slice(0, 500),
  };
}

export function assertClientSafeCopy(input: string, context = "client-facing copy"): ClientCopyQAResult {
  const result = runClientCopyQA(input);
  if (!result.ok) {
    throw new Error(
      `${context} failed client-copy QA: ${result.blockedTerms.join(", ")}. Preview: ${result.textPreview}`
    );
  }
  return result;
}

export function clientSafeCompetitorContext(competitors: string[], businessName: string): string {
  const clean = competitors.map((competitor) => competitor.trim()).filter(Boolean).slice(0, 2);

  if (clean.length === 0) {
    return `${businessName} is being reviewed as a client-only visibility snapshot. Add two named competitors later for a focused benchmark.`;
  }

  if (clean.length === 1) {
    return `${businessName} should be positioned clearly against ${clean[0]} so AI systems can understand where it fits and when it should be recommended.`;
  }

  return `${businessName} should be positioned clearly against ${clean[0]} and ${clean[1]} so AI systems can understand where it fits, what makes it credible, and when it should be recommended.`;
}
