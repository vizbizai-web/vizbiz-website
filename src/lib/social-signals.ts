/**
 * Social Signals Module v2
 *
 * Collects social media presence data for a business:
 * - Google reviews (count + rating)
 * - Instagram followers
 * - Facebook page likes
 *
 * Uses Tavily search for ALL social data — it returns answer snippets
 * with follower counts, review ratings, and page likes.
 * Falls back gracefully if any platform can't be reached.
 *
 * Key insight for reports: social following ≠ AI visibility.
 * A business with zero social presence can still dominate AI recommendations
 * through content quality, schema markup, and local signals.
 */

export interface SocialPresence {
  instagram: number | null;
  facebook: number | null;
  googleReviews: number | null;
  googleRating: number | null;
  
  instagramUrl: string | null;
  facebookUrl: string | null;
}

export interface CompetitorSocial {
  name: string;
  instagram: number | null;
  facebook: number | null;
  googleReviews: number | null;
  googleRating: number | null;
  
}

export interface SocialAnalysis {
  business: SocialPresence;
  competitors: CompetitorSocial[];
  narrative: string;
  aiVisibilityVsSocial: {
    hasStrongVisibilityLowSocial: boolean;
    hasWeakVisibilityHighSocial: boolean;
    socialGapMultiplier: number | null;
  };
}

const TAVILY_TIMEOUT = 10000;

/**
 * Main entry — collect social signals for a business and its competitors
 */
export async function collectSocialSignals(
  businessName: string,
  city: string,
  website: string,
  competitorNames: string[],
): Promise<SocialAnalysis> {
  // Step 1: Collect business social data via Tavily (parallel)
  const [google, instagram, facebook] = await Promise.all([
    tavilySocialSearch(`${businessName} ${city} Google reviews rating number of reviews`),
    tavilySocialSearch(`${businessName} ${city} Instagram followers`),
    tavilySocialSearch(`${businessName} ${city} Facebook page likes`),
  ]);

  const business: SocialPresence = {
    instagram: parseFollowerCount(instagram),
    facebook: parseFollowerCount(facebook),
    googleReviews: parseReviewCount(google),
    googleRating: parseRating(google),
    instagramUrl: null,
    facebookUrl: null,
  };

  console.info(`[social-signals] ${businessName}: IG=${business.instagram}, FB=${business.facebook}, Google=${business.googleReviews} reviews (${business.googleRating} stars)`);

  // Step 2: Collect competitor social data (parallel, top 3)
  const competitors: CompetitorSocial[] = await Promise.all(
    competitorNames.slice(0, 3).map(async (name) => {
      const [g, ig] = await Promise.all([
        tavilySocialSearch(`${name} ${city} Google reviews rating number of reviews`),
        tavilySocialSearch(`${name} ${city} Instagram followers`),
      ]);
      return {
        name,
        instagram: parseFollowerCount(ig),
        facebook: null,
        googleReviews: parseReviewCount(g),
        googleRating: parseRating(g),
      };
    })
  );

  // Step 3: Generate narrative
  const analysis = analyzeSocialVsVisibility(business, competitors);

  return {
    business,
    competitors,
    narrative: analysis.narrative,
    aiVisibilityVsSocial: analysis.meta,
  };
}

/**
 * Query Tavily for social data — returns the answer text
 */
async function tavilySocialSearch(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return "";

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tavilyKey}` },
      body: JSON.stringify({
        query,
        max_results: 2,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(TAVILY_TIMEOUT),
    });

    const data = await res.json();
    return (data.answer || "") as string;
  } catch (e) {
    console.warn(`[social-signals] Tavily failed for "${query}":`, e instanceof Error ? e.message : e);
    return "";
  }
}

/**
 * Extract follower count from Tavily answer text
 * Handles: "222 followers", "over 3,100 followers", "1.2 million", "865 followers"
 */
function parseFollowerCount(text: string): number | null {
  if (!text) return null;

  // "1.2 million followers" or "1.2M followers"
  const millionMatch = text.match(/(\d+\.?\d*)\s*(?:million|M)\s*(?:followers?|subscribers?|likes?)/i);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1]) * 1000000);
  }

  // "3,100 followers" or "over 3,100 followers" or "865 followers"
  const countMatch = text.match(/(?:over |more than |about |around )?(\d[\d,]+)\s*(?:followers?|subscribers?|likes?)/i);
  if (countMatch) {
    return parseInt(countMatch[1].replace(/,/g, ""), 10);
  }

  // "1.2K followers"
  const kMatch = text.match(/(\d+\.?\d*)\s*[kK]\s*(?:followers?|subscribers?|likes?)/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  return null;
}

/**
 * Extract review count from Tavily answer text
 * Handles: "123 reviews", "over 100 reviews", "4.5-star rating with 82 reviews"
 */
function parseReviewCount(text: string): number | null {
  if (!text) return null;

  const match = text.match(/(?:over |more than |about |with )?(\d[\d,]+)\s*reviews?/i);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
}

/**
 * Extract rating from Tavily answer text
 * Handles: "4.5-star rating", "rated 4.8", "4.7 stars"
 */
function parseRating(text: string): number | null {
  if (!text) return null;

  const match = text.match(/(\d+\.?\d*)[-\s]*(?:stars?|★|rating|rated)/i);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Analyze social signals vs AI visibility and generate narrative
 */
function analyzeSocialVsVisibility(
  business: SocialPresence,
  competitors: CompetitorSocial[],
): { narrative: string; meta: SocialAnalysis["aiVisibilityVsSocial"] } {
  let socialGapMultiplier: number | null = null;

  for (const comp of competitors) {
    if (business.googleReviews && comp.googleReviews) {
      const gap = comp.googleReviews / Math.max(business.googleReviews, 1);
      if (gap > 2) socialGapMultiplier = Math.round(gap * 10) / 10;
    }
  }

  const parts: string[] = [];

  // Main narrative: social ≠ AI visibility
  parts.push(
    "Most agencies will tell you to grow your social following. But look at your data — " +
    "AI platforms like ChatGPT and Google AI Overviews recommend businesses based on content quality, " +
    "structured data, and local authority signals — not follower counts. " +
    "Social media is one signal among many, and it's rarely the strongest one for AI visibility."
  );

  // Competitor gap narrative
  if (socialGapMultiplier) {
    parts.push(
      `Your top competitor has ${socialGapMultiplier}x your Google reviews — ` +
      "but that doesn't mean they own AI visibility. Review count is one signal; " +
      "content depth, schema markup, and local authority often matter more."
    );
  }

  return {
    narrative: parts.join(" "),
    meta: {
      hasStrongVisibilityLowSocial: false,
      hasWeakVisibilityHighSocial: false,
      socialGapMultiplier,
    },
  };
}
