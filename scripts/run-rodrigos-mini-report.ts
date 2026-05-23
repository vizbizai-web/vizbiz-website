import { parseMiniAuditLead } from "../src/lib/mini-audit-intake";
import { runAudit } from "../src/engines/research/runner";
import { createMiniReportFromAudit } from "../src/engines/research/mini-audit";
import { saveJson, saveJsonWithKey } from "../src/lib/file-store";

async function main() {
  const lead = parseMiniAuditLead({
    name: "Rodrigo's Mexican Grill - Huntington Beach",
    email: "contact@rodrigos.com",
    city: "Huntington Beach",
    market: "Huntington Beach, CA",
    websiteUrl: "https://www.rodrigos.com",
    businessType: "mexican_restaurant",
    primaryService: "Mexican restaurant",
    competitorOne: "Taco Land",
    competitorTwo: "Dos Amigos Restaurant and Bar",
  });

  const audit = await runAudit({
    ...lead.auditInput,
    id: "VZB-RODRIGOS-HB",
    slug: "rodrigos-mexican-grill-huntington-beach",
  });

  const miniReport = {
    ...createMiniReportFromAudit(audit),
    id: "mini_rodrigos_huntington_beach_snapshot",
    slug: "rodrigos-mexican-grill-huntington-beach-49aa9c21",
    leadEmail: lead.email,
    competitorSource: lead.competitorSource,
    competitorNote: "Named competitors were captured and Google-validated: Taco Land and Dos Amigos Restaurant and Bar. The free snapshot does not assign competitor AI visibility scores until competitor prompts are tested in the deeper report.",
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
    aviScore: audit.aviScore,
    band: audit.band,
    promptsAppeared: audit.promptsAppeared,
    promptsTotal: audit.promptsTotal,
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
