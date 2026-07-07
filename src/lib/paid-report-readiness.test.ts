import { describe, expect, it } from 'vitest';
import { assertPaidReportResearchComplete } from './paid-report-readiness';

const validResearchNotes = JSON.stringify({
  preflight: { niche: 'plumbing' },
  competitorMode: 'client_only',
  competitors: [],
  research: {
    businessName: 'QA Plumbing',
    website: 'https://example.com',
    city: 'Toronto',
    contactName: 'Alex',
    competitor: '',
    niche: 'plumbing',
    appearedCount: 1,
    totalPrompts: 3,
    statusBand: 'Weak',
    serviceVisibility: 'Moderate',
    promptResults: [
      { prompt: 'trusted plumber in Toronto', businessAppeared: true, competitorAppeared: false, provider: 'perplexity', kind: 'ai_answer' },
    ],
    competitorMention: '',
    competitorLine: '',
    competitorCategories: [],
    whyThisMatters: '',
    processedAt: '2026-07-03T00:00:00.000Z',
  },
});

describe('paid report readiness', () => {
  it('verifies completed research instead of stamping it complete', () => {
    expect(assertPaidReportResearchComplete({ researchStatus: 'complete', notes: validResearchNotes })).toEqual({ ok: true });
  });

  it('blocks incomplete research from reaching paid_report_ready_for_review', () => {
    expect(assertPaidReportResearchComplete({ researchStatus: 'running', notes: validResearchNotes })).toEqual({
      ok: false,
      error: 'Paid report prep requires completed research before operator review.',
    });
  });

  it('blocks complete status without prompt evidence', () => {
    expect(assertPaidReportResearchComplete({ researchStatus: 'complete', notes: '' }).ok).toBe(false);
  });
});
