/**
 * Stripe Webhook Handler
 *
 * Handles checkout.session.completed events.
 * Extracts leadId from metadata, triggers deliver-audit for paid tier.
 * Sends delivery confirmation email.
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stripe webhook secret — set in Vercel env vars
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Import email sender
async function sendDeliveryEmail(
  to: string,
  businessName: string,
  leadId: string,
  tier: string
) {
  const reportUrl = `https://vizbiz.ai/report/${leadId}/full`;
  const subject = `Your VizBiz Implementation Pack is Ready — ${businessName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #02091F; color: #F5F5F7;">
      <div style="padding: 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <h1 style="color: #25D1F2; font-size: 24px; margin: 0;">VizBiz</h1>
        <p style="color: #F5F5F7; font-size: 16px; margin: 8px 0 0;">Implementation Pack Ready</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">
          Hi there,
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">
          Your ${tier === "monitor" ? "monthly monitoring" : "full audit"} implementation pack for <strong>${businessName}</strong> is ready.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">
          Your pack includes: schema markup, llms.txt, FAQ content, technical fixes, revenue impact analysis, ${tier === "monitor" ? "and ongoing monthly monitoring" : "and copy optimization recommendations"}.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(to right, #06B6D4, #25D1F2); color: #051018; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
            View Full Report + Download Pack
          </a>
        </div>
        <p style="font-size: 14px; color: rgba(245,245,247,0.6); line-height: 1.5;">
          You can also download all implementation files as a ZIP from the full report page.
        </p>
      </div>
      <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <p style="font-size: 12px; color: rgba(245,245,247,0.4); margin: 0;">
          VizBiz.ai — AI Visibility Intelligence<br/>
          Questions? Reply to this email or book a call at vizbiz.ai/book-call
        </p>
      </div>
    </div>
  `;

  // Use the same nodemailer setup from send-report-email
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: "vizbiz.ai@gmail.com",
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"VizBiz" <vizbiz.ai@gmail.com>',
    to,
    subject,
    html,
  });
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

    // Parse the event
    let event: any;
    try {
      // In production, verify with Stripe SDK:
      // event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const leadId = session?.metadata?.leadId;
      const tier = session?.metadata?.tier || "full";
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

      // Trigger the delivery pipeline
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      const deliverResponse = await fetch(`${baseUrl}/api/deliver-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, tier }),
      });

      const deliverResult = await deliverResponse.json();

      if (!deliverResult.success) {
        console.error(
          `[stripe-webhook] Delivery failed for ${leadId}:`,
          deliverResult.error
        );
        // Still return 200 to Stripe — we'll retry delivery separately
      }

      // Send delivery confirmation email
      if (customerEmail) {
        try {
          await sendDeliveryEmail(customerEmail, businessName, leadId, tier);
          console.info(
            `[stripe-webhook] Delivery email sent to ${customerEmail}`
          );
        } catch (emailErr) {
          console.error("[stripe-webhook] Email send failed:", emailErr);
          // Non-blocking — delivery happened, email is secondary
        }
      }

      return NextResponse.json({
        received: true,
        leadId,
        tier,
        delivered: deliverResult.success,
        filesGenerated: deliverResult.filesGenerated?.length || 0,
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
