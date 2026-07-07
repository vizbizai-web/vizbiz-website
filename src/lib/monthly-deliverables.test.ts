import { describe, expect, it } from 'vitest';
import type { SnapshotDiff } from './snapshot-diff';
import { buildMonthlyOnePager, validateOnePagerNumbers } from './monthly-one-pager';
import { verifyDeliveredFixManifest } from './fix-verification';

const diff: SnapshotDiff = {
  previousSequence: 1,
  currentSequence: 2,
  comparable: true,
  scoreDelta: {
    blended: { previous: 0.4, current: 0.55, delta: 0.15 },
    platforms: [{ provider: 'openai', previousRate: 0.25, currentRate: 0.5, delta: 0.25, previousCount: 5, currentCount: 10, previousTotalPrompts: 20, currentTotalPrompts: 20, totalPrompts: 20 }],
    band: { previous: 'Moderate', current: 'Moderate', changed: false },
  },
  promptMovements: { gained: [{ provider: 'openai', prompt: 'best emergency plumber' }], lost: [], held: [], newlyTracked: [] },
  competitorMovements: { gained: [], lost: [], shareOfVoice: [] },
  readinessChanges: { appeared: [], disappeared: [], changed: [] },
  excludedPromptKeys: [],
};

describe('monthly one-pager and fix verification fixtures', () => {
  it('fixture 9: validates one-pager numbers against diff', () => {
    const page = buildMonthlyOnePager({ businessName: 'QA Plumbing', diff, fixDropTitles: ['FAQ Content Block'] });
    expect(page.scoreLine).toContain('40 → 55');
    expect(validateOnePagerNumbers(page, diff)).toEqual([]);
    expect(validateOnePagerNumbers({ ...page, nextFocus: 'We improved you by 999 points.' }, diff)).toContain('unsupported_number:999');
  });

  it('fixture 6: flags delivered manifest regressions when llms.txt goes missing', () => {
    const result = verifyDeliveredFixManifest({
      artifacts: [
        { filename: 'llms.txt', content: '# llms', status: 'delivered' },
        { filename: 'schema.jsonld', content: '{}', status: 'delivered' },
      ],
      live: { hasLlmsTxt: false, hasSchema: true, robotsAllowsAi: true },
    });
    expect(result.regressions).toEqual(['llms.txt']);
  });
});
