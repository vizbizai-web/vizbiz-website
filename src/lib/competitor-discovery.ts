/**
 * Competitor Auto-Discovery Module v2
 *
 * Uses preflight intelligence (LLM-generated competitor search queries,
 * business type, market) to find REAL competitors — not directories,
 * not generic listings, not article titles.
 */

import { tavilySearch, type TavilySearchResult } from "./tavily-client";

/**
 * Expanded junk filter — directories, associations, generic terms, platforms.
 */
const JUNK_PATTERNS: RegExp[] = [
  // Directories and listing platforms
  /chamber\s+of\s+commerce/i,
  /better\s+business\s+bureau/i,
  /bbb\s*(accredited|rating)/i,
  /yellow\s*pages/i,
  /white\s*pages/i,
  /yelp/i,
  /tripadvisor/i,
  /foursquare/i,
  /google\s*(maps|reviews|business)/i,
  /bing\s*(maps|places)/i,
  /facebook/i,
  /instagram/i,
  /twitter/i,
  /linkedin/i,
  /pinterest/i,
  /youtube/i,
  /reddit/i,
  /glassdoor/i,
  /indeed/i,
  /crunchbase/i,
  /wikipedia/i,
  /wik(i|ipedia)/i,
  /homeadvisor/i,
  /thumbtack/i,
  /angi(e)?(\s*list)?/i,
  /booking\.com/i,
  /airbnb/i,
  /expedia/i,
  /hotels?\.com/i,
  /zillow/i,
  /trulia/i,
  /realtor\.com/i,
  /cars?\.com/i,
  /autotrader/i,
  /cargurus/i,
  /truecar/i,
  /edmunds/i,
  /kbb/i,
  /kelly\s*blue\s*book/i,
  /justdial/i,
  /sulekha/i,
  /gumtree/i,
  /craigslist/i,
  /classified/i,
  /directory/i,
  /f\d+s/i,
  /trustpilot/i,
  /sitejabber/i,
  /consumeraffairs/i,

  // Generic / non-business terms
  /^(top|best|#?\d+|near|find|about|home|welcome|news|blog|article|guide|review|how\s+to|what\s+is|why|list)/i,
  /^(and|but|the|this|how|why|what|when|where|which|these|those|everything|all|your)\s/i,
  /near\s+me$/i,
  /in\s+\d{4}$/i,  // "Best X in 2026"
  /^the\s+\d+/i,   // "The 10 Best..."
  /^\d+\s+(best|top|great)/i,
  /\d+\s*(best|top|great|amazing)/i,
  /^(best|top)\s+\d+/i,
  /compare|comparison|vs\.?|versus/i,
  /rating|review|ranking/i,
];

const JUNK_EXACT: Set<string> = new Set([
  "news", "local news", "daily news", "bbc", "cnn", "reuters", "the guardian",
  "local competitors", "nearby businesses", "similar companies",
  "home", "welcome", "about", "contact", "services", "gallery",
]);

/** Domains to skip during URL verification (directories, not businesses) */
const DIRECTORY_DOMAINS_VERIFY = [
  'google.com', 'maps.google', 'yelp.com', 'tripadvisor.com',
  'yellowpages.com', 'whitepages.com', 'foursquare.com', 'bbb.org',
  'wikipedia.org', 'facebook.com', 'instagram.com', 'linkedin.com',
  'pinterest.com', 'reddit.com', 'youtube.com', 'bing.com',
  'angi.com', 'homeadvisor.com', 'thumbtack.com', 'booking.com',
  'airbnb.com', 'expedia.com', 'zillow.com', 'trustpilot.com',
  'crunchbase.com', 'glassdoor.com', 'indeed.com', 'f6s.com',
  'medium.com', 'eventbrite.com', 'meetup.com',
];

/**
 * Check if a name looks like a real business and not a directory/generic term.
 */
function isRealBusinessName(name: string, businessType: string, city: string): boolean {
  const lower = name.toLowerCase().trim();

  // Too short or too long
  if (lower.length < 3 || lower.length > 70) return false;

  // Exact junk matches
  if (JUNK_EXACT.has(lower)) return false;

  // Pattern junk matches
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(lower)) return false;
  }

  // Single-word names under 4 chars are rarely businesses
  if (!lower.includes(" ") && lower.length <= 3) return false;

  // All-caps acronyms with numbers (F6S, 3M is ok though)
  if (/^[A-Z]{1,5}\d+[A-Z0-9]*$/i.test(name) && name.length < 8) return false;

  // Ends with TLD
  if (/\.(com|net|org|io|co\.uk|ca|au)$/i.test(name)) return false;

  // Looks like a sentence, not a name (contains 5+ common English words)
  const words = lower.split(/\s+/);
  const commonWords = words.filter(w =>
    /^(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|is|are|was|it|that|this|your|our|their|can|how|what|when|where|why|who|which|do|does|will|would|should|could|has|have|had|been|not|no|all|some|any|more|most|other|new|old|good|great|best|top|free|get|find|see|know|make|take|use|work|help|need|want|like|just|only|also|still|even|well|very|much|many)$/i.test(w)
  );
  if (commonWords.length >= 5) return false;

  return true;
}

/**
 * Validate that a competitor is actually in a related business.
 * Uses the search result content (snippet) to check for niche overlap.
 */
function isPlausibleCompetitor(
  candidateName: string,
  businessType: string,
  services: string[],
  resultSnippet: string
): boolean {
  if (!businessType && services.length === 0) return true; // Can't validate without data, allow

  const lowerSnippet = resultSnippet.toLowerCase();
  const lowerCandidate = candidateName.toLowerCase();

  // Check if any services overlap with the snippet content
  const serviceWords = services
    .flatMap(s => s.toLowerCase().split(/\s+/))
    .filter(w => w.length > 3); // Skip short words

  const snippetServiceMatches = serviceWords.filter(w => lowerSnippet.includes(w)).length;

  // If we find at least 2 service keywords in the snippet about this candidate,
  // it's likely a real competitor
  if (snippetServiceMatches >= 2) return true;

  // If business type keywords appear near the candidate name
  const bizTypeWords = businessType.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const bizTypeMatches = bizTypeWords.filter(w => lowerSnippet.includes(w) || lowerCandidate.includes(w)).length;

  if (bizTypeMatches >= 1) return true;

  // If we can't confirm overlap, reject — safer to have fewer real competitors
  // than garbage ones
  return false;
}

/**
 * Extract a business name from a search result.
 * Tries multiple strategies: pipe-separated titles, URL hostnames, clean titles.
 */
function extractBusinessNameFromResult(
  result: TavilySearchResult,
  originalBusinessName: string
): { name: string; snippet: string } | null {
  // Skip if this is the original business
  if (result.title.toLowerCase().includes(originalBusinessName.toLowerCase())) {
    return null;
  }

  const title = result.title;
  const snippet = result.content || "";

  // Strategy 1: Pipe/dash separated title — last part is often the business name
  const parts = title.split(/\s*[-–—|·•]\s*/).filter(p => p.trim().length > 0);
  let pipedName: string | null = null;

  if (parts.length >= 2) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i].trim()
        .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, '')
        .replace(/\s*\(\d+\s*reviews?\)\s*/i, '')
        .replace(/\s*\d\.\d+\s*★?\s*/, '')
        .replace(/^(A|An|The)\s+/i, "")
        .trim();

      if (candidate.length >= 3 && !/^(best|top|#\d+|\d+\.)/i.test(candidate) && !/^\d/.test(candidate)) {
        pipedName = candidate;
        break;
      }
    }
  }

  // Strategy 2: URL hostname → brand name
  let urlName: string | null = null;
  try {
    const hostname = new URL(result.url).hostname.replace("www.", "").split(".")[0];
    urlName = hostname.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Skip generic hostnames
    const genericHosts = ["google", "yelp", "facebook", "instagram", "twitter", "linkedin",
      "pinterest", "youtube", "reddit", "wikipedia", "mapquest", "tripadvisor", "yellowpages",
      "foursquare", "bbb", "booking", "airbnb", "expedia", "zillow", "trulia", "realtor",
      "cars", "autotrader", "cargurus", "truecar", "homeadvisor", "thumbtack", "angi",
      "trustpilot", "sitejabber", "glassdoor", "indeed", "crunchbase", "medium", "google"];
    if (genericHosts.some(h => urlName!.toLowerCase().includes(h))) urlName = null;
  } catch { urlName = null; }

  // Strategy 3: Cleaned first part of title
  let cleanName: string | null = null;
  const firstPart = title.split(/\s*[-–—|·•]\s*/)[0];
  cleanName = firstPart
    .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, '')
    .replace(/\s*\(\d+\s*reviews?\)\s*/i, '')
    .replace(/\s+[-–—]+\s+(Yelp|Google Reviews)$/i, '')
    .replace(/^(Best |Top |Top Rated |#\d+ |\d+\.\s)/i, '')
    .replace(/^(A |An |The )/i, '')
    .trim();

  // Pick best: prefer piped (most reliable), then URL, then clean
  const finalName = pipedName || urlName || cleanName;

  if (!finalName || finalName.length < 3 || finalName.length > 60) return null;
  if (/\.(com|net|org|io|ca|co\.uk|au)$/i.test(finalName)) return null;
  if (/top \d+|\d+ best|best \d+|top rated|companies? in|businesses? in|places? in|list of|near me/i.test(finalName)) return null;
  if (/^\d/.test(finalName)) return null;
  if (/^[A-Z]{1,3}\d*$/i.test(finalName) && finalName.length < 6) return null;

  return { name: finalName, snippet };
}

/**
 * Main entry: Discover real competitors using preflight intelligence.
 *
 * @param businessName - The business being audited
 * @param website - Their website URL
 * @param city - Their city/market
 * @param providedCompetitor - Optional manually-provided competitor
 * @param preflightData - Preflight intelligence (competitorSearchQueries, businessType, services, market)
 */
export async function discoverCompetitors(
  businessName: string,
  website: string,
  city: string,
  providedCompetitor?: string,
  preflightData?: {
    competitorSearchQueries?: string[];
    businessType?: string;
    services?: string[];
    market?: string;
  }
): Promise<string[]> {
  // If competitor is already provided, use it (but validate it)
  if (providedCompetitor && providedCompetitor.trim() !== "") {
    const trimmed = providedCompetitor.trim();
    if (isRealBusinessName(trimmed, preflightData?.businessType || "", city)) {
      return [trimmed];
    }
    // If the provided competitor is junk, continue to discovery
    console.info(`[competitor-discovery] Provided competitor "${trimmed}" looks invalid, running discovery`);
  }

  // Build search queries — prefer preflight LLM-generated queries
  let searchQueries: string[];

  if (preflightData?.competitorSearchQueries && preflightData.competitorSearchQueries.length >= 2) {
    // Use the LLM-generated queries from preflight
    searchQueries = preflightData.competitorSearchQueries;
    console.info(`[competitor-discovery] Using ${searchQueries.length} preflight competitor queries`);
  } else {
    // Fallback: build queries from business type + city
    const bizType = preflightData?.businessType || businessName;
    searchQueries = [
      `${bizType} in ${city}`,
      `best ${bizType} near ${city}`,
      `${bizType} ${city} competitors alternatives`,
    ];
    console.info(`[competitor-discovery] Using fallback queries from businessType: ${bizType}`);
  }

  const candidates: { name: string; snippet: string; appearances: number }[] = [];

  for (const query of searchQueries.slice(0, 4)) {
    try {
      const results = await tavilySearch(query);

      for (const result of results) {
        const extracted = extractBusinessNameFromResult(result, businessName);
        if (!extracted) continue;

        const existing = candidates.find(c => c.name.toLowerCase() === extracted.name.toLowerCase());
        if (existing) {
          existing.appearances++;
        } else {
          candidates.push({ name: extracted.name, snippet: extracted.snippet, appearances: 1 });
        }
      }
    } catch (error) {
      console.error(`[competitor-discovery] Search failed for "${query}":`, error);
      continue;
    }
  }

  // Validate and rank candidates
  const businessType = preflightData?.businessType || "";
  const services = preflightData?.services || [];

  const validatedCompetitors = candidates
    .filter(c => {
      // Must pass the junk filter
      if (!isRealBusinessName(c.name, businessType, city)) {
        console.info(`[competitor-discovery] Rejected (junk filter): "${c.name}"`);
        return false;
      }
      // Must be a plausible competitor (same niche)
      if (!isPlausibleCompetitor(c.name, businessType, services, c.snippet)) {
        console.info(`[competitor-discovery] Rejected (niche mismatch): "${c.name}"`);
        return false;
      }
      return true;
    })
    .sort((a, b) => b.appearances - a.appearances) // Rank by how many queries mentioned them
    .map(c => c.name);

  if (validatedCompetitors.length === 0) {
    console.info(`[competitor-discovery] No validated competitors found for ${businessName} (${businessType}) in ${city}`);
    // Return empty array instead of fake generic competitors — the report handles this
    return [];
  }

  // Final step: verify top candidates have real websites (URL verification)
  const verifiedCompetitors: string[] = [];
  for (const name of validatedCompetitors) {
    if (verifiedCompetitors.length >= 3) break;

    // Find the URL associated with this candidate
    const candidateData = candidates.find(c => c.name === name);
    const candidateUrl = candidateData?.snippet ? null : null; // We don't store URLs directly

    // Quick verification: search for the business name + city to confirm it has a web presence
    try {
      const verifyResults = await tavilySearch(`"${name}" ${city}`);
      if (verifyResults.length > 0) {
        // Check that at least one result is about this specific business (not a directory)
        const hasOwnSite = verifyResults.some(r => {
          const lowerTitle = r.title.toLowerCase();
          const lowerName = name.toLowerCase().split(' ').slice(0, 2).join(' '); // First 2 words
          return lowerTitle.includes(lowerName) &&
                 !DIRECTORY_DOMAINS_VERIFY.some(d => r.url.toLowerCase().includes(d));
        });
        if (hasOwnSite) {
          verifiedCompetitors.push(name);
          console.info(`[competitor-discovery] ✅ Verified: "${name}" has real web presence`);
        } else {
          console.info(`[competitor-discovery] ❌ Unverified: "${name}" — no independent web presence found`);
        }
      } else {
        // No results at all — might be a false extraction
        console.info(`[competitor-discovery] ⚠️ No verification results for "${name}" — keeping anyway (low confidence)`);
        verifiedCompetitors.push(name);
      }
    } catch {
      // Verification failed — keep the competitor (don't block on verification errors)
      verifiedCompetitors.push(name);
    }
  }

  if (verifiedCompetitors.length === 0) {
    console.info(`[competitor-discovery] All candidates failed URL verification for ${businessName}`);
    return [];
  }

  console.info(`[competitor-discovery] Final verified competitors: ${verifiedCompetitors.join(", ")}`);
  return verifiedCompetitors.slice(0, 3);
}
