/**
 * Site Scraper Module
 *
 * Scrapes an entire website — homepage + all discoverable internal pages.
 * Uses Playwright (headless browser) when available for full JS rendering.
 * Falls back to basic fetch on serverless (Vercel).
 *
 * Crawl strategy:
 * 1. Fetch homepage HTML
 * 2. Extract internal links (same domain)
 * 3. Fetch sitemap.xml if available for complete page list
 * 4. Visit up to 15 internal pages (about, services, faq, shop, etc.)
 * 5. Combine all text into one rich dataset
 *
 * Based on: skills/playwright/ + skills/stealth-browser/
 * Used by: preflight scan, competitor deep dive
 */

import { execSync } from "child_process";

export interface ScrapedSite {
  url: string;
  html: string;
  text: string;
  title: string;
  statusCode: number;
  renderMethod: "playwright" | "fetch";
  screenshot?: string; // base64, if Playwright used
  loadTimeMs: number;
  pagesScraped: number;
  pageUrls: string[];
  error?: string;
}

const MAX_PAGES = 15;
const PAGE_TIMEOUT = 10000;

/**
 * Check if Playwright is available
 */
function isPlaywrightAvailable(): boolean {
  try {
    execSync("npx playwright --version", { stdio: "pipe", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Main entry point — crawls the entire site, not just the homepage
 */
export async function scrapeSite(url: string, options?: {
  waitFor?: number;
  screenshot?: boolean;
  timeout?: number;
}): Promise<ScrapedSite> {
  const startTime = Date.now();
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const baseUrl = new URL(normalizedUrl).origin;

  const allHtml: string[] = [];
  const allText: string[] = [];
  let mainTitle = "";
  let mainStatus = 200;
  let renderMethod: "playwright" | "fetch" = "fetch";
  const pageUrls: string[] = [];

  // Step 1: Scrape homepage
  console.info(`[site-scraper] Scraping homepage: ${normalizedUrl}`);
  const homePage = isPlaywrightAvailable()
    ? await scrapeSinglePagePlaywright(normalizedUrl).catch(() => null)
    : null;

  let homeHtml: string;
  if (homePage) {
    homeHtml = homePage.html;
    mainTitle = homePage.title;
    mainStatus = homePage.statusCode;
    renderMethod = "playwright";
  } else {
    const fetched = await scrapeSinglePageFetch(normalizedUrl);
    homeHtml = fetched.html;
    mainTitle = fetched.title;
    mainStatus = fetched.statusCode;
    renderMethod = "fetch";
  }

  allHtml.push(homeHtml);
  const homeText = stripHtml(homeHtml);
  allText.push(homeText);
  pageUrls.push(normalizedUrl);

  // Step 2: Discover internal links from homepage
  const internalLinks = extractInternalLinks(homeHtml, baseUrl);
  console.info(`[site-scraper] Found ${internalLinks.length} internal links on homepage`);

  // Step 3: Also check sitemap.xml for additional pages
  const sitemapLinks = await fetchSitemapUrls(baseUrl);
  const allDiscovered = [...new Set([...internalLinks, ...sitemapLinks])];
  console.info(`[site-scraper] Total discovered pages: ${allDiscovered.length} (incl. sitemap: ${sitemapLinks.length})`);

  // Prioritize important pages (about, services, faq, shop, etc.)
  const prioritized = prioritizePages(allDiscovered);

  // Step 4: Crawl discovered pages (up to MAX_PAGES)
  const pagesToCrawl = prioritized.slice(0, MAX_PAGES);
  let pagesScraped = 1; // homepage already counted

  for (const pageUrl of pagesToCrawl) {
    try {
      console.info(`[site-scraper] Crawling: ${pageUrl}`);
      const pageResult = await scrapeSinglePageFetch(pageUrl);
      if (pageResult.html && pageResult.statusCode === 200) {
        const pageText = stripHtml(pageResult.html);
        // Only include pages with meaningful content (>50 chars after stripping)
        if (pageText.length > 50) {
          allHtml.push(pageResult.html);
          allText.push(pageText);
          pageUrls.push(pageUrl);
          pagesScraped++;
        }
      }
    } catch {
      // Skip failed pages — non-blocking
    }
  }

  const combinedHtml = allHtml.join("\n<!-- PAGE BREAK -->\n");
  const combinedText = allText.join("\n\n---\n\n");

  console.info(`[site-scraper] Done: ${pagesScraped} pages scraped, ${combinedText.length} chars total text, ${Date.now() - startTime}ms`);

  return {
    url: normalizedUrl,
    html: combinedHtml,
    text: combinedText,
    title: mainTitle,
    statusCode: mainStatus,
    renderMethod,
    loadTimeMs: Date.now() - startTime,
    pagesScraped,
    pageUrls,
  };
}

/**
 * Extract internal links from HTML
 */
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1];

    // Skip anchors, mailto, tel, javascript, external
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        href.startsWith("javascript:") || href.startsWith("data:")) continue;

    // Normalize relative URLs
    try {
      const fullUrl = new URL(href, baseUrl).href;
      // Only same-domain links
      if (fullUrl.startsWith(baseUrl)) {
        // Strip anchors and trailing slashes for dedup
        const clean = fullUrl.split("#")[0].replace(/\/$/, "");
        links.add(clean);
      }
    } catch {
      continue;
    }
  }

  return [...links];
}

/**
 * Fetch URLs from sitemap.xml
 */
async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const urls: string[] = [];
  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const xml = await res.text();
      const locRegex = /<loc>([^<]+)<\/loc>/gi;
      let match;
      while ((match = locRegex.exec(xml)) !== null) {
        const url = match[1].trim();
        if (url.startsWith(baseUrl)) {
          urls.push(url.split("#")[0].replace(/\/$/, ""));
        }
      }
      console.info(`[site-scraper] Sitemap: found ${urls.length} URLs`);
    }
  } catch {
    // No sitemap — fine, we have homepage links
  }
  return urls;
}

/**
 * Prioritize pages that are most useful for understanding the business
 */
function prioritizePages(urls: string[]): string[] {
  const priorityKeywords = [
    "about", "service", "faq", "question", "shop", "store", "product",
    "pricing", "contact", "team", "how-it-work", "process", "portfolio",
    "gallery", "work", "class", "course", "workshop", "booking", "schedule",
    "menu", "treatment", "offering", "catalog", "collection", "inventory",
    "testimonial", "review", "location", "direction",
  ];

  const scored = urls.map(url => {
    const lower = url.toLowerCase();
    let score = 0;
    for (const kw of priorityKeywords) {
      if (lower.includes(kw)) score += 10;
    }
    // Slightly prefer shorter URLs (top-level pages)
    const pathSegments = new URL(url).pathname.split("/").filter(Boolean).length;
    score += Math.max(0, 4 - pathSegments);
    return { url, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.url);
}

/**
 * Scrape a single page with Playwright
 */
async function scrapeSinglePagePlaywright(url: string): Promise<{ html: string; title: string; statusCode: number }> {
  const script = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  let status = 200;
  try {
    const response = await page.goto('${url}', { waitUntil: 'networkidle', timeout: 15000 });
    status = response?.status() || 200;
  } catch (e) { status = 0; }
  await page.waitForTimeout(2000);
  const html = await page.content();
  const title = await page.title();
  await browser.close();
  process.stdout.write(JSON.stringify({ html, title, statusCode: status }));
})();
`;

  const output = execSync(`node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    timeout: 30000,
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });

  return JSON.parse(output);
}

/**
 * Scrape a single page with basic fetch
 */
async function scrapeSinglePageFetch(url: string): Promise<{ html: string; title: string; statusCode: number; text: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(PAGE_TIMEOUT),
      redirect: "follow",
    });

    const html = await res.text();
    const text = stripHtml(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";

    return { html, title, statusCode: res.status, text };
  } catch {
    return { html: "", title: "", statusCode: 0, text: "" };
  }
}

/**
 * Strip HTML tags to get plain text
 */
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
    if (res.ok) {
      return await res.text();
    }
  } catch {}
  return null;
}
