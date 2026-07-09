import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('private report noindex safety', () => {
  it('keeps tokenized reports out of robots, headers, and sitemap', () => {
    const reportPage = readFileSync('src/app/report/[leadId]/page.tsx', 'utf8');
    const fullReportPage = readFileSync('src/app/report/[leadId]/full/page.tsx', 'utf8');
    const nextConfig = readFileSync('next.config.ts', 'utf8');
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf8');

    expect(reportPage).toContain('robots: { index: false, follow: false }');
    expect(fullReportPage).toContain('robots: { index: false, follow: false }');
    expect(nextConfig).toContain("source: '/report/:path*'");
    expect(nextConfig).toContain("X-Robots-Tag");
    expect(nextConfig).toContain('noindex, nofollow');
    expect(sitemap).not.toMatch(/path:\s*["']\/report\//);
  });
});
