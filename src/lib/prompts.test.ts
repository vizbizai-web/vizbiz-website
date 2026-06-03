import { describe, expect, it } from "vitest";
import { buildPromptPlan } from "@/lib/prompts";

describe("buildPromptPlan", () => {
  it("builds the 11 dealership prompts with category weights", () => {
    const prompts = buildPromptPlan({ name: "Oakville Toyota", city: "Oakville", businessType: "auto_dealer", primaryMake: "Toyota" });

    expect(prompts).toHaveLength(11);
    expect(prompts[0]).toMatchObject({ prompt: "I'm in Oakville and looking for a Toyota dealership. Who should I consider?", category: "discovery", platform: "perplexity", showInFreeReport: true });
    expect(prompts.map((prompt) => prompt.prompt)).toEqual(expect.arrayContaining([
      "Where should I take my Toyota for service or repairs near Oakville?",
      "Which Toyota dealer near Oakville is good for parts, maintenance, brakes, or warranty service?",
    ]));
    expect(prompts[10]).toMatchObject({ prompt: "best dealership for trade-in in Oakville", category: "finance", platform: "openai" });
    expect(prompts.filter((prompt) => prompt.showInFreeReport)).toHaveLength(5);
    expect(prompts.map((prompt) => prompt.clientFacingQuestion)).toContain("Which dealership near Oakville seems trustworthy for buying a Toyota?");
    expect(prompts.filter((prompt) => prompt.showInFreeReport).map((prompt) => prompt.clientFacingQuestion)).not.toContain("best Toyota dealer in Oakville");
  });

  it("adapts prompts for detected non-dealership local niches", () => {
    const prompts = buildPromptPlan({ name: "Oakville Family Dental", city: "Oakville", businessType: "dentist", primaryService: "emergency dental" });

    expect(prompts).toHaveLength(11);
    expect(prompts[0].prompt).toBe("I'm looking for a dentist in Oakville. Who should I consider?");
    expect(prompts.some((prompt) => prompt.prompt.includes("emergency dentist"))).toBe(true);
    expect(prompts.some((prompt) => prompt.prompt.includes("car dealership"))).toBe(false);
  });

  it("builds a mixed AI recommendation prompt universe for restaurants", () => {
    const prompts = buildPromptPlan({ name: "Rodrigo's Mexican Grill", city: "Huntington Beach", businessType: "mexican_restaurant", primaryService: "Mexican food" });

    expect(prompts).toHaveLength(16);
    expect(prompts.map((prompt) => prompt.intentBucket)).toEqual(expect.arrayContaining([
      "category_discovery",
      "conversational_recommendation",
      "occasion_context",
      "menu_service_intent",
      "trust_review_comparison",
      "branded_entity",
    ]));
    expect(prompts.map((prompt) => prompt.source)).toEqual(expect.arrayContaining([
      "search_backed",
      "vertical_pack",
      "ai_native_variant",
      "client_entity",
    ]));
    expect(prompts.some((prompt) => prompt.prompt === "best Mexican food Huntington Beach")).toBe(true);
    expect(prompts.some((prompt) => prompt.clientFacingQuestion === "I’m in Huntington Beach and want Mexican food tonight. Where should I go?")).toBe(true);
    expect(prompts.filter((prompt) => prompt.showInFreeReport)).toHaveLength(5);
    expect(prompts.filter((prompt) => prompt.showInFreeReport).map((prompt) => prompt.clientFacingQuestion)).not.toContain("best Mexican food Huntington Beach");
  });

  it("uses Spanish, human-style AI shopping questions for Mexico healthy-snack ecommerce", () => {
    const prompts = buildPromptPlan({ name: "Gommi-li", city: "Mexico", businessType: "healthy_snack_ecommerce", primaryService: "gomitas sin azúcar" });

    expect(prompts).toHaveLength(16);
    expect(prompts.filter((prompt) => prompt.showInFreeReport)).toHaveLength(5);
    expect(prompts.some((prompt) => prompt.clientFacingQuestion === "Tengo antojo de gomitas, pero quiero algo con menos azúcar. ¿Qué marcas me recomiendas en México?")).toBe(true);
    expect(prompts.some((prompt) => prompt.clientFacingQuestion === "Busco gomitas veganas y sin azúcar añadida para comprar en México. ¿Cuáles debería probar?")).toBe(true);
    expect(prompts.filter((prompt) => prompt.showInFreeReport).map((prompt) => prompt.clientFacingQuestion)).not.toContain("I want candy that feels like gummies but has less sugar. What brands should I try?");
  });

  it("builds human tax-service questions instead of generic local-business prompts", () => {
    const prompts = buildPromptPlan({ name: "AK Consultancy Services Inc.", city: "Oakville", businessType: "tax_service", primaryService: "tax services" });

    expect(prompts).toHaveLength(7);
    expect(prompts[0]).toMatchObject({ prompt: "I'm in Oakville and need help with taxes. Which tax services should I consider?", category: "discovery", platform: "perplexity", showInFreeReport: true });
    expect(prompts.map((prompt) => prompt.prompt)).toEqual(expect.arrayContaining([
      "Which tax accountant near Oakville seems trustworthy for personal or small business taxes?",
      "Where can I get personal tax returns, corporate tax filing, or bookkeeping help near Oakville?",
    ]));
    expect(prompts.map((prompt) => prompt.prompt).join(" ")).not.toContain("local business");
  });

  it("builds dynamic service prompts for new clear niches instead of local-business fallback", () => {
    const prompts = buildPromptPlan({ name: "Green Yard Pros", city: "Hamilton", businessType: "generic_local_service", primaryService: "landscaping" });

    expect(prompts).toHaveLength(6);
    expect(prompts[0]).toMatchObject({ prompt: "I'm in Hamilton and need help with landscaping. Who should I consider?", showInFreeReport: true });
    expect(prompts.map((prompt) => prompt.prompt).join(" ")).not.toContain("local business");
    expect(prompts.filter((prompt) => prompt.showInFreeReport)).toHaveLength(4);
  });
});
