import { describe, expect, it } from "vitest";
import { createMiniReportFromAudit } from "./mini-audit";
import type { AuditReport } from "./types";

const baseAudit: AuditReport = {
  id: "audit_123",
  client: {
    id: "client_oakville-toyota",
    name: "Oakville Toyota",
    slug: "oakville-toyota",
    businessType: "auto_dealer",
    websiteUrl: "https://www.oakvilletoyota.ca",
    city: "Oakville",
    market: "Oakville",
    primaryMake: "Toyota",
  },
  status: "completed",
  aviScore: 41,
  band: "Weak",
  discoveryScore: 52,
  trustScore: 30,
  serviceScore: 66,
  inventoryScore: 44,
  financeScore: 18,
  competitorGapScore: 62,
  primaryCompetitor: "Burlington Toyota",
  promptsTotal: 7,
  promptsAppeared: 3,
  categoryBreakdown: [
    { category: "discovery", score: 52, promptsTotal: 2, promptsScored: 2, weight: 1 },
    { category: "trust", score: 30, promptsTotal: 2, promptsScored: 2, weight: 1 },
    { category: "service", score: 66, promptsTotal: 1, promptsScored: 1, weight: 1 },
    { category: "inventory", score: 44, promptsTotal: 1, promptsScored: 1, weight: 1 },
    { category: "finance", score: 18, promptsTotal: 1, promptsScored: 1, weight: 1 },
  ],
  promptResults: [],
  machineReadiness: {
    schemaPresent: false,
    titleH1Clarity: true,
    footerNapConsistent: false,
    heroContactAccessible: true,
    contentDepth: "thin",
    score: 40,
    checks: [],
  },
  revenueOpportunity: {
    method: "visibility_share_gamma_v1",
    disclaimer: "Directional estimate based on AI visibility share, not a guarantee of revenue or sales performance.",
    assumptions: {
      monthlyUnitsSold: 80,
      averageGrossPerVehicle: 3500,
      aiInfluencedBuyerShare: 0.2,
      gamma: 2,
    },
    competitors: [
      { name: "Burlington Toyota", websiteUrl: "https://www.burlingtontoyota.com", aviScore: 73, aiRecommendationShare: 0.458 },
      { name: "Mississauga Toyota", websiteUrl: "https://www.mississaugatoyota.com", aviScore: 68, aiRecommendationShare: 0.398 },
    ],
    clientAiRecommendationShare: 0.144,
    monthlyAiOpportunityPool: 56000,
    topCompetitor: { name: "Burlington Toyota", websiteUrl: "https://www.burlingtontoyota.com", aviScore: 73, aiRecommendationShare: 0.458 },
    topTwoAverageShare: 0.428,
    monthlyGapVsTopCompetitor: 17560,
    annualGapVsTopCompetitor: 210715,
    monthlyGapVsTopTwoAverage: 15863,
    annualGapVsTopTwoAverage: 190354,
    scenarios: {
      conservative: { aiInfluencedBuyerShare: 0.1, monthlyGapVsTopTwoAverage: 7931, annualGapVsTopTwoAverage: 95177 },
      likely: { aiInfluencedBuyerShare: 0.2, monthlyGapVsTopTwoAverage: 15863, annualGapVsTopTwoAverage: 190354 },
      aggressive: { aiInfluencedBuyerShare: 0.3, monthlyGapVsTopTwoAverage: 23794, annualGapVsTopTwoAverage: 285531 },
    },
  },
  createdAt: "2026-05-04T00:00:00.000Z",
  completedAt: "2026-05-04T00:01:00.000Z",
};

describe("createMiniReportFromAudit", () => {
  it("turns a full audit into a sales-focused free mini report", () => {
    const report = createMiniReportFromAudit(baseAudit);

    expect(report.id).toMatch(/^mini_/);
    expect(report.auditId).toBe("audit_123");
    expect(report.client.name).toBe("Oakville Toyota");
    expect(report.slug).toMatch(/^oakville-toyota-/);
    expect(report.aviScore).toBe(41);
    expect(report.band).toBe("Weak");
    expect(report.competitiveRank).toBe(3);
    expect(report.competitorCount).toBe(2);
    expect(report.aiRecommendationShare).toBeCloseTo(0.144);
    expect(report.revenueOpportunityGap?.annualGapVsTopTwoAverage).toBe(190354);
    expect(report.topVisibilityGaps.map((gap) => gap.category)).toEqual(["finance", "trust", "inventory"]);
    expect(report.lockedSections).toContain("Full prompt-level evidence");
    expect(report.ctas.monthlyMonitoring.recommended).toBe(true);
  });

  it("does not invent a revenue gap when competitor revenue projection is missing", () => {
    const report = createMiniReportFromAudit({ ...baseAudit, revenueOpportunity: null });

    expect(report.revenueOpportunityGap).toBeNull();
    expect(report.aiRecommendationShare).toBeNull();
    expect(report.competitiveRank).toBeNull();
  });
});
