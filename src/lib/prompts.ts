import type { BusinessCategory, ClientInput, PromptTemplate } from "@/engines/research/types";

const CATEGORY_WEIGHTS: Record<BusinessCategory, number> = {
  discovery: 0.3,
  trust: 0.25,
  service: 0.2,
  inventory: 0.15,
  finance: 0.1,
};

const nicheLabels: Record<string, { core: string; service: string; product: string; finance: string }> = {
  auto_dealer: { core: "car dealership", service: "service center", product: "used cars", finance: "finance a vehicle" },
  dance_studio: { core: "dance studio", service: "dance classes", product: "adult dance classes", finance: "dance class membership" },
  real_estate: { core: "realtor", service: "real estate agent", product: "homes for sale", finance: "home buying advice" },
  real_estate_agent: { core: "realtor", service: "real estate agent", product: "homes for sale", finance: "home buying advice" },
};

const clean = (value?: string | null, fallback = "") => (value?.trim() ? value.trim() : fallback);

export function buildPromptPlan(input: ClientInput): PromptTemplate[] {
  const city = clean(input.city, "near me");
  const type = clean(input.businessType, "auto_dealer");
  const labels = nicheLabels[type] ?? { core: type.replaceAll("_", " "), service: `${type.replaceAll("_", " ")} services`, product: type.replaceAll("_", " "), finance: `${type.replaceAll("_", " ")} pricing` };

  if (type === "auto_dealer") {
    const make = clean(input.primaryMake, "car");
    const vehicle = clean(input.vehicle, make);
    return [
      prompt("1", "discovery", "tavily", `best ${make} dealer in ${city}`),
      prompt("2", "discovery", "tavily", `top-rated car dealership in ${city}`),
      prompt("3", "discovery", "tavily", `most trusted car dealership in ${city}`),
      prompt("4", "trust", "tavily", `which dealership has the best reviews in ${city}`),
      prompt("5", "trust", "tavily", `most reputable car dealer in ${city}`),
      prompt("6", "service", "tavily", `best ${make} service center in ${city}`),
      prompt("7", "service", "tavily", `where to get ${make} serviced in ${city}`),
      prompt("8", "inventory", "tavily", `best place to buy a used ${make} in ${city}`),
      prompt("9", "inventory", "tavily", `affordable used cars in ${city}`),
      prompt("10", "finance", "openai", `where can I finance a ${vehicle} in ${city}`),
      prompt("11", "finance", "openai", `best dealership for trade-in in ${city}`),
    ];
  }

  return [
    prompt("1", "discovery", "tavily", `best ${labels.core} in ${city}`),
    prompt("2", "discovery", "tavily", `top-rated ${labels.core} in ${city}`),
    prompt("3", "discovery", "tavily", `most trusted ${labels.core} in ${city}`),
    prompt("4", "trust", "tavily", `which ${labels.core} has the best reviews in ${city}`),
    prompt("5", "trust", "tavily", `most reputable ${labels.core} in ${city}`),
    prompt("6", "service", "tavily", `best ${labels.service} in ${city}`),
    prompt("7", "service", "tavily", `where to book ${labels.service} in ${city}`),
    prompt("8", "inventory", "tavily", `best ${labels.product} in ${city}`),
    prompt("9", "inventory", "tavily", `affordable ${labels.product} in ${city}`),
    prompt("10", "finance", "openai", `where can I compare ${labels.finance} in ${city}`),
    prompt("11", "finance", "openai", `best ${labels.core} for value in ${city}`),
  ];
}

function prompt(id: string, category: BusinessCategory, platform: "tavily" | "openai", text: string): PromptTemplate {
  return { id, category, platform, prompt: text, weight: CATEGORY_WEIGHTS[category] };
}

export { CATEGORY_WEIGHTS };
