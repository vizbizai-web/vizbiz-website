import { describe, expect, it } from "vitest";
import { createClientDeliverables, VIZBIZ_CLIENT_OUTPUT_SKILLS } from "./client-output";
import type { AuditReport } from "@/engines/research/types";

const audit: AuditReport = {
  id: "audit_abc",
  client: {
    id: "client_oakville-toyota",
    name: "Oakville Toyota",
    slug: "oakville-toyota",
    businessType: "auto_dealer",
    websiteUrl: "https://oakvilletoyota.example",
    city: "Oakville",
    market: "Oakville, ON",
    primaryMake: "Toyota",
  },
  status: "completed",
  aviScore: 38,
  band: "Weak",
  discoveryScore: 45,
  trustScore: 20,
  serviceScore: 55,
  inventoryScore: 35,
  financeScore: 18,
  competitorGapScore: 67,
  primaryCompetitor: "Burlington Toyota",
  promptsTotal: 20,
  promptsAppeared: 5,
  categoryBreakdown: [
    { category: "discovery", score: 45, promptsTotal: 4, promptsScored: 4, weight: 1 },
    { category: "trust", score: 20, promptsTotal: 4, promptsScored: 4, weight: 1 },
    { category: "service", score: 55, promptsTotal: 4, promptsScored: 4, weight: 1 },
    { category: "inventory", score: 35, promptsTotal: 4, promptsScored: 4, weight: 1 },
    { category: "finance", score: 18, promptsTotal: 4, promptsScored: 4, weight: 1 },
  ],
  promptResults: [
    { promptId: "trust-1", prompt: "most trusted Toyota dealer in Oakville", category: "trust", platform: "tavily", targetName: "Oakville Toyota", score: 0, position: null, snippet: "Burlington Toyota is frequently cited.", competitors: ["Burlington Toyota"], rawResponse: null, error: null },
    { promptId: "service-1", prompt: "where to service Toyota in Oakville", category: "service", platform: "openai", targetName: "Oakville Toyota", score: 7, position: 2, snippet: "Oakville Toyota appears as an option.", competitors: ["Burlington Toyota"], rawResponse: null, error: null },
  ],
  machineReadiness: {
    schemaPresent: false,
    titleH1Clarity: true,
    footerNapConsistent: false,
    heroContactAccessible: true,
    contentDepth: "thin",
    score: 6,
    checks: [
      { key: "schema", label: "Local Business Schema present", passed: false, points: 5, evidence: "No JSON-LD detected." },
      { key: "content_depth", label: "Content depth", passed: false, points: 3, evidence: "320 visible words detected." },
    ],
  },
  seoSiteIntelligence: {
    score: 42,
    crawlSource: "built_in_fetch",
    generatedAt: "2026-05-09T16:00:00.000Z",
    target: { name: "Oakville Toyota", url: "https://oakvilletoyota.example", fetched: true, title: "Oakville Toyota", h1: "Toyota Dealer in Oakville", wordCount: 320, schemaTypes: [], hasRobots: true, hasSitemap: false, hasFaqPattern: false, socialProfiles: [] },
    competitors: [{ name: "Burlington Toyota", url: "https://burlingtontoyota.example", fetched: true, title: "Burlington Toyota", h1: "Toyota Dealer", wordCount: 850, schemaTypes: ["AutoDealer"], hasRobots: true, hasSitemap: true, hasFaqPattern: true, socialProfiles: [] }],
    technicalChecks: [
      { key: "sitemap", label: "XML sitemap accessible", passed: false, points: 10, evidence: "sitemap.xml was not found." },
      { key: "faq", label: "FAQ / answer-engine pattern present", passed: false, points: 10, evidence: "No FAQ detected." },
    ],
    contentBriefs: [{ title: "Toyota service in Oakville: AI-citable service page", intent: "High-intent local discovery", recommendedSections: ["Direct answer intro", "Service proof", "FAQ"], source: "seo-audit" }],
    competitorFindings: [{ competitor: "Burlington Toyota", finding: "Burlington Toyota appears stronger on more schema coverage and FAQ structure.", advantage: "competitor" }],
    automation: [],
    notes: [],
  },
  revenueOpportunity: {
    method: "visibility_share_gamma_v1",
    disclaimer: "Directional estimate, not a guarantee.",
    assumptions: { monthlyUnitsSold: 80, averageGrossPerVehicle: 3500, aiInfluencedBuyerShare: 0.2, gamma: 2 },
    competitors: [{ name: "Burlington Toyota", websiteUrl: "https://burlingtontoyota.example", aviScore: 70, aiRecommendationShare: 0.55 }],
    clientAiRecommendationShare: 0.25,
    monthlyAiOpportunityPool: 56000,
    topCompetitor: { name: "Burlington Toyota", websiteUrl: "https://burlingtontoyota.example", aviScore: 70, aiRecommendationShare: 0.55 },
    topTwoAverageShare: 0.55,
    monthlyGapVsTopCompetitor: 16800,
    annualGapVsTopCompetitor: 201600,
    monthlyGapVsTopTwoAverage: 16800,
    annualGapVsTopTwoAverage: 201600,
    scenarios: {
      conservative: { aiInfluencedBuyerShare: 0.1, monthlyGapVsTopTwoAverage: 8400, annualGapVsTopTwoAverage: 100800 },
      likely: { aiInfluencedBuyerShare: 0.2, monthlyGapVsTopTwoAverage: 16800, annualGapVsTopTwoAverage: 201600 },
      aggressive: { aiInfluencedBuyerShare: 0.3, monthlyGapVsTopTwoAverage: 25200, annualGapVsTopTwoAverage: 302400 },
    },
  },
  createdAt: "2026-05-09T16:00:00.000Z",
  completedAt: "2026-05-09T16:01:00.000Z",
};

describe("VIZBIZ_CLIENT_OUTPUT_SKILLS", () => {
  it("bakes the approved skills into the pipeline manifest", () => {
    expect(VIZBIZ_CLIENT_OUTPUT_SKILLS.map((skill) => skill.name)).toEqual([
      "doc-coauthoring",
      "copywriting",
      "canvas-design",
      "theme-factory",
      "pdf",
      "docx",
      "pptx",
      "finance/pptx-author",
      "xlsx",
      "finance/excel-author",
      "frontend-design",
      "dogfood/adversarial-ux-test",
      "seo-audit",
      "seo-intel",
      "research/scrapling",
      "webapp-testing",
      "analytics-tracking",
      "email-sequence",
      "react-email",
    ]);
  });
});

describe("createClientDeliverables", () => {
  it("turns an audit into client-safe reports, decks, scorecards, workbook rows, proof plans, and follow-up copy", () => {
    const deliverables = createClientDeliverables(audit);

    expect(deliverables.executiveSummaryMarkdown).toContain("Oakville Toyota");
    expect(deliverables.executiveSummaryMarkdown).toContain("38/100");
    expect(deliverables.executiveSummaryMarkdown).toContain("A simple estimate of how much visibility");
    expect(deliverables.executiveSummaryMarkdown).not.toMatch(/guaranteed|lost revenue/i);

    expect(deliverables.onePageScorecard.title).toBe("Oakville Toyota AI Visibility Scorecard");
    expect(deliverables.onePageScorecard.skill).toBe("canvas-design");
    expect(deliverables.onePageScorecard.sections.map((section) => section.label)).toContain("Local Visibility Opportunity");

    expect(deliverables.deckOutline.skill).toBe("finance/pptx-author");
    expect(deliverables.deckOutline.slides).toHaveLength(8);
    expect(deliverables.deckOutline.slides[0].title).toContain("AI Visibility");

    expect(deliverables.workbook.skill).toBe("finance/excel-author");
    expect(deliverables.workbook.sheets.map((sheet) => sheet.name)).toEqual(["Summary", "Prompt Evidence", "Competitor Gaps", "Opportunity Model", "Action Plan"]);
    expect(deliverables.workbook.sheets.find((sheet) => sheet.name === "Prompt Evidence")?.rows).toHaveLength(2);

    expect(deliverables.implementationRoadmap.phases).toHaveLength(3);
    expect(deliverables.implementationRoadmap.phases[0].actions[0]).toContain("schema");

    expect(deliverables.proofPlan.skill).toBe("webapp-testing");
    expect(deliverables.proofPlan.checks).toContain("Capture Playwright screenshots of the report page and key client website findings.");

    expect(deliverables.followUpEmail.skill).toBe("email-sequence");
    expect(deliverables.followUpEmail.subject).toContain("Oakville Toyota");
    expect(deliverables.followUpEmail.body).toContain("View the report");

    expect(deliverables.skillManifest).toHaveLength(VIZBIZ_CLIENT_OUTPUT_SKILLS.length);
  });
});
