import { describe, expect, it } from 'vitest';
import type { AuditSnapshot } from './audit-snapshots';
import { hashPromptPlan, stableJson, uniquePromptPlan } from './audit-snapshots';
import { diffSnapshots, renderMovementCopy } from './snapshot-diff';

function snapshot(sequence: number, overrides: Partial<AuditSnapshot> = {}): AuditSnapshot {
  return {
    leadId: 'lead-fixture',
    sequence,
    runType: sequence === 1 ? 'baseline' : 'monthly',
    tier: 'paid',
    profileHash: 'profile-1',
    promptPlan: { prompts: ['emergency plumber toronto', 'drain cleaning toronto', 'water heater repair toronto'], version: 'fixture' },
    platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 1, totalPrompts: 3, appearanceRate: 1 / 3, status: 'tested' }],
    blendedScore: 1 / 3,
    band: 'Weak',
    promptResults: [
      { prompt: 'emergency plumber toronto', provider: 'openai', businessAppeared: true, competitorAppeared: true, competitorName: 'Drain King' },
      { prompt: 'drain cleaning toronto', provider: 'openai', businessAppeared: false, competitorAppeared: false, competitorName: 'Drain King' },
      { prompt: 'water heater repair toronto', provider: 'openai', businessAppeared: false, competitorAppeared: false, competitorName: 'Advanced Plumbing' },
    ],
    competitorScores: [],
    readiness: { hasLlmsTxt: true, hasSchema: true },
    costEstimate: 0.25,
    status: 'complete',
    source: 'fixture',
    ...overrides,
  };
}

describe('snapshot diff Phase 3 fixtures', () => {

  it('dedupes reusable prompt plans before hashing/storing monthly plan identity', () => {
    const polluted = ['best plumber toronto', 'best plumber toronto', 'drain cleaning toronto'];
    expect(uniquePromptPlan(polluted)).toEqual(['best plumber toronto', 'drain cleaning toronto']);
    expect(hashPromptPlan(polluted)).toBe(hashPromptPlan(['best plumber toronto', 'drain cleaning toronto']));
  });

  it('fixture 2: computes gained/lost prompt movements exactly and rendered movement copy only uses those prompts', () => {
    const previous = snapshot(1);
    const current = snapshot(2, {
      platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 2, totalPrompts: 3, appearanceRate: 2 / 3, status: 'tested' }],
      blendedScore: 2 / 3,
      promptResults: [
        { prompt: 'emergency plumber toronto', provider: 'openai', businessAppeared: false, competitorAppeared: true, competitorName: 'Drain King' },
        { prompt: 'drain cleaning toronto', provider: 'openai', businessAppeared: true, competitorAppeared: true, competitorName: 'Drain King' },
        { prompt: 'water heater repair toronto', provider: 'openai', businessAppeared: true, competitorAppeared: false, competitorName: 'Advanced Plumbing' },
      ],
    });

    const diff = diffSnapshots(current, previous);
    expect(diff.promptMovements.gained).toEqual([
      { provider: 'openai', prompt: 'drain cleaning toronto' },
      { provider: 'openai', prompt: 'water heater repair toronto' },
    ]);
    expect(diff.promptMovements.lost).toEqual([{ provider: 'openai', prompt: 'emergency plumber toronto' }]);
    expect(diff.scoreDelta.blended.delta).toBe(0.3333);
    const copy = renderMovementCopy(diff).join('\n');
    expect(copy).toContain('drain cleaning toronto');
    expect(copy).toContain('water heater repair toronto');
    expect(copy).toContain('emergency plumber toronto');
    expect(copy).not.toContain('basement flooding toronto');
  });

  it('fixture 3: refreshed prompts are newly tracked, not gains or losses', () => {
    const previous = snapshot(1);
    const current = snapshot(2, {
      promptPlan: { prompts: ['emergency plumber toronto', 'basement flooding toronto', 'water heater repair toronto'], version: 'fixture', refreshedPromptIds: ['openai::basement flooding toronto'] },
      promptResults: [
        { prompt: 'emergency plumber toronto', provider: 'openai', businessAppeared: true, competitorAppeared: true, competitorName: 'Drain King' },
        { prompt: 'basement flooding toronto', provider: 'openai', businessAppeared: true, competitorAppeared: true, competitorName: 'Drain King' },
        { prompt: 'water heater repair toronto', provider: 'openai', businessAppeared: false, competitorAppeared: false, competitorName: 'Advanced Plumbing' },
      ],
    });

    const diff = diffSnapshots(current, previous);
    expect(diff.promptMovements.newlyTracked).toEqual([{ provider: 'openai', prompt: 'basement flooding toronto' }]);
    expect(diff.promptMovements.gained).toEqual([]);
    expect(diff.promptMovements.lost).toEqual([]);
    expect(diff.excludedPromptKeys).toContain('openai::basement flooding toronto');
  });



  it('fixture 11: refuses month-over-month diff when platform prompt totals changed', () => {
    const previous = snapshot(1, {
      platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 1, totalPrompts: 18, appearanceRate: 1 / 18, status: 'tested' }],
      blendedScore: 1 / 18,
    });
    const current = snapshot(2, {
      platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 10, totalPrompts: 54, appearanceRate: 10 / 54, status: 'tested' }],
      blendedScore: 10 / 54,
    });
    const diff = diffSnapshots(current, previous);
    expect(diff.comparable).toBe(false);
    expect(diff.incomparableReason).toBe('platform_total_prompts_mismatch:openai:18->54');
    expect(diff.scoreDelta.blended.delta).toBeNull();
    expect(diff.promptMovements.gained).toEqual([]);
    expect(renderMovementCopy(diff).join(' ')).toContain('re-baselined');
  });

  it('fixture 10: diffing the same snapshot pair twice is byte-identical', () => {
    const previous = snapshot(1);
    const current = snapshot(2, {
      readiness: { hasLlmsTxt: false, hasSchema: true },
      promptResults: [
        { prompt: 'emergency plumber toronto', provider: 'openai', businessAppeared: true, competitorAppeared: false, competitorName: 'Drain King' },
        { prompt: 'drain cleaning toronto', provider: 'openai', businessAppeared: true, competitorAppeared: true, competitorName: 'Drain King' },
        { prompt: 'water heater repair toronto', provider: 'openai', businessAppeared: false, competitorAppeared: true, competitorName: 'Advanced Plumbing' },
      ],
    });
    expect(stableJson(diffSnapshots(current, previous))).toBe(stableJson(diffSnapshots(current, previous)));
  });
});
