import { NextResponse } from "next/server";
import { listJson, saveJsonWithKey } from "@/lib/file-store";
import { appendCtaClick, buildPaymentLinks, type MiniLeadRecord, type PaidProduct } from "@/lib/lead-pipeline";
import { createSupabaseLeadEvent, createSupabaseTelegramAlertLog, findSupabaseLeadByReportSlug, updateSupabaseLeadStatus } from "@/lib/supabase-crm";
import { buildCtaClickAlert, sendTelegramAlert } from "@/lib/telegram-alerts";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const product = url.searchParams.get("product") as PaidProduct | null;

  if (!slug || (product !== "fix_package" && product !== "monthly_plan")) {
    return NextResponse.json({ error: "slug and valid product are required" }, { status: 400 });
  }

  const links = buildPaymentLinks({
    slug,
    baseUrl: url.origin,
    fixPackageUrl: process.env.STRIPE_FIX_PACKAGE_URL,
    monthlyPlanUrl: process.env.STRIPE_MONTHLY_GROWTH_URL,
  });
  let destinationUrl = product === "fix_package" ? links.fixPackage.destinationUrl : links.monthlyPlan.destinationUrl;

  const leads = await listJson<MiniLeadRecord>("mini-leads");
  const lead = leads.find((record) => record.reportSlug === slug);
  if (lead) {
    await saveJsonWithKey("mini-leads", lead.id, appendCtaClick(lead, {
      product,
      destinationUrl,
      clickedAt: new Date().toISOString(),
    }));
  }

  const supabaseLead = await findSupabaseLeadByReportSlug(slug);
  const purchaserEmail = supabaseLead?.email ?? lead?.email;
  destinationUrl = appendStripeTrackingParams(destinationUrl, {
    clientReferenceId: `${slug}:${product}`,
    prefilledEmail: purchaserEmail,
    attribution: extractAttribution(supabaseLead?.raw_intake),
  });

  if (supabaseLead) {
    await createSupabaseLeadEvent({
      leadId: supabaseLead.id,
      eventType: "cta_clicked",
      payload: { product, destinationUrl, slug },
    });
    await updateSupabaseLeadStatus({ leadId: supabaseLead.id, status: "cta_clicked" });
  }

  const alert = await sendTelegramAlert({
    type: "cta_clicked",
    text: buildCtaClickAlert({
      client: {
        businessName: supabaseLead?.business_name ?? (lead?.client as { name?: string } | undefined)?.name,
        email: purchaserEmail,
        websiteUrl: supabaseLead?.website_url,
        reportUrl: `${url.origin}/mini-report/${slug}`,
      },
      product,
      destinationUrl,
      slug,
    }),
  });
  if (supabaseLead && alert.status !== "skipped") {
    await createSupabaseTelegramAlertLog({
      leadId: supabaseLead.id,
      alertType: "cta_clicked",
      chatId: alert.chatId,
      threadId: alert.threadId,
      messageId: alert.messageId,
      status: alert.status === "sent" ? "sent" : "failed",
      errorMessage: alert.error,
    });
  }

  const origin = request.headers.get("origin") ?? `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  const response = NextResponse.redirect(new URL(destinationUrl, origin));
  response.cookies.set("vizbiz_purchase_slug", slug, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  response.cookies.set("vizbiz_purchase_product", product, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}

function appendStripeTrackingParams(destinationUrl: string, input: { clientReferenceId: string; prefilledEmail?: string; attribution?: Record<string, string> }) {
  try {
    const url = new URL(destinationUrl);
    url.searchParams.set("client_reference_id", input.clientReferenceId);
    if (input.prefilledEmail) url.searchParams.set("prefilled_email", input.prefilledEmail);
    for (const [key, value] of Object.entries(input.attribution ?? {})) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return destinationUrl;
  }
}

function extractAttribution(rawIntake?: Record<string, unknown>) {
  const attribution = rawIntake?.attribution;
  if (!attribution || typeof attribution !== "object") return {};

  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  const output: Record<string, string> = {};
  for (const key of allowed) {
    const value = (attribution as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) output[key] = value;
  }
  return output;
}
