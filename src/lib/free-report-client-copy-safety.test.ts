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

  it('does not show unvalidated citation domains as businesses AI trusts instead of the client', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).not.toContain('Who AI Trusts Instead of You');
    expect(source).not.toContain("These domains are cited by AI models when your business doesn't appear");
  });

  it('does not render unvalidated AI discovery/fan-out source tables client-side', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).not.toContain('Query Fan-Out Results');
    expect(source).not.toContain('Top Source Cited');
    expect(source).not.toContain('How AI models discover, evaluate, and recommend your business');
    expect(source).not.toContain('Competitors AI recommends instead of you');
    expect(source).not.toContain('AI platforms recommended competitors instead');
    expect(source).not.toContain('AI is sending buyers elsewhere');
  });
});
