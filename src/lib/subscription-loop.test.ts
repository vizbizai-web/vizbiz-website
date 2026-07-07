import { describe, expect, it } from 'vitest';
import { subscriptionMirrorPatchFromStripeEvent } from './subscription-loop';

const fixedNow = new Date('2026-07-07T00:00:00.000Z');

describe('subscription loop Stripe mirror fixtures', () => {
  it('fixture 4: cancellation pauses the monthly loop and clears next_run_at', () => {
    const patch = subscriptionMirrorPatchFromStripeEvent({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_cancelled_fixture',
          status: 'canceled',
          metadata: { leadId: 'lead-cancel-fixture' },
          current_period_end: 1783382400,
        },
      },
    }, fixedNow);

    expect(patch).toEqual({
      leadId: 'lead-cancel-fixture',
      stripeSubscriptionId: 'sub_cancelled_fixture',
      status: 'canceled',
      currentPeriodEnd: '2026-07-07T00:00:00.000Z',
      nextRunAt: null,
      pausedReason: 'subscription_canceled',
      lastError: null,
    });
  });

  it('fixture 5: invoice.payment_failed pauses the loop with payment_failed reason', () => {
    const patch = subscriptionMirrorPatchFromStripeEvent({
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_failed_fixture',
          status: 'open',
          metadata: { leadId: 'lead-payment-failed-fixture' },
        },
      },
    }, fixedNow);

    expect(patch).toEqual({
      leadId: 'lead-payment-failed-fixture',
      stripeSubscriptionId: 'sub_failed_fixture',
      status: 'past_due',
      nextRunAt: null,
      pausedReason: 'payment_failed',
      lastError: 'open',
    });
  });

  it('reactivates on invoice.payment_succeeded with a future next_run_at', () => {
    const patch = subscriptionMirrorPatchFromStripeEvent({
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          subscription: { id: 'sub_recovered_fixture', metadata: { leadId: 'lead-recovered-fixture' } },
          period_end: 1785974400,
        },
      },
    }, fixedNow);

    expect(patch?.leadId).toBe('lead-recovered-fixture');
    expect(patch?.stripeSubscriptionId).toBe('sub_recovered_fixture');
    expect(patch?.status).toBe('active');
    expect(patch?.pausedReason).toBeNull();
    expect(patch?.nextRunAt).toBe('2026-08-06T00:00:00.000Z');
  });
});
