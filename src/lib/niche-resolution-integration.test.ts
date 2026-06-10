import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('resolveNiche pipeline integration', () => {
  it('routes preflight through isolated resolveNiche and blocks conflict/insufficient states before research', () => {
    const preflight = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    const pipeline = readFileSync('src/lib/pipeline-controller.ts', 'utf8');

    expect(preflight).toContain('import { resolveNiche, type NicheResult } from "./niche-resolution"');
    expect(preflight).toContain('const resolvedNiche = await resolveNiche({');
    expect(preflight).toContain('submittedPrimaryService: diagnosticContext.submittedPrimaryService || null');
    expect(preflight).toContain("diagnosticContext.competitors");
    expect(preflight).not.toContain('competitors: diagnosticContext.competitors || []\n    crawl');
    expect(preflight).toContain("resolvedNiche.status === 'CONFLICT'");
    expect(preflight).toContain("resolvedNiche.status === 'blocked_insufficient_evidence'");
    expect(preflight).toContain('nicheResolution: resolvedNiche');
    expect(preflight).toContain('profileHash: resolvedNiche.profileHash');

    expect(pipeline).toContain('onNicheBlocked: async (resolved) =>');
    expect(pipeline).toContain('sendNicheResolutionAlertTelegram({');
    expect(pipeline).toContain('nicheResolution: (preflightResult as any).nicheResolution || null');
    expect(pipeline).toContain('profileHash: (preflightResult as any).profileHash || null');
  });
});
