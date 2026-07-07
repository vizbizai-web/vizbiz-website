import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildE11Context, parseEmailSuiteState } from './email-suite-automation';
import type { LeadRow } from './google-sheets';

function read(path: string) { return readFileSync(path, 'utf8'); }

const lead = {
  leadId: 'lead-qa', dealershipName: 'QA Roofing', contactName: 'QA', email: 'qa@example.com', city: 'Austin',
  timestamp: new Date().toISOString(), website: 'https://example.com', phone: '', competitor: 'Rival One, Rival Two',
  snapshotAppeared: '11 of 180 prompts', visibilityBand: 'Moderate', serviceVisibility: '', status: 'rerun_completed', researchStatus: 'complete',
  emailSentAt: '', notes: '', source: 'qa', lockOwner: '', lockExpiresAt: '', retryCount: 0, lastStage: '', lastError: '',
  preflightStartedAt: '', preflightCompletedAt: '', researchStartedAt: '', researchCompletedAt: '', reportGeneratedAt: '', reportUrl: '',
  competitorMode: 'client_provided', clientProvidedCompetitors: 'Rival One, Rival Two', internalCompetitorSuggestions: '', placesValidationStatus: '', sonarValidationStatus: '',
} satisfies LeadRow;

describe('email suite automation layer', () => {
  it('maps suppression state from lead notes at send time', () => {
    expect(parseEmailSuiteState('[PAYMENT_CONFIRMED 2026-07-01] reply no thanks')).toMatchObject({ purchased: true, optedOutCommercial: true });
    expect(parseEmailSuiteState('[FIX_VERIFICATION_INSTALLED] llms.txt present')).toMatchObject({ fixVerifiedInstalled: true });
  });

  it('builds E11 gated context from rescan data without invented competitor names', () => {
    const ctx = buildE11Context(lead, { beforeX: 4, afterX: 11 });
    expect(ctx.beforeX).toBe(4);
    expect(ctx.afterX).toBe(11);
    expect(ctx.competitor1).toBe('Rival One');
    expect(ctx.competitor2).toBe('Rival Two');
  });

  it('wires all required trigger surfaces and gated approval routes', () => {
    expect(read('src/app/api/pipeline/intake/route.ts')).toContain('sendIntakeConfirmation');
    expect(read('src/app/api/send-report-email/route.ts')).toContain('scheduleNurtureAfterE2');
    expect(read('src/app/api/cron/email-suite/route.ts')).toContain('runEmailSuiteAutomation');
    expect(read('src/app/api/stripe-webhook/route.ts')).toContain('E12_PAYMENT_FAILED');
    expect(read('src/app/api/stripe-webhook/route.ts')).toContain('E13_CANCELLATION_ACKNOWLEDGMENT');
    expect(read('src/app/api/cron/process-reruns/route.ts')).toContain('createE11GatedCard');
    expect(read('src/app/api/lead-actions/route.ts')).toContain('approve_gated_email');
    expect(read('src/lib/mission-control-needs-you.ts')).toContain('Approve 30-day re-test email');
  });

  it('keeps Mission Control prompt diagnostics labeled by engine and category', () => {
    const page = read('src/app/mission-control/leads/[leadId]/page.tsx');
    expect(page).toContain('engineLabel(pr.provider)');
    expect(page).toContain('pr.categoryId');
    expect(page).toContain('Diagnostics Timeline');
    expect(read('src/app/mission-control/api/lead-events/[leadId]/route.ts')).toContain('/lead_events?select=');
  });

  it('records E10 install-detected skips instead of silently doing nothing', () => {
    const source = read('src/lib/email-suite-automation.ts');
    expect(source).toContain("'email_skipped'");
    expect(source).toContain('fix_verification_installed');
    expect(source).toContain("eventType: 'email_skipped'");
    expect(source).toContain("templateId: 'E10_IMPLEMENTATION_CHECK_IN'");
  });
});
