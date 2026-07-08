import { describe, expect, it } from 'vitest';
import { buildNeedsYouQueue } from './mission-control-needs-you';
import { appendClientZeroFixtureSnapshot, buildFixtureResearchResult, clientZeroLeadPayload, ensureSampleClientZeroFixDrop, isOperatorMetricExcludedSource } from './client-zero';
import { diffSnapshots } from './snapshot-diff';
import { stableProfileForMonthlyHash, type AuditSnapshot } from './audit-snapshots';

function snapshot(sequence: number, runType: AuditSnapshot['runType'], tier: AuditSnapshot['tier'], appeared: number, total = tier === 'free' ? 15 : 180): AuditSnapshot {
  const result = buildFixtureResearchResult(total, appeared);
  return {
    leadId: 'client-zero', sequence, runType, tier, createdAt: `2026-0${sequence}-01T00:00:00.000Z`, profileHash: 'client-zero-profile-v1',
    promptPlan: { prompts: result.promptPlanMetadata.prompts, version: result.promptPlanMetadata.version, hash: result.promptPlanMetadata.hash, batteryVersion: result.batteryVersion },
    platformScores: result.platformScores, blendedScore: appeared / total, band: result.statusBand, promptResults: result.promptResults, competitorScores: [{ name: 'Otterly', appearedCount: 12, totalPrompts: total, appearanceRate: 12 / total }], readiness: { hasLlmsTxt: true }, costEstimate: tier === 'free' ? 0.05 : 0.75, status: 'complete', source: 'client_zero',
  };
}

describe('Client Zero spec fixtures', () => {
  it('1. permanent lead resolves to the declared AI visibility service profile', () => {
    const lead = clientZeroLeadPayload(new Date('2026-07-07T12:00:00Z'));
    expect(lead.dealershipName).toBe('VizBiz');
    expect(lead.website).toBe('https://vizbiz.ai');
    expect(lead.city).toBe('Ontario, Canada');
    expect(lead.source).toBe('client_zero');
    expect(lead.notes).toContain('AI visibility service for local businesses');
    expect(lead.competitor).toContain('Otterly');
    expect(lead.competitor).toContain('Peec');
  });

  it('2. pulse is free-tier and monthly diff excludes mixed-depth pulse snapshots', () => {
    const baseline = snapshot(1, 'baseline', 'paid', 24, 180);
    const pulse = snapshot(2, 'pulse', 'free', 3, 15);
    const monthly = snapshot(3, 'monthly', 'paid', 31, 180);
    expect(pulse.runType).toBe('pulse');
    expect(pulse.tier).toBe('free');
    expect(diffSnapshots(monthly, pulse).comparable).toBe(false);
    expect(diffSnapshots(monthly, baseline).comparable).toBe(true);
  });

  it('3. dashboard chart blocks can be built from snapshot fields with tier labels', () => {
    const points = [snapshot(1, 'baseline', 'paid', 24), snapshot(2, 'pulse', 'free', 3, 15)].map((s) => ({ tier: s.tier, runType: s.runType, score: Math.round((s.blendedScore || 0) * 100) }));
    expect(points).toEqual([{ tier: 'paid', runType: 'baseline', score: 13 }, { tier: 'free', runType: 'pulse', score: 20 }]);
  });

  it('4. Client Zero Fix Drop appears as a Needs-You item', () => {
    const lead = { ...clientZeroLeadPayload(), leadId: 'client-zero', status: 'approved' as const, notes: `${clientZeroLeadPayload().notes}\n[CLIENT_ZERO_FIX_DROP_READY 2026-07-07T12:00:00Z]\n[monthly_one_pager awaiting approve]` };
    const item = buildNeedsYouQueue([lead])[0];
    expect(item.primaryAction).toBe('approve_monthly');
    expect(item.badges.map((b) => b.label)).toEqual(expect.arrayContaining(['Client Zero', 'Client Zero fix ready']));
  });

  it('5. public proof page remains gated until monthly one-pager approval', () => {
    const unapproved = clientZeroLeadPayload();
    const approved = { ...unapproved, notes: `${unapproved.notes}\n[MONTHLY_ONE_PAGER_APPROVED 2026-07-07T12:00:00Z]` };
    expect(unapproved.notes).not.toContain('MONTHLY_ONE_PAGER_APPROVED');
    expect(approved.notes).toContain('MONTHLY_ONE_PAGER_APPROVED');
  });

  it('6. metrics hygiene excludes client_zero and qa_ sources from operator metrics', () => {
    expect(isOperatorMetricExcludedSource('client_zero')).toBe(true);
    expect(isOperatorMetricExcludedSource('qa_paid_intake')).toBe(true);
    expect(isOperatorMetricExcludedSource('snapshot funnel')).toBe(false);
  });

  it('7. stable monthly profile keeps specific service-shaped niches instead of degrading to a generic label', () => {
    const clientZeroProfile = stableProfileForMonthlyHash({
      niche: 'local_business',
      nicheLabel: 'Local Business',
      businessType: 'AI visibility reports for local businesses',
      services: ['AI visibility reports', 'monthly AI visibility monitoring'],
      primaryMarket: 'Ontario, Canada',
      searchLanguage: 'English',
      nicheResolution: { businessNiche: { value: 'AI visibility reports for local businesses' } },
    }) as any;
    expect(clientZeroProfile.niche).toBe('AI visibility reports for local businesses');
    expect(clientZeroProfile.nicheLabel).toBe('AI visibility reports for local businesses');
    expect(clientZeroProfile.businessType).toBe('AI visibility reports for local businesses');

    const ordinaryClientProfile = stableProfileForMonthlyHash({
      niche: 'local_business',
      nicheLabel: 'Local Business',
      businessType: 'tenant rights legal intake software',
      services: ['case intake automation', 'legal lead qualification'],
      primaryMarket: 'New York, NY',
      businessNiche: { value: 'tenant rights legal intake software' },
    }) as any;
    expect(ordinaryClientProfile.niche).toBe('tenant rights legal intake software');
    expect(ordinaryClientProfile.nicheLabel).toBe('tenant rights legal intake software');
    expect(ordinaryClientProfile.businessType).toBe('tenant rights legal intake software');
    expect(clientZeroProfile.services).toEqual([]);
  });

  it('8. full v2 fixture keeps stable executed platform totals twice', () => {
    const a = buildFixtureResearchResult(180, 27);
    const b = buildFixtureResearchResult(180, 31);
    expect(a.platformScores.map((p) => p.totalPrompts)).toEqual([60, 60, 60]);
    expect(b.platformScores.map((p) => p.totalPrompts)).toEqual([60, 60, 60]);
    expect(a.promptResults).toHaveLength(180);
    expect(b.promptResults).toHaveLength(180);
  });
});
