import { describe, expect, it } from "vitest";
import { buildPromptPlan } from "@/lib/prompts";

describe("buildPromptPlan", () => {
  it("builds the 11 dealership prompts with category weights", () => {
    const prompts = buildPromptPlan({ name: "Oakville Toyota", city: "Oakville", businessType: "auto_dealer", primaryMake: "Toyota" });

    expect(prompts).toHaveLength(11);
    expect(prompts[0]).toMatchObject({ prompt: "best Toyota dealer in Oakville", category: "discovery", platform: "tavily" });
    expect(prompts[10]).toMatchObject({ prompt: "best dealership for trade-in in Oakville", category: "finance", platform: "openai" });
  });

  it("adapts prompts for non-dealership local niches", () => {
    const prompts = buildPromptPlan({ name: "Salsa North", city: "Toronto", businessType: "dance_studio" });

    expect(prompts).toHaveLength(11);
    expect(prompts[0].prompt).toBe("best dance studio in Toronto");
    expect(prompts.some((prompt) => prompt.prompt.includes("car dealership"))).toBe(false);
  });
});
