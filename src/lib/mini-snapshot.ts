type MiniSnapshotInput = {
  dealershipName: string;
  websiteUrl: string;
  cityMarket: string;
  competitor?: string;
};

const MAKES = [
  "acura",
  "audi",
  "bmw",
  "buick",
  "cadillac",
  "chevrolet",
  "chrysler",
  "dodge",
  "ford",
  "gmc",
  "honda",
  "hyundai",
  "infiniti",
  "jeep",
  "kia",
  "lexus",
  "mazda",
  "mercedes",
  "mini",
  "mitsubishi",
  "nissan",
  "porsche",
  "ram",
  "subaru",
  "tesla",
  "toyota",
  "volkswagen",
  "volvo",
];

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractDomain(websiteUrl: string) {
  try {
    const url = new URL(normalizeWebsiteUrl(websiteUrl));
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function inferMake(input: MiniSnapshotInput) {
  const haystack = `${input.dealershipName} ${extractDomain(input.websiteUrl)}`.toLowerCase();
  return MAKES.find((make) => haystack.includes(make));
}

function isIndependentUsedDealer(input: MiniSnapshotInput) {
  const haystack = `${input.dealershipName} ${extractDomain(input.websiteUrl)}`.toLowerCase();
  if (inferMake(input)) return false;
  return haystack.includes("used") || haystack.includes("auto") || haystack.includes("motors");
}

function primaryPrompt(input: MiniSnapshotInput) {
  const make = inferMake(input);
  if (make) {
    return `best ${make} dealer in ${input.cityMarket}`;
  }

  return `best used car dealership in ${input.cityMarket}`;
}

function pickServicePrompt(input: MiniSnapshotInput) {
  const make = inferMake(input);
  const month = new Date().getMonth() + 1;
  const winterMarket = /\b(ON|Ontario|QC|Quebec|AB|Alberta|MB|Manitoba|SK|Saskatchewan|BC|British Columbia|Canada)\b/i.test(
    input.cityMarket,
  );

  if (winterMarket && (month >= 11 || month <= 3)) {
    return `best place for winter tire change in ${input.cityMarket}`;
  }

  if (make) {
    return `best ${make} service center in ${input.cityMarket}`;
  }

  return `where should I service my car in ${input.cityMarket}`;
}

function getCompetitorMention(input: MiniSnapshotInput) {
  const provided = input.competitor?.trim();
  if (!provided) return "nearby competitors";
  return provided.split(",")[0]?.trim() || "nearby competitors";
}

function getCompetitorCategories({
  make,
  appearedCount,
  serviceVisibility,
  independentUsed,
}: {
  make?: string;
  appearedCount: number;
  serviceVisibility: string;
  independentUsed: boolean;
}) {
  const categories: string[] = [];

  if (make) {
    categories.push("stronger brand service search signals");
  }

  if (appearedCount <= 3) {
    categories.push("stronger local review presence");
  }

  if (serviceVisibility === "Not surfaced" || serviceVisibility === "Weak") {
    categories.push("clearer service and fixed ops pages");
  }

  if (independentUsed) {
    categories.push("stronger affordability and inventory signals");
  }

  if (categories.length === 0) {
    categories.push("stronger local review presence");
  }

  return categories.slice(0, 2);
}

export function buildMiniSnapshot(input: MiniSnapshotInput) {
  const make = inferMake(input);
  const independentUsed = isIndependentUsedDealer(input);
  const competitorMention = getCompetitorMention(input);

  const prompts = [
    primaryPrompt(input),
    `best place to buy a used ${make || "car"} in ${input.cityMarket}`,
    `most trusted car dealership in ${input.cityMarket}`,
    `where can I finance a ${make || "vehicle"} near ${input.cityMarket}`,
    `best dealership for trade-in in ${input.cityMarket}`,
    `which dealership has the best reviews in ${input.cityMarket}`,
    pickServicePrompt(input),
  ];

  let appearedCount = 3;
  if (make) appearedCount += 1;
  if (independentUsed) appearedCount -= 1;
  if (input.competitor?.trim()) appearedCount = Math.max(2, appearedCount - 1);
  appearedCount = Math.max(2, Math.min(5, appearedCount));

  const statusBand = appearedCount >= 5 ? "Strong" : appearedCount >= 3 ? "Moderate" : "Weak";

  const serviceVisibility = make ? (appearedCount >= 4 ? "Strong" : "Weak") : "Not surfaced";

  const competitorLine = input.competitor?.trim()
    ? `${competitorMention} appears more often in at least one local prompt.`
    : `Nearby competitors appear more often in the local prompt set.`;
  const competitorCategories = getCompetitorCategories({
    make,
    appearedCount,
    serviceVisibility,
    independentUsed,
  });

  return {
    prompts,
    appearedCount,
    statusBand,
    serviceVisibility,
    competitorMention,
    competitorLine,
    competitorCategories,
    whyThisMatters:
      "AI can shape the shortlist before a buyer visits your site, compares inventory, or books service.",
    recommendedNextStep:
      "Use the full audit to see the hidden prompt-by-prompt breakdown and what to fix first.",
  };
}
