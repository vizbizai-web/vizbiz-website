export type EvidenceSourceField = "title" | "meta" | "h1" | "h2" | "body" | "schema" | "faq";

export interface EvidenceTerm {
  term: string;
  count: number;
  sources: Array<{ url: string; field: EvidenceSourceField }>;
}

export interface CrawledPageEvidence {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  schemaTypes: string[];
  servicePhrases: EvidenceTerm[];
  productPhrases: EvidenceTerm[];
  locationPhrases: EvidenceTerm[];
  customerTypePhrases: EvidenceTerm[];
  faqQuestions: string[];
  ctaLanguage: string[];
  reviewSnippets: string[];
  discoveredLinks: string[];
  bodyText: string;
  fetched: boolean;
  error: string | null;
}

export interface WebsiteCrawlEvidence {
  domain: string;
  pages: CrawledPageEvidence[];
  extractedServices: EvidenceTerm[];
  extractedProducts: EvidenceTerm[];
  extractedLocations: EvidenceTerm[];
  extractedCustomerTypes: EvidenceTerm[];
  faqQuestions: string[];
  schemaTypes: string[];
  crawlErrors: string[];
  confidence: number;
}

export interface GoogleBusinessEvidence {
  placeId: string | null;
  canonicalName: string | null;
  primaryType: string | null;
  types: string[];
  rating: number | null;
  reviewCount: number | null;
  websiteUrl: string | null;
  websiteMatch: "exact" | "same_domain" | "mismatch" | "missing";
  address: string | null;
  mapsUrl: string | null;
  confidence: number;
  evidence: string[];
}

export interface CompetitorEvidence {
  submittedName: string;
  resolvedName: string | null;
  googleTypes: string[];
  websiteUrl: string | null;
  websiteMatchConfidence: number;
  extractedServices: EvidenceTerm[];
  overlappingTermsWithClient: string[];
  differentiatingTerms: string[];
  confidence: number;
  reviewCount: number | null;
  rating: number | null;
}

export interface ProfileEvidence {
  source: "intake" | "google_places" | "client_site" | "competitor_site" | "resolver";
  label: string;
  value: string;
  confidenceImpact: number;
}

export interface BusinessIntelligenceProfile {
  profileMode: "known" | "dynamic" | "needs_review";
  displayNiche: string;
  canonicalCategory: string;
  schemaType: string;
  primaryServices: string[];
  secondaryServices: string[];
  products: string[];
  customerTypes: string[];
  locations: string[];
  buyerIntentCategories: string[];
  humanQuestionSeeds: string[];
  confidence: number;
  evidence: ProfileEvidence[];
  contradictions: string[];
  needsOperatorReview: boolean;
}
