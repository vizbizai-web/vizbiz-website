import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const repoFile = (path: string) => readFileSync(path, 'utf8');

describe('Mission Control production integrity', () => {
  it('does not publicly exempt Mission Control data/action APIs from auth middleware', () => {
    const middleware = repoFile('src/middleware.ts');

    expect(middleware).toContain("pathname === '/mission-control/api/auth'");
    expect(middleware).toContain("pathname === '/mission-control/api/logout'");
    expect(middleware).toContain('Data/action APIs under /mission-control/api must stay protected');
    expect(middleware).not.toContain("request.nextUrl.pathname.startsWith('/mission-control/api')");
  });

  it('does not serve stubbed pipeline data from the Mission Control API', () => {
    const route = repoFile('src/app/mission-control/api/pipeline-status/route.ts');

    expect(route).toContain('@/lib/google-sheets');
    expect(route).toContain('getAllLeads');
    expect(route).not.toContain('TODO: Replace with real CRM integration');
    expect(route).not.toContain('pipeline: {}');
    expect(route).not.toContain('leads: []');
  });

  it('does not keep stale demo mission/agent database artifacts inside production MC', () => {
    const staleFiles = [
      'src/app/mission-control/lib/db.ts',
      'src/app/mission-control/data/init.sql',
      'src/app/mission-control/components/CommandCenter.tsx',
      'src/app/mission-control/lib/file-data.ts',
      'src/app/mission-control/lib/hubspot-leads.ts',
      'src/app/mission-control/SPEC-COMMAND-CENTER.md',
    ];

    for (const file of staleFiles) {
      expect(existsSync(file), `${file} should be removed from production MC`).toBe(false);
    }
  });

  it('does not preserve OpenClaw/Vlad/generic demo phrases in Mission Control source', () => {
    const files = [
      'src/app/mission-control/README.md',
      'src/app/mission-control/page.tsx',
      'src/app/mission-control/calendar/page.tsx',
      'src/app/mission-control/activity/page.tsx',
      'src/app/mission-control/activity/ActivityFeed.tsx',
      'src/app/mission-control/components/Sidebar.tsx',
      'src/app/mission-control/components/MCShell.tsx',
      'src/app/mission-control/components/QuickActions.tsx',
      'src/app/mission-control/api/lead-actions/route.ts',
      'src/app/mission-control/api/email-drafts/route.ts',
      'src/app/mission-control/api/pipeline-status/route.ts',
      'src/app/mission-control/api/attention-feed/route.ts',
      'src/app/mission-control/api/cron-status/route.ts',
    ];

    const combined = files
      .filter(existsSync)
      .map((file) => repoFile(file))
      .join('\n');

    const staleTerms = [
      'OpenClaw',
      'openclaw',
      'Auto Transport Brokerage MVP',
      'Client Portal v1.0',
      'Agent Roster',
      'KanbanBoard',
      'ScheduleView',
      'architect agent',
      'assignee: \'vlad\'',
      'VLAD_HQ_GROUP',
      'Forge',
      'Reko',
      'Pulse',
      'Gekko',
      'Dogfood Audit',
      'TODO: Replace with real cron status integration',
    ];

    for (const term of staleTerms) {
      expect(combined).not.toContain(term);
    }
  });

  it('keeps the homepage industry ticker visible as a broad local-business signal', () => {
    const home = repoFile('src/app/HomeContent.tsx');
    const css = repoFile('src/app/globals.css');

    expect(home).toContain('industryTickerItems');
    expect(home).toContain('IndustryMarquee');
    expect(home).toContain('Built for the businesses people ask AI to recommend');
    expect(home).toContain('Auto dealers');
    expect(home).toContain('Dental clinics');
    expect(home).toContain('Med spas');
    expect(home).toContain('HVAC companies');
    expect(home).toContain('Plumbers');
    expect(css).toContain('industryMarquee');
    expect(css).toContain('industry-marquee-track');
  });

  it('uses neutral operator-review routing instead of legacy Vlad review naming', () => {
    const leadActions = repoFile('src/app/api/lead-actions/route.ts');
    const operatorReview = repoFile('src/app/api/operator-review/route.ts');

    expect(existsSync('src/app/api/vlad-review/route.ts')).toBe(false);
    expect(leadActions).toContain('/api/operator-review');
    expect(leadActions).not.toContain('/api/vlad-review');
    expect(operatorReview).toContain('Operator Review Endpoint');
    expect(operatorReview).not.toContain('Vlad Review Endpoint');
    expect(operatorReview).not.toContain('VLAD_HOLD');
    expect(operatorReview).not.toContain('VLAD_RERUN');
    expect(operatorReview).not.toContain('[vlad-review]');
  });

  it('alerts Alex when a Mission Control report is marked needs-fix', () => {
    const leadActions = repoFile('src/app/api/lead-actions/route.ts');

    expect(leadActions).toContain('sendPipelineAlert');
    expect(leadActions).toContain('Needs fix —');
    expect(leadActions).toContain('Needs fix + rerun started');
    expect(leadActions).toContain('autoRerun');
    expect(leadActions).toContain('revisionReason: reason');
    expect(leadActions).toContain('Mission Control: https://vizbiz.ai/mission-control/leads/${leadId}');
    expect(leadActions).toContain('[NEEDS_REVISION ${reportType.toUpperCase()}');
  });

  it('keeps Mission Control action buttons wired for approve/send, rerun, needs-fix, do-not-send, and revision recovery', () => {
    const leadActions = repoFile('src/app/api/lead-actions/route.ts');
    const leadDetail = repoFile('src/app/mission-control/leads/[leadId]/page.tsx');
    const pipelinePage = repoFile('src/app/mission-control/leads/page.tsx');

    expect(leadActions).toContain('APPROVED_FOR_FREE_SEND');
    expect(leadActions).toContain('/api/send-report-email');
    expect(leadActions).toContain('/api/pipeline/process');
    expect(leadActions).toContain('Research rerun started');
    expect(leadActions).toContain('Do not send —');
    expect(leadActions).toContain('Report held —');
    expect(leadDetail).toContain("leadStatus === 'needs_revision'");
    expect(leadDetail).toContain('canRecoverRevision');
    expect(leadDetail).toContain('Needs revision fix requested from Mission Control');
    expect(leadDetail).toContain('autoRerun: true');
    expect(pipelinePage).toContain('approve_and_send');
    expect(pipelinePage).toContain('Needs Fix');
    expect(pipelinePage).toContain('autoRerun: true');
    expect(pipelinePage).toContain("payload?.success === false");
    expect(pipelinePage).toContain('Paid Intake');
    expect(pipelinePage).not.toContain("'draft_email'");
    expect(pipelinePage).not.toContain("'approve_email'");
    expect(pipelinePage).not.toContain("'follow_up'");
  });

  it('keeps professional-audio niche extraction available and fills evidence-first fallbacks', () => {
    const preflight = repoFile('src/lib/preflight-engine.ts');

    expect(preflight).toContain('pro_audio_systems');
    expect(preflight).toContain('Do not force a finite taxonomy category.');
    expect(preflight).toContain("niche === 'pro_audio_systems'");
    expect(preflight).toContain('audio professionals, venues, installers');
    expect(preflight).toContain('Supplies and supports professional audio, AV');
    expect(preflight).toContain('if (!targetAudience && businessType)');
    expect(preflight).toContain('if (!valueProposition && businessType)');
  });

  it('uses honest unavailable state for unwired MC task/cron integrations', () => {
    const route = repoFile('src/app/mission-control/api/cron-status/route.ts');

    expect(route).toContain("status: 'unavailable'");
    expect(route).toContain('missingIntegration');
    expect(route).not.toContain('Dogfood Audit');
    expect(route).not.toContain('TODO');
  });
});
