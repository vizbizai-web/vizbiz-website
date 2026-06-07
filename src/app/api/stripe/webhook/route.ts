import { NextResponse } from "next/server";

/**
 * Deprecated duplicate Stripe webhook path.
 *
 * The canonical launch-safe webhook is /api/stripe-webhook. Keeping this route
 * as a hard failure prevents accidental paid-report generation or client email
 * delivery through the old bypass path.
 */
export async function POST() {
  return NextResponse.json(
    {
      received: false,
      error: "Deprecated webhook route. Configure Stripe to use /api/stripe-webhook.",
      canonicalWebhookPath: "/api/stripe-webhook",
      deliveryBlockedUntilApproval: true,
    },
    { status: 410 }
  );
}
