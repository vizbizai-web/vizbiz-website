import { describe, expect, it } from 'vitest';
import { isQaLead } from './qa-leads';
import type { LeadRow } from './google-sheets';

const lead = (overrides: Partial<LeadRow>): LeadRow => ({
  timestamp: '', dealershipName: 'QA Looking Name', website: '', city: '', contactName: '', email: 'qa@example.com', phone: '', competitor: '', snapshotAppeared: '', visibilityBand: '', serviceVisibility: '', status: 'new', researchStatus: 'pending', emailSentAt: '', notes: 'qa note should not exclude by itself', source: '', leadId: '', lockOwner: '', lockExpiresAt: '', retryCount: 0, lastStage: '', lastError: '', preflightStartedAt: '', preflightCompletedAt: '', researchStartedAt: '', researchCompletedAt: '', reportGeneratedAt: '', reportUrl: '', competitorMode: '', clientProvidedCompetitors: '', internalCompetitorSuggestions: '', placesValidationStatus: '', sonarValidationStatus: '',
  ...overrides,
});

describe('source-only QA/client-zero metric exclusion', () => {
  it('excludes only durable source flags, never names/emails/notes', () => {
    expect(isQaLead(lead({ source: 'qa_mobile_review' }))).toBe(true);
    expect(isQaLead(lead({ source: 'client_zero' }))).toBe(true);
    expect(isQaLead(lead({ source: '', dealershipName: 'QA Test Sentinel', email: 'qa+test@example.com' }))).toBe(false);
  });
});
