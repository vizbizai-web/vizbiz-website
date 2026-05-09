/**
 * Social Signals Module
 *
 * Collects social media presence data for a business:
 * - Google reviews (count, rating)
 * - Instagram followers
 * - Facebook page likes
 *
 * Uses Firecrawl for JS rendering + Tavily for search-based discovery.
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
    socialGapMultiplier: number | null; // e.g. "competitor has 8x your followers"
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

  // Step 1: Extract social URLs from website HTML
  const socialUrls = extractSocialUrls(scrapedHtml || "", website);

  // Step 2: Scrape business social data in parallel
  const [instagram, facebook, google] = await Promise.all([
    scrapeInstagramFollowers(socialUrls.instagram, apiKey),
    scrapeFacebookLikes(socialUrls.facebook, apiKey),
    scrapeGoogleReviews(businessName, city, apiKey),
  ]);

  const business: SocialPresence = {
    instagram: instagram.followers,
    facebook: facebook.likes,
    googleReviews: google.reviewCount,
    googleRating: google.rating,
    instagramUrl: socialUrls.instagram,
    facebookUrl: socialUrls.facebook,
  };

  // Step 3: Collect competitor social data (top 3)
  const competitors: CompetitorSocial[] = [];
  for (const compName of competitorNames.slice(0, 3)) {
    const compGoogle = await scrapeGoogleReviews(compName, city, apiKey);
    competitors.push({
      name: compName,
      instagram: null, // Don't scrape competitor Instagram — too many requests
      facebook: null,
      googleReviews: compGoogle.reviewCount,
      googleRating: compGoogle.rating,
    });
  }

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
function extractSocialUrls(html: string, baseUrl: string): { instagram: string | null; facebook: string | null } {
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
 * Scrape Instagram follower count from public profile
 */
async function scrapeInstagramFollowers(
  url: string | null,
  apiKey?: string,
): Promise<{ followers: number | null }> {
  if (!url || !apiKey) return { followers: null };

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    const md = data.data?.markdown || "";

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
 * Scrape Facebook page likes
 */
async function scrapeFacebookLikes(
  url: string | null,
  apiKey?: string,
): Promise<{ likes: number | null }> {
  if (!url || !apiKey) return { likes: null };

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    const md = data.data?.markdown || "";

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
 * Scrape Google review count and rating via search
 */
async function scrapeGoogleReviews(
  businessName: string,
  city: string,
  apiKey?: string,
): Promise<{ reviewCount: number | null; rating: number | null }> {
  try {
    // Use Firecrawl to search for the business's Google listing
    if (apiKey) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(businessName + " " + city + " reviews")}`;
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();
      const md = data.data?.markdown || "";

      // Google shows "4.5 (123 reviews)" or "4.5 ★ (123)"
      const ratingMatch = md.match(/(\d\.?\d?)\s*[★☆]\s*[\(（]?\s*(\d[\d,.]*)\s*(?:reviews?|Google reviews?)/i);
      if (ratingMatch) {
        return {
          rating: parseFloat(ratingMatch[1]),
          reviewCount: parseSocialNumber(ratingMatch[2]),
        };
      }

      // Try alternate pattern
      const reviewMatch = md.match(/(\d[\d,.]*)\s*(?:Google)?\s*reviews?/i);
      const ratingOnly = md.match(/(\d\.?\d?)\s*[★☆]/);
      return {
        reviewCount: reviewMatch ? parseSocialNumber(reviewMatch[1]) : null,
        rating: ratingOnly ? parseFloat(ratingOnly[1]) : null,
      };
    }

    return { reviewCount: null, rating: null };
  } catch {
    return { reviewCount: null, rating: null };
  }
}

/**
 * Parse social media numbers ("1,234" → 1234, "1.2K" → 1200, "3.4M" → 3400000)
 */
function parseSocialNumber(str: string): number {
  const cleaned = str.replace(/,/g, "");
  const lower = cleaned.toLowerCase();

  if (lower.includes("k")) {
    return Math.round(parseFloat(lower.replace("k", "")) * 1000);
  }
  if (lower.includes("m")) {
    return Math.round(parseFloat(lower.replace("m", "")) * 1000000);
  }

  return parseInt(cleaned, 10) || 0;
}

/**
 * Analyze social signals vs AI visibility and generate narrative
 */
function analyzeSocialVsVisibility(
  business: SocialPresence,
  competitors: CompetitorSocial[],
): { narrative: string; meta: SocialAnalysis["aiVisibilityVsSocial"] } {
  const hasStrongSocial = (business.instagram || 0) > 1000 || (business.facebook || 0) > 500 || (business.googleReviews || 0) > 50;
  const hasWeakSocial = !hasStrongSocial;

  // Check if any competitor has significantly more social presence
  let socialGapMultiplier: number | null = null;
  for (const comp of competitors) {
    if (business.googleReviews && comp.googleReviews) {
      const gap = comp.googleReviews / Math.max(business.googleReviews, 1);
      if (gap > 2) socialGapMultiplier = Math.round(gap * 10) / 10;
    }
  }

  // These get populated after research data is available
  // For now, generate both narratives — the report component picks based on visibility score
  const lowSocialStrongVisibility = `Most agencies will tell you to grow your social following. But look at your data — AI platforms are recommending you based on your content quality, local signals, and online reputation, not your follower count. Social media is one signal among many, and it's not the strongest one for AI visibility.`;

  const highSocialWeakVisibility = `You have an active social presence, but it's not translating into AI recommendations. That's because AI platforms like ChatGPT and Google AI Overviews don't just look at followers — they analyze your website content, structured data, and how you're cited across the web. Social media alone won't get you recommended. AI visibility requires a different strategy.`;

  const competitorGapNarrative = socialGapMultiplier
    ? `Your top competitor has ${socialGapMultiplier}x your Google reviews — but that doesn't mean they own AI visibility. Review count is one signal; content depth, schema markup, and local authority often matter more.`
    : "";

  const narrative = [lowSocialStrongVisibility, competitorGapNarrative].filter(Boolean).join(" ");

  return {
    narrative,
    meta: {
      hasStrongVisibilityLowSocial: false, // Populated later with visibility score
      hasWeakVisibilityHighSocial: false,  // Populated later with visibility score
      socialGapMultiplier,
    },
  };
}
