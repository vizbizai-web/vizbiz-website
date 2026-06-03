import type { ClientInput } from "@/engines/research/types";
import type { BusinessIntelligenceProfile, CompetitorEvidence, EvidenceTerm, GoogleBusinessEvidence, ProfileEvidence, WebsiteCrawlEvidence } from "@/engines/research/business-intelligence-types";

const GENERIC_LABELS = new Set(["local service", "service", "services", "local business", "generic local service", "service provider"]);
const GENERIC_GOOGLE_TYPES = new Set(["point_of_interest", "establishment", "store", "health"]);

const CATEGORY_LABELS: Record<string, { label: string; schemaType: string; services: string[]; intent: string[] }> = {
  accounting: { label: "tax and accounting service", schemaType: "AccountingService", services: ["tax preparation", "bookkeeping", "payroll"], intent: ["discovery", "trust", "tax filing", "deadline", "pricing"] },
  accountant: { label: "tax and accounting service", schemaType: "AccountingService", services: ["tax preparation", "bookkeeping", "payroll"], intent: ["discovery", "trust", "tax filing", "deadline", "pricing"] },
  tax_preparation_service: { label: "tax preparation service", schemaType: "AccountingService", services: ["tax preparation", "personal tax returns", "corporate tax filing"], intent: ["discovery", "trust", "tax filing", "deadline", "pricing"] },
  landscaper: { label: "landscaping service", schemaType: "LocalBusiness", services: ["landscaping", "lawn care", "garden design"], intent: ["discovery", "trust", "service", "seasonal", "pricing"] },
  landscaping: { label: "landscaping service", schemaType: "LocalBusiness", services: ["landscaping", "lawn care", "garden design"], intent: ["discovery", "trust", "service", "seasonal", "pricing"] },
  dentist: { label: "dentist", schemaType: "Dentist", services: ["family dentistry", "emergency dental", "teeth whitening"], intent: ["discovery", "trust", "procedure", "emergency", "cost"] },
  roofing_contractor: { label: "roofing contractor", schemaType: "RoofingContractor", services: ["roof repair", "roof replacement"], intent: ["discovery", "trust", "emergency", "replacement", "cost"] },
  plumber: { label: "plumber", schemaType: "Plumber", services: ["plumbing repair", "drain cleaning"], intent: ["discovery", "trust", "emergency", "repair", "cost"] },
  restaurant: { label: "restaurant", schemaType: "Restaurant", services: ["dining", "takeout"], intent: ["discovery", "trust", "menu", "near_me", "value"] },
};

export interface ResolveBusinessIntelligenceProfileInput {
  intake: ClientInput;
  google?: GoogleBusinessEvidence | null;
  clientCrawl?: WebsiteCrawlEvidence | null;
  competitors?: CompetitorEvidence[];
}

export function resolveBusinessIntelligenceProfile(input: ResolveBusinessIntelligenceProfileInput): BusinessIntelligenceProfile {
  const evidence: ProfileEvidence[] = [];
  const contradictions: string[] = [];
  const competitors = input.competitors ?? [];
  const googleTypes = input.google?.types ?? [];
  const primaryGoogleType = input.google?.primaryType ?? googleTypes.find((type) => !GENERIC_GOOGLE_TYPES.has(type)) ?? null;
  const googleCategory = primaryGoogleType ? CATEGORY_LABELS[primaryGoogleType]?.label ?? typeToLabel(primaryGoogleType) : null;
  const siteServices = input.clientCrawl?.extractedServices ?? [];
  const intakeService = cleanLabel(input.intake.primaryService ?? input.intake.businessType ?? "");
  const competitorOverlap = termsByCompetitorOverlap(competitors);

  let score = 20;
  if (googleCategory) {
    score += 20;
    evidence.push({ source: "google_places", label: "Google category", value: googleCategory, confidenceImpact: 20 });
  }
  if (intakeService && isSpecificLabel(intakeService)) {
    score += 15;
    evidence.push({ source: "intake", label: "Submitted service/category", value: intakeService, confidenceImpact: 15 });
  }
  const homepageTerm = siteServices.find((term) => term.sources.some((source) => ["title", "h1"].includes(source.field)));
  if (homepageTerm) {
    score += 20;
    evidence.push({ source: "client_site", label: "Homepage service evidence", value: homepageTerm.term, confidenceImpact: 20 });
  }
  const servicePageTerm = siteServices.find((term) => term.sources.some((source) => /service|tax|account|landscap|lawn|bookkeeping|about/i.test(source.url) || source.field === "h2"));
  if (servicePageTerm) {
    score += 20;
    evidence.push({ source: "client_site", label: "Service page evidence", value: servicePageTerm.term, confidenceImpact: 20 });
  }
  if (input.clientCrawl?.schemaTypes.length) {
    score += 10;
    evidence.push({ source: "client_site", label: "Schema evidence", value: input.clientCrawl.schemaTypes.slice(0, 3).join(", "), confidenceImpact: 10 });
  }
  if (competitorOverlap.length) {
    score += 15;
    evidence.push({ source: "competitor_site", label: "Supplied competitor overlap", value: competitorOverlap.slice(0, 5).join(", "), confidenceImpact: 15 });
  }
  if (!input.clientCrawl || input.clientCrawl.confidence < 30) {
    score -= 20;
    evidence.push({ source: "client_site", label: "Website crawl", value: "Unavailable or thin", confidenceImpact: -20 });
  }
  if (input.google?.websiteMatch === "mismatch") {
    score -= 25;
    contradictions.push("Google Places website does not match submitted website.");
    evidence.push({ source: "google_places", label: "Website mismatch", value: "Submitted website conflicts with Google website", confidenceImpact: -25 });
  }

  const topSiteTerm = pickTopTerm([...
    siteServices.filter((term) => isSpecificLabel(term.term)),
    ...competitorOverlap.map((term) => ({ term, count: 2, sources: [] as EvidenceTerm["sources"] })),
  ]);
  const categoryTerms = primaryGoogleType ? CATEGORY_LABELS[primaryGoogleType]?.services ?? [] : [];
  const candidateLabel = chooseDisplayNiche({ siteTerm: topSiteTerm?.term ?? null, googleCategory, intakeService });
  const canonicalCategory = googleCategory ?? categoryFromTerm(candidateLabel) ?? candidateLabel;

  if (googleCategory && topSiteTerm && !categoryCompatible(googleCategory, topSiteTerm.term)) {
    contradictions.push(`Google category (${googleCategory}) conflicts with website service evidence (${topSiteTerm.term}).`);
    score -= 25;
  }

  const primaryServices = unique([
    ...(topSiteTerm ? [topSiteTerm.term] : []),
    ...siteServices.map((term) => term.term),
    ...competitorOverlap,
    ...categoryTerms,
    ...(isSpecificLabel(intakeService) ? [intakeService] : []),
  ]).filter(isSpecificLabel).slice(0, 6);

  if (!primaryServices.length) contradictions.push("No specific service/product term could be verified from intake, Google, site, or supplied competitors.");

  const displayNiche = isSpecificLabel(candidateLabel) ? candidateLabel : primaryServices[0] ? `${primaryServices[0]} service` : "needs review";
  const containsGenericClientFacing = Array.from(GENERIC_LABELS).some((generic) => displayNiche.toLowerCase() === generic || primaryServices.some((service) => service.toLowerCase() === generic));
  if (containsGenericClientFacing) contradictions.push("Resolver would expose generic local-service language.");

  const confidence = Math.max(0, Math.min(100, Math.round(score)));
  const needsOperatorReview = confidence < 60 || contradictions.length > 0 || !primaryServices.length || containsGenericClientFacing || Boolean(input.google?.websiteMatch === "mismatch");
  const profileMode: BusinessIntelligenceProfile["profileMode"] = needsOperatorReview ? "needs_review" : googleCategory && categoryCompatible(googleCategory, displayNiche) ? "known" : "dynamic";
  const locations = unique([input.intake.market, input.intake.city, ...(input.clientCrawl?.extractedLocations.map((term) => titleCase(term.term)) ?? [])].filter(Boolean) as string[]).slice(0, 5);

  return {
    profileMode,
    displayNiche,
    canonicalCategory,
    schemaType: schemaFor(canonicalCategory, input.clientCrawl?.schemaTypes),
    primaryServices,
    secondaryServices: siteServices.map((term) => term.term).filter((term) => !primaryServices.includes(term)).slice(0, 8),
    products: input.clientCrawl?.extractedProducts.map((term) => term.term).slice(0, 8) ?? [],
    customerTypes: input.clientCrawl?.extractedCustomerTypes.map((term) => term.term).slice(0, 8) ?? [],
    locations,
    buyerIntentCategories: CATEGORY_LABELS[primaryGoogleType ?? ""]?.intent ?? ["discovery", "trust", "service", "comparison", "pricing"],
    humanQuestionSeeds: buildQuestionSeeds(input.intake.name, locations[0] ?? input.intake.city, primaryServices, displayNiche),
    confidence,
    evidence,
    contradictions,
    needsOperatorReview,
  };
}

function chooseDisplayNiche(values: { siteTerm: string | null; googleCategory: string | null; intakeService: string }) {
  if (values.googleCategory && values.siteTerm && categoryCompatible(values.googleCategory, values.siteTerm)) return values.googleCategory;
  if (values.siteTerm) return values.siteTerm.endsWith("service") ? values.siteTerm : `${values.siteTerm} service`;
  if (values.googleCategory) return values.googleCategory;
  if (isSpecificLabel(values.intakeService)) return values.intakeService;
  return "needs review";
}

function termsByCompetitorOverlap(competitors: CompetitorEvidence[]) {
  const counts = new Map<string, number>();
  for (const competitor of competitors) for (const term of competitor.overlappingTermsWithClient) counts.set(term, (counts.get(term) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([term]) => term);
}

function pickTopTerm(terms: EvidenceTerm[]) {
  return terms.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))[0] ?? null;
}

function cleanLabel(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/[^a-z0-9&/ +.-]+/g, " ").replace(/\s+/g, " ").trim();
}

function isSpecificLabel(value: string) {
  const cleaned = cleanLabel(value);
  return cleaned.length >= 4 && !GENERIC_LABELS.has(cleaned) && cleaned !== "needs review";
}

function typeToLabel(type: string) {
  return type.replace(/_/g, " ");
}

function categoryFromTerm(term: string) {
  if (/tax|account|bookkeep|payroll/.test(term)) return "tax and accounting service";
  if (/landscap|lawn|garden|snow removal|sod/.test(term)) return "landscaping service";
  if (/dental|dentist|teeth/.test(term)) return "dentist";
  if (/roof/.test(term)) return "roofing contractor";
  return null;
}

function categoryCompatible(category: string, term: string) {
  const left = categoryFromTerm(category) ?? category;
  const right = categoryFromTerm(term) ?? term;
  if (left === right) return true;
  return left.split(/\s+/).some((word) => word.length > 4 && right.includes(word)) || right.split(/\s+/).some((word) => word.length > 4 && left.includes(word));
}

function schemaFor(category: string, schemaTypes?: string[]) {
  const existing = schemaTypes?.find((schema) => /AccountingService|Dentist|Restaurant|RoofingContractor|Plumber|HVACBusiness|LocalBusiness|Organization/i.test(schema));
  if (existing) return existing;
  if (/tax|account/.test(category)) return "AccountingService";
  if (/dent/.test(category)) return "Dentist";
  if (/roof/.test(category)) return "RoofingContractor";
  if (/plumb/.test(category)) return "Plumber";
  return "LocalBusiness";
}

function buildQuestionSeeds(businessName: string, city: string, services: string[], displayNiche: string) {
  const service = services[0] ?? displayNiche;
  if (!isSpecificLabel(service)) return [];
  return [
    `I’m in ${city} and need help with ${service}. Who should I consider?`,
    `Which ${service} provider near ${city} seems trustworthy?`,
    `How should I compare ${service} providers near ${city} before choosing one?`,
    `Where can I get ${services.slice(0, 3).join(", ") || service} near ${city}?`,
    `Is ${businessName} a good choice for ${service} in ${city}?`,
  ];
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
