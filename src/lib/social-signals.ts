/**
 * Social Signals Module
 *
 * Collects social media presence data for a business:
 * - Google reviews (count, rating) via Tavily search
 * - Instagram followers via Firecrawl
 * - Facebook page likes via Firecrawl
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

/**
 * Main entry — collect social signals for a business and its competitors
 */
export async function collectSocialSignals(
  businessName: string,
  city: string,
  website: string,
  competitorNames: string[],
  scrapedHtml?: string,
): Promise<SocialAnalysis> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  // Step 1: Get HTML to extract social URLs from
  let html = scrapedHtml || "";
  if (!html && apiKey) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: website, formats: ["html"], onlyMainContent: false }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      html = (data.data?.html || "") as string;
    } catch {
      console.warn("[social-signals] Failed to scrape homepage for social links");
    }
  }

  // Step 2: Extract social URLs from website HTML
  const socialUrls = extractSocialUrls(html, website);

  // Step 2: Collect business social data in parallel
  const [instagram, facebook, google] = await Promise.all([
    scrapeInstagramFollowers(socialUrls.instagram, apiKey),
    scrapeFacebookLikes(socialUrls.facebook, apiKey),
    scrapeGoogleReviews(businessName, city),
  ]);

  const business: SocialPresence = {
    instagram: instagram.followers,
    facebook: facebook.likes,
    googleReviews: google.reviewCount,
    googleRating: google.rating,
    instagramUrl: socialUrls.instagram,
    facebookUrl: socialUrls.facebook,
  };

  // Step 3: Collect competitor Google reviews (parallel, top 3)
  const competitors: CompetitorSocial[] = await Promise.all(
    competitorNames.slice(0, 3).map(async (name) => {
      const compGoogle = await scrapeGoogleReviews(name, city);
      return {
        name,
        instagram: null,
        facebook: null,
        googleReviews: compGoogle.reviewCount,
        googleRating: compGoogle.rating,
      };
    })
  );

  // Step 4: Generate narrative
  const analysis = analyzeSocialVsVisibility(business, competitors);

  return {
    business,
    competitors,
    narrative: analysis.narrative,
    aiVisibilityVsSocial: analysis.meta,
  };
}

/**
 * Extract social media URLs from website HTML
 */
function extractSocialUrls(html: string, _baseUrl: string): { instagram: string | null; facebook: string | null } {
  let instagram: string | null = null;
  let facebook: string | null = null;

  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1].toLowerCase();
    if (url.includes("instagram.com/") && !url.includes("help.instagram")) {
      instagram = match[1];
    }
    if (url.includes("facebook.com/") && !url.includes("help.facebook") && !url.includes("developers.facebook")) {
      facebook = match[1];
    }
  }

  return { instagram, facebook };
}

/**
 * Scrape Instagram follower count (best effort — IG blocks most scraping)
 */
async function scrapeInstagramFollowers(
  url: string | null,
  apiKey?: string,
): Promise<{ followers: number | null }> {
  if (!url || !apiKey) return { followers: null };

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    const md = (data.data?.markdown || "") as string;

    // Instagram shows "X followers" in various formats
    const patterns = [
      /(\d[\d,.]*)\s*(?:followers?|Followers)/i,
      /(\d[\d,.]*)\s*[kKmM]\s*(?:followers?|Followers)/i,
      /Followers\s*[,.]?\s*(\d[\d,.]*)/i,
    ];

    for (const pattern of patterns) {
      const m = md.match(pattern);
      if (m) return { followers: parseSocialNumber(m[1]) };
    }

    return { followers: null };
  } catch {
    return { followers: null };
  }
}

/**
 * Scrape Facebook page likes (best effort)
 */
async function scrapeFacebookLikes(
  url: string | null,
  apiKey?: string,
): Promise<{ likes: number | null }> {
  if (!url || !apiKey) return { likes: null };

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    const md = (data.data?.markdown || "") as string;

    const patterns = [
      /(\d[\d,.]*)\s*(?:likes?|Likes)/i,
      /(\d[\d,.]*)\s*[kKmM]\s*(?:likes?)/i,
    ];

    for (const pattern of patterns) {
      const m = md.match(pattern);
      if (m) return { likes: parseSocialNumber(m[1]) };
    }

    return { likes: null };
  } catch {
    return { likes: null };
  }
}

/**
 * Scrape Google review count and rating via Tavily search
 */
async function scrapeGoogleReviews(
  businessName: string,
  city: string,
): Promise<{ reviewCount: number | null; rating: number | null }> {
  try {
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (!tavilyKey) return { reviewCount: null, rating: null };

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tavilyKey}` },
      body: JSON.stringify({
        query: `${businessName} ${city} Google reviews rating`,
        max_results: 3,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    const answer = (data.answer || "") as string;

    // Extract rating (e.g. "4.8 Google rating", "4.5-star", "rated 4.8", "4.8★")
    const ratingMatch = answer.match(/(\d+\.?\d*)[-\s]*(?:stars?|★|rating|rated|on Google)/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    // Extract review count (e.g. "123 reviews", "over 100 reviews")
    const reviewMatch = answer.match(/(?:over |more than |about )?(\d[\d,]+)\s*reviews?/i);
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ""), 10) : null;

    console.info(`[social-signals] Google reviews for ${businessName}: rating=${rating}, count=${reviewCount}`);
    return { reviewCount, rating };
  } catch (e) {
    console.warn(`[social-signals] Google reviews failed for ${businessName}:`, e instanceof Error ? e.message : e);
    return { reviewCount: null, rating: null };
  }
}

/**
 * Parse social media numbers ("1,234" → 1234, "1.2K" → 1200, "3.4M" → 3400000)
 */
function parseSocialNumber(str: string): number {
  const cleaned = str.replace(/,/g, "");
  const lower = cleaned.toLowerCase();

  if (lower.includes("k")) return Math.round(parseFloat(lower.replace("k", "")) * 1000);
  if (lower.includes("m")) return Math.round(parseFloat(lower.replace("m", "")) * 1000000);

  return parseInt(cleaned, 10) || 0;
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

  const lowSocialStrongVisibility = `Most agencies will tell you to grow your social following. But look at your data — AI platforms are recommending you based on your content quality, local signals, and online reputation, not your follower count. Social media is one signal among many, and it's not the strongest one for AI visibility.`;

  const competitorGapNarrative = socialGapMultiplier
    ? ` Your top competitor has ${socialGapMultiplier}x your Google reviews — but that doesn't mean they own AI visibility. Review count is one signal; content depth, schema markup, and local authority often matter more.`
    : "";

  const narrative = lowSocialStrongVisibility + competitorGapNarrative;

  return {
    narrative,
    meta: {
      hasStrongVisibilityLowSocial: false,
      hasWeakVisibilityHighSocial: false,
      socialGapMultiplier,
    },
  };
}
