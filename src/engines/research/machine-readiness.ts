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
  const isProductBrand = /ecommerce|skincare|product|wellness|aloe/.test(businessTypeWords);

  const schemaTypes = isProductBrand
    ? "Organization/Product/Offer/Review"
    : input.businessType?.toLowerCase().includes("dent")
    ? "LocalBusiness/Dentist/MedicalBusiness/Organization"
    : input.businessType?.toLowerCase().includes("auto")
      ? "LocalBusiness/AutoDealer/Organization"
      : "LocalBusiness/ProfessionalService/Organization";

  const checks = [
    { key: "schema", label: isProductBrand ? "Product/brand schema present" : "Local Business Schema present", passed: lower.includes("application/ld+json") && (isProductBrand ? /Product|Offer|Review|Organization|Brand/i.test(html) : /LocalBusiness|Dentist|MedicalBusiness|AutoDealer|ProfessionalService|Organization/i.test(html)), points: 5, evidence: `Looks for JSON-LD ${schemaTypes} markup.` },
    { key: "title_h1", label: "Title/H1 clarity", passed: isProductBrand ? (!businessTypeWords || `${title} ${h1}`.toLowerCase().includes(businessTypeWords.split(" ")[0]) || /natural|skin|aloe|wellness|beauty/i.test(`${title} ${h1}`)) : `${title} ${h1}`.toLowerCase().includes(city) && (!businessTypeWords || `${title} ${h1}`.toLowerCase().includes(businessTypeWords.split(" ")[0])), points: 3, evidence: `Title/H1: ${`${title} ${h1}`.trim() || "missing"}` },
    { key: "nap", label: isProductBrand ? "Brand contact and support clarity" : "Footer NAP consistency", passed: isProductBrand ? /contact|support|shipping|returns|faq|email/i.test(visibleText) : /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(visibleText) && lower.includes(city), points: 2, evidence: isProductBrand ? "Checks for contact, support, shipping, returns, or FAQ clarity." : "Checks for phone number plus city mention." },
    { key: "hero_contact", label: isProductBrand ? "Purchase/contact accessibility" : "Hero contact accessibility", passed: isProductBrand ? /add to cart|shop|buy|contact|subscribe|checkout/i.test(html) : /tel:|contact|book|form|call/i.test(html), points: 3, evidence: isProductBrand ? "Checks for visible shopping or contact CTAs." : "Checks for phone/contact/form CTA." },
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
