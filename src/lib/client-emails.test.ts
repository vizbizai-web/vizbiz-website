import { describe, expect, it } from 'vitest';
import { renderClientEmail, shouldSuppressClientEmail, firstNameForGreeting } from './client-emails';

const base = {
  business: 'LexHive',
  firstName: 'Jordan Patel',
  city: 'Toronto',
  reportUrl: 'https://vizbiz.ai/report/lexhive/full',
  fixkitUrl: 'https://vizbiz.ai/api/fix-kits/lexhive/download',
  intakeUrl: 'https://vizbiz.ai/paid-intake/lexhive',
  upgradeUrl: 'https://vizbiz.ai/pricing?lead=lexhive',
  billingPortalUrl: 'https://billing.stripe.com/session/test',
  mailingAddress: 'VizBiz.ai',
};

const renderCases = [
  ['E1_INTAKE_CONFIRMATION', {}],
  ['E2_FREE_REPORT_DELIVERY', { appearedX: 3, totalN: 10 }],
  ['E3_NURTURE_ONE_FIX', { fixCount: 4, topFixPlain: 'Your site is missing structured data that confirms the services LexHive offers.' }],
  ['E4_NURTURE_COMPETITOR_ANGLE', { findingPrompt: 'best legal intake service in Toronto', rival: 'BridgeLegal' }],
  ['E4_NURTURE_COMPETITOR_ANGLE', { findingPrompt: 'best legal intake service in Toronto', rival: '' }],
  ['E5_NURTURE_CLOSE_LOOP', {}],
  ['E7_PAYMENT_RECEIVED_NEXT_STEP', {}],
  ['E8_PAID_INTAKE_REMINDER', {}],
  ['E9_PAID_REPORT_FIX_KIT_DELIVERY', { appearedX: 18, totalN: 180, fixkitCount: 6 }],
  ['E10_IMPLEMENTATION_CHECK_IN', {}],
  ['E11_30_DAY_RESCAN', { beforeX: 4, afterX: 11, competitor1: 'BridgeLegal', competitor2: 'Broughton Partners', monthBefore: 'June' }],
  ['E11_30_DAY_RESCAN', { beforeX: 4, afterX: 4, flatReasonLine: 'Our scan shows the Fix Kit files are not installed yet.' }],
  ['E12_PAYMENT_FAILED', { pauseDate: 'July 15' }],
  ['E13_CANCELLATION_ACKNOWLEDGMENT', {}],
] as const;

describe('client email suite v1', () => {
  it.each(renderCases)('renders %s with no unresolved merge fields or blocked internal language', (templateId, extra) => {
    const rendered = renderClientEmail(templateId as any, { ...base, ...extra });
    const combined = `${rendered.subject}\n${rendered.text}\n${rendered.html}`;
    expect(combined).not.toMatch(/\{[a-zA-Z0-9_\-]+\}/);
    expect(combined).not.toContain('!');
    for (const blocked of ['manual review', 'operator approval', 'auto-discovered competitors', 'internal only', 'the client named']) {
      expect(combined.toLowerCase()).not.toContain(blocked);
    }
  });

  it('uses the VizBiz greeting guard instead of greeting a business as a person', () => {
    expect(firstNameForGreeting({ business: 'Mop Wringers', contactName: 'Mop Wringers' })).toBe('');
    expect(renderClientEmail('E2_FREE_REPORT_DELIVERY', { ...base, business: 'Mop Wringers', contactName: 'Mop Wringers', appearedX: 1, totalN: 5 }).text).not.toContain('Hi Mop');
  });

  it('enforces numeric merge fields from pipeline data before rendering', () => {
    expect(() => renderClientEmail('E2_FREE_REPORT_DELIVERY', { ...base })).toThrow(/appeared_x/);
    expect(() => renderClientEmail('E9_PAID_REPORT_FIX_KIT_DELIVERY', { ...base, appearedX: 3, totalN: 180 })).toThrow(/fixkit_count/);
  });

  it('applies v1 suppression rules at send time', () => {
    expect(shouldSuppressClientEmail({ emailClass: 'commercial', optedOutCommercial: true }).reason).toBe('commercial_opt_out');
    expect(shouldSuppressClientEmail({ emailClass: 'commercial', purchased: true, sequenceTemplateId: 'E4_NURTURE_COMPETITOR_ANGLE' }).reason).toBe('purchase_stops_nurture');
    expect(shouldSuppressClientEmail({ emailClass: 'transactional', optedOutCommercial: true }).suppressed).toBe(false);
    expect(shouldSuppressClientEmail({ emailClass: 'transactional', leadStatus: 'do_not_send' }).reason).toBe('do_not_send');
  });
});
