import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('credentialed surface invalid-value rejection standard', () => {
  it('requires exact Telegram secret-token equality when configured', () => {
    const source = read('src/app/api/telegram/webhook/route.ts');
    expect(source).toContain('TELEGRAM_WEBHOOK_SECRET');
    expect(source).toContain('x-telegram-bot-api-secret-token');
    expect(source).toContain('=== TELEGRAM_WEBHOOK_SECRET');
    expect(source).toContain('Unauthorized Telegram webhook');
  });

  it('requires exact CRON_SECRET equality and rejects wrong bearer or x-cron-secret values', () => {
    const helper = read('src/lib/cron-heartbeats.ts');
    const source = read('src/app/api/cron/process-reruns/route.ts');
    expect(helper).toContain('process.env.CRON_SECRET');
    expect(helper).toContain('bearer === secret');
    expect(helper).toContain('header === secret');
    expect(helper).toContain("authMethod: 'bearer'");
    expect(helper).toContain("authMethod: 'x-cron-secret'");
    expect(source).toContain('authorizeCronRequest(request)');
    expect(source).toContain('Unauthorized');
  });

  it('requires exact Mission Control internal token or signed session, not any cookie/header', () => {
    const apiAuth = read('src/lib/mission-control-api-auth.ts');
    const sessionAuth = read('src/app/mission-control/lib/auth.ts');
    const middleware = read('src/middleware.ts');

    expect(apiAuth).toContain('MISSION_CONTROL_INTERNAL_TOKEN');
    expect(apiAuth).toContain('safeEqual(providedInternal, expectedInternal)');
    expect(apiAuth).toContain('verifySessionToken');
    expect(sessionAuth).toContain('verifySessionToken');
    expect(middleware).toContain('verifyMissionControlSession');
    expect(middleware).not.toContain('if (!session) {');
  });

  it('uses Stripe HMAC signature verification instead of accepting a shared header value', () => {
    const source = read('src/app/api/stripe-webhook/route.ts');
    expect(source).toContain('stripe-signature');
    expect(source).toContain('verifyStripeSignature');
    expect(source).toContain('createHmac');
    expect(source).toContain('timingSafeEqual');
    expect(source).toContain('STRIPE_WEBHOOK_SECRET');
    expect(source).toContain('Invalid Stripe webhook signature');
  });
});
