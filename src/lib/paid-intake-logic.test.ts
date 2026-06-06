import { describe, expect, it } from 'vitest';
import { buildPaidIntakePayload, getPaidIntakeStatusAfterPayment, getPaidIntakeNextStepUrl } from './paid-intake-logic';

describe('paid intake logic', () => {
  it('routes paid checkout clients to a short paid-intake page', () => {
    expect(getPaidIntakeStatusAfterPayment()).toBe('paid_intake_pending');
    expect(getPaidIntakeNextStepUrl('lead-123', 'full_report_fix')).toBe('/paid-intake/lead-123?plan=full_report_fix');
  });

  it('requires exactly two named competitors for paid intake', () => {
    const payload = buildPaidIntakePayload({
      plan: 'monthly_growth',
      businessCategory: 'Med spa',
      mainServices: 'Endermologie, lymphatic drainage',
      idealCustomer: 'Women 35-55 in Oakville',
      differentiator: 'Certified specialist and private appointments',
      competitor1Name: 'Competitor One',
      competitor1Website: 'competitor-one.com',
      competitor2Name: 'Competitor Two',
      competitor2Website: 'https://competitor-two.com',
      competitor3Name: 'Should be ignored',
      customerQuestions: 'Is Endermologie safe?\nHow many sessions do I need?',
      goal: 'Appear in AI recommendations',
      googleBusinessProfile: 'https://maps.google.com/example',
      monthlyFocus: 'Track Oakville competitors monthly',
    });

    expect(payload.competitors).toEqual([
      { name: 'Competitor One', website: 'https://competitor-one.com' },
      { name: 'Competitor Two', website: 'https://competitor-two.com' },
    ]);
    expect(payload.customerQuestions).toEqual(['Is Endermologie safe?', 'How many sessions do I need?']);
    expect(payload.requiredComplete).toBe(true);
  });

  it('blocks paid intake when either competitor name is missing', () => {
    const payload = buildPaidIntakePayload({
      plan: 'full_report_fix',
      businessCategory: 'Restaurant',
      mainServices: 'Private dining, catering',
      idealCustomer: 'Local families and corporate events',
      differentiator: '',
      competitor1Name: 'Competitor One',
      competitor2Name: '',
      customerQuestions: '',
      goal: 'Understand visibility gaps',
    });

    expect(payload.requiredComplete).toBe(false);
    expect(payload.estimatedMinutes).toBe(5);
  });
});
