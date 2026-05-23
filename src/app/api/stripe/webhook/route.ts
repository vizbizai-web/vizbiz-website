import { NextResponse } from "next/server";
import {
  createSupabaseFulfillmentTask,
  createSupabaseLeadEvent,
  createSupabasePaidOrder,
  createSupabaseTelegramAlertLog,
  findSupabaseLeadByReportSlug,
  updateSupabaseLeadStatus,
} from "@/lib/supabase-crm";
import {
  buildPaidFulfillmentTaskDescription,
  buildPaidFulfillmentTaskTitle,
  buildPurchaseCompletedAlert,
  sendTelegramAlert,
} from "@/lib/telegram-alerts";

type StripeWebhookEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secret) {
    const verified = await verifyStripeSignature({ body, signature, secret });
    if (!verified) return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(body) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(event.data.object, new URL(request.url).origin);
  }

  if (event.type === "checkout.session.expired") {
    await handleCheckoutSessionExpired(event.data.object);
  }

  if (event.type === "invoice.payment_succeeded") {
    await handleSubscriptionPaymentSucceeded(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Record<string, unknown>, origin: string) {
  const reference = stringValue(session.client_reference_id);
  const { slug, product } = parseClientReference(reference);
  const lead = slug ? await findSupabaseLeadByReportSlug(slug) : null;
  const amountCents = numberValue(session.amount_total) ?? (product === "monthly_plan" ? 18800 : 8800);
  const currency = stringValue(session.currency) ?? "usd";
  const customerId = stringValue(session.customer);
  const sessionId = stringValue(session.id);
  const client = {
    businessName: lead?.business_name,
    email: lead?.email ?? stringValue(session.customer_email),
    websiteUrl: lead?.website_url,
    location: lead?.submitted_location,
    niche: lead?.submitted_niche,
    reportUrl: slug ? `${origin}/mini-report/${slug}` : null,
  };

  if (lead) {
    const paidOrder = await createSupabasePaidOrder({
      leadId: lead.id,
      product,
      amountCents,
      currency,
      stripeCheckoutSessionId: sessionId,
      stripeCustomerId: customerId,
      status: "paid",
      rawPayload: session,
    });
    const paidOrderId = (paidOrder.data as { id?: string } | null)?.id ?? null;
    const fulfillmentTask = await createSupabaseFulfillmentTask({
      leadId: lead.id,
      paidOrderId,
      product,
      title: buildPaidFulfillmentTaskTitle({ product, businessName: lead.business_name }),
      description: buildPaidFulfillmentTaskDescription({
        client,
        product,
        amountCents,
        currency,
        stripeCheckoutSessionId: sessionId,
        slug,
      }),
      rawPayload: { stripeCheckoutSessionId: sessionId, slug },
    });
    const fulfillmentTaskId = fulfillmentTask.data?.id ?? null;
    await createSupabaseLeadEvent({
      leadId: lead.id,
      eventType: "stripe_checkout_completed",
      payload: { slug, product, sessionId, amountCents, currency, paidOrderId, fulfillmentTaskId },
    });
    await updateSupabaseLeadStatus({ leadId: lead.id, status: product === "monthly_plan" ? "paid_monthly" : "paid_one_time" });

    const alert = await sendTelegramAlert({
      type: "purchase_completed",
      text: buildPurchaseCompletedAlert({
        client,
        product,
        amountCents,
        currency,
        stripeCheckoutSessionId: sessionId,
        fulfillmentTaskId,
        slug,
      }),
    });
    if (alert.status !== "skipped") {
      await createSupabaseTelegramAlertLog({
        leadId: lead.id,
        alertType: "purchase_completed",
        chatId: alert.chatId,
        threadId: alert.threadId,
        messageId: alert.messageId,
        status: alert.status === "sent" ? "sent" : "failed",
        errorMessage: alert.error,
      });
    }
  } else {
    const paidOrder = await createSupabasePaidOrder({
      leadId: null,
      product,
      amountCents,
      currency,
      stripeCheckoutSessionId: sessionId,
      stripeCustomerId: customerId,
      status: "paid",
      rawPayload: session,
    });
    const paidOrderId = (paidOrder.data as { id?: string } | null)?.id ?? null;
    const fulfillmentTask = await createSupabaseFulfillmentTask({
      leadId: null,
      paidOrderId,
      product,
      title: buildPaidFulfillmentTaskTitle({ product, businessName: client.businessName }),
      description: buildPaidFulfillmentTaskDescription({
        client,
        product,
        amountCents,
        currency,
        stripeCheckoutSessionId: sessionId,
        slug,
      }),
      rawPayload: { stripeCheckoutSessionId: sessionId, slug, missingLead: true },
    });
    const fulfillmentTaskId = fulfillmentTask.data?.id ?? null;
    const alert = await sendTelegramAlert({
      type: "purchase_completed",
      text: buildPurchaseCompletedAlert({
        client,
        product,
        amountCents,
        currency,
        stripeCheckoutSessionId: sessionId,
        fulfillmentTaskId,
        slug,
      }),
    });
    if (alert.status !== "skipped") {
      await createSupabaseTelegramAlertLog({
        leadId: null,
        alertType: "purchase_completed_unmatched",
        chatId: alert.chatId,
        threadId: alert.threadId,
        messageId: alert.messageId,
        status: alert.status === "sent" ? "sent" : "failed",
        errorMessage: alert.error,
      });
    }
  }
}

async function handleCheckoutSessionExpired(session: Record<string, unknown>) {
  const reference = stringValue(session.client_reference_id);
  const { slug, product } = parseClientReference(reference);
  const lead = slug ? await findSupabaseLeadByReportSlug(slug) : null;
  if (!lead) return;
  await createSupabaseLeadEvent({
    leadId: lead.id,
    eventType: "stripe_checkout_expired",
    payload: { slug, product, sessionId: stringValue(session.id) },
  });
}

async function handleSubscriptionPaymentSucceeded(invoice: Record<string, unknown>) {
  const customerId = stringValue(invoice.customer);
  await createSupabaseLeadEvent({
    eventType: "stripe_invoice_payment_succeeded",
    payload: { customerId, invoiceId: stringValue(invoice.id), amountPaid: numberValue(invoice.amount_paid) },
  });
}

function parseClientReference(reference?: string | null): { slug: string | null; product: "fix_package" | "monthly_plan" } {
  const [slug, product] = (reference ?? "").split(":");
  return {
    slug: slug || null,
    product: product === "monthly_plan" ? "monthly_plan" : "fix_package",
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

async function verifyStripeSignature(input: { body: string; signature: string | null; secret: string }) {
  if (!input.signature) return false;
  const timestamp = input.signature.match(/(?:^|,)t=([^,]+)/)?.[1];
  const signatures = Array.from(input.signature.matchAll(/(?:^|,)v1=([^,]+)/g)).map((match) => match[1]);
  if (!timestamp || signatures.length === 0) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(input.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${input.body}`));
  const bytes = Array.from(new Uint8Array(digest));
  const expected = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
