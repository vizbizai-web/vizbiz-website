import type { FixKitArtifact } from './fix-kit-generator';

export type FixVerificationResult = {
  checks: { key: string; ok: boolean; evidence: string }[];
  regressions: string[];
};

export function verifyDeliveredFixManifest(input: {
  artifacts: Pick<FixKitArtifact, 'filename' | 'content' | 'status'>[];
  live: { hasLlmsTxt?: boolean; hasSchema?: boolean; robotsAllowsAi?: boolean; titles?: string[]; metas?: string[]; html?: string; url?: string };
}): FixVerificationResult {
  const checks: FixVerificationResult['checks'] = [];
  const hasDelivered = (filename: string) => input.artifacts.some((a) => a.filename === filename && (a.status === 'approved' || a.status === 'delivered'));
  if (hasDelivered('schema.jsonld')) checks.push({ key: 'schema.jsonld', ok: Boolean(input.live.hasSchema), evidence: input.live.hasSchema ? 'schema present' : 'schema missing' });
  if (hasDelivered('llms.txt')) checks.push({ key: 'llms.txt', ok: Boolean(input.live.hasLlmsTxt), evidence: input.live.hasLlmsTxt ? 'llms.txt present' : 'llms.txt missing' });
  if (hasDelivered('ai-crawler-access-report.md')) checks.push({ key: 'robots_ai_access', ok: input.live.robotsAllowsAi !== false, evidence: input.live.robotsAllowsAi === false ? 'robots blocking AI crawler access' : 'robots allows AI crawler access or no block detected' });
  if (hasDelivered('citable-decision-framework-page.md')) {
    const html = input.live.html || '';
    const hasDecisionPage = /Decision framework|Marco de decisión/i.test(html) && /FAQPage|<h2>FAQ|Preguntas frecuentes/i.test(html);
    checks.push({ key: 'a8_citable_decision_framework', ok: hasDecisionPage, evidence: hasDecisionPage ? `decision framework page detected${input.live.url ? ` at ${input.live.url}` : ''}` : 'decision framework page missing from live HTML' });
  }
  return { checks, regressions: checks.filter((c) => !c.ok).map((c) => c.key) };
}
