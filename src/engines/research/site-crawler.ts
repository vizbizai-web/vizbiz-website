import type { CrawledPageEvidence, WebsiteCrawlEvidence } from "./business-intelligence-types";
import { extractEvidenceFromPages, extractTermsFromPage } from "./evidence-extractor";

const USER_AGENT = "VizBizBot/1.0 (+https://vizbiz.ai)";
const DEFAULT_PATHS = ["/services", "/service", "/about", "/contact", "/faq", "/locations", "/products", "/menu", "/pricing"];
const LINK_PRIORITY = /(service|about|contact|faq|location|product|menu|pricing|tax|account|bookkeeping|landscap|lawn|dental|roof|plumb|hvac)/i;

export interface CrawlOptions {
  maxPages?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export async function crawlWebsiteEvidence(websiteUrl: string, options: CrawlOptions = {}): Promise<WebsiteCrawlEvidence> {
  const maxPages = options.maxPages ?? 10;
  const timeoutMs = options.timeoutMs ?? 8_000;
  const fetchImpl = options.fetchImpl ?? fetch;
  const base = normalizeUrl(websiteUrl);
  const domain = new URL(base).hostname.replace(/^www\./, "");
  const pages: CrawledPageEvidence[] = [];
  const queued = new Set<string>([base]);
  const queue = [base];

  while (queue.length && pages.length < maxPages) {
    const url = queue.shift() as string;
    const page = await fetchPageEvidence(url, { fetchImpl, timeoutMs });
    pages.push(page);
    if (pages.length === 1) {
      for (const link of selectInternalLinks(base, page.bodyText, page.url, page.fetched ? page : null)) {
        if (!queued.has(link) && queue.length + pages.length < maxPages) {
          queued.add(link);
          queue.push(link);
        }
      }
      for (const path of DEFAULT_PATHS) {
        const link = new URL(path, base).toString();
        if (!queued.has(link) && queue.length + pages.length < maxPages) {
          queued.add(link);
          queue.push(link);
        }
      }
    }
  }

  return extractEvidenceFromPages(domain, pages);
}

export async function fetchPageEvidence(url: string, options: Required<Pick<CrawlOptions, "fetchImpl" | "timeoutMs">>): Promise<CrawledPageEvidence> {
  try {
    const response = await fetchWithTimeout(url, options.fetchImpl, options.timeoutMs);
    if (!response.ok) return emptyPage(url, `HTTP ${response.status}`);
    const html = await response.text();
    return parseHtmlPage(url, html, true, null);
  } catch (error) {
    return emptyPage(url, error instanceof Error ? error.message : "Fetch failed");
  }
}

export function parseHtmlPage(url: string, html: string, fetched = true, error: string | null = null): CrawledPageEvidence {
  const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, (script) => /application\/ld\+json/i.test(script) ? script : " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const bodyText = decodeHtml(cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  const page: CrawledPageEvidence = {
    url,
    title: stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    metaDescription: stripTags(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ?? ""),
    h1: stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ""),
    h2s: matchAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags).filter(Boolean).slice(0, 12),
    schemaTypes: unique(matchAll(html, /"@type"\s*:\s*"([^"]+)"/gi)).slice(0, 12),
    servicePhrases: [],
    productPhrases: [],
    locationPhrases: [],
    customerTypePhrases: [],
    faqQuestions: extractFaqQuestions(html, bodyText),
    ctaLanguage: matchAll(html, /<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi).map(stripTags).filter((text) => /contact|call|book|quote|schedule|get started/i.test(text)).slice(0, 8),
    reviewSnippets: bodyText.match(/[^.?!]*(?:review|testimonial|rated|stars)[^.?!]*[.?!]/gi)?.slice(0, 5) ?? [],
    discoveredLinks: matchAll(html, /<a[^>]+href=["']([^"']+)["']/gi).filter((href) => !/^(mailto:|tel:|#)/i.test(href)).slice(0, 40),
    bodyText,
    fetched,
    error,
  };
  page.servicePhrases = extractTermsFromPage(page);
  return page;
}

function selectInternalLinks(base: string, _bodyText: string, pageUrl: string, page: CrawledPageEvidence | null) {
  if (!page) return [];
  return page.discoveredLinks
    .map((href) => absolutizeInternalLink(href, base, pageUrl))
    .filter((href): href is string => Boolean(href))
    .filter((href) => LINK_PRIORITY.test(href));
}

function absolutizeInternalLink(href: string, base: string, pageUrl: string) {
  try {
    const url = new URL(href, pageUrl);
    const baseHost = new URL(base).hostname.replace(/^www\./, "");
    if (url.hostname.replace(/^www\./, "") !== baseHost) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, fetchImpl: typeof fetch, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { headers: { "user-agent": USER_AGENT }, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function emptyPage(url: string, error: string): CrawledPageEvidence {
  return { url, title: "", metaDescription: "", h1: "", h2s: [], schemaTypes: [], servicePhrases: [], productPhrases: [], locationPhrases: [], customerTypePhrases: [], faqQuestions: [], ctaLanguage: [], reviewSnippets: [], discoveredLinks: [], bodyText: "", fetched: false, error };
}

function normalizeUrl(url: string) {
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const parsed = new URL(normalized);
  parsed.hash = "";
  return parsed.toString();
}

function matchAll(text: string, regex: RegExp) {
  return Array.from(text.matchAll(regex), (match) => match[1] ?? "");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function extractFaqQuestions(html: string, bodyText: string) {
  const headingQuestions = matchAll(html, /<h[23][^>]*>\s*([^<]*\?)\s*<\/h[23]>/gi).map(stripTags);
  const textQuestions = Array.from(bodyText.matchAll(/\b((?:who|what|when|where|why|how|do|does|can|should)[^?]{8,120}\?)/gi), (match) => match[1].trim());
  return unique([...headingQuestions, ...textQuestions]).slice(0, 12);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
