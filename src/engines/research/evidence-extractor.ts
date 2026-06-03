import type { CrawledPageEvidence, EvidenceSourceField, EvidenceTerm, WebsiteCrawlEvidence } from "./business-intelligence-types";

const GENERIC_TERMS = new Set([
  "local service", "service", "services", "solutions", "quality service", "trusted service", "appointment", "appointments",
  "consultation", "quote", "free quote", "business", "local business", "company", "contact us", "learn more", "home",
]);

const SERVICE_TERMS = [
  "tax preparation", "personal tax returns", "corporate tax filing", "tax filing", "bookkeeping", "payroll", "accounting", "tax planning", "hst filing", "gst filing",
  "landscaping", "lawn care", "garden design", "snow removal", "sod installation", "tree trimming", "interlock", "hardscaping", "yard cleanup",
  "dental implants", "teeth whitening", "emergency dental", "family dentistry", "cosmetic dentistry", "invisalign",
  "mexican food", "tacos", "burritos", "catering", "takeout", "delivery",
  "natural skincare", "aloe vera gel", "castile soap", "fragrance-free skincare", "organic skincare",
  "roof repair", "roof replacement", "plumbing repair", "drain cleaning", "water heater repair", "ac repair", "furnace repair", "hvac installation",
  "massage therapy", "physiotherapy", "chiropractic care", "pest control", "house cleaning", "moving services", "pet grooming",
];

const PRODUCT_TERMS = ["aloe vera gel", "castile soap", "vegan gummies", "sugar-free gummies", "tacos", "burritos", "new cars", "used cars", "parts"];
const CUSTOMER_TERMS = ["small businesses", "families", "homeowners", "seniors", "contractors", "new parents", "drivers", "patients", "students"];

export function extractEvidenceFromPages(domain: string, pages: CrawledPageEvidence[]): WebsiteCrawlEvidence {
  const extractedServices = mergeTerms(pages.flatMap((page) => page.servicePhrases.length ? page.servicePhrases : extractTermsFromPage(page, SERVICE_TERMS)));
  const extractedProducts = mergeTerms(pages.flatMap((page) => page.productPhrases.length ? page.productPhrases : extractTermsFromPage(page, PRODUCT_TERMS)));
  const extractedLocations = mergeTerms(pages.flatMap(extractLocationsFromPage));
  const extractedCustomerTypes = mergeTerms(pages.flatMap((page) => page.customerTypePhrases.length ? page.customerTypePhrases : extractTermsFromPage(page, CUSTOMER_TERMS)));
  const faqQuestions = unique(pages.flatMap((page) => page.faqQuestions)).slice(0, 20);
  const schemaTypes = unique(pages.flatMap((page) => page.schemaTypes)).slice(0, 20);
  const crawlErrors = pages.flatMap((page) => page.error ? [`${page.url}: ${page.error}`] : []);
  const confidence = Math.min(100, Math.round(
    (pages.some((page) => page.fetched) ? 20 : 0) +
    Math.min(30, pages.filter((page) => page.fetched).length * 6) +
    Math.min(35, extractedServices.length * 10) +
    Math.min(10, schemaTypes.length * 4) +
    (faqQuestions.length ? 5 : 0),
  ));

  return { domain, pages, extractedServices, extractedProducts, extractedLocations, extractedCustomerTypes, faqQuestions, schemaTypes, crawlErrors, confidence };
}

export function extractTermsFromPage(page: Pick<CrawledPageEvidence, "url" | "title" | "metaDescription" | "h1" | "h2s" | "bodyText" | "schemaTypes" | "faqQuestions">, dictionary = SERVICE_TERMS): EvidenceTerm[] {
  const fields: Array<{ field: EvidenceSourceField; text: string }> = [
    { field: "title", text: page.title },
    { field: "meta", text: page.metaDescription },
    { field: "h1", text: page.h1 },
    ...page.h2s.map((text) => ({ field: "h2" as const, text })),
    { field: "body", text: page.bodyText },
    { field: "schema", text: page.schemaTypes.join(" ") },
    { field: "faq", text: page.faqQuestions.join(" ") },
  ];
  const terms: EvidenceTerm[] = [];
  for (const candidate of [...dictionary, ...extractServiceLikePhrases(fields.map((item) => item.text).join(" "))]) {
    const term = normalizeTerm(candidate);
    if (!isSpecificEvidenceTerm(term) || terms.some((entry) => entry.term === term)) continue;
    const sources = fields.filter(({ text }) => text.toLowerCase().includes(term)).map(({ field }) => ({ url: page.url, field }));
    if (sources.length) terms.push({ term, count: sources.length, sources });
  }
  return terms.sort(rankTerms);
}

export function isSpecificEvidenceTerm(term: string) {
  const normalized = normalizeTerm(term);
  if (normalized.length < 4 || GENERIC_TERMS.has(normalized)) return false;
  if (/^(best|top|trusted|professional|affordable) /.test(normalized)) return false;
  if (/\b(contact|call|our|your|local business|appointment|quote)\b/.test(normalized)) return false;
  return /[a-z]/.test(normalized) && !/^(service provider|local provider|solutions provider)$/.test(normalized);
}

export function mergeTerms(terms: EvidenceTerm[]): EvidenceTerm[] {
  const map = new Map<string, EvidenceTerm>();
  for (const entry of terms) {
    const term = normalizeTerm(entry.term);
    if (!isSpecificEvidenceTerm(term)) continue;
    const existing = map.get(term) ?? { term, count: 0, sources: [] };
    existing.count += entry.count;
    existing.sources.push(...entry.sources);
    map.set(term, existing);
  }
  return Array.from(map.values()).sort(rankTerms).slice(0, 20);
}

function extractLocationsFromPage(page: CrawledPageEvidence): EvidenceTerm[] {
  const text = `${page.title} ${page.metaDescription} ${page.h1} ${page.h2s.join(" ")} ${page.bodyText}`;
  const matches = Array.from(text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})\s+(?:ON|Ontario|CA|service area|area)\b/g), (match) => match[1]);
  return matches.map((term) => ({ term: normalizeTerm(term), count: 1, sources: [{ url: page.url, field: "body" as const }] }));
}

function extractServiceLikePhrases(text: string) {
  return Array.from(text.toLowerCase().matchAll(/\b([a-z][a-z0-9& -]{2,45}\s(?:services?|repair|installation|cleaning|care|therapy|contractor|clinic|preparation|filing|planning|design|removal))\b/g), (match) => match[1]);
}

function normalizeTerm(value: string) {
  return value.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9&/ +.-]+/g, " ").replace(/\s+/g, " ").trim();
}

function rankTerms(a: EvidenceTerm, b: EvidenceTerm) {
  const priority = (term: EvidenceTerm) => term.sources.some((source) => ["title", "h1", "h2", "schema"].includes(source.field)) ? 5 : 0;
  return (b.count + priority(b)) - (a.count + priority(a)) || a.term.localeCompare(b.term);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
