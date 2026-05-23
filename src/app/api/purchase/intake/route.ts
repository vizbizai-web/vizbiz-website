import { NextResponse } from "next/server";
import { readJson, saveJsonWithKey } from "@/lib/file-store";
import { attachPaidIntake, normalizePaidIntake, type PaidOrderRecord } from "@/lib/paid-fulfillment";
import type { PaidProduct } from "@/lib/lead-pipeline";

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

  const intake = normalizePaidIntake({
    contactName: String(formData.get("contactName") ?? ""),
    role: String(formData.get("role") ?? ""),
    googleBusinessProfileUrl: String(formData.get("googleBusinessProfileUrl") ?? ""),
    socialProfiles: String(formData.get("socialProfiles") ?? ""),
    priorityServices: String(formData.get("priorityServices") ?? ""),
    urgentGoal: String(formData.get("urgentGoal") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  const updated = attachPaidIntake(order, intake);
  await saveJsonWithKey("paid-orders", updated.id, updated);

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const redirectUrl = new URL(`/purchase/success?slug=${encodeURIComponent(slug)}&product=${encodeURIComponent(product)}&intake=received`, origin);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
