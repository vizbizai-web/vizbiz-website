/**
 * YouTube Scoring Module for AI Visibility
 *
 * Edward Sturm found that YouTube is the #1 most-cited site in AI search.
 * This module scores a business's YouTube presence specifically for
 * AI visibility impact — not raw subscriber count.
 *
 * AI models cite YouTube when videos answer questions clearly, consistently,
 * and with authority. A dealership with 50 niche-relevant videos will
 * outrank a competitor with 50K subscribers and zero relevant content.
 */

export interface YouTubePresence {
  channelFound: boolean;
  channelUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  recentVideos: { title: string; views: number; publishedAt: string }[];
  hasDealershipContent: boolean;
  seoScore: number; // 0-100
  aiCitationPotential: "high" | "medium" | "low";
}

export interface VideoSEOResult {
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface YouTubeReport {
  narrative: string;
  aiVisibilityImpact: string;
  recommendations: string[];
}

const TAVILY_TIMEOUT = 10000;

// ── Main Analysis ──────────────────────────────────────────────────────

/**
 * Analyze a business's YouTube presence for AI visibility impact.
 * Uses Tavily search to find channel and recent videos.
 */
export async function analyzeYouTubePresence(
  businessName: string,
  city: string,
  niche: string,
): Promise<YouTubePresence> {
  const empty: YouTubePresence = {
    channelFound: false,
    channelUrl: null,
    subscriberCount: null,
    videoCount: null,
    recentVideos: [],
    hasDealershipContent: false,
    seoScore: 0,
    aiCitationPotential: "low",
  };

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    console.warn("[youtube-scoring] No TAVILY_API_KEY — skipping YouTube analysis");
    return empty;
  }

  // Step 1: Find the channel
  const [channelResult, videoResult] = await Promise.all([
    tavilySearch(`"${businessName}" ${city} YouTube channel subscribers`),
    tavilySearch(`"${businessName}" ${city} YouTube videos recent 2024 2025`),
  ]);

  const channelUrl = extractChannelUrl(channelResult);
  if (!channelUrl && !videoResult.toLowerCase().includes("youtube")) {
    console.info(`[youtube-scoring] No YouTube channel found for ${businessName}`);
    return empty;
  }

  const subscriberCount = parseSubscriberCount(channelResult + " " + videoResult);
  const videoCount = parseVideoCount(channelResult + " " + videoResult);
  const recentVideos = parseRecentVideos(videoResult);

  // Step 2: Check niche relevance
  const nicheKeywords = extractNicheKeywords(niche);
  const hasDealershipContent = checkNicheRelevance(recentVideos, businessName, nicheKeywords, videoResult);

  // Step 3: Score SEO quality of video content
  const seoResult = scoreVideoSEO({
    channelFound: true,
    channelUrl,
    subscriberCount,
    videoCount,
    recentVideos,
    hasDealershipContent,
    seoScore: 0,
    aiCitationPotential: "low",
  });

  // Step 4: Determine AI citation potential
  const aiCitationPotential = determineCitationPotential(
    recentVideos.length,
    hasDealershipContent,
    seoResult.score,
    subscriberCount,
  );

  console.info(
    `[youtube-scoring] ${businessName}: channel=${channelUrl ? "found" : "not found"}, ` +
    `subs=${subscriberCount}, videos=${videoCount}, relevant=${hasDealershipContent}, ` +
    `seo=${seoResult.score}, aiPotential=${aiCitationPotential}`,
  );

  return {
    channelFound: true,
    channelUrl,
    subscriberCount,
    videoCount,
    recentVideos,
    hasDealershipContent,
    seoScore: seoResult.score,
    aiCitationPotential,
  };
}

// ── Video SEO Scoring ──────────────────────────────────────────────────

/**
 * Score video SEO quality — titles, descriptions, keyword usage.
 * Focuses on what makes AI models cite a video, not raw view count.
 */
export function scoreVideoSEO(presence: YouTubePresence): VideoSEOResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!presence.channelFound) {
    return {
      score: 0,
      issues: ["No YouTube channel found"],
      recommendations: [
        "Create a YouTube channel for your business",
        "Start with 5-10 videos answering common customer questions in your niche",
        "YouTube is the #1 most-cited source in AI search — being there matters",
      ],
    };
  }

  let score = 30; // Base score for existing

  // Channel has videos
  if ((presence.videoCount ?? 0) > 0) score += 10;
  if ((presence.videoCount ?? 0) >= 10) score += 10;
  if ((presence.videoCount ?? 0) >= 50) score += 5;

  // Niche-relevant content
  if (presence.hasDealershipContent) {
    score += 15;
  } else {
    issues.push("No niche-relevant video content found");
    recommendations.push("Create videos specifically about your products/services — AI models cite topical authority");
  }

  // Video title quality
  const videos = presence.recentVideos;
  if (videos.length > 0) {
    const avgTitleLength = videos.reduce((sum, v) => sum + v.title.length, 0) / videos.length;
    if (avgTitleLength >= 30 && avgTitleLength <= 70) {
      score += 10; // Good title length for SEO
    } else if (avgTitleLength < 20) {
      issues.push("Video titles are too short for keyword targeting");
      recommendations.push("Use descriptive titles like 'How to [solve problem] at [Business] in [City]'");
      score += 3;
    } else {
      score += 6;
    }

    // Check if titles answer questions (what AI models look for)
    const questionTitles = videos.filter((v) =>
      /^(how|what|why|when|where|which|can|do|does|is|are|best|top|guide|review|tips)/i.test(v.title),
    );
    if (questionTitles.length >= 2) {
      score += 10; // Strong AI citation signal
    } else if (questionTitles.length >= 1) {
      score += 5;
    } else {
      issues.push("No videos with question-based titles — AI models prefer how-to and FAQ content");
      recommendations.push("Title videos as questions: 'What is the best [product] for [use case]?'");
    }

    // View count as engagement signal (lightweight)
    const avgViews = videos.reduce((sum, v) => sum + v.views, 0) / videos.length;
    if (avgViews >= 1000) score += 5;
    if (avgViews >= 10000) score += 5;
  } else {
    issues.push("No recent videos found");
    recommendations.push("Upload consistently — even 1-2 videos per month builds citation authority");
  }

  // Subscriber base (minor factor for AI citation)
  if ((presence.subscriberCount ?? 0) >= 100) score += 0; // no bonus, AI doesn't care much about subs
  if ((presence.subscriberCount ?? 0) >= 1000) score += 2;

  score = Math.min(100, score);

  // General recommendations if score is low
  if (score < 50) {
    recommendations.push("YouTube is the single most-cited domain in AI search responses");
    recommendations.push("Even a small library of well-titled, niche-specific videos can significantly boost AI visibility");
  }
  if (score >= 50 && score < 75) {
    recommendations.push("Good foundation — increasing upload frequency and focusing on question-format titles will raise AI citation potential");
  }
  if (videos.length > 0 && !presence.hasDealershipContent) {
    recommendations.push(`Add videos specifically about ${presence.hasDealershipContent ? "your niche" : "your products and services"} to match what AI models search for`);
  }

  return { score, issues, recommendations };
}

// ── Report Generation ──────────────────────────────────────────────────

/**
 * Generate a human-readable YouTube report for the audit.
 */
export function generateYouTubeReport(
  presence: YouTubePresence,
  seoScore: VideoSEOResult,
): YouTubeReport {
  const recommendations = [...seoScore.recommendations];

  if (!presence.channelFound) {
    return {
      narrative:
        "Your business does not have a discoverable YouTube presence. " +
        "According to research by Edward Sturm, YouTube is the #1 most-cited website in AI search results — " +
        "ahead of Wikipedia, Reddit, and major news outlets. " +
        "This means AI tools like ChatGPT, Gemini, and Perplexity are heavily trained on YouTube content, " +
        "and businesses with YouTube presence get cited more often.",
      aiVisibilityImpact:
        "No YouTube presence = a significant gap in AI visibility. " +
        "Every competitor with a YouTube channel has an advantage in AI-generated recommendations, " +
        "even if their content is mediocre. The bar is low, but you have to be in the game.",
      recommendations: recommendations.length > 0
        ? recommendations
        : [
            "Create a YouTube channel for your business",
            "Start with 5-10 videos answering your most common customer questions",
            "Use clear, descriptive titles with your city and niche",
          ],
    };
  }

  const subStr = presence.subscriberCount
    ? `${presence.subscriberCount.toLocaleString()} subscribers`
    : "an active channel";
  const videoStr = presence.videoCount
    ? `${presence.videoCount} videos`
    : "several videos";

  const relevanceStr = presence.hasDealershipContent
    ? "Your content is relevant to your niche — this is exactly what AI models look for when generating recommendations."
    : "However, your content doesn't appear to be focused on your core business niche. AI models cite topical authority — videos about what you actually sell.";

  const aiStr =
    presence.aiCitationPotential === "high"
      ? "High. Your YouTube presence is well-positioned for AI citations — consistent, relevant content with good SEO fundamentals."
      : presence.aiCitationPotential === "medium"
        ? "Moderate. You have a presence, but optimizing titles, increasing niche-specific content, and uploading more consistently would significantly boost AI citation likelihood."
        : "Low. Your channel exists but lacks the content quality or relevance signals that AI models use when generating recommendations.";

  return {
    narrative:
      `Your business has a YouTube channel with ${subStr} and ${videoStr}. ${relevanceStr} ` +
      "YouTube is the #1 most-cited source in AI search results (per Edward Sturm's research), " +
      "making it one of the highest-leverage platforms for AI visibility.",
    aiVisibilityImpact: aiStr,
    recommendations: recommendations.length > 0
      ? recommendations
      : ["Maintain consistent upload schedule", "Continue creating niche-relevant content"],
  };
}

// ── Private Helpers ─────────────────────────────────────────────────────

// Rate-limited YouTube Tavily search (unique: includes answer field)
let lastYouTubeTavilyCall = 0;

async function tavilySearch(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return "";

  // Rate limit
  const elapsed = Date.now() - lastYouTubeTavilyCall;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastYouTubeTavilyCall = Date.now();

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tavilyKey}` },
      body: JSON.stringify({ query, max_results: 3, include_answer: true }),
      signal: AbortSignal.timeout(TAVILY_TIMEOUT),
    });
    const data = await res.json();
    return ((data.answer || "") + " " + (data.results || []).map((r: { url?: string; content?: string }) => `${r.url || ""} ${r.content || ""}`).join(" ")) as string;
  } catch (e) {
    console.warn(`[youtube-scoring] Tavily failed for "${query}":`, e instanceof Error ? e.message : e);
    return "";
  }
}

function extractChannelUrl(text: string): string | null {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@(?:[\w.-]+)/i);
  if (match) return match[0];
  const match2 = text.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/(?:[\w.-]+)/i);
  if (match2) return match2[0];
  const match3 = text.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(?:[\w.-]+)/i);
  if (match3) return match3[0];
  return null;
}

function parseSubscriberCount(text: string): number | null {
  const kMatch = text.match(/(\d+\.?\d*)\s*[kK]\s*(?:subscribers?)/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const mMatch = text.match(/(\d+\.?\d*)\s*(?:million|M)\s*(?:subscribers?)/i);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1000000);
  const numMatch = text.match(/(\d[\d,]+)\s*subscribers?/i);
  if (numMatch) return parseInt(numMatch[1].replace(/,/g, ""), 10);
  return null;
}

function parseVideoCount(text: string): number | null {
  const match = text.match(/(\d[\d,]+)\s*videos?/i);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
}

function parseRecentVideos(text: string): { title: string; views: number; publishedAt: string }[] {
  // Best-effort extraction from Tavily results — titles are usually quoted
  const titleMatches = text.matchAll(/"([^"]{10,100})"/g);
  const videos: { title: string; views: number; publishedAt: string }[] = [];
  for (const m of titleMatches) {
    if (videos.length >= 5) break;
    const title = m[1];
    // Skip obviously non-video matches
    if (/^https?:\/\//.test(title)) continue;
    const viewMatch = text.match(new RegExp(escapeRegex(title) + `.*?(\\d[\\d,]+)\\s*views?`, "i"));
    videos.push({
      title,
      views: viewMatch ? parseInt(viewMatch[1].replace(/,/g, ""), 10) : 0,
      publishedAt: "",
    });
  }
  return videos;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractNicheKeywords(niche: string): string[] {
  // Extract meaningful words from the niche description
  const stopWords = new Set(["a", "an", "the", "in", "of", "for", "and", "or", "to", "at", "by", "with"]);
  return niche
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function checkNicheRelevance(
  videos: { title: string; views: number; publishedAt: string }[],
  businessName: string,
  nicheKeywords: string[],
  rawText: string,
): boolean {
  const combinedText = videos.map((v) => v.title.toLowerCase()).join(" ") + " " + rawText.toLowerCase();

  // Check if any niche keywords appear in the content
  const matchedKeywords = nicheKeywords.filter((kw) => combinedText.includes(kw));
  if (matchedKeywords.length >= 2) return true;

  // Check if business name appears alongside video-related content
  if (combinedText.includes(businessName.toLowerCase())) return true;

  return false;
}

function determineCitationPotential(
  videoCount: number,
  hasNicheContent: boolean,
  seoScore: number,
  _subscriberCount: number | null,
): "high" | "medium" | "low" {
  let points = 0;
  if (videoCount >= 20) points += 2;
  else if (videoCount >= 5) points += 1;
  if (hasNicheContent) points += 2;
  if (seoScore >= 60) points += 2;
  else if (seoScore >= 40) points += 1;

  if (points >= 5) return "high";
  if (points >= 3) return "medium";
  return "low";
}
