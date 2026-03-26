import type { LeadInput } from "@/lib/lead-handler";

export type ResearchBrief = {
  dealershipContext: {
    market: string;
    website: string;
    sizeHint: string;
  };
  competitiveContext: string;
  talkingPoints: string[];
  suggestedSubjectLine: string;
  callPrep: string[];
};

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Website not provided";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function websiteHostname(value: string) {
  try {
    return new URL(normalizeWebsite(value)).hostname.replace(/^www\./i, "");
  } catch {
    return value.trim() || "website not provided";
  }
}

function inferSizeHint(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("group") || normalized.includes("automotive") || normalized.includes("auto group")) {
    return "Likely part of a dealer group or multi-rooftop operation";
  }

  if (
    normalized.includes("ford") ||
    normalized.includes("toyota") ||
    normalized.includes("honda") ||
    normalized.includes("chevrolet") ||
    normalized.includes("gmc") ||
    normalized.includes("nissan") ||
    normalized.includes("hyundai") ||
    normalized.includes("kia") ||
    normalized.includes("mazda") ||
    normalized.includes("lexus") ||
    normalized.includes("bmw") ||
    normalized.includes("mercedes") ||
    normalized.includes("audi") ||
    normalized.includes("chrysler") ||
    normalized.includes("jeep") ||
    normalized.includes("ram")
  ) {
    return "Franchise dealership with brand-driven search demand";
  }

  return "Independent or single-rooftop dealership is most likely";
}

function buildCompetitiveContext(input: LeadInput) {
  const competitor = input.competitors?.trim();

  if (competitor) {
    return `${competitor} was named directly, so the call should compare how ${input.dealershipName} is positioned versus that competitor in AI-driven dealership recommendations.`;
  }

  return `No direct competitor was provided, so frame the conversation around who tends to win AI recommendations in ${input.city} and how ${input.dealershipName} can stand out for both sales and service intent.`;
}

function buildTalkingPoints(input: LeadInput, sizeHint: string) {
  const competitor = input.competitors?.trim();
  const website = websiteHostname(input.website);

  const points = [
    `Walk through how ${input.dealershipName} currently shows up when buyers ask AI tools for dealership recommendations in ${input.city}.`,
    `Use ${website} as the anchor for a discussion about site trust signals, inventory clarity, and service content that influence AI-generated answers.`,
    `Tie visibility gaps to revenue moments: discovery, comparison shopping, and service retention.` ,
    competitor
      ? `Compare their positioning against ${competitor} and identify where competitor mentions may be outranking or out-framing them.`
      : `Identify the local competitors most likely to be appearing in AI answers when a shopper asks for the best dealership options nearby.`,
    `Set expectations based on business shape: ${sizeHint.toLowerCase()}. Focus on the fastest credibility wins before bigger content or authority work.`,
  ];

  return points;
}

function buildSubjectLine(input: LeadInput) {
  return `Next steps for ${input.dealershipName}'s AI visibility in ${input.city}`;
}

function buildCallPrep(input: LeadInput, sizeHint: string) {
  const competitor = input.competitors?.trim();

  return [
    `${input.dealershipName} is evaluating AI visibility from ${input.city}, so keep the call grounded in local buyer-intent searches and recommendation prompts.`,
    `The website to reference live on the call is ${normalizeWebsite(input.website)}. Expect the conversation to turn toward trust, discoverability, and conversion readiness.`,
    competitor
      ? `They already named ${competitor}, which signals competitive sensitivity. Be ready to explain how AI visibility compares to local rivals. ${sizeHint}`
      : `No competitor was named, which usually means there is room to shape the competitive frame early in the conversation. ${sizeHint}`,
  ];
}

export function buildResearchBrief(input: LeadInput): ResearchBrief {
  const sizeHint = inferSizeHint(input.dealershipName);

  return {
    dealershipContext: {
      market: input.city,
      website: normalizeWebsite(input.website),
      sizeHint,
    },
    competitiveContext: buildCompetitiveContext(input),
    talkingPoints: buildTalkingPoints(input, sizeHint),
    suggestedSubjectLine: buildSubjectLine(input),
    callPrep: buildCallPrep(input, sizeHint),
  };
}
