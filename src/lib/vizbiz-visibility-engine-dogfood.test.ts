import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('VizBiz Visibility Engine dogfood todo', () => {
  it('tracks Bing, IndexNow, sitemap, and llms.txt as internal Visibility Engine tasks', () => {
    const page = readFileSync('src/app/mission-control/visibility-engine/page.tsx', 'utf8');
    expect(page).toContain('Bing Webmaster Tools verification');
    expect(page).toContain('IndexNow setup');
    expect(page).toContain('Submit VizBiz sitemap to Bing');
    expect(page).toContain('Broaden llms.txt positioning');
    expect(page).toContain('not leak as client-facing report warnings');
    expect(page).toContain('Weekly VizBiz Own Visibility Scorecard');
    expect(page).toContain('AI assistant prompts');
    expect(page).toContain('/ai-visibility-for-med-spas/');
  });

  it('keeps llms.txt broad enough for local businesses, not dealership-only positioning', () => {
    const llms = readFileSync('public/llms.txt', 'utf8');
    expect(llms).toContain('local businesses');
    expect(llms).toContain('AI visibility');
    expect(llms).toContain('GEO / Generative Engine Optimization');
    expect(llms).toContain('VizBiz started with dealership-focused');
    expect(llms.split('\n').slice(0, 4).join('\n')).not.toContain('helps car dealerships');
  });

  it('keeps a non-automotive AI visibility vertical page discoverable', () => {
    expect(existsSync('src/app/ai-visibility-for-med-spas/page.tsx')).toBe(true);
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf8');
    const llms = readFileSync('public/llms.txt', 'utf8');
    const page = readFileSync('src/app/ai-visibility-for-med-spas/page.tsx', 'utf8');

    expect(sitemap).toContain('/ai-visibility-for-med-spas/');
    expect(llms).toContain('AI Visibility for Med Spas');
    expect(page).toContain('Become the med spa AI recommends');
    expect(page).toContain('FAQPage');
    expect(page).toContain('Service');
  });
});
