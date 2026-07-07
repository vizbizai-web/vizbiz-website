import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildMissionControlNicheResolution } from './niche-resolution-actions';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Mission Control Step 3 niche parity', () => {
  it('builds Mission Control niche resolution markers compatible with pipeline override detection', () => {
    const declared = buildMissionControlNicheResolution({
      leadId: 'lead-1',
      action: 'use_submitted',
      submittedNiche: 'plumbing contractor',
      websiteNiche: 'drain cleaning company',
    });
    expect(declared.noteLine).toContain('ClientBusinessCategory: plumbing contractor');
    expect(declared.noteLine).toContain('Source: mission_control_use_submitted');
    expect(declared.rerunReason).toContain('use declared service');

    const website = buildMissionControlNicheResolution({
      leadId: 'lead-1',
      action: 'use_website',
      submittedNiche: 'med spa',
      websiteNiche: 'restaurant',
    });
    expect(website.noteLine).toContain('ClientBusinessCategory: restaurant');
    expect(website.noteLine).toContain('Source: mission_control_use_website');
    expect(website.rerunReason).toContain('use website evidence');

    const custom = buildMissionControlNicheResolution({ leadId: 'lead-1', action: 'custom', customNiche: 'professional audio supplier' });
    expect(custom.noteLine).toContain('ClientBusinessCategory: professional audio supplier');
    expect(custom.noteLine).toContain('Source: mission_control_custom');
  });

  it('renders the Niche Resolution panel and uses the same lead action route for declared / website / custom choices', () => {
    const page = read('src/app/mission-control/leads/[leadId]/page.tsx');
    const actions = read('src/app/api/lead-actions/route.ts');

    expect(page).toContain('Niche Resolution');
    expect(page).toContain('Submitted service / declared');
    expect(page).toContain('Website-inferred type');
    expect(page).toContain('Verified evidence quotes');
    expect(page).toContain("handleAction('resolve_niche'");
    expect(page).toContain("onResolve('use_submitted')");
    expect(page).toContain("onResolve('use_website')");
    expect(page).toContain("onResolve('custom')");

    expect(actions).toContain('case "resolve_niche"');
    expect(actions).toContain('buildMissionControlNicheResolution');
    expect(actions).toContain('niche_resolution_${resolution.action}');
    expect(actions).toContain('revisionReason: resolution.rerunReason');
  });
});
