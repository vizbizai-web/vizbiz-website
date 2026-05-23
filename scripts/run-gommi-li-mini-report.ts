import { parseMiniAuditLead } from "../src/lib/mini-audit-intake";
import { runAudit } from "../src/engines/research/runner";
import { createMiniReportFromAudit } from "../src/engines/research/mini-audit";
import { saveJson, saveJsonWithKey } from "../src/lib/file-store";

async function main() {
  const lead = parseMiniAuditLead({
    name: "Gommi-li",
    email: "mm@gommi-li.com",
    city: "Mexico",
    market: "Mexico",
    websiteUrl: "https://gommi-li.com",
    businessType: "healthy_snack_ecommerce",
    primaryService: "dulces saludables, gomitas sin azúcar añadida, gomitas veganas, dulces bajos en calorías, snacks keto-friendly",
    competitorOne: "SmartSweets",
    competitorTwo: "Delou",
  });

  const audit = await runAudit({
    ...lead.auditInput,
    id: "client_gommi_li",
    slug: "gommi-li-healthy-candy-mexico",
  });

  const miniReport = {
    ...createMiniReportFromAudit(audit),
    id: "mini_gommi_li_healthy_candy_snapshot",
    slug: "gommi-li-healthy-candy-mexico",
    leadEmail: lead.email,
    competitorSource: lead.competitorSource,
    competitorNote: "Named competitors were captured from the intake: SmartSweets and Delou. The free snapshot uses them for context, but the full paid report should validate product-by-product competitor AI visibility before presenting a ranked competitor score.",
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
    llmReadiness: audit.seoSiteIntelligence.llmReadiness,
    clientFacingPrompts: audit.promptResults.filter((result) => result.showInFreeReport).map((result) => result.clientFacingQuestion ?? result.prompt),
    reportPath: `/mini-report/${miniReport.slug}`,
    auditFile: `.data/vizbiz/audits/${audit.id}.json`,
    miniFile: `.data/vizbiz/mini-reports/${miniReport.id}.json`,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
