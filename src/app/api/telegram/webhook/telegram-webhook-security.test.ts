import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Telegram webhook security', () => {
  it('requires Telegram secret-token header when TELEGRAM_WEBHOOK_SECRET is configured', () => {
    const source = readFileSync('src/app/api/telegram/webhook/route.ts', 'utf8');

    expect(source).toContain('TELEGRAM_WEBHOOK_SECRET');
    expect(source).toContain('x-telegram-bot-api-secret-token');
    expect(source).toContain('Unauthorized Telegram webhook');
  });
});
