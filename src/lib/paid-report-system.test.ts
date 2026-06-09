import { describe, expect, it } from 'vitest';
import { assertClientSafeCopy } from './client-copy-qa';
import {
  mopWringersPaidReportDemo,
  paidReportReadinessSummary,
  validatePaidReportForClient,
} from './paid-report-system';

describe('paid report system', () => {
  it('models Mop Wringers as a commercial cleaning service with service-area framing', () => {
    expect(mopWringersPaidReportDemo.businessName).toBe('Mop Wringers');
    expect(mopWringersPaidReportDemo.category).toMatch(/commercial cleaning/i);
    expect(mopWringersPaidReportDemo.primaryMarket).toMatch(/Rockwall County/i);
    expect(mopWringersPaidReportDemo.serviceAreaMap).toEqual(
      expect.arrayContaining(['Rockwall County', 'Rockwall', 'Heath', 'Fate', 'Rowlett', 'Garland', 'Mesquite'])
    );
  });

  it('contains the minimum paid deliverable modules', () => {
    const summary = paidReportReadinessSummary(mopWringersPaidReportDemo);
    expect(mopWringersPaidReportDemo.findings.length).toBeGreaterThanOrEqual(5);
    expect(mopWringersPaidReportDemo.assets.length).toBeGreaterThanOrEqual(4);
    expect(mopWringersPaidReportDemo.tracker.length).toBeGreaterThanOrEqual(5);
    expect(summary.highImpactFindings).toBeGreaterThanOrEqual(3);
    expect(summary.readyAssets).toBeGreaterThanOrEqual(4);
  });

  it('keeps unconfirmed competitors out of client scoring', () => {
    const blockers = validatePaidReportForClient(mopWringersPaidReportDemo);
    expect(blockers.join(' ')).toMatch(/two named local competitors are still needed/i);
    expect(mopWringersPaidReportDemo.competitors.every((competitor) => competitor.status === 'needed')).toBe(true);
  });

  it('keeps visible practice report copy client-safe', () => {
    const visibleCopy = JSON.stringify({
      executiveSummary: mopWringersPaidReportDemo.executiveSummary,
      ownerTranslation: mopWringersPaidReportDemo.ownerTranslation,
      metrics: mopWringersPaidReportDemo.metrics,
      findings: mopWringersPaidReportDemo.findings,
      assets: mopWringersPaidReportDemo.assets,
      tracker: mopWringersPaidReportDemo.tracker,
      verificationPlan: mopWringersPaidReportDemo.verificationPlan,
      monthlyPlan: mopWringersPaidReportDemo.monthlyPlan,
    });

    const result = assertClientSafeCopy(visibleCopy, 'Mop Wringers paid report practice copy');
    expect(result.ok).toBe(true);
  });
});
