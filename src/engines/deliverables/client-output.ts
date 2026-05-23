import type { AuditReport, BusinessCategory, CategoryBreakdown, PromptRunResult, SeoTechnicalCheck } from "@/engines/research/types";

export interface ClientOutputSkill {
  name: string;
  stage: "narrative" | "visual" | "document" | "deck" | "spreadsheet" | "ux" | "research" | "measurement" | "email";
  use: string;
}

export interface ScorecardSection {
  label: string;
  value: string;
  emphasis: "positive" | "warning" | "critical" | "neutral";
  evidence: string;
}

export interface OnePageScorecard {
  skill: "canvas-design";
  title: string;
  theme: string;
  sections: ScorecardSection[];
  designNotes: string[];
}

export interface DeckSlide {
  title: string;
  bullets: string[];
  evidence?: string;
}

export interface DeckOutline {
  skill: "finance/pptx-author";
  title: string;
  slides: DeckSlide[];
}

export interface WorkbookSheet {
  name: string;
  rows: Array<Record<string, string | number | null>>;
}

export interface ClientWorkbook {
  skill: "finance/excel-author";
  title: string;
  sheets: WorkbookSheet[];
}

export interface RoadmapPhase {
  window: "0-30 days" | "31-60 days" | "61-90 days";
  focus: string;
  actions: string[];
  successMetric: string;
}

export interface ImplementationRoadmap {
  skill: "doc-coauthoring";
  phases: RoadmapPhase[];
}

export interface ProofPlan {
  skill: "webapp-testing";
  checks: string[];
  fallbackTools: string[];
}

export interface FollowUpEmail {
  skill: "email-sequence";
  subject: string;
  previewText: string;
  body: string;
  ctaLabel: string;
}

export interface ClientDeliverables {
  generatedAt: string;
  skillManifest: ClientOutputSkill[];
  executiveSummaryMarkdown: string;
  onePageScorecard: OnePageScorecard;
  deckOutline: DeckOutline;
  workbook: ClientWorkbook;
  implementationRoadmap: ImplementationRoadmap;
  proofPlan: ProofPlan;
  followUpEmail: FollowUpEmail;
  exportTargets: Array<"pdf" | "docx" | "pptx" | "xlsx" | "email" | "report_page">;
}

export const VIZBIZ_CLIENT_OUTPUT_SKILLS: ClientOutputSkill[] = [
  { name: "doc-coauthoring", stage: "narrative", use: "Structure paid reports, proposals, and 30/60/90 implementation roadmaps." },
  { name: "copywriting", stage: "narrative", use: "Make report explanations, CTAs, and paid-offer copy clear, specific, and client-safe." },
  { name: "canvas-design", stage: "visual", use: "Generate polished one-page scorecard visuals and executive-summary assets." },
  { name: "theme-factory", stage: "visual", use: "Map VizBiz brand tokens into reusable report, deck, and scorecard themes." },
  { name: "pdf", stage: "document", use: "Inspect, validate, and export polished PDF deliverables." },
  { name: "docx", stage: "document", use: "Create editable Word-style reports and implementation documents." },
  { name: "pptx", stage: "deck", use: "Inspect and edit PowerPoint deliverables." },
  { name: "finance/pptx-author", stage: "deck", use: "Generate strategy decks from audit data." },
  { name: "xlsx", stage: "spreadsheet", use: "Read and write client evidence workbooks." },
  { name: "finance/excel-author", stage: "spreadsheet", use: "Build auditable scorecards, prompt evidence sheets, and opportunity models." },
  { name: "frontend-design", stage: "ux", use: "Polish free and paid report pages into premium client-facing experiences." },
  { name: "dogfood/adversarial-ux-test", stage: "ux", use: "Stress-test the funnel and report from skeptical or confused prospect perspectives." },
  { name: "seo-audit", stage: "research", use: "Ground technical and on-page SEO findings in a structured audit framework." },
  { name: "seo-intel", stage: "research", use: "Power deeper local SEO, AEO/citability, content gap, and competitor action analysis." },
  { name: "research/scrapling", stage: "research", use: "Fallback public-page scraping when normal fetch or Playwright cannot extract evidence." },
  { name: "webapp-testing", stage: "ux", use: "Capture Playwright screenshots, browser QA, rendered schema checks, and report-page proof." },
  { name: "analytics-tracking", stage: "measurement", use: "Measure report views, CTA clicks, paid conversions, and nurture performance." },
  { name: "email-sequence", stage: "email", use: "Create mini-report and paid-report nurture sequences." },
  { name: "react-email", stage: "email", use: "Render branded HTML/plain-text client emails from structured specs." },
];

export function createClientDeliverables(audit: AuditReport): ClientDeliverables {
  const weakestCategories = weakestCategoryBreakdowns(audit.categoryBreakdown);
  const failedChecks = failedTechnicalChecks(audit);
  const topCompetitor = audit.revenueOpportunity?.topCompetitor.name ?? audit.primaryCompetitor ?? "the top local competitor";
  const revenueLine = audit.revenueOpportunity
    ? `A simple estimate of how much visibility the business may be losing to local competitors: about $${formatMoney(audit.revenueOpportunity.monthlyGapVsTopTwoAverage)}/month in directional AI/search-influenced opportunity versus the benchmark average. This is not a guarantee.`
    : "A simple local visibility estimate needs competitor and assumption data before it can be modeled responsibly.";

  return {
    generatedAt: new Date().toISOString(),
    skillManifest: VIZBIZ_CLIENT_OUTPUT_SKILLS,
    executiveSummaryMarkdown: createExecutiveSummary(audit, weakestCategories, failedChecks, topCompetitor, revenueLine),
    onePageScorecard: createScorecard(audit, weakestCategories, failedChecks, revenueLine),
    deckOutline: createDeckOutline(audit, weakestCategories, failedChecks, topCompetitor, revenueLine),
    workbook: createWorkbook(audit, weakestCategories, failedChecks),
    implementationRoadmap: createRoadmap(audit, failedChecks),
    proofPlan: createProofPlan(audit),
    followUpEmail: createFollowUpEmail(audit, revenueLine),
    exportTargets: ["pdf", "docx", "pptx", "xlsx", "email", "report_page"],
  };
}

function createExecutiveSummary(
  audit: AuditReport,
  weakestCategories: CategoryBreakdown[],
  failedChecks: SeoTechnicalCheck[],
  topCompetitor: string,
  revenueLine: string,
) {
  const weakestLine = weakestCategories.map((category) => `${categoryLabel(category.category)} (${category.score}/100)`).join(", ");
  const fixes = failedChecks.slice(0, 4).map((check) => `- ${check.label}: ${check.evidence}`).join("\n") || "- No critical technical blockers were found in the lightweight pass.";

  return [
    `# ${audit.client.name} AI Visibility Executive Summary`,
    "",
    `**AI Visibility Score:** ${audit.aviScore}/100 (${audit.band})`,
    `**Prompts appeared in:** ${audit.promptsAppeared}/${audit.promptsTotal}`,
    `**Primary competitor pressure:** ${topCompetitor}`,
    `**Local visibility opportunity estimate:** ${revenueLine}`,
    "",
    "## What this means",
    `${audit.client.name} is currently under-cited across buyer questions that AI/search systems can influence. The weakest areas are ${weakestLine || "pending deeper prompt evidence"}. The fix plan should focus on making the business easier for AI systems to identify, quote, and compare against local alternatives.`,
    "",
    "## Highest-priority fixes",
    fixes,
    "",
    "## Client-safe next step",
    "Start with the $88 One-Time Full Report + Fix: validate the full evidence set, identify missing machine-readable signals, create direct-answer content blocks, and prioritize the fixes most likely to improve local AI visibility. Continue with the $188/month Monthly Full Report Growth Plan when the client wants ongoing competitor movement tracking and monthly action planning.",
  ].join("\n");
}

function createScorecard(audit: AuditReport, weakestCategories: CategoryBreakdown[], failedChecks: SeoTechnicalCheck[], revenueLine: string): OnePageScorecard {
  return {
    skill: "canvas-design",
    title: `${audit.client.name} AI Visibility Scorecard`,
    theme: "VizBiz midnight navy, cyan proof lines, warm linen evidence panels, Poppins labels, Lora editorial headline.",
    sections: [
      { label: "AVI Score", value: `${audit.aviScore}/100`, emphasis: audit.aviScore >= 70 ? "positive" : audit.aviScore >= 45 ? "warning" : "critical", evidence: `${audit.promptsAppeared}/${audit.promptsTotal} buyer prompts surfaced the client.` },
      { label: "Weakest Visibility Area", value: weakestCategories[0] ? categoryLabel(weakestCategories[0].category) : "Pending", emphasis: "warning", evidence: weakestCategories[0] ? `${weakestCategories[0].score}/100 category score.` : "Requires prompt evidence." },
      { label: "Machine Readiness", value: `${audit.machineReadiness.score} pts`, emphasis: audit.machineReadiness.score >= 10 ? "positive" : "warning", evidence: `${failedChecks.length} priority technical/content blockers queued.` },
      { label: "Local Visibility Opportunity", value: audit.revenueOpportunity ? `$${formatMoney(audit.revenueOpportunity.monthlyGapVsTopTwoAverage)}/mo` : "Pending", emphasis: audit.revenueOpportunity ? "warning" : "neutral", evidence: revenueLine },
    ],
    designNotes: [
      "Use the score as the visual anchor, not a dense table.",
      "Show competitor pressure as a thin cyan comparison rail.",
      "Keep disclaimer visible but quiet: directional estimate, not a sales guarantee.",
    ],
  };
}

function createDeckOutline(
  audit: AuditReport,
  weakestCategories: CategoryBreakdown[],
  failedChecks: SeoTechnicalCheck[],
  topCompetitor: string,
  revenueLine: string,
): DeckOutline {
  return {
    skill: "finance/pptx-author",
    title: `${audit.client.name} AI Visibility Strategy Deck`,
    slides: [
      { title: `${audit.client.name} AI Visibility Baseline`, bullets: [`Score: ${audit.aviScore}/100 (${audit.band})`, `${audit.promptsAppeared}/${audit.promptsTotal} prompts surfaced the business`, `Benchmark competitor pressure: ${topCompetitor}`] },
      { title: "Why AI systems recommend competitors", bullets: ["Competitors are easier to identify, quote, or compare", "Missing machine-readable signals reduce source confidence", "Thin/direct-answer gaps weaken recommendation context"] },
      { title: "Category gaps", bullets: weakestCategories.map((category) => `${categoryLabel(category.category)}: ${category.score}/100`) },
      { title: "Website and machine-readiness blockers", bullets: failedChecks.slice(0, 5).map((check) => check.label), evidence: failedChecks[0]?.evidence },
      { title: "Competitor evidence", bullets: audit.seoSiteIntelligence.competitorFindings.map((finding) => finding.finding).slice(0, 4) },
      { title: "Local visibility opportunity estimate", bullets: [revenueLine, "Sensitivity ranges should be shown as conservative, likely, and aggressive."] },
      { title: "30/60/90 action plan", bullets: ["0-30: schema, sitemap, direct-answer fixes", "31-60: service/comparison content", "61-90: monitoring, refresh, competitor movement"] },
      { title: "Recommended next step", bullets: ["Run the $88 One-Time Full Report + Fix", "Ship the priority AI visibility fixes", "Start the $188/month Monthly Full Report Growth Plan for ongoing monitoring"] },
    ],
  };
}

function createWorkbook(audit: AuditReport, weakestCategories: CategoryBreakdown[], failedChecks: SeoTechnicalCheck[]): ClientWorkbook {
  const revenueLabels = revenueAssumptionLabelsFor(audit);
  return {
    skill: "finance/excel-author",
    title: `${audit.client.name} AI Visibility Evidence Workbook`,
    sheets: [
      {
        name: "Summary",
        rows: [
          { metric: "AVI Score", value: audit.aviScore, note: audit.band },
          { metric: "Prompts Appeared", value: audit.promptsAppeared, note: `${audit.promptsTotal} total prompts` },
          { metric: "Machine Readiness", value: audit.machineReadiness.score, note: `${failedChecks.length} action items` },
        ],
      },
      {
        name: "Prompt Evidence",
        rows: audit.promptResults.map(promptRow),
      },
      {
        name: "Competitor Gaps",
        rows: audit.seoSiteIntelligence.competitorFindings.map((finding) => ({ competitor: finding.competitor, advantage: finding.advantage, finding: finding.finding })),
      },
      {
        name: "Opportunity Model",
        rows: audit.revenueOpportunity
          ? [
              { assumption: revenueLabels.unitLabel, value: audit.revenueOpportunity.assumptions.monthlyUnitsSold, note: "Editable" },
              { assumption: revenueLabels.valueLabel, value: audit.revenueOpportunity.assumptions.averageGrossPerVehicle, note: "Editable" },
              { assumption: "AI/search-influenced buyer share", value: audit.revenueOpportunity.assumptions.aiInfluencedBuyerShare, note: "Editable" },
              { assumption: "Likely monthly gap", value: audit.revenueOpportunity.monthlyGapVsTopTwoAverage, note: "Directional, not guaranteed" },
            ]
          : [{ assumption: "Opportunity model", value: null, note: "Add competitor scores and assumptions" }],
      },
      {
        name: "Action Plan",
        rows: [
          ...failedChecks.map((check, index) => ({ priority: index + 1, action: check.label, evidence: check.evidence })),
          ...weakestCategories.map((category, index) => ({ priority: failedChecks.length + index + 1, action: `Improve ${categoryLabel(category.category)} visibility`, evidence: `${category.score}/100 category score` })),
        ],
      },
    ],
  };
}

function createRoadmap(audit: AuditReport, failedChecks: SeoTechnicalCheck[]): ImplementationRoadmap {
  const topActions = failedChecks.map((check) => check.label.toLowerCase());
  return {
    skill: "doc-coauthoring",
    phases: [
      {
        window: "0-30 days",
        focus: "Machine-readable foundation",
        actions: [
          topActions.find((action) => action.includes("schema")) ? "Add/repair schema markup and validate rendered JSON-LD." : "Add entity/schema validation to the homepage and core service pages.",
          "Confirm sitemap, robots.txt, canonical tags, and contact paths are crawlable.",
          "Create direct-answer FAQ blocks for missed buyer questions.",
        ],
        successMetric: "Machine-readiness and SEO technical blockers reduced by at least 50%.",
      },
      {
        window: "31-60 days",
        focus: "Competitor-gap content",
        actions: [
          ...audit.seoSiteIntelligence.contentBriefs.slice(0, 2).map((brief) => `Publish/update: ${brief.title}.`),
          "Create a comparison page or section that responsibly explains when to choose the business versus alternatives.",
        ],
        successMetric: "New pages/sections cover the top competitor-backed gaps.",
      },
      {
        window: "61-90 days",
        focus: "Monitoring and proof loop",
        actions: [
          "Re-run prompt evidence and compare movement by category.",
          "Capture Playwright proof screenshots for client reporting.",
          "Send monthly summary with score movement, competitor changes, and next actions.",
        ],
        successMetric: "Monthly monitoring report shows category deltas and completed actions.",
      },
    ],
  };
}

function createProofPlan(audit: AuditReport): ProofPlan {
  return {
    skill: "webapp-testing",
    checks: [
      "Capture Playwright screenshots of the report page and key client website findings.",
      "Verify rendered JSON-LD schema, sitemap, llms.txt, and report CTA routes.",
      `Run mobile QA for the ${audit.client.name} report page to prevent overflow or unreadable scorecards.`,
      "Use adversarial UX review before shipping paid-report pages.",
    ],
    fallbackTools: ["frontend-design", "dogfood/adversarial-ux-test", "research/scrapling", "seo-intel"],
  };
}

function createFollowUpEmail(audit: AuditReport, revenueLine: string): FollowUpEmail {
  return {
    skill: "email-sequence",
    subject: `${audit.client.name}: your AI Visibility report is ready`,
    previewText: `Score: ${audit.aviScore}/100. Top gaps and next steps are ready.`,
    body: [
      `Hi — we finished the first AI Visibility read for ${audit.client.name}.`,
      "",
      `Your current score is ${audit.aviScore}/100 (${audit.band}). The biggest opportunities are the areas where AI/search answers either skip the business or cite competitors with stronger evidence.`,
      "",
      revenueLine,
      "",
      "View the report to see the buyer questions tested, competitor pressure, and the first fix priorities.",
    ].join("\n"),
    ctaLabel: "View the report",
  };
}

function weakestCategoryBreakdowns(categories: CategoryBreakdown[]) {
  return categories.slice().sort((a, b) => a.score - b.score).slice(0, 3);
}

function failedTechnicalChecks(audit: AuditReport): SeoTechnicalCheck[] {
  return [
    ...audit.machineReadiness.checks.map((check) => ({ ...check })),
    ...audit.seoSiteIntelligence.technicalChecks,
  ].filter((check) => !check.passed);
}

function promptRow(result: PromptRunResult) {
  return {
    promptId: result.promptId,
    category: categoryLabel(result.category),
    prompt: result.prompt,
    platform: result.platform,
    score: result.score,
    position: result.position,
    competitors: result.competitors.join(", "),
    evidence: result.snippet,
  };
}

function categoryLabel(category: BusinessCategory) {
  const labels: Record<BusinessCategory, string> = {
    discovery: "Discovery",
    trust: "Trust",
    service: "Service",
    inventory: "Inventory",
    finance: "Finance",
  };
  return labels[category];
}

function revenueAssumptionLabelsFor(audit: AuditReport) {
  if (audit.client.businessType === "auto_dealer" || audit.businessProfile?.niche === "auto_dealer") {
    return { unitLabel: "Monthly units sold", valueLabel: "Average gross per vehicle" };
  }

  return { unitLabel: "Monthly customer opportunities", valueLabel: "Average customer value" };
}

function formatMoney(value: number) {
  return Math.round(value).toLocaleString("en-US");
}
