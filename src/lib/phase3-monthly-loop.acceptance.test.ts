import { describe, expect, it } from 'vitest';
import type { AuditSnapshot } from './audit-snapshots';
import { stableJson } from './audit-snapshots';
import { diffSnapshots, renderMovementCopy } from './snapshot-diff';
import { buildMonthlyTrendModel } from './monthly-trends';
import { buildCompetitorMovementAlert } from './competitor-movement-alerts';
import { buildMonthlyOnePager, validateOnePagerNumbers } from './monthly-one-pager';
import { verifyDeliveredFixManifest } from './fix-verification';
import { evaluateMonthlyRunFailure, subscriptionMirrorPatchFromStripeEvent, validateMonthlyProfileHash } from './subscription-loop';
import { generateFixKit, setFixKitLLMForTests, type FixKitInput } from './fix-kit-generator';

function snapshot(sequence: number, opts: Partial<AuditSnapshot> = {}): AuditSnapshot {
  const appeared = sequence > 1;
  return {
    leadId: 'fixture-lead',
    sequence,
    runType: sequence === 1 ? 'baseline' : 'monthly',
    tier: 'paid',
    createdAt: sequence === 1 ? '2026-07-01T00:00:00Z' : '2026-08-01T00:00:00Z',
    profileHash: 'profile-a',
    promptPlan: { prompts: ['best emergency plumber', 'trusted plumber reviews'], version: 'fixture', hash: 'same-plan' },
    platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: appeared ? 1 : 0, totalPrompts: 2, appearanceRate: appeared ? 0.5 : 0, status: 'tested' }],
    blendedScore: appeared ? 0.5 : 0,
    band: appeared ? 'Moderate' : 'Weak',
    promptResults: [
      { prompt: 'best emergency plumber', provider: 'openai', businessAppeared: appeared, competitorAppeared: !appeared, competitorName: !appeared ? 'Drain King' : undefined },
      { prompt: 'trusted plumber reviews', provider: 'openai', businessAppeared: false, competitorAppeared: true, competitorName: 'Drain King' },
    ],
    competitorScores: [],
    readiness: { hasLlmsTxt: true, hasSchema: true, robotsAllowsAi: true },
    costEstimate: 0.25,
    status: 'complete',
    source: 'fixture',
    ...opts,
  };
}

function fixKitInput(): FixKitInput {
  return {
    leadId: 'fixture-lead',
    mode: 'drop',
    profile: { businessName: 'QA Plumbing', website: 'https://qa.example', niche: 'plumbing', nicheLabel: 'Plumbing company', businessType: 'plumber', services: ['emergency plumbing','drain cleaning','water heater repair'], serviceAreas: ['Toronto'], primaryMarket: 'Toronto' },
    research: { promptResults: [{ prompt: 'best emergency plumber', businessAppeared: false }, { prompt: 'trusted plumber reviews', businessAppeared: false }, { prompt: 'water heater repair', businessAppeared: false }, { prompt: 'drain cleaning company', businessAppeared: false }, { prompt: 'licensed plumber near me', businessAppeared: false }, { prompt: '24 hour plumber', businessAppeared: false }] },
    crawl: { robotsTxt: 'User-agent: GPTBot\nDisallow: /', pages: [{ url: 'https://qa.example', title: 'QA Plumbing' }] },
    paidIntake: { customerQuestions: ['Do you offer same-day emergency service?'] },
  };
}

function installDropMock(seen: string[]) {
  setFixKitLLMForTests(async ({ artifact, userMessage }) => {
    seen.push(artifact);
    const evidence = JSON.parse(userMessage);
    if (artifact === 'A5_FAQ') return { faqs: evidence.lostPrompts.slice(0, 6).map((prompt: string) => ({ question: `${prompt}?`, answer: 'QA Plumbing explains the service area, timing, pricing factors, emergency availability, and the safest next steps before booking. This gives homeowners enough context to compare options, understand what information matters, and choose confident plumbing support without guessing.', sourcePrompt: prompt })) };
    throw new Error(`unexpected drop artifact ${artifact}`);
  });
}

describe('Phase 3 monthly loop acceptance suite', () => {
  it('1. baseline + one month produces snapshot #2 trend, diff, chart model, and gated one-pager', () => {
    const trend = buildMonthlyTrendModel([snapshot(1), snapshot(2)]);
    const diff = trend.latestDiff!;
    const onePager = buildMonthlyOnePager({ businessName: 'QA Plumbing', diff, fixDropTitles: ['FAQ Content Block'] });
    expect(trend.points).toHaveLength(2);
    expect(trend.hasComparison).toBe(true);
    expect(diff.currentSequence).toBe(2);
    expect(validateOnePagerNumbers(onePager, diff)).toEqual([]);
  });

  it('2. gained/lost correctness matches seeded prompts exactly', () => {
    const previous = snapshot(1, { promptResults: [{ prompt: 'A', provider: 'openai', businessAppeared: true, competitorAppeared: false }, { prompt: 'B', provider: 'openai', businessAppeared: false, competitorAppeared: false }] });
    const current = snapshot(2, { promptResults: [{ prompt: 'A', provider: 'openai', businessAppeared: false, competitorAppeared: false }, { prompt: 'B', provider: 'openai', businessAppeared: true, competitorAppeared: false }] });
    const diff = diffSnapshots(current, previous);
    expect(diff.promptMovements.gained).toEqual([{ provider: 'openai', prompt: 'B' }]);
    expect(diff.promptMovements.lost).toEqual([{ provider: 'openai', prompt: 'A' }]);
    expect(renderMovementCopy(diff).join('\n')).toContain('B');
  });

  it('3. prompt refresh exclusion treats refreshed prompts as newly tracked, not gain/loss', () => {
    const current = snapshot(2, { promptPlan: { prompts: ['new prompt'], version: 'fixture', refreshedPromptIds: ['openai::new prompt'] }, promptResults: [{ prompt: 'new prompt', provider: 'openai', businessAppeared: true, competitorAppeared: false }] });
    const diff = diffSnapshots(current, snapshot(1, { promptResults: [] }));
    expect(diff.promptMovements.gained).toEqual([]);
    expect(diff.promptMovements.newlyTracked).toEqual([{ provider: 'openai', prompt: 'new prompt' }]);
  });

  it('4. cancellation pauses the loop and clears next monthly run', () => {
    const patch = subscriptionMirrorPatchFromStripeEvent({ type: 'customer.subscription.deleted', data: { object: { id: 'sub_1', status: 'canceled', metadata: { leadId: 'lead-1' } } } });
    expect(patch?.pausedReason).toBe('subscription_canceled');
    expect(patch?.nextRunAt).toBeNull();
  });

  it('5. payment failure pauses the loop and prevents report generation', () => {
    const patch = subscriptionMirrorPatchFromStripeEvent({ type: 'invoice.payment_failed', data: { object: { subscription: { id: 'sub_1', metadata: { leadId: 'lead-1' } } } } });
    expect(patch?.pausedReason).toBe('payment_failed');
    expect(patch?.nextRunAt).toBeNull();
  });

  it('6. fix verification regression flags missing llms.txt, report mentions it, and drop contains repair artifacts only', async () => {
    const diff = diffSnapshots(snapshot(2, { readiness: { hasLlmsTxt: false, hasSchema: true, robotsAllowsAi: true } }), snapshot(1));
    const page = buildMonthlyOnePager({ businessName: 'QA Plumbing', diff, fixDropTitles: ['AI crawler access report'] });
    expect(page.movementLines.join('\n')).toContain('hasLlmsTxt');
    expect(verifyDeliveredFixManifest({ artifacts: [{ filename: 'llms.txt', content: '# llms', status: 'delivered' } as any], live: { hasLlmsTxt: false } }).regressions).toEqual(['llms.txt']);
    const seen: string[] = [];
    installDropMock(seen);
    const kit = await generateFixKit(fixKitInput());
    expect(kit.artifacts.length).toBeLessThanOrEqual(2);
    expect(seen).toEqual(['A5_FAQ']);
    setFixKitLLMForTests(null);
  });

  it('7. failed run fail-closed: failed snapshot, no client email, retry next tick once', () => {
    expect(evaluateMonthlyRunFailure(0)).toEqual({ snapshotStatus: 'failed', clientEmailAllowed: false, retryNextTick: true, pausedReason: undefined });
    expect(evaluateMonthlyRunFailure(1)).toMatchObject({ snapshotStatus: 'failed', clientEmailAllowed: false, retryNextTick: false, pausedReason: 'monthly_run_failed' });
  });

  it('8. profile-change block stops stale prompt monthly run', () => {
    expect(validateMonthlyProfileHash('profile-a', 'profile-b')).toEqual({ ok: false, reason: 'profile_hash_changed' });
    expect(validateMonthlyProfileHash('profile-a', 'profile-a')).toEqual({ ok: true });
  });

  it('9. trend copy honesty blocks unsupported narrative numbers', () => {
    const diff = diffSnapshots(snapshot(2), snapshot(1));
    const page = buildMonthlyOnePager({ businessName: 'QA Plumbing', diff, fixDropTitles: [] });
    expect(validateOnePagerNumbers(page, diff)).toEqual([]);
    expect(validateOnePagerNumbers({ ...page, nextFocus: 'We improved you by 999 points.' }, diff)).toContain('unsupported_number:999');
  });

  it('10. determinism: same snapshot pair produces byte-identical output', () => {
    expect(stableJson(diffSnapshots(snapshot(2), snapshot(1)))).toBe(stableJson(diffSnapshots(snapshot(2), snapshot(1))));
  });



  it('11. comparability guard re-baselines when platform prompt totals differ, withholding deltas', () => {
    const previous = snapshot(1, {
      platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 4, totalPrompts: 18, appearanceRate: 4 / 18, status: 'tested' }],
      blendedScore: 4 / 18,
    });
    const current = snapshot(2, {
      promptPlan: previous.promptPlan,
      platformScores: [{ provider: 'openai', label: 'ChatGPT', appearedCount: 12, totalPrompts: 54, appearanceRate: 12 / 54, status: 'tested' }],
      blendedScore: 12 / 54,
    });
    const diff = diffSnapshots(current, previous);
    const trend = buildMonthlyTrendModel([previous, current]);
    const page = buildMonthlyOnePager({ businessName: 'QA Plumbing 20260707042550', diff, fixDropTitles: [] });
    expect(diff.comparable).toBe(false);
    expect(diff.scoreDelta.blended.delta).toBeNull();
    expect(trend.hasComparison).toBe(false);
    expect(trend.baselineCopy).toContain('Re-baselined');
    expect(page.scoreLine).toContain('Re-baselined');
    expect(validateOnePagerNumbers(page, diff)).toEqual([]);
  });

  it('competitor movement approval is proposed only when trigger conditions exist', () => {
    const alert = buildCompetitorMovementAlert({ leadId: 'lead-1', businessName: 'QA Plumbing', diff: diffSnapshots(snapshot(1), snapshot(2)) });
    expect(alert?.triggers.length).toBeGreaterThan(0);
  });

  it('13. monthly subscription baseline ignores free pulse snapshots and fixture hashes', () => {
    const source = require('node:fs').readFileSync('src/app/api/cron/process-reruns/route.ts', 'utf8');
    expect(source).toContain("snapshot.tier === 'paid'");
    expect(source).toContain("snapshot.runType !== 'pulse'");
    expect(source).toContain('previousHashLooksReal');
    expect(source).toContain('/^[a-f0-9]{64}$/i.test(previousSnapshot.profileHash)');
  });
});
