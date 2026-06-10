import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_NICHE_MODEL,
  PASS_1_SCHEMA,
  PASS_1_SYSTEM_PROMPT,
  PASS_2_SCHEMA,
  PASS_2_SYSTEM_PROMPT,
  buildEvidencePack,
  callStructuredForTests,
  clearNicheLLMForTests,
  resolveNiche,
  setNicheLLMForTests,
  verifyQuotes,
  type NicheDecisionOutput,
  type QuoteExtractionOutput,
} from './niche-resolution';

const longBody = (bodyText: string) => `${bodyText}\n${'Additional website evidence about services, support, operations, client needs, and trust proof. '.repeat(12)}`;

const mkPage = (bodyText: string, extra: Partial<{ url: string; title: string; metaDescription: string; h1s: string[]; jsonLdTypes: string[] }> = {}) => ({
  url: extra.url || 'https://example.com/',
  title: extra.title || 'Example',
  metaDescription: extra.metaDescription || '',
  h1s: extra.h1s || [],
  jsonLdTypes: extra.jsonLdTypes || [],
  bodyText,
});

const okDecision = (value: string, primaryEvidence: string[], extras: Partial<NicheDecisionOutput> = {}): NicheDecisionOutput => ({
  status: 'OK',
  businessNiche: { value, confidence: 0.9, primaryEvidence },
  services: [value],
  customerSegments: [],
  serviceArea: [],
  language: 'en',
  conflict: { declaredCandidate: null, websiteCandidate: null, explanation: '' },
  ...extras,
});

afterEach(() => clearNicheLLMForTests());

describe('niche resolver OpenAI-compatible structured provider', () => {
  it('uses env-selected models and strict json_schema response_format before provider-specific code', async () => {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.OPENAI_API_KEY;
    const originalBaseUrl = process.env.OPENAI_BASE_URL;
    const originalModel = process.env.NICHE_PASS1_MODEL;
    const calls: unknown[] = [];
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_BASE_URL = 'https://openai-compatible.example/v1';
    process.env.NICHE_PASS1_MODEL = 'codex-5.5-test';
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls.push(JSON.parse(String(init?.body || '{}')));
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ whatTheyDo: [], whoTheyServe: [], whereTheyOperate: [], selfDescription: [] }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    try {
      await callStructuredForTests({ pass: 1, modelEnvVar: 'NICHE_PASS1_MODEL', systemPrompt: PASS_1_SYSTEM_PROMPT, userMessage: 'BODY', schema: PASS_1_SCHEMA });
    } finally {
      globalThis.fetch = originalFetch;
      if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
      if (originalBaseUrl === undefined) delete process.env.OPENAI_BASE_URL; else process.env.OPENAI_BASE_URL = originalBaseUrl;
      if (originalModel === undefined) delete process.env.NICHE_PASS1_MODEL; else process.env.NICHE_PASS1_MODEL = originalModel;
    }

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      model: 'codex-5.5-test',
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'niche_pass_1', strict: true, schema: PASS_1_SCHEMA },
      },
    });
    expect(JSON.stringify(calls[0])).not.toMatch(/anthropic|tool_choice|claude/i);
  });

  it('falls back from unsupported strict json_schema to json mode with one validation retry', async () => {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.OPENAI_API_KEY;
    const originalModel = process.env.NICHE_PASS2_MODEL;
    const calls: unknown[] = [];
    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.NICHE_PASS2_MODEL;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}'));
      calls.push(body);
      if (body.response_format?.type === 'json_schema') {
        return new Response('response_format json_schema is not supported', { status: 400 });
      }
      if (calls.length === 2) {
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ status: 'OK' }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ status: 'INSUFFICIENT', businessNiche: { value: '', confidence: 0, primaryEvidence: [] }, services: [], customerSegments: [], serviceArea: [], language: 'en', conflict: { declaredCandidate: null, websiteCandidate: null, explanation: 'too thin' } }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    try {
      const output = await callStructuredForTests({ pass: 2, modelEnvVar: 'NICHE_PASS2_MODEL', systemPrompt: PASS_2_SYSTEM_PROMPT, userMessage: 'Determine', schema: PASS_2_SCHEMA });
      expect((output as NicheDecisionOutput).status).toBe('INSUFFICIENT');
    } finally {
      globalThis.fetch = originalFetch;
      if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
      if (originalModel === undefined) delete process.env.NICHE_PASS2_MODEL; else process.env.NICHE_PASS2_MODEL = originalModel;
    }

    expect(calls).toHaveLength(3);
    expect(calls[0]).toMatchObject({ model: DEFAULT_NICHE_MODEL, response_format: { type: 'json_schema' } });
    expect(calls[1]).toMatchObject({ response_format: { type: 'json_object' } });
    expect(calls[2]).toMatchObject({ response_format: { type: 'json_object' } });
  });
});

describe('resolveNiche spec prompts and evidence pack', () => {
  it('preserves the required Pass 1 and Pass 2 system prompt wording', () => {
    expect(PASS_1_SYSTEM_PROMPT).toContain('You are an evidence extractor. You will receive text scraped from one');
    expect(PASS_1_SYSTEM_PROMPT).toContain('The business\'s NAME is not evidence of what it does.');
    expect(PASS_2_SYSTEM_PROMPT).toContain('You determine a local business\'s niche from evidence. You will receive:');
    expect(PASS_2_SYSTEM_PROMPT).toContain('You are NOT mapping to a category list. There is no list.');
    expect(PASS_2_SYSTEM_PROMPT).toContain('segments go in customerSegments and must not influence businessNiche.');
  });

  it('builds a client-only evidence pack and includes domain-matched Places only as supporting evidence', () => {
    const pack = buildEvidencePack({
      leadId: 'lead_pack',
      businessName: 'Client Co',
      websiteDomain: 'client.example',
      submittedPrimaryService: 'tax resolution specialist',
      crawl: {
        crawlMethod: 'fetch',
        crawlQuality: 'full',
        pages: [mkPage('We are a tax resolution specialist helping taxpayers resolve IRS debt and audits.', { title: 'Tax Help' })],
      },
      places: { matched: true, matchMethod: 'website_domain', types: ['accounting', 'finance'] },
    });

    expect(pack.text).toContain('BUSINESS NAME (context only — never evidence of category): Client Co');
    expect(pack.text).toContain('SUPPORTING EVIDENCE');
    expect(pack.text).toContain('GOOGLE PLACES TYPES: accounting, finance');
    expect(pack.packCharCount).toBe(pack.text.length);
    expect(pack.pagesIncluded).toEqual(['https://example.com/']);
    expect(pack.submittedServicePresent).toBe(true);
  });
});

describe('verifyQuotes', () => {
  it('drops quotes that do not mechanically match the evidence pack', () => {
    const result = verifyQuotes({
      whatTheyDo: [
        { quote: 'We provide tax resolution services.', sourceUrl: 'https://example.com/' },
        { quote: 'We are secretly a restaurant.', sourceUrl: 'https://example.com/' },
      ],
      whoTheyServe: [],
      whereTheyOperate: [],
      selfDescription: [],
    }, 'BODY:\nWe provide tax resolution services.');

    expect(result.verified.whatTheyDo).toEqual([{ quote: 'We provide tax resolution services.', sourceUrl: 'https://example.com/' }]);
    expect(result.dropped.whatTheyDo).toBe(1);
    expect(result.totalExtracted).toBe(2);
    expect(result.totalDropped).toBe(1);
  });
});

describe('resolveNiche degraded submitted-only safeguards', () => {
  it('rejects browser-metadata-polluted submitted primary service instead of propagating it', async () => {
    clearNicheLLMForTests();
    const result = await resolveNiche({
      leadId: 'polluted_submitted_service',
      businessName: 'Coraltalk AI Inc.',
      websiteDomain: 'coraltalk.com',
      submittedPrimaryService: 'Assessments education. TZ: Europe/Malta (UTC+02:00) Locale: en-US',
      crawl: {
        crawlMethod: 'fetch',
        crawlQuality: 'thin',
        pages: [{
          url: 'https://www.coraltalk.com',
          title: 'Coraltalk | Build Understanding Through Conversation',
          metaDescription: 'Voice-native AI that runs oral assessments and personalized tutoring, at scale.',
          h1s: [],
          jsonLdTypes: [],
          bodyText: 'short',
        }],
      },
      places: null,
    });

    expect(result.status).toBe('blocked_insufficient_evidence');
    expect(result.method).toBe('blocked_insufficient_evidence');
    expect(result.businessNiche.value).toBe('');
    expect(result.services).toEqual([]);
    expect(result.needsReview).toBe(true);
  });
});

describe('resolveNiche acceptance fixtures', () => {
  it('accepts primary evidence when the provider wraps a verified quote in labeling text', () => {
    const quote = 'We supply professional audio systems for churches, theatres, venues and broadcast studios.';
    setNicheLLMForTests(async (request) => request.pass === 1
      ? { whatTheyDo: [{ quote, sourceUrl: 'https://audio.example/' }], whoTheyServe: [], whereTheyOperate: [], selfDescription: [] } satisfies QuoteExtractionOutput
      : okDecision('pro audio supplier', ['Owner-declared primary service: pro audio supplier', `Website quote: "${quote}"`]));

    return expect(resolveNiche({
      leadId: 'wrapped-primary-evidence',
      businessName: 'Audio House',
      websiteDomain: 'audio.example',
      submittedPrimaryService: 'pro audio supplier',
      crawl: { crawlMethod: 'fetch', crawlQuality: 'full', pages: [mkPage(longBody(quote), { url: 'https://audio.example/' })] },
      places: null,
    })).resolves.toMatchObject({ status: 'OK', method: 'two_pass_llm', businessNiche: { value: 'pro audio supplier' } });
  });

  it('does not treat supplier customer segments as the business niche when WHAT_THEY_DO supports supplier language', async () => {
    const quote = 'Fabricamos y distribuimos insumos para heladerías, pastelerías y gastronomía.';
    setNicheLLMForTests(async (request) => request.pass === 1
      ? { whatTheyDo: [{ quote, sourceUrl: 'https://ingredientes.example/' }], whoTheyServe: [{ quote: 'Atendemos heladerías, restaurantes y pastelerías.', sourceUrl: 'https://ingredientes.example/' }], whereTheyOperate: [], selfDescription: [] } satisfies QuoteExtractionOutput
      : okDecision('proveedor de insumos para heladerías, pastelerías y gastronomía', [quote], { customerSegments: ['heladerías', 'restaurantes', 'pastelerías'], language: 'es' }));

    await expect(resolveNiche({
      leadId: 'supplier-segment-support',
      businessName: 'Sabor Sur',
      websiteDomain: 'ingredientes.example',
      submittedPrimaryService: 'proveedor de insumos para heladerías',
      crawl: { crawlMethod: 'fetch', crawlQuality: 'full', pages: [mkPage(longBody(`${quote}\nAtendemos heladerías, restaurantes y pastelerías.`), { url: 'https://ingredientes.example/' })] },
      places: null,
    })).resolves.toMatchObject({ status: 'OK', method: 'two_pass_llm', businessNiche: { value: 'proveedor de insumos para heladerías, pastelerías y gastronomía' } });
  });

  it('empty crawl uses submitted-only path and skips both LLM passes over five stable runs', async () => {
    let calls = 0;
    setNicheLLMForTests(async () => {
      calls += 1;
      throw new Error('LLM should not be called');
    });

    const outputs = [];
    for (let i = 0; i < 5; i += 1) {
      outputs.push(await resolveNiche({
        leadId: `empty-crawl-${i}`,
        businessName: 'Skin Root Cause',
        websiteDomain: 'skin.example',
        submittedPrimaryService: 'functional nutritionist',
        crawl: { crawlMethod: 'fetch', crawlQuality: 'failed', pages: [] },
        places: null,
      }));
    }

    expect(calls).toBe(0);
    expect(outputs.map((result) => result.status)).toEqual(['OK', 'OK', 'OK', 'OK', 'OK']);
    expect(new Set(outputs.map((result) => result.businessNiche.value))).toEqual(new Set(['functional nutritionist']));
    for (const result of outputs) {
      expect(result.businessNiche.confidence).toBe(0.6);
      expect(result.method).toBe('submitted_only');
      expect(result.needsReview).toBe(true);
    }
  });

  it('T6 keeps audio supplier as the niche and churches/venues as customer segments over five stable runs', async () => {
    const quote = 'We supply professional audio systems for churches, theatres, venues and broadcast studios.';
    setNicheLLMForTests(async (request) => {
      if (request.pass === 1) {
        return { whatTheyDo: [{ quote, sourceUrl: 'https://audio.example/' }], whoTheyServe: [{ quote: 'We serve churches, theatres, venues and broadcast studios.', sourceUrl: 'https://audio.example/' }], whereTheyOperate: [], selfDescription: [] } satisfies QuoteExtractionOutput;
      }
      return okDecision('pro audio supplier', [quote], { customerSegments: ['churches', 'theatres', 'venues', 'broadcast studios'] });
    });

    const outputs = [];
    for (let i = 0; i < 5; i += 1) {
      outputs.push(await resolveNiche({
        leadId: `T6-${i}`,
        businessName: 'Audio House',
        websiteDomain: 'audio.example',
        submittedPrimaryService: 'pro audio supplier',
        crawl: { crawlMethod: 'fetch', crawlQuality: 'full', pages: [mkPage(longBody(`${quote}\nWe serve churches, theatres, venues and broadcast studios.`), { url: 'https://audio.example/' })] },
        places: null,
      }));
    }

    expect(outputs.map((o) => o.status)).toEqual(['OK', 'OK', 'OK', 'OK', 'OK']);
    expect(new Set(outputs.map((o) => o.businessNiche.value))).toEqual(new Set(['pro audio supplier']));
    expect(outputs[0].customerSegments).toContain('churches');
  });

  it('T7 preserves Spanish ingredient supplier and does not become restaurant', async () => {
    const quote = 'Fabricamos y distribuimos insumos para heladerías, pastelerías y gastronomía.';
    setNicheLLMForTests(async (request) => request.pass === 1
      ? { whatTheyDo: [{ quote, sourceUrl: 'https://ingredientes.example/' }], whoTheyServe: [{ quote: 'Atendemos heladerías, restaurantes y pastelerías.', sourceUrl: 'https://ingredientes.example/' }], whereTheyOperate: [], selfDescription: [] } satisfies QuoteExtractionOutput
      : okDecision('proveedor de insumos para heladerías', [quote], { customerSegments: ['heladerías', 'restaurantes', 'pastelerías'], language: 'es' }));

    const outputs = [];
    for (let i = 0; i < 5; i += 1) {
      outputs.push(await resolveNiche({
        leadId: `T7-${i}`,
        businessName: 'Sabor Sur',
        websiteDomain: 'ingredientes.example',
        submittedPrimaryService: 'proveedor de insumos para heladerías',
        crawl: { crawlMethod: 'fetch', crawlQuality: 'full', pages: [mkPage(longBody(`${quote}\nAtendemos heladerías, restaurantes y pastelerías.`), { url: 'https://ingredientes.example/' })] },
        places: null,
      }));
    }

    expect(outputs.map((result) => result.status)).toEqual(['OK', 'OK', 'OK', 'OK', 'OK']);
    expect(new Set(outputs.map((result) => result.businessNiche.value))).toEqual(new Set(['proveedor de insumos para heladerías']));
    for (const result of outputs) {
      expect(result.language).toBe('es');
      expect(result.businessNiche.value).not.toMatch(/restaurant|restaurante/i);
    }
  });

  it('T9 blocks declared med spa against restaurant website as conflict', async () => {
    const quote = 'We are a family restaurant serving handmade pasta and wine.';
    setNicheLLMForTests(async (request) => request.pass === 1
      ? { whatTheyDo: [{ quote, sourceUrl: 'https://conflict.example/' }], whoTheyServe: [], whereTheyOperate: [], selfDescription: [{ quote, sourceUrl: 'https://conflict.example/' }] } satisfies QuoteExtractionOutput
      : ({ status: 'CONFLICT', businessNiche: { value: '', confidence: 0, primaryEvidence: [] }, services: [], customerSegments: [], serviceArea: [], language: 'en', conflict: { declaredCandidate: 'med spa', websiteCandidate: 'restaurant', explanation: 'Declared service and website describe different businesses.' } } satisfies NicheDecisionOutput));

    const outputs = [];
    for (let i = 0; i < 5; i += 1) {
      outputs.push(await resolveNiche({
        leadId: `T9-${i}`,
        businessName: 'Glow Table',
        websiteDomain: 'conflict.example',
        submittedPrimaryService: 'med spa',
        crawl: { crawlMethod: 'fetch', crawlQuality: 'full', pages: [mkPage(longBody(quote), { url: 'https://conflict.example/' })] },
        places: null,
      }));
    }

    expect(outputs.map((result) => result.status)).toEqual(['CONFLICT', 'CONFLICT', 'CONFLICT', 'CONFLICT', 'CONFLICT']);
    for (const result of outputs) {
      expect(result.conflict.declaredCandidate).toBe('med spa');
      expect(result.conflict.websiteCandidate).toBe('restaurant');
      expect(result.needsReview).toBe(true);
    }
  });

  it('brand-name thin fixture never infers golf from Mulligan\'s Plumbing over five stable runs', async () => {
    const outputs = [];
    for (let i = 0; i < 5; i += 1) {
      outputs.push(await resolveNiche({
        leadId: `brand-name-${i}`,
        businessName: "Mulligan's Plumbing",
        websiteDomain: 'mulligans.example',
        submittedPrimaryService: 'plumbing',
        crawl: { crawlMethod: 'fetch', crawlQuality: 'thin', pages: [mkPage('Call us today.', { title: "Mulligan's Plumbing" })] },
        places: null,
      }));
    }

    expect(new Set(outputs.map((result) => result.businessNiche.value))).toEqual(new Set(['plumbing']));
    for (const result of outputs) {
      expect(result.businessNiche.value).not.toMatch(/golf/i);
      expect(result.method).toBe('submitted_only');
    }
  });
});
