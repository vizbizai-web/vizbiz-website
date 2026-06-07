/**
 * Query Fan-out Extraction Module
 *
 * Captures the search queries AI models (ChatGPT, Perplexity) likely perform
 * when researching a business. Based on Edward Sturm's query fan-out methodology.
 *
 * Since we can't intercept AI model browser calls directly, we estimate fan-out
 * with deterministic, niche-aware buyer/research queries. Search-result titles
 * are used later only as coverage evidence, not as new client-facing queries,
 * because arbitrary titles like "Question Time - UK Parliament" are search noise.
 */

import { tavilySearch as sharedTavilySearch, type TavilySearchResult } from "./tavily-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueryFanoutResult {
  /** The original user-facing prompt (e.g. "best car dealerships in Austin") */
  primaryQuery: string;
  /** Follow-up searches an AI model would likely issue */
  fanoutQueries: string[];
  /** Where the data came from */
  source: "chatgpt_web" | "perplexity" | "estimated";
  /** How confident we are in the fan-out accuracy */
  confidence: "high" | "medium" | "low";
}

export interface FanoutCoverageEntry {
  query: string;
  businessVisible: boolean;
  topCompetitorVisible: boolean;
  topResult: string;
}

export interface FanoutReport {
  summary: string;
  missedQueries: string[];
  competitorDominantQueries: string[];
}

// ---------------------------------------------------------------------------
// Tavily wrapper (uses shared rate-limited client)
// ---------------------------------------------------------------------------

type TavilyResult = TavilySearchResult;

async function tavilySearch(query: string, maxResults = 5): Promise<TavilyResult[]> {
  return sharedTavilySearch(query, { maxResults });
}

// ---------------------------------------------------------------------------
// 1. Extract fan-out queries
// ---------------------------------------------------------------------------

const NICHE_QUERY_LABELS: Record<string, { singular: string; plural: string; trustSignals?: string[]; serviceIntents?: string[] }> = {
  electrical_contractor: {
    singular: "electrical contractor",
    plural: "electrical contractors",
    trustSignals: ["NICEIC", "CHAS", "Safe Contractor", "emergency electrical service"],
    serviceIntents: ["electrical installations", "electrical maintenance", "commercial electrical work", "24/7 electrical callout"],
  },
  car_dealership: {
    singular: "car dealership",
    plural: "car dealerships",
    trustSignals: ["reviews", "service department", "financing options"],
    serviceIntents: ["used cars", "new cars", "trade-in", "certified pre-owned vehicles"],
  },
  local_business: { singular: "local business", plural: "local businesses" },
};

const BROAD_MARKETS = new Set([
  "united kingdom", "uk", "great britain", "england", "scotland", "wales", "ireland",
  "united states", "usa", "us", "canada", "australia", "new zealand", "europe",
]);

const SEARCH_NOISE_PATTERNS = [
  /\bquestion time\b/i,
  /\bparliament\b/i,
  /\bnhs\b/i,
  /\bpatients are asked\b/i,
  /\blaundry questions\b/i,
  /\bcustoms\b/i,
  /\btripadvisor\b/i,
  /^ask the\b/i,
  /\bmessage board\b/i,
  /\bforum\b/i,
];

function getNicheQueryLabel(niche: string) {
  const fallback = niche.replace(/_/g, " ").trim().toLowerCase() || "local business";
  return NICHE_QUERY_LABELS[niche] ?? { singular: fallback, plural: `${fallback}s` };
}

function isBroadMarket(city: string): boolean {
  const normalized = city.trim().toLowerCase();
  return !normalized || BROAD_MARKETS.has(normalized);
}

function significantBusinessTokens(businessName: string): string[] {
  return businessName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !["ltd", "limited", "inc", "llc", "services", "service", "company", "group"].includes(token));
}

function uniqueOrdered(items: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const cleaned = item.replace(/\s+/g, " ").trim();
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }
  return output;
}

function buildDeterministicFanoutQueries(businessName: string, city: string, niche: string): string[] {
  const label = getNicheQueryLabel(niche);
  const broadMarket = isBroadMarket(city);
  const market = city.trim();
  const localSuffix = broadMarket ? "" : ` in ${market}`;
  const trustSignals = label.trustSignals ?? ["reviews", "credentials", "recommendations"];
  const serviceIntents = label.serviceIntents ?? [label.singular, "pricing", "reviews"];

  const brandAnchored = [
    `Is ${businessName} a trusted ${label.singular}${localSuffix}?`,
    `What do reviews say about ${businessName}?`,
    `What services does ${businessName} offer?`,
    `How does ${businessName} compare with other ${label.plural}${localSuffix}?`,
    `Is ${businessName} recommended for ${serviceIntents[0]}?`,
  ];

  const localDiscovery = broadMarket ? [
    `What proof should customers check before choosing a ${label.singular}?`,
    `Does ${businessName} show clear ${label.singular} credentials and service coverage?`,
  ] : [
    `Which ${label.plural} are recommended in ${market}?`,
    `Best reviewed ${label.plural} near ${market}`,
  ];

  const trustQueries = trustSignals.slice(0, 3).map((signal) => `${businessName} ${signal}`);
  const serviceQueries = serviceIntents.slice(0, 3).map((intent) => `${businessName} ${intent}`);

  return uniqueOrdered([...brandAnchored, ...localDiscovery, ...trustQueries, ...serviceQueries]).slice(0, 12);
}

export function isClientSafeFanoutQuery(query: string, businessName: string, city: string, niche: string): boolean {
  const cleaned = query.replace(/\s+/g, " ").trim();
  if (cleaned.length < 10 || cleaned.length > 180) return false;
  if (SEARCH_NOISE_PATTERNS.some((pattern) => pattern.test(cleaned))) return false;
  if (/[_{}]/.test(cleaned)) return false;

  const lower = cleaned.toLowerCase();
  const label = getNicheQueryLabel(niche);
  const nicheWords = new Set(label.singular.split(/\s+/).filter((word) => word.length >= 4));
  const hasNicheWord = [...nicheWords].some((word) => lower.includes(word));
  const hasBusinessToken = significantBusinessTokens(businessName).some((token) => lower.includes(token));
  const hasSpecificLocality = !isBroadMarket(city) && city.trim().length > 0 && lower.includes(city.trim().toLowerCase());

  // Broad country markets create generic web noise. Require brand or niche proof,
  // and never show unrelated country/question/forum titles as fan-out evidence.
  return hasBusinessToken || hasNicheWord || hasSpecificLocality;
}

/**
 * Build the set of queries an AI model would likely search when asked about
 * a business in a given niche and city.
 *
 * Strategy: build deterministic, niche-aware buyer/research queries. Search
 * results are used in scoreFanoutCoverage to check visibility, but they do not
 * create additional client-facing query rows. This keeps the pipeline relevant,
 * cheaper, faster, and resistant to broad-market search sludge.
 */
export async function extractFanoutQueries(
  businessName: string,
  city: string,
  niche: string
): Promise<QueryFanoutResult> {
  const label = getNicheQueryLabel(niche);
  const primaryQuery = `${label.singular} ${isBroadMarket(city) ? businessName : `in ${city}`}`;
  const fanoutQueries = buildDeterministicFanoutQueries(businessName, city, niche)
    .filter((q) => isClientSafeFanoutQuery(q, businessName, city, niche))
    .slice(0, 12);

  return {
    primaryQuery,
    fanoutQueries,
    source: "estimated", // We can't intercept actual AI browser calls yet
    confidence: "medium",
  };
}

// ---------------------------------------------------------------------------
// 2. Score fan-out coverage
// ---------------------------------------------------------------------------

/** Case-insensitive check whether a name appears in text. */
function nameMentioned(text: string, name: string): boolean {
  const lower = text.toLowerCase();
  // Check full name and also first significant word (handles partial matches)
  if (lower.includes(name.toLowerCase())) return true;
  const firstWord = name.split(/\s+/)[0];
  if (firstWord && firstWord.length > 3 && lower.includes(firstWord.toLowerCase())) return true;
  return false;
}

/**
 * For each fan-out query, check whether the target business or any competitor
 * appears in the top Tavily results.
 */
export async function scoreFanoutCoverage(
  fanoutQueries: string[],
  businessName: string,
  competitors: string[]
): Promise<FanoutCoverageEntry[]> {
  // Run searches in parallel (batch of 3 to avoid rate limits)
  const batchSize = 3;
  const entries: FanoutCoverageEntry[] = [];

  for (let i = 0; i < fanoutQueries.length; i += batchSize) {
    const batch = fanoutQueries.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((q) => tavilySearch(q, 5).catch(() => [] as TavilyResult[]))
    );

    for (let j = 0; j < batch.length; j++) {
      const query = batch[j];
      const searchResults = results[j];
      const allText = searchResults.map((r) => `${r.title} ${r.content}`).join(" ");

      const businessVisible = nameMentioned(allText, businessName);
      const topCompetitor = competitors.find((c) => nameMentioned(allText, c));
      const topResult = searchResults[0]?.title ?? "No results";

      entries.push({
        query,
        businessVisible,
        topCompetitorVisible: !!topCompetitor,
        topResult,
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// 3. Generate report
// ---------------------------------------------------------------------------

/**
 * Summarises fan-out coverage into an actionable report for the business.
 */
export function generateFanoutReport(coverage: FanoutCoverageEntry[]): FanoutReport {
  const total = coverage.length;
  const visible = coverage.filter((c) => c.businessVisible).length;
  const missed = coverage.filter((c) => !c.businessVisible);
  const competitorDominant = coverage.filter(
    (c) => !c.businessVisible && c.topCompetitorVisible
  );

  const pct = total > 0 ? Math.round((visible / total) * 100) : 0;

  const summary =
    `The business appeared in ${visible} of ${total} AI search paths (${pct}%). ` +
    `${missed.length} queries returned no mention of the business. ` +
    `Competitors dominated ${competitorDominant.length} of those missed queries.`;

  return {
    summary,
    missedQueries: missed.map((c) => c.query),
    competitorDominantQueries: competitorDominant.map((c) => c.query),
  };
}
