import { loadEnvConfig } from '@next/env';
import { resolveNiche, clearNicheLLMForTests } from '../src/lib/niche-resolution';

loadEnvConfig(process.cwd());
clearNicheLLMForTests();

const longBody = (bodyText: string) => `${bodyText}\n${'Additional website evidence about services, support, operations, client needs, and trust proof. '.repeat(12)}`;
const mkPage = (bodyText: string, extra: any = {}) => ({
  url: extra.url || 'https://example.com/',
  title: extra.title || 'Example',
  metaDescription: extra.metaDescription || '',
  h1s: extra.h1s || [],
  jsonLdTypes: extra.jsonLdTypes || [],
  bodyText,
});

const fixtures = [
  {
    name: 'T6 audio supplier',
    make: (i: number) => {
      const quote = 'We supply professional audio systems for churches, theatres, venues and broadcast studios.';
      return {
        leadId: `live-T6-${i}`,
        businessName: 'Audio House',
        websiteDomain: 'audio.example',
        submittedPrimaryService: 'pro audio supplier',
        crawl: { crawlMethod: 'fetch' as const, crawlQuality: 'full' as const, pages: [mkPage(longBody(`${quote}\nWe serve churches, theatres, venues and broadcast studios.`), { url: 'https://audio.example/' })] },
        places: null,
      };
    },
    check: (r: any) => r.status === 'OK' && /audio|sound/i.test(r.businessNiche.value) && !/church|theatre|venue|broadcast studio/i.test(r.businessNiche.value) && (r.customerSegments || []).some((s: string) => /church/i.test(s)) && r.method === 'two_pass_llm',
  },
  {
    name: 'T7 Spanish supplier',
    make: (i: number) => {
      const quote = 'Fabricamos y distribuimos insumos para heladerías, pastelerías y gastronomía.';
      return {
        leadId: `live-T7-${i}`,
        businessName: 'Sabor Sur',
        websiteDomain: 'ingredientes.example',
        submittedPrimaryService: 'proveedor de insumos para heladerías',
        crawl: { crawlMethod: 'fetch' as const, crawlQuality: 'full' as const, pages: [mkPage(longBody(`${quote}\nAtendemos heladerías, restaurantes y pastelerías.`), { url: 'https://ingredientes.example/' })] },
        places: null,
      };
    },
    check: (r: any) => r.status === 'OK' && /insumos|supplier|proveedor|ingred/i.test(r.businessNiche.value) && !/restaurant|restaurante/i.test(r.businessNiche.value) && r.language === 'es' && r.method === 'two_pass_llm',
  },
  {
    name: 'T9 conflict',
    make: (i: number) => {
      const quote = 'We are a family restaurant serving handmade pasta and wine.';
      return {
        leadId: `live-T9-${i}`,
        businessName: 'Glow Table',
        websiteDomain: 'conflict.example',
        submittedPrimaryService: 'med spa',
        crawl: { crawlMethod: 'fetch' as const, crawlQuality: 'full' as const, pages: [mkPage(longBody(quote), { url: 'https://conflict.example/' })] },
        places: null,
      };
    },
    check: (r: any) => r.status === 'CONFLICT' && /med spa/i.test(r.conflict?.declaredCandidate || '') && /restaurant/i.test(r.conflict?.websiteCandidate || '') && r.needsReview === true,
  },
  {
    name: 'brand-name thin',
    make: (i: number) => ({
      leadId: `live-brand-name-${i}`,
      businessName: "Mulligan's Plumbing",
      websiteDomain: 'mulligans.example',
      submittedPrimaryService: 'plumbing',
      crawl: { crawlMethod: 'fetch' as const, crawlQuality: 'thin' as const, pages: [mkPage('Call us today.', { title: "Mulligan's Plumbing" })] },
      places: null,
    }),
    check: (r: any) => r.status === 'OK' && /plumbing/i.test(r.businessNiche.value) && !/golf/i.test(r.businessNiche.value) && r.method === 'submitted_only' && r.diagnostics?.degradedReason === 'pack_body_under_500_chars',
  },
  {
    name: 'empty-crawl',
    make: (i: number) => ({
      leadId: `live-empty-crawl-${i}`,
      businessName: 'Skin Root Cause',
      websiteDomain: 'skin.example',
      submittedPrimaryService: 'functional nutritionist',
      crawl: { crawlMethod: 'fetch' as const, crawlQuality: 'failed' as const, pages: [] },
      places: null,
    }),
    check: (r: any) => r.status === 'OK' && /functional nutritionist/i.test(r.businessNiche.value) && r.method === 'submitted_only' && r.diagnostics?.degradedReason === 'crawl_failed_or_unavailable',
  },
];

async function main() {
  const summary: any[] = [];
  for (const fixture of fixtures) {
    const runs: any[] = [];
    for (let i = 0; i < 5; i += 1) {
      try {
        const result = await resolveNiche(fixture.make(i));
        const pass = fixture.check(result);
        runs.push({
          run: i + 1,
          pass,
          status: result.status,
          method: result.method,
          niche: result.businessNiche?.value,
          confidence: result.businessNiche?.confidence,
          needsReview: result.needsReview,
          conflict: result.conflict,
          customerSegments: result.customerSegments,
          language: result.language,
          validation: result.diagnostics?.degradedReason || (result.status === 'CONFLICT' ? 'conflict_gate' : result.method === 'two_pass_llm' ? 'quote_verification_and_post_call_validation' : 'submitted_only'),
          diagnostics: result.diagnostics,
        });
      } catch (error: any) {
        runs.push({ run: i + 1, pass: false, error: String(error?.message || error), validation: 'exception' });
      }
    }
    const signatures = new Set(runs.map((r) => `${r.status}|${r.method}|${r.niche}|${r.validation}|${r.pass}`));
    summary.push({ fixture: fixture.name, passed: runs.every((r) => r.pass), stable: signatures.size === 1, signatures: [...signatures], runs });
  }
  console.log(JSON.stringify({ provider: { pass1Model: process.env.NICHE_PASS1_MODEL, pass2Model: process.env.NICHE_PASS2_MODEL, keyPresent: !!process.env.OPENAI_API_KEY }, summary }, null, 2));
  if (!summary.every((s) => s.passed && s.stable)) process.exit(2);
}

main().catch((error) => { console.error(error); process.exit(1); });
