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
  seoSiteIntelligence: {
    score: 54,
    crawlSource: "built_in_fetch",
    generatedAt: "2026-05-04T00:00:30.000Z",
    target: { name: "Oakville Toyota", url: "https://www.oakvilletoyota.ca", fetched: true, title: "Oakville Toyota", h1: "Toyota Dealer in Oakville", wordCount: 420, schemaTypes: [], hasRobots: true, hasSitemap: true, hasFaqPattern: false, socialProfiles: ["facebook", "instagram"] },
    competitors: [],
    technicalChecks: [],
    contentBriefs: [],
    competitorFindings: [],
    automation: [],
    notes: [],
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
    expect(report.revenueScenarios?.conservative.monthlyGapVsTopTwoAverage).toBe(7931);
    expect(report.revenueLeakSnapshot.map((leak) => leak.leakType)).toContain("AI visibility");
    expect(report.evidenceCards[0].recommendedFix).toContain("full report");
    expect(report.socialProofScore.title).toBe("AI Social Proof Score");
    expect(report.socialProofScore.score).toBeGreaterThan(60);
    expect(report.socialProofScore.summary).toContain("not follower count");
    expect(report.socialProofScore.signals).toContain("Website links to facebook and instagram profiles");
    expect(report.topVisibilityGaps.map((gap) => gap.category)).toEqual(["finance", "trust", "inventory"]);
    expect(report.lockedSections).toContain("Full AI-answer evidence by platform and recommendation moment");
    expect(report.ctas.monthlyMonitoring.recommended).toBe(true);
    expect(report.instantPreview.headline).toContain("Initial AI Visibility Score");
    expect(report.emailMiniReport.subject).toContain("AI Visibility Score");
    expect(report.emailMiniReport.ctaLabel).toBe("View My Free AI Visibility Report");
    expect(report.buyerQuestionTest.prompts).toHaveLength(3);
    expect(report.buyerQuestionTest.title).toBe("3 AI Recommendation Moments Tested");
    expect(report.buyerQuestionTest.summary).toContain("AI recommendation moments");
    expect(report.buyerQuestionTest.summary).toContain("AI-answer evidence");
    expect(report.paidDeliverables.oneTimeFix.includes).toContain("100-150 prompt AI visibility evidence plan with 120 prompts as the default paid-report target");
    expect(report.paidDeliverables.oneTimeFix.title).toContain("$88 USD");
    expect(report.paidDeliverables.oneTimeFix.includes).toContain("Clear fix list for website, schema, GBP, reviews, and local trust signals");
    expect(report.paidDeliverables.monthlyGrowthPlan.title).toContain("$188 USD/month");
    expect(report.paidDeliverables.monthlyGrowthPlan.timeline).toEqual(["30 days", "60 days", "90 days"]);
    expect(report.localDominationPlan.title).toBe("Local Community Domination Plan");
    expect(report.localDominationPlan.thesis).toContain("stronger signals");
    expect(report.localDominationPlan.queryFanOutBrief).toContain("The free report shows the gap");
    expect(report.localDominationPlan.recommendedPages).toContain("Local service/page opportunities detected — exact page map unlocks in the full report.");
    expect(report.localDominationPlan.faqOpportunities).toContain("High-intent recommendation questions detected — exact FAQ blocks unlock in the full report.");
    expect(report.localDominationPlan.reviewSyndicationActions).toContain("Proof distribution opportunities detected — channel-by-channel actions unlock in the full report.");
    expect(report.localDominationPlan.brandDefensePrompts).toContain("Oakville Toyota brand-search protection opportunity detected");
    expect(report.lockedSections).toContain("Exact page map, FAQ blocks, schema recommendations, and fix sequence");
    expect(report.paidDeliverables.monthlyGrowthPlan.includes).toContain("Monthly service/city page, FAQ, review syndication, and brand-search protection updates");
  });

  it("keeps the free report as a teaser without exposing implementation-ready fixes", () => {
    const report = createMiniReportFromAudit(baseAudit);
    const freeReportText = JSON.stringify({
      leaks: report.revenueLeakSnapshot,
      evidence: report.evidenceCards,
      plan: report.localDominationPlan,
      prompts: report.buyerQuestionTest.prompts,
    });

    expect(report.buyerQuestionTest.prompts.length).toBeLessThanOrEqual(3);
    expect(report.localDominationPlan.recommendedPages).not.toContain("/services/toyota-service-oakville");
    expect(freeReportText).not.toContain("Build sections for:");
    expect(freeReportText).not.toContain("schema, FAQ");
    expect(freeReportText).not.toContain("Google Business Profile response");
    expect(freeReportText).not.toContain("/services/");
    expect(freeReportText).toContain("full report");
    expect(report.lockedSections).toContain("Exact page map, FAQ blocks, schema recommendations, and fix sequence");
  });

  it("does not invent a revenue gap when competitor revenue projection is missing", () => {
    const report = createMiniReportFromAudit({ ...baseAudit, revenueOpportunity: null });

    expect(report.revenueOpportunityGap).toBeNull();
    expect(report.aiRecommendationShare).toBeNull();
    expect(report.competitiveRank).toBeNull();
  });

  it("keeps restaurant mini reports out of revenue-gap framing", () => {
    const report = createMiniReportFromAudit({
      ...baseAudit,
      client: { ...baseAudit.client, businessType: "mexican_restaurant", primaryMake: null },
    });

    expect(report.revenueOpportunityGap).toBeNull();
    expect(report.revenueScenarios).toBeNull();
    expect(report.aiRecommendationShare).toBeNull();
    expect(report.competitiveRank).toBeNull();
    expect(report.emailMiniReport.bullets.join(" ")).not.toContain("$");
    expect(report.revenueLeakSnapshot.map((leak) => `${leak.title} ${leak.leakType}`).join(" ")).not.toContain("revenue");
  });
});
