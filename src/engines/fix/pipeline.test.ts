import { describe, expect, it } from "vitest";
import { generateFixPackage } from "./pipeline";
import type { AuditReport } from "@/engines/research/types";

const audit: AuditReport = {
  id: "audit_123",
  client: {
    id: "client_123",
    name: "Oakville Toyota",
    slug: "oakville-toyota",
    businessType: "auto_dealer",
    websiteUrl: "https://oakvilletoyota.example",
    city: "Oakville",
    market: "Oakville, ON",
    primaryMake: "Toyota",
  },
  status: "completed",
  aviScore: 22,
  band: "Not Visible",
  discoveryScore: 30,
  trustScore: 0,
  serviceScore: 0,
  inventoryScore: 40,
  financeScore: 20,
  competitorGapScore: 64,
  primaryCompetitor: "Burlington Toyota",
  promptsTotal: 11,
  promptsAppeared: 3,
  categoryBreakdown: [],
  promptResults: [
    { promptId: "trust-1", prompt: "which dealership has the best reviews in Oakville", category: "trust", platform: "tavily", targetName: "Oakville Toyota", score: 0, position: null, snippet: "Burlington Toyota is recommended.", competitors: ["Burlington Toyota"], rawResponse: null, error: null },
  ],
  machineReadiness: { schemaPresent: false, titleH1Clarity: false, footerNapConsistent: false, heroContactAccessible: true, contentDepth: "thin", score: 3, checks: [] },
  seoSiteIntelligence: {
    score: 38,
    crawlSource: "built_in_fetch",
    generatedAt: "2026-05-01T00:00:30.000Z",
    target: { name: "Oakville Toyota", url: "https://oakvilletoyota.example", fetched: true, title: "Oakville Toyota", h1: "Oakville Toyota", wordCount: 300, schemaTypes: [], hasRobots: false, hasSitemap: false, hasFaqPattern: false, socialProfiles: [] },
    competitors: [],
    technicalChecks: [],
    contentBriefs: [],
    competitorFindings: [],
    automation: [],
    notes: [],
  },
  revenueOpportunity: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  completedAt: "2026-05-01T00:01:00.000Z",
};

describe("generateFixPackage", () => {
  it("produces all 8 deployable implementation assets from an audit", () => {
    const fixPackage = generateFixPackage(audit);

    expect(Object.keys(fixPackage.assets).sort()).toEqual([
      "faq-block.html",
      "faq-block.md",
      "implementation-packet.md",
      "llms.txt",
      "llmstxt-packet.md",
      "robots.txt",
      "schema-markup.md",
      "technical-fixes.md",
    ].sort());
    expect(fixPackage.assets["schema-markup.md"]).toContain("AutoDealer");
    expect(fixPackage.assets["faq-block.md"]).toContain("which dealership has the best reviews in Oakville");
    expect(fixPackage.assets["implementation-packet.md"]).toContain("AVI Score: 22/100");
  });

  it("includes revenue opportunity gap when the audit has a projection", () => {
    const fixPackage = generateFixPackage({
      ...audit,
      revenueOpportunity: {
        method: "visibility_share_gamma_v1",
        disclaimer: "Directional estimate, not a guarantee.",
        assumptions: { monthlyUnitsSold: 80, averageGrossPerVehicle: 3500, aiInfluencedBuyerShare: 0.2, gamma: 2 },
        competitors: [
          { name: "Burlington Toyota", aviScore: 73, aiRecommendationShare: 0.4 },
          { name: "Mississauga Toyota", aviScore: 68, aiRecommendationShare: 0.347 },
        ],
        clientAiRecommendationShare: 0.253,
        monthlyAiOpportunityPool: 56000,
        topCompetitor: { name: "Burlington Toyota", aviScore: 73, aiRecommendationShare: 0.4 },
        topTwoAverageShare: 0.3735,
        monthlyGapVsTopCompetitor: 8263,
        annualGapVsTopCompetitor: 99157,
        monthlyGapVsTopTwoAverage: 6781,
        annualGapVsTopTwoAverage: 81370,
        scenarios: {
          conservative: { aiInfluencedBuyerShare: 0.1, monthlyGapVsTopTwoAverage: 3390, annualGapVsTopTwoAverage: 40685 },
          likely: { aiInfluencedBuyerShare: 0.2, monthlyGapVsTopTwoAverage: 6781, annualGapVsTopTwoAverage: 81370 },
          aggressive: { aiInfluencedBuyerShare: 0.3, monthlyGapVsTopTwoAverage: 10171, annualGapVsTopTwoAverage: 122055 },
        },
      },
    });

    expect(fixPackage.assets["implementation-packet.md"]).toContain("Local Visibility Opportunity Estimate");
    expect(fixPackage.assets["implementation-packet.md"]).toContain("$6,781/month");
    expect(fixPackage.assets["implementation-packet.md"]).toContain("$81,370/year");
  });
});
