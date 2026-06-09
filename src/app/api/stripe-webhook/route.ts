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
import { sendVizBizEmail } from "@/lib/resend-mailer";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { buildStripeCheckoutSuccessUrl, stripeTierToPaidPlan } from "@/lib/stripe-checkout-logic";

export const runtime = "nodejs";
export const maxDuration = 60;

type StripeWebhookEvent = {
  type?: string;
  data?: {
    object?: {
      metadata?: Record<string, string | undefined>;
      customer_details?: { email?: string };
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
  const paidPlan = stripeTierToPaidPlan(tier);
  const intakeUrl = buildStripeCheckoutSuccessUrl(leadId, tier);
  const planLabel = paidPlan === "monthly_growth" ? "Monthly Growth Plan" : "Full Report + Fix Pack";
  const subject = `Next step: complete your VizBiz paid report intake — ${businessName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #020617; color: #F8FAFC; border-radius: 20px; overflow: hidden;">
      <div style="padding: 34px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(135deg,#020617,#0F172A);">
        <h1 style="color: #FFFFFF; font-size: 26px; margin: 0;">VizBiz<span style="color:#22D3EE;">.ai</span></h1>
        <p style="color: #94A3B8; font-size: 14px; margin: 10px 0 0;">${planLabel} intake</p>
      </div>
      <div style="padding: 34px;">
        <p style="font-size: 16px; line-height: 1.7; color: #E2E8F0;">Hi there,</p>
        <p style="font-size: 16px; line-height: 1.7; color: #E2E8F0;">
          Payment is confirmed for <strong>${businessName}</strong>. The next step is a short 5-minute intake so we can make the paid report specific to your services, customers, competitors, and proof signals.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #CBD5E1;">
          We focus the comparison around the two businesses customers are most likely to compare you against, use your real customer questions, and perform a final quality check before delivery.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${intakeUrl}" style="display: inline-block; background: linear-gradient(to right, #22D3EE, #06B6D4); color: #020617; text-decoration: none; padding: 16px 30px; border-radius: 14px; font-weight: 700; font-size: 16px;">
            Complete Paid Report Intake
          </a>
        </div>
        ${paidPlan === "full_report_fix" ? `<p style="font-size: 14px; color: #67E8F9; line-height: 1.6;">After the one-time fix, you can still upgrade to monthly monitoring if you want fresh competitor movement and recurring visibility fixes.</p>` : ""}
      </div>
      <div style="padding: 22px 34px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <p style="font-size: 12px; color: rgba(248,250,252,0.48); margin: 0;">VizBiz.ai — AI Visibility Intelligence</p>
      </div>
    </div>
  `;

  await sendVizBizEmail({ to, subject, html });
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
      const session = event.data?.object;
      const leadId = session?.metadata?.leadId;
      const tier = session?.metadata?.tier || "fix";
      const customerEmail = session?.customer_details?.email;
      const businessName = session?.metadata?.businessName || "Your Business";

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
      await updateLead(leadId, {
        status: "paid_intake_pending",
        lastStage: "paid_intake",
        notes: `${existingLead?.notes || ""}\n[PAYMENT_CONFIRMED ${new Date().toISOString()}] tier=${tier}; paid intake pending`,
      }).catch((error) => console.warn("[stripe-webhook] lead update failed", error));

      if (customerEmail) {
        try {
          await sendPaidIntakeEmail(customerEmail, businessName, leadId, tier);
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
