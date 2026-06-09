import { NextRequest, NextResponse } from "next/server";
import { getLeadByLeadId } from "@/lib/google-sheets";
import { buildStripeCheckoutSuccessUrl, stripeTierToPaidPlan } from "@/lib/stripe-checkout-logic";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

// Price IDs from the existing Stripe Payment Links
const PRICE_IDS: Record<string, string> = {
  fix: "price_1TVjaVLnxAAOKS2rEA54a968",       // $88 one-time Fix
  fix_and_monitor: "price_1TVjblLnxAAOKS2rfvaHDltS", // $188/mo Fix + Monitor
};

export async function POST(request: NextRequest) {
  try {
    const { leadId, tier } = await request.json();

    if (!leadId || !tier) {
      return NextResponse.json({ error: "Missing leadId or tier" }, { status: 400 });
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "Stripe checkout is not configured",
          message: "STRIPE_SECRET_KEY is required so checkout can preserve lead metadata and paid intake routing.",
        },
        { status: 503 }
      );
    }

    // Create a Stripe Checkout Session with metadata
    const mode = tier === "fix_and_monitor" ? "subscription" : "payment";
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const lead = await getLeadByLeadId(leadId).catch(() => null);
    const businessName = lead?.dealershipName?.trim() || "Your Business";

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": mode,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": buildStripeCheckoutSuccessUrl(leadId, tier),
        "cancel_url": `https://vizbiz.ai/report/${leadId}?cancelled=1`,
        "metadata[leadId]": leadId,
        "metadata[tier]": tier,
        "metadata[paidPlan]": stripeTierToPaidPlan(tier),
        "metadata[businessName]": businessName,
        "client_reference_id": leadId,
        "allow_promotion_codes": "true",
      }),
    });

    const session = await sessionRes.json();

    if (session.error) {
      console.error("[stripe/checkout] Stripe error:", session.error.message);
      return NextResponse.json(
        {
          error: "Stripe checkout session creation failed",
          message: session.error.message,
        },
        { status: sessionRes.status || 502 }
      );
    }

    console.info(`[stripe/checkout] Session created for ${leadId} — ${tier} → ${session.url}`);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
