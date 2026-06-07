/**
 * PreFlight Engine v2 — Deep Business Intelligence Extraction
 *
 * Rebuild: Instead of forcing the LLM to pick from a hardcoded niche menu,
 * we let it describe the business freely and extract structured data:
 *   - What they do (specific, not generic)
 *   - Who they serve (target audience)
 *   - What language their customers search in
 *   - What geographic market they operate in
 *   - Their core services
 *
 * This data flows downstream to generate hyper-specific prompts,
 * discover real competitors, and produce accurate reports.
 *
 * Used by: intake route (instant scan)
 * Consumed by: research-runner (prompts + competitors),
 *              report-content (display),
 *              thank-you page (revenue gap hook)
 */

import { scrapeSite, fetchLlmsTxt } from "./site-scraper";
import { runSEOAudit, SEOAuditResult } from "./seo-auditor";
import { calcRevenueGap, NICHE_ECONOMICS as NICHE_ECONOMICS_SHARED } from "./niche-economics";
import { enrichBusinessProfile, calculateLocalEntityTrustScore, type GooglePlaceEnrichment } from "./places-client";

export type BusinessProfileWithAudit = BusinessProfile & {
  seoAudit?: SEOAuditResult;
  renderMethod?: 'firecrawl' | 'playwright' | 'fetch';
};

export type BusinessProfile = {
  // -- v1 compat fields (still used by report rendering) --
  niche: string;
  nicheLabel: string;
  pricingInfo: string | null;
  valueProposition: string;
  contentQuality: "high" | "medium" | "low";
  hasLlmsTxt: boolean;
  hasSchema: boolean;
  aiReadinessScore: number; // 0-100
  estimatedRevenueGap: {
    low: number;
    high: number;
    currency: string;
  };

  // -- v2 enriched fields --
  /** Specific business type (e.g. "medical marketing consultancy", not "marketing agency") */
  businessType: string;
  /** Who they serve (e.g. "doctors, clinics, health professionals in Romania") */
  targetAudience: string;
  /** Core services as extracted from the site */
  services: string[];
  /** Primary language of the website content (e.g. "Romanian") */
  siteLanguage: string;
  /** Language customers would use to search for this business (e.g. "Romanian" for a local Romanian business) */
  searchLanguage: string;
  /** Geographic market they operate in (e.g. "Romania") */
  market: string;
  /** ISO 639-1 code for search language (e.g. "ro") — used by search APIs */
  searchLangCode: string;
  /** LLM-generated search queries that would be used by real customers to find this business */
  suggestedSearchQueries: string[];
  /** LLM-suggested competitor search queries for discovering real competitors */
  competitorSearchQueries: string[];

  // -- Confidence scoring --
  /** How confident the LLM is about the niche/businessType classification (0-100) */
  nicheConfidence: number;
  /** One sentence explaining the confidence score */
  confidenceReason: string;

  // -- Scraper intelligence fields --
  /** Social links extracted from homepage */
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  /** Contact info from website */
  contactInfo: {
    emails: string[];
    phones: string[];
    address: string | null;
  };
  /** Schema.org data */
  schemaOrg: {
    types: string[];
    name: string | null;
    aggregateRating: { ratingValue: number | null; reviewCount: number | null } | null;
    sameAs: string[];
  };
  /** Open Graph data */
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
  };
  /** Google Business Profile */
  googleBusiness: {
    url: string | null;
    placeId: string | null;
  };

  // -- Edward Sturm AI Discovery fields --
  /** Bing Webmaster Tools verification status */
  bingWmtVerified: boolean;
  /** Whether the site has a blog/content section */
  hasBlog: boolean;
  /** Blog URL if found */
  blogUrl: string | null;
  /** Number of indexed pages from sitemap */
  indexedPages: number | null;
  /** Whether site has customer reviews/testimonials */
  hasReviews: boolean;

  // -- Google Places enrichment --
  /** Google Places data for the client business */
  googlePlaceEnrichment: GooglePlaceEnrichment | null;
  /** Local entity trust score (0-100) from Google Places data */
  localEntityTrustScore: number | null;
};

// Weighted scoring for each niche — average lead value and monthly volume
// Legacy local copy for backward compat — authoritative version is in niche-economics.ts
const NICHE_ECONOMICS = NICHE_ECONOMICS_SHARED;

// Map common languages to ISO 639-1 codes
const LANG_CODE_MAP: Record<string, string> = {
  "english": "en", "romanian": "ro", "french": "fr", "german": "de",
  "spanish": "es", "italian": "it", "portuguese": "pt", "dutch": "nl",
  "polish": "pl", "czech": "cs", "hungarian": "hu", "greek": "el",
  "turkish": "tr", "russian": "ru", "japanese": "ja", "korean": "ko",
  "chinese": "zh", "arabic": "ar", "hindi": "hi", "thai": "th",
  "vietnamese": "vi", "indonesian": "id", "malay": "ms", "swedish": "sv",
  "norwegian": "no", "danish": "da", "finnish": "fi", "croatian": "hr",
  "serbian": "sr", "bulgarian": "bg", "ukrainian": "uk", "hebrew": "he",
};

// calcRevenueGap is imported from niche-economics.ts
// All revenue calculations flow through the shared module


/**
 * Keyword-based niche detection fallback (used when LLM is unavailable)
 */
const NICHE_KEYWORDS: Record<string, string[]> = {
  car_dealership: ["dealer", "auto", "cars", "automotive", "honda", "toyota", "ford", "chevrolet", "inventory", "financing", "trade-in", "certified pre-owned", "test drive"],
  endermologie_clinic: ["endermologie", "lpg endermologie", "cellulite", "body sculpting", "body contouring", "lymphatic drainage", "non-invasive treatment", "skin toning", "smooth tone and revitalise", "smooth tone and revitalize"],
  fine_jewelry: ["jewelry store", "jeweller", "jeweler", "diamond", "engagement ring", "lab grown", "gemstone", "bridal jewelry"],
  spray_tanning: ["spray tan", "tanning", "sunless", "bronze", "glow", "airbrush tan"],
  beauty_salon: ["salon", "beauty", "hair", "nails", "facial", "spa", "barber"],
  venue_wedding: ["venue", "wedding", "event", "banquet", "ballroom", "reception"],
  dance_studio: ["dance", "ballet", "salsa", "hip hop", "studio", "dance class"],
  real_estate: ["realty", "real estate", "realtor", "property", "homes"],
  mobile_bar: ["cocktail", "bar", "mixology", "mobile bar", "cocktail catering", "drinks catering"],
  restaurant: ["menu", "restaurant", "dining", "bistro", "cuisine", "reservations", "lunch", "dinner"],
  photography: ["photographer", "photography", "portrait", "headshot", "photo session"],
  cleaning_service: ["cleaning", "cleaning service", "maid", "janitorial", "house cleaning"],
  barbershop: ["barber", "barbershop", "haircut", "beard trim"],
  fitness_gym: ["gym", "fitness", "personal trainer", "workout", "yoga studio"],
  med_spa: ["botox", "filler", "laser", "microneedling", "med spa", "injectables"],
  nail_salon: ["nail art", "manicure", "pedicure", "gel nails", "acrylic nails"],
  tutoring: ["tutoring", "tutor", "lessons", "learning center", "academic"],
  pet_services: ["dog", "pet", "grooming", "pet sitting", "dog walking"],
  landscaping: ["landscaping", "lawn", "garden", "landscape design"],
  it_services: ["it services", "tech support", "managed services", "cybersecurity"],
  marketing_agency: ["marketing agency", "digital marketing", "social media management", "seo services"],
  auto_transport: ["auto transport", "car shipping", "car hauling", "vehicle transport", "vehicle shipping", "auto shipping", "car carrier", "vehicle logistics"],
  tourism_experience: ["pearl farm", "oyster farm", "farm tour", "guided tour", "scenic cruise", "winery tour", "brewery tour", "eco tour", "boat tour", "adventure tour", "day trip", "tourist attraction", "tourism", "nature tour", "cultural experience", "water activity", "river cruise", "seaplane", "food tour", "wine tasting", "cooking class", "kayak tour"],
  artisan_workshop: ["workshop", "studio", "class", "course", "lesson", "artisan", "craft", "maker", "metalwork", "silversmith", "goldsmith", "jewelry making", "ring making", "metalsmithing", "book a session", "reserve your spot"],
  plant_shop: ["plant shop", "plant care", "houseplant", "indoor plant", "plant rental", "greenhouse", "nursery", "garden center", "plant store", "plant delivery", "botanical", "plant nursery"],
};

function detectNicheByKeywords(text: string): string {
  const lower = text.toLowerCase();
  let bestNiche = "local_business";
  let bestScore = 0;
  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }
  return bestNiche;
}

function applyNicheGuardrails(input: {
  niche: string;
  businessType: string;
  services: string[];
  valueProposition: string;
  allSignals: string;
  googlePlaceEnrichment: GooglePlaceEnrichment | null;
}): { niche: string; businessType: string; services: string[]; confidenceReason?: string } {
  const signal = [
    input.businessType,
    input.valueProposition,
    ...(input.services || []),
    input.allSignals,
    ...(input.googlePlaceEnrichment?.types || []),
  ].join(' ').toLowerCase();

  const isEndermologie = /\bendermologie\b|\blpg\b|cellulite|body\s+sculpt|body\s+contour|lymphatic\s+drain|skin\s+ton|non[-\s]?invasive/.test(signal);
  if (isEndermologie) {
    return {
      niche: 'endermologie_clinic',
      businessType: 'endermologie and body contouring clinic',
      services: input.services?.length ? input.services : ['LPG Endermologie', 'body contouring', 'cellulite reduction', 'skin toning'],
      confidenceReason: 'Deterministic guardrail: Endermologie/LPG/body-contouring signals override unrelated broad categories.',
    };
  }

  const placeTypes = input.googlePlaceEnrichment?.types || [];
  const placeSuggestsBeauty = placeTypes.some((type) => ['beauty_salon', 'wellness_center', 'spa', 'health'].includes(type));
  if (input.niche === 'car_dealership' && placeSuggestsBeauty && !/\bdealer(ship)?\b|\bautomotive\b|\bcar\s+(sales|service|dealer)/.test(signal)) {
    return {
      niche: 'beauty_salon',
      businessType: input.businessType && input.businessType !== 'car dealership' ? input.businessType : 'beauty and wellness clinic',
      services: input.services?.length ? input.services : ['beauty and wellness treatments'],
      confidenceReason: 'Deterministic guardrail: Google Places beauty/wellness types block unrelated car-dealership classification.',
    };
  }

  return { niche: input.niche, businessType: input.businessType, services: input.services };
}

/**
 * The v2 LLM extraction prompt.
 * Instead of "pick from this list," we ask the LLM to describe the business
 * in its own words and extract structured fields we actually need.
 */
const EXTRACTION_PROMPT = `Analyze this business website. Return ONLY valid JSON. No markdown. No code fences. No explanation.

Extract:
1. "businessType": The specific, precise category. NOT generic — "medical marketing consultancy" not "marketing agency". "Pediatric dental clinic" not "dentist". Be as specific as the site allows.
2. "targetAudience": Who this business serves. E.g. "doctors, dentists, and health clinic owners in Romania" or "brides planning weddings in Ontario". Include geography if clear.
3. "services": Array of 3-6 core services/products they offer. Be specific from the site content.
4. "siteLanguage": The primary language of the website content (e.g. "Romanian", "English", "French").
5. "searchLanguage": What language their potential customers would use to search for this type of business. Same as siteLanguage for local businesses, but might differ for international businesses.
6. "market": The geographic market they serve (e.g. "Romania", "Ontario, Canada", "United States", "Cluj Napoca, Romania").
7. "niche": Pick the CLOSEST match from this list: car_dealership, fine_jewelry, spray_tanning, beauty_salon, venue_wedding, dance_studio, real_estate, mobile_bar, auto_transport, restaurant, photography, cleaning_service, barbershop, fitness_gym, med_spa, nail_salon, tutoring, pet_services, landscaping, it_services, marketing_agency, plant_shop, tourism_experience, artisan_workshop, local_business. This is for internal categorization only — your businessType is what we actually use.
8. "valueProposition": One sentence: what they do for their clients, in their own words (translate if not in English).
9. "pricing": Any pricing information found (translate if needed), or null.
10. "quality": "high", "medium", or "low" — is the site well-written with original content?
11. "customerSearchQueries": Array of 5-8 search queries that REAL CUSTOMERS would type to find this business. Use the searchLanguage. Be specific — not "marketing agency near me" but "marketing medical pentru clinici Cluj" or "best medical marketing agency for doctors". Think about what someone would actually type into ChatGPT or Google.
12. "competitorSearchQueries": Array of 3-5 search queries to find their REAL competitors. Use the searchLanguage. E.g. "medical marketing agencies Romania" or "consultanta marketing medici Bucuresti".
13. "nicheConfidence": Your confidence that the niche and businessType are correct. A number from 0-100. 100 = very sure (clear website with obvious services), 50 = somewhat sure (vague or ambiguous site), below 30 = guessing (site didn't load well or is very generic).
14. "confidenceReason": One sentence explaining your confidence score. E.g. "Site clearly lists water polo coaching and training services" or "Site is mostly images with little text, niche is inferred from domain name".

WEBSITE CONTENT:
`;

/**
 * Check for Bing Webmaster Tools verification meta tag
 */
function checkBingWMT(html: string | undefined): boolean {
  if (!html) return false;
  const bingMeta = html.match(/<meta[^>]+name=["']msvalidate\.1["'][^>]*>/i);
  if (bingMeta) {
    const contentMatch = bingMeta[0].match(/content=["']([^"']+)["']/i);
    if (contentMatch && contentMatch[1].length > 10) {
      console.info(`[preflight] Bing WMT verified: ${contentMatch[1].substring(0, 20)}...`);
      return true;
    }
  }
  return false;
}

/**
 * Check for blog/content section by looking for common paths in HTML and sitemap
 */
function checkForBlog(html: string | undefined, baseUrl: string): { hasBlog: boolean; blogUrl: string | null } {
  if (!html) return { hasBlog: false, blogUrl: null };
  
  // Common blog path patterns
  const blogPatterns = [
    /href=["'][^"']*\/(blog|news|articles|resources|insights)["']/i,
    /href=["'][^"']*\/(blog|news|articles|resources|insights)\//i,
  ];
  
  for (const pattern of blogPatterns) {
    const match = html.match(pattern);
    if (match) {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const blogUrl = hrefMatch[1].startsWith('http') ? hrefMatch[1] : `${baseUrl.replace(/\/+$/, '')}${hrefMatch[1]}`;
        console.info(`[preflight] Blog found: ${blogUrl}`);
        return { hasBlog: true, blogUrl };
      }
    }
  }
  
  // Also check for WordPress or common blog platforms in URLs
  const blogPlatformPattern = /href=["'][^"']*(\/category\/|\/tag\/|\/20\d{2}\/|\/author\/)["']/i;
  if (blogPlatformPattern.test(html)) {
    console.info(`[preflight] Blog platform detected via URL patterns`);
    return { hasBlog: true, blogUrl: `${baseUrl}/blog` };
  }
  
  return { hasBlog: false, blogUrl: null };
}

/**
 * Count indexed pages from sitemap.xml if available
 */
async function countIndexedPages(baseUrl: string): Promise<number | null> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap-index.xml`,
  ];
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VizBizBot/1.0)' },
      });
      
      if (response.ok) {
        const sitemapContent = await response.text();
        const urlMatches = sitemapContent.match(/<url>/g);
        const count = urlMatches ? urlMatches.length : 0;
        console.info(`[preflight] Sitemap found at ${sitemapUrl}: ${count} pages`);
        return count;
      }
    } catch {
      // Continue to next URL
    }
  }
  
  console.info(`[preflight] No sitemap found`);
  return null;
}

/**
 * Check for customer reviews/testimonials on the site
 */
function checkForReviews(html: string | undefined): boolean {
  if (!html) return false;
  
  const reviewPatterns = [
    /testimonial/i,
    /review/i,
    /rating/i,
    /stars?/i,
    /customer/i,
    /client/i,
    /quote/i,
  ];
  
  // Check for structured review data
  const hasReviewSchema = html.includes('"@type": "Review"') || html.includes('"@type":"Review"');
  const hasAggregateRating = html.includes('"@type": "AggregateRating"') || html.includes('"@type":"AggregateRating"');
  
  if (hasReviewSchema || hasAggregateRating) {
    console.info(`[preflight] Review schema markup found`);
    return true;
  }
  
  // Check for testimonial sections in HTML
  const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
  
  let reviewScore = 0;
  for (const pattern of reviewPatterns) {
    if (pattern.test(textContent)) reviewScore++;
  }
  
  if (reviewScore >= 3) {
    console.info(`[preflight] Review/testimonial content detected (${reviewScore} signals)`);
    return true;
  }
  
  return false;
}

/**
 * PreFlight v2 — Deep Business Intelligence
 */
export async function preflightScan(url: string, intakeCity?: string): Promise<BusinessProfileWithAudit> {
  console.info(`[preflight] Scanning ${url}...`);

  // -- Stage 1: Scrape site --
  const scraped = await scrapeSite(url);
  const llmsTxtContent = await fetchLlmsTxt(url);
  const rawText = scraped.text;
  const renderMethod = scraped.renderMethod;

  console.info(`[preflight] Scraped ${url}: ${rawText.length} chars across ${scraped.pagesScraped || 1} pages via ${renderMethod} in ${scraped.loadTimeMs}ms`);

  // -- Stage 2: SEO audit --
  let seoAudit: SEOAuditResult | undefined;
  if (scraped.html) {
    seoAudit = await runSEOAudit(scraped.html, url, llmsTxtContent);
    console.info(`[preflight] SEO audit: score=${seoAudit.overallScore}, issues=${seoAudit.issues.length}, schema=${seoAudit.schemaTypes.join(',')}`);
  }

  const hasLlmsTxt = llmsTxtContent !== null && llmsTxtContent.length > 0;
  const hasSchema = seoAudit?.hasSchema || false;

  // -- Stage 2.5: New preflight checks (Edward Sturm) --
  const bingWmtVerified = checkBingWMT(scraped.html);
  const blogCheck = checkForBlog(scraped.html, url);
  const indexedPages = await countIndexedPages(url);
  const hasReviews = checkForReviews(scraped.html);
  
  console.info(`[preflight] Sturm checks: BingWMT=${bingWmtVerified}, Blog=${blogCheck.hasBlog}, IndexedPages=${indexedPages ?? 'N/A'}, Reviews=${hasReviews}`);

  // -- Stage 2.6: Google Places enrichment for client business --
  // City resolution order: 1) intake city, 2) will re-enrich after LLM extraction
  // Do NOT call Places with empty city — return unavailable status instead.
  let googlePlaceEnrichment: GooglePlaceEnrichment | null = null;
  let localEntityTrustScore: number | null = null;
  const placesLookupName = url.replace(/^https?:\/\//, '').split('/')[0]; // domain as initial name
  const placesCity = intakeCity?.trim() || ''; // Priority 1: intake city

  if (placesCity) {
    try {
      googlePlaceEnrichment = await enrichBusinessProfile(placesLookupName, placesCity, url);
      if (googlePlaceEnrichment.placeId) {
        localEntityTrustScore = calculateLocalEntityTrustScore(googlePlaceEnrichment);
        console.info(`[preflight] Google Places: found profile, trust=${localEntityTrustScore}/100, rating=${googlePlaceEnrichment.rating}, reviews=${googlePlaceEnrichment.userReviewCount}`);
      } else {
        console.info(`[preflight] Google Places: no profile found for ${placesLookupName} in ${placesCity}`);
      }
    } catch (e) {
      console.warn(`[preflight] Google Places enrichment failed (non-blocking):`, e instanceof Error ? e.message : e);
    }
  } else {
    console.info(`[preflight] Google Places: skipped — no city provided at intake. Will attempt after LLM extraction.`);
    googlePlaceEnrichment = null;
  }

  // Scrape failure fallback
  if (!scraped.html && scraped.error) {
    console.error(`[preflight] Scrape failed for ${url}: ${scraped.error}`);
    const fallbackEconomic = NICHE_ECONOMICS.unknown;
    return {
      niche: "unknown",
      nicheLabel: "Unknown",
      pricingInfo: null,
      valueProposition: "",
      contentQuality: "low",
      hasLlmsTxt: false,
      hasSchema: false,
      aiReadinessScore: 0,
      estimatedRevenueGap: {
        low: Math.round(fallbackEconomic.monthlyVolume * fallbackEconomic.avgLeadValue * 0.5),
        high: Math.round(fallbackEconomic.monthlyVolume * fallbackEconomic.avgLeadValue * 1.5),
        currency: "USD",
      },
      seoAudit,
      renderMethod,
      businessType: "unknown",
      targetAudience: "",
      services: [],
      siteLanguage: "English",
      searchLanguage: "English",
      market: "",
      searchLangCode: "en",
      suggestedSearchQueries: [],
      competitorSearchQueries: [],
      nicheConfidence: 0,
      confidenceReason: 'Website scrape failed — no data available',
      socialLinks: { instagram: null, facebook: null, linkedin: null, twitter: null, tiktok: null, youtube: null },
      contactInfo: { emails: [], phones: [], address: null },
      schemaOrg: { types: [], name: null, aggregateRating: null, sameAs: [] },
      openGraph: { title: null, description: null, image: null },
      googleBusiness: { url: null, placeId: null },
      // Edward Sturm fields
      bingWmtVerified: false,
      hasBlog: false,
      blogUrl: null,
      indexedPages: null,
      hasReviews: false,
      googlePlaceEnrichment: null,
      localEntityTrustScore: null,
    };
  }

  // -- Stage 3: Extract meta signals for LLM context --
  const metaTitle = scraped.html?.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "";
  const metaDesc = scraped.html?.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() || "";
  const metaKeywords = scraped.html?.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() || "";
  const ogTags = scraped.html?.match(/<meta[^>]+property=["']og:(?:title|description|type|locale)["'][^>]+content=["']([^"']+)["']/gi)?.join(' ') || "";
  const htmlLang = scraped.html?.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1]?.trim() || "";

  const allSignals = [
    `URL: ${url}`,
    metaTitle ? `Page Title: ${metaTitle}` : null,
    metaDesc ? `Meta Description: ${metaDesc}` : null,
    metaKeywords ? `Meta Keywords: ${metaKeywords}` : null,
    ogTags ? `OG Tags: ${ogTags}` : null,
    htmlLang ? `HTML Language: ${htmlLang}` : null,
    scraped.title ? `Site Title: ${scraped.title}` : null,
    rawText.length > 50 ? `Page Content (${rawText.substring(0, 8000).length} chars):\n${rawText.substring(0, 8000)}` : null,
  ].filter(Boolean).join('\n');

  // -- Stage 4: LLM extraction --
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
  const OLLAMA_BASE_URL = "https://ollama.com/v1";

  let businessType = "";
  let targetAudience = "";
  let services: string[] = [];
  let siteLanguage = "English";
  let searchLanguage = "English";
  let market = "";
  let niche = "local_business";
  let valueProposition = "";
  let pricingInfo: string | null = null;
  let contentQuality: "high" | "medium" | "low" = "low";
  let suggestedSearchQueries: string[] = [];
  let competitorSearchQueries: string[] = [];
  let nicheConfidence = 50; // Default confidence
  let confidenceReason = 'Default confidence';
  let llmUsed = false;

  try {
    const prompt = EXTRACTION_PROMPT + allSignals + '\n\n{"businessType": "';

    const llmRes = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "kimi-k2.6",
        messages: [
          {
            role: "system",
            content: "You are a business analyst specializing in identifying exactly what a business does, who it serves, and how its customers would search for it. You pay close attention to language, geography, and industry specificity. Return ONLY valid JSON. No markdown. No code fences. No explanation."
          },
          { role: "user", content: prompt }
        ],
        stream: false,
        options: { temperature: 0.1 }
      }),
    });

    if (llmRes.ok) {
      const data = await llmRes.json();
      const rawContent = data.choices?.[0]?.message?.content || data.message?.content || "";
      const clean = rawContent.replace(/```json?/gi, "").replace(/```/g, "").trim();

      // Handle partial JSON — the prompt ends with {"businessType": "
      // so the LLM continues from there. Try to parse the full thing.
      let result: any;
      try {
        // If the LLM returned a complete JSON object
        result = JSON.parse(clean);
      } catch {
        // If it returned a partial starting from after our seed
        try {
          result = JSON.parse('{"businessType": "' + clean);
        } catch {
          // Last resort: try to find JSON object in the response
          const jsonMatch = clean.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not parse LLM response as JSON");
          }
        }
      }

      businessType = result.businessType || "";
      targetAudience = result.targetAudience || "";
      services = Array.isArray(result.services) ? result.services : [];
      siteLanguage = result.siteLanguage || "English";
      searchLanguage = result.searchLanguage || siteLanguage;
      market = result.market || "";
      niche = result.niche || "local_business";
      valueProposition = result.valueProposition || "";
      pricingInfo = result.pricing || null;
      contentQuality = result.quality || "low";
      suggestedSearchQueries = Array.isArray(result.customerSearchQueries) ? result.customerSearchQueries : [];
      competitorSearchQueries = Array.isArray(result.competitorSearchQueries) ? result.competitorSearchQueries : [];
      nicheConfidence = typeof result.nicheConfidence === 'number' ? result.nicheConfidence : 50;
      confidenceReason = result.confidenceReason || 'No reason provided';
      llmUsed = true;

      // Low confidence flag
      if (nicheConfidence < 50) {
        console.warn(`[preflight] ⚠️ LOW CONFIDENCE (${nicheConfidence}/100): ${confidenceReason}`);
        console.warn(`[preflight] Niche: ${niche}, BusinessType: ${businessType} — may need manual review`);
      } else {
        console.info(`[preflight] Confidence: ${nicheConfidence}/100 — ${confidenceReason}`);
      }

      console.info(`[preflight] LLM extraction:`, {
        businessType,
        targetAudience: targetAudience.substring(0, 80),
        niche,
        siteLanguage,
        searchLanguage,
        market,
        services: services.length,
        customerQueries: suggestedSearchQueries.length,
        competitorQueries: competitorSearchQueries.length,
        nicheConfidence,
      });
    } else {
      const errText = await llmRes.text().catch(() => "");
      console.warn(`[preflight] Ollama API returned ${llmRes.status}: ${errText.substring(0, 200)}`);
    }
  } catch (e) {
    console.warn(`[preflight] LLM call failed:`, e instanceof Error ? e.message : e);
  }

  // -- Fallback: keyword detection if LLM failed --
  if (!llmUsed) {
    const allText = `${url} ${metaTitle} ${metaDesc} ${scraped.title} ${rawText}`;
    niche = detectNicheByKeywords(allText);
    contentQuality = rawText.length > 3000 ? "medium" : "low";
    businessType = niche.replace(/_/g, ' ');
  }

  const guardedProfile = applyNicheGuardrails({
    niche,
    businessType,
    services,
    valueProposition,
    allSignals,
    googlePlaceEnrichment,
  });
  if (guardedProfile.niche !== niche || guardedProfile.businessType !== businessType) {
    console.warn(`[preflight] Niche guardrail override: ${niche}/${businessType || 'unknown'} → ${guardedProfile.niche}/${guardedProfile.businessType}. ${guardedProfile.confidenceReason || ''}`);
    niche = guardedProfile.niche;
    businessType = guardedProfile.businessType;
    services = guardedProfile.services;
    if (guardedProfile.confidenceReason) confidenceReason = guardedProfile.confidenceReason;
    nicheConfidence = Math.max(nicheConfidence, 90);
  }

  // -- Derive search language code --
  const searchLangCode = LANG_CODE_MAP[searchLanguage.toLowerCase()] || "en";

  // -- Stage 4.5: Re-enrich with LLM-extracted business name + city --
  // City resolution: intake city > LLM-extracted market > contact address > domain-only fallback
  // Only re-enrich if we didn't already get a profile, or if LLM data might improve the match.
  const cityFromMarket = market?.split(',')[0].trim() || '';
  const bestCity = intakeCity?.trim() || cityFromMarket;
  const enrichmentName = businessType || niche.replace(/_/g, ' ');

  if (bestCity && enrichmentName && llmUsed) {
    try {
      // Only re-enrich if: (a) no profile found yet, or (b) LLM name is better than domain
      const shouldReEnrich = !googlePlaceEnrichment?.placeId || (enrichmentName !== url.replace(/^https?:\/\//, '').split('/')[0]);
      if (shouldReEnrich) {
        const reEnrichment = await enrichBusinessProfile(enrichmentName, bestCity, url);
        if (reEnrichment.placeId) {
          // Keep the better result (prefer one with website match)
          if (!googlePlaceEnrichment?.placeId || reEnrichment.websiteMatch) {
            googlePlaceEnrichment = reEnrichment;
            localEntityTrustScore = calculateLocalEntityTrustScore(reEnrichment);
            console.info(`[preflight] Re-enriched with LLM data: trust=${localEntityTrustScore}/100, name="${enrichmentName}", city="${bestCity}"`);
          }
        } else {
          console.info(`[preflight] Re-enrichment: no profile found for "${enrichmentName}" in "${bestCity}"`);
        }
      }
    } catch (e) {
      console.warn(`[preflight] Re-enrichment failed (non-blocking):`, e instanceof Error ? e.message : e);
    }
  } else if (!googlePlaceEnrichment?.placeId) {
    console.info(`[preflight] Google Places: unable to enrich — city="${bestCity}", name="${enrichmentName}". Marking as unavailable.`);
  }

  // -- Stage 5: Compute scores --
  let score = 0;
  if (seoAudit) {
    score = seoAudit.overallScore;
  } else {
    if (hasLlmsTxt) score += 40;
    if (hasSchema) score += 30;
    if (contentQuality === "high") score += 30;
    else if (contentQuality === "medium") score += 15;
    if (rawText.length > 3000) score += 10;
  }

  const economic = NICHE_ECONOMICS[niche] || NICHE_ECONOMICS.local_business;
  const revenueGap = calcRevenueGap(niche, score, pricingInfo);

  const result: BusinessProfileWithAudit = {
    niche,
    nicheLabel: economic.label,
    pricingInfo,
    valueProposition,
    contentQuality,
    hasLlmsTxt,
    hasSchema,
    aiReadinessScore: score,
    estimatedRevenueGap: revenueGap,
    seoAudit,
    renderMethod,
    // v2 fields
    businessType,
    targetAudience,
    services,
    siteLanguage,
    searchLanguage,
    market,
    searchLangCode,
    suggestedSearchQueries,
    competitorSearchQueries,
    // Confidence
    nicheConfidence: nicheConfidence || 50,
    confidenceReason: confidenceReason || 'Default confidence',
    // Scraper intelligence
    socialLinks: scraped.intelligence?.socialLinks || { instagram: null, facebook: null, linkedin: null, twitter: null, tiktok: null, youtube: null },
    contactInfo: scraped.intelligence?.contact || { emails: [], phones: [], address: null },
    schemaOrg: scraped.intelligence?.schemaData ? {
      types: scraped.intelligence.schemaData.types,
      name: scraped.intelligence.schemaData.name,
      aggregateRating: scraped.intelligence.schemaData.aggregateRating,
      sameAs: scraped.intelligence.schemaData.sameAs,
    } : { types: [], name: null, aggregateRating: null, sameAs: [] },
    openGraph: scraped.intelligence?.openGraph ? {
      title: scraped.intelligence.openGraph.title,
      description: scraped.intelligence.openGraph.description,
      image: scraped.intelligence.openGraph.image,
    } : { title: null, description: null, image: null },
    googleBusiness: scraped.intelligence?.googleBusiness || { url: null, placeId: null },
    // Edward Sturm AI Discovery fields
    bingWmtVerified,
    hasBlog: blogCheck.hasBlog,
    blogUrl: blogCheck.blogUrl,
    indexedPages,
    hasReviews,
    googlePlaceEnrichment,
    localEntityTrustScore,
  };

  console.info(`[preflight] Result:`, {
    niche,
    businessType,
    market,
    searchLanguage,
    score,
    revGap: `$${revenueGap.low}-$${revenueGap.high}/mo`,
    queries: suggestedSearchQueries.length,
    compQueries: competitorSearchQueries.length,
    llm: llmUsed,
    render: renderMethod,
  });

  return result;
}
