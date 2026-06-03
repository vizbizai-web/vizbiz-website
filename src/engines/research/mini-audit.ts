import type { CompetitorSource } from "@/lib/mini-audit-intake";
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
  competitorSource: CompetitorSource;
  competitorNote: string;
  aiRecommendationShare: number | null;
  revenueOpportunityGap: MiniRevenueGap | null;
  revenueScenarios: MiniRevenueScenarios | null;
  revenueLeakSnapshot: MiniRevenueLeakFinding[];
  evidenceCards: MiniEvidenceCard[];
  socialProofScore: MiniSocialProofScore;
  llmReadiness: AuditReport["seoSiteIntelligence"]["llmReadiness"];
  topVisibilityGaps: MiniVisibilityGap[];
  businessProfile?: AuditReport["businessProfile"];
  businessIntelligenceProfile?: AuditReport["businessIntelligenceProfile"];
  googlePlaces: AuditReport["googlePlaces"];
  categoryLabels: Record<BusinessCategory, string>;
  leaderboard: MiniLeaderboardRow[];
  instantPreview: InstantScorePreview;
  emailMiniReport: EmailMiniReport;
  buyerQuestionTest: BuyerQuestionTest;
  localDominationPlan: LocalDominationPlan;
  lockedSections: string[];
  paidDeliverables: PaidDeliverables;
  clientDeliverables?: AuditReport["clientDeliverables"];
  ctas: MiniReportCtas;
  leadEmail?: string;
  disclaimer: string;
  createdAt: string;
  language?: "en" | "es";
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

export interface MiniRevenueScenario {
  label: "Conservative" | "Likely" | "Aggressive";
  aiInfluencedBuyerShare: number;
  monthlyGapVsTopTwoAverage: number;
  annualGapVsTopTwoAverage: number;
}

export interface MiniRevenueScenarios {
  conservative: MiniRevenueScenario;
  likely: MiniRevenueScenario;
  aggressive: MiniRevenueScenario;
}

export interface MiniRevenueLeakFinding {
  title: string;
  impact: "High" | "Medium" | "Low";
  leakType: "AI visibility" | "Service pages" | "Trust proof" | "Conversion path" | "Competitor gap";
  summary: string;
  fix: string;
}

export interface MiniEvidenceCard {
  finding: string;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  confidence: "High" | "Medium" | "Directional";
}

export interface MiniSocialProofScore {
  title: "AI Social Proof Score";
  score: number;
  band: "Strong" | "Building" | "Thin";
  summary: string;
  signals: string[];
  opportunities: string[];
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

export interface InstantScorePreview {
  headline: string;
  subheadline: string;
  checklist: Array<{ label: string; status: "complete" | "pending" }>;
}

export interface EmailMiniReport {
  subject: string;
  previewText: string;
  openingLine: string;
  bullets: string[];
  ctaLabel: string;
}

export interface BuyerQuestionTest {
  title: string;
  summary: string;
  prompts: Array<{
    question: string;
    category: BusinessCategory;
    outcome: "found" | "missed" | "pending";
    competitorMentioned: boolean;
  }>;
}

export interface LocalDominationPlan {
  title: string;
  thesis: string;
  queryFanOutBrief: string;
  recommendedPages: string[];
  faqOpportunities: string[];
  reviewSyndicationActions: string[];
  brandDefensePrompts: string[];
  monthlyActions: string[];
}

export interface PaidDeliverables {
  oneTimeFix: {
    title: string;
    description: string;
    includes: string[];
  };
  monthlyGrowthPlan: {
    title: string;
    description: string;
    timeline: string[];
    includes: string[];
  };
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
  "Full AI-answer evidence by platform and recommendation moment",
  "Platform-by-platform testing across popular AI assistants and AI-powered search",
  "Raw AI/search results, screenshots, URLs, and citations",
  "Competitor-by-competitor gap breakdown",
  "Exact page map, FAQ blocks, schema recommendations, and fix sequence",
  "Implementation-ready copy, schema, and technical SEO fix package",
  "AI Social Proof Score with profile, review, and brand-activity recommendations",
  "30/60/90 day implementation roadmap",
  "Monthly monitoring and competitor movement alerts",
];

export async function runMiniAudit(input: ClientInput): Promise<MiniAuditReport> {
  const audit = await runAudit(input);
  return createMiniReportFromAudit(audit);
}

export function createMiniReportFromAudit(audit: AuditReport): MiniAuditReport {
  const leaderboard = createLeaderboard(audit);
  const clientRow = leaderboard.find((row) => row.kind === "client");
  const revenueOpportunity = supportsRevenueFraming(audit) ? audit.revenueOpportunity : null;
  const revenueOpportunityGap = revenueOpportunity ? createRevenueGap(revenueOpportunity) : null;

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
    competitiveRank: revenueOpportunity ? (clientRow?.rank ?? null) : null,
    competitorCount: revenueOpportunity?.competitors.length ?? 0,
    competitorSource: "none",
    competitorNote: competitorNote("none"),
    aiRecommendationShare: revenueOpportunity?.clientAiRecommendationShare ?? null,
    revenueOpportunityGap,
    revenueScenarios: revenueOpportunity ? createRevenueScenarios(revenueOpportunity) : null,
    revenueLeakSnapshot: createRevenueLeakSnapshot(audit),
    evidenceCards: createEvidenceCards(audit),
    socialProofScore: createSocialProofScore(audit),
    llmReadiness: audit.seoSiteIntelligence.llmReadiness,
    topVisibilityGaps: audit.categoryBreakdown
      .slice()
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((gap) => ({ category: gap.category, score: gap.score, label: labelForGap(gap.category, audit.businessProfile?.reportLabels) })),
    businessProfile: audit.businessProfile,
    businessIntelligenceProfile: audit.businessIntelligenceProfile,
    googlePlaces: audit.googlePlaces,
    categoryLabels: categoryLabelsFor(audit.businessProfile?.reportLabels),
    leaderboard,
    instantPreview: createInstantPreview(audit, leaderboard),
    emailMiniReport: createEmailMiniReport(audit, leaderboard, revenueOpportunityGap),
    buyerQuestionTest: createBuyerQuestionTest(audit),
    localDominationPlan: createLocalDominationPlan(audit),
    lockedSections: LOCKED_SECTIONS,
    paidDeliverables: createPaidDeliverables(),
    clientDeliverables: audit.clientDeliverables,
    ctas: {
      fullReport: {
        label: "Get the $88 Full Report + Fix",
        product: "full_report_fix_package",
      },
      monthlyMonitoring: {
        label: "Start the $188 Monthly Growth Plan",
        product: "monthly_ai_visibility_monitoring",
        recommended: true,
      },
    },
    disclaimer: revenueOpportunity
      ? "Directional estimate based on AI visibility share, average gross, and AI/search-influenced buyer assumptions. Not a revenue guarantee."
      : isNationalOrEcommerce(audit)
        ? "Directional visibility snapshot based on a limited free-preview prompt set, product discovery signals, and website machine-readiness. Not a revenue guarantee."
        : "Directional visibility snapshot based on a limited free-preview prompt set and verified local trust signals. Not a revenue guarantee.",
    createdAt: new Date().toISOString(),
  };
}

function createInstantPreview(audit: AuditReport, leaderboard: MiniLeaderboardRow[]): InstantScorePreview {
  const competitors = leaderboard.filter((row) => row.kind === "competitor");
  const namedCompetitors = audit.revenueOpportunity?.competitors ?? [];
  return {
    headline: `Initial AI Visibility Score: ${audit.aviScore}/100`,
    subheadline: competitors.length
      ? `We compared ${audit.client.name} against ${competitors.slice(0, 2).map((row) => row.name).join(" and ")}. Scroll down to review your score, biggest visibility gaps, competitor benchmark, and recommended next steps.`
      : namedCompetitors.length
        ? `We captured ${namedCompetitors.slice(0, 2).map((row) => row.name).join(" and ")} as named competitors. This free snapshot keeps competitor scores conservative until product-by-product AI-answer evidence is validated in the full report.`
        : `We built an initial visibility read for ${audit.client.name}. Add two competitors to make the benchmark sharper.`,
    checklist: [
      { label: "Website and crawlability checked", status: audit.client.websiteUrl ? "complete" : "pending" },
      { label: "Niche and AI recommendation moments detected", status: audit.businessProfile ? "complete" : "pending" },
      { label: namedCompetitors.length ? "Two-competitor context captured" : "Two-competitor benchmark prepared", status: namedCompetitors.length >= 2 || competitors.length >= 2 ? "complete" : "pending" },
      { label: "Email mini report prepared", status: "complete" },
    ],
  };
}

function createEmailMiniReport(audit: AuditReport, leaderboard: MiniLeaderboardRow[], revenueGap: MiniRevenueGap | null): EmailMiniReport {
  const hasScoredCompetitors = leaderboard.some((row) => row.kind === "competitor");
  const clientRank = hasScoredCompetitors ? leaderboard.find((row) => row.kind === "client")?.rank : null;
  const topCompetitor = hasScoredCompetitors ? leaderboard.find((row) => row.kind === "competitor") : undefined;
  const opportunity = revenueGap
    ? `Local visibility opportunity estimate: about $${revenueGap.monthlyGapVsTopTwoAverage.toLocaleString()}/month in directional AI-influenced opportunity versus the top-two average.`
    : `${Math.max(0, audit.promptsTotal - audit.promptsAppeared)} AI recommendation moments did not surface the business in this free snapshot.`;

  return {
    subject: `${audit.client.name}: your AI Visibility Score is ready`,
    previewText: topCompetitor
      ? `Your site scored ${audit.aviScore}/100. ${topCompetitor.name} appears stronger in the benchmark.`
      : `Your site scored ${audit.aviScore}/100. Your free AI visibility mini report is ready.`,
    openingLine: isNationalOrEcommerce(audit)
      ? `We checked whether popular AI assistants and AI-powered search tools can understand, trust, and recommend ${audit.client.name} when shoppers ask for products like yours.`
      : `We checked whether popular AI assistants and AI-powered search tools can understand, trust, and recommend ${audit.client.name} when buyers ask who to choose in ${audit.client.city}.`,
    bullets: [
      `AI Visibility Score: ${audit.aviScore}/100 (${audit.band})`,
      clientRank ? `Competitor benchmark rank: #${clientRank}` : "Competitor benchmark rank: pending competitor data",
      opportunity,
      "Why this matters now: businesses that build AI-readable reputation early may be easier to recommend as AI search becomes a normal discovery path.",
      "The free report shows a snapshot. The full fix plan unlocks platform-by-platform evidence, competitor gaps, exact pages, schema, FAQs, and priority order.",
    ],
    ctaLabel: "View My Free AI Visibility Report",
  };
}

function createBuyerQuestionTest(audit: AuditReport): BuyerQuestionTest {
  const visibleResults = audit.promptResults.filter((result) => result.showInFreeReport);
  const sourceResults = (visibleResults.length ? visibleResults : audit.promptResults).slice(0, 3);
  const prompts = sourceResults.length
    ? sourceResults.map((result) => ({
        question: result.clientFacingQuestion ?? result.prompt,
        category: result.category,
        outcome: result.score == null ? "pending" as const : result.score > 0 ? "found" as const : "missed" as const,
        competitorMentioned: result.competitors.length > 0,
      }))
    : Array.from({ length: Math.min(audit.promptsTotal, 3) }, (_, index) => {
        const category = audit.categoryBreakdown[index % audit.categoryBreakdown.length]?.category ?? "discovery";
        return {
          question: sampleQuestionFor(category, audit),
          category,
          outcome: "pending" as const,
          competitorMentioned: false,
        };
      });
  const count = prompts.length || Math.min(audit.promptsTotal, 3);

  const recommendationContext = isNationalOrEcommerce(audit) ? "when comparing products, ingredients, use cases, and brands" : "when choosing locally";

  return {
    title: `${count} AI Recommendation Moments Tested`,
    summary: `The free report previews AI recommendation moments — the kinds of search-backed and conversational questions people ask popular AI assistants and AI-powered search tools ${recommendationContext}. Full AI-answer evidence, platform breakdowns, and competitor comparisons unlock in the paid report.`,
    prompts,
  };
}

function createLocalDominationPlan(audit: AuditReport): LocalDominationPlan {
  const market = audit.client.market ?? audit.client.city;
  const brand = audit.client.name;
  const productBrand = isNationalOrEcommerce(audit);

  return {
    title: productBrand ? "Product Discovery Growth Plan" : "AI Reputation Growth Plan",
    thesis: productBrand
      ? `${brand} does not need to beat every brand at once. It needs to build AI-readable reputation early so popular AI assistants can trust and cite it when shoppers ask for product recommendations.`
      : `${brand} does not need to beat every national brand first. It needs to build AI-readable local reputation early so AI-powered discovery can trust it when buyers ask who to choose in ${market}.`,
    queryFanOutBrief: productBrand
      ? "The free report gives you the first read: where AI may miss the brand, what kind of product proof is thin, and which comparison moments deserve attention. The full report turns that into the exact page map, evidence, and implementation sequence."
      : "The free report gives you the first read: where AI may miss the business, what local trust proof is thin, and which competitor comparison moments deserve attention. The full report turns that into the exact page map, evidence, and implementation sequence.",
    recommendedPages: productBrand ? [
      "Make product/category pages answer the way shoppers ask AI for recommendations.",
      "Add comparison proof so AI can understand when this brand is a better fit.",
      "Move ingredients, reviews, guarantees, and buying proof closer to decision pages.",
    ] : [
      "Make service/city pages answer real local recommendation questions, not just keywords.",
      "Put review proof, location clarity, and trust signals closer to call/booking moments.",
      "Protect branded searches so AI sees the business as the safest local answer.",
    ],
    faqOpportunities: [
      "Answer who-to-choose questions buyers would ask an AI assistant.",
      "Answer comparison questions that mention nearby competitors or alternatives.",
      "Answer trust questions about reviews, service quality, pricing, availability, and fit.",
    ],
    reviewSyndicationActions: [
      "Reuse strong reviews as website proof blocks, profile updates, social posts, and short FAQs.",
      "Connect social, review, directory, and website proof so the entity story is consistent.",
      "Refresh proof monthly so competitor movement does not quietly pass the business.",
    ],
    brandDefensePrompts: [
      `${brand} brand-search protection opportunity detected`,
      "Competitor comparison opportunity detected",
      "Trust/review visibility opportunity detected",
    ],
    monthlyActions: productBrand ? [
      "Refresh product-recommendation visibility each month.",
      "Prioritize one locked product/content fix each month.",
      "Monitor competitor movement and new AI-citable proof.",
    ] : [
      "Refresh local recommendation visibility each month.",
      "Prioritize one locked local/content fix each month.",
      "Monitor competitor movement and new AI-citable proof.",
    ],
  };
}

function localDominationServices(audit: AuditReport) {
  const profileServices = audit.businessProfile?.primaryServices ?? [];
  const briefServices = audit.seoSiteIntelligence.contentBriefs.map((brief) => brief.title.replace(/:.*$/, ""));
  const fallback = audit.client.primaryMake ? [`${audit.client.primaryMake} service`, `${audit.client.primaryMake} reviews`, `${audit.client.primaryMake} offers`] : [audit.businessProfile?.promptLabels.service ?? "local service"];
  return uniqueStrings([...profileServices, ...briefServices, ...fallback])
    .map((service) => service.trim())
    .filter(Boolean);
}

function uniqueStrings(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "local";
}

function createPaidDeliverables(): PaidDeliverables {
  return {
    oneTimeFix: {
      title: "One-Time Full Report + Fix — $88 USD",
      description: "A one-time full local AI visibility report and prioritized fix plan for the gaps most likely to stop AI systems from recommending the business.",
      includes: [
        "Full website crawlability, technical SEO, and machine-readiness review",
        "100-150 prompt AI visibility evidence plan with 120 prompts as the default paid-report target",
        "Prompt-by-prompt AI visibility evidence",
        "AI/LLM readability audit covering llms.txt, agents.md, agentic sitemap, product/brand schema, FAQ, and commerce-agent readiness",
        "Two nearby competitor SEO/content teardown and gap map",
        "Service/city page, People Also Ask FAQ, and above-the-fold local clarity recommendations",
        "Schema, FAQ, llms.txt, sitemap, service-page, and content brief recommendations",
        "Review proof syndication and brand-search protection recommendations",
        "Playwright-rendered proof screenshots for key findings",
        "Prioritized implementation roadmap with impact and effort scores",
        "Clear fix list for website, schema, GBP, reviews, and local trust signals",
      ],
    },
    monthlyGrowthPlan: {
      title: "Monthly Full Report Growth Plan — $188 USD/month",
      description: "Monthly monitoring and improvement plan that tracks local competitor movement, search-backed AI recommendation moments, review proof, and the actions needed to keep improving local AI visibility.",
      timeline: ["30 days", "60 days", "90 days"],
      includes: [
        "Monthly AVI score refresh",
        "Nearby competitor movement alerts",
        "New AI recommendation moment testing",
        "Review, local entity, and content gap monitoring",
        "Monthly service/city page, FAQ, review syndication, and brand-search protection updates",
        "30/60/90 action plan beyond the initial fix",
      ],
    },
  };
}

function createLeaderboard(audit: AuditReport): MiniLeaderboardRow[] {
  const showCompetitorScores = supportsRevenueFraming(audit);
  const rows: Array<Omit<MiniLeaderboardRow, "rank">> = [
    {
      name: audit.client.name,
      websiteUrl: audit.client.websiteUrl,
      aviScore: audit.aviScore,
      aiRecommendationShare: showCompetitorScores ? (audit.revenueOpportunity?.clientAiRecommendationShare ?? null) : null,
      kind: "client",
    },
    ...(showCompetitorScores ? (audit.revenueOpportunity?.competitors.map((competitor) => ({
      name: competitor.name,
      websiteUrl: competitor.websiteUrl ?? null,
      aviScore: competitor.aviScore,
      aiRecommendationShare: competitor.aiRecommendationShare,
      kind: "competitor" as const,
    })) ?? []) : []),
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

function supportsRevenueFraming(audit: AuditReport) {
  const type = audit.client.businessType?.toLowerCase() ?? "";
  return type === "auto_dealer" || type.includes("dealer");
}

function isNationalOrEcommerce(audit: AuditReport) {
  const type = audit.client.businessType?.toLowerCase() ?? "";
  return audit.businessProfile?.serviceAreaType === "national" || type.includes("ecommerce") || type.includes("skincare");
}

function createRevenueScenarios(revenue: RevenueOpportunityProjection): MiniRevenueScenarios {
  return {
    conservative: { label: "Conservative", ...revenue.scenarios.conservative },
    likely: { label: "Likely", ...revenue.scenarios.likely },
    aggressive: { label: "Aggressive", ...revenue.scenarios.aggressive },
  };
}

function createRevenueLeakSnapshot(audit: AuditReport): MiniRevenueLeakFinding[] {
  const weakestGap = audit.categoryBreakdown.slice().sort((a, b) => a.score - b.score)[0];
  const missingPrompts = Math.max(0, audit.promptsTotal - audit.promptsAppeared);
  const missingChecks = audit.machineReadiness.checks.filter((check) => !check.passed);
  const trustCheck = missingChecks.find((check) => /trust|review|nap|contact|schema|h1|title/i.test(`${check.key} ${check.label}`));
  const serviceBrief = audit.seoSiteIntelligence.contentBriefs[0];
  const competitorFinding = audit.seoSiteIntelligence.competitorFindings.find((finding) => finding.advantage === "competitor");

  const leaks: MiniRevenueLeakFinding[] = [
    {
      title: missingPrompts > 0 ? `${missingPrompts} AI recommendation moments did not surface the business` : "AI answer coverage is not yet dominant",
      impact: audit.promptsAppeared === 0 ? "High" : "Medium",
      leakType: "AI visibility",
      summary: missingPrompts > 0
        ? "When buyers ask AI/search tools for local recommendations, the business is not consistently part of the answer set."
        : "The business appears in some tested prompts, but still needs stronger repeatable citation coverage.",
      fix: "Start by making the missed recommendation moments easier to answer with clearer service pages, trust proof, and machine-readable business details. The full report maps the exact priorities.",
    },
  ];

  if (weakestGap) {
    leaks.push({
      title: `${categoryLabelsFor(audit.businessProfile?.reportLabels)[weakestGap.category]} is the weakest visibility path`,
      impact: weakestGap.score < 35 ? "High" : "Medium",
      leakType: weakestGap.category === "trust" ? "Trust proof" : weakestGap.category === "service" ? "Service pages" : "Conversion path",
      summary: labelForGap(weakestGap.category, audit.businessProfile?.reportLabels),
      fix: "The full report turns this category into a prioritized fix sequence with the exact assets to create first.",
    });
  }

  leaks.push({
    title: trustCheck ? trustCheck.label : "Trust proof needs to sit closer to conversion points",
    impact: audit.machineReadiness.score < 50 ? "High" : "Medium",
    leakType: "Trust proof",
    summary: trustCheck?.evidence ?? "Reviews, certifications, local proof, and machine-readable entity signals should be visible where buyers decide to call or book.",
    fix: "The full report identifies which trust signals are incomplete and provides the implementation checklist.",
  });

  leaks.push({
    title: serviceBrief?.title ?? "High-value services need dedicated answer-ready pages",
    impact: audit.seoSiteIntelligence.score < 60 ? "High" : "Medium",
    leakType: "Service pages",
    summary: serviceBrief?.intent ?? "Thin or generic service coverage makes it harder for buyers and AI systems to match the business to exact needs.",
    fix: "The full report unlocks the exact page or content asset to build, plus the recommended copy blocks and priority order.",
  });

  if (supportsRevenueFraming(audit) && audit.revenueOpportunity && competitorFinding) {
    leaks.push({
      title: `${competitorFinding.competitor} has a visible competitor advantage`,
      impact: "High",
      leakType: "Competitor gap",
      summary: competitorFinding.finding,
      fix: "Use the full report to reverse-engineer competitor advantages and turn them into client-specific content and proof assets.",
    });
  }

  return leaks.slice(0, 4);
}

function createEvidenceCards(audit: AuditReport): MiniEvidenceCard[] {
  const missedPrompt = audit.promptResults.find((result) => result.score === 0 || result.competitors.length > 0);
  const failedMachineCheck = audit.machineReadiness.checks.find((check) => !check.passed);
  const failedSeoCheck = audit.seoSiteIntelligence.technicalChecks.find((check) => !check.passed);
  const target = audit.seoSiteIntelligence.target;
  const cards: MiniEvidenceCard[] = [];

  cards.push({
    finding: "AI answer visibility is not reliable yet",
    evidence: missedPrompt
      ? `AI recommendation moment tested: “${missedPrompt.clientFacingQuestion ?? missedPrompt.prompt}”. Outcome: ${missedPrompt.score === 0 ? "target absent" : "competitors appeared"}.`
      : `${audit.promptsAppeared}/${audit.promptsTotal} tested AI recommendation moments surfaced the business in the free preview model.`,
    whyItMatters: "If the business is absent from answer engines at the recommendation moment, buyers may shortlist competitors before reaching Google or the website.",
    recommendedFix: "A good first move is to add clearer answer-ready content and trust proof around this kind of question. The full report maps which pages, proof blocks, and technical changes come first.",
    confidence: missedPrompt ? "High" : "Directional",
  });

  cards.push({
    finding: failedMachineCheck ? diagnosticFindingTitle(failedMachineCheck.label, failedMachineCheck.passed) : "Machine-readable proof is incomplete",
    evidence: failedMachineCheck?.evidence ?? `Machine readiness score: ${audit.machineReadiness.score}/100.`,
    whyItMatters: "AI and search systems need clear structured signals to understand who the business serves, what it offers, and why it should be trusted.",
    recommendedFix: "The full report identifies which structured trust signals are incomplete and provides the implementation checklist.",
    confidence: failedMachineCheck ? "High" : "Medium",
  });

  cards.push({
    finding: failedSeoCheck ? diagnosticFindingTitle(failedSeoCheck.label, failedSeoCheck.passed) : "Website evidence needs a deeper paid crawl",
    evidence: failedSeoCheck?.evidence ?? (target ? `Built-in crawl found ${target.wordCount} crawlable words and schema types: ${target.schemaTypes.join(", ") || "none detected"}.` : "The free report uses a lightweight fetch-based crawl; rendered proof screenshots unlock in the paid report."),
    whyItMatters: "Weak crawlable content, missing FAQ patterns, or missing schema reduces the chance that AI systems can cite the business confidently.",
    recommendedFix: "The full report unlocks rendered proof checks and a prioritized implementation order for the most important gaps.",
    confidence: failedSeoCheck ? "High" : "Directional",
  });

  return cards;
}

function createSocialProofScore(audit: AuditReport): MiniSocialProofScore {
  const target = audit.seoSiteIntelligence.target;
  const socialProfiles = target?.socialProfiles ?? [];
  const signals: string[] = [];
  const opportunities: string[] = [];
  let score = 20;

  if (socialProfiles.length >= 2) {
    score += 30;
    signals.push(`Website links to ${formatList(socialProfiles)} profiles`);
  } else if (socialProfiles.length === 1) {
    score += 18;
    signals.push(`Website links to a ${socialProfiles[0]} profile`);
    opportunities.push("Connect at least one more active social profile from the website.");
  } else {
    opportunities.push("Link the website to active social profiles so AI can connect the brand footprint.");
  }

  if (audit.machineReadiness.schemaPresent || target?.schemaTypes.length) {
    score += 15;
    signals.push("Structured business/schema signals help verify the entity.");
  } else {
    opportunities.push("Add LocalBusiness or industry-specific schema that points to official social profiles.");
  }

  if (audit.machineReadiness.footerNapConsistent || audit.machineReadiness.heroContactAccessible) {
    score += 15;
    signals.push("Your website makes it clear who you are and how to contact you. That helps AI trust the business across the web.");
  } else {
    opportunities.push("Make name, address, phone, and booking paths consistent across site and profiles.");
  }

  if (audit.trustScore >= 50) {
    score += 12;
    signals.push("Trust/review visibility is already showing some strength.");
  } else {
    opportunities.push("Turn reviews, community posts, before/after proof, FAQs, and staff content into AI-readable trust assets.");
  }

  if (target?.hasFaqPattern) {
    score += 8;
    signals.push("Question-and-answer content gives social proof more context than follower count alone.");
  } else {
    opportunities.push("Post and repurpose recommendation-style questions as short social content and crawlable website FAQs.");
  }

  const cappedScore = Math.min(100, Math.round(score));

  return {
    title: "AI Social Proof Score",
    score: cappedScore,
    band: cappedScore >= 75 ? "Strong" : cappedScore >= 45 ? "Building" : "Thin",
    summary: isNationalOrEcommerce(audit)
      ? "This is not follower count. AI visibility is the level playing field: smaller product brands can win when their website, reviews, product proof, ingredient claims, schema, and social signals are consistent and easy to verify."
      : "This is not follower count. AI visibility is the level playing field: small local businesses can win when their website, profiles, reviews, proof, and service signals are consistent and easy to verify.",
    signals: signals.length ? signals : ["No connected social proof signals were visible in the free website scan yet."],
    opportunities: opportunities.slice(0, 4),
  };
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "social";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function diagnosticFindingTitle(label: string, passed: boolean) {
  if (passed) return label;
  const lowered = label.toLowerCase();
  if (lowered.includes("present")) return label.replace(/present/i, "missing or incomplete");
  if (lowered.includes("accessible")) return label.replace(/accessible/i, "not found or inaccessible");
  if (lowered.includes("usable")) return label.replace(/is usable/i, "needs improvement");
  if (lowered.includes("clear")) return label.replace(/present/i, "missing or unclear");
  return `${label} needs attention`;
}

function labelForGap(category: BusinessCategory, reportLabels?: Record<BusinessCategory, string>) {
  if (reportLabels?.[category]) return `${reportLabels[category]} is underperforming against the market.`;
  const labels: Record<BusinessCategory, string> = {
    discovery: "Discovery visibility is underperforming against the market.",
    trust: "Trust and review signals need stronger AI-readable proof.",
    service: "Service-related AI visibility needs more supporting context.",
    inventory: "Offer and service comparison context is not strong enough yet.",
    finance: "Value, pricing, and booking-intent prompts are weak.",
  };
  return labels[category];
}

function sampleQuestionFor(category: BusinessCategory, audit: AuditReport) {
  const market = audit.client.market ?? audit.client.city;
  const service = audit.businessProfile?.primaryServices[0] ?? audit.client.primaryMake ?? "business";
  const questions: Record<BusinessCategory, string> = {
    discovery: `I’m in ${market} and need ${service}. Who should I consider?`,
    trust: `Which ${service} options near ${market} have strong reviews and are worth checking first?`,
    service: `Where can I get help with ${service} around ${market}?`,
    inventory: `What should I compare before choosing a ${service} option near ${market}?`,
    finance: `Who offers a good value for ${service} near ${market}?`,
  };
  return questions[category];
}

function competitorNote(source: CompetitorSource) {
  const notes: Record<CompetitorSource, string> = {
    user_supplied: "Competitor benchmark uses the two competitors you supplied, which improves accuracy.",
    auto_discovered: "Competitor benchmark uses likely local competitors discovered from your niche and market.",
    mixed: "Competitor benchmark uses supplied competitors plus discovered local competitors.",
    none: "Add two competitors to make the competitor gap and local visibility opportunity estimate more accurate.",
  };
  return notes[source];
}

function categoryLabelsFor(reportLabels?: Record<BusinessCategory, string>): Record<BusinessCategory, string> {
  return {
    discovery: reportLabels?.discovery ?? "Discovery Visibility",
    trust: reportLabels?.trust ?? "Trust & Review Signals",
    service: reportLabels?.service ?? "Service Visibility",
    inventory: reportLabels?.inventory ?? "Offer Visibility",
    finance: reportLabels?.finance ?? "Value & Pricing Visibility",
  };
}

function shortId() {
  return crypto.randomUUID().slice(0, 8);
}
