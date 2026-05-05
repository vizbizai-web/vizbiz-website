import type { AuditReport } from "@/engines/research/types";

export interface FixPackage {
  id: string;
  clientId: string;
  auditId: string;
  status: "generated";
  createdAt: string;
  assets: Record<string, string>;
}

export function generateFixPackage(audit: AuditReport): FixPackage {
  const assets = {
    "implementation-packet.md": implementationPacket(audit),
    "schema-markup.md": schemaMarkup(audit),
    "llms.txt": llmsTxt(audit),
    "llmstxt-packet.md": llmsPacket(audit),
    "faq-block.md": faqMarkdown(audit),
    "faq-block.html": faqHtml(audit),
    "technical-fixes.md": technicalFixes(audit),
    "robots.txt": robotsTxt(),
  };

  return {
    id: `fix_${crypto.randomUUID()}`,
    clientId: audit.client.id,
    auditId: audit.id,
    status: "generated",
    createdAt: new Date().toISOString(),
    assets,
  };
}

function implementationPacket(audit: AuditReport) {
  return `# VizBiz Implementation Packet — ${audit.client.name}

AVI Score: ${audit.aviScore}/100 (${audit.band})

## Priority order

1. Add structured data from \`schema-markup.md\`.
2. Publish \`llms.txt\` at the site root.
3. Add the FAQ block to the homepage or highest-intent service page.
4. Apply technical fixes: robots.txt, title/H1 clarity, contact visibility, and content depth.
5. Re-run the audit after deployment.

## Why this matters

The audit found ${audit.promptsAppeared} appearances across ${audit.promptsTotal} prompts. The biggest visible competitor is ${audit.primaryCompetitor ?? "not yet established"}.

## Category scores

- Discovery: ${audit.discoveryScore}/100
- Trust & Reviews: ${audit.trustScore}/100
- Service Visibility: ${audit.serviceScore}/100
- Affordability/Inventory: ${audit.inventoryScore}/100
- Finance/Trade-In: ${audit.financeScore}/100
${revenueOpportunitySection(audit)}
`;
}

function revenueOpportunitySection(audit: AuditReport) {
  const projection = audit.revenueOpportunity;
  if (!projection) return "";

  return `
## Revenue Opportunity Gap™

Estimated AI recommendation share: ${percent(projection.clientAiRecommendationShare)}
Top competitor: ${projection.topCompetitor.name} (${percent(projection.topCompetitor.aiRecommendationShare)} estimated AI recommendation share)
Top two competitor average: ${percent(projection.topTwoAverageShare)}

Based on current visibility against the supplied competitors, the estimated opportunity gap is:

- Versus top-two average: ${currency(projection.monthlyGapVsTopTwoAverage)}/month (${currency(projection.annualGapVsTopTwoAverage)}/year)
- Versus best competitor: ${currency(projection.monthlyGapVsTopCompetitor)}/month (${currency(projection.annualGapVsTopCompetitor)}/year)

Sensitivity range:

- Conservative: ${currency(projection.scenarios.conservative.monthlyGapVsTopTwoAverage)}/month (${currency(projection.scenarios.conservative.annualGapVsTopTwoAverage)}/year)
- Likely: ${currency(projection.scenarios.likely.monthlyGapVsTopTwoAverage)}/month (${currency(projection.scenarios.likely.annualGapVsTopTwoAverage)}/year)
- Aggressive: ${currency(projection.scenarios.aggressive.monthlyGapVsTopTwoAverage)}/month (${currency(projection.scenarios.aggressive.annualGapVsTopTwoAverage)}/year)

Assumptions: ${projection.assumptions.monthlyUnitsSold} monthly units, ${currency(projection.assumptions.averageGrossPerVehicle)} average gross per vehicle, ${percent(projection.assumptions.aiInfluencedBuyerShare)} AI/search-influenced buyer share. ${projection.disclaimer}
`;
}

function schemaMarkup(audit: AuditReport) {
  const type = audit.client.businessType === "auto_dealer" ? "AutoDealer" : "LocalBusiness";
  return `# Schema Markup

Place this JSON-LD in the site head.

\`\`\`json
${JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    name: audit.client.name,
    url: audit.client.websiteUrl,
    areaServed: audit.client.market ?? audit.client.city,
    address: { "@type": "PostalAddress", addressLocality: audit.client.city },
    makesOffer: audit.client.primaryMake ? [{ "@type": "Offer", itemOffered: audit.client.primaryMake }] : undefined,
  }, null, 2)}
\`\`\`
`;
}

function llmsTxt(audit: AuditReport) {
  return `# ${audit.client.name}

> ${audit.client.name} is a ${audit.client.businessType.replaceAll("_", " ")} serving ${audit.client.market ?? audit.client.city}.

Key facts:
- Business name: ${audit.client.name}
- Category: ${audit.client.businessType.replaceAll("_", " ")}
- City: ${audit.client.city}
- Website: ${audit.client.websiteUrl ?? "Add canonical website URL"}
${audit.client.primaryMake ? `- Primary make: ${audit.client.primaryMake}` : ""}

Preferred crawl targets:
- /
- /about
- /contact
- /service
- /inventory
- /finance
`;
}

function llmsPacket(audit: AuditReport) {
  return `# llms.txt Deployment Instructions

1. Save the supplied \`llms.txt\` file at the root of ${audit.client.websiteUrl ?? "the client website"}.
2. Verify it loads at \`/llms.txt\`.
3. Keep the facts short, stable, and specific. Do not stuff keywords.
`;
}

function invisiblePrompts(audit: AuditReport) {
  return audit.promptResults.filter((result) => result.score === 0 || result.score === null).slice(0, 6);
}

function faqMarkdown(audit: AuditReport) {
  const prompts = invisiblePrompts(audit);
  const items = prompts.length ? prompts : audit.promptResults.slice(0, 3);
  return `# FAQ Block — ${audit.client.name}

${items.map((result) => `## ${questionFromPrompt(result.prompt)}

Target query: ${result.prompt}

${audit.client.name} serves ${audit.client.city} customers looking for ${result.prompt.replace(/^best |^where to |^which /i, "")}. The page should answer this directly with proof: reviews, service details, inventory or offer specifics, and clear contact paths.
`).join("\n")}`;
}

function faqHtml(audit: AuditReport) {
  const markdown = faqMarkdown(audit);
  const sections = markdown.split("\n## ").slice(1);
  return `<section class="vizbiz-faq">\n  <h2>Frequently asked questions</h2>\n${sections.map((section) => {
    const [title, ...body] = section.split("\n\n");
    return `  <article>\n    <h3>${escapeHtml(title.trim())}</h3>\n    <p>${escapeHtml(body.join(" ").trim())}</p>\n  </article>`;
  }).join("\n")}\n</section>\n`;
}

function technicalFixes(audit: AuditReport) {
  const failed = audit.machineReadiness.checks.filter((check) => !check.passed);
  return `# Technical Fixes — ${audit.client.name}

## Immediate fixes

${failed.length ? failed.map((check) => `- ${check.label}: ${check.evidence}`).join("\n") : "- Machine-readiness checks passed. Re-check after deployment."}

## Meta template

- Title: ${audit.client.name} | ${audit.client.businessType.replaceAll("_", " ")} in ${audit.client.city}
- H1: ${audit.client.name} — ${audit.client.city} ${audit.client.businessType.replaceAll("_", " ")}
- Meta description: Directly state service area, proof, and next action. Keep under 155 characters.
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: /sitemap.xml
`;
}

function questionFromPrompt(prompt: string) {
  return prompt.endsWith("?") ? prompt : `${prompt.charAt(0).toUpperCase()}${prompt.slice(1)}?`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function currency(value: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
}

function percent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}
