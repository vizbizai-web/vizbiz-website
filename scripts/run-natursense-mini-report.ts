import { parseMiniAuditLead } from "../src/lib/mini-audit-intake";
import { runAudit } from "../src/engines/research/runner";
import { createMiniReportFromAudit } from "../src/engines/research/mini-audit";
import { saveJson, saveJsonWithKey } from "../src/lib/file-store";

async function main() {
  const lead = parseMiniAuditLead({
    name: "Natursense",
    email: "jessteal.jones@gmail.com",
    city: "USA",
    market: "United States",
    websiteUrl: "https://natur-sense.com",
    businessType: "natural_skincare_ecommerce",
    primaryService: "natural skincare, organic aloe vera gel, castile soap, wellness essentials",
    competitorOne: "Seven Minerals",
    competitorTwo: "Babo Botanicals",
  });

  const audit = await runAudit({
    ...lead.auditInput,
    id: "client_natursense",
    slug: "natursense-natural-skincare-usa",
  });

  const miniReport = {
    ...createMiniReportFromAudit(audit),
    id: "mini_natursense_natural_skincare_snapshot",
    slug: "natursense-natural-skincare-usa",
    leadEmail: lead.email,
    competitorSource: lead.competitorSource,
    competitorNote: "Named competitors were captured from the intake: Seven Minerals and Babo Botanicals. The free snapshot uses them for context, but the full paid report should validate product-by-product competitor AI visibility before presenting a ranked competitor score.",
    clientDeliverables: null,
  };

  await saveJson("audits", audit);
  await saveJson("mini-reports", miniReport);
  await saveJsonWithKey("mini-reports", miniReport.slug, miniReport);

  console.log(JSON.stringify({
    auditId: audit.id,
    miniReportId: miniReport.id,
    slug: miniReport.slug,
    client: audit.client.name,
    businessType: audit.client.businessType,
    niche: audit.businessProfile?.niche,
    schemaType: audit.businessProfile?.schemaType,
    serviceAreaType: audit.businessProfile?.serviceAreaType,
    aviScore: audit.aviScore,
    band: audit.band,
    promptsAppeared: audit.promptsAppeared,
    promptsTotal: audit.promptsTotal,
    clientFacingPrompts: audit.promptResults.filter((result) => result.showInFreeReport).map((result) => result.clientFacingQuestion ?? result.prompt),
    competitors: audit.revenueOpportunity?.competitors.map(c => ({ name: c.name, aviScore: c.aviScore, share: c.aiRecommendationShare })) ?? [],
    reportPath: `/mini-report/${miniReport.slug}`,
    auditFile: `.data/vizbiz/audits/${audit.id}.json`,
    miniFile: `.data/vizbiz/mini-reports/${miniReport.id}.json`,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
