/**
 * Competitor Auto-Discovery Module v3 — Full Rewrite
 *
 * Architecture:
 * 1. Detect local vs online mode from preflight data
 * 2. Local mode: geo-targeted search + physical-presence verification
 * 3. Online mode: service-category search + product-site verification
 * 4. Shared validation pipeline rejects directories, courses, listicles, online-only (local mode)
 * 5. User-provided competitors always validated; fallback to auto-discovery on failure
 */

import { tavilySearch, type TavilySearchResult } from "./tavily-client";
import { placesNearbySearch, geocodeAddress, isPlacesConfigured, type PlaceResult } from "./places-client";

/* ───────────────────────────────
   1. CONSTANTS & PATTERNS
   ─────────────────────────────── */

/**
 * Directory / platform domains — never real competitors
 */
const DIRECTORY_DOMAINS: string[] = [
  "google.com", "maps.google", "yelp.com", "tripadvisor.com",
  "yellowpages.com", "whitepages.com", "foursquare.com", "bbb.org",
  "wikipedia.org", "facebook.com", "instagram.com", "linkedin.com",
  "pinterest.com", "reddit.com", "youtube.com", "bing.com",
  "angi.com", "homeadvisor.com", "thumbtack.com", "booking.com",
  "airbnb.com", "expedia.com", "zillow.com", "trustpilot.com",
  "crunchbase.com", "glassdoor.com", "indeed.com", "f6s.com",
  "medium.com", "eventbrite.com", "meetup.com", "justdial.com",
  "indiamart.com", "sulekha.com", "gumtree.com", "craigslist.org",
  "cars.com", "autotrader.com", "cargurus.com", "truecar.com",
  "edmunds.com", "kbb.com", "carfax.com",
  "viator.com", "getyourguide.com", "klook.com",
  "hotels.com", "agoda.com", "hostelworld.com",
  "timeout.com", "whats-on.com", "visitnsw.com", "sydney.com",
];

/**
 * Junk patterns — reject directories, associations, generic terms, platforms.
 * Kept compatible with the existing JUNK_PATTERNS from v2.
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
  /viator/i,
  /getyourguide/i,
  /klook/i,
  /eventbrite/i,
  /meetup/i,
  /waze/i,
  /mapquest/i,

  // Generic / non-business terms
  /^(top|best|#?\d+|near|find|about|home|welcome|news|blog|article|guide|review|how\s+to|what\s+is|why|list)/i,
  /^(and|but|the|this|how|why|what|when|where|which|these|those|everything|all|your)\s/i,
  /near\s+me$/i,
  /in\s+\d{4}$/i,
  /^the\s+\d+/i,
  /^\d+\s+(best|top|great)/i,
  /\d+\s*(best|top|great|amazing)/i,
  /^(best|top)\s+\d+/i,
  /compare|comparison|vs\.?|versus/i,
  /rating|review|ranking/i,

  // Services masquerading as businesses (courses, training, programs)
  /teacher\s+training/i,
  /certification/i,
  /certified\s+program/i,
  /training\s+course/i,
  /workshop\s+series/i,
  /online\s+course/i,
  /masterclass/i,
  /diploma/i,
  /degree\s+program/i,
  /continuing\s+education/i,
  /professional\s+development/i,
  /accredited\s+course/i,
  /r(y|i)t\s*\d+/i,        // yoga teacher training numbers
  /200\s*hour/i,
  /300\s*hour/i,
  /500\s*hour/i,
];

const JUNK_EXACT: Set<string> = new Set([
  "news", "local news", "daily news", "bbc", "cnn", "reuters", "the guardian",
  "local competitors", "nearby businesses", "similar companies",
  "home", "welcome", "about", "contact", "services", "gallery",
  "classes", "workshops", "courses", "programs", "training",
]);

/** Patterns that indicate a SERVICE, not a business */
const SERVICE_PATTERNS: RegExp[] = [
  /teacher\s+training/i,
  /certification/i,
  /course/i,
  /class/i,
  /workshop/i,
  /program/i,
  /masterclass/i,
  /diploma/i,
  /lesson/i,
  /training/i,
  /bootcamp/i,
  /academy\s+(for|in|online)/i,
  /school\s+(of|for)/i,
  /institute\s+(of|for)/i,
  /continuing\s+education/i,
  /professional\s+development/i,
];

/** Patterns that indicate a LISTICLE / REVIEW ARTICLE, not a business */
const LISTICLE_PATTERNS: RegExp[] = [
  /best\s+\d+/i,
  /top\s+\d+/i,
  /\d+\s+best/i,
  /\d+\s+top/i,
  /compare/i,
  /vs\.?\s/i,
  /versus/i,
  /review\s+(of|for)/i,
  /rated/i,
  /ranked/i,
  /roundup/i,
  /guide\s+to/i,
  /list\s+of/i,
  /near\s+me/i,
  /in\s+(my\s+)?area/i,
  /around\s+me/i,
];

/* ───────────────────────────────
   2. SHARED VALIDATION
   ─────────────────────────────── */

/**
 * Exported validation function — used by competitor-discovery, research-runner, and process-lead.
 *
 * Checks:
 * 1. Is it a real business name? (not a course, training, directory, generic term)
 * 2. Is it in the same niche? (service keywords overlap)
 * 3. Is it geographically relevant? (for local mode: mentions target city)
 * 4. Does it have a real website? (not just a social media page)
 */
export interface ValidationOptions {
  /** e.g. "yoga studio", "car dealership" */
  businessType?: string;
  /** e.g. ["spray tanning", "mobile tanning", "bridal packages"] */
  services?: string[];
  /** Target city for geo-check */
  city?: string;
  /** "local" | "online" | "national" */
  market?: string;
  /** Optional: search result snippet for niche-overlap check */
  snippet?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  name: string;
}

export function validateCompetitor(
  candidateName: string,
  options: ValidationOptions = {}
): ValidationResult {
  const lower = candidateName.toLowerCase().trim();
  const { businessType = "", services = [], city = "", market = "", snippet = "" } = options;

  // ── 1. Basic sanity ──
  if (lower.length < 3 || lower.length > 70) {
    return { valid: false, name: candidateName, reason: "Name too short or too long" };
  }

  if (JUNK_EXACT.has(lower)) {
    return { valid: false, name: candidateName, reason: "Exact junk match" };
  }

  // ── 2. Pattern rejection ──
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(lower)) {
      return { valid: false, name: candidateName, reason: "Matches junk pattern" };
    }
  }

  for (const pattern of SERVICE_PATTERNS) {
    if (pattern.test(lower)) {
      return { valid: false, name: candidateName, reason: "Looks like a service/course, not a business" };
    }
  }

  for (const pattern of LISTICLE_PATTERNS) {
    if (pattern.test(lower)) {
      return { valid: false, name: candidateName, reason: "Looks like a listicle/query, not a business" };
    }
  }

  // ── 3. Single-word short names rarely real businesses ──
  if (!lower.includes(" ") && lower.length <= 3) {
    return { valid: false, name: candidateName, reason: "Single-word name too short" };
  }

  // ── 4. Acronym gibberish ──
  if (/^[A-Z]{1,5}\d+[A-Z0-9]*$/i.test(candidateName) && candidateName.length < 8) {
    return { valid: false, name: candidateName, reason: "Looks like an acronym/code, not a business name" };
  }

  // ── 5. Ends with TLD ──
  if (/\.(com|net|org|io|co\.uk|ca|au)$/i.test(candidateName)) {
    return { valid: false, name: candidateName, reason: "Name ends with TLD" };
  }

  // ── 6. Sentence-like names (too many common words) ──
  const words = lower.split(/\s+/);
  const commonWords = words.filter((w) =>
    /^(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|is|are|was|it|that|this|your|our|their|can|how|what|when|where|why|who|which|do|does|will|would|should|could|has|have|had|been|not|no|all|some|any|more|most|other|new|old|good|great|best|top|free|get|find|see|know|make|take|use|work|help|need|want|like|just|only|also|still|even|well|very|much|many)$/i.test(w)
  );
  if (commonWords.length >= 5) {
    return { valid: false, name: candidateName, reason: "Looks like a sentence, not a business name" };
  }

  // ── 7. Niche overlap (if we have data) ──
  const lowerSnippet = snippet.toLowerCase();
  const serviceWords = services
    .flatMap((s) => s.toLowerCase().split(/\s+/))
    .filter((w) => w.length > 3);

  if (businessType || services.length > 0) {
    const snippetMatches = serviceWords.filter((w) => lowerSnippet.includes(w)).length;
    const bizTypeWords = businessType
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const bizTypeMatches = bizTypeWords.filter(
      (w) => lowerSnippet.includes(w) || lower.includes(w)
    ).length;

    // Need at least some signal that this is the same niche
    if (snippet && snippetMatches < 1 && bizTypeMatches < 1) {
      return { valid: false, name: candidateName, reason: "No niche overlap detected" };
    }
  }

  // ── 8. Geographic relevance (local mode) ──
  const isLocalMode = market === "local" || !!city;
  if (isLocalMode && city) {
    const cityLower = city.toLowerCase();
    const cityInName = lower.includes(cityLower);
    const cityInSnippet = lowerSnippet.includes(cityLower);

    // For local mode, we require some geo signal — either in the name or in the snippet
    if (!cityInName && !cityInSnippet) {
      return { valid: false, name: candidateName, reason: `No geographic signal for ${city}` };
    }
  }

  return { valid: true, name: candidateName };
}

/**
 * Quick async verification: does this competitor have a real web presence
 * that mentions the target city (for local mode)?
 */
async function verifyWebPresence(
  candidateName: string,
  city: string,
  isLocalMode: boolean
): Promise<{ valid: boolean; url?: string; reason?: string }> {
  try {
    const query = isLocalMode
      ? `"${candidateName}" ${city}`
      : `"${candidateName}"`;

    const results = await tavilySearch(query, { maxResults: 5 });

    if (results.length === 0) {
      return { valid: false, reason: "No web presence found" };
    }

    // Must have at least one result that is NOT a directory
    const nonDirectory = results.find((r) => {
      const lowerUrl = r.url.toLowerCase();
      return !DIRECTORY_DOMAINS.some((d) => lowerUrl.includes(d));
    });

    if (!nonDirectory) {
      return { valid: false, reason: "Only directory listings found" };
    }

    // For local mode: check that a result mentions the city
    if (isLocalMode && city) {
      const cityLower = city.toLowerCase();
      const cityMentioned = results.some(
        (r) =>
          r.title.toLowerCase().includes(cityLower) ||
          r.content.toLowerCase().includes(cityLower)
      );
      if (!cityMentioned) {
        return { valid: false, reason: `No ${city} mention in web presence` };
      }
    }

    return { valid: true, url: nonDirectory.url };
  } catch (error) {
    // Don't block on verification failure — assume valid and let upstream filter
    return { valid: true, reason: "Verification error, allowing through" };
  }
}

/* ───────────────────────────────
   3. NAME EXTRACTION
   ─────────────────────────────── */

function extractBusinessNameFromResult(
  result: TavilySearchResult,
  originalBusinessName: string
): { name: string; snippet: string } | null {
  if (result.title.toLowerCase().includes(originalBusinessName.toLowerCase())) {
    return null;
  }

  const title = result.title;
  const snippet = result.content || "";

  // Strategy 1: Pipe/dash separated title — last part is often the business name
  const parts = title.split(/\s*[-–—|·•]\s*/).filter((p) => p.trim().length > 0);
  let pipedName: string | null = null;

  if (parts.length >= 2) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i]
        .trim()
        .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, "")
        .replace(/\s*\(\d+\s*reviews?\)\s*/i, "")
        .replace(/\s*\d\.\d+\s*★?\s*/, "")
        .replace(/^(A|An|The)\s+/i, "")
        .trim();

      if (
        candidate.length >= 3 &&
        !/^(best|top|#\d+|\d+\.)/i.test(candidate) &&
        !/^\d/.test(candidate)
      ) {
        pipedName = candidate;
        break;
      }
    }
  }

  // Strategy 2: URL hostname → brand name
  let urlName: string | null = null;
  try {
    const hostname = new URL(result.url).hostname.replace("www.", "").split(".")[0];
    urlName = hostname
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const genericHosts = [
      "google", "yelp", "facebook", "instagram", "twitter", "linkedin",
      "pinterest", "youtube", "reddit", "wikipedia", "mapquest", "tripadvisor",
      "yellowpages", "foursquare", "bbb", "booking", "airbnb", "expedia", "zillow",
      "trulia", "realtor", "cars", "autotrader", "cargurus", "homeadvisor",
      "thumbtack", "angi", "trustpilot", "sitejabber", "glassdoor", "indeed",
      "crunchbase", "medium", "google",
    ];
    if (genericHosts.some((h) => urlName!.toLowerCase().includes(h))) urlName = null;
  } catch {
    urlName = null;
  }

  // Strategy 3: Cleaned first part of title
  let cleanName: string | null = null;
  const firstPart = title.split(/\s*[-–—|·•]\s*/)[0];
  cleanName = firstPart
    .replace(/\s+in\s+[A-Z][a-zA-Z\s]+,?\s*[A-Z]{0,2}$/, "")
    .replace(/\s*\(\d+\s*reviews?\)\s*/i, "")
    .replace(/\s+[-–—]+\s+(Yelp|Google Reviews)$/i, "")
    .replace(/^(Best |Top |Top Rated |#\d+ |\d+\.\s)/i, "")
    .replace(/^(A |An |The )/i, "")
    .trim();

  const finalName = pipedName || urlName || cleanName;

  if (!finalName || finalName.length < 3 || finalName.length > 60) return null;
  if (/\.(com|net|org|io|ca|co\.uk|au)$/i.test(finalName)) return null;
  if (/top \d+|\d+ best|best \d+|top rated|companies? in|businesses? in|places? in|list of|near me/i.test(finalName)) return null;
  if (/^\d/.test(finalName)) return null;
  if (/^[A-Z]{1,3}\d*$/i.test(finalName) && finalName.length < 6) return null;

  return { name: finalName, snippet };
}

/* ───────────────────────────────
   4. LOCAL MODE DISCOVERY
   ─────────────────────────────── */

async function discoverLocalCompetitors(
  businessName: string,
  city: string,
  niche: string,
  services: string[],
  preflightQueries?: string[],
  address?: string
): Promise<string[]> {
  const candidates: Map<string, { name: string; snippet: string; appearances: number }> = new Map();

  // ── PRIMARY: Google Places API (if configured) ──
  if (isPlacesConfigured()) {
    console.info(`[competitor-discovery] LOCAL mode: Using Google Places API as primary source`);
    const placesResults = await discoverLocalViaPlaces(niche, city, address, businessName);

    if (placesResults.length >= 2) {
      console.info(`[competitor-discovery] Places API returned ${placesResults.length} validated competitors`);
      return placesResults;
    }

    // If Places returned < 2, log and fall through to Tavily
    console.info(`[competitor-discovery] Places API returned only ${placesResults.length} competitors, supplementing with Tavily`);
    for (const name of placesResults) {
      candidates.set(name.toLowerCase(), { name, snippet: `Places API result in ${city}`, appearances: 10 });
    }
  }

  // ── FALLBACK: Tavily search ──
  const queries: string[] = preflightQueries && preflightQueries.length >= 2
    ? preflightQueries.slice(0, 4)
    : [
        `"${niche}" in ${city}`,
        `"best ${niche}" ${city}`,
        `"${niche}" ${city} alternatives`,
      ];

  console.info(`[competitor-discovery] LOCAL mode: ${queries.length} Tavily queries for ${niche} in ${city}`);

  for (const query of queries) {
    try {
      const results = await tavilySearch(query);
      for (const result of results) {
        const extracted = extractBusinessNameFromResult(result, businessName);
        if (!extracted) continue;

        const key = extracted.name.toLowerCase();
        const existing = candidates.get(key);
        if (existing) {
          existing.appearances++;
        } else {
          candidates.set(key, {
            name: extracted.name,
            snippet: extracted.snippet,
            appearances: 1,
          });
        }
      }
    } catch (error) {
      console.error(`[competitor-discovery] Local search failed for "${query}":`, error);
      continue;
    }
  }

  // Validate candidates
  const validated: { name: string; appearances: number }[] = [];
  for (const [, data] of Array.from(candidates)) {
    const v = validateCompetitor(data.name, {
      businessType: niche,
      services,
      city,
      market: "local",
      snippet: data.snippet,
    });

    if (v.valid) {
      validated.push({ name: data.name, appearances: data.appearances });
    } else {
      console.info(`[competitor-discovery] Rejected local candidate "${data.name}": ${v.reason}`);
    }
  }

  // Rank by appearances, verify web presence for top candidates
  validated.sort((a, b) => b.appearances - a.appearances);

  const verified: string[] = [];
  for (const candidate of validated.slice(0, 6)) {
    if (verified.length >= 3) break;

    const webCheck = await verifyWebPresence(candidate.name, city, true);
    if (webCheck.valid) {
      verified.push(candidate.name);
      console.info(`[competitor-discovery] ✅ Verified local: "${candidate.name}"`);
    } else {
      console.info(`[competitor-discovery] ❌ Local web-check failed for "${candidate.name}": ${webCheck.reason}`);
    }
  }

  return verified;
}

/* ───────────────────────────────
   4b. PLACES API LOCAL DISCOVERY
   ─────────────────────────────── */

async function discoverLocalViaPlaces(
  niche: string,
  city: string,
  address: string | undefined,
  businessName: string
): Promise<string[]> {
  // Geocode the business address or city
  const geoQuery = address || city;
  const coords = await geocodeAddress(geoQuery);

  if (!coords) {
    console.info(`[competitor-discovery] Could not geocode "${geoQuery}", skipping Places search`);
    return [];
  }

  console.info(`[competitor-discovery] Geocoded ${geoQuery} → ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);

  // Search for nearby businesses in the same niche
  const places = await placesNearbySearch(niche, coords, 15000, 10); // 15km radius

  // Filter out the target business itself and validate
  const lowerBizName = businessName.toLowerCase();
  const competitors: string[] = [];

  for (const place of places) {
    const placeName = place.displayName?.text;
    if (!placeName) continue;

    // Skip if this is the target business (exact or partial match on first 2 words)
    if (placeName.toLowerCase() === lowerBizName) continue;
    const bizWords = lowerBizName.split(/\s+/).filter(w => w.length > 3);
    const placeLower = placeName.toLowerCase();
    if (bizWords.length >= 2 && bizWords.every(w => placeLower.includes(w))) continue;

    // Validate: must have a real address in the area (not just a phone number)
    if (!place.formattedAddress) continue;

    // Validate: not a service/course/directory
    const v = validateCompetitor(placeName, {
      businessType: niche,
      market: "local",
      city,
    });
    if (!v.valid) {
      console.info(`[competitor-discovery] Places candidate "${placeName}" rejected: ${v.reason}`);
      continue;
    }

    competitors.push(placeName);
    console.info(`[competitor-discovery] ✅ Places verified: "${placeName}" (${place.formattedAddress}, ${place.userRatingCount || 0} reviews)`);

    if (competitors.length >= 3) break;
  }

  return competitors;
}

/* ───────────────────────────────
   5. ONLINE MODE DISCOVERY
   ─────────────────────────────── */

async function discoverOnlineCompetitors(
  businessName: string,
  city: string,
  niche: string,
  services: string[],
  preflightQueries?: string[]
): Promise<string[]> {
  const candidates: Map<string, { name: string; snippet: string; appearances: number }> = new Map();

  const queries: string[] = preflightQueries && preflightQueries.length >= 2
    ? preflightQueries.slice(0, 4)
    : [
        `"best ${niche}"`,
        `"${niche}" alternatives`,
        `"competitors to ${niche}"`,
      ];

  console.info(`[competitor-discovery] ONLINE mode: ${queries.length} queries for ${niche}`);

  for (const query of queries) {
    try {
      const results = await tavilySearch(query);
      for (const result of results) {
        const extracted = extractBusinessNameFromResult(result, businessName);
        if (!extracted) continue;

        const key = extracted.name.toLowerCase();
        const existing = candidates.get(key);
        if (existing) {
          existing.appearances++;
        } else {
          candidates.set(key, {
            name: extracted.name,
            snippet: extracted.snippet,
            appearances: 1,
          });
        }
      }
    } catch (error) {
      console.error(`[competitor-discovery] Online search failed for "${query}":`, error);
      continue;
    }
  }

  // Validate candidates (no geo check for online mode)
  const validated: { name: string; appearances: number }[] = [];
  for (const [, data] of Array.from(candidates)) {
    const v = validateCompetitor(data.name, {
      businessType: niche,
      services,
      market: "online",
      snippet: data.snippet,
    });

    if (v.valid) {
      validated.push({ name: data.name, appearances: data.appearances });
    } else {
      console.info(`[competitor-discovery] Rejected online candidate "${data.name}": ${v.reason}`);
    }
  }

  validated.sort((a, b) => b.appearances - a.appearances);

  const verified: string[] = [];
  for (const candidate of validated.slice(0, 6)) {
    if (verified.length >= 3) break;

    const webCheck = await verifyWebPresence(candidate.name, city, false);
    if (webCheck.valid) {
      verified.push(candidate.name);
      console.info(`[competitor-discovery] ✅ Verified online: "${candidate.name}"`);
    } else {
      console.info(`[competitor-discovery] ❌ Online web-check failed for "${candidate.name}": ${webCheck.reason}`);
    }
  }

  return verified;
}

/* ───────────────────────────────
   6. USER-PROVIDED COMPETITOR VALIDATION
   ─────────────────────────────── */

async function validateUserProvidedCompetitor(
  providedCompetitor: string,
  businessType: string,
  services: string[],
  city: string,
  market: string
): Promise<{ valid: boolean; name: string; reason?: string }> {
  const trimmed = providedCompetitor.trim();

  // Run through the same validation pipeline
  const v = validateCompetitor(trimmed, {
    businessType,
    services,
    city,
    market,
  });

  if (!v.valid) {
    return { valid: false, name: trimmed, reason: v.reason };
  }

  // Also verify web presence
  const isLocalMode = market === "local" || !!city;
  const webCheck = await verifyWebPresence(trimmed, city, isLocalMode);

  if (!webCheck.valid) {
    return { valid: false, name: trimmed, reason: webCheck.reason };
  }

  return { valid: true, name: trimmed };
}

/* ───────────────────────────────
   7. MAIN EXPORT
   ─────────────────────────────── */

/**
 * Main entry: Discover real competitors using preflight intelligence.
 *
 * @param businessName - The business being audited
 * @param website - Their website URL
 * @param city - Their city/market
 * @param providedCompetitor - Optional manually-provided competitor (always validated)
 * @param preflightData - Preflight intelligence (competitorSearchQueries, businessType, services, market, address)
 *
 * Signature intentionally kept stable so process-lead route doesn't break.
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
    address?: string;
  }
): Promise<string[]> {
  const businessType = preflightData?.businessType || "";
  const services = preflightData?.services || [];
  const market = preflightData?.market || "";
  const address = preflightData?.address || "";

  // ── Determine local vs online mode ──
  const isLocalMode = !!address || market === "local";
  console.info(
    `[competitor-discovery] Mode: ${isLocalMode ? "LOCAL" : "ONLINE"} ` +
    `(address=${!!address}, market=${market}, city=${city})`
  );

  // ── Validate user-provided competitor first ──
  if (providedCompetitor && providedCompetitor.trim() !== "") {
    const userComp = await validateUserProvidedCompetitor(
      providedCompetitor,
      businessType,
      services,
      city,
      market
    );

    if (userComp.valid) {
      console.info(`[competitor-discovery] User-provided competitor validated: "${userComp.name}"`);
      return [userComp.name];
    }

    console.info(
      `[competitor-discovery] User-provided competitor "${providedCompetitor}" failed validation: ${userComp.reason}. Falling back to auto-discovery.`
    );
    // Fall through to auto-discovery
  }

  // ── Auto-discovery ──
  const niche = businessType || businessName;
  const preflightQueries = preflightData?.competitorSearchQueries;

  const competitors = isLocalMode
    ? await discoverLocalCompetitors(businessName, city, niche, services, preflightQueries, address)
    : await discoverOnlineCompetitors(businessName, city, niche, services, preflightQueries);

  if (competitors.length === 0) {
    console.info(
      `[competitor-discovery] No validated competitors found for ${businessName} (${niche}) in ${city}`
    );
  } else {
    console.info(
      `[competitor-discovery] Final competitors: ${competitors.join(", ")}`
    );
  }

  return competitors.slice(0, 3);
}

// Also export validation for research-runner.ts
export { validateCompetitor as validateCompetitorForReuse };
