export type BusinessCategory = "discovery" | "trust" | "service" | "inventory" | "finance";
export type AviBand = "Strong" | "Moderate" | "Weak" | "Not Visible";
export type PlatformName = "tavily" | "openai" | "firecrawl" | "playwright" | "fallback";

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
  competitors?: CompetitorBenchmark[];
  revenueAssumptions?: RevenueAssumptions;
}

export interface CompetitorBenchmark {
  name: string;
  websiteUrl?: string;
  aviScore: number;
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

export interface PromptTemplate {
  id: string;
  category: BusinessCategory;
  platform: "tavily" | "openai";
  prompt: string;
  weight: number;
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
  revenueOpportunity: RevenueOpportunityProjection | null;
  createdAt: string;
  completedAt: string | null;
}
