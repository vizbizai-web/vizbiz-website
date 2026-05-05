import type { ClientInput, MachineReadiness } from "./types";

export async function checkMachineReadiness(input: ClientInput): Promise<MachineReadiness> {
  if (!input.websiteUrl) return unknownReadiness("No website URL provided.");

  try {
    const response = await fetch(input.websiteUrl, { headers: { "user-agent": "VizBizBot/1.0" } });
    const html = await response.text();
    return analyzeHtml(html, input);
  } catch (error) {
    return unknownReadiness(error instanceof Error ? error.message : "Website fetch failed.");
  }
}

export function analyzeHtml(html: string, input: ClientInput): MachineReadiness {
  const lower = html.toLowerCase();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] ?? "";
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1] ?? "";
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const wordCount = visibleText.trim().split(/\s+/).filter(Boolean).length;
  const businessTypeWords = (input.businessType ?? "").replaceAll("_", " ").toLowerCase();
  const city = input.city.toLowerCase();

  const checks = [
    { key: "schema", label: "Local Business Schema present", passed: lower.includes("application/ld+json") && /LocalBusiness|AutoDealer|Organization/i.test(html), points: 5, evidence: "Looks for JSON-LD LocalBusiness/AutoDealer/Organization markup." },
    { key: "title_h1", label: "Title/H1 clarity", passed: `${title} ${h1}`.toLowerCase().includes(city) && (!businessTypeWords || `${title} ${h1}`.toLowerCase().includes(businessTypeWords.split(" ")[0])), points: 3, evidence: `Title/H1: ${`${title} ${h1}`.trim() || "missing"}` },
    { key: "nap", label: "Footer NAP consistency", passed: /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(visibleText) && lower.includes(city), points: 2, evidence: "Checks for phone number plus city mention." },
    { key: "hero_contact", label: "Hero contact accessibility", passed: /tel:|contact|book|form|call/i.test(html), points: 3, evidence: "Checks for phone/contact/form CTA." },
    { key: "content_depth", label: "Content depth", passed: wordCount >= 500, points: 3, evidence: `${wordCount} visible words detected.` },
  ];

  return {
    schemaPresent: checks[0].passed,
    titleH1Clarity: checks[1].passed,
    footerNapConsistent: checks[2].passed,
    heroContactAccessible: checks[3].passed,
    contentDepth: wordCount >= 500 ? "adequate" : "thin",
    score: checks.filter((check) => check.passed).reduce((sum, check) => sum + check.points, 0),
    checks,
  };
}

function unknownReadiness(evidence: string): MachineReadiness {
  return {
    schemaPresent: false,
    titleH1Clarity: false,
    footerNapConsistent: false,
    heroContactAccessible: false,
    contentDepth: "unknown",
    score: 0,
    checks: [
      { key: "fetch", label: "Website fetch", passed: false, points: 0, evidence },
    ],
  };
}
