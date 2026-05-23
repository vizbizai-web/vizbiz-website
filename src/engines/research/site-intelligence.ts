import type { ClientInput, SeoSiteIntelligence } from "./types";

type CrawlTarget = {
  name: string;
  url: string;
  kind: "client" | "competitor";
};

type PageSignals = {
  name: string;
  url: string;
  kind: "client" | "competitor";
  fetched: boolean;
  title: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  schemaTypes: string[];
  wordCount: number;
  hasRobots: boolean;
  hasSitemap: boolean;
  hasLlmsTxt: boolean;
  hasAgentsMd: boolean;
  hasAgenticSitemap: boolean;
  hasUcpDiscovery: boolean;
  hasCanonical: boolean;
  hasContactPath: boolean;
  hasFaqPattern: boolean;
  serviceAreaMentions: number;
  socialProfiles: string[];
  evidence: string;
};

const USER_AGENT = "VizBizBot/1.0 (+https://vizbiz.ai)";
const FETCH_TIMEOUT_MS = 8_000;

export async function buildSeoSiteIntelligence(input: ClientInput): Promise<SeoSiteIntelligence> {
  const targets = crawlTargets(input);
  if (!targets.length) return emptyIntelligence("No client website or competitor websites were supplied.");

  const pages = await Promise.all(targets.map(fetchSignals));
  const client = pages.find((page) => page.kind === "client");
  const competitors = pages.filter((page) => page.kind === "competitor");

  if (!client) return emptyIntelligence("No client website URL was supplied.");

  const technicalChecks = buildTechnicalChecks(client);
  const contentBriefs = buildContentBriefs(client, competitors, input);
  const competitorFindings = buildCompetitorFindings(client, competitors);
  const automation = buildAutomationPlan(input, Boolean(competitors.length));
  const score = Math.round(
    Math.min(
      100,
      technicalChecks.filter((check) => check.passed).reduce((sum, check) => sum + check.points, 0) +
        Math.min(25, client.wordCount / 40) +
        Math.min(15, client.schemaTypes.length * 5) +
        Math.min(15, client.serviceAreaMentions * 5),
    ),
  );

  return {
    score,
    crawlSource: "built_in_fetch",
    generatedAt: new Date().toISOString(),
    target: publicSignals(client),
    competitors: competitors.map(publicSignals),
    technicalChecks,
    llmReadiness: buildLlmReadiness(client),
    contentBriefs,
    competitorFindings,
    automation,
    notes: [
      "SEO/site intelligence is deterministic and safe for the free mini report.",
      "Playwright/Scrapling/SEO Intel can enrich this later with rendered schema, screenshots, deeper crawling, and recurring competitor monitoring.",
    ],
  };
}

function crawlTargets(input: ClientInput): CrawlTarget[] {
  const targets: CrawlTarget[] = [];
  if (input.websiteUrl) targets.push({ name: input.name, url: input.websiteUrl, kind: "client" });
  for (const competitor of input.competitors?.slice(0, 2) ?? []) {
    if (competitor.websiteUrl) targets.push({ name: competitor.name, url: competitor.websiteUrl, kind: "competitor" });
  }
  return targets;
}

async function fetchSignals(target: CrawlTarget): Promise<PageSignals> {
  const url = normalizeUrl(target.url);
  try {
    const [pageResponse, robotsResponse, sitemapResponse, llmsResponse, agentsResponse, ucpResponse] = await Promise.allSettled([
      fetchWithTimeout(url),
      fetchWithTimeout(new URL("/robots.txt", url).toString()),
      fetchWithTimeout(new URL("/sitemap.xml", url).toString()),
      fetchWithTimeout(new URL("/llms.txt", url).toString()),
      fetchWithTimeout(new URL("/agents.md", url).toString()),
      fetchWithTimeout(new URL("/.well-known/ucp", url).toString()),
    ]);
    const response = pageResponse.status === "fulfilled" ? pageResponse.value : null;
    const html = response && response.ok ? await response.text() : "";
    const robotsText = robotsResponse.status === "fulfilled" && robotsResponse.value.ok ? await robotsResponse.value.text() : "";
    const sitemapText = sitemapResponse.status === "fulfilled" && sitemapResponse.value.ok ? await sitemapResponse.value.text() : "";
    return analyzePageSignals(target, url, html, {
      fetched: Boolean(response?.ok),
      hasRobots: robotsResponse.status === "fulfilled" && robotsResponse.value.ok,
      hasSitemap: sitemapResponse.status === "fulfilled" && sitemapResponse.value.ok,
      hasLlmsTxt: llmsResponse.status === "fulfilled" && llmsResponse.value.ok,
      hasAgentsMd: agentsResponse.status === "fulfilled" && agentsResponse.value.ok,
      hasAgenticSitemap: /sitemap_agentic|agents\.md|agentic/i.test(`${robotsText} ${sitemapText}`),
      hasUcpDiscovery: ucpResponse.status === "fulfilled" && ucpResponse.value.ok,
      evidence: response ? `${response.status} ${response.statusText}` : "Fetch failed",
    });
  } catch (error) {
    return analyzePageSignals(target, url, "", {
      fetched: false,
      hasRobots: false,
      hasSitemap: false,
      hasLlmsTxt: false,
      hasAgentsMd: false,
      hasAgenticSitemap: false,
      hasUcpDiscovery: false,
      evidence: error instanceof Error ? error.message : "Fetch failed",
    });
  }
}

function analyzePageSignals(
  target: CrawlTarget,
  url: string,
  html: string,
  status: { fetched: boolean; hasRobots: boolean; hasSitemap: boolean; hasLlmsTxt: boolean; hasAgentsMd: boolean; hasAgenticSitemap: boolean; hasUcpDiscovery: boolean; evidence: string },
): PageSignals {
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const normalizedText = decodeHtml(visibleText).replace(/\s+/g, " ").trim();
  const headings = matchAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags).filter(Boolean).slice(0, 8);
  const jsonLdBlocks = matchAll(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const schemaTypes = Array.from(new Set(jsonLdBlocks.flatMap((block) => matchAll(block, /"@type"\s*:\s*"([^"]+)"/gi)).slice(0, 8)));

  return {
    ...target,
    url,
    fetched: status.fetched,
    title: stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    metaDescription: stripTags(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? ""),
    h1: stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ""),
    h2s: headings,
    schemaTypes,
    wordCount: normalizedText.split(/\s+/).filter(Boolean).length,
    hasRobots: status.hasRobots,
    hasSitemap: status.hasSitemap,
    hasLlmsTxt: status.hasLlmsTxt,
    hasAgentsMd: status.hasAgentsMd,
    hasAgenticSitemap: status.hasAgenticSitemap,
    hasUcpDiscovery: status.hasUcpDiscovery,
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasContactPath: /href=["'][^"']*(contact|tel:|book|appointment|quote)/i.test(html) || /\b(contact|call|book|appointment|get a quote)\b/i.test(normalizedText),
    hasFaqPattern: /FAQPage|frequently asked|\bfaq\b|<h[23][^>]*>\s*(who|what|when|where|why|how|do|does|can|should)\b/i.test(html),
    serviceAreaMentions: countMentions(normalizedText, [target.name]),
    socialProfiles: extractSocialProfiles(html),
    evidence: status.evidence,
  };
}

function buildTechnicalChecks(client: PageSignals) {
  return [
    check("fetch", "Homepage fetchable", client.fetched, 10, client.evidence),
    check("robots", "robots.txt accessible", client.hasRobots, 8, client.hasRobots ? "robots.txt returned 2xx." : "robots.txt was not found or blocked."),
    check("sitemap", "XML sitemap accessible", client.hasSitemap, 10, client.hasSitemap ? "sitemap.xml returned 2xx." : "sitemap.xml was not found at the root."),
    check("canonical", "Canonical tag present", client.hasCanonical, 8, client.hasCanonical ? "Canonical link tag detected." : "No canonical tag detected in raw HTML."),
    check("schema", "JSON-LD schema present", client.schemaTypes.length > 0, 12, client.schemaTypes.length ? `Detected: ${client.schemaTypes.join(", ")}.` : "No raw JSON-LD schema detected."),
    check("title", "Title tag is usable", client.title.length >= 20 && client.title.length <= 70, 8, client.title || "Missing title."),
    check("meta_description", "Meta description is usable", client.metaDescription.length >= 70 && client.metaDescription.length <= 170, 8, client.metaDescription || "Missing meta description."),
    check("h1", "Clear H1 present", client.h1.length >= 8, 8, client.h1 || "Missing H1."),
    check("content_depth", "Homepage has enough crawlable text", client.wordCount >= 500, 8, `${client.wordCount} visible words detected.`),
    check("contact_path", "Contact/booking path is visible", client.hasContactPath, 8, client.hasContactPath ? "Contact/booking signal detected." : "No obvious contact/booking signal detected."),
    check("faq", "FAQ / answer-engine pattern present", client.hasFaqPattern, 10, client.hasFaqPattern ? "FAQ/question pattern detected." : "No FAQ/question-answer pattern detected."),
  ];
}

function buildLlmReadiness(client: PageSignals) {
  const checks = [
    llmCheck("crawlable", "Homepage crawlable by bots", client.fetched, client.fetched ? client.evidence : "Homepage could not be fetched."),
    llmCheck("robots", "robots.txt available", client.hasRobots, client.hasRobots ? "robots.txt is accessible." : "robots.txt was not found or blocked."),
    llmCheck("sitemap", "sitemap.xml available", client.hasSitemap, client.hasSitemap ? "sitemap.xml is accessible." : "sitemap.xml was not found at the root."),
    llmCheck("llms_txt", "llms.txt available", client.hasLlmsTxt, client.hasLlmsTxt ? "llms.txt is accessible for AI/LLM guidance." : "No /llms.txt file was detected."),
    llmCheck("agents_md", "agents.md available", client.hasAgentsMd, client.hasAgentsMd ? "agents.md is accessible for agent instructions." : "No /agents.md file was detected."),
    llmCheck("agentic_sitemap", "Agentic discovery referenced", client.hasAgenticSitemap, client.hasAgenticSitemap ? "robots/sitemap references agentic discovery or agent instructions." : "No agentic sitemap or agent-discovery reference was detected."),
    llmCheck("ucp", "Commerce-agent discovery available", client.hasUcpDiscovery, client.hasUcpDiscovery ? "/.well-known/ucp is accessible for commerce-agent discovery." : "No /.well-known/ucp commerce-agent discovery endpoint was detected."),
    llmCheck("schema", "Structured product/brand data", client.schemaTypes.length > 0, client.schemaTypes.length ? `Detected JSON-LD schema: ${client.schemaTypes.join(", ")}.` : "No raw JSON-LD schema was detected."),
    llmCheck("answer_content", "Answer-ready content", client.hasFaqPattern, client.hasFaqPattern ? "FAQ/question-answer patterns are visible." : "No FAQ/question-answer pattern was detected."),
  ];
  const passed = checks.filter((check) => check.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  const strengths = checks.filter((check) => check.passed).map((check) => check.label).slice(0, 5);
  const opportunities = checks.filter((check) => !check.passed).map((check) => check.evidence).slice(0, 5);

  return {
    score,
    band: score >= 75 ? "Strong" as const : score >= 45 ? "Building" as const : "Thin" as const,
    summary: score >= 75
      ? "The site has strong AI/agent readability foundations, but recommendation visibility still depends on product proof, schema depth, reviews, and comparison evidence."
      : score >= 45
        ? "The site has some AI-readable foundations, but needs stronger structured data, answer-ready content, and proof for AI systems to cite confidently."
        : "The site is not yet easy enough for AI systems and shopping agents to understand, cite, and recommend confidently.",
    checks,
    strengths,
    opportunities,
  };
}

function buildContentBriefs(client: PageSignals, competitors: PageSignals[], input: ClientInput) {
  const city = input.market ?? input.city;
  const service = input.primaryService ?? input.services?.[0] ?? input.businessType?.replace(/_/g, " ") ?? "local service";
  const competitorHeadings = competitors.flatMap((page) => page.h2s).filter(Boolean);
  const missingCompetitorThemes = competitorHeadings
    .filter((heading) => !client.h2s.some((own) => similarText(own, heading)))
    .slice(0, 4);

  const isProductBrand = /ecommerce|snack|skincare|product|brand/i.test(`${input.businessType ?? ""} ${input.primaryService ?? ""}`);

  const briefs = [
    {
      title: isProductBrand ? `${service}: AI-citable product/use-case page` : `${service} in ${city}: AI-citable service page`,
      intent: isProductBrand ? "High-intent product discovery and answer-engine citation" : "High-intent local discovery and answer-engine citation",
      recommendedSections: isProductBrand ? [
        `Who ${input.name} helps`,
        `Specific ${service} cravings, use cases, and buying questions solved`,
        "Ingredients, dietary fit, and safety proof",
        "Proof: reviews, certifications, retail availability, and case examples",
        "FAQ written as direct shopper question-and-answer blocks",
      ] : [
        `Who ${input.name} helps in ${city}`,
        `Specific ${service} problems solved`,
        "Pricing/process expectations",
        "Proof: reviews, credentials, case examples",
        "FAQ written as direct question-and-answer blocks",
      ],
      source: "seo-audit" as const,
    },
    {
      title: isProductBrand ? `${input.name} vs named product alternatives` : `${input.name} vs top local alternatives`,
      intent: "Competitor comparison and buyer decision support",
      recommendedSections: isProductBrand ? ["Where competitor brands win today", "Where this product is different", "Ingredient, review, and trust proof", "When to choose each option"] : ["Where competitors win today", "Where the business is different", "Review and trust proof", "When to choose each option"],
      source: "competitor-analysis" as const,
    },
  ];

  if (missingCompetitorThemes.length) {
    briefs.push({
      title: "Competitor-backed content gap update",
      intent: "Close topics competitors expose that the client homepage does not emphasize",
      recommendedSections: missingCompetitorThemes,
      source: "competitor-analysis" as const,
    });
  }

  return briefs;
}

function buildCompetitorFindings(client: PageSignals, competitors: PageSignals[]) {
  if (!competitors.length) {
    return [{ competitor: "Not supplied", finding: "Add two competitor websites to unlock side-by-side site/content gap evidence.", advantage: "unknown" as const }];
  }

  return competitors.map((competitor) => {
    const advantages = [];
    if (competitor.schemaTypes.length > client.schemaTypes.length) advantages.push("more schema coverage");
    if (competitor.wordCount > client.wordCount + 250) advantages.push("deeper crawlable homepage content");
    if (competitor.hasFaqPattern && !client.hasFaqPattern) advantages.push("stronger FAQ / answer-engine structure");
    if (competitor.h2s.length > client.h2s.length) advantages.push("more section-level topical coverage");

    return {
      competitor: competitor.name,
      finding: advantages.length ? `${competitor.name} appears stronger on ${advantages.join(", ")}.` : `${competitor.name} does not show a clear raw-HTML SEO advantage in this lightweight pass.`,
      advantage: advantages.length ? "competitor" as const : "client" as const,
    };
  });
}

function buildAutomationPlan(input: ClientInput, hasCompetitors: boolean) {
  return [
    {
      tool: "SEO Intel / seo-audit",
      use: "Run crawl, schema, heading, AEO/citability, and export-actions passes for the full paid report.",
      pipelineStage: "site_audit" as const,
    },
    {
      tool: "Playwright",
      use: "Render pages, verify JS-injected schema, capture proof screenshots, and regression-test the VizBiz funnel/report pages.",
      pipelineStage: "proof_and_qa" as const,
    },
    {
      tool: "Scrapling / stealth browser",
      use: "Fallback crawler for public competitor pages when normal fetch or Playwright cannot extract needed public content; respect robots.txt and ToS.",
      pipelineStage: "competitor_research" as const,
    },
    {
      tool: "Telegram context",
      use: `Send concise founder/operator summaries for ${input.name} leads, report views, and monthly competitor movement back to Telegram.`,
      pipelineStage: "operator_context" as const,
    },
    ...(hasCompetitors
      ? [{ tool: "Competitor analysis", use: "Compare supplied competitor websites against target site signals before calculating the local visibility opportunity estimate.", pipelineStage: "competitor_research" as const }]
      : []),
  ];
}

function publicSignals(page: PageSignals) {
  return {
    name: page.name,
    url: page.url,
    fetched: page.fetched,
    title: page.title,
    h1: page.h1,
    wordCount: page.wordCount,
    schemaTypes: page.schemaTypes,
    hasRobots: page.hasRobots,
    hasSitemap: page.hasSitemap,
    hasFaqPattern: page.hasFaqPattern,
    socialProfiles: page.socialProfiles,
  };
}

function emptyIntelligence(evidence: string): SeoSiteIntelligence {
  return {
    score: 0,
    crawlSource: "none",
    generatedAt: new Date().toISOString(),
    target: null,
    competitors: [],
    technicalChecks: [check("input", "Website input", false, 0, evidence)],
    llmReadiness: unavailableLlmReadiness(evidence),
    contentBriefs: [],
    competitorFindings: [],
    automation: buildAutomationPlan({ name: "Unknown", city: "Unknown" }, false),
    notes: [evidence],
  };
}

function llmCheck(key: string, label: string, passed: boolean, evidence: string) {
  return { key, label, passed, evidence };
}

function unavailableLlmReadiness(evidence: string) {
  return {
    score: 0,
    band: "Unavailable" as const,
    summary: "AI/LLM readiness could not be evaluated because no website was available to crawl.",
    checks: [llmCheck("input", "Website input", false, evidence)],
    strengths: [],
    opportunities: [evidence],
  };
}

function check(key: string, label: string, passed: boolean, points: number, evidence: string) {
  return { key, label, passed, points, evidence };
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function matchAll(text: string, regex: RegExp) {
  return Array.from(text.matchAll(regex), (match) => match[1] ?? "");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractSocialProfiles(html: string) {
  const platforms = [
    ["facebook", /https?:\/\/[^"'\s>]*facebook\.com[^"'\s>]*/i],
    ["instagram", /https?:\/\/[^"'\s>]*instagram\.com[^"'\s>]*/i],
    ["linkedin", /https?:\/\/[^"'\s>]*linkedin\.com[^"'\s>]*/i],
    ["tiktok", /https?:\/\/[^"'\s>]*tiktok\.com[^"'\s>]*/i],
    ["youtube", /https?:\/\/[^"'\s>]*(youtube\.com|youtu\.be)[^"'\s>]*/i],
    ["x", /https?:\/\/[^"'\s>]*(twitter\.com|x\.com)[^"'\s>]*/i],
  ] as const;

  return platforms.filter(([, regex]) => regex.test(html)).map(([platform]) => platform);
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function similarText(a: string, b: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((word) => word.length > 3);
  const aWords = new Set(normalize(a));
  const bWords = normalize(b);
  return bWords.some((word) => aWords.has(word));
}

function countMentions(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.filter((term) => term && lower.includes(term.toLowerCase())).length;
}
