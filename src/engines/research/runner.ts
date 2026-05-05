import { buildPromptPlan } from "@/lib/prompts";
import { checkMachineReadiness } from "./machine-readiness";
import { calculateAviScore, competitorGapScore, primaryCompetitor, scorePromptResult } from "./scorer";
import { queryOpenAI } from "./platforms/openai";
import { queryTavily } from "./platforms/tavily";
import { calculateRevenueOpportunity } from "./revenue";
import type { AuditClient, AuditReport, ClientInput, PromptRunResult } from "./types";

export async function runAudit(input: ClientInput): Promise<AuditReport> {
  const createdAt = new Date().toISOString();
  const client = normalizeClient(input);
  const promptPlan = buildPromptPlan(input);
  const promptResults: PromptRunResult[] = [];

  for (const prompt of promptPlan) {
    try {
      const raw = prompt.platform === "openai" ? await queryOpenAI(prompt) : await queryTavily(prompt);
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
  return {
    id: `audit_${crypto.randomUUID()}`,
    client,
    status: "completed",
    ...scores,
    competitorGapScore: competitorGapScore(promptResults),
    primaryCompetitor: primaryCompetitor(promptResults),
    promptsTotal: promptResults.length,
    promptsAppeared: promptResults.filter((result) => (result.score ?? 0) > 0).length,
    promptResults,
    machineReadiness: await checkMachineReadiness(input),
    revenueOpportunity,
    createdAt,
    completedAt: new Date().toISOString(),
  };
}

function normalizeClient(input: ClientInput): AuditClient {
  return {
    id: input.id ?? `client_${slugify(input.name)}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    businessType: input.businessType ?? "auto_dealer",
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

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
}
