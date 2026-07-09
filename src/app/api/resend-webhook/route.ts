import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { isSupabaseRestConfigured, supabaseRest, type SupabaseJson } from '@/lib/supabase-rest';

export const runtime = 'nodejs';

type ResendWebhookPayload = {
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

const EVENT_TYPE_MAP: Record<string, string> = {
  'email.delivered': 'email_delivered',
  'email.opened': 'email_opened',
  'email.clicked': 'email_clicked',
  'email.bounced': 'email_bounced',
  'email.complained': 'email_complained',
  'email.delivery_delayed': 'email_delivery_delayed',
};

function resendWebhookSecret() {
  return process.env.RESEND_WEBHOOK_SECRET || '';
}

function headerObject(request: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) out[key] = value;
  // Resend documents Svix-style headers, while standardwebhooks verifies
  // Webhook-* names. Normalize both forms so production accepts Resend's
  // real delivery headers and tests can still exercise the verifier directly.
  if (out['svix-id'] && !out['webhook-id']) out['webhook-id'] = out['svix-id'];
  if (out['svix-timestamp'] && !out['webhook-timestamp']) out['webhook-timestamp'] = out['svix-timestamp'];
  if (out['svix-signature'] && !out['webhook-signature']) out['webhook-signature'] = out['svix-signature'];
  return out;
}

function eventData(payload: ResendWebhookPayload): Record<string, unknown> {
  return payload.data && typeof payload.data === 'object' ? payload.data : {};
}

function resendMessageId(payload: ResendWebhookPayload): string {
  const data = eventData(payload);
  return String(data.email_id || data.emailId || data.id || '').trim();
}

async function findLeadForMessage(messageId: string): Promise<string | null> {
  if (!messageId || !isSupabaseRestConfigured()) return null;
  const rows = await supabaseRest<Array<{ lead_id: string | null }>>(
    `/lead_events?select=lead_id&event_type=eq.email_sent&event_payload->>resendMessageId=eq.${encodeURIComponent(messageId)}&order=created_at.desc&limit=1`,
  ).catch(() => []);
  return rows?.[0]?.lead_id || null;
}

function safePayload(payload: ResendWebhookPayload, messageId: string, webhookId: string | null): Record<string, SupabaseJson> {
  const data = eventData(payload);
  const click: Record<string, unknown> = data.click && typeof data.click === 'object' ? data.click as Record<string, unknown> : {};
  return {
    provider: 'resend',
    resendType: payload.type || null,
    resendMessageId: messageId || null,
    webhookId: webhookId || null,
    eventCreatedAt: payload.created_at || null,
    to: Array.isArray(data.to) ? data.to.map((value) => String(value)).join(', ') : typeof data.to === 'string' ? data.to : null,
    from: typeof data.from === 'string' ? data.from : null,
    subject: typeof data.subject === 'string' ? data.subject : null,
    clickUrl: typeof click.url === 'string' ? click.url : typeof data.url === 'string' ? data.url : null,
  };
}

export async function POST(request: Request) {
  const secret = resendWebhookSecret();
  if (!secret) return NextResponse.json({ success: false, error: 'RESEND_WEBHOOK_SECRET not configured' }, { status: 503 });

  const rawBody = await request.text();
  let payload: ResendWebhookPayload;
  try {
    payload = new Webhook(secret).verify(rawBody, headerObject(request)) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid Resend webhook signature' }, { status: 401 });
  }

  const providerType = payload.type || '';
  const eventType = EVENT_TYPE_MAP[providerType];
  if (!eventType) return NextResponse.json({ success: true, ignored: true, type: providerType || 'unknown' });

  const messageId = resendMessageId(payload);
  const webhookId = request.headers.get('webhook-id');
  const leadId = await findLeadForMessage(messageId);

  if (isSupabaseRestConfigured()) {
    await supabaseRest('/lead_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        lead_id: leadId,
        event_type: eventType,
        event_payload: safePayload(payload, messageId, webhookId),
      }),
    });
  }

  return NextResponse.json({ success: true, eventType, leadId, resendMessageId: messageId || null });
}

export async function GET() {
  return NextResponse.json({ success: true, route: 'resend-webhook', canonicalPath: '/api/resend-webhook/' });
}
