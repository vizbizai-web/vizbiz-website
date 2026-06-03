import { describe, expect, it } from "vitest";
import type { CrawledPageEvidence } from "@/engines/research/business-intelligence-types";
import { extractEvidenceFromPages } from "@/engines/research/evidence-extractor";
import { resolveBusinessIntelligenceProfile } from "./business-intelligence-profile";

function page(url: string, fields: Partial<CrawledPageEvidence>): CrawledPageEvidence {
  return {
    url,
    title: "",
    metaDescription: "",
    h1: "",
    h2s: [],
    schemaTypes: [],
    servicePhrases: [],
    productPhrases: [],
    locationPhrases: [],
    customerTypePhrases: [],
    faqQuestions: [],
    ctaLanguage: [],
    reviewSnippets: [],
    discoveredLinks: [],
    bodyText: "",
    fetched: true,
    error: null,
    ...fields,
  };
}

const google = (primaryType: string, websiteMatch: "exact" | "same_domain" | "mismatch" | "missing" = "same_domain") => ({
  placeId: "places/123",
  canonicalName: "Example Co",
  primaryType,
  types: [primaryType, "point_of_interest", "establishment"],
  rating: 4.8,
  reviewCount: 80,
  websiteUrl: "https://example.com",
  websiteMatch,
  address: "123 Main St, Oakville, ON",
  mapsUrl: "https://maps.example",
  confidence: 85,
  evidence: [`Google category ${primaryType}`],
});

describe("Business Intelligence Profile resolver", () => {
  it("builds a known tax/accounting profile from Google, site, and competitor evidence", () => {
    const crawl = extractEvidenceFromPages("taxpro.example", [
      page("https://taxpro.example", { title: "Oakville Tax Preparation and Accounting", h1: "Tax preparation for small businesses", bodyText: "Tax preparation, bookkeeping, payroll, personal tax returns, and corporate tax filing in Oakville.", schemaTypes: ["AccountingService"] }),
      page("https://taxpro.example/services", { h1: "Bookkeeping and corporate tax filing", bodyText: "Our accounting team handles bookkeeping, payroll, and HST filing." }),
    ]);

    const profile = resolveBusinessIntelligenceProfile({
      intake: { name: "TaxPro", city: "Oakville", websiteUrl: "https://taxpro.example", primaryService: "tax preparation" },
      google: google("accounting"),
      clientCrawl: crawl,
      competitors: [{ submittedName: "Ledger Plus", resolvedName: "Ledger Plus", googleTypes: ["accounting"], websiteUrl: "https://ledger.example", websiteMatchConfidence: 1, extractedServices: crawl.extractedServices, overlappingTermsWithClient: ["tax preparation", "bookkeeping"], differentiatingTerms: [], confidence: 85, reviewCount: 50, rating: 4.7 }],
    });

    expect(profile.profileMode).toBe("known");
    expect(profile.displayNiche).toBe("tax and accounting service");
    expect(profile.primaryServices).toEqual(expect.arrayContaining(["tax preparation", "bookkeeping"]));
    expect(profile.needsOperatorReview).toBe(false);
    expect(profile.confidence).toBeGreaterThanOrEqual(75);
  });

  it("builds a dynamic landscaping/new niche profile and never exposes generic local service", () => {
    const crawl = extractEvidenceFromPages("greenoak.example", [
      page("https://greenoak.example", { title: "Green Oak Landscaping and Lawn Care", h1: "Landscaping services in Oakville", h2s: ["Garden design", "Snow removal"], bodyText: "Landscaping, lawn care, garden design, sod installation, and snow removal for homeowners." }),
      page("https://greenoak.example/services", { h1: "Lawn care and garden design", bodyText: "Our landscaping services include lawn care and garden design." }),
    ]);

    const profile = resolveBusinessIntelligenceProfile({
      intake: { name: "Green Oak", city: "Oakville", websiteUrl: "https://greenoak.example", primaryService: "landscaping" },
      google: google("landscaper"),
      clientCrawl: crawl,
      competitors: [{ submittedName: "Yard Crew", resolvedName: "Yard Crew", googleTypes: ["landscaper"], websiteUrl: "https://yard.example", websiteMatchConfidence: 1, extractedServices: crawl.extractedServices, overlappingTermsWithClient: ["landscaping", "lawn care"], differentiatingTerms: ["tree trimming"], confidence: 80, reviewCount: 30, rating: 4.6 }],
    });

    expect(profile.displayNiche).toBe("landscaping service");
    expect(profile.primaryServices).toContain("landscaping");
    expect(profile.needsOperatorReview).toBe(false);
    expect(`${profile.displayNiche} ${profile.primaryServices.join(" ")}`).not.toMatch(/generic local service|local business/);
  });

  it("marks ambiguous generic inputs as needs_review", () => {
    const crawl = extractEvidenceFromPages("generic.example", [page("https://generic.example", { title: "Trusted Local Service", h1: "Quality services", bodyText: "Contact our local business for services, quotes, and appointments." })]);

    const profile = resolveBusinessIntelligenceProfile({
      intake: { name: "Generic Co", city: "Oakville", websiteUrl: "https://generic.example", businessType: "local service" },
      google: null,
      clientCrawl: crawl,
    });

    expect(profile.profileMode).toBe("needs_review");
    expect(profile.needsOperatorReview).toBe(true);
    expect(profile.primaryServices).toEqual([]);
    expect(profile.contradictions.join(" ")).toMatch(/No specific service/);
  });

  it("requires review on Google/site contradictions", () => {
    const crawl = extractEvidenceFromPages("smiles.example", [page("https://smiles.example", { title: "Family Dental Clinic", h1: "Emergency dental and teeth whitening", bodyText: "Family dentistry, emergency dental, teeth whitening, and dental implants.", schemaTypes: ["Dentist"] })]);

    const profile = resolveBusinessIntelligenceProfile({
      intake: { name: "Smiles", city: "Oakville", websiteUrl: "https://smiles.example" },
      google: google("restaurant", "mismatch"),
      clientCrawl: crawl,
    });

    expect(profile.profileMode).toBe("needs_review");
    expect(profile.needsOperatorReview).toBe(true);
    expect(profile.contradictions.join(" ")).toMatch(/conflicts|does not match/);
    expect(profile.primaryServices).toContain("emergency dental");
  });
});
