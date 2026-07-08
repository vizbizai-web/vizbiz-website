import { describe, expect, it } from 'vitest';
import { assertClientReportPayload, parseResearchDataFromNotes } from './report-data';

const basePayload = () => ({
  businessName: 'Regional Lead',
  website: 'https://example.com',
  city: 'Rosario, Argentina',
  appearedCount: 1,
  totalPrompts: 5,
  statusBand: 'Weak',
  serviceVisibility: 'Limited visibility.',
  promptResults: [{ prompt: 'best supplier', businessAppeared: false, competitorAppeared: false, citations: ['https://vertexaisearch.cloud.google.com/nope', 'https://example.com/proof'] }],
});

describe('client-safe report payload gate', () => {
  it('throws on unknown or blocked client-facing payload keys', () => {
    expect(() => assertClientReportPayload({ ...basePayload(), surpriseDebug: true })).toThrow(/Unknown client report payload key/);
    expect(() => assertClientReportPayload({ ...basePayload(), rawSourceLedger: [] })).toThrow(/Blocked client report payload key/);
  });

  it('sanitizes infrastructure citations and marks low-confidence Places matches explicitly', () => {
    const parsed = parseResearchDataFromNotes('RESEARCH_DATA:' + JSON.stringify({
      ...basePayload(),
      googlePlaceEnrichment: { placeId: 'place-1', displayName: 'Maybe Regional Co', rating: 4.8, userReviewCount: 7, websiteMatch: false, validationStatus: 'needs_review', confidence: 'low', warnings: ['City mismatch between business address and provided city'] },
    }));
    expect((parsed?.promptResults[0] as any).citations).toEqual(['https://example.com/proof']);
    expect(parsed?.googlePlaceMatchState?.status).toBe('not_confidently_matched');
  });
});
