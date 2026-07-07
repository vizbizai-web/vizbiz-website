import { describe, expect, it } from 'vitest';
import { buildStripeCheckoutFallbackUrl, buildStripeCheckoutSuccessUrl, stripePaymentLinkToTier } from './stripe-checkout-logic';

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

  it('adds lead attribution and prefilled email to payment-link fallback URLs', () => {
    const url = new URL(buildStripeCheckoutFallbackUrl('fix', 'lead-123', 'qa@example.com'));
    expect(url.searchParams.get('client_reference_id')).toBe('lead-123');
    expect(url.searchParams.get('prefilled_email')).toBe('qa@example.com');
  });

  it('maps Stripe payment links back to VizBiz tiers for webhook fallback attribution', () => {
    expect(stripePaymentLinkToTier('plink_1TVjhwLnxAAOKS2r4FSOWweF')).toBe('fix_and_monitor');
    expect(stripePaymentLinkToTier('plink_1TVjhDLnxAAOKS2rP9Xo3hPo')).toBe('fix');
  });
});
