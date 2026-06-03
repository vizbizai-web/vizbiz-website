import { buildPromptPlan } from "@/lib/prompts";
import { createBusinessProfile, resolveBusinessIntelligenceProfile, type BusinessProfile } from "@/engines/business-profile/profile";
import { checkMachineReadiness } from "./machine-readiness";
import { buildSeoSiteIntelligence } from "./site-intelligence";
import { calculateAviScore, competitorGapScore, primaryCompetitor, scorePromptResult } from "./scorer";
import { queryOpenAI } from "./platforms/openai";
import { queryPerplexitySonar } from "./platforms/perplexity";
import { enrichWithGooglePlaces, toGoogleBusinessEvidence } from "./platforms/google-places";
import { crawlWebsiteEvidence } from "./site-crawler";
import { buildCompetitorEvidence } from "./competitor-intelligence";
import { queryTavily } from "./platforms/tavily";
import { calculateRevenueOpportunity } from "./revenue";
import { createClientDeliverables } from "@/engines/deliverables/client-output";
import type { AuditClient, AuditReport, ClientInput, PromptRunResult, PromptTemplate } from "./types";
import type { BusinessIntelligenceProfile } from "./business-intelligence-types";

export async function runAudit(input: ClientInput): Promise<AuditReport> {
  const createdAt = new Date().toISOString();
  const initialClient = normalizeClient(input);
  const [googlePlaces, websiteCrawlEvidence, seoSiteIntelligence] = await Promise.all([
    enrichWithGooglePlaces(input),
    input.websiteUrl ? crawlWebsiteEvidence(input.websiteUrl, { maxPages: 8, timeoutMs: 3500 }) : Promise.resolve(undefined),
    buildSeoSiteIntelligence(input),
  ]);
  const competitorEvidence = await buildCompetitorEvidence(
    (input.competitors ?? []).map((competitor) => ({ name: competitor.name, city: input.city, websiteUrl: competitor.websiteUrl })),
    websiteCrawlEvidence?.extractedServices ?? [],
    { maxCompetitors: 2, crawl: (url) => crawlWebsiteEvidence(url, { maxPages: 3, timeoutMs: 2500 }) },
  );
  const businessIntelligenceProfile = resolveBusinessIntelligenceProfile({
    intake: input,
    google: googlePlaces.client ? toGoogleBusinessEvidence(googlePlaces.client, input.websiteUrl) : null,
    clientCrawl: websiteCrawlEvidence ?? null,
    competitors: competitorEvidence,
  });
  const siteInferredService = businessIntelligenceProfile.primaryServices[0] ?? inferPrimaryServiceFromSeo(seoSiteIntelligence);
  const profileInput: ClientInput = {
    ...input,
    businessType: input.businessType ?? businessTypeFromIntelligence(businessIntelligenceProfile.displayNiche) ?? input.businessType,
    primaryService: input.primaryService ?? siteInferredService ?? input.services?.[0],
    services: input.services ?? (businessIntelligenceProfile.primaryServices.length ? businessIntelligenceProfile.primaryServices : siteInferredService ? [siteInferredService] : undefined),
  };
  const baseBusinessProfile = await createBusinessProfile({
    ...profileInput,
    primaryService: profileInput.primaryService,
  });
  const businessProfile = applyBusinessIntelligenceToProfile(baseBusinessProfile, businessIntelligenceProfile);
  const enrichedInput: ClientInput = {
    ...profileInput,
    businessType: profileInput.businessType ?? businessProfile.niche,
    primaryService: profileInput.primaryService ?? businessProfile.primaryServices[0],
  };
  const client = { ...initialClient, businessType: enrichedInput.businessType ?? initialClient.businessType };
  const promptPlan = buildPromptPlan(enrichedInput);
  const promptResults: PromptRunResult[] = [];

  for (const prompt of promptPlan) {
    try {
      const raw = await queryPromptProvider(prompt);
      const isFallback = raw.includes("API_KEY is not configured");
      const scored = isFallback ? { score: null, position: null, snippet: null } : scorePromptResult(client.name, raw);
      promptResults.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        category: prompt.category,
        platform: isFallback ? "fallback" : prompt.platform,
        targetName: client.name,
        score: scored.score,
        position: scored.position,
        snippet: scored.snippet,
        competitors: extractCompetitors(raw, client.name),
        rawResponse: raw,
        error: isFallback ? "API key not configured; prompt excluded from averages." : null,
        intentBucket: prompt.intentBucket,
        source: prompt.source,
        clientFacingQuestion: prompt.clientFacingQuestion,
        showInFreeReport: prompt.showInFreeReport,
      });
    } catch (error) {
      promptResults.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        category: prompt.category,
        platform: prompt.platform,
        targetName: client.name,
        score: null,
        position: null,
        snippet: null,
        competitors: [],
        rawResponse: null,
        error: error instanceof Error ? error.message : "Unknown platform error",
        intentBucket: prompt.intentBucket,
        source: prompt.source,
        clientFacingQuestion: prompt.clientFacingQuestion,
        showInFreeReport: prompt.showInFreeReport,
      });
    }
  }

  const scores = calculateAviScore(promptResults);
  const revenueOpportunity = calculateRevenueOpportunity({
    clientName: client.name,
    clientAviScore: scores.aviScore,
    competitors: input.competitors ?? [],
    assumptions: input.revenueAssumptions,
  });
  const machineReadiness = await checkMachineReadiness(enrichedInput);

  const report: AuditReport = {
    id: `audit_${crypto.randomUUID()}`,
    client,
    status: "completed",
    ...scores,
    competitorGapScore: competitorGapScore(promptResults),
    primaryCompetitor: primaryCompetitor(promptResults),
    promptsTotal: promptResults.length,
    promptsAppeared: promptResults.filter((result) => (result.score ?? 0) > 0).length,
    promptResults,
    machineReadiness,
    seoSiteIntelligence,
    googlePlaces,
    websiteCrawlEvidence,
    competitorEvidence,
    businessIntelligenceProfile,
    businessProfile,
    revenueOpportunity,
    createdAt,
    completedAt: new Date().toISOString(),
  };

  report.clientDeliverables = createClientDeliverables(report);
  return report;
}

function queryPromptProvider(prompt: PromptTemplate) {
  if (prompt.platform === "openai") return queryOpenAI(prompt);
  if (prompt.platform === "perplexity") return queryPerplexitySonar(prompt);
  return queryTavily(prompt);
}

function normalizeClient(input: ClientInput): AuditClient {
  return {
    id: input.id ?? `client_${slugify(input.name)}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    businessType: input.businessType ?? "generic_local_service",
    websiteUrl: input.websiteUrl ?? null,
    city: input.city,
    market: input.market ?? input.city,
    primaryMake: input.primaryMake ?? null,
  };
}

export function extractCompetitors(text: string, targetName: string) {
  const matches = text.match(/\b[A-Z][A-Za-z'&-]*(?:\s+[A-Z][A-Za-z'&-]*){1,4}\b/g) ?? [];
  const normalizedTarget = targetName.toLowerCase();
  const genericSources = new Set(["autotrader canada", "carfax canada", "google reviews", "dealer rater"]);
  const blacklist = new Set([normalizedTarget, "no automated tavily", "no automated openai"]);

  return [
    ...new Set(
      matches
        .map((match) => match.trim())
        .filter((match) => {
          const normalized = match.toLowerCase();
          return (
            !blacklist.has(normalized) &&
            !genericSources.has(normalized) &&
            !isGenericHeading(match) &&
            !isKeywordPhrase(match) &&
            !isSearchArtifact(match) &&
            !normalized.includes(normalizedTarget) &&
            !match.includes("API")
          );
        }),
    ),
  ].slice(0, 5);
}

function isGenericHeading(match: string) {
  const words = match.split(/\s+/);
  const isAllCaps = match === match.toUpperCase();
  const genericWords = /\b(BEST|CAR|CARS|DEALER|DEALERS|USED|NEAR|OAKVILLE|CHEAP)\b/.test(match);
  return isAllCaps && words.length >= 2 && genericWords;
}

function isKeywordPhrase(match: string) {
  return /^(Used|Affordable|Cheap|Best|Top|Toyota Service|Toyota Roadside|What Is|Car Dealers?)(\b|\s)/.test(match) || /\b(Dealership|Dealerships|Dealers|Cars|Service Centre)$/.test(match);
}

function isSearchArtifact(match: string) {
  return /\n/.test(match) || /^(With|Our|Customer|Last Updated)\b/.test(match) || /\b(Reviews|Review|JD Power|Rd|Road|Genuine Toyota|BEST Toyota Service)\b/.test(match);
}

function applyBusinessIntelligenceToProfile(profile: BusinessProfile, intelligence: BusinessIntelligenceProfile): BusinessProfile {
  const services = Array.from(new Set([...intelligence.primaryServices, ...profile.primaryServices])).slice(0, 6);
  return {
    ...profile,
    displayNiche: intelligence.displayNiche || profile.displayNiche,
    profileMode: intelligence.profileMode,
    classificationEvidence: [
      ...intelligence.evidence.map((item) => `${item.label}: ${item.value}`),
      ...intelligence.contradictions.map((item) => `Review needed: ${item}`),
    ].slice(0, 8),
    confidence: Math.max(0, Math.min(1, intelligence.confidence / 100)),
    primaryServices: services.length ? services : profile.primaryServices,
    schemaType: intelligence.schemaType || profile.schemaType,
  };
}

function businessTypeFromIntelligence(displayNiche: string): ClientInput["businessType"] | undefined {
  const normalized = displayNiche.toLowerCase();
  if (/tax|account|bookkeep|payroll/.test(normalized)) return "tax_service";
  if (/dentist|dental/.test(normalized)) return "dentist";
  if (/roof/.test(normalized)) return "roofer";
  if (/plumb/.test(normalized)) return "plumber";
  if (/hvac|heating|cooling/.test(normalized)) return "hvac";
  if (/restaurant|mexican|food/.test(normalized)) return "mexican_restaurant";
  if (/dealership|dealer|kia|toyota|honda|ford|chevrolet|nissan|mazda|subaru/.test(normalized)) return "auto_dealer";
  return undefined;
}

function inferPrimaryServiceFromSeo(seo: AuditReport["seoSiteIntelligence"]) {
  const target = seo.target;
  if (!target) return null;
  const combined = [target.title, target.h1, ...target.schemaTypes, ...seo.contentBriefs.map((brief) => brief.title)].join(" ");
  const normalized = combined.toLowerCase().replace(/[^a-z0-9&/ +.-]+/g, " ").replace(/\s+/g, " ").trim();
  const explicit = [
    "tax preparation", "bookkeeping", "payroll", "accounting", "landscaping", "lawn care", "pest control", "chiropractor", "physiotherapy",
    "massage therapy", "insurance broker", "mortgage broker", "real estate agent", "property management", "cleaning service", "moving company",
    "electrician", "painting contractor", "concrete contractor", "pool service", "tutoring", "daycare", "veterinary clinic", "pet grooming",
    "photography", "catering", "personal training", "therapy", "consulting",
  ].find((term) => normalized.includes(term));
  if (explicit) return explicit;
  const schemaService = target.schemaTypes.find((type) => /service|business|clinic|contractor|store|restaurant|organization/i.test(type));
  return schemaService ? schemaService.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase() : null;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
}
