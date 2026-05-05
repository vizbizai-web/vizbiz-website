import { runAudit } from "./runner";
import type { AuditReport, AviBand, BusinessCategory, ClientInput, RevenueOpportunityProjection } from "./types";

export interface MiniAuditReport {
  id: string;
  auditId: string;
  slug: string;
  client: {
    id: string;
    name: string;
    websiteUrl: string | null;
    city: string;
    market: string | null;
    primaryMake: string | null;
  };
  aviScore: number;
  band: AviBand;
  promptsTotal: number;
  promptsAppeared: number;
  competitiveRank: number | null;
  competitorCount: number;
  aiRecommendationShare: number | null;
  revenueOpportunityGap: MiniRevenueGap | null;
  topVisibilityGaps: MiniVisibilityGap[];
  leaderboard: MiniLeaderboardRow[];
  lockedSections: string[];
  ctas: MiniReportCtas;
  disclaimer: string;
  createdAt: string;
}

export interface MiniRevenueGap {
  monthlyGapVsTopTwoAverage: number;
  annualGapVsTopTwoAverage: number;
  monthlyGapVsTopCompetitor: number;
  annualGapVsTopCompetitor: number;
  topCompetitorName: string;
  topTwoAverageShare: number;
  assumptions: RevenueOpportunityProjection["assumptions"];
}

export interface MiniVisibilityGap {
  category: BusinessCategory;
  score: number;
  label: string;
}

export interface MiniLeaderboardRow {
  name: string;
  websiteUrl?: string | null;
  aviScore: number;
  aiRecommendationShare: number | null;
  kind: "client" | "competitor";
  rank: number;
}

export interface MiniReportCtas {
  fullReport: {
    label: string;
    product: "full_report_fix_package";
  };
  monthlyMonitoring: {
    label: string;
    product: "monthly_ai_visibility_monitoring";
    recommended: boolean;
  };
}

const LOCKED_SECTIONS = [
  "Full prompt-level evidence",
  "Raw AI/search results",
  "Competitor-by-competitor gap breakdown",
  "Complete Revenue Opportunity Gap™ model",
  "Schema, FAQ, llms.txt, and technical fix package",
];

export async function runMiniAudit(input: ClientInput): Promise<MiniAuditReport> {
  const audit = await runAudit(input);
  return createMiniReportFromAudit(audit);
}

export function createMiniReportFromAudit(audit: AuditReport): MiniAuditReport {
  const leaderboard = createLeaderboard(audit);
  const clientRow = leaderboard.find((row) => row.kind === "client");
  const revenueOpportunityGap = audit.revenueOpportunity ? createRevenueGap(audit.revenueOpportunity) : null;

  return {
    id: `mini_${crypto.randomUUID()}`,
    auditId: audit.id,
    slug: `${audit.client.slug}-${shortId()}`,
    client: {
      id: audit.client.id,
      name: audit.client.name,
      websiteUrl: audit.client.websiteUrl,
      city: audit.client.city,
      market: audit.client.market,
      primaryMake: audit.client.primaryMake,
    },
    aviScore: audit.aviScore,
    band: audit.band,
    promptsTotal: audit.promptsTotal,
    promptsAppeared: audit.promptsAppeared,
    competitiveRank: audit.revenueOpportunity ? (clientRow?.rank ?? null) : null,
    competitorCount: audit.revenueOpportunity?.competitors.length ?? 0,
    aiRecommendationShare: audit.revenueOpportunity?.clientAiRecommendationShare ?? null,
    revenueOpportunityGap,
    topVisibilityGaps: audit.categoryBreakdown
      .slice()
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((gap) => ({ category: gap.category, score: gap.score, label: labelForGap(gap.category) })),
    leaderboard,
    lockedSections: LOCKED_SECTIONS,
    ctas: {
      fullReport: {
        label: "Unlock Full AVI Report + Fix Package",
        product: "full_report_fix_package",
      },
      monthlyMonitoring: {
        label: "Start Monthly AI Visibility Monitoring",
        product: "monthly_ai_visibility_monitoring",
        recommended: true,
      },
    },
    disclaimer: "Directional estimate based on AI visibility share, average gross, and AI/search-influenced buyer assumptions. Not a revenue guarantee.",
    createdAt: new Date().toISOString(),
  };
}

function createLeaderboard(audit: AuditReport): MiniLeaderboardRow[] {
  const rows: Array<Omit<MiniLeaderboardRow, "rank">> = [
    {
      name: audit.client.name,
      websiteUrl: audit.client.websiteUrl,
      aviScore: audit.aviScore,
      aiRecommendationShare: audit.revenueOpportunity?.clientAiRecommendationShare ?? null,
      kind: "client",
    },
    ...(audit.revenueOpportunity?.competitors.map((competitor) => ({
      name: competitor.name,
      websiteUrl: competitor.websiteUrl ?? null,
      aviScore: competitor.aviScore,
      aiRecommendationShare: competitor.aiRecommendationShare,
      kind: "competitor" as const,
    })) ?? []),
  ];

  return rows
    .sort((a, b) => b.aviScore - a.aviScore)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function createRevenueGap(revenue: RevenueOpportunityProjection): MiniRevenueGap {
  return {
    monthlyGapVsTopTwoAverage: revenue.monthlyGapVsTopTwoAverage,
    annualGapVsTopTwoAverage: revenue.annualGapVsTopTwoAverage,
    monthlyGapVsTopCompetitor: revenue.monthlyGapVsTopCompetitor,
    annualGapVsTopCompetitor: revenue.annualGapVsTopCompetitor,
    topCompetitorName: revenue.topCompetitor.name,
    topTwoAverageShare: revenue.topTwoAverageShare,
    assumptions: revenue.assumptions,
  };
}

function labelForGap(category: BusinessCategory) {
  const labels: Record<BusinessCategory, string> = {
    discovery: "Discovery visibility is underperforming against the market.",
    trust: "Trust and review signals need stronger AI-readable proof.",
    service: "Service-related AI visibility needs more supporting context.",
    inventory: "Inventory/new-used vehicle context is not strong enough yet.",
    finance: "Finance, trade-in, and payment-intent prompts are weak.",
  };
  return labels[category];
}

function shortId() {
  return crypto.randomUUID().slice(0, 8);
}
