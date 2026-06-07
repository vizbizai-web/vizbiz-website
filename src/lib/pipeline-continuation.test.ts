import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildPipelineBaseUrl } from './pipeline-url';

describe('pipeline continuation triggers', () => {
  it('uses custom production origin instead of VERCEL_URL for production self-calls', () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const previousVercelUrl = process.env.VERCEL_URL;
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = 'stale-preview.vercel.app';

    expect(buildPipelineBaseUrl('https://vizbiz.ai/api/pipeline/intake/')).toBe('https://vizbiz.ai');
    expect(buildPipelineBaseUrl('https://www.vizbiz.ai/api/pipeline/intake/')).toBe('https://www.vizbiz.ai');

    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousVercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = previousVercelUrl;
  });

  it('uses Next after hooks instead of fire-and-forget fetches between intake stages', () => {
    const intake = readFileSync('src/app/api/pipeline/intake/route.ts', 'utf8');
    const preflight = readFileSync('src/app/api/pipeline/preflight/route.ts', 'utf8');
    const research = readFileSync('src/app/api/pipeline/research/route.ts', 'utf8');

    expect(intake).toContain('after(async () =>');
    expect(intake).toContain('/api/pipeline/preflight/');
    expect(intake).not.toContain('preflight trigger failed (non-blocking)');

    expect(preflight).toContain('after(async () =>');
    expect(preflight).toContain('/api/pipeline/research/');
    expect(preflight).not.toContain('fetch(`${baseUrl}/api/pipeline/research`,');

    expect(research).toContain('after(async () =>');
    expect(research).toContain('/api/pipeline/review/');
  });
});
