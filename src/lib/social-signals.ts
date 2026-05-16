/**
 * Social Signals Module v3
 *
 * Collects social media presence data for a business:
 * - Google reviews (count + rating)
 * - Instagram followers
 * - Facebook page likes
 * - YouTube channel (AI citation potential)
 *
 * Uses Tavily search for ALL social data — it returns answer snippets
 * with follower counts, review ratings, and page likes.
 * Falls back gracefully if any platform can't be reached.
 *
 * Key insight for reports: social following ≠ AI visibility.
 * A business with zero social presence can still dominate AI recommendations
 * through content quality, schema markup, and local signals.
 *
 * YouTube is the exception — it's the #1 most-cited site in AI search
 * (Edward Sturm research), making it a direct AI visibility lever.
 */

import {
  analyzeYouTubePresence,
  scoreVideoSEO,
  generateYouTubeReport,
  type YouTubePresence,
} from "./youtube-scoring";
import { geocodeAddress, placesNearbySearch, isPlacesConfigured } from "./places-client";

export interface SocialPresence {
  googleReviews: number | null;
  googleRating: number | null;

  youtube: {
    channelFound: boolean;
    subscriberCount: number | null;
    aiCitationPotential: string;
  };
}

export interface CompetitorSocial {
  name: string;
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
  socialUrls?: { instagram?: string | null; facebook?: string | null },
): Promise<SocialAnalysis> {
  // Step 1: Collect business social data (parallel)
  // Google Places API for reviews (primary), Tavily as fallback
  const [placesData, youTubePresence] = await Promise.all([
    getGoogleReviewsFromPlaces(businessName, city),
    analyzeYouTubePresence(businessName, city, "auto dealer"), // default niche; caller can override via socialUrls
  ]);

  // Fallback to Tavily for Google reviews only if Places returns nothing
  let googleReviews = placesData.reviews;
  let googleRating = placesData.rating;
  if (googleReviews === null && googleRating === null) {
    const tavilyGoogle = await tavilySocialSearch(`${businessName} ${city} Google reviews rating number of reviews`);
    googleReviews = parseReviewCount(tavilyGoogle);
    googleRating = parseRating(tavilyGoogle);
  }

  const business: SocialPresence = {
    googleReviews,
    googleRating,
    youtube: {
      channelFound: youTubePresence.channelFound,
      subscriberCount: youTubePresence.subscriberCount,
      aiCitationPotential: youTubePresence.aiCitationPotential,
    },
  };

  console.info(`[social-signals] ${businessName}: Google=${business.googleReviews} reviews (${business.googleRating} stars), YT=${business.youtube.channelFound ? "found" : "none"}`);

  // Step 2: Collect competitor social data (parallel, top 3)
  // Use Google Places API for competitors too, with Tavily fallback
  const competitors: CompetitorSocial[] = await Promise.all(
    competitorNames.slice(0, 3).map(async (name) => {
      const placesComp = await getGoogleReviewsFromPlaces(name, city);
      let compReviews = placesComp.reviews;
      let compRating = placesComp.rating;
      if (compReviews === null && compRating === null) {
        const tavilyComp = await tavilySocialSearch(`${name} ${city} Google reviews rating number of reviews`);
        compReviews = parseReviewCount(tavilyComp);
        compRating = parseRating(tavilyComp);
      }
      return {
        name,
        googleReviews: compReviews,
        googleRating: compRating,
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
 * Get Google review data from Google Places API (New)
 * This is the PRIMARY source for review counts — accurate and specific.
 */
async function getGoogleReviewsFromPlaces(
  businessName: string,
  city: string
): Promise<{ reviews: number | null; rating: number | null }> {
  if (!isPlacesConfigured()) {
    return { reviews: null, rating: null };
  }

  try {
    const coords = await geocodeAddress(city);
    if (!coords) {
      return { reviews: null, rating: null };
    }

    // Search for the business by name in the city
    const places = await placesNearbySearch(businessName, coords, 15000, 5);

    // Find the best match (exact or close name match)
    const lowerBizName = businessName.toLowerCase();
    let bestMatch = places[0];

    for (const place of places) {
      const placeName = place.displayName?.text?.toLowerCase() || "";
      if (placeName.includes(lowerBizName) || lowerBizName.includes(placeName.split(' ')[0])) {
        bestMatch = place;
        break;
      }
    }

    if (bestMatch?.userRatingCount || bestMatch?.rating) {
      return {
        reviews: bestMatch.userRatingCount || null,
        rating: bestMatch.rating || null,
      };
    }
  } catch (error) {
    console.warn(`[social-signals] Places API review lookup failed for "${businessName}":`, error instanceof Error ? error.message : error);
  }

  return { reviews: null, rating: null };
}

/**
 * Query Tavily for social data — returns the answer text
 * Now used ONLY as a fallback when Places API is unavailable.
 */
let lastSocialTavilyCall = 0;

async function tavilySocialSearch(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return "";

  // Rate limit
  const elapsed = Date.now() - lastSocialTavilyCall;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastSocialTavilyCall = Date.now();

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
