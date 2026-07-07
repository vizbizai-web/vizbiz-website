import { describe, expect, it } from 'vitest';
import { buildReportUrl } from './report-token';

describe('report token urls', () => {
  it('sanitizes configured site URL before building client-facing report CTA', () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://vizbiz.ai\n/';
    try {
      const url = buildReportUrl('lead-123');
      expect(url).toMatch(/^https:\/\/vizbiz\.ai\/report\/lead-123\?token=/);
      expect(url).not.toContain('\n');
      expect(url).not.toContain('ai//report');
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });
});
