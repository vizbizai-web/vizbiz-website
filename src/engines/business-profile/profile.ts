import type { ClientInput } from "@/engines/research/types";

export type BusinessNiche = "auto_dealer" | "dentist" | "roofer" | "med_spa" | "lawyer" | "hvac" | "plumber" | "mexican_restaurant" | "natural_skincare_ecommerce" | "healthy_snack_ecommerce" | "generic_local_service";

export interface BusinessProfile {
  businessName: string;
  websiteUrl: string | null;
  city: string;
  industry: string;
  niche: BusinessNiche;
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

type NicheDefinition = Omit<BusinessProfile, "businessName" | "websiteUrl" | "city" | "confidence" | "primaryServices" | "competitorQueries"> & {
  keywords: string[];
  services: string[];
};

const NICHES: Record<BusinessNiche, NicheDefinition> = {
  auto_dealer: {
    industry: "automotive",
    niche: "auto_dealer",
    serviceAreaType: "local",
    schemaType: "AutoDealer",
    keywords: ["dealership", "dealer", "used cars", "new cars", "vehicle", "trade-in", "finance a car"],
    services: ["vehicle sales", "used cars", "trade-in", "auto financing", "service center"],
    buyerIntentCategories: ["discovery", "trust", "service", "inventory", "finance"],
    promptLabels: { core: "car dealership", service: "service center", product: "used cars", finance: "finance a vehicle", urgency: "same day service" },
    reportLabels: { discovery: "Buyer Discovery", trust: "Trust & Review Signals", service: "Service Visibility", inventory: "Inventory Visibility", finance: "Finance & Trade-In Visibility" },
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
  const definition = NICHES[detected.niche];
  const primaryServices = servicesFromSignals(signals, definition);

  return {
    businessName: signals.businessName.trim(),
    websiteUrl: signals.websiteUrl ?? null,
    city: signals.city.trim(),
    industry: definition.industry,
    niche: definition.niche,
    confidence: override ? Math.max(0.9, detected.confidence) : detected.confidence,
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
  const primaryService = signals.primaryService?.trim();
  return [...new Set([...(primaryService ? [primaryService] : []), ...extracted, ...definition.services])].slice(0, 6);
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
