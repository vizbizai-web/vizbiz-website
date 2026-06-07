import { describe, expect, it } from 'vitest';
import { buildStripeCheckoutSuccessUrl } from './stripe-checkout-logic';

describe('stripe checkout logic', () => {
  it('sends one-time buyers to paid intake after checkout', () => {
    expect(buildStripeCheckoutSuccessUrl('lead-123', 'fix')).toBe('https://vizbiz.ai/paid-intake/lead-123?plan=full_report_fix&paid=1');
  });

  it('sends monthly buyers to monthly paid intake after checkout', () => {
    expect(buildStripeCheckoutSuccessUrl('lead-123', 'fix_and_monitor')).toBe('https://vizbiz.ai/paid-intake/lead-123?plan=monthly_growth&paid=1');
  });
});
