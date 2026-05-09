/**
 * Site Scraper Module
 *
 * Scrapes an entire website using Firecrawl API for full JS rendering.
 * Discovers all pages via sitemap/map, then scrapes the most important ones.
 * Falls back to basic fetch if Firecrawl is unavailable.
 *
 * Firecrawl handles:
 * - Full JavaScript rendering (Shopify, React, etc.)
 * - Clean markdown extraction
 * - Site-wide page discovery via /map endpoint
 *
 * Based on: skills/firecrawl/ + skills/playwright/ + skills/stealth-browser/
 * Used by: preflight scan, competitor deep dive
 */

export interface ScrapedSite {
  url: string;
  html: string;
  text: string;
  title: string;
  statusCode: number;
  renderMethod: "firecrawl" | "fetch";
  loadTimeMs: number;
  pagesScraped: number;
  pageUrls: string[];
  error?: string;
}

const MAX_PAGES = 15;
const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

/**
 * Main entry — crawl the full site using Firecrawl
 */
export async function scrapeSite(url: string): Promise<ScrapedSite> {
  const startTime = Date.now();
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (apiKey) {
    try {
      return await scrapeWithFirecrawl(normalizedUrl, apiKey);
    } catch (err) {
      console.warn(`[site-scraper] Firecrawl failed, falling back to fetch:`, err instanceof Error ? err.message : err);
    }
  }

  // Fallback: basic fetch crawl
  return scrapeWithFetchCrawl(normalizedUrl, startTime);
}

/**
 * Firecrawl-powered full site scrape
 * 1. Map the site to discover all pages
 * 2. Scrape priority pages (homepage + important sections)
 * 3. Combine all markdown into one rich text dataset
 */
async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<ScrapedSite> {
  const startTime = Date.now();
  const baseUrl = new URL(url).origin;
  const allText: string[] = [];
  const pageUrls: string[] = [];
  let mainTitle = "";
  let mainHtml = "";

  // Step 1: Scrape homepage with Firecrawl
  console.info(`[site-scraper] Firecrawl homepage: ${url}`);
  const homeResult = await firecrawlScrape(url, apiKey);
  if (!homeResult.success) {
    throw new Error(`Firecrawl homepage failed: ${homeResult.error || 'unknown'}`);
  }

  mainTitle = homeResult.title || "";
  mainHtml = homeResult.html || "";
  const homeMarkdown = homeResult.markdown || "";
  allText.push(homeMarkdown);
  pageUrls.push(url);

  // Step 2: Discover all pages via Firecrawl /map
  let discoveredPages: string[] = [];
  try {
    discoveredPages = await firecrawlMap(url, apiKey);
    console.info(`[site-scraper] Firecrawl map found ${discoveredPages.length} pages`);
  } catch {
    // If map fails, try to extract links from homepage HTML
    discoveredPages = extractInternalLinks(mainHtml, baseUrl);
    console.info(`[site-scraper] Map failed, extracted ${discoveredPages.length} links from homepage`);
  }

  // Step 3: Prioritize and scrape important pages
  const prioritized = prioritizePages(discoveredPages, url);
  const pagesToScrape = prioritized.slice(0, MAX_PAGES);

  // Scrape pages in parallel batches of 3
  const batchSize = 3;
  for (let i = 0; i < pagesToScrape.length; i += batchSize) {
    const batch = pagesToScrape.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(pageUrl => firecrawlScrape(pageUrl, apiKey))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled" && result.value.success && result.value.markdown) {
        const md = result.value.markdown;
        if (md.length > 50) { // Skip near-empty pages
          allText.push(md);
          pageUrls.push(batch[j]);
        }
      }
    }
  }

  const combinedText = allText.join("\n\n---\n\n");
  const elapsed = Date.now() - startTime;

  console.info(`[site-scraper] Firecrawl done: ${pageUrls.length} pages, ${combinedText.length} chars, ${elapsed}ms`);

  return {
    url,
    html: mainHtml,
    text: combinedText,
    title: mainTitle,
    statusCode: 200,
    renderMethod: "firecrawl",
    loadTimeMs: elapsed,
    pagesScraped: pageUrls.length,
    pageUrls,
  };
}

/**
 * Firecrawl /scrape endpoint — single page with full JS rendering
 */
async function firecrawlScrape(url: string, apiKey: string): Promise<{
  success: boolean;
  markdown?: string;
  html?: string;
  title?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${FIRECRAWL_API}/scrape`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 1000,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        markdown: data.data?.markdown || "",
        html: data.data?.html || "",
        title: data.data?.metadata?.title || "",
      };
    }
    return { success: false, error: data.error || "Firecrawl scrape failed" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

/**
 * Firecrawl /map endpoint — discover all pages on a site
 */
async function firecrawlMap(url: string, apiKey: string): Promise<string[]> {
  const res = await fetch(`${FIRECRAWL_API}/map`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  return data.links || [];
}

/**
 * Prioritize pages that reveal business type, services, pricing
 */
function prioritizePages(urls: string[], homeUrl: string): string[] {
  const priorityKeywords = [
    "about", "service", "faq", "question", "shop", "store", "product",
    "pricing", "contact", "team", "how-it-work", "process", "portfolio",
    "gallery", "work", "class", "course", "workshop", "booking", "schedule",
    "menu", "treatment", "offering", "catalog", "collection", "inventory",
    "testimonial", "review", "location", "direction", "upcoming",
  ];

  const scored = urls
    .filter(u => u !== homeUrl) // homepage already scraped
    .map(url => {
      const lower = url.toLowerCase();
      let score = 0;
      for (const kw of priorityKeywords) {
        if (lower.includes(kw)) score += 10;
      }
      // Prefer shorter paths (top-level pages over deep product pages)
      const segments = new URL(url).pathname.split("/").filter(Boolean).length;
      score += Math.max(0, 4 - segments);
      return { url, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.url);
}

/**
 * Extract internal links from HTML (fallback when /map fails)
 */
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        href.startsWith("javascript:") || href.startsWith("data:")) continue;

    try {
      const fullUrl = new URL(href, baseUrl).href;
      if (fullUrl.startsWith(baseUrl)) {
        links.add(fullUrl.split("#")[0].replace(/\/$/, ""));
      }
    } catch { continue; }
  }

  return [...links];
}

/**
 * Fallback: basic fetch-based crawl (no JS rendering)
 */
async function scrapeWithFetchCrawl(url: string, startTime: number): Promise<ScrapedSite> {
  const baseUrl = new URL(url).origin;
  const allText: string[] = [];
  const pageUrls: string[] = [];
  let mainTitle = "";
  let mainStatus = 200;

  // Homepage
  const homePage = await fetchSinglePage(url);
  mainTitle = homePage.title;
  mainStatus = homePage.statusCode;
  allText.push(homePage.text);
  pageUrls.push(url);

  // Discover and crawl pages
  const links = extractInternalLinks(homePage.html, baseUrl);
  const prioritized = prioritizePages(links, url).slice(0, MAX_PAGES);

  for (const pageUrl of prioritized) {
    const page = await fetchSinglePage(pageUrl);
    if (page.text.length > 50 && page.statusCode === 200) {
      allText.push(page.text);
      pageUrls.push(pageUrl);
    }
  }

  return {
    url,
    html: homePage.html,
    text: allText.join("\n\n---\n\n"),
    title: mainTitle,
    statusCode: mainStatus,
    renderMethod: "fetch",
    loadTimeMs: Date.now() - startTime,
    pagesScraped: pageUrls.length,
    pageUrls,
  };
}

async function fetchSinglePage(url: string): Promise<{ html: string; text: string; title: string; statusCode: number }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    const html = await res.text();
    const text = stripHtml(html);
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "";
    return { html, text, title, statusCode: res.status };
  } catch {
    return { html: "", text: "", title: "", statusCode: 0 };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch llms.txt content for a site
 */
export async function fetchLlmsTxt(siteUrl: string): Promise<string | null> {
  try {
    const llmsUrl = `${siteUrl.replace(/\/$/, "")}/llms.txt`;
    const res = await fetch(llmsUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) return await res.text();
  } catch {}
  return null;
}
