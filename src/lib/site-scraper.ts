/**
 * Site Scraper Module
 *
 * Uses Playwright (headless browser) to scrape full rendered HTML.
 * Falls back to fetch if Playwright unavailable.
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
  error?: string;
}

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
 * Scrape a website using Playwright for full JS rendering
 * Falls back to basic fetch if Playwright unavailable
 */
export async function scrapeSite(url: string, options?: {
  waitFor?: number;
  screenshot?: boolean;
  timeout?: number;
}): Promise<ScrapedSite> {
  const startTime = Date.now();
  const timeout = options?.timeout || 15000;
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  // Try Playwright first for JS-rendered content
  if (isPlaywrightAvailable()) {
    try {
      return await scrapeWithPlaywright(normalizedUrl, options);
    } catch (err) {
      console.warn(`[site-scraper] Playwright failed for ${url}, falling back to fetch:`, err instanceof Error ? err.message : err);
    }
  }

  // Fallback to basic fetch
  return scrapeWithFetch(normalizedUrl, startTime);
}

/**
 * Scrape using Playwright — gets fully rendered HTML including JS content
 */
async function scrapeWithPlaywright(
  url: string,
  options?: { waitFor?: number; screenshot?: boolean }
): Promise<ScrapedSite> {
  const startTime = Date.now();
  const waitForMs = options?.waitFor || 2000;

  // Use Playwright via script — more reliable than MCP in server context
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
  } catch (e) {
    status = 0;
  }
  
  await page.waitForTimeout(${waitForMs});
  
  const html = await page.content();
  const title = await page.title();
  
  let screenshot = null;
  ${options?.screenshot ? "screenshot = (await page.screenshot({ fullPage: false })).toString('base64');" : ""}
  
  await browser.close();
  
  const result = { html, title, statusCode: status, screenshot, renderMethod: 'playwright' };
  process.stdout.write(JSON.stringify(result));
})();
`;

  try {
    const output = execSync(`node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      timeout: 30000,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large pages
    });

    const result = JSON.parse(output);
    const text = stripHtml(result.html);

    return {
      url,
      html: result.html,
      text,
      title: result.title || "",
      statusCode: result.statusCode,
      renderMethod: "playwright",
      screenshot: result.screenshot || undefined,
      loadTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    throw new Error(`Playwright scrape failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * Fallback: basic HTTP fetch (no JS rendering)
 */
async function scrapeWithFetch(url: string, startTime: number): Promise<ScrapedSite> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });

    const html = await res.text();
    const text = stripHtml(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";

    return {
      url,
      html,
      text,
      title,
      statusCode: res.status,
      renderMethod: "fetch",
      loadTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      url,
      html: "",
      text: "",
      title: "",
      statusCode: 0,
      renderMethod: "fetch",
      loadTimeMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Unknown error",
    };
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
