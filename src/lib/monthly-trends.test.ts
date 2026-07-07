import { describe, expect, it } from 'vitest';
import type { AuditSnapshot } from './audit-snapshots';
import { buildMonthlyTrendModel } from './monthly-trends';

function snap(sequence: number, appeared: boolean): AuditSnapshot {
  return {
    leadId: 'fixture-lead',
    sequence,
    runType: sequence === 1 ? 'baseline' : 'monthly',
    tier: 'paid',
    createdAt: sequence === 1 ? '2026-07-01T00:00:00Z' : '2026-08-01T00:00:00Z',
    profileHash: 'profile',
    promptPlan: { prompts: ['best plumber toronto'], version: 'fixture', hash: 'hash' },
    platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: appeared ? 1 : 0, totalPrompts: 1, appearanceRate: appeared ? 1 : 0, status: 'tested' }],
    blendedScore: appeared ? 1 : 0,
    band: appeared ? 'Strong' : 'Weak',
    promptResults: [{ prompt: 'best plumber toronto', provider: 'openai', businessAppeared: appeared, competitorAppeared: false }],
    competitorScores: [],
    readiness: { hasLlmsTxt: true },
    costEstimate: 0.25,
    status: 'complete',
    source: 'fixture',
  };
}

describe('monthly trend model', () => {
  it('fixture 1: baseline + one month renders two trend points and movement copy from diff', () => {
    const model = buildMonthlyTrendModel([snap(1, false), snap(2, true)]);
    expect(model.hasComparison).toBe(true);
    expect(model.points).toHaveLength(2);
    expect(model.points.map((p) => p.score)).toEqual([0, 100]);
    expect(model.latestDiff?.promptMovements.gained).toEqual([{ provider: 'openai', prompt: 'best plumber toronto' }]);
    expect(model.movementCopy.join('\n')).toContain('best plumber toronto');
  });

  it('uses two-snapshot minimum copy when only baseline exists', () => {
    const model = buildMonthlyTrendModel([snap(1, false)]);
    expect(model.hasComparison).toBe(false);
    expect(model.latestDiff).toBeNull();
    expect(model.baselineCopy).toContain('first trend comparison arrives next month');
  });
});
