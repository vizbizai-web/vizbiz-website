import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('free report client copy safety', () => {
  it('does not show operator-style Bing Webmaster Tools setup notices in client reports', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).not.toContain('Bing Webmaster Tools Not Connected');
    expect(source).not.toContain('Connecting Bing Webmaster Tools unlocks free AI visibility data including grounding queries');
  });

  it('does not hard-code dealership examples into generic AI discovery recommendations', () => {
    const source = readFileSync('src/lib/research-runner.ts', 'utf8');
    expect(source).not.toContain('Used Car Financing in Austin');
  });
});
