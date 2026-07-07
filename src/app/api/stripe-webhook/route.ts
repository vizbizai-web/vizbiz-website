/**
 * Stripe Webhook Handler
 *
 * Handles checkout.session.completed events.
 * Extracts leadId from metadata, triggers deliver-audit for paid tier.
 * Sends delivery confirmation email.
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { buildStripeCheckoutSuccessUrl, stripePaymentLinkToTier, stripeTierToPaidPlan } from "@/lib/stripe-checkout-logic";
import { subscriptionMirrorPatchFromStripeEvent, upsertSubscriptionMirror } from "@/lib/subscription-loop";
import { renderClientEmail, sendRenderedClientEmail } from "@/lib/client-emails";

export const runtime = "nodejs";
export const maxDuration = 60;

type StripeWebhookEvent = {
  type?: string;
  data?: {
    object?: {
      metadata?: Record<string, string | undefined>;
      client_reference_id?: string;
      payment_link?: string;
      customer_details?: { email?: string };
      subscription?: string | { id?: string; metadata?: Record<string, string | undefined> };
      id?: string;
      status?: string;
      current_period_end?: number;
      period_end?: number;
    };
  };
};

function verifyStripeSignature(body: string, signatureHeader: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

// Send paid-intake next-step email. Paid delivery still requires intake + manual approval.
async function sendPaidIntakeEmail(
  to: string,
  businessName: string,
  leadId: string,
  tier: string
) {
  const intakeUrl = buildStripeCheckoutSuccessUrl(leadId, tier);
  const rendered = renderClientEmail('E7_PAYMENT_RECEIVED_NEXT_STEP', {
    business: businessName,
    intakeUrl,
  });
  await sendRenderedClientEmail({ leadId, to, rendered });
}

async function sendSubscriptionLifecycleEmail(input: { templateId: 'E12_PAYMENT_FAILED' | 'E13_CANCELLATION_ACKNOWLEDGMENT'; leadId?: string | null; pauseDate?: string }) {
  if (!input.leadId) return;
  const lead = await getLeadByLeadId(input.leadId).catch(() => null);
  if (!lead?.email) return;
  const rendered = renderClientEmail(input.templateId, {
    business: lead.dealershipName || 'your business',
    contactName: lead.contactName,
    billingPortalUrl: process.env.STRIPE_BILLING_PORTAL_URL || 'https://billing.stripe.com/p/login',
    pauseDate: input.pauseDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  });
  await sendRenderedClientEmail({ leadId: lead.leadId, to: lead.email, rendered });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET is not configured' },
        { status: 500 }
      );
    }

    if (!verifyStripeSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid Stripe webhook signature' },
        { status: 400 }
      );
    }

    // Parse the event
    let event: StripeWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const subscriptionPatch = subscriptionMirrorPatchFromStripeEvent(event);
      if (subscriptionPatch) {
        await upsertSubscriptionMirror(subscriptionPatch).catch((error) => console.warn("[stripe-webhook] subscription mirror update failed", error));
      }

      const session = event.data?.object;
      const leadId = session?.metadata?.leadId || session?.client_reference_id;
      const tier = session?.metadata?.tier || stripePaymentLinkToTier(session?.payment_link);
      const customerEmail = session?.customer_details?.email;

      if (!leadId) {
        console.error("[stripe-webhook] No leadId in session metadata");
        return NextResponse.json(
          { error: "No leadId in metadata" },
          { status: 400 }
        );
      }

      console.info(
        `[stripe-webhook] Payment confirmed for lead ${leadId}, tier: ${tier}`
      );

      const existingLead = await getLeadByLeadId(leadId).catch(() => null);
      const resolvedBusinessName = session?.metadata?.businessName || existingLead?.dealershipName || "Your Business";
      await updateLead(leadId, {
        status: "paid_intake_pending",
        lastStage: "paid_intake",
        notes: `${existingLead?.notes || ""}\n[PAYMENT_CONFIRMED ${new Date().toISOString()}] tier=${tier}; paid intake pending`,
      }).catch((error) => console.warn("[stripe-webhook] lead update failed", error));

      if (customerEmail) {
        try {
          await sendPaidIntakeEmail(customerEmail, resolvedBusinessName, leadId, tier);
          console.info(`[stripe-webhook] Paid intake email sent to ${customerEmail}`);
        } catch (emailErr) {
          console.error("[stripe-webhook] Paid intake email send failed:", emailErr);
        }
      }

      return NextResponse.json({
        received: true,
        leadId,
        tier,
        paidPlan: stripeTierToPaidPlan(tier),
        intakeUrl: buildStripeCheckoutSuccessUrl(leadId, tier),
        deliveryBlockedUntilApproval: true,
      });
    }

    if ([
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
    ].includes(event.type || "")) {
      const subscriptionPatch = subscriptionMirrorPatchFromStripeEvent(event);
      if (!subscriptionPatch) return NextResponse.json({ received: true, mirrored: false });
      await upsertSubscriptionMirror(subscriptionPatch);
      if (event.type === 'invoice.payment_failed') {
        await sendSubscriptionLifecycleEmail({ templateId: 'E12_PAYMENT_FAILED', leadId: subscriptionPatch.leadId }).catch((error) => console.warn('[stripe-webhook] E12 payment failed email skipped', error));
      }
      if (event.type === 'customer.subscription.deleted') {
        await sendSubscriptionLifecycleEmail({ templateId: 'E13_CANCELLATION_ACKNOWLEDGMENT', leadId: subscriptionPatch.leadId }).catch((error) => console.warn('[stripe-webhook] E13 cancellation email skipped', error));
      }
      return NextResponse.json({ received: true, mirrored: true, status: subscriptionPatch.status, pausedReason: subscriptionPatch.pausedReason || null });
    }

    // Acknowledge other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] Fatal error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
