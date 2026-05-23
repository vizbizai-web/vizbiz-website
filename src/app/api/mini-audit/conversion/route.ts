import { NextResponse } from "next/server";
import { listJson, saveJsonWithKey } from "@/lib/file-store";
import { appendStatus, type MiniLeadRecord, type PaidProduct } from "@/lib/lead-pipeline";
import { buildPaidOrder } from "@/lib/paid-fulfillment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as { slug?: string; product?: PaidProduct; paymentId?: string }));
  const { slug, product, paymentId } = body;

  if (!slug || (product !== "fix_package" && product !== "monthly_plan")) {
    return NextResponse.json({ error: "slug and valid product are required" }, { status: 400 });
  }

  const leads = await listJson<MiniLeadRecord>("mini-leads");
  const lead = leads.find((record) => record.reportSlug === slug);
  if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

  const updated = appendStatus(lead, "paid_conversion", paymentId ? `${product} paid: ${paymentId}` : `${product} paid`);
  await saveJsonWithKey("mini-leads", lead.id, updated);

  const paidOrder = buildPaidOrder({ lead: updated, product, paymentId: paymentId ?? null });
  await saveJsonWithKey("paid-orders", paidOrder.id, paidOrder);

  return NextResponse.json({ ok: true, lead: updated, paidOrder });
}
