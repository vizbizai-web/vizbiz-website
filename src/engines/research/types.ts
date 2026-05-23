import type { BusinessProfile } from "@/engines/business-profile/profile";

export type BusinessCategory = "discovery" | "trust" | "service" | "inventory" | "finance";
export type AviBand = "Strong" | "Moderate" | "Weak" | "Not Visible";
export type PlatformName = "tavily" | "openai" | "perplexity" | "firecrawl" | "playwright" | "fallback";

export interface ClientInput {
  id?: string;
  name: string;
  slug?: string;
  businessType?: string;
  websiteUrl?: string;
  city: string;
  market?: string;
  primaryMake?: string;
  vehicle?: string;
  primaryService?: string;
  services?: string[];
  competitors?: CompetitorBenchmark[];
  revenueAssumptions?: RevenueAssumptions;
}

export interface CompetitorBenchmark {
  name: string;
  websiteUrl?: string;
  aviScore: number;
}

export interface GooglePlaceProfile {
  placeId: string | null;
  displayName: string | null;
  formattedAddress: string | null;
  cityMatch: boolean | null;
  websiteUri: string | null;
  websiteMatch: boolean | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  businessStatus: string | null;
  types: string[];
  location: {
    lat: number | null;
    lng: number | null;
  };
}

export interface GooglePlaceCompetitorValidation {
  name: string;
  source: "client_provided" | "operator_approved" | "auto_suggested_internal";
  validationStatus: "validated" | "needs_review" | "not_found";
  googlePlace: GooglePlaceProfile & {
    distanceFromClientKm: number | null;
    categoryMatch: boolean | null;
  };
}

export interface LocalEntityTrustScore {
  score: number;
  band: "Strong" | "Building" | "Thin" | "Unavailable";
  signals: string[];
  opportunities: string[];
}

export interface GooglePlacesEnrichment {
  status: "completed" | "unavailable" | "failed";
  competitorMode: "client_only" | "client_provided" | "operator_approved";
  client: GooglePlaceProfile;
  competitors: GooglePlaceCompetitorValidation[];
  suggestedCompetitorsInternalOnly: GooglePlaceCompetitorValidation[];
  localEntityTrustScore: LocalEntityTrustScore;
  notes: string[];
}

export interface RevenueAssumptions {
  monthlyUnitsSold?: number;
  averageGrossPerVehicle?: number;
  aiInfluencedBuyerShare?: number;
  gamma?: number;
}

export interface RevenueScenario {
  aiInfluencedBuyerShare: number;
  monthlyGapVsTopTwoAverage: number;
  annualGapVsTopTwoAverage: number;
}

export interface RevenueOpportunityProjection {
  method: "visibility_share_gamma_v1";
  disclaimer: string;
  assumptions: Required<RevenueAssumptions>;
  competitors: Array<CompetitorBenchmark & { aiRecommendationShare: number }>;
  clientAiRecommendationShare: number;
  monthlyAiOpportunityPool: number;
  topCompetitor: CompetitorBenchmark & { aiRecommendationShare: number };
  topTwoAverageShare: number;
  monthlyGapVsTopCompetitor: number;
  annualGapVsTopCompetitor: number;
  monthlyGapVsTopTwoAverage: number;
  annualGapVsTopTwoAverage: number;
  scenarios: {
    conservative: RevenueScenario;
    likely: RevenueScenario;
    aggressive: RevenueScenario;
  };
}

export interface AuditClient {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  websiteUrl: string | null;
  city: string;
  market: string | null;
  primaryMake: string | null;
}

export type PromptIntentBucket =
  | "category_discovery"
  | "conversational_recommendation"
  | "occasion_context"
  | "menu_service_intent"
  | "trust_review_comparison"
  | "branded_entity";

export type PromptSource = "search_backed" | "vertical_pack" | "ai_native_variant" | "client_entity" | "competitor_supplied";

export interface PromptTemplate {
  id: string;
  category: BusinessCategory;
  platform: "tavily" | "openai" | "perplexity";
  prompt: string;
  weight: number;
  intentBucket?: PromptIntentBucket;
  source?: PromptSource;
  clientFacingQuestion?: string;
  showInFreeReport?: boolean;
}

export interface PromptRunResult {
  promptId: string;
  prompt: string;
  category: BusinessCategory;
  platform: PlatformName;
  targetName: string;
  score: number | null;
  position: number | null;
  snippet: string | null;
  competitors: string[];
  rawResponse: unknown;
  error: string | null;
  intentBucket?: PromptIntentBucket;
  source?: PromptSource;
  clientFacingQuestion?: string;
  showInFreeReport?: boolean;
}

export interface CategoryBreakdown {
  category: BusinessCategory;
  score: number;
  promptsTotal: number;
  promptsScored: number;
  weight: number;
}

export interface MachineReadinessCheck {
  key: string;
  label: string;
  passed: boolean;
  points: number;
  evidence: string;
}

export interface MachineReadiness {
  schemaPresent: boolean;
  titleH1Clarity: boolean;
  footerNapConsistent: boolean;
  heroContactAccessible: boolean;
  contentDepth: "thin" | "adequate" | "unknown";
  score: number;
  checks: MachineReadinessCheck[];
}

export interface SeoSiteSignals {
  name: string;
  url: string;
  fetched: boolean;
  title: string;
  h1: string;
  wordCount: number;
  schemaTypes: string[];
  hasRobots: boolean;
  hasSitemap: boolean;
  hasFaqPattern: boolean;
  socialProfiles: string[];
}

export interface SeoTechnicalCheck {
  key: string;
  label: string;
  passed: boolean;
  points: number;
  evidence: string;
}

export interface LlmReadinessCheck {
  key: string;
  label: string;
  passed: boolean;
  evidence: string;
}

export interface LlmReadiness {
  score: number;
  band: "Strong" | "Building" | "Thin" | "Unavailable";
  summary: string;
  checks: LlmReadinessCheck[];
  strengths: string[];
  opportunities: string[];
}

export interface SeoContentBrief {
  title: string;
  intent: string;
  recommendedSections: string[];
  source: "seo-audit" | "competitor-analysis";
}

export interface SeoCompetitorFinding {
  competitor: string;
  finding: string;
  advantage: "client" | "competitor" | "unknown";
}

export interface SeoAutomationStep {
  tool: string;
  use: string;
  pipelineStage: "site_audit" | "proof_and_qa" | "competitor_research" | "operator_context";
}

export interface SeoSiteIntelligence {
  score: number;
  crawlSource: "built_in_fetch" | "none";
  generatedAt: string;
  target: SeoSiteSignals | null;
  competitors: SeoSiteSignals[];
  technicalChecks: SeoTechnicalCheck[];
  llmReadiness: LlmReadiness;
  contentBriefs: SeoContentBrief[];
  competitorFindings: SeoCompetitorFinding[];
  automation: SeoAutomationStep[];
  notes: string[];
}

export interface AuditReport {
  id: string;
  client: AuditClient;
  status: "running" | "completed" | "failed";
  aviScore: number;
  band: AviBand;
  discoveryScore: number;
  trustScore: number;
  serviceScore: number;
  inventoryScore: number;
  financeScore: number;
  competitorGapScore: number;
  primaryCompetitor: string | null;
  promptsTotal: number;
  promptsAppeared: number;
  categoryBreakdown: CategoryBreakdown[];
  promptResults: PromptRunResult[];
  machineReadiness: MachineReadiness;
  seoSiteIntelligence: SeoSiteIntelligence;
  googlePlaces: GooglePlacesEnrichment;
  clientDeliverables?: import("@/engines/deliverables/client-output").ClientDeliverables;
  businessProfile?: BusinessProfile;
  revenueOpportunity: RevenueOpportunityProjection | null;
  createdAt: string;
  completedAt: string | null;
}
