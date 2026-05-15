import { NextRequest, NextResponse } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

// Price IDs from the existing Stripe Payment Links
const PRICE_IDS: Record<string, string> = {
  fix: "price_1RQbJ2gzd3g275ifzy24002",       // $88 one-time Fix
  fix_and_monitor: "price_1RQ7sMdn103Q2P22MM24003", // $188/mo Fix + Monitor
};

export async function POST(request: NextRequest) {
  try {
    const { leadId, tier } = await request.json();

    if (!leadId || !tier) {
      return NextResponse.json({ error: "Missing leadId or tier" }, { status: 400 });
    }

    if (!STRIPE_SECRET_KEY) {
      // Fallback: redirect to static payment links if no Stripe key configured
      const staticLinks: Record<string, string> = {
        fix: "https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002",
        fix_and_monitor: "https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003",
      };
      return NextResponse.json({ url: staticLinks[tier] || staticLinks.fix });
    }

    // Create a Stripe Checkout Session with metadata
    const mode = tier === "fix_and_monitor" ? "subscription" : "payment";
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

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
        "success_url": `https://vizbiz.ai/report/${leadId}/full?paid=1`,
        "cancel_url": `https://vizbiz.ai/report/${leadId}?cancelled=1`,
        "metadata[leadId]": leadId,
        "metadata[tier]": tier,
        "client_reference_id": leadId,
        "allow_promotion_codes": "true",
      }),
    });

    const session = await sessionRes.json();

    if (session.error) {
      console.error("[stripe/checkout] Stripe error:", session.error.message);
      // Fallback to static link
      const staticLinks: Record<string, string> = {
        fix: "https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002",
        fix_and_monitor: "https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003",
      };
      return NextResponse.json({ url: staticLinks[tier] || staticLinks.fix });
    }

    console.info(`[stripe/checkout] Session created for ${leadId} — ${tier} → ${session.url}`);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
