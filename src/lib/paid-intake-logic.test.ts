import { describe, expect, it } from 'vitest';
import { buildPaidIntakePayload, buildPaidIntakePrefill, derivePaidPlanFromLead, getPaidIntakeStatusAfterPayment, getPaidIntakeNextStepUrl } from './paid-intake-logic';
import type { LeadRow } from './google-sheets';

function lead(overrides: Partial<LeadRow>): LeadRow {
  return {
    timestamp: '2026-07-01T10:00:00.000Z',
    dealershipName: 'Oakville Auto Mall',
    website: 'https://oakvilleauto.example',
    city: 'Oakville',
    contactName: 'Sam',
    email: 'sam@example.com',
    phone: '',
    competitor: 'Old Competitor',
    snapshotAppeared: '',
    visibilityBand: '',
    serviceVisibility: 'new cars, used cars, financing',
    status: 'paid_intake_pending',
    researchStatus: 'complete',
    emailSentAt: '',
    notes: '',
    source: 'stripe',
    leadId: 'lead-123',
    lockOwner: '',
    lockExpiresAt: '',
    retryCount: 0,
    lastStage: '',
    lastError: '',
    preflightStartedAt: '',
    preflightCompletedAt: '',
    researchStartedAt: '',
    researchCompletedAt: '',
    reportGeneratedAt: '',
    reportUrl: '',
    competitorMode: '',
    clientProvidedCompetitors: '',
    internalCompetitorSuggestions: '',
    placesValidationStatus: '',
    sonarValidationStatus: '',
    ...overrides,
  };
}

describe('paid intake logic', () => {
  it('routes paid checkout clients to a confirm-and-enrich page without plan query selection', () => {
    expect(getPaidIntakeStatusAfterPayment()).toBe('paid_intake_pending');
    expect(getPaidIntakeNextStepUrl('lead-123')).toBe('/paid-intake/lead-123');
  });

  it('derives plan from Stripe metadata stored at payment time', () => {
    expect(derivePaidPlanFromLead(lead({ notes: '[PAYMENT_CONFIRMED 2026-07-01T10:00:00.000Z] tier=fix_and_monitor; paid intake pending' }))).toBe('monthly_growth');
    expect(derivePaidPlanFromLead(lead({ notes: '[PAYMENT_CONFIRMED 2026-07-01T10:00:00.000Z] tier=fix; paid intake pending' }))).toBe('full_report_fix');
  });

  it('prefills from resolved profile and stores corrections as client_verified evidence', () => {
    const resolved = lead({
      notes: 'RESEARCH_DATA:' + JSON.stringify({
        nicheLabel: 'Car dealership',
        services: ['new cars', 'used SUVs'],
        primaryMarket: 'Oakville, Ontario',
      }),
      competitor: 'Braman Miami, Auto Rival',
    });
    const prefill = buildPaidIntakePrefill(resolved);
    expect(prefill.businessCategory).toBe('Car dealership');
    expect(prefill.services).toContain('new cars');

    const payload = buildPaidIntakePayload({
      contactPersonName: 'Alex Buyer',
      confirmedBusinessCategory: 'Luxury car dealership',
      confirmedServices: 'new luxury cars, certified pre-owned vehicles',
      confirmedCompetitors: 'Corrected Competitor | https://competitor.example\nSecond Competitor',
      confirmedLocation: 'Oakville, Ontario',
      customerQuestions: 'Do you have certified pre-owned SUVs?\nCan I finance a new EV?',
      proofAssets: '25 years in business\nAward-winning service department',
      webVendorEmail: 'vendor@example.com',
      gbpAccessStatus: 'We have owner/admin access',
      priorityService: 'certified pre-owned SUVs',
    }, resolved, new Date('2026-07-07T12:00:00.000Z'));

    expect(payload.requiredComplete).toBe(true);
    expect(payload.customerQuestions).toEqual(['Do you have certified pre-owned SUVs?', 'Can I finance a new EV?']);
    expect(payload.proofAssets).toContain('25 years in business');
    expect(payload.clientVerified.evidenceTier).toBe('client_verified');
    expect(payload.clientVerified.corrections).toEqual(expect.arrayContaining(['business_category', 'services', 'competitors']));
    expect(payload.competitors[0]).toEqual({ name: 'Corrected Competitor', website: 'https://competitor.example' });
  });

  it('requires only the new client questions plus confirmed profile fields', () => {
    const payload = buildPaidIntakePayload({
      contactPersonName: 'Alex Buyer',
      confirmedBusinessCategory: 'Restaurant',
      confirmedServices: 'private dining',
      confirmedCompetitors: 'Competitor One',
      confirmedLocation: 'Toronto',
      customerQuestions: '',
      gbpAccessStatus: 'Not sure who has access',
      priorityService: 'private dining',
    }, lead({}));

    expect(payload.requiredComplete).toBe(false);
    expect(payload.estimatedMinutes).toBe(3);
  });
});
