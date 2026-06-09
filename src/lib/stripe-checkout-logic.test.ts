import { describe, expect, it } from 'vitest';
import { buildStripeCheckoutFallbackUrl, buildStripeCheckoutSuccessUrl } from './stripe-checkout-logic';

describe('stripe checkout logic', () => {
  it('sends one-time buyers to paid intake after checkout', () => {
    expect(buildStripeCheckoutSuccessUrl('lead-123', 'fix')).toBe('https://vizbiz.ai/paid-intake/lead-123?plan=full_report_fix&paid=1');
  });

  it('sends monthly buyers to monthly paid intake after checkout', () => {
    expect(buildStripeCheckoutSuccessUrl('lead-123', 'fix_and_monitor')).toBe('https://vizbiz.ai/paid-intake/lead-123?plan=monthly_growth&paid=1');
  });

  it('keeps static Stripe payment-link fallbacks available when dynamic checkout is permission-limited', () => {
    expect(buildStripeCheckoutFallbackUrl('fix')).toBe('https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002');
    expect(buildStripeCheckoutFallbackUrl('fix_and_monitor')).toBe('https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003');
  });
});
