import { describe, expect, it } from 'vitest';
import {
  buildPostIntakeRedirect,
  getClientReportAccessState,
  getSeparateCompetitorNames,
  hasVerifiedLocalTrustData,
} from './funnel-logic';

describe('VizBiz funnel logic', () => {
  it('sends fresh intake users to thank-you instead of an instant report', () => {
    expect(buildPostIntakeRedirect('lead-123')).toBe('/thank-you?submitted=1&lid=lead-123');
  });

  it('does not expose report content before research is complete and approved', () => {
    expect(getClientReportAccessState({ status: 'new', researchStatus: 'pending', hasResearchData: false })).toBe('processing');
    expect(getClientReportAccessState({ status: 'pending_review', researchStatus: 'complete', hasResearchData: true })).toBe('processing');
    expect(getClientReportAccessState({ status: 'approved', researchStatus: 'complete', hasResearchData: false })).toBe('processing');
  });

  it('allows report content only after approval plus completed research data', () => {
    expect(getClientReportAccessState({ status: 'approved', researchStatus: 'complete', hasResearchData: true })).toBe('ready');
    expect(getClientReportAccessState({ status: 'email_drafted', researchStatus: 'complete', hasResearchData: true })).toBe('ready');
  });

  it('keeps two submitted competitors separate instead of grouping them as one', () => {
    expect(getSeparateCompetitorNames('Bayside Endermologie, Natural Health and Beauty with Endermologie')).toEqual([
      'Bayside Endermologie',
      'Natural Health and Beauty with Endermologie',
    ]);
  });

  it('hides social/local trust sections unless verified Places or review data exists', () => {
    expect(hasVerifiedLocalTrustData({ googleReviews: null, competitorSocial: [], competitorValidations: [] })).toBe(false);
    expect(hasVerifiedLocalTrustData({ googleReviews: 17, competitorSocial: [], competitorValidations: [] })).toBe(true);
    expect(hasVerifiedLocalTrustData({ googleReviews: null, competitorSocial: [{ name: 'Comp', googleReviews: 42 }], competitorValidations: [] })).toBe(true);
    expect(hasVerifiedLocalTrustData({ googleReviews: null, competitorSocial: [], competitorValidations: [{ name: 'Comp', validationStatus: 'validated', rating: 4.8, userReviewCount: 42, distanceFromClientKm: 1.2 }] })).toBe(true);
  });
});
