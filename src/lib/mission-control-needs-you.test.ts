import { describe, expect, it } from 'vitest';
import { buildMcHealthStrip, buildNeedsYouQueue, type PipelineLead } from './mission-control-needs-you';

function lead(overrides: Partial<PipelineLead>): PipelineLead {
  return {
    timestamp: '2026-07-01T10:00:00.000Z',
    dealershipName: 'Test Business',
    website: 'https://example.com',
    city: 'Toronto',
    contactName: 'Alex',
    email: 'alex@example.com',
    phone: '',
    competitor: '',
    snapshotAppeared: '',
    visibilityBand: '',
    serviceVisibility: '',
    status: 'pending_review',
    researchStatus: 'complete',
    emailSentAt: '',
    notes: '',
    source: 'snapshot funnel',
    leadId: 'lead-1',
    lockOwner: '',
    lockExpiresAt: '',
    retryCount: 0,
    lastStage: '',
    lastError: '',
    preflightStartedAt: '',
    preflightCompletedAt: '',
    researchStartedAt: '',
    researchCompletedAt: '',
    reportGeneratedAt: '',
    reportUrl: '',
    competitorMode: '',
    clientProvidedCompetitors: '',
    internalCompetitorSuggestions: '',
    placesValidationStatus: '',
    sonarValidationStatus: '',
    ...overrides,
  };
}

describe('Mission Control Needs-You queue', () => {
  it('orders paid before subscriber before free and free reviews oldest-first inside tier', () => {
    const queue = buildNeedsYouQueue([
      lead({ leadId: 'free-newer', dealershipName: 'Free Newer', timestamp: '2026-07-03T10:00:00.000Z', status: 'pending_review' }),
      lead({ leadId: 'paid', dealershipName: 'Paid', timestamp: '2026-07-04T10:00:00.000Z', status: 'paid_report_ready_for_review' }),
      lead({ leadId: 'free-older', dealershipName: 'Free Older', timestamp: '2026-07-01T10:00:00.000Z', status: 'pending_review' }),
      lead({ leadId: 'subscriber', dealershipName: 'Subscriber', timestamp: '2026-07-02T10:00:00.000Z', status: 'approved', notes: '[monthly_one_pager awaiting approve]' }),
    ], new Date('2026-07-05T10:00:00.000Z'));

    expect(queue.map((item) => item.leadId)).toEqual(['paid', 'subscriber', 'free-older', 'free-newer']);
    expect(queue[2].nextLeadId).toBe('free-newer');
  });

  it('adds backlog quality badges for regional Places gaps and language issues', () => {
    const queue = buildNeedsYouQueue([
      lead({
        leadId: 'flagged',
        placesValidationStatus: 'low confidence regional Places mismatch',
        notes: 'RESEARCH_DATA:' + JSON.stringify({ warnings: ['language/locale mismatch: Spanish copy detected'] }),
      }),
    ]);

    expect(queue[0].badges.map((badge) => badge.label)).toEqual(expect.arrayContaining(['Places gap', 'Language check']));
  });

  it('adds paid_intake_pending to Needs-You after 24h and allows profile-only fulfillment after 72h', () => {
    const queue = buildNeedsYouQueue([
      lead({
        leadId: 'pending-24h',
        status: 'paid_intake_pending',
        notes: '[PAYMENT_CONFIRMED 2026-07-04T10:00:00.000Z] tier=fix; paid intake pending',
      }),
      lead({
        leadId: 'pending-72h',
        status: 'paid_intake_pending',
        notes: '[PAYMENT_CONFIRMED 2026-07-01T10:00:00.000Z] tier=fix; paid intake pending',
      }),
    ], new Date('2026-07-05T12:00:00.000Z'));

    expect(queue.find((item) => item.leadId === 'pending-24h')?.primaryAction).toBe('complete_paid_intake');
    expect(queue.find((item) => item.leadId === 'pending-72h')?.primaryAction).toBe('fulfill_paid_from_profile');
    expect(queue.find((item) => item.leadId === 'pending-72h')?.badges.map((badge) => badge.label)).toContain('72h fallback allowed');
  });

  it('builds the health strip with provider dots, spend estimate, pipeline counts, and deployed SHA', () => {
    const notes = 'RESEARCH_DATA:' + JSON.stringify({
      platformScores: [
        { provider: 'openai', totalPrompts: 60 },
        { provider: 'gemini', totalPrompts: 60 },
        { provider: 'perplexity', totalPrompts: 60 },
      ],
      costEstimate: { free: 0.2, paid: 0.75 },
    });
    const health = buildMcHealthStrip([
      lead({ leadId: 'today', timestamp: '2026-07-07T11:00:00.000Z', status: 'pending_review', notes }),
      lead({ leadId: 'failed', timestamp: '2026-07-07T12:00:00.000Z', status: 'research_failed' }),
    ], { now: new Date('2026-07-07T13:00:00.000Z'), deployedSha: 'abcdef123456' });

    expect(health.today).toEqual({ leadsIn: 2, completed: 0, failed: 1 });
    expect(health.providerStatus.map((p) => p.ok)).toEqual([true, true, true]);
    expect(health.spendEstimateTodayUsd).toBeGreaterThan(0);
    expect(health.deployedSha).toBe('abcdef123456');
    expect(health.pipelineFlow.find((stage) => stage.status === 'pending_review')?.count).toBe(1);
  });
});
