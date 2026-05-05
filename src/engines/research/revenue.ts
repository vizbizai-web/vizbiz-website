import type { CompetitorBenchmark, RevenueAssumptions, RevenueOpportunityProjection } from "./types";

const DEFAULT_MONTHLY_UNITS_SOLD = 80;
const DEFAULT_AVERAGE_GROSS_PER_VEHICLE = 3500;
const DEFAULT_AI_INFLUENCED_BUYER_SHARE = 0.2;
const DEFAULT_GAMMA = 2;
const SCENARIO_SHARES = {
  conservative: 0.1,
  likely: 0.2,
  aggressive: 0.3,
};

export interface RevenueOpportunityInput {
  clientName: string;
  clientAviScore: number;
  competitors: CompetitorBenchmark[];
  assumptions?: RevenueAssumptions;
}

export function calculateRevenueOpportunity(input: RevenueOpportunityInput): RevenueOpportunityProjection | null {
  const competitors = input.competitors.filter((competitor) => Number.isFinite(competitor.aviScore));
  if (!competitors.length) return null;

  const assumptions = normalizeAssumptions(input.assumptions);
  const scoredEntities = [
    { name: input.clientName, aviScore: clampScore(input.clientAviScore), kind: "client" as const },
    ...competitors.map((competitor) => ({ ...competitor, aviScore: clampScore(competitor.aviScore), kind: "competitor" as const })),
  ];
  const totalWeight = scoredEntities.reduce((sum, entity) => sum + Math.pow(entity.aviScore, assumptions.gamma), 0) || 1;
  const scoredCompetitors = competitors
    .map((competitor) => {
      const aviScore = clampScore(competitor.aviScore);
      return { name: competitor.name, websiteUrl: competitor.websiteUrl, aviScore, aiRecommendationShare: Math.pow(aviScore, assumptions.gamma) / totalWeight };
    })
    .sort((a, b) => b.aiRecommendationShare - a.aiRecommendationShare);
  const clientAiRecommendationShare = Math.pow(scoredEntities[0].aviScore, assumptions.gamma) / totalWeight;
  const monthlyAiOpportunityPool = money(assumptions.monthlyUnitsSold * assumptions.averageGrossPerVehicle * assumptions.aiInfluencedBuyerShare);
  const topCompetitor = scoredCompetitors[0];
  const topTwo = scoredCompetitors.slice(0, 2);
  const topTwoAverageShare = topTwo.reduce((sum, competitor) => sum + competitor.aiRecommendationShare, 0) / topTwo.length;
  const gapVsTopCompetitorShare = Math.max(0, topCompetitor.aiRecommendationShare - clientAiRecommendationShare);
  const gapVsTopTwoAverageShare = Math.max(0, topTwoAverageShare - clientAiRecommendationShare);
  const monthlyGapVsTopCompetitor = money(monthlyAiOpportunityPool * gapVsTopCompetitorShare);
  const monthlyGapVsTopTwoAverage = money(monthlyAiOpportunityPool * gapVsTopTwoAverageShare);

  return {
    method: "visibility_share_gamma_v1",
    disclaimer: "Directional estimate based on AI visibility share, not a guarantee of revenue or sales performance.",
    assumptions,
    competitors: scoredCompetitors,
    clientAiRecommendationShare,
    monthlyAiOpportunityPool,
    topCompetitor,
    topTwoAverageShare,
    monthlyGapVsTopCompetitor,
    annualGapVsTopCompetitor: money(monthlyAiOpportunityPool * gapVsTopCompetitorShare * 12),
    monthlyGapVsTopTwoAverage,
    annualGapVsTopTwoAverage: money(monthlyAiOpportunityPool * gapVsTopTwoAverageShare * 12),
    scenarios: {
      conservative: scenario(input, SCENARIO_SHARES.conservative),
      likely: scenario(input, assumptions.aiInfluencedBuyerShare),
      aggressive: scenario(input, SCENARIO_SHARES.aggressive),
    },
  };
}

function scenario(input: RevenueOpportunityInput, aiInfluencedBuyerShare: number) {
  const assumptions = normalizeAssumptions({ ...input.assumptions, aiInfluencedBuyerShare });
  const competitors = input.competitors.filter((competitor) => Number.isFinite(competitor.aviScore));
  const weights = [clampScore(input.clientAviScore), ...competitors.map((competitor) => clampScore(competitor.aviScore))].map((score) => Math.pow(score, assumptions.gamma));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const clientShare = weights[0] / totalWeight;
  const competitorShares = weights.slice(1).sort((a, b) => b - a).map((weight) => weight / totalWeight);
  const topTwo = competitorShares.slice(0, 2);
  const topTwoAverageShare = topTwo.reduce((sum, share) => sum + share, 0) / Math.max(topTwo.length, 1);
  const monthlyPool = assumptions.monthlyUnitsSold * assumptions.averageGrossPerVehicle * assumptions.aiInfluencedBuyerShare;
  const gapShare = Math.max(0, topTwoAverageShare - clientShare);
  const monthlyGapVsTopTwoAverage = money(monthlyPool * gapShare);
  return {
    aiInfluencedBuyerShare,
    monthlyGapVsTopTwoAverage,
    annualGapVsTopTwoAverage: money(monthlyPool * gapShare * 12),
  };
}

function normalizeAssumptions(assumptions?: RevenueAssumptions): Required<RevenueAssumptions> {
  return {
    monthlyUnitsSold: positiveOrDefault(assumptions?.monthlyUnitsSold, DEFAULT_MONTHLY_UNITS_SOLD),
    averageGrossPerVehicle: positiveOrDefault(assumptions?.averageGrossPerVehicle, DEFAULT_AVERAGE_GROSS_PER_VEHICLE),
    aiInfluencedBuyerShare: ratioOrDefault(assumptions?.aiInfluencedBuyerShare, DEFAULT_AI_INFLUENCED_BUYER_SHARE),
    gamma: positiveOrDefault(assumptions?.gamma, DEFAULT_GAMMA),
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function positiveOrDefault(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function ratioOrDefault(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1 ? value : fallback;
}

function money(value: number) {
  return Math.round(value);
}
