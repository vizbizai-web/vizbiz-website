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

  it('does not make over-causal revenue loss claims in the free report hero', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).not.toContain('costing you an estimated');
    expect(source).not.toContain('revenue going elsewhere');
    expect(source).not.toContain('AI recommendations go to');
  });

  it('does not show hardcoded dollar risk ranges until revenue math is defensible', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).not.toContain('Monthly Risk');
    expect(source).not.toContain('Estimated Revenue at Risk');
    expect(source).not.toContain('visibility opportunity');
    expect(source).toContain('customers are finding competitors instead');
  });

  it('uses one Local Trust Snapshot and does not render the duplicate social media reviews section', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).toContain('<GoogleTrustSignals data={data} theme={theme} />');
    expect(source).not.toContain('<SocialMedia data={data} theme={theme} />');
    expect(source).not.toContain('Social Media Presence');
    expect(source).not.toContain('How you compare on social platforms');
    expect(source).toContain('Local Trust Snapshot');
    expect(source).toContain('Google profiles, ratings, review volume, and profile consistency');
  });

  it('clearly promises the one-time 88 dollar plan includes one 30-day update without weakening monthly positioning', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).toContain('One 30-day re-test/update included');
    expect(source).toContain('Get Full Report + 30-Day Update — $88');
    expect(source).toContain('Monthly keeps monitoring competitor movement and new fixes as AI results change');
  });

  it('uses real checkout fallbacks for report CTAs instead of dead hash links', () => {
    const source = readFileSync('src/app/report/[leadId]/report-content.tsx', 'utf8');
    expect(source).toContain("const fallbackUrl = buildStripeCheckoutFallbackUrl('fix');");
    expect(source).toContain("fetch('/api/stripe/checkout/',");
    expect(source).not.toContain('href="#"');
  });
});
