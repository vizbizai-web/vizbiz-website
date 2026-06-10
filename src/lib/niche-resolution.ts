export type CrawlMethod = 'fetch' | 'firecrawl';
export type CrawlQuality = 'full' | 'thin' | 'failed';
export type NicheStatus = 'OK' | 'CONFLICT' | 'INSUFFICIENT' | 'blocked_insufficient_evidence';
export type NicheMethod = 'two_pass_llm' | 'submitted_only' | 'blocked_insufficient_evidence';

export interface CrawledPage {
  url: string;
  title?: string | null;
  metaDescription?: string | null;
  h1s?: string[];
  jsonLdTypes?: string[];
  bodyText?: string | null;
}

export interface NicheInput {
  leadId: string;
  businessName: string;
  websiteDomain: string;
  submittedPrimaryService: string | null;
  crawl: {
    pages: CrawledPage[];
    crawlMethod: CrawlMethod;
    crawlQuality: CrawlQuality;
  };
  places: {
    matched: boolean;
    matchMethod: 'website_domain' | 'name_only' | 'none';
    types: string[];
  } | null;
}

export type QuoteCategory = 'whatTheyDo' | 'whoTheyServe' | 'whereTheyOperate' | 'selfDescription';
export type NicheQuote = { quote: string; sourceUrl: string };
export type QuoteExtractionOutput = Record<QuoteCategory, NicheQuote[]>;

export interface VerifiedQuotesResult {
  verified: QuoteExtractionOutput;
  extracted: Record<QuoteCategory, number>;
  dropped: Record<QuoteCategory, number>;
  totalExtracted: number;
  totalVerified: number;
  totalDropped: number;
  droppedRatio: number;
}

export interface NicheDecisionOutput {
  status: 'OK' | 'CONFLICT' | 'INSUFFICIENT';
  businessNiche: {
    value: string;
    confidence: number;
    primaryEvidence: string[];
  };
  services: string[];
  customerSegments: string[];
  serviceArea: string[];
  language: string;
  conflict: {
    declaredCandidate: string | null;
    websiteCandidate: string | null;
    explanation: string;
  };
}

export interface NicheResult extends Omit<NicheDecisionOutput, 'status'> {
  status: NicheStatus;
  method: NicheMethod;
  needsReview: boolean;
  profileHash?: string;
  diagnostics: {
    packCharCount: number;
    pagesIncluded: string[];
    submittedServicePresent: boolean;
    crawlQuality: CrawlQuality;
    bodyCharCount: number;
    llmPassesSkipped: boolean;
    quotesExtracted?: Record<QuoteCategory, number>;
    quotesVerified?: Record<QuoteCategory, number>;
    quotesDropped?: Record<QuoteCategory, number>;
    degradedReason?: string;
  };
}

export interface EvidencePack {
  text: string;
  bodyText: string;
  packCharCount: number;
  bodyCharCount: number;
  pagesIncluded: string[];
  submittedServicePresent: boolean;
  crawlQuality: CrawlQuality;
  detectedLanguage: string;
  supportingPlacesTypes: string[];
}

export const PASS_1_SYSTEM_PROMPT = `You are an evidence extractor. You will receive text scraped from one
business's website. Your only job is to find and return VERBATIM sentences
that state facts about this business. You do not interpret, classify,
summarize, or infer. You copy exact sentences.

Rules:
- Every quote must be copied character-for-character from the provided text.
- Never compose, paraphrase, or merge sentences.
- Maximum 25 words per quote; if a sentence is longer, copy a contiguous
  fragment of it.
- If you find nothing for a category, return an empty array for it. An empty
  array is a correct and acceptable answer. Do not fill gaps with guesses.
- The business's NAME is not evidence of what it does. A business called
  "Mulligan's" is not necessarily golf-related; "The Foundry" is not
  necessarily a metalworks. Only what the text SAYS the business does counts.`;

export const PASS_2_SYSTEM_PROMPT = `You determine a local business's niche from evidence. You will receive:
(a) what the business owner declared on an intake form, and
(b) verified verbatim quotes from the business's own website.

Decision rules, in order:

1. The owner's declared primary service is STRONG evidence. The website
   quotes are STRONG evidence. Google Places types are SUPPORTING evidence
   only — they may reinforce a niche already present in (a) or (b) but may
   never introduce a niche on their own.

2. Express the niche in the business's OWN vocabulary, as specific as the
   evidence allows. "Tax resolution specialist" must stay "tax resolution
   specialist" — never broaden it to "accountant" or "financial services".
   You are NOT mapping to a category list. There is no list.

3. WHO_THEY_SERVE quotes describe customers, never the business itself.
   A supplier whose site mentions restaurants is not a restaurant. Customer
   segments go in customerSegments and must not influence businessNiche.

4. The business name is not evidence of category.

5. If the declared service and the website quotes describe genuinely
   different businesses (not just different wording for the same thing),
   output status CONFLICT with both candidates. Do not choose. Synonyms,
   subsets, and rephrasings are NOT conflicts: "med spa" vs "medical
   aesthetics clinic" agree; "med spa" vs "restaurant" conflict.

6. If evidence is too thin to name a specific niche, output status
   INSUFFICIENT. Never output a generic answer like "local business" or
   "small business" — generic answers are failures, not fallbacks.

7. State your confidence honestly. High confidence requires the declared
   service and at least one verified quote to agree.`;

const QUOTE_CATEGORIES: QuoteCategory[] = ['whatTheyDo', 'whoTheyServe', 'whereTheyOperate', 'selfDescription'];
const GENERIC_DENYLIST = new Set(['local business', 'small business', 'company', 'services', 'business', 'local_business']);

export const DEFAULT_NICHE_MODEL = 'gpt-5.5-codex';

export const PASS_1_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    whatTheyDo: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { quote: { type: 'string' }, sourceUrl: { type: 'string' } }, required: ['quote', 'sourceUrl'] } },
    whoTheyServe: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { quote: { type: 'string' }, sourceUrl: { type: 'string' } }, required: ['quote', 'sourceUrl'] } },
    whereTheyOperate: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { quote: { type: 'string' }, sourceUrl: { type: 'string' } }, required: ['quote', 'sourceUrl'] } },
    selfDescription: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { quote: { type: 'string' }, sourceUrl: { type: 'string' } }, required: ['quote', 'sourceUrl'] } },
  },
  required: ['whatTheyDo', 'whoTheyServe', 'whereTheyOperate', 'selfDescription'],
} as const;

export const PASS_2_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: { type: 'string', enum: ['OK', 'CONFLICT', 'INSUFFICIENT'] },
    businessNiche: { type: 'object', additionalProperties: false, properties: { value: { type: 'string' }, confidence: { type: 'number' }, primaryEvidence: { type: 'array', items: { type: 'string' } } }, required: ['value', 'confidence', 'primaryEvidence'] },
    services: { type: 'array', items: { type: 'string' } },
    customerSegments: { type: 'array', items: { type: 'string' } },
    serviceArea: { type: 'array', items: { type: 'string' } },
    language: { type: 'string' },
    conflict: { type: 'object', additionalProperties: false, properties: { declaredCandidate: { type: ['string', 'null'] }, websiteCandidate: { type: ['string', 'null'] }, explanation: { type: 'string' } }, required: ['declaredCandidate', 'websiteCandidate', 'explanation'] },
  },
  required: ['status', 'businessNiche', 'services', 'customerSegments', 'serviceArea', 'language', 'conflict'],
} as const;

type StructuredSchema = typeof PASS_1_SCHEMA | typeof PASS_2_SCHEMA;

type NicheLLMRequest =
  | { pass: 1; modelEnvVar: 'NICHE_PASS1_MODEL'; systemPrompt: string; userMessage: string; schema: typeof PASS_1_SCHEMA }
  | { pass: 2; modelEnvVar: 'NICHE_PASS2_MODEL'; systemPrompt: string; userMessage: string; schema: typeof PASS_2_SCHEMA };

type NicheLLM = (request: NicheLLMRequest) => Promise<QuoteExtractionOutput | NicheDecisionOutput>;
let nicheLLMForTests: NicheLLM | null = null;

export function setNicheLLMForTests(llm: NicheLLM): void {
  nicheLLMForTests = llm;
}

export function clearNicheLLMForTests(): void {
  nicheLLMForTests = null;
}

function emptyQuotes(): QuoteExtractionOutput {
  return { whatTheyDo: [], whoTheyServe: [], whereTheyOperate: [], selfDescription: [] };
}

function cleanArray(values: unknown): string[] {
  return Array.isArray(values) ? values.map((v) => String(v || '').trim()).filter(Boolean) : [];
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeForVerification(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeComparable(value: string): string {
  return normalizeForVerification(value).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

const MACHINE_METADATA_PATTERN = /(?:\btz[_:\s-]|\butc[_:\s-]|\blocale[_:\s-]|\butm[_:\s-]|https?:\/\/|www\.|[a-z0-9]+_[a-z0-9]+_[a-z0-9]+)/i;

function hasMachinePattern(value: string): boolean {
  return MACHINE_METADATA_PATTERN.test(value);
}

function blockedSubmittedOnlyResult(input: NicheInput, pack: EvidencePack, reason: string, submitted: string): NicheResult {
  return {
    status: 'blocked_insufficient_evidence',
    method: 'blocked_insufficient_evidence',
    needsReview: true,
    businessNiche: { value: '', confidence: 0, primaryEvidence: [] },
    services: [],
    customerSegments: [],
    serviceArea: [],
    language: pack.detectedLanguage,
    conflict: { declaredCandidate: submitted || null, websiteCandidate: null, explanation: reason },
    diagnostics: {
      packCharCount: pack.packCharCount,
      pagesIncluded: pack.pagesIncluded,
      submittedServicePresent: pack.submittedServicePresent,
      crawlQuality: pack.crawlQuality,
      bodyCharCount: pack.bodyCharCount,
      llmPassesSkipped: true,
      degradedReason: reason,
    },
  };
}

function includesTerm(haystack: string, needle: string | null): boolean {
  if (!needle?.trim()) return false;
  return normalizeComparable(haystack).includes(normalizeComparable(needle));
}

function truncateBody(body: string, max = 3000): string {
  return body.replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function detectLanguageFromText(text: string): string {
  const lower = text.toLowerCase();
  if (/[áéíóúñü¿¡]/i.test(text) || /\b(para|heladerías|restaurantes|pastelerías|fabricamos|distribuimos|servicios)\b/.test(lower)) return 'es';
  return 'en';
}

function domainFrom(value: string): string {
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname.replace(/^www\./, '');
  } catch {
    return value.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  }
}

export function buildEvidencePack(input: NicheInput): EvidencePack {
  const selectedPages = input.crawl.pages.slice(0, 3);
  let remainingBodyBudget = 8000;
  const pageBlocks: string[] = [];
  const bodies: string[] = [];
  const pagesIncluded: string[] = [];

  for (const page of selectedPages) {
    if (remainingBodyBudget <= 0) break;
    const body = truncateBody(page.bodyText || '', Math.min(3000, remainingBodyBudget));
    remainingBodyBudget -= body.length;
    pagesIncluded.push(page.url);
    bodies.push(body);
    pageBlocks.push([
      `---`,
      `[PAGE: ${page.url}]`,
      `TITLE: ${page.title || ''}`,
      `META: ${page.metaDescription || ''}`,
      `H1: ${(page.h1s || []).join(', ')}`,
      `JSON-LD TYPES: ${(page.jsonLdTypes || []).join(', ')}`,
      `BODY:`,
      body,
    ].join('\n'));
  }

  const bodyText = bodies.join('\n\n');
  const supportingPlacesTypes = input.places?.matchMethod === 'website_domain' ? cleanArray(input.places.types) : [];
  const supportBlock = supportingPlacesTypes.length
    ? `\n\nSUPPORTING EVIDENCE\nGOOGLE PLACES TYPES: ${supportingPlacesTypes.join(', ')}`
    : '';
  const text = [
    `BUSINESS NAME (context only — never evidence of category): ${input.businessName}`,
    `WEBSITE TEXT (scraped from ${input.websiteDomain}):`,
    ...pageBlocks,
    supportBlock.trim(),
  ].filter(Boolean).join('\n');

  return {
    text,
    bodyText,
    packCharCount: text.length,
    bodyCharCount: bodyText.length,
    pagesIncluded,
    submittedServicePresent: includesTerm(text, input.submittedPrimaryService),
    crawlQuality: input.crawl.crawlQuality,
    detectedLanguage: detectLanguageFromText(text),
    supportingPlacesTypes,
  };
}

function buildPass1UserMessage(input: NicheInput, pack: EvidencePack): string {
  return `${pack.text}

Extract verbatim quotes into these categories:

1. WHAT_THEY_DO — sentences stating the services, products, or work this
   business itself performs or sells.
2. WHO_THEY_SERVE — sentences naming customer types, client industries, or
   audiences (patterns like "we serve / we supply / we work with /
   trusted by / our clients include").
3. WHERE_THEY_OPERATE — sentences naming cities, regions, or service areas.
4. SELF_DESCRIPTION — sentences where the business names its own profession
   or category ("we are a …", "as a leading …", "your local …").`;
}

function formatQuotes(quotes: NicheQuote[]): string {
  return JSON.stringify(quotes.map((q) => q.quote));
}

function buildPass2UserMessage(input: NicheInput, verified: QuoteExtractionOutput, pack: EvidencePack): string {
  const submitted = input.submittedPrimaryService?.trim()
    ? `"${input.submittedPrimaryService.trim()}"`
    : '"The owner did not declare a primary service."';
  const placeTypes = pack.supportingPlacesTypes.length ? pack.supportingPlacesTypes.join(', ') : 'none / unmatched';
  return `OWNER-DECLARED PRIMARY SERVICE (from intake form): ${submitted}
  ${input.submittedPrimaryService?.trim() ? '' : '[if null: "The owner did not declare a primary service."]'}

VERIFIED WEBSITE QUOTES:
WHAT_THEY_DO: ${formatQuotes(verified.whatTheyDo)}
SELF_DESCRIPTION: ${formatQuotes(verified.selfDescription)}
WHO_THEY_SERVE: ${formatQuotes(verified.whoTheyServe)}
WHERE_THEY_OPERATE: ${formatQuotes(verified.whereTheyOperate)}

SUPPORTING EVIDENCE (may reinforce, may not introduce):
GOOGLE PLACES TYPES: ${placeTypes}

SITE LANGUAGE: ${pack.detectedLanguage}

Determine the niche.`;
}

export function verifyQuotes(quotes: QuoteExtractionOutput, packText: string): VerifiedQuotesResult {
  const normalizedPack = normalizeForVerification(packText);
  const verified = emptyQuotes();
  const extracted = { whatTheyDo: 0, whoTheyServe: 0, whereTheyOperate: 0, selfDescription: 0 } satisfies Record<QuoteCategory, number>;
  const dropped = { whatTheyDo: 0, whoTheyServe: 0, whereTheyOperate: 0, selfDescription: 0 } satisfies Record<QuoteCategory, number>;

  for (const category of QUOTE_CATEGORIES) {
    const categoryQuotes = Array.isArray(quotes[category]) ? quotes[category] : [];
    extracted[category] = categoryQuotes.length;
    for (const item of categoryQuotes) {
      const quote = String(item?.quote || '').trim();
      const sourceUrl = String(item?.sourceUrl || '').trim();
      if (quote && normalizedPack.includes(normalizeForVerification(quote))) {
        verified[category].push({ quote, sourceUrl });
      } else {
        dropped[category] += 1;
      }
    }
  }

  const totalExtracted = QUOTE_CATEGORIES.reduce((sum, c) => sum + extracted[c], 0);
  const totalDropped = QUOTE_CATEGORIES.reduce((sum, c) => sum + dropped[c], 0);
  const totalVerified = totalExtracted - totalDropped;
  return { verified, extracted, dropped, totalExtracted, totalVerified, totalDropped, droppedRatio: totalExtracted ? totalDropped / totalExtracted : 0 };
}

async function logNicheDiagnostic(leadId: string, payload: Record<string, unknown>): Promise<void> {
  const eventPayload = { ...payload, loggedAt: new Date().toISOString() };
  console.info('[niche-resolution-diagnostic]', JSON.stringify({ leadId, ...eventPayload }));
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/lead_events`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      lead_id: leadId,
      event_type: 'niche_resolution_diagnostic',
      event_payload: eventPayload,
    }),
  }).catch((error) => console.warn('[niche-resolution] Supabase diagnostic insert failed', error));
}

async function logPass1StructuredFailure(leadId: string, error: unknown): Promise<void> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/lead_events`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      lead_id: leadId,
      event_type: 'pass_1_structured_failure',
      event_payload: {
        reason: 'pass_1_structured_output_failed_after_retry',
        error: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
        loggedAt: new Date().toISOString(),
      },
    }),
  }).catch((insertError) => console.warn('[niche-resolution] pass1 failure event insert failed', insertError));
}

function submittedOnlyResult(input: NicheInput, pack: EvidencePack, reason: string): NicheResult {
  const submitted = input.submittedPrimaryService?.trim() || '';
  if (submitted && (GENERIC_DENYLIST.has(normalizeComparable(submitted)) || hasMachinePattern(submitted))) {
    return blockedSubmittedOnlyResult(input, pack, `${reason}; rejected unsafe submitted primary service`, submitted);
  }
  return {
    status: submitted ? 'OK' : 'blocked_insufficient_evidence',
    method: submitted ? 'submitted_only' : 'blocked_insufficient_evidence',
    needsReview: true,
    businessNiche: { value: submitted, confidence: submitted ? 0.6 : 0, primaryEvidence: submitted ? ['declared service'] : [] },
    services: submitted ? [submitted] : [],
    customerSegments: [],
    serviceArea: [],
    language: pack.detectedLanguage,
    conflict: { declaredCandidate: submitted || null, websiteCandidate: null, explanation: reason },
    diagnostics: {
      packCharCount: pack.packCharCount,
      pagesIncluded: pack.pagesIncluded,
      submittedServicePresent: pack.submittedServicePresent,
      crawlQuality: pack.crawlQuality,
      bodyCharCount: pack.bodyCharCount,
      llmPassesSkipped: true,
      degradedReason: reason,
    },
  };
}

function validateQuoteOutput(value: QuoteExtractionOutput | NicheDecisionOutput): QuoteExtractionOutput {
  const maybe = value as QuoteExtractionOutput;
  return {
    whatTheyDo: Array.isArray(maybe.whatTheyDo) ? maybe.whatTheyDo : [],
    whoTheyServe: Array.isArray(maybe.whoTheyServe) ? maybe.whoTheyServe : [],
    whereTheyOperate: Array.isArray(maybe.whereTheyOperate) ? maybe.whereTheyOperate : [],
    selfDescription: Array.isArray(maybe.selfDescription) ? maybe.selfDescription : [],
  };
}

function validateDecisionShape(value: QuoteExtractionOutput | NicheDecisionOutput): NicheDecisionOutput {
  const maybe = value as Partial<NicheDecisionOutput>;
  return {
    status: maybe.status === 'OK' || maybe.status === 'CONFLICT' || maybe.status === 'INSUFFICIENT' ? maybe.status : 'INSUFFICIENT',
    businessNiche: {
      value: String(maybe.businessNiche?.value || '').trim(),
      confidence: typeof maybe.businessNiche?.confidence === 'number' ? maybe.businessNiche.confidence : 0,
      primaryEvidence: cleanArray(maybe.businessNiche?.primaryEvidence),
    },
    services: cleanArray(maybe.services),
    customerSegments: cleanArray(maybe.customerSegments),
    serviceArea: cleanArray(maybe.serviceArea),
    language: String(maybe.language || 'en'),
    conflict: {
      declaredCandidate: maybe.conflict?.declaredCandidate || null,
      websiteCandidate: maybe.conflict?.websiteCandidate || null,
      explanation: String(maybe.conflict?.explanation || ''),
    },
  };
}

function getOpenAiCompatibleKey(): string {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_COMPAT_API_KEY || process.env.CODEX_API_KEY || '';
}

function getOpenAiCompatibleBaseUrl(): string {
  return (process.env.OPENAI_BASE_URL || process.env.OPENAI_COMPAT_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
}

function getModel(modelEnvVar: 'NICHE_PASS1_MODEL' | 'NICHE_PASS2_MODEL'): string {
  return process.env[modelEnvVar] || process.env.NICHE_MODEL || DEFAULT_NICHE_MODEL;
}

function strictSchemaName(pass: 1 | 2): string {
  return pass === 1 ? 'niche_pass_1' : 'niche_pass_2';
}

function assertQuoteOutputShape(value: unknown): QuoteExtractionOutput {
  if (!value || typeof value !== 'object') throw new Error('Pass 1 output is not an object');
  const record = value as Record<string, unknown>;
  const output = emptyQuotes();
  for (const category of QUOTE_CATEGORIES) {
    if (!Array.isArray(record[category])) throw new Error(`Pass 1 output missing ${category}`);
    output[category] = record[category].map((item, index) => {
      if (!item || typeof item !== 'object') throw new Error(`Pass 1 ${category}[${index}] is not an object`);
      const quote = (item as Record<string, unknown>).quote;
      const sourceUrl = (item as Record<string, unknown>).sourceUrl;
      if (typeof quote !== 'string' || typeof sourceUrl !== 'string') throw new Error(`Pass 1 ${category}[${index}] has invalid quote/sourceUrl`);
      return { quote, sourceUrl };
    });
  }
  return output;
}

function assertDecisionOutputShape(value: unknown): NicheDecisionOutput {
  if (!value || typeof value !== 'object') throw new Error('Pass 2 output is not an object');
  const v = value as Record<string, unknown>;
  if (v.status !== 'OK' && v.status !== 'CONFLICT' && v.status !== 'INSUFFICIENT') throw new Error('Pass 2 invalid status');
  const businessNiche = v.businessNiche as Record<string, unknown> | undefined;
  const conflict = v.conflict as Record<string, unknown> | undefined;
  if (!businessNiche || typeof businessNiche !== 'object') throw new Error('Pass 2 missing businessNiche');
  if (typeof businessNiche.value !== 'string' || typeof businessNiche.confidence !== 'number' || !Array.isArray(businessNiche.primaryEvidence) || businessNiche.primaryEvidence.some((x) => typeof x !== 'string')) throw new Error('Pass 2 invalid businessNiche');
  for (const key of ['services', 'customerSegments', 'serviceArea']) {
    if (!Array.isArray(v[key]) || (v[key] as unknown[]).some((x) => typeof x !== 'string')) throw new Error(`Pass 2 invalid ${key}`);
  }
  if (typeof v.language !== 'string') throw new Error('Pass 2 invalid language');
  if (!conflict || typeof conflict !== 'object') throw new Error('Pass 2 missing conflict');
  if (!((typeof conflict.declaredCandidate === 'string' || conflict.declaredCandidate === null) && (typeof conflict.websiteCandidate === 'string' || conflict.websiteCandidate === null) && typeof conflict.explanation === 'string')) throw new Error('Pass 2 invalid conflict');
  return v as unknown as NicheDecisionOutput;
}

function assertStructuredOutput(pass: 1 | 2, value: unknown): QuoteExtractionOutput | NicheDecisionOutput {
  return pass === 1 ? assertQuoteOutputShape(value) : assertDecisionOutputShape(value);
}

function extractOpenAiContent(json: unknown): unknown {
  const response = json as { choices?: Array<{ message?: { content?: unknown } }>; output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown; type?: string }> }> };
  const content = response.choices?.[0]?.message?.content ?? response.output_text ?? response.output?.flatMap((item) => item.content || []).find((item) => typeof item.text === 'string')?.text;
  if (typeof content !== 'string') throw new Error('OpenAI-compatible response did not include string JSON content');
  return JSON.parse(content);
}

async function postOpenAiCompatible(request: NicheLLMRequest, mode: 'strict' | 'json'): Promise<unknown> {
  const apiKey = getOpenAiCompatibleKey();
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured for resolveNiche');
  const body = {
    model: getModel(request.modelEnvVar),
    temperature: 0,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userMessage },
    ],
    response_format: mode === 'strict'
      ? { type: 'json_schema', json_schema: { name: strictSchemaName(request.pass), strict: true, schema: request.schema as StructuredSchema } }
      : { type: 'json_object' },
  };
  const response = await fetch(`${getOpenAiCompatibleBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`OpenAI-compatible ${body.model} ${mode} call failed: ${response.status} ${text}`);
    (error as Error & { providerStatus?: number; providerBody?: string }).providerStatus = response.status;
    (error as Error & { providerStatus?: number; providerBody?: string }).providerBody = text;
    throw error;
  }
  return extractOpenAiContent(await response.json());
}

function isStrictJsonSchemaUnsupported(error: unknown): boolean {
  const status = (error as { providerStatus?: number }).providerStatus;
  const body = String((error as { providerBody?: string }).providerBody || (error as Error)?.message || '').toLowerCase();
  return status === 400 && /json_schema|response_format|strict|unsupported|not supported/.test(body);
}

async function callStructured(request: NicheLLMRequest): Promise<QuoteExtractionOutput | NicheDecisionOutput> {
  try {
    return assertStructuredOutput(request.pass, await postOpenAiCompatible(request, 'strict'));
  } catch (error) {
    if (!isStrictJsonSchemaUnsupported(error)) throw error;
    console.warn('[niche-resolution] Strict json_schema unsupported; falling back to json mode', error);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return assertStructuredOutput(request.pass, await postOpenAiCompatible(request, 'json'));
    } catch (error) {
      lastError = error;
      console.warn(`[niche-resolution] JSON mode schema validation failed on attempt ${attempt + 1}`, error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('JSON mode schema validation failed after retry');
}

export async function callStructuredForTests(request: NicheLLMRequest): Promise<QuoteExtractionOutput | NicheDecisionOutput> {
  return callStructured(request);
}

async function callNicheLLM(request: NicheLLMRequest): Promise<QuoteExtractionOutput | NicheDecisionOutput> {
  if (nicheLLMForTests) return nicheLLMForTests(request);
  return callStructured(request);
}

function allVerifiedQuoteStrings(verified: QuoteExtractionOutput): Set<string> {
  return new Set(QUOTE_CATEGORIES.flatMap((category) => verified[category].map((q) => q.quote)));
}

function valueHasSupportingDoQuote(value: string, verified: QuoteExtractionOutput, primaryEvidence: string[] = []): boolean {
  const normalizedValue = normalizeComparable(value);
  if (!normalizedValue) return false;
  const doQuotes = [...verified.whatTheyDo, ...verified.selfDescription];
  const providerLikeValue = /\b(provider|supplier|supply|supplies|distributor|distributes|manufacturer|fabricante|proveedor|distribuidor|insumos)\b/i.test(value);
  return doQuotes.some((q) => {
    const normalizedQuote = normalizeComparable(q.quote);
    const directSupport = normalizedQuote.includes(normalizedValue) || normalizedValue.includes(normalizedQuote) || primaryEvidence.includes(q.quote);
    if (directSupport) return true;
    if (!providerLikeValue) return false;
    return /\b(supply|supplies|distribute|distributes|manufacture|manufactures|fabricamos|distribuimos|proveemos|suministramos|insumos)\b/i.test(q.quote);
  });
}

function intersectsSegment(value: string, segments: string[]): boolean {
  const niche = normalizeComparable(value);
  if (!niche) return false;
  return segments.some((segment) => {
    const s = normalizeComparable(segment);
    return s && (niche === s || niche.includes(s) || s.includes(niche));
  });
}

function applyPostCallValidation(decision: NicheDecisionOutput, verified: QuoteExtractionOutput): NicheDecisionOutput {
  const generic = GENERIC_DENYLIST.has(normalizeComparable(decision.businessNiche.value));
  if (decision.status === 'OK' && (decision.businessNiche.confidence < 0.6 || generic)) {
    return { ...decision, status: 'INSUFFICIENT' };
  }

  if (decision.status === 'OK') {
    const quoteSet = allVerifiedQuoteStrings(verified);
    const evidenceOk = decision.businessNiche.primaryEvidence.every((item) => {
      if (item === 'declared service' || /\b(owner|client|submitted|declared)\b/i.test(item)) return true;
      if (quoteSet.has(item)) return true;
      const normalizedItem = normalizeForVerification(item);
      return [...quoteSet].some((quote) => normalizedItem.includes(normalizeForVerification(quote)));
    });
    if (!evidenceOk) throw new Error('primaryEvidence failed validation');

    if (intersectsSegment(decision.businessNiche.value, decision.customerSegments) && !valueHasSupportingDoQuote(decision.businessNiche.value, verified, decision.businessNiche.primaryEvidence)) {
      return {
        ...decision,
        status: 'CONFLICT',
        conflict: {
          declaredCandidate: null,
          websiteCandidate: decision.businessNiche.value,
          explanation: 'The chosen niche matches a customer segment without WHAT_THEY_DO or SELF_DESCRIPTION support.',
        },
      };
    }
  }
  return decision;
}

async function hashProfile(profile: unknown): Promise<string> {
  const text = JSON.stringify(profile);
  const globalCrypto = globalThis.crypto;
  if (globalCrypto?.subtle) {
    const digest = await globalCrypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return String(text.length);
}

function withDiagnostics(decision: NicheDecisionOutput, input: NicheInput, pack: EvidencePack, verification: VerifiedQuotesResult, profileHash: string): NicheResult {
  return {
    ...decision,
    method: 'two_pass_llm',
    needsReview: decision.status !== 'OK',
    profileHash,
    diagnostics: {
      packCharCount: pack.packCharCount,
      pagesIncluded: pack.pagesIncluded,
      submittedServicePresent: pack.submittedServicePresent,
      crawlQuality: pack.crawlQuality,
      bodyCharCount: pack.bodyCharCount,
      llmPassesSkipped: false,
      quotesExtracted: verification.extracted,
      quotesVerified: {
        whatTheyDo: verification.verified.whatTheyDo.length,
        whoTheyServe: verification.verified.whoTheyServe.length,
        whereTheyOperate: verification.verified.whereTheyOperate.length,
        selfDescription: verification.verified.selfDescription.length,
      },
      quotesDropped: verification.dropped,
    },
  };
}

export async function resolveNiche(input: NicheInput): Promise<NicheResult> {
  const pack = buildEvidencePack(input);
  await logNicheDiagnostic(input.leadId, {
    stage: 'pack_built',
    packCharCount: pack.packCharCount,
    pagesIncluded: pack.pagesIncluded,
    submittedServicePresent: pack.submittedServicePresent,
    crawlQuality: pack.crawlQuality,
    bodyCharCount: pack.bodyCharCount,
  });

  if (input.crawl.crawlQuality === 'failed' || pack.bodyCharCount < 500) {
    const result = submittedOnlyResult(input, pack, input.crawl.crawlQuality === 'failed' ? 'crawl_failed_or_unavailable' : 'pack_body_under_500_chars');
    await logNicheDiagnostic(input.leadId, { stage: 'degraded_mode', resultStatus: result.status, method: result.method, reason: result.diagnostics.degradedReason });
    return result;
  }

  let rawQuotes: QuoteExtractionOutput;
  try {
    rawQuotes = validateQuoteOutput(await callNicheLLM({
      pass: 1,
      modelEnvVar: 'NICHE_PASS1_MODEL',
      systemPrompt: PASS_1_SYSTEM_PROMPT,
      userMessage: buildPass1UserMessage(input, pack),
      schema: PASS_1_SCHEMA,
    }));
  } catch (error) {
    console.warn('[niche-resolution] Pass 1 structured extraction failed; degrading to submitted-only path', error);
    await logPass1StructuredFailure(input.leadId, error);
    const result = submittedOnlyResult(input, pack, 'pass_1_structured_output_failed_after_retry');
    await logNicheDiagnostic(input.leadId, { stage: 'degraded_mode', resultStatus: result.status, method: result.method, reason: result.diagnostics.degradedReason });
    return result;
  }
  const verification = verifyQuotes(rawQuotes, pack.text);
  await logNicheDiagnostic(input.leadId, {
    stage: 'quotes_verified',
    quotesExtracted: verification.extracted,
    quotesVerified: {
      whatTheyDo: verification.verified.whatTheyDo.length,
      whoTheyServe: verification.verified.whoTheyServe.length,
      whereTheyOperate: verification.verified.whereTheyOperate.length,
      selfDescription: verification.verified.selfDescription.length,
    },
    quotesDropped: verification.dropped,
    droppedRatio: verification.droppedRatio,
  });

  if (verification.droppedRatio > 0.3) {
    const result = submittedOnlyResult(input, pack, 'quote_verification_failed_over_30_percent');
    result.diagnostics.quotesExtracted = verification.extracted;
    result.diagnostics.quotesVerified = {
      whatTheyDo: verification.verified.whatTheyDo.length,
      whoTheyServe: verification.verified.whoTheyServe.length,
      whereTheyOperate: verification.verified.whereTheyOperate.length,
      selfDescription: verification.verified.selfDescription.length,
    };
    result.diagnostics.quotesDropped = verification.dropped;
    return result;
  }

  let decision: NicheDecisionOutput;
  try {
    decision = applyPostCallValidation(validateDecisionShape(await callNicheLLM({
      pass: 2,
      modelEnvVar: 'NICHE_PASS2_MODEL',
      systemPrompt: PASS_2_SYSTEM_PROMPT,
      userMessage: buildPass2UserMessage(input, verification.verified, pack),
      schema: PASS_2_SCHEMA,
    })), verification.verified);
  } catch (firstError) {
    console.warn('[niche-resolution] Pass 2 validation failed; retrying once', firstError);
    try {
      decision = applyPostCallValidation(validateDecisionShape(await callNicheLLM({
        pass: 2,
        modelEnvVar: 'NICHE_PASS2_MODEL',
        systemPrompt: PASS_2_SYSTEM_PROMPT,
        userMessage: buildPass2UserMessage(input, verification.verified, pack),
        schema: PASS_2_SCHEMA,
      })), verification.verified);
    } catch {
      const result = submittedOnlyResult(input, pack, 'pass_2_primary_evidence_validation_failed_after_retry');
      result.diagnostics.quotesExtracted = verification.extracted;
      result.diagnostics.quotesDropped = verification.dropped;
      return result;
    }
  }

  if (decision.status === 'INSUFFICIENT' && input.submittedPrimaryService?.trim()) {
    const result = submittedOnlyResult(input, pack, 'pass_2_insufficient_with_submitted_service');
    result.diagnostics.quotesExtracted = verification.extracted;
    result.diagnostics.quotesDropped = verification.dropped;
    return result;
  }

  const profileHash = await hashProfile({ leadId: input.leadId, decision, verifiedQuotes: verification.verified });
  const result = withDiagnostics(decision, input, pack, verification, profileHash);
  await logNicheDiagnostic(input.leadId, { stage: 'resolved', status: result.status, method: result.method, businessNiche: result.businessNiche, profileHash });
  return result;
}
