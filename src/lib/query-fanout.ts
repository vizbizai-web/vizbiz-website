/**
 * Query Fan-out Extraction Module
 *
 * Captures the search queries AI models (ChatGPT, Perplexity) likely perform
 * when researching a business. Based on Edward Sturm's query fan-out methodology.
 *
 * Since we can't intercept AI model browser calls directly, we estimate fan-out
 * by running meta-prompts through Tavily and extracting search intent patterns.
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

/**
 * Build the set of queries an AI model would likely search when asked about
 * a business in a given niche and city.
 *
 * Strategy: run several "meta-prompts" through Tavily, then extract unique
 * search intents from the returned result snippets.
 */
export async function extractFanoutQueries(
  businessName: string,
  city: string,
  niche: string
): Promise<QueryFanoutResult> {
  const primaryQuery = `${niche} in ${city}`;

  // Meta-prompts designed to surface the kinds of follow-up searches an AI
  // would perform when researching a business.
  const metaPrompts = [
    `What questions do people ask about ${businessName} in ${city}`,
    `What are the top ${niche} businesses in ${city}`,
    `${businessName} ${city} reviews recommendations`,
    `best ${niche} near ${city} 2025`,
    `${niche} ${city} comparison alternatives ${businessName}`,
  ];

  // Run all meta-prompts in parallel
  const allResults = await Promise.all(
    metaPrompts.map((q) => tavilySearch(q, 5).catch(() => [] as TavilyResult[]))
  );

  // Collect unique fan-out queries from result titles/snippets.
  // We also keep the meta-prompts themselves since they represent likely AI queries.
  const querySet = new Set<string>(metaPrompts);

  for (const results of allResults) {
    for (const r of results) {
      // Use the title as a proxy for the search intent the result answers
      if (r.title) {
        const normalised = r.title.trim();
        if (normalised.length > 10 && normalised.length < 200) {
          querySet.add(normalised);
        }
      }
    }
  }

  // Derive confidence based on how many results came back
  const totalResults = allResults.flat().length;
  const confidence: QueryFanoutResult["confidence"] =
    totalResults >= 15 ? "high" : totalResults >= 8 ? "medium" : "low";

  return {
    primaryQuery,
    fanoutQueries: Array.from(querySet),
    source: "estimated", // We can't intercept actual AI browser calls yet
    confidence,
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
