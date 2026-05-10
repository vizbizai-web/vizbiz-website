/**
 * SEO Auditor Module
 *
 * Bakes the SEO skill's audit checklist into the pipeline.
 * Runs on every lead's website during preflight.
 * Uses Playwright for real browser rendering (catches JS-rendered content).
 *
 * Based on: skills/seo/ (on-page, technical, schema, local, keywords)
 *           skills/seo-audit/ (structured checklist)
 */

export interface SEOAuditResult {
  // On-page
  hasTitle: boolean;
  titleLength: number;
  titleText: string;
  hasMetaDescription: boolean;
  metaDescLength: number;
  metaDescText: string;
  hasH1: boolean;
  h1Text: string;
  headingCount: number;
  imagesWithoutAlt: number;
  totalImages: number;

  // Contact Friction
  hasPhone: boolean;
  hasEmail: boolean;
  hasBooking: boolean;
  hasAddress: boolean;
  contactFrictionScore: number;

  // Technical
  isHttps: boolean;
  hasViewport: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasCanonical: boolean;

  // Schema
  hasSchema: boolean;
  schemaTypes: string[];
  hasLocalBusinessSchema: boolean;
  hasFAQSchema: boolean;

  // AI-specific
  hasLlmsTxt: boolean;
  llmsTxtContent: string | null;

  // Content
  wordCount: number;
  contentQuality: "high" | "medium" | "low";
  hasInternalLinks: boolean;
  hasExternalLinks: boolean;

  // Trust Signal Proximity
  trustSignalsNearCTA: boolean;
  trustProximityScore: number;

  // Scores
  overallScore: number; // 0-100
  onPageScore: number;  // 0-100
  technicalScore: number;
  schemaScore: number;
  aiReadinessScore: number;

  // Issues found (for report)
  issues: SEOIssue[];
}

export interface SEOIssue {
  category: "critical" | "warning" | "opportunity";
  area: string;
  message: string;
  fixEffort: "low" | "medium" | "high";
}

/**
 * Run full SEO audit using Playwright browser scrape + HTML analysis
 */
export async function runSEOAudit(
  html: string,
  url: string,
  llmsTxtContent: string | null
): Promise<SEOAuditResult> {
  const issues: SEOIssue[] = [];

  // --- On-page checks ---
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleText = titleMatch?.[1]?.trim() || "";
  const hasTitle = titleText.length > 0;
  const titleLength = titleText.length;

  if (!hasTitle) {
    issues.push({ category: "critical", area: "On-Page", message: "Missing title tag", fixEffort: "low" });
  } else if (titleLength < 30 || titleLength > 60) {
    issues.push({ category: "warning", area: "On-Page", message: `Title tag is ${titleLength} chars (ideal: 50-60)`, fixEffort: "low" });
  }

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const metaDescText = metaDescMatch?.[1]?.trim() || "";
  const hasMetaDescription = metaDescText.length > 0;
  const metaDescLength = metaDescText.length;

  if (!hasMetaDescription) {
    issues.push({ category: "critical", area: "On-Page", message: "Missing meta description", fixEffort: "low" });
  } else if (metaDescLength < 120 || metaDescLength > 160) {
    issues.push({ category: "warning", area: "On-Page", message: `Meta description is ${metaDescLength} chars (ideal: 150-160)`, fixEffort: "low" });
  }

  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const h1Text = h1Matches[0]?.replace(/<[^>]+>/g, "").trim() || "";

  if (!hasH1) {
    issues.push({ category: "critical", area: "On-Page", message: "Missing H1 tag", fixEffort: "low" });
  } else if (h1Matches.length > 1) {
    issues.push({ category: "warning", area: "On-Page", message: `Multiple H1 tags found (${h1Matches.length})`, fixEffort: "low" });
  }

  const allHeadings = html.match(/<h[1-6][^>]*>/gi) || [];
  const headingCount = allHeadings.length;

  // Image alt text check
  const allImages = html.match(/<img[^>]+>/gi) || [];
  const totalImages = allImages.length;
  const imagesWithAlt = allImages.filter(img => /alt=["'][^"']+["']/i.test(img) && !/alt=[""]["']/i.test(img)).length;
  const imagesWithoutAlt = totalImages - imagesWithAlt;

  if (imagesWithoutAlt > 5) {
    issues.push({ category: "warning", area: "On-Page", message: `${imagesWithoutAlt} images missing alt text`, fixEffort: "medium" });
  }

  // --- Contact Friction Checks ---
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const bookingKeywords = /book(?:ing)?\s*(?:now|online|appointment|call|a\s+visit)/i;
  const addressKeywords = /address|location|visit\s+us|find\s+us/i;

  const hasPhone = phoneRegex.test(html);
  const hasEmail = emailRegex.test(html);
  const hasBooking = bookingKeywords.test(html);
  const hasAddress = addressKeywords.test(html);

  let contactFrictionScore = 0;
  if (hasPhone) contactFrictionScore += 25;
  if (hasEmail) contactFrictionScore += 25;
  if (hasBooking) contactFrictionScore += 25;
  if (hasAddress) contactFrictionScore += 25;

  if (!hasPhone) issues.push({ category: "critical", area: "Contact", message: "No phone number found — high lead friction", fixEffort: "low" });
  if (!hasEmail) issues.push({ category: "warning", area: "Contact", message: "No email address found", fixEffort: "low" });
  if (!hasBooking) issues.push({ category: "opportunity", area: "Contact", message: "No explicit 'Book Appointment' CTA found", fixEffort: "medium" });

  // --- Technical checks ---
  const isHttps = url.startsWith("https://");
  if (!isHttps) {
    issues.push({ category: "critical", area: "Technical", message: "Site not using HTTPS", fixEffort: "medium" });
  }

  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  if (!hasViewport) {
    issues.push({ category: "critical", area: "Technical", message: "Missing viewport meta tag (mobile-friendly)", fixEffort: "low" });
  }

  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);

  // robots.txt and sitemap — checked separately via fetch
  let hasRobotsTxt = false;
  let hasSitemap = false;
  try {
    const robotsUrl = new URL("/robots.txt", url).href;
    const robotsRes = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
    if (robotsRes.ok) {
      hasRobotsTxt = true;
      const robotsTxt = await robotsRes.text();
      if (robotsTxt.toLowerCase().includes("sitemap")) {
        hasSitemap = true;
      }
    }
  } catch {}

  if (!hasRobotsTxt) {
    issues.push({ category: "warning", area: "Technical", message: "No robots.txt found", fixEffort: "low" });
  }
  if (!hasSitemap) {
    issues.push({ category: "opportunity", area: "Technical", message: "No sitemap reference in robots.txt", fixEffort: "low" });
  }

  // --- Schema checks ---
  const schemaBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const hasSchema = schemaBlocks.length > 0;
  const schemaTypes: string[] = [];
  let hasLocalBusinessSchema = false;
  let hasFAQSchema = false;

  for (const block of schemaBlocks) {
    try {
      const jsonStr = block.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
      const parsed = JSON.parse(jsonStr);
      const types = Array.isArray(parsed) ? parsed.map((p: any) => p["@type"]) : [parsed["@type"]].filter(Boolean);
      schemaTypes.push(...types);
      if (types.some((t: string) => t === "LocalBusiness" || t === "AutoDealer" || t === "Restaurant" || t === "TouristAttraction" || t === "Store")) {
        hasLocalBusinessSchema = true;
      }
      if (types.some((t: string) => t === "FAQPage")) {
        hasFAQSchema = true;
      }
    } catch {}
  }

  if (!hasSchema) {
    issues.push({ category: "warning", area: "Schema", message: "No structured data (JSON-LD) found", fixEffort: "medium" });
  } else if (!hasLocalBusinessSchema) {
    issues.push({ category: "opportunity", area: "Schema", message: `Has schema but missing LocalBusiness type (found: ${schemaTypes.join(", ")})`, fixEffort: "medium" });
  }
  if (!hasFAQSchema) {
    issues.push({ category: "opportunity", area: "Schema", message: "No FAQ schema — missing CTR boost opportunity", fixEffort: "medium" });
  }

  // --- AI-specific ---
  const hasLlmsTxt = llmsTxtContent !== null && llmsTxtContent.length > 0;
  if (!hasLlmsTxt) {
    issues.push({ category: "warning", area: "AI Readiness", message: "No llms.txt file — AI crawlers have no structured overview of your business", fixEffort: "low" });
  }

  // --- Content analysis ---
  const strippedText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = strippedText.split(/\s+/).filter(w => w.length > 0).length;

  const contentQuality: "high" | "medium" | "low" =
    wordCount > 2000 ? "high" : wordCount > 800 ? "medium" : "low";

  if (wordCount < 500) {
    issues.push({ category: "warning", area: "Content", message: `Thin content: only ~${wordCount} words on page`, fixEffort: "medium" });
  }

  // Internal/external links
  const baseUrl = new URL(url).origin;
  const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["']/gi) || [];
  const hasInternalLinks = linkMatches.some(link => {
    const href = link.match(/href=["']([^"']+)["']/)?.[1] || "";
    return href.startsWith("/") || href.startsWith(baseUrl);
  });
  const hasExternalLinks = linkMatches.some(link => {
    const href = link.match(/href=["']([^"']+)["']/)?.[1] || "";
    return href.startsWith("http") && !href.startsWith(baseUrl);
  });

  if (!hasInternalLinks) {
    issues.push({ category: "warning", area: "Content", message: "No internal links found — poor site structure for AI crawlers", fixEffort: "medium" });
  }

  // --- Calculate scores ---
  let onPageScore = 0;
  if (hasTitle) onPageScore += 20;
  if (titleLength >= 30 && titleLength <= 60) onPageScore += 10;
  if (hasMetaDescription) onPageScore += 20;
  if (metaDescLength >= 120 && metaDescLength <= 160) onPageScore += 10;
  if (hasH1) onPageScore += 15;
  if (h1Matches.length === 1) onPageScore += 5;
  if (imagesWithoutAlt === 0 && totalImages > 0) onPageScore += 10;
  else if (imagesWithoutAlt < 5) onPageScore += 5;
  if (headingCount >= 3) onPageScore += 10;

  let technicalScore = 0;
  if (isHttps) technicalScore += 20;
  if (hasViewport) technicalScore += 20;
  if (hasRobotsTxt) technicalScore += 15;
  if (hasSitemap) technicalScore += 15;
  if (hasCanonical) technicalScore += 15;
  if (hasInternalLinks) technicalScore += 15;

  let schemaScore = 0;
  if (hasSchema) schemaScore += 30;
  if (hasLocalBusinessSchema) schemaScore += 35;
  if (hasFAQSchema) schemaScore += 20;
  if (schemaTypes.length > 1) schemaScore += 15;

  let aiReadinessScore = 0;
  if (hasLlmsTxt) aiReadinessScore += 40;
  if (hasSchema) aiReadinessScore += 20;
  if (hasLocalBusinessSchema) aiReadinessScore += 15;
  if (contentQuality === "high") aiReadinessScore += 15;
  else if (contentQuality === "medium") aiReadinessScore += 8;
  if (hasRobotsTxt) aiReadinessScore += 10;

  const overallScore = Math.round(
    onPageScore * 0.25 + technicalScore * 0.25 + schemaScore * 0.25 + aiReadinessScore * 0.25
  );

  return {
    hasTitle, titleLength, titleText,
    hasMetaDescription, metaDescLength, metaDescText,
    hasH1, h1Text, headingCount,
    imagesWithoutAlt, totalImages,
    hasPhone, hasEmail, hasBooking, hasAddress,
    contactFrictionScore,
    isHttps, hasViewport, hasRobotsTxt, hasSitemap, hasCanonical,
    hasSchema, schemaTypes, hasLocalBusinessSchema, hasFAQSchema,
    hasLlmsTxt, llmsTxtContent,
    wordCount, contentQuality, hasInternalLinks, hasExternalLinks,
    trustSignalsNearCTA: false,
    trustProximityScore: 0,
    overallScore, onPageScore, technicalScore, schemaScore, aiReadinessScore,
    issues,
  };
}
