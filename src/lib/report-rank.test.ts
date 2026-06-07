import { describe, expect, it } from 'vitest';
import { getReportRankDisplay } from './report-rank';

describe('getReportRankDisplay', () => {
  it('does not call a zero-presence business #1 when every score is zero', () => {
    const rank = getReportRankDisplay([
      { name: 'Thronmoor Services', score: 0, isYou: true },
      { name: 'Competitor A', score: 0, isYours: true },
      { name: 'Competitor B', score: 0, isYours: true },
    ]);

    expect(rank.rank).toBeNull();
    expect(rank.value).toBe('Not ranked');
    expect(rank.label).toBe('AI Presence');
    expect(rank.colorState).toBe('negative');
  });

  it('ranks visible businesses only when the client appeared at least once', () => {
    const rank = getReportRankDisplay([
      { name: 'Client', score: 2, isYou: true },
      { name: 'Leader', score: 5, isYours: true },
      { name: 'Lower', score: 1, isYours: true },
    ]);

    expect(rank.rank).toBe(2);
    expect(rank.value).toBe('#2');
    expect(rank.label).toBe('Your Rank');
  });

  it('shows #1 only when the client has actual AI presence and no better competitor score', () => {
    const rank = getReportRankDisplay([
      { name: 'Client', score: 3, isYou: true },
      { name: 'Competitor', score: 0, isYours: true },
    ]);

    expect(rank.rank).toBe(1);
    expect(rank.value).toBe('#1');
    expect(rank.colorState).toBe('positive');
  });
});
