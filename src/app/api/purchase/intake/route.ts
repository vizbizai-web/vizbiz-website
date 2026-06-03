import { NextResponse } from "next/server";
import { readJson, saveJsonWithKey } from "@/lib/file-store";
import { attachPaidIntake, normalizePaidIntake, type PaidOrderRecord } from "@/lib/paid-fulfillment";
import type { PaidProduct } from "@/lib/lead-pipeline";
import { enqueueReportJob } from "@/lib/report-job-queue";

const INTAKE_FIELDS = [
  "contactName",
  "role",
  "businessDisplayName",
  "primaryLocation",
  "country",
  "confirmedNiche",
  "googleBusinessProfileUrl",
  "socialProfiles",
  "topServicesToWin",
  "highestValueService",
  "averageCustomerValue",
  "primaryConversionAction",
  "primaryPhone",
  "competitor1Name",
  "competitor1Website",
  "competitor1GoogleUrl",
  "competitor1Reason",
  "competitor2Name",
  "competitor2Website",
  "competitor2GoogleUrl",
  "competitor2Reason",
  "additionalCompetitors",
  "additionalResearchPermission",
  "websitePlatform",
  "websiteEditor",
  "implementationPermission",
  "googleBusinessProfileAccess",
  "analyticsAccess",
  "bookingCrmPlatform",
  "schemaTools",
  "approvalConstraints",
  "customerTypes",
  "commonQuestions",
  "commonObjections",
  "differentiators",
  "reviewLinks",
  "proofLinks",
  "existingFaqs",
  "seasonalPriorities",
  "languagesServed",
  "knownAiSearchIssues",
  "deadline",
  "monthlyMonitoringMarkets",
  "monthlyUpdatePreference",
  "priorityServices",
  "urgentGoal",
  "notes",
] as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const product = String(formData.get("product") ?? "") as PaidProduct;

  if (!orderId || !slug || (product !== "fix_package" && product !== "monthly_plan")) {
    return NextResponse.json({ error: "orderId, slug, and valid product are required" }, { status: 400 });
  }

  const order = await readJson<PaidOrderRecord>("paid-orders", orderId);
  if (!order) return NextResponse.json({ error: "paid order not found" }, { status: 404 });

  const rawIntake = Object.fromEntries(INTAKE_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const intake = normalizePaidIntake(rawIntake);

  const job = await enqueueReportJob({
    type: product === "monthly_plan" ? "paid_monthly_baseline" : "paid_full_report",
    leadId: order.leadId,
    paidOrderId: order.id,
    payload: {
      orderId: order.id,
      slug,
      product,
      reportSlug: order.reportSlug,
      leadId: order.leadId,
      auditId: order.auditId,
      email: order.email,
      clientName: order.clientName,
      paymentId: order.paymentId,
      intake,
    },
  });

  const updated = attachPaidIntake(order, intake, undefined, job.id);
  await saveJsonWithKey("paid-orders", updated.id, updated);

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const redirectUrl = new URL(`/purchase/success?slug=${encodeURIComponent(slug)}&product=${encodeURIComponent(product)}&intake=received`, origin);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
