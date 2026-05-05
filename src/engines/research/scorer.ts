import { CATEGORY_WEIGHTS } from "@/lib/prompts";
import type { AviBand, BusinessCategory, CategoryBreakdown, PromptRunResult } from "./types";

const categories: BusinessCategory[] = ["discovery", "trust", "service", "inventory", "finance"];

export function scorePromptResult(targetName: string, response: string): { score: number; position: number | null; snippet: string | null } {
  const text = response.trim();
  if (!text || !containsName(text, targetName)) return { score: 0, position: null, snippet: text.slice(0, 300) || null };

  const position = estimateMentionPosition(text, targetName);
  const firstSentence = text.split(/[.!?\n]/)[0] ?? text;
  const targetInFirstSentence = containsName(firstSentence, targetName);
  const strongLanguage = /\b(best|top|first|recommend|recommended|trusted|reputable|leading|strongest)\b/i.test(firstSentence);
  const passingLanguage = /\b(passing|some shoppers|mentioned in passing)\b/i.test(text);

  if (targetInFirstSentence && strongLanguage && !/^some\b/i.test(firstSentence)) {
    return { score: 10, position, snippet: snippetAround(text, targetName) };
  }
  if (passingLanguage) return { score: 3, position, snippet: snippetAround(text, targetName) };
  return { score: position && position > 1 ? 6 : 6, position, snippet: snippetAround(text, targetName) };
}

export function calculateAviScore(results: PromptRunResult[]) {
  const breakdown: CategoryBreakdown[] = categories.map((category) => {
    const categoryResults = results.filter((result) => result.category === category);
    const scored = categoryResults.filter((result) => result.score !== null) as Array<PromptRunResult & { score: number }>;
    const averagePromptScore = scored.length ? scored.reduce((sum, result) => sum + result.score, 0) / scored.length : 0;
    return {
      category,
      score: Math.floor(averagePromptScore * 10),
      promptsTotal: categoryResults.length,
      promptsScored: scored.length,
      weight: CATEGORY_WEIGHTS[category],
    };
  });

  const categoryScore = (category: BusinessCategory) => breakdown.find((item) => item.category === category)?.score ?? 0;
  const discoveryScore = categoryScore("discovery");
  const trustScore = categoryScore("trust");
  const serviceScore = categoryScore("service");
  const inventoryScore = categoryScore("inventory");
  const financeScore = categoryScore("finance");
  const aviScore = Math.floor(
    discoveryScore * CATEGORY_WEIGHTS.discovery +
      trustScore * CATEGORY_WEIGHTS.trust +
      serviceScore * CATEGORY_WEIGHTS.service +
      inventoryScore * CATEGORY_WEIGHTS.inventory +
      financeScore * CATEGORY_WEIGHTS.finance,
  );

  return {
    aviScore,
    band: bandForScore(aviScore),
    discoveryScore,
    trustScore,
    serviceScore,
    inventoryScore,
    financeScore,
    categoryBreakdown: breakdown,
  };
}

export function bandForScore(score: number): AviBand {
  if (score >= 80) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 30) return "Weak";
  return "Not Visible";
}

export function competitorGapScore(results: PromptRunResult[]) {
  const appearances = results.reduce((sum, result) => sum + result.competitors.length, 0);
  return Math.min(100, Math.floor((appearances / Math.max(results.length, 1)) * 100));
}

export function primaryCompetitor(results: PromptRunResult[]) {
  const counts = new Map<string, number>();
  for (const result of results) {
    for (const competitor of result.competitors) counts.set(competitor, (counts.get(competitor) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function containsName(text: string, name: string) {
  return text.toLowerCase().includes(name.toLowerCase());
}

function estimateMentionPosition(text: string, targetName: string) {
  const names = text.match(/\b[A-Z][A-Za-z'&-]*(?:\s+[A-Z][A-Za-z'&-]*){1,4}\b/g) ?? [];
  const normalizedTarget = targetName.toLowerCase();
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const index = unique.findIndex((name) => name.toLowerCase().includes(normalizedTarget));
  return index >= 0 ? index + 1 : 1;
}

function snippetAround(text: string, targetName: string) {
  const index = text.toLowerCase().indexOf(targetName.toLowerCase());
  const start = Math.max(0, index - 120);
  return text.slice(start, start + 300).trim();
}
