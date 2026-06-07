import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseResearchDataFromNotes } from './report-data';

describe('Mission Control report preview', () => {
  it('parses current pipeline research JSON followed by review notes', () => {
    const notes = JSON.stringify({
      preflight: { niche: 'beauty_salon' },
      competitorMode: 'client_provided',
      competitors: ['Bayside Endermologie', 'Natural Health and Beauty with Endermologie'],
      research: {
        businessName: 'Peninsula Endermologie',
        appearedCount: 0,
        totalPrompts: 5,
        statusBand: 'Weak',
        promptResults: [{ prompt: 'best endermologie clinic in Melbourne', businessAppeared: false, competitorAppeared: true }],
        niche: 'beauty_salon',
        competitorValidations: [{ name: 'Bayside Endermologie', validationStatus: 'validated', rating: 5, userReviewCount: 37 }],
      },
    }) + '\n[Review: pending_review at 2026-06-07T03:41:17.196Z]';

    const parsed = parseResearchDataFromNotes(notes);
    expect(parsed?.businessName).toBe('Peninsula Endermologie');
    expect(parsed?.appearedCount).toBe(0);
    expect(parsed?.totalPrompts).toBe(5);
    expect(parsed?.competitorMode).toBe('client_provided');
    expect(parsed?.competitorValidations?.[0]?.name).toBe('Bayside Endermologie');
  });

  it('does not send pending-review operators to the client-gated public report URL', () => {
    const leadPage = readFileSync('src/app/mission-control/leads/[leadId]/page.tsx', 'utf8');
    expect(leadPage).toContain('/mission-control/report-preview/');
    expect(leadPage).toContain('Operator Report Preview');
    expect(leadPage).not.toContain('Preview Client Report');
  });
});
