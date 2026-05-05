import { describe, expect, it } from "vitest";
import { calculateAviScore, competitorGapScore, scorePromptResult } from "./scorer";
import type { PromptRunResult } from "./types";

const result = (category: PromptRunResult["category"], score: number | null): PromptRunResult => ({
  promptId: `${category}-${score}`,
  prompt: "test prompt",
  category,
  platform: "tavily",
  targetName: "Oakville Toyota",
  score,
  position: score === 10 ? 1 : null,
  snippet: score === null ? null : "Oakville Toyota was named in the response.",
  competitors: [],
  rawResponse: null,
  error: score === null ? "platform error" : null,
});

describe("scorePromptResult", () => {
  it("scores exact named recommendations traceably", () => {
    expect(scorePromptResult("Oakville Toyota", "Oakville Toyota is the best option. Burlington Toyota is another." )).toMatchObject({ score: 10, position: 1 });
    expect(scorePromptResult("Oakville Toyota", "Burlington Toyota is strong. Oakville Toyota is also mentioned." )).toMatchObject({ score: 6, position: 2 });
    expect(scorePromptResult("Oakville Toyota", "Some shoppers also mention Oakville Toyota in passing." )).toMatchObject({ score: 3, position: 1 });
    expect(scorePromptResult("Oakville Toyota", "Burlington Toyota is the only named dealer." )).toMatchObject({ score: 0, position: null });
  });
});

describe("calculateAviScore", () => {
  it("floors weighted category scores and excludes null prompt failures", () => {
    const calculated = calculateAviScore([
      result("discovery", 10), result("discovery", 6), result("discovery", null),
      result("trust", 6), result("trust", 0),
      result("service", 3), result("service", 3),
      result("inventory", 10), result("inventory", 0),
      result("finance", 6), result("finance", 6),
    ]);

    expect(calculated.discoveryScore).toBe(80);
    expect(calculated.trustScore).toBe(30);
    expect(calculated.serviceScore).toBe(30);
    expect(calculated.inventoryScore).toBe(50);
    expect(calculated.financeScore).toBe(60);
    expect(calculated.aviScore).toBe(51);
    expect(calculated.band).toBe("Weak");
  });
});

describe("competitorGapScore", () => {
  it("keeps the competitor gap on a 0-100 scale", () => {
    const noisyResults = [
      { ...result("discovery", 6), competitors: ["Dealer A", "Dealer B", "Dealer C", "Dealer D", "Dealer E"] },
      { ...result("trust", 6), competitors: ["Dealer A", "Dealer B", "Dealer C", "Dealer D", "Dealer E"] },
    ];

    expect(competitorGapScore(noisyResults)).toBe(100);
  });
});
