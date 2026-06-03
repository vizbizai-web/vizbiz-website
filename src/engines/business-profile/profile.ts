import type { ClientInput } from "@/engines/research/types";
export { resolveBusinessIntelligenceProfile } from "./business-intelligence-profile";
export type { BusinessIntelligenceProfile } from "@/engines/research/business-intelligence-types";

export type BusinessNiche = "auto_dealer" | "dentist" | "roofer" | "med_spa" | "lawyer" | "hvac" | "plumber" | "mexican_restaurant" | "tax_service" | "natural_skincare_ecommerce" | "healthy_snack_ecommerce" | "generic_local_service";

export interface BusinessProfile {
  businessName: string;
  websiteUrl: string | null;
  city: string;
  industry: string;
  niche: BusinessNiche;
  displayNiche: string;
  profileMode: "known" | "dynamic" | "needs_review";
  classificationEvidence: string[];
  confidence: number;
  serviceAreaType: "local" | "regional" | "national";
  primaryServices: string[];
  buyerIntentCategories: string[];
  schemaType: string;
  promptLabels: {
    core: string;
    service: string;
    product: string;
    finance: string;
    urgency: string;
  };
  reportLabels: {
    discovery: string;
    trust: string;
    service: string;
    inventory: string;
    finance: string;
  };
  competitorQueries: string[];
}

export interface WebsiteSignals {
  businessName: string;
  websiteUrl?: string | null;
  city: string;
  text: string;
  categoryOverride?: string | null;
  primaryService?: string | null;
}

type NicheDefinition = Omit<BusinessProfile, "businessName" | "websiteUrl" | "city" | "displayNiche" | "profileMode" | "classificationEvidence" | "confidence" | "primaryServices" | "competitorQueries"> & {
  keywords: string[];
  services: string[];
};

const NICHES: Record<BusinessNiche, NicheDefinition> = {
  auto_dealer: {
    industry: "automotive",
    niche: "auto_dealer",
    serviceAreaType: "local",
    schemaType: "AutoDealer",
    keywords: ["dealership", "dealer", "used cars", "new cars", "vehicle", "trade-in", "finance a car", "service department", "service center", "auto repair", "auto repairs", "car repair", "parts department", "oil change", "brakes", "tires", "warranty service", "kia", "toyota", "honda", "hyundai", "ford", "chevrolet", "nissan", "mazda", "subaru", "volkswagen", "bmw", "mercedes", "audi", "lexus", "acura", "jeep", "dodge", "ram", "gmc"],
    services: ["service department", "auto repairs", "parts department", "vehicle sales", "used cars", "auto financing", "trade-in", "oil changes", "brake service", "tire service", "warranty service"],
    buyerIntentCategories: ["discovery", "trust", "service", "repairs", "parts", "inventory", "finance"],
    promptLabels: { core: "car dealership", service: "dealership service and repairs", product: "parts department", finance: "finance a vehicle", urgency: "same day service or repair" },
    reportLabels: { discovery: "Buyer Discovery", trust: "Trust & Review Signals", service: "Service & Repair Visibility", inventory: "Parts & Maintenance Visibility", finance: "Finance & Trade-In Visibility" },
  },
  dentist: {
    industry: "healthcare",
    niche: "dentist",
    serviceAreaType: "local",
    schemaType: "Dentist",
    keywords: ["dentist", "dental", "teeth", "invisalign", "oral", "implants", "emergency dental", "cosmetic dentistry"],
    services: ["family dentistry", "emergency dental", "cosmetic dentistry", "dental implants", "teeth whitening", "Invisalign"],
    buyerIntentCategories: ["discovery", "trust", "emergency", "procedure", "cost"],
    promptLabels: { core: "dentist", service: "dental care", product: "cosmetic dentistry", finance: "dental treatment cost", urgency: "emergency dentist" },
    reportLabels: { discovery: "Patient Discovery", trust: "Patient Trust Signals", service: "Procedure Visibility", inventory: "Treatment Visibility", finance: "Cost & Insurance Visibility" },
  },
  roofer: {
    industry: "home_services",
    niche: "roofer",
    serviceAreaType: "local",
    schemaType: "RoofingContractor",
    keywords: ["roofer", "roofing", "roof repair", "roof replacement", "shingles", "roof leak", "metal roofing"],
    services: ["roof repair", "roof replacement", "emergency roof repair", "metal roofing", "shingle roofing"],
    buyerIntentCategories: ["discovery", "trust", "emergency", "replacement", "cost"],
    promptLabels: { core: "roofer", service: "roof repair", product: "roof replacement", finance: "roof replacement cost", urgency: "emergency roof repair" },
    reportLabels: { discovery: "Project Discovery", trust: "Warranty & Trust Signals", service: "Emergency Repair Visibility", inventory: "Replacement Visibility", finance: "Cost & Estimate Visibility" },
  },
  med_spa: {
    industry: "health_beauty",
    niche: "med_spa",
    serviceAreaType: "local",
    schemaType: "HealthAndBeautyBusiness",
    keywords: ["med spa", "medical spa", "botox", "filler", "laser hair removal", "injector", "skin clinic", "aesthetic"],
    services: ["Botox", "dermal fillers", "laser hair removal", "skin treatments", "cosmetic injectables"],
    buyerIntentCategories: ["discovery", "trust", "treatment", "safety", "price"],
    promptLabels: { core: "med spa", service: "cosmetic treatment", product: "Botox clinic", finance: "med spa pricing", urgency: "same day med spa appointment" },
    reportLabels: { discovery: "Treatment Discovery", trust: "Safety & Trust Signals", service: "Treatment Visibility", inventory: "Before/After Credibility", finance: "Price & Appointment Visibility" },
  },
  lawyer: {
    industry: "legal",
    niche: "lawyer",
    serviceAreaType: "local",
    schemaType: "LegalService",
    keywords: ["lawyer", "law firm", "attorney", "legal", "consultation", "personal injury", "family law", "immigration law"],
    services: ["legal consultation", "family law", "personal injury", "immigration law", "real estate law"],
    buyerIntentCategories: ["discovery", "trust", "practice_area", "consultation", "authority"],
    promptLabels: { core: "lawyer", service: "legal consultation", product: "law firm", finance: "lawyer consultation cost", urgency: "urgent lawyer" },
    reportLabels: { discovery: "Practice Area Discovery", trust: "Authority & Trust Signals", service: "Consultation Visibility", inventory: "Practice Area Visibility", finance: "Fee & Consultation Visibility" },
  },
  hvac: {
    industry: "home_services",
    niche: "hvac",
    serviceAreaType: "local",
    schemaType: "HVACBusiness",
    keywords: ["hvac", "furnace", "air conditioning", "ac repair", "heating", "cooling", "heat pump"],
    services: ["furnace repair", "AC repair", "HVAC installation", "heat pump service", "emergency HVAC"],
    buyerIntentCategories: ["discovery", "trust", "emergency", "installation", "cost"],
    promptLabels: { core: "HVAC company", service: "HVAC repair", product: "furnace and AC installation", finance: "HVAC installation cost", urgency: "emergency HVAC repair" },
    reportLabels: { discovery: "Service Discovery", trust: "Trust & Review Signals", service: "Emergency Repair Visibility", inventory: "Installation Visibility", finance: "Cost & Quote Visibility" },
  },
  plumber: {
    industry: "home_services",
    niche: "plumber",
    serviceAreaType: "local",
    schemaType: "Plumber",
    keywords: ["plumber", "plumbing", "drain", "pipe", "leak repair", "water heater", "emergency plumbing"],
    services: ["emergency plumbing", "drain cleaning", "leak repair", "water heater repair", "pipe repair"],
    buyerIntentCategories: ["discovery", "trust", "emergency", "repair", "cost"],
    promptLabels: { core: "plumber", service: "plumbing repair", product: "drain cleaning", finance: "plumbing repair cost", urgency: "emergency plumber" },
    reportLabels: { discovery: "Service Discovery", trust: "Trust & Review Signals", service: "Emergency Repair Visibility", inventory: "Repair Visibility", finance: "Cost & Quote Visibility" },
  },
  mexican_restaurant: {
    industry: "restaurant",
    niche: "mexican_restaurant",
    serviceAreaType: "local",
    schemaType: "Restaurant",
    keywords: ["mexican", "mexican restaurant", "mexican grill", "taco", "tacos", "burrito", "burritos", "margarita", "cantina"],
    services: ["Mexican food", "tacos", "burritos", "margaritas", "family dining", "takeout"],
    buyerIntentCategories: ["discovery", "trust", "menu", "near_me", "value"],
    promptLabels: { core: "Mexican restaurant", service: "Mexican food", product: "tacos and burritos", finance: "Mexican restaurant prices", urgency: "Mexican food near me" },
    reportLabels: { discovery: "Restaurant Discovery", trust: "Review & Trust Signals", service: "Cuisine Visibility", inventory: "Menu Visibility", finance: "Value & Price Visibility" },
  },
  tax_service: {
    industry: "professional_services",
    niche: "tax_service",
    serviceAreaType: "local",
    schemaType: "AccountingService",
    keywords: ["tax", "taxes", "tax service", "tax services", "tax preparation", "tax filing", "tax return", "tax consultant", "tax accountant", "bookkeeping", "accounting", "accountant", "payroll", "cra", "hst", "gst", "corporate tax", "personal tax"],
    services: ["tax preparation", "personal tax returns", "corporate tax filing", "bookkeeping", "payroll", "HST/GST filing"],
    buyerIntentCategories: ["discovery", "trust", "service", "deadline", "price"],
    promptLabels: { core: "tax service", service: "tax preparation", product: "bookkeeping and tax filing", finance: "tax preparation cost", urgency: "last-minute tax filing" },
    reportLabels: { discovery: "Tax Service Discovery", trust: "Trust & Credential Signals", service: "Tax Preparation Visibility", inventory: "Bookkeeping & Filing Visibility", finance: "Pricing & Deadline Visibility" },
  },
  natural_skincare_ecommerce: {
    industry: "consumer_products",
    niche: "natural_skincare_ecommerce",
    serviceAreaType: "national",
    schemaType: "Organization",
    keywords: ["natural skincare", "skincare", "skin care", "aloe vera", "aloe gel", "castile soap", "organic", "fragrance free", "baby safe", "wellness", "natural beauty"],
    services: ["natural skincare", "organic aloe vera gel", "fragrance-free skincare", "castile soap", "wellness essentials", "baby-safe body care"],
    buyerIntentCategories: ["discovery", "trust", "ingredient safety", "product fit", "value"],
    promptLabels: { core: "natural skincare brand", service: "natural skincare", product: "organic aloe vera gel", finance: "natural skincare value", urgency: "aloe vera gel for sunburn" },
    reportLabels: { discovery: "Product Discovery", trust: "Trust & Review Signals", service: "Use-Case Visibility", inventory: "Product Visibility", finance: "Value & Comparison Visibility" },
  },
  healthy_snack_ecommerce: {
    industry: "consumer_products",
    niche: "healthy_snack_ecommerce",
    serviceAreaType: "national",
    schemaType: "Organization",
    keywords: ["healthy candy", "healthy sweets", "sugar free candy", "low sugar candy", "gummies", "gomitas", "vegan gummies", "keto", "kosher", "gluten free", "allulose", "snack saludable", "dulces saludables", "sin azúcar"],
    services: ["healthy candy", "sugar-free gummies", "vegan gummies", "low-calorie sweets", "keto-friendly snacks", "kosher candy"],
    buyerIntentCategories: ["discovery", "trust", "ingredient safety", "product fit", "value"],
    promptLabels: { core: "healthy candy brand", service: "healthy sweets", product: "sugar-free vegan gummies", finance: "healthy candy value", urgency: "sugar-free gummies for cravings" },
    reportLabels: { discovery: "Product Discovery", trust: "Trust & Review Signals", service: "Use-Case Visibility", inventory: "Product Visibility", finance: "Value & Comparison Visibility" },
  },
  generic_local_service: {
    industry: "local_services",
    niche: "generic_local_service",
    serviceAreaType: "local",
    schemaType: "LocalBusiness",
    keywords: [],
    services: ["local service", "consultation", "appointment", "quote"],
    buyerIntentCategories: ["discovery", "trust", "service", "value", "local proof"],
    promptLabels: { core: "local business", service: "local service", product: "service provider", finance: "service pricing", urgency: "same day local service" },
    reportLabels: { discovery: "Local Discovery", trust: "Trust & Review Signals", service: "Service Visibility", inventory: "Offer Visibility", finance: "Value & Pricing Visibility" },
  },
};

export async function createBusinessProfile(input: ClientInput): Promise<BusinessProfile> {
  return inferBusinessProfileFromSignals({
    businessName: input.name,
    websiteUrl: input.websiteUrl,
    city: input.city,
    categoryOverride: input.businessType,
    primaryService: input.primaryService,
    text: [input.name, input.businessType, input.primaryService, input.primaryMake, input.websiteUrl].filter(Boolean).join(" "),
  });
}

export function inferBusinessProfileFromSignals(signals: WebsiteSignals): BusinessProfile {
  const override = normalizeNiche(signals.categoryOverride);
  const detected = override ? { niche: override, confidence: 0.95 } : detectNiche(signals.text);
  const dynamicService = !override && detected.niche === "generic_local_service" ? extractSpecificService(signals) : null;
  const definition = dynamicService ? dynamicDefinition(dynamicService) : NICHES[detected.niche];
  const primaryServices = servicesFromSignals(signals, definition);
  const profileMode = dynamicService ? "dynamic" : detected.niche === "generic_local_service" ? "needs_review" : "known";
  const displayNiche = dynamicService ? `${dynamicService} service` : definition.promptLabels.core;
  const classificationEvidence = buildClassificationEvidence(signals, definition, dynamicService);

  return {
    businessName: signals.businessName.trim(),
    websiteUrl: signals.websiteUrl ?? null,
    city: signals.city.trim(),
    industry: definition.industry,
    niche: definition.niche,
    displayNiche,
    profileMode,
    classificationEvidence,
    confidence: dynamicService ? 0.72 : override ? Math.max(0.9, detected.confidence) : detected.confidence,
    serviceAreaType: definition.serviceAreaType,
    primaryServices,
    buyerIntentCategories: definition.buyerIntentCategories,
    schemaType: definition.schemaType,
    promptLabels: definition.promptLabels,
    reportLabels: definition.reportLabels,
    competitorQueries: buildCompetitorQueries(definition.promptLabels.core, primaryServices, signals.city),
  };
}

export function getNicheDefinition(niche: string | undefined | null): NicheDefinition {
  return NICHES[normalizeNiche(niche) ?? "generic_local_service"];
}

function detectNiche(text: string): { niche: BusinessNiche; confidence: number } {
  const haystack = text.toLowerCase();
  const scores = Object.entries(NICHES)
    .filter(([niche]) => niche !== "generic_local_service")
    .map(([niche, definition]) => ({
      niche: niche as BusinessNiche,
      score: definition.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword.toLowerCase()) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best || best.score === 0) return { niche: "generic_local_service", confidence: 0.35 };
  return { niche: best.niche, confidence: Math.min(0.95, 0.55 + best.score * 0.08) };
}

function servicesFromSignals(signals: WebsiteSignals, definition: NicheDefinition) {
  const text = signals.text.toLowerCase();
  const extracted = definition.services.filter((service) => text.includes(service.toLowerCase()));
  const autoDealerRevenueServices = definition.niche === "auto_dealer"
    ? [
        ...(text.includes("repair") ? ["auto repairs"] : []),
        ...(text.includes("parts") ? ["parts department"] : []),
        ...(text.includes("service") ? ["service department"] : []),
      ]
    : [];
  const primaryService = signals.primaryService?.trim();
  return Array.from(new Set([...(primaryService ? [primaryService] : []), ...autoDealerRevenueServices, ...extracted, ...definition.services])).slice(0, 6);
}

function dynamicDefinition(service: string): NicheDefinition {
  const core = cleanServiceLabel(service);
  const title = titleCase(core);
  return {
    industry: "local_services",
    niche: "generic_local_service",
    serviceAreaType: "local",
    schemaType: "LocalBusiness",
    keywords: [core],
    services: [core, `${core} consultation`, `${core} appointment`, `${core} quote`],
    buyerIntentCategories: ["discovery", "trust", "service", "comparison", "pricing"],
    promptLabels: { core, service: core, product: `${core} options`, finance: `${core} pricing`, urgency: `urgent ${core}` },
    reportLabels: { discovery: `${title} Discovery`, trust: "Trust & Review Signals", service: `${title} Visibility`, inventory: "Offer & Service Visibility", finance: "Pricing & Comparison Visibility" },
  };
}

function extractSpecificService(signals: WebsiteSignals) {
  const explicit = cleanServiceLabel(signals.primaryService ?? "");
  if (isSpecificService(explicit)) return explicit;

  const haystack = cleanServiceLabel(signals.text);
  const knownService = [
    "landscaping", "lawn care", "snow removal", "pest control", "chiropractor", "physiotherapy", "massage therapy", "insurance broker",
    "mortgage broker", "real estate agent", "property management", "cleaning service", "house cleaning", "carpet cleaning", "moving company",
    "electrician", "painting contractor", "concrete contractor", "pool service", "tutoring", "daycare", "veterinary clinic", "pet grooming",
    "photography", "wedding photography", "catering", "personal training", "fitness coaching", "therapy", "counselling", "consulting",
  ].find((term) => haystack.includes(term));
  if (knownService) return knownService;

  const servicePattern = haystack.match(/\b([a-z][a-z ]{2,45}?\s(?:service|services|clinic|studio|contractor|company|consultant|consulting|repair|installation|cleaning|coaching|therapy))\b/i)?.[1];
  const cleaned = cleanServiceLabel(servicePattern ?? "");
  return isSpecificService(cleaned) ? cleaned : null;
}

function buildClassificationEvidence(signals: WebsiteSignals, definition: NicheDefinition, dynamicService: string | null) {
  const evidence = [
    dynamicService ? `Dynamic service inferred from intake/site terms: ${dynamicService}.` : `Known niche matched: ${definition.promptLabels.core}.`,
    signals.primaryService ? `Submitted service: ${signals.primaryService}.` : null,
    signals.categoryOverride ? `Submitted category: ${signals.categoryOverride}.` : null,
  ].filter(Boolean) as string[];
  return evidence.slice(0, 5);
}

function cleanServiceLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9&/ +.-]+/g, " ")
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co|the|best|top|near|oakville|toronto|mississauga|scarborough)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpecificService(value: string) {
  if (!value || value.length < 4) return false;
  if (/\b(with|customers?|appointments?|quotes?|trusted)\b/.test(value)) return false;
  return !/^(local service|trusted service|service|services|consultation|appointment|quote|business|local business|undefined|null|generic local service)$/.test(value);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildCompetitorQueries(core: string, services: string[], city: string) {
  const market = city.trim() || "near me";
  return [
    `best ${core} in ${market}`,
    `top rated ${core} near ${market}`,
    `recommended ${core} in ${market}`,
    `${services[0] ?? core} ${market}`,
    `best ${services[0] ?? core} provider in ${market}`,
  ];
}

function normalizeNiche(value: string | undefined | null): BusinessNiche | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const aliases: Record<string, BusinessNiche> = {
    dealership: "auto_dealer",
    car_dealer: "auto_dealer",
    car_dealership: "auto_dealer",
    auto_retailer: "auto_dealer",
    dental: "dentist",
    dental_clinic: "dentist",
    roofing: "roofer",
    roofing_contractor: "roofer",
    medical_spa: "med_spa",
    medspa: "med_spa",
    law_firm: "lawyer",
    attorney: "lawyer",
    hvac_company: "hvac",
    plumbing: "plumber",
    tax: "tax_service",
    taxes: "tax_service",
    tax_service: "tax_service",
    tax_services: "tax_service",
    tax_preparation: "tax_service",
    tax_filing: "tax_service",
    tax_accountant: "tax_service",
    accounting: "tax_service",
    accountant: "tax_service",
    bookkeeping: "tax_service",
    restaurant: "mexican_restaurant",
    mexican: "mexican_restaurant",
    mexican_grill: "mexican_restaurant",
    mexican_food: "mexican_restaurant",
    mexican_restaurant: "mexican_restaurant",
    natural_skincare: "natural_skincare_ecommerce",
    natural_skincare_brand: "natural_skincare_ecommerce",
    natural_skin_care: "natural_skincare_ecommerce",
    skincare: "natural_skincare_ecommerce",
    skincare_brand: "natural_skincare_ecommerce",
    beauty_ecommerce: "natural_skincare_ecommerce",
    ecommerce_skincare: "natural_skincare_ecommerce",
    aloe_vera: "natural_skincare_ecommerce",
    aloe_vera_gel: "natural_skincare_ecommerce",
    wellness_products: "natural_skincare_ecommerce",
    healthy_snack: "healthy_snack_ecommerce",
    healthy_snacks: "healthy_snack_ecommerce",
    healthy_candy: "healthy_snack_ecommerce",
    healthy_sweets: "healthy_snack_ecommerce",
    sugar_free_candy: "healthy_snack_ecommerce",
    sugar_free_gummies: "healthy_snack_ecommerce",
    vegan_gummies: "healthy_snack_ecommerce",
    gummies: "healthy_snack_ecommerce",
    gomitas: "healthy_snack_ecommerce",
    dulces_saludables: "healthy_snack_ecommerce",
  };
  const niche = aliases[normalized] ?? normalized;
  return niche in NICHES ? (niche as BusinessNiche) : null;
}
