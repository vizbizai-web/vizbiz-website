import { describe, expect, it } from 'vitest';
import { buildCompetitorMovementAlert } from './competitor-movement-alerts';
import type { SnapshotDiff } from './snapshot-diff';

const baseDiff: SnapshotDiff = {
  previousSequence: 1,
  currentSequence: 2,
  comparable: true,
  scoreDelta: { blended: { previous: 0.2, current: 0.1, delta: -0.1 }, platforms: [], band: { previous: 'Weak', current: 'Weak', changed: false } },
  promptMovements: { gained: [], lost: [], held: [], newlyTracked: [] },
  competitorMovements: { gained: [], lost: [], shareOfVoice: [] },
  readinessChanges: { appeared: [], disappeared: [], changed: [] },
  excludedPromptKeys: [],
};

describe('competitor movement alerts', () => {
  it('builds an operator-gated proposed alert when a competitor gains a prompt the client does not hold', () => {
    const alert = buildCompetitorMovementAlert({
      leadId: 'lead-alert',
      businessName: 'QA Plumbing',
      clientEmail: 'owner@example.com',
      diff: {
        ...baseDiff,
        competitorMovements: {
          gained: [{ competitor: 'Drain King', provider: 'openai', prompt: 'emergency plumber near me' }],
          lost: [],
          shareOfVoice: [],
        },
      },
    });
    expect(alert?.proposedSubject).toContain('Drain King started appearing');
    expect(alert?.proposedBody).toContain('emergency plumber near me');
  });

  it('stays silent when there are no trigger conditions', () => {
    expect(buildCompetitorMovementAlert({ leadId: 'lead-alert', businessName: 'QA Plumbing', diff: baseDiff })).toBeNull();
  });
});
