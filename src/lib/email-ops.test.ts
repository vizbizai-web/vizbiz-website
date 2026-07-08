import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildDailyAutomationDigestText, buildEmailOpsSummary, templateClass, type EmailOpsEvent } from './email-ops';

const now = new Date('2026-07-20T12:00:00.000Z');
const event = (event_type: string, templateId: string, daysAgo: number, extra: Record<string, any> = {}): EmailOpsEvent => ({
  lead_id: extra.leadId || 'lead-1',
  event_type,
  created_at: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  event_payload: { templateId, ...extra },
});

describe('Email Ops panel model', () => {
  it('classifies delivery, nurture, lifecycle, and gated template classes without a chart dependency', () => {
    expect(templateClass('E2_FREE_REPORT_DELIVERY')).toBe('delivery');
    expect(templateClass('E3_NURTURE_ONE_FIX')).toBe('nurture');
    expect(templateClass('E8_PAID_INTAKE_REMINDER')).toBe('lifecycle');
    expect(templateClass('E11_30_DAY_RESCAN', 'gated_email_ready')).toBe('gated');
    expect(readFileSync('src/app/mission-control/email-ops/page.tsx', 'utf8')).not.toMatch(/chart\.js|recharts|victory|nivo/i);
  });

  it('builds top strip, daily alarm, funnel, positive purchase suppressions, and click-through lead rows from lead_events', () => {
    const summary = buildEmailOpsSummary([
      event('email_sent', 'E2_FREE_REPORT_DELIVERY', 1),
      event('email_sent', 'E3_NURTURE_ONE_FIX', 1),
      event('email_suppressed', 'E4_NURTURE_COMPETITOR_ANGLE', 1, { reason: 'purchase_stops_nurture' }),
      event('email_failed', 'E5_NURTURE_CLOSE_LOOP', 1, { reason: 'resend rejected recipient' }),
      event('email_scheduled', 'E5_NURTURE_CLOSE_LOOP', 2, { scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }),
      event('gated_email_ready', 'E11_30_DAY_RESCAN', 1),
      event('email_delivered', 'E2_FREE_REPORT_DELIVERY', 1),
      event('email_opened', 'E2_FREE_REPORT_DELIVERY', 1),
      event('email_clicked', 'E2_FREE_REPORT_DELIVERY', 1),
    ], [{ leadId: 'lead-1', dealershipName: 'QA Motors' }], now);
    expect(summary.health24h.sent).toBe(2);
    expect(summary.topStrip.sent.current).toBe(2);
    expect(summary.topStrip.failed.current).toBe(1);
    expect(summary.daily.some((day) => day.alarm)).toBe(true);
    expect(summary.funnel.e2).toBe(1);
    expect(summary.funnel.e3).toBe(1);
    expect(summary.funnel.suppressions.find((s) => s.between === 'E3→E4')?.purchase).toBe(1);
    expect(summary.pendingGatedCards).toBe(1);
    expect(summary.recentEvents[0].leadUrl).toBe('/mission-control/leads/lead-1');
  });

  it('skips the daily digest on zero-activity days and uses counts-first operator tone when active', () => {
    expect(buildDailyAutomationDigestText(buildEmailOpsSummary([], [], now))).toBeNull();
    const text = buildDailyAutomationDigestText(buildEmailOpsSummary([event('email_sent', 'E3_NURTURE_ONE_FIX', 0.1)], [], now));
    expect(text).toContain('Sent: 1');
    expect(text).toContain('E3_NURTURE_ONE_FIX: 1');
    expect(text).toContain('Open Email Ops');
  });
});
