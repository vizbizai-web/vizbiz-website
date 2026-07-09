import { describe, expect, it } from 'vitest';
import { verifyDeliveredFixManifest } from './fix-verification';

describe('Fix verification', () => {
  it('detects a delivered A8 citable decision-framework page in live HTML', () => {
    const result = verifyDeliveredFixManifest({
      artifacts: [{ filename: 'citable-decision-framework-page.md', content: '', status: 'approved' }],
      live: { url: 'https://client.example/how-to-choose', html: '<html><script type="application/ld+json">{"@type":"FAQPage"}</script><h2>Decision framework</h2><h2>FAQ</h2></html>' },
    });
    expect(result.regressions).toEqual([]);
    expect(result.checks[0]).toMatchObject({ key: 'a8_citable_decision_framework', ok: true });
  });

  it('flags missing live A8 decision framework content', () => {
    const result = verifyDeliveredFixManifest({
      artifacts: [{ filename: 'citable-decision-framework-page.md', content: '', status: 'delivered' }],
      live: { html: '<html><h1>Home</h1></html>' },
    });
    expect(result.regressions).toContain('a8_citable_decision_framework');
  });
});
