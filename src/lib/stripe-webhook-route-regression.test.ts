import { describe, expect, it } from 'vitest';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vizbiz.ai').replace(/\/$/, '');

async function postWithoutFollowingRedirects(path: string) {
  return fetch(`${siteUrl}${path}`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'route-regression-probe' }),
  });
}

describe('Stripe webhook canonical route regression', () => {
  it('keeps the canonical Stripe webhook URL slash-terminated and free of framework redirects', async () => {
    const response = await postWithoutFollowingRedirects('/api/stripe-webhook/');

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(response.status).not.toBe(301);
    expect(response.status).not.toBe(302);
    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(308);
  }, 15000);
});
