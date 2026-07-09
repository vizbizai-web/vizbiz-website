import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { Webhook } from 'standardwebhooks';

function read(path: string) { return readFileSync(path, 'utf8'); }

function signedRequest(secret: string, body: string, path = 'https://vizbiz.ai/api/resend-webhook/', style: 'svix' | 'webhook' = 'svix') {
  const id = 'msg_test_webhook';
  const timestamp = new Date();
  const timestampSeconds = String(Math.floor(timestamp.getTime() / 1000));
  const signature = new Webhook(secret).sign(id, timestamp, body);
  const headers: Record<string, string> = style === 'svix'
    ? { 'svix-id': id, 'svix-timestamp': timestampSeconds, 'svix-signature': signature }
    : { 'webhook-id': id, 'webhook-timestamp': timestampSeconds, 'webhook-signature': signature };
  return new Request(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body,
  });
}

const TEST_WEBHOOK_SECRET = `whsec_${Buffer.from('test').toString('base64')}`;

describe('Resend webhook receiver', () => {
  it('keeps the canonical receiver slash-terminated and wired for delivered/opened/clicked/bounced', () => {
    const source = read('src/app/api/resend-webhook/route.ts');
    expect(source).toContain("canonicalPath: '/api/resend-webhook/'");
    expect(source).toContain("'email.delivered': 'email_delivered'");
    expect(source).toContain("'email.opened': 'email_opened'");
    expect(source).toContain("'email.clicked': 'email_clicked'");
    expect(source).toContain("'email.bounced': 'email_bounced'");
    expect(source).toContain('RESEND_WEBHOOK_SECRET');
    expect(source).toContain("out['svix-id']");
    expect(source).toContain("out['svix-signature']");
    expect(source).toContain('Invalid Resend webhook signature');
    expect(source).toContain('event_payload->>resendMessageId');
  });

  it('rejects wrong signatures and accepts valid Standard Webhooks signatures', async () => {
    vi.resetModules();
    process.env.RESEND_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const route = await import('@/app/api/resend-webhook/route');
    const body = JSON.stringify({ type: 'email.delivered', created_at: '2026-07-09T00:00:00Z', data: { email_id: 'email_123', to: ['qa@example.com'], subject: 'QA' } });

    const bad = await route.POST(new Request('https://vizbiz.ai/api/resend-webhook/', { method: 'POST', headers: { 'webhook-id': 'msg_bad', 'webhook-timestamp': '1780000000', 'webhook-signature': 'v1,bad' }, body }));
    expect(bad.status).toBe(401);
    expect(await bad.json()).toMatchObject({ success: false, error: 'Invalid Resend webhook signature' });

    const good = await route.POST(signedRequest(TEST_WEBHOOK_SECRET, body));
    expect(good.status).toBe(200);
    expect(await good.json()).toMatchObject({ success: true, eventType: 'email_delivered', resendMessageId: 'email_123' });
  });
});
