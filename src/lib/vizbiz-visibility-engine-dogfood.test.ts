import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('VizBiz Visibility Engine dogfood todo', () => {
  it('tracks Bing, IndexNow, sitemap, and llms.txt as internal Visibility Engine tasks', () => {
    const page = readFileSync('src/app/mission-control/visibility-engine/page.tsx', 'utf8');
    expect(page).toContain('Bing Webmaster Tools verification');
    expect(page).toContain('IndexNow setup');
    expect(page).toContain('Submit VizBiz sitemap to Bing');
    expect(page).toContain('Broaden llms.txt positioning');
    expect(page).toContain('not leak as client-facing report warnings');
  });

  it('keeps llms.txt broad enough for local businesses, not dealership-only positioning', () => {
    const llms = readFileSync('public/llms.txt', 'utf8');
    expect(llms).toContain('local businesses');
    expect(llms).toContain('AI visibility');
    expect(llms).toContain('GEO / Generative Engine Optimization');
    expect(llms).toContain('VizBiz started with dealership-focused');
    expect(llms.split('\n').slice(0, 4).join('\n')).not.toContain('helps car dealerships');
  });
});
