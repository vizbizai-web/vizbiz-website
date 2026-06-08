/**
 * PreFlight Engine v2 — Deep Business Intelligence Extraction
 *
 * Rebuild: instead of forcing the business through a hardcoded niche menu,
 * we derive a Business Intelligence Profile from evidence and structured data:
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
  /** Customer segments / facility types served; not the business niche itself */
  customerSegments: string[];
  /** Primary language of the website content (e.g. "Romanian") */
  siteLanguage: string;
  /** Language customers would use to search for this business (e.g. "Romanian" for a local Romanian business) */
  searchLanguage: string;
  /** Geographic market they operate in (e.g. "Romania") */
  market: string;
  /** ISO 639-1 code for search language (e.g. "ro") — used by search APIs */
  searchLangCode: string;
  /** Evidence-first search queries that real customers would use to find this business */
  suggestedSearchQueries: string[];
  /** Evidence-first competitor search queries for discovering real competitors */
  competitorSearchQueries: string[];

  // -- Confidence scoring --
  /** How confident the evidence path is about the niche/businessType classification (0-100) */
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
 * Keyword-based niche detection fallback. This is compatibility support only;
 * the Business Intelligence Profile remains the prompt/report source of truth.
 */
const NICHE_KEYWORDS: Record<string, string[]> = {
  electrical_contractor: ["electrician", "electrical contractor", "electrical contractors", "electrical services", "niceic", "chas", "safe contractor", "24/7 service", "electrical needs", "electrical installations", "electrical maintenance", "commercial electrical", "industrial electrical"],
  car_dealership: ["dealer", "auto", "cars", "automotive", "honda", "toyota", "ford", "chevrolet", "inventory", "financing", "trade-in", "certified pre-owned", "test drive"],
  endermologie_clinic: ["endermologie", "lpg endermologie", "cellulite", "body sculpting", "body contouring", "lymphatic drainage", "non-invasive treatment", "skin toning", "smooth tone and revitalise", "smooth tone and revitalize"],
  fine_jewelry: ["jewelry store", "jeweller", "jeweler", "diamond", "engagement ring", "lab grown", "gemstone", "bridal jewelry"],
  spray_tanning: ["spray tan", "tanning", "sunless", "bronze", "glow", "airbrush tan"],
  beauty_salon: ["salon", "beauty", "hair", "nails", "facial", "spa", "barber"],
  venue_wedding: ["venue", "wedding", "event", "banquet", "ballroom", "reception"],
  dance_studio: ["dance studio", "dance school", "dance class", "dance classes", "dance lessons", "ballet", "hip hop", "ballroom", "choreography"],
  real_estate: ["realty", "real estate", "realtor", "property", "homes"],
  mobile_bar: ["cocktail", "bar", "mixology", "mobile bar", "cocktail catering", "drinks catering"],
  restaurant: ["menu", "restaurant", "dining", "bistro", "cuisine", "reservations", "lunch", "dinner"],
  food_ingredient_supplier: ["helados", "helado", "elaboración de helados", "fabricación de productos artesanales", "usos industriales", "materias primas", "estabilizantes", "neutros", "pastas frutales", "colorantes", "esencias", "variegatos", "dulce de leche", "frutas en almíbar", "frutos secos", "envases", "salsas", "chocolate", "distribuidos por nosotros", "producidos por nosotros"],
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
  pro_audio_systems: ["professional audio", "pro audio", "audio systems", "sound system", "sound reinforcement", "av systems", "audiovisual", "public address", "conference systems", "installation audio", "system integration", "audio distribution", "stage lighting", "broadcast audio", "recording studio equipment", "sound equipment", "loudspeakers", "mixing console", "microphones", "acoustics", "audio workshops", "system optimisation", "system optimization"],
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
}): { niche: string; businessType: string; services: string[]; confidenceReason?: string; suggestedSearchQueries?: string[]; competitorSearchQueries?: string[] } {
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

  const isElectricalContractor = /\belectrician\b|electrical\s+contract(or|ors)|electrical\s+(service|services|installation|installations|maintenance)|\bniceic\b|\bchas\b|safe\s+contractor/.test(signal);
  const placeTypes = input.googlePlaceEnrichment?.types || [];
  const placeSuggestsElectrical = placeTypes.some((type) => ['electrician'].includes(type));
  if (isElectricalContractor || placeSuggestsElectrical) {
    return {
      niche: 'electrical_contractor',
      businessType: input.businessType && input.businessType !== 'car dealership' ? input.businessType : 'electrical contractor',
      services: input.services?.length ? input.services : ['electrical contracting', 'electrical installations', 'electrical maintenance', 'emergency electrical service'],
      confidenceReason: 'Deterministic guardrail: website/schema/Google Places electrical-contractor signals override unrelated car-dealership classification.',
    };
  }

  const placeSuggestsProAudio = placeTypes.some((type) => ['electronics_store', 'home_goods_store', 'store'].includes(type));
  const isProAudio = /professional\s+audio|\bpro\s+audio\b|audio\s+(system|systems|equipment|distribution|installation)|sound\s+(system|systems|reinforcement|equipment)|\bav\s+(system|systems|integration)|audiovisual|public\s+address|conference\s+systems?|stage\s+lighting|broadcast\s+audio|recording\s+studio\s+equipment|loudspeakers?|mixing\s+consoles?|microphones?|acoustics|system\s+optimis|system\s+optimiz|audio\s+workshops?/.test(signal);
  if (isProAudio || (input.niche === 'artisan_workshop' && placeSuggestsProAudio && /audio|sound|av|audiovisual|loudspeaker|microphone|acoustic|lighting/.test(signal))) {
    return {
      niche: 'pro_audio_systems',
      businessType: 'professional audio systems distributor and integrator',
      services: input.services?.length && !input.services.join(' ').toLowerCase().includes('jewelry')
        ? input.services
        : ['professional audio systems', 'AV system integration', 'sound reinforcement', 'audio equipment distribution', 'system optimisation workshops'],
      suggestedSearchQueries: [
        'professional audio system integrator in {city}',
        'pro audio distributor in {city}',
        'best sound reinforcement supplier in {city}',
        'AV system integration company in {city}',
        'professional loudspeaker and microphone supplier in {city}',
        'conference audio installation company in {city}',
        'trusted audio equipment distributor in {city}',
        'professional sound system company with good reviews in {city}',
      ],
      competitorSearchQueries: [
        'professional audio distributors {city}',
        'pro audio system integrators {city}',
        'AV system integration companies {city}',
        'sound reinforcement suppliers {city}',
      ],
      confidenceReason: 'Deterministic guardrail: professional audio/AV/electronics signals override generic workshop or artisan classifications.',
    };
  }

  const isFoodIngredientSupplier = /elaboraci[oó]n\s+de\s+helados|fabricaci[oó]n\s+de\s+productos\s+artesanales|\busos\s+industriales\b|materias\s+primas|\bhelados?\b|\bhelader[ií]as?\b|estabilizantes?|\bneutros\b|pastas?\s+frutales?|colorantes?|esencias?|variegatos?|dulce\s+de\s+leche|frutas?\s+en\s+alm[ií]bar|frutos\s+secos|\benvases\b|\bsalsas\b|\bchocolate\b|distribuidos\s+por\s+nosotros|producidos\s+por\s+nosotros/.test(signal);
  const falseDanceFromFoodSalsa = input.niche === 'dance_studio' && /\bsalsas\b|\brecetas\b|helados?|chocolate|dulce\s+de\s+leche/.test(signal);
  if (isFoodIngredientSupplier || falseDanceFromFoodSalsa) {
    return {
      niche: 'food_ingredient_supplier',
      businessType: 'ice cream ingredient manufacturer and food product supplier',
      services: ['ice cream ingredients', 'stabilizers', 'fruit pastes', 'flavorings and colorants', 'sauces and food-service supplies'],
      suggestedSearchQueries: [
        'proveedor de insumos para heladería en {city}',
        'fabricante de ingredientes para helados en {city}',
        'estabilizantes y pastas para heladería en {city}',
        'distribuidor de productos para heladerías en {city}',
        'insumos para elaboración de helados en {city}',
      ],
      competitorSearchQueries: [
        'proveedores de insumos para heladerías {city}',
        'fabricantes de ingredientes para helados {city}',
        'distribuidores para heladerías {city}',
      ],
      confidenceReason: 'Deterministic guardrail: Spanish ice-cream ingredient/product catalog terms override false dance-studio matches from words like “salsas” or template “estudio”.',
    };
  }

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

function humanizeBusinessType(input: string, fallback = 'local business'): string {
  const cleaned = (input || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!cleaned || ['unknown', 'local business', 'local_business', 'business'].includes(cleaned)) return fallback;
  return cleaned;
}

function normalizeComparableText(input: string): string {
  return humanizeBusinessType(input, '')
    .replace(/\b(llc|inc|ltd|limited|corp|corporation|company|co)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBusinessNameMasqueradingAsType(businessType: string, businessName?: string): boolean {
  const type = normalizeComparableText(businessType);
  const name = normalizeComparableText(businessName || '');
  if (!type || !name) return false;
  return type === name || name.includes(type) || type.includes(name);
}

function detectCustomerSegments(text: string): string[] {
  const lower = text.toLowerCase();
  const segments: string[] = [];
  const add = (regex: RegExp, label: string) => { if (regex.test(lower)) segments.push(label); };
  add(/schools?\s+(and|&)\s+daycares?|daycares?\s+(and|&)\s+schools?/i, 'schools and daycares');
  if (!segments.includes('schools and daycares')) {
    add(/\bschools?\b/i, 'schools');
    add(/\bdaycares?\b|child\s*care/i, 'daycares');
  }
  add(/medical\s+(offices?|facilities?)|healthcare\s+(offices?|facilities?)|clinics?/i, 'medical offices');
  add(/\brestaurants?\b|\bdining\b/i, 'restaurants');
  add(/office\s+(buildings?|spaces?)|commercial\s+offices?/i, 'office buildings');
  add(/\bgyms?\b|fitness\s+cent(er|re)s?/i, 'gyms');
  add(/retail\s+(stores?|spaces?)|shops?/i, 'retail businesses');
  return cleanQueryParts(segments).slice(0, 6);
}

export function separateBusinessIdentityFromEvidence(input: {
  businessName?: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  scrapedTitle: string;
  evidenceText: string;
  htmlLang: string;
  market: string;
  googlePlaceTypes?: string[];
}): {
  niche: string;
  businessType: string;
  services: string[];
  customerSegments: string[];
  siteLanguage: string;
  searchLanguage: string;
  confidenceReason: string;
} {
  const evidence = `${input.url} ${input.metaTitle} ${input.metaDescription} ${input.scrapedTitle} ${input.evidenceText}`;
  const placeType = googleTypeToBusinessType(input.googlePlaceTypes || []);
  let niche = detectNicheByKeywords(evidence);
  let businessType = humanizeBusinessType(placeType || stripBusinessNameNoise(input.metaTitle || input.scrapedTitle || input.metaDescription) || niche.replace(/_/g, ' '));
  let services = extractLikelyServices(evidence, niche);
  const customerSegments = detectCustomerSegments(evidence);

  const commercialCleaningSignal = /commercial\s+clean(ing|ers?)|janitorial|saniti[sz](ing|ation)|facility\s+cleaning|office\s+cleaning|medical[-\s]?facility\s+cleaning|cleaning\s+services?/i.test(evidence);
  if (commercialCleaningSignal) {
    niche = 'cleaning_service';
    businessType = 'commercial cleaning service';
    const cleaningServices = [
      'commercial cleaning',
      /saniti[sz](ing|ation)/i.test(evidence) ? 'sanitizing' : '',
      /janitorial/i.test(evidence) ? 'janitorial cleaning' : '',
      /facility\s+cleaning/i.test(evidence) ? 'facility cleaning' : '',
      /office\s+cleaning/i.test(evidence) ? 'office cleaning' : '',
      /deep\s+cleaning/i.test(evidence) ? 'deep cleaning' : '',
    ];
    services = cleanQueryParts([...cleaningServices.filter(Boolean), ...services.filter((service) => !customerSegments.includes(service))]).slice(0, 6);
  } else if (isBusinessNameMasqueradingAsType(businessType, input.businessName)) {
    const descriptorAfterPipe = (input.metaTitle || '').split(/[|•–—]/).slice(1).join(' ').trim();
    businessType = humanizeBusinessType(placeType || descriptorAfterPipe || input.metaDescription || niche.replace(/_/g, ' '));
    if (isBusinessNameMasqueradingAsType(businessType, input.businessName)) businessType = humanizeBusinessType(niche.replace(/_/g, ' '));
  }

  const customerSegmentKeys = new Set(customerSegments.flatMap((segment) => {
    const singular = segment.replace(/s\b/g, '').replace(/\band daycare\b/g, 'and daycare');
    return [segment, singular];
  }).map((segment) => humanizeBusinessType(segment, '')));
  services = cleanQueryParts(services.filter((service) => {
    const normalizedService = humanizeBusinessType(service, '');
    return !customerSegmentKeys.has(normalizedService) && !customerSegments.includes(service) && !isBusinessNameMasqueradingAsType(service, input.businessName);
  })).slice(0, 6);

  const siteLanguage = inferLanguageFromSignals(evidence, input.htmlLang);
  return {
    niche,
    businessType,
    services,
    customerSegments,
    siteLanguage,
    searchLanguage: siteLanguage,
    confidenceReason: 'Separated business category, services, and served customer segments from website metadata/body evidence before prompt generation.',
  };
}

function cleanQueryParts(parts: string[]): string[] {
  const seen = new Set<string>();
  return parts
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length > 2)
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function buildEvidenceFirstQueries(input: {
  businessType: string;
  services: string[];
  market: string;
  intakeCity?: string;
  customerSegments?: string[];
}): { suggestedSearchQueries: string[]; competitorSearchQueries: string[] } {
  const market = input.intakeCity?.trim() || input.market?.split(',')[0]?.trim() || '{city}';
  const businessType = humanizeBusinessType(input.businessType);
  const services = cleanQueryParts(input.services || [])
    .map((service) => humanizeBusinessType(service, ''))
    .filter(Boolean)
    .slice(0, 4);
  const customerSegments = cleanQueryParts(input.customerSegments || []).slice(0, 4);
  const primaryService = services[0] || businessType;

  const suggestedSearchQueries = cleanQueryParts([
    `I need a trusted ${businessType} in ${market}. Who should I choose?`,
    `Which ${businessType}s near ${market} have good reviews and clear proof?`,
    `best ${businessType} in ${market}`,
    `trusted ${primaryService} provider in ${market}`,
    `who offers ${primaryService} near ${market}`,
    ...customerSegments.map((segment) => `${businessType} for ${segment} in ${market}`),
    ...services.slice(1).map((service) => `${service} provider in ${market}`),
    `${businessType} with good reviews in ${market}`,
  ]).slice(0, 8);

  const competitorSearchQueries = cleanQueryParts([
    `${businessType} competitors ${market}`,
    `best ${businessType}s ${market}`,
    `${primaryService} companies ${market}`,
    `${businessType} alternatives ${market}`,
  ]).slice(0, 5);

  return { suggestedSearchQueries, competitorSearchQueries };
}

export function shouldUseEvidenceFirstQueries(input: {
  niche: string;
  businessType: string;
  services: string[];
  suggestedSearchQueries: string[];
  nicheConfidence: number;
}): boolean {
  const businessType = humanizeBusinessType(input.businessType, '');
  const hasSpecificBusinessType = businessType.length > 4 && !['unknown', 'local business', 'business'].includes(businessType);
  const hasServices = (input.services || []).some((service) => humanizeBusinessType(service, '').length > 4);
  if (!hasSpecificBusinessType && !hasServices) return false;

  const genericOrWeakNiche = ['local_business', 'unknown'].includes(input.niche) || input.nicheConfidence < 60;
  const missingQueries = input.suggestedSearchQueries.length < 5;
  const queryText = input.suggestedSearchQueries.join(' ').toLowerCase();
  const staleVerticalLeak = /\b(car|dealer|dealership|inventory|trade[-\s]?in|jewelry|jewellery|diamond|ring making|silversmith|artisan workshop)\b/.test(queryText)
    && !/\b(car|dealer|dealership|inventory|trade[-\s]?in|jewelry|jewellery|diamond|ring making|silversmith|artisan workshop)\b/.test(`${businessType} ${(input.services || []).join(' ')}`.toLowerCase());

  return genericOrWeakNiche || missingQueries || staleVerticalLeak;
}

/**
 * Provider-neutral extraction contract.
 * The app must build the Business Intelligence Profile from real evidence first:
 * website copy, schema, Google Places, contact/location signals, and submitted intake data.
 *
 * A model may assist this step only through the current configured provider. It must not
 * force the business into a finite taxonomy. The taxonomy key is a secondary reporting
 * fallback; businessType/services/market/searchLanguage are the fields that drive prompts.
 */
export const BUSINESS_PROFILE_EXTRACTION_CONTRACT = `Extract a Business Intelligence Profile from evidence.
Return fields: businessType, targetAudience, services, siteLanguage, searchLanguage, market, optional taxonomySuggestion, valueProposition, pricing, quality, customerSearchQueries, competitorSearchQueries, nicheConfidence, confidenceReason.
Rules:
- Describe the business in human words first.
- Do not force a finite taxonomy category.
- Use local_business as the internal fallback when no exact taxonomy exists.
- Customer queries must sound like real human AI/search questions for this exact business, services, language, and market.`;

function titleCaseWords(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function stripBusinessNameNoise(input: string): string {
  return (input || '')
    .replace(/https?:\/\/[^\s]+/gi, ' ')
    .replace(/\b(home|homepage|official site|welcome|about us|contact us)\b/gi, ' ')
    .replace(/[|•–—-].*$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferLanguageFromSignals(signals: string, htmlLang: string): string {
  const lang = (htmlLang || '').toLowerCase();
  if (lang.startsWith('en')) return 'English';
  if (lang.startsWith('es')) return 'Spanish';
  if (lang.startsWith('fr')) return 'French';
  if (lang.startsWith('ro')) return 'Romanian';
  if (lang.startsWith('de')) return 'German';
  if (/[ñáéíóúü¿¡]|\b(para|servicios|productos|proveedor|fabricante|helados|empresa)\b/i.test(signals)) return 'Spanish';
  if (/\b(pour|entreprise|bonjour|français|france|québec|merci)\b/i.test(signals)) return 'French';
  if (/\b(si|pentru|servicii|clinici|romania)\b/i.test(signals)) return 'Romanian';
  return 'English';
}

function googleTypeToBusinessType(types: string[] = []): string {
  const map: Record<string, string> = {
    electrician: 'electrical contractor',
    beauty_salon: 'beauty salon',
    spa: 'spa and wellness clinic',
    restaurant: 'restaurant',
    car_dealer: 'car dealership',
    real_estate_agency: 'real estate agency',
    electronics_store: 'professional audio and electronics supplier',
    home_goods_store: 'home goods store',
    store: 'retail store',
    health: 'health and wellness provider',
  };
  for (const type of types) {
    if (map[type]) return map[type];
  }
  return '';
}

function extractLikelyServices(text: string, niche: string): string[] {
  const lower = text.toLowerCase();
  const candidates: string[] = [];
  for (const keywords of Object.values(NICHE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (keyword.length > 4 && lower.includes(keyword.toLowerCase())) candidates.push(keyword);
    }
  }
  if (niche !== 'local_business') candidates.unshift(niche.replace(/_/g, ' '));
  const serviceMatches = text.match(/\b([A-Za-z][A-Za-z0-9&'’ -]{3,48}\s+(services?|solutions?|systems?|installation|installations|repair|repairs|supplier|distributor|clinic|studio|consulting|consultancy|therapy|tours?|classes|products?))\b/g) || [];
  candidates.push(...serviceMatches.slice(0, 8));
  return cleanQueryParts(candidates).map((item) => humanizeBusinessType(item, '')).filter(Boolean).slice(0, 6);
}

function deriveBusinessProfileFromEvidence(input: {
  url: string;
  allSignals: string;
  metaTitle: string;
  metaDesc: string;
  scrapedTitle: string;
  htmlLang: string;
  rawText: string;
  intakeCity?: string;
  businessName?: string;
  googlePlaceEnrichment: GooglePlaceEnrichment | null;
}): {
  businessType: string;
  targetAudience: string;
  services: string[];
  customerSegments: string[];
  siteLanguage: string;
  searchLanguage: string;
  market: string;
  niche: string;
  valueProposition: string;
  pricingInfo: string | null;
  contentQuality: "high" | "medium" | "low";
  suggestedSearchQueries: string[];
  competitorSearchQueries: string[];
  nicheConfidence: number;
  confidenceReason: string;
} {
  const evidenceText = `${input.url} ${input.metaTitle} ${input.metaDesc} ${input.scrapedTitle} ${input.rawText}`;
  const market = input.intakeCity?.trim()
    || input.googlePlaceEnrichment?.formattedAddress?.split(',').slice(-2).join(',').trim()
    || '';
  const separatedProfile = separateBusinessIdentityFromEvidence({
    businessName: input.businessName?.trim() || (input.metaTitle || input.scrapedTitle || '').split(/[|•–—]/)[0]?.trim(),
    url: input.url,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDesc,
    scrapedTitle: input.scrapedTitle,
    evidenceText,
    htmlLang: input.htmlLang,
    market,
    googlePlaceTypes: input.googlePlaceEnrichment?.types || [],
  });
  const niche = separatedProfile.niche;
  const businessType = separatedProfile.businessType;
  const services = separatedProfile.services;
  const siteLanguage = separatedProfile.siteLanguage;
  const searchLanguage = separatedProfile.searchLanguage;
  const contentQuality = input.rawText.length > 4500 ? 'high' : input.rawText.length > 1200 ? 'medium' : 'low';
  const hasSpecificBusinessType = businessType && !['local business', 'business', 'unknown'].includes(businessType);
  const nicheConfidence = hasSpecificBusinessType ? (services.length ? 78 : 68) : 35;
  const queries = buildEvidenceFirstQueries({ businessType, services, market, intakeCity: input.intakeCity, customerSegments: separatedProfile.customerSegments });
  return {
    businessType,
    targetAudience: hasSpecificBusinessType ? `customers looking for a trusted ${businessType}${market ? ` in ${market}` : ''}` : '',
    services,
    customerSegments: separatedProfile.customerSegments,
    siteLanguage,
    searchLanguage,
    market,
    niche,
    valueProposition: hasSpecificBusinessType
      ? `Provides ${businessType} services based on visible website, schema, and local profile evidence.`
      : '',
    pricingInfo: null,
    contentQuality,
    suggestedSearchQueries: queries.suggestedSearchQueries,
    competitorSearchQueries: queries.competitorSearchQueries,
    nicheConfidence,
    confidenceReason: hasSpecificBusinessType
      ? separatedProfile.confidenceReason
      : 'Insufficient visible evidence for a specific business type; internal taxonomy remains a fallback only.',
  };
}

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
export async function preflightScan(url: string, intakeCity?: string, businessName?: string): Promise<BusinessProfileWithAudit> {
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
  // City resolution order: 1) intake city, 2) later evidence-derived market if available
  // Do NOT call Places with empty city — return unavailable status instead.
  let googlePlaceEnrichment: GooglePlaceEnrichment | null = null;
  let localEntityTrustScore: number | null = null;
  const placesLookupName = businessName?.trim() || url.replace(/^https?:\/\//, '').split('/')[0];
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
    console.info(`[preflight] Google Places: skipped — no city provided at intake. Will attempt if later evidence resolves a reliable market.`);
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
      customerSegments: [],
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

  // -- Stage 3: Extract meta/schema/site signals for the Business Intelligence Profile --
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

  // -- Stage 4: Evidence-first business profile extraction --
  let businessType = "";
  let targetAudience = "";
  let services: string[] = [];
  let customerSegments: string[] = [];
  let siteLanguage = "English";
  let searchLanguage = "English";
  let market = "";
  let niche = "local_business";
  let valueProposition = "";
  let pricingInfo: string | null = null;
  let contentQuality: "high" | "medium" | "low" = "low";
  let suggestedSearchQueries: string[] = [];
  let competitorSearchQueries: string[] = [];
  let nicheConfidence = 50;
  let confidenceReason = 'Default confidence';
  const modelAssistedExtractionUsed = false;

  const deterministicProfile = deriveBusinessProfileFromEvidence({
    url,
    allSignals,
    metaTitle,
    metaDesc,
    scrapedTitle: scraped.title || '',
    htmlLang,
    rawText,
    intakeCity,
    businessName,
    googlePlaceEnrichment,
  });

  businessType = deterministicProfile.businessType;
  targetAudience = deterministicProfile.targetAudience;
  services = deterministicProfile.services;
  customerSegments = deterministicProfile.customerSegments;
  siteLanguage = deterministicProfile.siteLanguage;
  searchLanguage = deterministicProfile.searchLanguage;
  market = deterministicProfile.market;
  niche = deterministicProfile.niche;
  valueProposition = deterministicProfile.valueProposition;
  pricingInfo = deterministicProfile.pricingInfo;
  contentQuality = deterministicProfile.contentQuality;
  suggestedSearchQueries = deterministicProfile.suggestedSearchQueries;
  competitorSearchQueries = deterministicProfile.competitorSearchQueries;
  nicheConfidence = deterministicProfile.nicheConfidence;
  confidenceReason = deterministicProfile.confidenceReason;

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
    if (guardedProfile.suggestedSearchQueries?.length) suggestedSearchQueries = guardedProfile.suggestedSearchQueries;
    if (guardedProfile.competitorSearchQueries?.length) competitorSearchQueries = guardedProfile.competitorSearchQueries;
    nicheConfidence = Math.max(nicheConfidence, 90);
  }

  if (niche === 'pro_audio_systems') {
    targetAudience ||= 'audio professionals, venues, installers, broadcasters, studios, and organizations buying or integrating professional sound systems';
    valueProposition ||= 'Supplies and supports professional audio, AV, sound reinforcement, and system integration solutions.';
    market ||= intakeCity?.trim() || 'Poland';
    siteLanguage = siteLanguage || 'English';
    searchLanguage = searchLanguage || siteLanguage;
  }

  if (niche === 'food_ingredient_supplier') {
    targetAudience ||= 'ice cream shops, food-service operators, and manufacturers buying ingredients and supplies for ice cream or dessert production';
    valueProposition ||= 'Manufactures and distributes ingredients, stabilizers, flavorings, sauces, containers, and supplies for ice cream and food production.';
    market ||= intakeCity?.trim() || 'Rosario, Argentina';
    siteLanguage = 'Spanish';
    searchLanguage = 'Spanish';
  }

  if (!targetAudience && businessType) {
    targetAudience = `customers looking for a trusted ${businessType}${intakeCity ? ` in ${intakeCity}` : ''}`;
  }
  if (!valueProposition && businessType) {
    valueProposition = `Provides ${businessType} services with enough website evidence for AI systems to understand the business category.`;
  }
  if (!market && intakeCity?.trim()) {
    market = intakeCity.trim();
  }

  const resolvedMarketForQueries = intakeCity?.trim() || market?.split(',')[0]?.trim() || '{city}';
  suggestedSearchQueries = suggestedSearchQueries.map((query) => query.replace(/\{city\}/g, resolvedMarketForQueries));
  competitorSearchQueries = competitorSearchQueries.map((query) => query.replace(/\{city\}/g, resolvedMarketForQueries));

  if (shouldUseEvidenceFirstQueries({ niche, businessType, services, suggestedSearchQueries, nicheConfidence })) {
    const evidenceQueries = buildEvidenceFirstQueries({ businessType, services, market, intakeCity, customerSegments });
    console.warn(`[preflight] Evidence-first query safety gate: replacing weak/generic/stale queries for ${niche}/${businessType || 'unknown'}`);
    suggestedSearchQueries = evidenceQueries.suggestedSearchQueries;
    competitorSearchQueries = evidenceQueries.competitorSearchQueries;
    if (niche === 'local_business' && businessType && businessType !== 'local business' && businessType !== 'unknown') {
      confidenceReason = `${confidenceReason}; evidence-first query gate used scraped business type/services instead of generic local-business prompts.`;
    }
  }

  // -- Derive search language code --
  const searchLangCode = LANG_CODE_MAP[searchLanguage.toLowerCase()] || "en";

  // -- Stage 4.5: Re-enrich with evidence-derived business name + city --
  // City resolution: intake city > evidence-derived market > contact address > domain-only fallback.
  // Re-enrichment is reserved for a future model-assisted profile path through the current configured provider.
  const cityFromMarket = market?.split(',')[0].trim() || '';
  const bestCity = intakeCity?.trim() || cityFromMarket;
  const enrichmentName = businessType || niche.replace(/_/g, ' ');

  if (bestCity && enrichmentName && modelAssistedExtractionUsed) {
    try {
      // Only re-enrich if: (a) no profile found yet, or (b) the extracted profile name is better than the domain.
      const shouldReEnrich = !googlePlaceEnrichment?.placeId || (enrichmentName !== url.replace(/^https?:\/\//, '').split('/')[0]);
      if (shouldReEnrich) {
        const reEnrichment = await enrichBusinessProfile(enrichmentName, bestCity, url);
        if (reEnrichment.placeId) {
          // Keep the better result (prefer one with website match)
          if (!googlePlaceEnrichment?.placeId || reEnrichment.websiteMatch) {
            googlePlaceEnrichment = reEnrichment;
            localEntityTrustScore = calculateLocalEntityTrustScore(reEnrichment);
            console.info(`[preflight] Re-enriched with model-assisted profile data: trust=${localEntityTrustScore}/100, name="${enrichmentName}", city="${bestCity}"`);
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
    customerSegments,
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
    modelAssistedExtractionUsed,
    render: renderMethod,
  });

  return result;
}
