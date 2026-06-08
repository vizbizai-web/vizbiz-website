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

// -- Deep Page Intelligence --

export interface PageIntelligence {
  // Social links from <a> tags
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
  };

  // Contact info
  contact: {
    emails: string[];
    phones: string[];
    address: string | null;
  };

  // Schema.org structured data from <script type="application/ld+json">
  schemaData: {
    types: string[];
    name: string | null;
    address: string | null;
    phone: string | null;
    aggregateRating: { ratingValue: number | null; reviewCount: number | null } | null;
    sameAs: string[];
    rawJson: any[];
  };

  // Open Graph / Twitter Card meta
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
    locale: string | null;
    siteName: string | null;
  };

  // Google Business Profile link or embed
  googleBusiness: {
    url: string | null;
    placeId: string | null;
  };

  // Navigation links (from <nav> and <footer>)
  navigationLinks: {
    href: string;
    text: string;
  }[];

  // Fonts used
  fonts: string[];

  // Meta tags
  meta: {
    title: string;
    description: string;
    keywords: string;
    canonical: string | null;
    robots: string | null;
    htmlLang: string;
  };
}

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
  intelligence?: PageIntelligence;
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

  // Step 1b: Fetch raw HTML for intelligence extraction (Firecrawl sanitizes links/schema)
  let rawHtml = mainHtml;
  try {
    const rawRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    if (rawRes.ok) {
      const fetched = await rawRes.text();
      if (fetched.length > mainHtml.length * 0.5) {
        rawHtml = fetched;
        console.info(`[site-scraper] Raw fetch: ${fetched.length} chars (vs Firecrawl ${mainHtml.length})`);
      }
    }
  } catch { /* non-critical, use Firecrawl HTML */ }

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

  // Extract deep intelligence from homepage HTML
  // Extract intelligence from BOTH sources: raw HTML has meta/schema, Firecrawl has rendered social links
  const rawIntelligence = rawHtml ? extractPageIntelligence(rawHtml, url) : undefined;
  const renderedIntelligence = mainHtml && mainHtml !== rawHtml ? extractPageIntelligence(mainHtml, url) : undefined;
  const intelligence = mergeIntelligence(rawIntelligence, renderedIntelligence);
  if (intelligence) {
    console.info(`[site-scraper] Intelligence: IG=${intelligence.socialLinks.instagram || 'none'}, FB=${intelligence.socialLinks.facebook || 'none'}, schema=${intelligence.schemaData.types.join(',') || 'none'}, emails=${intelligence.contact.emails.length}, navLinks=${intelligence.navigationLinks.length}`);
  }

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
    intelligence,
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
        onlyMainContent: false,
        waitFor: 3000,
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

  // Extract deep intelligence from homepage HTML
  const intelligence = homePage.html ? extractPageIntelligence(homePage.html, url) : undefined;

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
    intelligence,
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
 * Extract deep intelligence from raw HTML — pure function, no network calls.
 * Pulls social links, contact info, schema.org, OG tags, Google Business,
 * navigation structure, fonts, and meta tags.
 */
export function extractPageIntelligence(html: string, url: string): PageIntelligence {
  // -- Social Links --
  const socialLinks = extractSocialLinks(html);

  // -- Contact Info --
  const contact = extractContactInfo(html);

  // -- Schema.org --
  const schemaData = extractSchemaData(html);

  // -- Open Graph / Twitter Card --
  const openGraph = extractOpenGraph(html);

  // -- Google Business Profile --
  const googleBusiness = extractGoogleBusiness(html);

  // -- Navigation Links --
  const navigationLinks = extractNavigationLinks(html);

  // -- Fonts --
  const fonts = extractFonts(html);

  // -- Meta Tags --
  const meta = extractMeta(html);

  // -- Enrich contact address from schema if not found in HTML --
  if (!contact.address && schemaData.address) {
    contact.address = schemaData.address;
  }

  // -- Enrich social links from schema sameAs --
  if (schemaData.sameAs.length > 0) {
    for (const link of schemaData.sameAs) {
      const lower = link.toLowerCase();
      if (!socialLinks.instagram && lower.includes('instagram.com')) socialLinks.instagram = link;
      if (!socialLinks.facebook && lower.includes('facebook.com')) socialLinks.facebook = link;
      if (!socialLinks.linkedin && lower.includes('linkedin.com')) socialLinks.linkedin = link;
      if (!socialLinks.twitter && (lower.includes('twitter.com') || lower.includes('x.com'))) socialLinks.twitter = link;
      if (!socialLinks.tiktok && lower.includes('tiktok.com')) socialLinks.tiktok = link;
      if (!socialLinks.youtube && lower.includes('youtube.com')) socialLinks.youtube = link;
    }
  }

  return { socialLinks, contact, schemaData, openGraph, googleBusiness, navigationLinks, fonts, meta };
}

/**
 * Merge intelligence from raw HTML (meta, schema) and rendered HTML (social links).
 * Rendered wins for social/links, raw wins for meta/schema/OG.
 */
function mergeIntelligence(raw?: PageIntelligence, rendered?: PageIntelligence): PageIntelligence | undefined {
  if (!raw && !rendered) return undefined;
  if (!raw) return rendered;
  if (!rendered) return raw;

  // Social links: prefer rendered (JS-loaded links), fall back to raw
  const socialLinks = { ...raw.socialLinks };
  for (const [k, v] of Object.entries(rendered.socialLinks)) {
    if (v && !(socialLinks as any)[k]) (socialLinks as any)[k] = v;
  }

  // Nav links: prefer rendered (more complete after JS)
  const navigationLinks = rendered.navigationLinks.length > raw.navigationLinks.length ? rendered.navigationLinks : raw.navigationLinks;

  // Schema: prefer whichever found more types
  const schemaData = raw.schemaData.types.length >= rendered.schemaData.types.length ? raw.schemaData : rendered.schemaData;

  // OG: prefer raw (usually has better OG tags in static HTML)
  const og = raw.openGraph;
  // But fill in from rendered if raw was empty
  const openGraph = {
    title: og.title || rendered.openGraph.title,
    description: og.description || rendered.openGraph.description,
    image: og.image || rendered.openGraph.image,
    type: og.type || rendered.openGraph.type,
    locale: og.locale || rendered.openGraph.locale,
    siteName: og.siteName || rendered.openGraph.siteName,
  };

  // Contact: merge both, prefer raw for emails (mailto:)
  const emails = [...new Set([...raw.contact.emails, ...rendered.contact.emails])];
  const phones = [...new Set([...raw.contact.phones, ...rendered.contact.phones])];
  const contact = {
    emails,
    phones,
    address: raw.contact.address || rendered.contact.address,
  };

  // Google Business: prefer whichever found something
  const googleBusiness = raw.googleBusiness.url ? raw.googleBusiness : rendered.googleBusiness;

  // Fonts: merge
  const fonts = [...new Set([...raw.fonts, ...rendered.fonts])];

  // Meta: prefer raw
  const meta = raw.meta.title ? raw.meta : rendered.meta;

  return { socialLinks, contact, schemaData, openGraph, googleBusiness, navigationLinks, fonts, meta };
}

// ============================================================
// Private extraction helpers
// ============================================================

function extractSocialLinks(html: string): PageIntelligence['socialLinks'] {
  const result: PageIntelligence['socialLinks'] = {
    instagram: null, facebook: null, linkedin: null,
    twitter: null, tiktok: null, youtube: null,
  };

  // Extract all <a> href values
  const hrefs: string[] = [];
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = aRegex.exec(html)) !== null) hrefs.push(m[1]);

  for (const href of hrefs) {
    try {
      const decoded = decodeURIComponent(href).toLowerCase();

      if (!result.instagram && /instagram\.com\/[^\/]+/.test(decoded)) {
        if (!/instagram\.com\/(p\/|explore\/|reel\/|stories\/)/.test(decoded)) {
          const match = decoded.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
          if (match) result.instagram = normalizeUrl(href);
        }
      }

      if (!result.facebook && /facebook\.com\/[^\/]+/.test(decoded)) {
        if (!/facebook\.com\/(sharer|sharer\.php|plugins|login|watch)/.test(decoded)) {
          const match = decoded.match(/facebook\.com\/([a-zA-Z0-9_.]+)/);
          if (match) result.facebook = normalizeUrl(href);
        }
      }

      if (!result.linkedin && /linkedin\.com\/(company|in)\//.test(decoded)) {
        result.linkedin = normalizeUrl(href);
      }

      if (!result.twitter && (/twitter\.com\/[^\/]+/.test(decoded) || /x\.com\/[^\/]+/.test(decoded))) {
        if (!/twitter\.com\/(intent|share|home|i\/)/.test(decoded) && !/x\.com\/(intent|share|home|i\/)/.test(decoded)) {
          result.twitter = normalizeUrl(href);
        }
      }

      if (!result.tiktok && /tiktok\.com\/@[^\/]+/.test(decoded)) {
        result.tiktok = normalizeUrl(href);
      }

      if (!result.youtube && /youtube\.com\/(channel|c|@)[^\/?]+/.test(decoded)) {
        result.youtube = normalizeUrl(href);
      }
    } catch { /* skip malformed URLs */ }
  }

  return result;
}

function extractContactInfo(html: string): PageIntelligence['contact'] {
  const emails = new Set<string>();
  const phones = new Set<string>();

  // mailto: links
  const mailtoRx = /mailto:([^\s"'?]+)/gi;
  let m;
  while ((m = mailtoRx.exec(html)) !== null) {
    const email = m[1].toLowerCase();
    if (email.includes('@') && !email.includes('{') && !email.includes('example')) emails.add(email);
  }

  // tel: links
  const telRx = /tel:([^\s"'?]+)/gi;
  while ((m = telRx.exec(html)) !== null) {
    phones.add(m[1].replace(/[^0-9+\-() ]/g, '').trim());
  }

  // Plain text email regex (strip HTML tags first for cleaner matching)
  const strippedText = html.replace(/<[^>]+>/g, ' ');
  const emailRx = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((m = emailRx.exec(strippedText)) !== null) {
    const email = m[0].toLowerCase();
    if (!email.includes('example') && !email.includes('sentry') && !email.includes('wixpress') && !email.includes('yourstore')) emails.add(email);
  }

  // Plain text phone regex
  const phoneRx = /(?:\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  while ((m = phoneRx.exec(strippedText)) !== null) {
    const phone = m[0].trim();
    if (phone.replace(/[^0-9]/g, '').length >= 7 && phone.replace(/[^0-9]/g, '').length <= 15) phones.add(phone);
  }

  // Address from <address> tag
  let address: string | null = null;
  const addrMatch = html.match(/<address[^>]*>([^<]+)<\/address>/i);
  if (addrMatch) address = addrMatch[1].trim();

  return { emails: [...emails], phones: [...phones], address };
}

function extractSchemaData(html: string): PageIntelligence['schemaData'] {
  const types: string[] = [];
  let name: string | null = null;
  let address: string | null = null;
  let phone: string | null = null;
  let aggregateRating: { ratingValue: number | null; reviewCount: number | null } | null = null;
  const sameAs: string[] = [];
  const rawJson: any[] = [];

  // Find all LD+JSON blocks
  const blockRx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = blockRx.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      // Handle single objects and @graph arrays
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        rawJson.push(item);

        if (item['@type']) {
          const t = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          types.push(...t);
        }
        if (!name && item.name) name = item.name;
        if (!address && item.address) {
          address = typeof item.address === 'string' ? item.address :
            typeof item.address === 'object' ? [item.address.streetAddress, item.address.addressLocality, item.address.addressRegion, item.address.postalCode, item.address.addressCountry].filter(Boolean).join(', ') : null;
        }
        if (!phone && item.telephone) phone = item.telephone;
        if (!aggregateRating && item.aggregateRating) {
          aggregateRating = {
            ratingValue: typeof item.aggregateRating.ratingValue === 'number' ? item.aggregateRating.ratingValue : null,
            reviewCount: typeof item.aggregateRating.reviewCount === 'number' ? item.aggregateRating.reviewCount : null,
          };
        }
        if (Array.isArray(item.sameAs)) sameAs.push(...item.sameAs);
      }
    } catch { /* skip malformed JSON */ }
  }

  return { types: [...new Set(types)], name, address, phone, aggregateRating, sameAs: [...new Set(sameAs)], rawJson };
}

function extractOpenGraph(html: string): PageIntelligence['openGraph'] {
  const og: PageIntelligence['openGraph'] = { title: null, description: null, image: null, type: null, locale: null, siteName: null };

  // Match all og: meta tags
  const ogRx = /<meta[^>]+property=["']og:(\w+)["'][^>]+content=["']([^"']+)["']/gi;
  let m;
  while ((m = ogRx.exec(html)) !== null) {
    const [, prop, val] = m;
    if (prop === 'title' && !og.title) og.title = val;
    if (prop === 'description' && !og.description) og.description = val;
    if (prop === 'image' && !og.image) og.image = val;
    if (prop === 'type' && !og.type) og.type = val;
    if (prop === 'locale' && !og.locale) og.locale = val;
    if (prop === 'site_name' && !og.siteName) og.siteName = val;
  }

  // Also try content-before-property variant
  const ogRx2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:(\w+)["']/gi;
  while ((m = ogRx2.exec(html)) !== null) {
    const [, val, prop] = m;
    if (prop === 'title' && !og.title) og.title = val;
    if (prop === 'description' && !og.description) og.description = val;
    if (prop === 'image' && !og.image) og.image = val;
    if (prop === 'type' && !og.type) og.type = val;
    if (prop === 'locale' && !og.locale) og.locale = val;
    if (prop === 'site_name' && !og.siteName) og.siteName = val;
  }

  return og;
}

function extractGoogleBusiness(html: string): PageIntelligence['googleBusiness'] {
  let url: string | null = null;
  let placeId: string | null = null;

  // Direct GBM links
  const gbmMatch = html.match(/href=["']([^"']*(?:business\.google\.com|g\.page\/)[^"']*)["']/i);
  if (gbmMatch) url = gbmMatch[1];

  // Google Maps links with business name
  const mapsLinkMatch = html.match(/href=["']([^"']*google\.com\/maps[^"']*)["']/i);
  if (!url && mapsLinkMatch) url = mapsLinkMatch[1];

  // Google Maps embed iframes
  const embedMatch = html.match(/<iframe[^>]+src=["']([^"']*google\.com\/maps[^"']*)["']/i);
  if (embedMatch) {
    const src = embedMatch[1];
    if (!url) url = src;
    // Extract place_id or cid
    const placeIdMatch = src.match(/place_id[=:]([^&"']+)/);
    if (placeIdMatch) placeId = placeIdMatch[1];
    const cidMatch = src.match(/cid[=:]([^&"']+)/);
    if (cidMatch && !placeId) placeId = cidMatch[1];
  }

  return { url, placeId };
}

function extractNavigationLinks(html: string): PageIntelligence['navigationLinks'] {
  const links: { href: string; text: string }[] = [];

  // Extract content from <nav> and <footer> blocks
  const blockRx = /<(?:nav|footer)[^>]*>([\s\S]*?)<\/(?:nav|footer)>/gi;
  let blockMatch;
  while ((blockMatch = blockRx.exec(html)) !== null) {
    const block = blockMatch[1];
    const aRx = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let aMatch;
    while ((aMatch = aRx.exec(block)) !== null) {
      const href = aMatch[1];
      const text = aMatch[2].trim();
      if (text && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push({ href, text });
      }
    }
  }

  return links;
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>();

  // Google Fonts imports
  const gfontRx = /fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi;
  let m;
  while ((m = gfontRx.exec(html)) !== null) {
    const family = m[1].replace(/\+/g, ' ').split(':')[0].trim();
    if (family) fonts.add(family);
  }

  // Inline font-family declarations (top 10 unique)
  const ffRx = /font-family:\s*([^;}"']+)/gi;
  const seen = new Set<string>();
  while ((m = ffRx.exec(html)) !== null) {
    const families = m[1].split(',').map(f => f.trim().replace(/["']/g, ''));
    for (const f of families) {
      const lower = f.toLowerCase();
      // Skip generic families
      if (['sans-serif', 'serif', 'monospace', 'inherit', 'initial', 'unset', 'system-ui', '-apple-system'].includes(lower)) continue;
      if (!seen.has(lower)) {
        seen.add(lower);
        fonts.add(f);
        if (fonts.size >= 10) return [...fonts];
      }
    }
  }

  return [...fonts];
}

function extractMeta(html: string): PageIntelligence['meta'] {
  const getMeta = (attr: string, val: string): string | null => {
    const rx = new RegExp(`<meta[^>]+${attr}=["']${val}["'][^>]+content=["']([^"']+)["']`, 'i');
    const m = html.match(rx);
    if (m) return m[1];
    const rx2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${val}["']`, 'i');
    const m2 = html.match(rx2);
    return m2 ? m2[1] : null;
  };

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const htmlLang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1]?.trim() || '';

  return {
    title,
    description: getMeta('name', 'description') || '',
    keywords: getMeta('name', 'keywords') || '',
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    robots: getMeta('name', 'robots'),
    htmlLang,
  };
}

function normalizeUrl(href: string): string {
  try {
    // Decode, strip query params and fragments for clean social URLs
    const decoded = decodeURIComponent(href);
    if (decoded.startsWith('http')) return decoded.split('?')[0].split('#')[0].replace(/\/$/, '');
    if (decoded.startsWith('//')) return 'https:' + decoded.split('?')[0].split('#')[0].replace(/\/$/, '');
    return decoded.split('?')[0].split('#')[0].replace(/\/$/, '');
  } catch {
    return href;
  }
}

/**
 * Fetch llms.txt content for a site
 */
export async function fetchLlmsTxt(siteUrl: string): Promise<string | null> {
  try {
    const llmsUrl = `${siteUrl.replace(/\/$/, "")}/llms.txt`;
    const res = await fetch(llmsUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      const looksLikeHtml = /text\/html/i.test(contentType) || /^\s*<!doctype\s+html/i.test(text) || /^\s*<html[\s>]/i.test(text) || /<title[^>]*>/i.test(text.slice(0, 500));
      if (looksLikeHtml) return null;
      return text;
    }
  } catch {}
  return null;
}
