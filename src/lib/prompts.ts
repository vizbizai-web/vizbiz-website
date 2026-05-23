import { getNicheDefinition } from "@/engines/business-profile/profile";
import type { BusinessCategory, ClientInput, PromptIntentBucket, PromptSource, PromptTemplate } from "@/engines/research/types";

const CATEGORY_WEIGHTS: Record<BusinessCategory, number> = {
  discovery: 0.3,
  trust: 0.25,
  service: 0.2,
  inventory: 0.15,
  finance: 0.1,
};

const clean = (value?: string | null, fallback = "") => (value?.trim() ? value.trim() : fallback);

export function buildPromptPlan(input: ClientInput): PromptTemplate[] {
  const city = clean(input.city, "near me");
  const type = clean(input.businessType, "generic_local_service");

  if (type === "auto_dealer") {
    const make = clean(input.primaryMake, "car");
    const vehicle = clean(input.vehicle, make);
    return [
      prompt("1", "discovery", "perplexity", `best ${make} dealer in ${city}`),
      prompt("2", "discovery", "tavily", `top-rated car dealership in ${city}`),
      prompt("3", "discovery", "perplexity", `most trusted car dealership in ${city}`),
      prompt("4", "trust", "perplexity", `which dealership has the best reviews in ${city}`),
      prompt("5", "trust", "tavily", `most reputable car dealer in ${city}`),
      prompt("6", "service", "tavily", `best ${make} service center in ${city}`),
      prompt("7", "service", "tavily", `where to get ${make} serviced in ${city}`),
      prompt("8", "inventory", "tavily", `best place to buy a used ${make} in ${city}`),
      prompt("9", "inventory", "tavily", `affordable used cars in ${city}`),
      prompt("10", "finance", "openai", `where can I finance a ${vehicle} in ${city}`),
      prompt("11", "finance", "openai", `best dealership for trade-in in ${city}`),
    ];
  }

  const niche = getNicheDefinition(type);
  const labels = niche.promptLabels;
  const primaryService = clean(input.primaryService, labels.service);

  if (type === "mexican_restaurant") {
    return mexicanRestaurantPromptUniverse(input, city);
  }

  if (type === "natural_skincare_ecommerce") {
    return naturalSkincarePromptUniverse(input);
  }

  if (type === "healthy_snack_ecommerce") {
    return healthySnackPromptUniverse(input);
  }

  return [
    prompt("1", "discovery", "perplexity", `I'm looking for a ${labels.core} in ${city}. Who should I consider?`),
    prompt("2", "discovery", "tavily", `top-rated ${labels.core} in ${city}`),
    prompt("3", "discovery", "perplexity", `Which ${labels.core} near ${city} would locals recommend?`),
    prompt("4", "trust", "perplexity", `What ${labels.core} in ${city} has strong reviews and trust signals?`),
    prompt("5", "trust", "tavily", `most trusted ${labels.core} in ${city}`),
    prompt("6", "service", "tavily", `best ${primaryService} in ${city}`),
    prompt("7", "service", "tavily", `where can I get ${primaryService} in ${city}`),
    prompt("8", "inventory", "tavily", `best ${labels.product} in ${city}`),
    prompt("9", "inventory", "tavily", `${labels.urgency} in ${city}`),
    prompt("10", "finance", "openai", `${labels.finance} in ${city}`),
    prompt("11", "finance", "openai", `best value ${labels.core} near ${city}`),
  ];
}

function mexicanRestaurantPromptUniverse(input: ClientInput, city: string): PromptTemplate[] {
  const brand = clean(input.name, "the restaurant");
  const prompts: PromptTemplate[] = [
    prompt("1", "discovery", "perplexity", `best Mexican food ${city}`, promptMeta("category_discovery", "search_backed", "Mexican food recommendations in the local market")),
    prompt("2", "discovery", "tavily", `authentic Mexican food ${city}`, promptMeta("category_discovery", "search_backed", "Authentic Mexican food recommendations nearby")),
    prompt("3", "discovery", "tavily", `best tacos ${city}`, promptMeta("category_discovery", "search_backed", "Taco recommendations in the local market")),
    prompt("4", "inventory", "tavily", `Mexican restaurant ${city} open now`, promptMeta("category_discovery", "search_backed", "Mexican restaurants nearby that are open now")),
    prompt("5", "discovery", "perplexity", `I'm in ${city} and want Mexican food tonight. Where should I go?`, promptMeta("conversational_recommendation", "ai_native_variant", `I’m in ${city} and want Mexican food tonight. Where should I go?`, true)),
    prompt("6", "trust", "perplexity", `Which Mexican restaurants in ${city} have good reviews and are worth trying?`, promptMeta("trust_review_comparison", "ai_native_variant", `Which Mexican restaurants in ${city} have good reviews and are worth trying?`, true)),
    prompt("7", "service", "perplexity", `Where can I get tacos, burritos, and margaritas near ${city}?`, promptMeta("menu_service_intent", "ai_native_variant", `Where can I get tacos, burritos, and margaritas near ${city}?`, true)),
    prompt("8", "discovery", "openai", `What are a few Mexican restaurants locals recommend around ${city}?`, promptMeta("conversational_recommendation", "ai_native_variant", `What are a few Mexican restaurants locals recommend around ${city}?`, true)),
    prompt("9", "trust", "openai", `Where should I take family for casual Mexican food in ${city}?`, promptMeta("occasion_context", "ai_native_variant", `Where should I take family for casual Mexican food in ${city}?`, true)),
    prompt("10", "inventory", "openai", `Where should we go for margaritas and Mexican food near ${city}?`, promptMeta("occasion_context", "vertical_pack", `Where should we go for margaritas and Mexican food near ${city}?`)),
    prompt("11", "service", "tavily", `Mexican takeout near me in ${city}`, promptMeta("menu_service_intent", "search_backed", "Mexican takeout nearby")),
    prompt("12", "inventory", "tavily", `Mexican food near ${city} pier`, promptMeta("menu_service_intent", "search_backed", "Mexican food near local landmarks")),
    prompt("13", "finance", "openai", `Which Mexican restaurants near ${city} are good value for dinner?`, promptMeta("occasion_context", "vertical_pack", `Which Mexican restaurants near ${city} are good value for dinner?`)),
    prompt("14", "trust", "openai", `How should I compare Mexican restaurants in ${city}?`, promptMeta("trust_review_comparison", "vertical_pack", `How should I compare Mexican restaurants in ${city}?`)),
    prompt("15", "trust", "openai", `Is ${brand} in ${city} worth trying?`, promptMeta("branded_entity", "client_entity", `Is ${brand} in ${city} worth trying?`)),
    prompt("16", "trust", "tavily", `${brand} reviews ${city}`, promptMeta("branded_entity", "client_entity", `${brand} reviews in ${city}`)),
  ];

  return dedupePrompts(prompts);
}

function naturalSkincarePromptUniverse(input: ClientInput): PromptTemplate[] {
  const brand = clean(input.name, "the brand");
  const prompts: PromptTemplate[] = [
    prompt("1", "discovery", "tavily", "best organic aloe vera gel for skin", promptMeta("category_discovery", "search_backed", "Organic aloe vera gel recommendations")),
    prompt("2", "discovery", "tavily", "best natural skincare brands for sensitive skin", promptMeta("category_discovery", "search_backed", "Natural skincare recommendations for sensitive skin")),
    prompt("3", "service", "tavily", "fragrance free aloe vera gel for sunburn", promptMeta("menu_service_intent", "search_backed", "Fragrance-free aloe vera gel for sunburn")),
    prompt("4", "inventory", "tavily", "unscented castile soap baby safe organic", promptMeta("menu_service_intent", "search_backed", "Baby-safe unscented castile soap options")),
    prompt("5", "discovery", "perplexity", "I need a clean aloe vera gel for sunburn. Which brands should I look at?", promptMeta("conversational_recommendation", "ai_native_variant", "I need a clean aloe vera gel for sunburn. Which brands should I look at?", true)),
    prompt("6", "trust", "perplexity", "What natural skincare brands are trustworthy for sensitive skin and families?", promptMeta("trust_review_comparison", "ai_native_variant", "What natural skincare brands are trustworthy for sensitive skin and families?", true)),
    prompt("7", "service", "openai", "I want fragrance-free natural skincare that is gentle. What should I buy?", promptMeta("menu_service_intent", "ai_native_variant", "I want fragrance-free natural skincare that is gentle. What should I buy?", true)),
    prompt("8", "inventory", "openai", "What is a good organic aloe vera gel for dry or irritated skin?", promptMeta("menu_service_intent", "ai_native_variant", "What is a good organic aloe vera gel for dry or irritated skin?", true)),
    prompt("9", "trust", "openai", "How do I compare aloe vera gel brands like Seven Minerals, NaturSense, and other natural skincare options?", promptMeta("trust_review_comparison", "competitor_supplied", "How do I compare aloe vera gel brands like Seven Minerals, NaturSense, and other natural skincare options?", true)),
    prompt("10", "finance", "openai", "Which natural skincare products are good value without fragrance or harsh additives?", promptMeta("occasion_context", "vertical_pack", "Which natural skincare products are good value without fragrance or harsh additives?")),
    prompt("11", "service", "perplexity", "What should I use after too much sun if I want a natural product?", promptMeta("occasion_context", "ai_native_variant", "What should I use after too much sun if I want a natural product?")),
    prompt("12", "inventory", "tavily", "NaturSense aloe vera gel reviews", promptMeta("branded_entity", "client_entity", "NaturSense aloe vera gel reviews")),
    prompt("13", "trust", "openai", `Is ${brand} a good natural skincare brand?`, promptMeta("branded_entity", "client_entity", `Is ${brand} a good natural skincare brand?`)),
    prompt("14", "trust", "perplexity", `Is ${brand} aloe vera gel worth buying compared with Seven Minerals?`, promptMeta("branded_entity", "client_entity", `Is ${brand} aloe vera gel worth buying compared with Seven Minerals?`)),
    prompt("15", "inventory", "openai", "What are good alternatives to Babo Botanicals for gentle family skincare?", promptMeta("trust_review_comparison", "competitor_supplied", "What are good alternatives to Babo Botanicals for gentle family skincare?")),
    prompt("16", "discovery", "tavily", "natural wellness everyday essentials aloe vera castile soap", promptMeta("category_discovery", "search_backed", "Natural wellness essentials such as aloe vera gel and castile soap")),
  ];

  return dedupePrompts(prompts);
}

function healthySnackPromptUniverse(input: ClientInput): PromptTemplate[] {
  const brand = clean(input.name, "la marca");
  const prompts: PromptTemplate[] = [
    prompt("1", "discovery", "tavily", "mejores dulces saludables en México", promptMeta("category_discovery", "search_backed", "Mejores dulces saludables en México")),
    prompt("2", "discovery", "tavily", "gomitas sin azúcar añadida México", promptMeta("category_discovery", "search_backed", "Gomitas sin azúcar añadida en México")),
    prompt("3", "service", "tavily", "gomitas veganas sin azúcar añadida México", promptMeta("menu_service_intent", "search_backed", "Gomitas veganas sin azúcar añadida en México")),
    prompt("4", "inventory", "tavily", "dulces keto kosher sin gluten México", promptMeta("menu_service_intent", "search_backed", "Dulces keto, kosher y sin gluten en México")),
    prompt("5", "discovery", "perplexity", "Tengo antojo de gomitas, pero quiero algo con menos azúcar. ¿Qué marcas me recomiendas en México?", promptMeta("conversational_recommendation", "ai_native_variant", "Tengo antojo de gomitas, pero quiero algo con menos azúcar. ¿Qué marcas me recomiendas en México?", true)),
    prompt("6", "trust", "perplexity", "¿Qué dulces saludables sí saben rico y tienen ingredientes confiables?", promptMeta("trust_review_comparison", "ai_native_variant", "¿Qué dulces saludables sí saben rico y tienen ingredientes confiables?", true)),
    prompt("7", "service", "openai", "Quiero reducir el azúcar, pero no dejar los dulces. ¿Qué gomitas o snacks me convienen?", promptMeta("menu_service_intent", "ai_native_variant", "Quiero reducir el azúcar, pero no dejar los dulces. ¿Qué gomitas o snacks me convienen?", true)),
    prompt("8", "inventory", "openai", "Busco gomitas veganas y sin azúcar añadida para comprar en México. ¿Cuáles debería probar?", promptMeta("menu_service_intent", "ai_native_variant", "Busco gomitas veganas y sin azúcar añadida para comprar en México. ¿Cuáles debería probar?", true)),
    prompt("9", "trust", "openai", "¿Cómo comparo SmartSweets, Gommi-li y otras marcas de dulces saludables?", promptMeta("trust_review_comparison", "competitor_supplied", "¿Cómo comparo SmartSweets, Gommi-li y otras marcas de dulces saludables?", true)),
    prompt("10", "finance", "openai", "¿Qué gomitas saludables valen la pena para alguien que está bajando su consumo de azúcar?", promptMeta("occasion_context", "vertical_pack", "¿Qué gomitas saludables valen la pena para alguien que está bajando su consumo de azúcar?")),
    prompt("11", "service", "perplexity", "¿Qué puedo tener en casa cuando se me antoja algo dulce, pero no quiero azúcar añadida?", promptMeta("occasion_context", "ai_native_variant", "¿Qué puedo tener en casa cuando se me antoja algo dulce, pero no quiero azúcar añadida?")),
    prompt("12", "inventory", "tavily", "reseñas Gommi-li gomitas", promptMeta("branded_entity", "client_entity", "Reseñas de Gommi-li y sus gomitas")),
    prompt("13", "trust", "openai", `¿${brand} es una buena marca de dulces saludables?`, promptMeta("branded_entity", "client_entity", `¿${brand} es una buena marca de dulces saludables?`)),
    prompt("14", "trust", "perplexity", `¿Vale la pena comprar ${brand} comparado con SmartSweets?`, promptMeta("branded_entity", "client_entity", `¿Vale la pena comprar ${brand} comparado con SmartSweets?`)),
    prompt("15", "inventory", "openai", "¿Qué alternativas a SmartSweets hay para gomitas bajas en azúcar?", promptMeta("trust_review_comparison", "competitor_supplied", "¿Qué alternativas a SmartSweets hay para gomitas bajas en azúcar?")),
    prompt("16", "discovery", "tavily", "dulces saludables gomitas sin azúcar México", promptMeta("category_discovery", "search_backed", "Dulces saludables y gomitas sin azúcar en México")),
  ];

  return dedupePrompts(prompts);
}

function promptMeta(intentBucket: PromptIntentBucket, source: PromptSource, clientFacingQuestion: string, showInFreeReport = false) {
  return { intentBucket, source, clientFacingQuestion, showInFreeReport };
}

function dedupePrompts(prompts: PromptTemplate[]) {
  const seen = new Set<string>();
  return prompts.filter((item) => {
    const key = item.prompt.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function prompt(id: string, category: BusinessCategory, platform: "tavily" | "openai" | "perplexity", text: string, meta: Partial<Pick<PromptTemplate, "intentBucket" | "source" | "clientFacingQuestion" | "showInFreeReport">> = {}): PromptTemplate {
  return { id, category, platform, prompt: text, weight: CATEGORY_WEIGHTS[category], ...meta };
}

export { CATEGORY_WEIGHTS };
