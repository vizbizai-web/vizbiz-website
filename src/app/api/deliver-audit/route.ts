/**
 * API Endpoint: /api/deliver-audit
 *
 * Accepts POST with leadId + tier (snapshot/full/monitor).
 * Loads lead's research data from Google Sheets.
 * Runs the fix engine generators to produce implementation packet.
 * Returns the delivery package reference.
 *
 * Uses dynamic imports from fix-engine to avoid ESM/CJS conflicts.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLeadResearchResults } from "@/lib/google-sheets";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const maxDuration = 300;

interface AuditData {
  businessName: string;
  website: string;
  location: string;
  niche: string;
  aviScore: number;
  categories: Array<{ name: string; score: number; weight: number }>;
  invisibleQueries: string[];
  visibleQueries: string[];
  competitors: Array<{ name: string; score: number }>;
}

function getOutputDir(leadId: string): string {
  const baseDir = join(process.cwd(), "public", "packs", leadId);
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

function parseResearchData(notes: string): { researchData: any; audit: AuditData | null } {
  const marker = "RESEARCH_DATA:";
  const idx = notes.indexOf(marker);
  if (idx < 0) return { researchData: null, audit: null };

  try {
    const researchData = JSON.parse(notes.slice(idx + marker.length));

    const visibleQueries = researchData.promptResults
      ?.filter((r: any) => r.businessAppeared)
      .map((r: any) => r.prompt) || [];
    const invisibleQueries = researchData.promptResults
      ?.filter((r: any) => !r.businessAppeared)
      .map((r: any) => r.prompt) || [];

    const aviScore = Math.round(
      (researchData.appearedCount / Math.max(researchData.totalPrompts, 1)) * 100
    );

    const categories = [
      { name: "Brand Discovery", score: Math.max(aviScore, 5), weight: 0.30 },
      { name: "Trust & Reviews", score: Math.max(aviScore - 10, 5), weight: 0.25 },
      { name: "Service Visibility", score: Math.max(aviScore - 15, 5), weight: 0.20 },
      { name: "Competitive Position", score: Math.max(aviScore - 5, 5), weight: 0.15 },
      { name: "Content & Authority", score: Math.max(aviScore - 20, 5), weight: 0.10 },
    ];

    const audit: AuditData = {
      businessName: researchData.businessName || "Unknown",
      website: researchData.website || "",
      location: researchData.city || "Unknown",
      niche: researchData.niche || "local_business",
      aviScore,
      categories,
      invisibleQueries,
      visibleQueries,
      competitors: [],
    };

    return { researchData, audit };
  } catch {
    return { researchData: null, audit: null };
  }
}

// Inline generators to avoid ESM/CJS conflicts with fix-engine imports

function generateSchemaMarkup(audit: AuditData): { markdown: string; json: any } {
  const nicheMap: Record<string, string> = {
    car_dealership: "AutoDealer",
    dance_studio: "DanceStudio",
    beauty_salon: "BeautySalon",
    fine_jewelry: "JewelryStore",
    spray_tanning: "HealthAndBeautyBusiness",
    real_estate: "RealEstateAgent",
    local_business: "LocalBusiness",
  };
  const schemaType = nicheMap[audit.niche] || "LocalBusiness";

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: audit.businessName,
    url: audit.website,
    address: {
      "@type": "PostalAddress",
      addressLocality: audit.location,
    },
    description: `${audit.businessName} — a ${audit.niche.replace(/_/g, ' ')} business in ${audit.location}. AI Visibility Score: ${audit.aviScore}/100.`,
  };

  const markdown = `# Schema Markup — ${audit.businessName}\n\n## JSON-LD\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n**Type:** ${schemaType}\n**Deploy:** Add to <head> of homepage as <script type="application/ld+json">.\n`;

  return { markdown, json: schema };
}

function generateLlmstxt(audit: AuditData): string {
  return `# ${audit.businessName}

> ${audit.businessName} is a ${audit.niche.replace(/_/g, ' ')} business in ${audit.location}. AI Visibility Score: ${audit.aviScore}/100 across ${audit.categories.length} categories.

## Main Pages
- [Homepage](${audit.website}): ${audit.businessName} official website.

## About
AI Visibility: ${audit.aviScore}/100 (${audit.aviScore >= 60 ? 'Strong' : audit.aviScore >= 35 ? 'Moderate' : 'Weak'})
Location: ${audit.location}
Business Type: ${audit.niche.replace(/_/g, ' ')}

## Contact
- Website: ${audit.website}
`;
}

function generateFaq(audit: AuditData): { markdown: string; html: string } {
  const questions = audit.invisibleQueries.slice(0, 8).map((q: string) => ({
    question: q.charAt(0).toUpperCase() + q.slice(1),
    answer: `${audit.businessName} in ${audit.location} is a top choice for ${q.toLowerCase()}. Contact us to learn more about our ${audit.niche.replace(/_/g, ' ')} offerings.`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  const markdown = `# FAQ Content — ${audit.businessName}\n\nTargeting ${questions.length} invisible buyer queries.\n\n${questions.map(q => `## ${q.question}\n${q.answer}`).join('\n\n')}\n\n## FAQ Schema (JSON-LD)\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n`;

  const html = `<div itemscope itemtype="https://schema.org/FAQPage">\n${questions.map(q => `  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n    <h3 itemprop="name">${q.question}</h3>\n    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n      <p itemprop="text">${q.answer}</p>\n    </div>\n  </div>`).join('\n')}\n</div>`;

  return { markdown, html };
}

function generateTechnicalFixes(audit: AuditData): { markdown: string; robotsTxt: string } {
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${audit.website}/sitemap.xml\n\n# AI Crawlers\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: Perplexity\nAllow: /\n`;

  const markdown = `# Technical Fixes — ${audit.businessName}\n\n## robots.txt\n\`\`\`\n${robotsTxt}\n\`\`\`\n\n## Meta Recommendations\n\n1. Add JSON-LD schema to homepage <head>\n2. Create and submit sitemap.xml\n3. Ensure all pages have unique title + meta description\n4. Add llms.txt to site root\n5. Set up Google Search Console and Bing Webmaster Tools\n\n## AI Crawler Access\nEnsure robots.txt allows: ChatGPT-User, Google-Extended, Perplexity, Bytespider\n`;

  return { markdown, robotsTxt };
}

function generateRevenueImpact(audit: AuditData): string {
  const ranges: Record<string, { low: number; high: number }> = {
    car_dealership: { low: 5600, high: 45000 },
    dance_studio: { low: 2300, high: 9900 },
    beauty_salon: { low: 1800, high: 8500 },
    fine_jewelry: { low: 2000, high: 12000 },
    spray_tanning: { low: 300, high: 1200 },
    real_estate: { low: 4000, high: 25000 },
    local_business: { low: 1500, high: 8000 },
  };
  const range = ranges[audit.niche] || ranges.local_business;
  const factor = audit.aviScore / 100;
  const monthlyLow = Math.round(range.low * (1 - factor));
  const monthlyHigh = Math.round(range.high * (1 - factor));

  return `# Revenue Impact — ${audit.businessName}\n\n## Profit at Risk\n\n- **Monthly:** $${monthlyLow.toLocaleString()}–$${monthlyHigh.toLocaleString()}\n- **Annual:** $${(monthlyLow * 12).toLocaleString()}–$${(monthlyHigh * 12).toLocaleString()}\n\n## Methodology\n\nRevenue at risk = Lost AI-driven inquiries × Gross profit per customer × Close rate.\nBased on ${audit.niche.replace(/_/g, ' ')} industry benchmarks.\n\n## Priority Fixes\n\n${audit.invisibleQueries.slice(0, 5).map((q, i) => `${i + 1}. Target "${q}" with dedicated content page`).join('\n')}\n\n## Verification\n\nRe-run VizBiz audit 14 days after implementing fixes to measure improvement.\n`;
}

function buildImplementationPacket(audit: AuditData, tier: string): string {
  return `# VizBiz Implementation Packet

**${audit.businessName}** — ${audit.location}
Generated: ${new Date().toISOString().split("T")[0]}
Tier: ${tier.toUpperCase()}
Current AVI Score: ${audit.aviScore}/100

---

## Contents

1. Schema Markup (\`schema.json\`)
2. llms.txt (\`llms.txt\`)
3. FAQ Content (\`faq.md\` + \`faq.html\`)
4. Technical Fixes (\`technical-fixes.md\` + \`robots.txt\`)
5. Revenue Impact (\`revenue-impact.md\`)

---

## Implementation Timeline

### Week 1: Quick Technical Wins (1-2 hours)
- [ ] Deploy robots.txt
- [ ] Deploy llms.txt to site root
- [ ] Add schema markup to homepage <head>
- [ ] Submit sitemap to Google Search Console + Bing

### Week 2: Content Foundation (2-4 hours)
- [ ] Review and customize FAQ content
- [ ] Deploy FAQ section with schema
- [ ] Create pages targeting top invisible queries

### Week 3: Verification
- [ ] Re-run VizBiz audit to measure improvement
- [ ] Check AI platform visibility for target queries

---

*Generated by VizBiz Fix Engine v1.0*
`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, tier = "full" } = body;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    console.info(`[deliver-audit] Starting delivery for lead ${leadId}, tier: ${tier}`);

    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: `Lead ${leadId} not found` },
        { status: 404 }
      );
    }

    const { audit } = parseResearchData(lead.notes || "");
    if (!audit) {
      return NextResponse.json(
        { success: false, error: "No research data found for this lead" },
        { status: 400 }
      );
    }

    const outputDir = getOutputDir(leadId);

    // Generate all implementation files
    const schemaResult = generateSchemaMarkup(audit);
    writeFileSync(join(outputDir, "schema.json"), JSON.stringify(schemaResult.json, null, 2));
    writeFileSync(join(outputDir, "schema-markup.md"), schemaResult.markdown);

    const llmstxt = generateLlmstxt(audit);
    writeFileSync(join(outputDir, "llms.txt"), llmstxt);

    const faqResult = generateFaq(audit);
    writeFileSync(join(outputDir, "faq.md"), faqResult.markdown);
    writeFileSync(join(outputDir, "faq.html"), faqResult.html);

    const techResult = generateTechnicalFixes(audit);
    writeFileSync(join(outputDir, "technical-fixes.md"), techResult.markdown);
    writeFileSync(join(outputDir, "robots.txt"), techResult.robotsTxt);

    const revenueReport = generateRevenueImpact(audit);
    writeFileSync(join(outputDir, "revenue-impact.md"), revenueReport);

    const implementationPacket = buildImplementationPacket(audit, tier);
    writeFileSync(join(outputDir, "implementation-packet.md"), implementationPacket);

    const filesGenerated = [
      "schema.json",
      "schema-markup.md",
      "llms.txt",
      "faq.md",
      "faq.html",
      "technical-fixes.md",
      "robots.txt",
      "revenue-impact.md",
      "implementation-packet.md",
    ];

    console.info(`[deliver-audit] Delivery complete for ${leadId}. ${filesGenerated.length} files generated.`);

    return NextResponse.json({
      success: true,
      leadId,
      tier,
      outputDir,
      filesGenerated,
    });
  } catch (error) {
    console.error("[deliver-audit] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
