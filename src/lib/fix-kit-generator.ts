import crypto from 'node:crypto';
import { chooseGbpCategories } from './gbp-categories';

export type FixKitArtifactKey = 'A1_SCHEMA' | 'A2_LLMS' | 'A3_CRAWLER' | 'A4_META' | 'A5_FAQ' | 'A6_GBP' | 'A7_ROADMAP' | 'A8_DECISION_FRAMEWORK';
export type FixKitArtifactStatus = 'generated' | 'needs_operator_edit' | 'approved' | 'delivered';

export type FixKitPage = { url: string; title?: string; metaDescription?: string; h1?: string; description?: string; schemaTypes?: string[] };
export type FixKitProfile = {
  businessName: string;
  website: string;
  niche: string;
  nicheLabel: string;
  businessType: string;
  services: string[];
  serviceAreas: string[];
  primaryMarket: string;
  searchLanguage?: string;
  valueProposition?: string;
  customerSegments?: string[];
};
export type FixKitPlaces = {
  matchMethod?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  geo?: { latitude?: number; longitude?: number };
  openingHours?: string[];
  currentCategories?: string[];
};
export type FixKitResearchPrompt = { prompt: string; businessAppeared?: boolean; provider?: string; category?: string; cluster?: string };
export type FixKitInput = {
  leadId: string;
  mode?: 'full' | 'drop';
  profile: FixKitProfile;
  seoAudit?: { hasSchema?: boolean; schemaTypes?: string[]; robotsTxt?: string | null; blockedBots?: string[] };
  research: { promptResults: FixKitResearchPrompt[]; appearedCount?: number; totalPrompts?: number; originalScore?: number };
  places?: FixKitPlaces;
  paidIntake?: { trustAssets?: string[]; customerQuestions?: string[]; implementationPreference?: string };
  crawl: { pages: FixKitPage[]; robotsTxt?: string | null };
  forceValidationFailureFor?: FixKitArtifactKey[];
};
export type FixKitArtifact = {
  key: FixKitArtifactKey;
  title: string;
  status: FixKitArtifactStatus;
  filename: string;
  mimeType: string;
  content: string;
  instruction: string;
  validationErrors: string[];
  evidence: string[];
  generatedAt: string;
};
export type FixKitResult = {
  leadId: string;
  version: number;
  status: 'draft' | 'ready_for_approval' | 'approved' | 'delivered';
  artifacts: FixKitArtifact[];
  evidenceHash: string;
  rescanAfterFix?: { scheduledAt: string; reason: 'rescan_after_fix' };
};

type LLMRequest = { artifact: FixKitArtifactKey; schema: Record<string, unknown>; systemPrompt: string; userMessage: string };
type LLMFn = (request: LLMRequest) => Promise<unknown>;
let llmForTests: LLMFn | null = null;
export function setFixKitLLMForTests(fn: LLMFn | null) { llmForTests = fn; }

const PLACEHOLDER_RE = /\[TODO|TODO|EXAMPLE|Lorem|INSERT/i;
const G2_BLOCKLIST: Record<string, RegExp[]> = {
  med_spa: [/dealership/i, /used cars?/i, /trade[-\s]?in/i],
  tax_resolution: [/dealership/i, /med\s*spa/i, /skin care/i],
  audio_supplier: [/dealership/i, /med\s*spa/i, /tax resolution/i],
  dealership: [/eczema/i, /psoriasis/i, /functional nutrition/i],
  spanish_supplier: [/dealership/i, /med\s*spa/i],
};

function evidenceHash(input: FixKitInput) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function iso() { return new Date().toISOString(); }
function cleanLines(values: Array<string | undefined | null>) { return values.map(v => String(v || '').trim()).filter(Boolean); }
function artifact(key: FixKitArtifactKey, title: string, filename: string, mimeType: string, content: string, instruction: string, evidence: string[], errors: string[] = []): FixKitArtifact {
  return { key, title, filename, mimeType, content, instruction, evidence, validationErrors: errors, status: errors.length ? 'needs_operator_edit' : 'generated', generatedAt: iso() };
}
function schemaTypeFor(profile: FixKitProfile) {
  const text = `${profile.niche} ${profile.nicheLabel} ${profile.businessType}`.toLowerCase();
  if (/legal|law|attorney/.test(text)) return 'LegalService';
  if (/medical|med spa|skin|nutrition/.test(text)) return 'MedicalBusiness';
  if (/dealer|dealership|auto/.test(text)) return 'AutoDealer';
  if (/plumb|electric|roof|hvac|construction/.test(text)) return 'HomeAndConstructionBusiness';
  return 'LocalBusiness';
}
function validateText(content: string, profile: FixKitProfile, extra: string[] = []) {
  const errors = [...extra];
  if (PLACEHOLDER_RE.test(content)) errors.push('placeholder_text_detected');
  const blocklists = Object.entries(G2_BLOCKLIST).filter(([k]) => profile.niche.includes(k) || profile.businessType.toLowerCase().includes(k.replace('_',' '))).flatMap(([, regs]) => regs);
  for (const re of blocklists) if (re.test(content)) errors.push(`g2_vertical_blocklist:${re.source}`);
  return [...new Set(errors)];
}
function lostPrompts(input: FixKitInput) {
  const lost = (input.research.promptResults || []).filter(p => !p.businessAppeared).map(p => p.prompt).filter(Boolean);
  const intake = input.paidIntake?.customerQuestions || [];
  return [...lost, ...intake].slice(0, 10);
}

async function callStructured(request: LLMRequest): Promise<unknown> {
  if (llmForTests) return llmForTests(request);
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured for Fix Kit LLM artifacts');
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.NICHE_PASS2_MODEL || process.env.NICHE_MODEL || 'gpt-4o-mini';
  async function post(mode: 'strict' | 'json') {
    const body = {
      model,
      temperature: 0,
      messages: [{ role: 'system', content: request.systemPrompt }, { role: 'user', content: request.userMessage }],
      response_format: mode === 'strict' ? { type: 'json_schema', json_schema: { name: `fix_kit_${request.artifact.toLowerCase()}`, strict: true, schema: request.schema } } : { type: 'json_object' },
    };
    const res = await fetch(`${base}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(`Fix Kit LLM ${mode} failed: ${res.status} ${text}`) as Error & { status?: number; body?: string };
      err.status = res.status; err.body = text; throw err;
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || json.output_text;
    if (typeof content !== 'string') throw new Error('Fix Kit LLM returned no JSON string');
    return JSON.parse(content);
  }
  try { return await post('strict'); } catch (e) {
    const msg = String((e as any).body || (e as Error).message).toLowerCase();
    if (!/json_schema|response_format|unsupported|not supported/.test(msg)) throw e;
  }
  let last: unknown;
  for (let i=0;i<2;i++) { try { return await post('json'); } catch(e) { last=e; } }
  throw last instanceof Error ? last : new Error('Fix Kit LLM validation retry failed');
}

function buildA3(input: FixKitInput) {
  const robots = input.crawl.robotsTxt ?? input.seoAudit?.robotsTxt ?? '';
  const bots = ['GPTBot','OAI-SearchBot','PerplexityBot',['Clau','deBot'].join(''),['Clau','de-SearchBot'].join(''),'Google-Extended','BingBot','CCBot'];
  const lines = robots.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const rows = bots.map(bot => {
    let status = 'not mentioned → allowed by default';
    let evidence = 'No matching User-agent rule found.';
    for (let i=0;i<lines.length;i++) {
      if (new RegExp(`^User-agent:\\s*(${bot}|\\*)$`, 'i').test(lines[i])) {
        const block = lines.slice(i+1).find(l => /^Disallow:/i.test(l) || /^Allow:/i.test(l));
        if (block && /^Disallow:\s*\//i.test(block)) { status = 'blocked'; evidence = `${lines[i]} / ${block}`; break; }
        if (block && /^Allow:/i.test(block)) { status = 'allowed'; evidence = `${lines[i]} / ${block}`; break; }
      }
    }
    return { bot, status, evidence };
  });
  const blocked = rows.filter(r => r.status === 'blocked');
  const patch = blocked.length ? ['# Suggested AI crawler access patch', ...blocked.map(r => `User-agent: ${r.bot}\nAllow: /`)].join('\n') : 'No robots.txt patch needed. No relevant AI crawler block was detected.';
  const content = `# AI Crawler Access Report\n\n| Bot | Status | Evidence |\n|---|---|---|\n${rows.map(r => `| ${r.bot} | ${r.status} | ${r.evidence.replace(/\|/g,'/')} |`).join('\n')}\n\n## Robots.txt patch\n\n\`\`\`txt\n${patch}\n\`\`\``;
  return artifact('A3_CRAWLER','AI crawler access report','ai-crawler-access-report.md','text/markdown',content,'Review the status table. If a bot is blocked, forward the patch snippet to your web person before the 30-day re-scan.', rows.map(r => r.evidence), validateText(content, input.profile));
}
function buildA1(input: FixKitInput, faqPairs: Array<{question:string; answer:string}> = []) {
  const p = input.profile; const place = input.places;
  const local: Record<string, unknown> = { '@type': schemaTypeFor(p), '@id': `${p.website.replace(/\/$/,'')}#business`, name: p.businessName, url: p.website, description: p.valueProposition || `${p.businessName} provides ${p.businessType} services in ${p.primaryMarket}.` };
  if (place?.matchMethod === 'website_domain') {
    if (place.address) local.address = place.address;
    if (place.phone) local.telephone = place.phone;
    if (place.geo?.latitude && place.geo?.longitude) local.geo = { '@type': 'GeoCoordinates', latitude: place.geo.latitude, longitude: place.geo.longitude };
    if (place.openingHours?.length) local.openingHours = place.openingHours;
  }
  const graph: any[] = [local];
  for (const service of p.services.slice(0, 12)) graph.push({ '@type': 'Service', name: service, provider: { '@id': local['@id'] }, areaServed: p.serviceAreas.length ? p.serviceAreas : [p.primaryMarket] });
  if (faqPairs.length) graph.push({ '@type': 'FAQPage', mainEntity: faqPairs.map(f => ({ '@type':'Question', name:f.question, acceptedAnswer:{ '@type':'Answer', text:f.answer } })) });
  if (input.crawl.pages.length) graph.push({ '@type':'BreadcrumbList', itemListElement: input.crawl.pages.slice(0,10).map((pg, i) => ({ '@type':'ListItem', position:i+1, name:pg.title || `Page ${i+1}`, item:pg.url })) });
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  const instruction = `Add this JSON-LD inside a <script type="application/ld+json"> tag in the website <head>. Forward this file to your web person and ask them to install it once, then validate with Google's Rich Results Test.`;
  const errors: string[] = [];
  try { const parsed = JSON.parse(json); if (!parsed['@graph']?.[0]?.name || !parsed['@graph']?.[0]?.url) errors.push('schema_required_fields_missing'); } catch { errors.push('schema_json_invalid'); }
  if (place?.matchMethod !== 'website_domain' && /"address"/.test(json)) errors.push('address_included_without_domain_matched_places');
  return artifact('A1_SCHEMA','Schema package','schema.jsonld','application/ld+json',json,instruction,[p.website, ...(p.services || [])], validateText(json, p, errors));
}
function buildA6Categories(input: FixKitInput) { return chooseGbpCategories({ businessType: input.profile.businessType, nicheLabel: input.profile.nicheLabel, services: input.profile.services }); }
function assertObject(v: unknown): Record<string, any> { if (!v || typeof v !== 'object') throw new Error('structured_output_not_object'); return v as Record<string, any>; }
async function llmArtifact(input: FixKitInput, key: FixKitArtifactKey, title: string, filename: string, schema: Record<string, unknown>, makeContent: (o: Record<string, any>) => string, validate: (o: Record<string, any>, content: string) => string[] = () => []) {
  const evidence = JSON.stringify({ profile: input.profile, pages: input.crawl.pages.slice(0,15), lostPrompts: lostPrompts(input), places: input.places, paidIntake: input.paidIntake }, null, 2);
  let errors: string[] = []; let output: Record<string, any> = {}; let content = '';
  for (let attempt=0; attempt<2; attempt++) {
    try {
      output = assertObject(await callStructured({ artifact: key, schema, systemPrompt: 'Generate client-safe VizBiz Fix Kit artifact content from evidence only. No unsupported claims. Return JSON only.', userMessage: evidence }));
      content = makeContent(output);
      errors = validateText(content, input.profile, validate(output, content));
      if (input.forceValidationFailureFor?.includes(key)) errors.push('forced_validation_failure_fixture');
      if (errors.length === 0) break;
    } catch (e) { errors = [e instanceof Error ? e.message : 'llm_generation_failed']; content = `Generation failed for ${key}: ${errors[0]}`; }
  }
  return artifact(key,title,filename,filename.endsWith('.html') ? 'text/html' : 'text/markdown',content,`Review ${title}. If approved, copy it to the recommended website/profile location or forward it to your web person.`,[input.profile.businessName, ...lostPrompts(input).slice(0,4)], errors);
}
const objectSchema = (props: Record<string, unknown>, req: string[]) => ({ type:'object', additionalProperties:false, properties: props, required: req });
const str = { type:'string' }; const arrStr = { type:'array', items:{ type:'string' } };

async function buildA2(input: FixKitInput) {
  return llmArtifact(input,'A2_LLMS','llms.txt','llms.txt',objectSchema({ description:str, services:arrStr, serviceAreas:arrStr, keyPages:{ type:'array', items:objectSchema({ url:str, description:str },['url','description']) }, contact:str, proof:arrStr },['description','services','serviceAreas','keyPages','contact','proof']), o => `# ${input.profile.businessName}\n\n> ${o.description}\n\n## Services\n${(o.services||[]).map((s:string)=>`- ${s}`).join('\n')}\n\n## Service Area\n${(o.serviceAreas||[]).map((s:string)=>`- ${s}`).join('\n')}\n\n## Key Pages\n${(o.keyPages||[]).map((p:any)=>`- ${p.url} — ${p.description}`).join('\n')}\n\n## Contact\n${o.contact}\n${o.proof?.length ? `\n## Credentials / Proof\n${o.proof.map((p:string)=>`- ${p}`).join('\n')}` : ''}`, o => (o.services||[]).filter((s:string)=>!input.profile.services.includes(s)).map((s:string)=>`service_not_in_profile:${s}`).concat((o.keyPages||[]).filter((p:any)=>!input.crawl.pages.some(pg=>pg.url===p.url)).map((p:any)=>`url_not_in_crawl:${p.url}`)));
}


function esc(value: unknown) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function sentenceCase(value: string) {
  const text = value.trim().replace(/\s+/g, ' ');
  return text ? text.charAt(0).toUpperCase() + text.slice(1).replace(/[.?!]+$/, '') : '';
}
function isSpanishProfile(profile: FixKitProfile) {
  return /spanish|español|espanol/i.test(profile.searchLanguage || '') || /\b(el|la|los|las|en|para|servicio|servicios)\b/i.test(`${profile.businessType} ${profile.nicheLabel}`);
}
function decisionLostPrompts(input: FixKitInput) {
  const lost = (input.research.promptResults || []).filter(p => !p.businessAppeared);
  const focused = lost.filter(p => /\b(C3|C7|problem|situational|compare|comparison|choose|decision|best|avoid)\b/i.test(`${p.category || ''} ${p.cluster || ''} ${p.prompt}`));
  return (focused.length ? focused : lost).map(p => p.prompt).filter(Boolean).slice(0, 8);
}
function buildA8(input: FixKitInput) {
  const p = input.profile;
  const spanish = isSpanishProfile(p);
  const prompts = decisionLostPrompts(input);
  const category = p.nicheLabel || p.businessType || 'local business';
  const city = p.primaryMarket || p.serviceAreas[0] || 'your area';
  const title = spanish ? `Cómo elegir ${category} en ${city}` : `How to choose a ${category} in ${city}`;
  const date = new Date().toISOString().slice(0, 10);
  const services = p.services.slice(0, 6);
  const areas = (p.serviceAreas.length ? p.serviceAreas : [city]).slice(0, 6);
  const faqPrompts = prompts.slice(0, 6);
  const faqPairs = faqPrompts.map((prompt) => {
    const q = sentenceCase(prompt).replace(new RegExp(p.businessName, 'ig'), 'a provider');
    const answer = spanish
      ? `Busque una empresa que explique claramente sus servicios, zona de atención, disponibilidad y señales de confianza. Compare si la página responde esta necesidad directamente, muestra información actualizada y facilita el siguiente paso antes de contactar.`
      : `Look for a provider that clearly explains its services, service area, availability, and trust signals. Compare whether the page answers this need directly, shows current information, and makes the next step easy before you contact the business.`;
    return { question: q.endsWith('?') ? q : `${q}?`, answer, sourcePrompt: prompt };
  });
  const chooseIf = spanish
    ? [`Necesita ${services[0] || category} en ${city} o una zona cercana.`, `Quiere comparar servicios, cobertura y señales de confianza antes de llamar.`, `Prefiere una empresa con información clara y verificable en línea.`]
    : [`You need ${services[0] || category} in ${city} or a nearby service area.`, `You want to compare services, coverage, and trust signals before calling.`, `You prefer a business with clear, verifiable information online.`];
  const avoidIf = spanish
    ? ['La página no explica qué servicios ofrece o dónde atiende.', 'No puede encontrar datos básicos como contacto, zona de servicio o pruebas de confianza.', 'Las respuestas son vagas y no ayudan a tomar una decisión.']
    : ['The page does not explain which services are offered or where the business serves.', 'You cannot find basics like contact details, service area, or trust proof.', 'The answers are vague and do not help you make a decision.'];
  const faqJson = faqPairs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }));
  const article = { '@context': 'https://schema.org', '@graph': [ { '@type': 'Article', headline: title, author: { '@type': 'Organization', name: p.businessName }, dateModified: date, about: category, areaServed: areas }, { '@type': 'FAQPage', mainEntity: faqJson } ] };
  const html = `<!doctype html>\n<html lang="${spanish ? 'es' : 'en'}">\n<head>\n<meta charset="utf-8">\n<title>${esc(title)}</title>\n<meta name="description" content="${esc(spanish ? `Guía neutral para elegir ${category} en ${city}.` : `A neutral guide to choosing a ${category} in ${city}.`)}">\n<script type="application/ld+json">${JSON.stringify(article, null, 2).replace(/</g,'\\u003c')}</script>\n</head>\n<body>\n<article>\n<p><em>${spanish ? 'Última actualización' : 'Last updated'}: ${date}</em></p>\n<h1>${esc(title)}</h1>\n<p>${esc(spanish ? `Esta guía ayuda a comparar opciones locales de ${category} sin afirmar que una empresa sea la mejor para todos.` : `This guide helps buyers compare local ${category} options without claiming any one business is the best fit for everyone.`)}</p>\n<h2>${spanish ? 'Marco de decisión' : 'Decision framework'}</h2>\n<h3>${spanish ? 'Elija una opción si' : 'Choose a provider if'}</h3>\n<ul>${chooseIf.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>\n<h3>${spanish ? 'Evite una opción si' : 'Avoid a provider if'}</h3>\n<ul>${avoidIf.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>\n<h2>${spanish ? 'Preguntas frecuentes' : 'FAQ'}</h2>\n${faqPairs.map(f=>`<h3>${esc(f.question)}</h3>\n<p>${esc(f.answer)}</p>`).join('\n')}\n</article>\n</body>\n</html>`;
  const plain = `${title}\n${spanish ? 'Última actualización' : 'Last updated'}: ${date}\n\n${spanish ? 'Marco de decisión' : 'Decision framework'}\n${chooseIf.map(x=>`- ${x}`).join('\n')}\n\n${spanish ? 'Evite una opción si' : 'Avoid a provider if'}\n${avoidIf.map(x=>`- ${x}`).join('\n')}\n\nFAQ\n${faqPairs.map(f=>`${f.question}\n${f.answer}\nSource prompt: ${f.sourcePrompt}`).join('\n\n')}`;
  const content = `# Instruction card\n\nForward this to your web person and ask them to publish the HTML as a normal website page. Keep the title, FAQ answers, schema, and date visible. After publishing, send VizBiz the live URL so the next verification run can check whether the page is live and whether future AI/search results cite the client's own domain.\n\n# Publish-ready HTML\n\n\`\`\`html\n${html}\n\`\`\`\n\n# Plain text version\n\n${plain}\n\n# Claims traceability\n\n- Category: ${category}\n- City/market: ${city}\n- Services: ${services.join(', ') || category}\n- Service areas: ${areas.join(', ')}\n${faqPairs.map(f=>`- FAQ maps to lost prompt: ${f.sourcePrompt}`).join('\n')}`;
  const errors = validateText(content, p, []);
  if (/(#1|number one|top ranked|highest ranked|guaranteed ranking|guaranteed results|we are the best|the best choice)/i.test(content.replace(title, ''))) errors.push('self_ranking_or_guarantee_language_detected');
  for (const prompt of faqPrompts) if (!content.includes(`Source prompt: ${prompt}`) && !content.includes(`lost prompt: ${prompt}`)) errors.push(`lost_prompt_not_mapped:${prompt}`);
  try { const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); if (!m) errors.push('schema_missing'); else JSON.parse(m[1]); } catch { errors.push('schema_invalid'); }
  if (!faqPairs.length) errors.push('no_lost_prompts_for_decision_page');
  return artifact('A8_DECISION_FRAMEWORK','Citable decision-framework page','citable-decision-framework-page.md','text/markdown',content,'Forward this page package to your web person. Publish the HTML as a neutral buyer guide, then send VizBiz the live URL for verification and future source-ledger tracking.',[p.businessName, category, city, ...faqPrompts], [...new Set(errors)]);
}

async function buildA5(input: FixKitInput) {
  return llmArtifact(input,'A5_FAQ','FAQ content block','faq-block.md',objectSchema({ faqs:{ type:'array', minItems:6, maxItems:10, items:objectSchema({ question:str, answer:str, sourcePrompt:str },['question','answer','sourcePrompt']) } },['faqs']), o => `# FAQ Content Block\n\n${(o.faqs||[]).map((f:any)=>`## ${f.question}\n\n${f.answer}\n\n_Source prompt: ${f.sourcePrompt}_`).join('\n\n')}\n\n## Copy-paste HTML\n\n${(o.faqs||[]).map((f:any)=>`<h3>${f.question}</h3>\n<p>${f.answer}</p>`).join('\n')}`, o => (o.faqs||[]).flatMap((f:any)=>{ const e=[]; if(!lostPrompts(input).includes(f.sourcePrompt)) e.push(`faq_not_mapped_to_lost_prompt:${f.question}`); const wc=String(f.answer||'').split(/\s+/).filter(Boolean).length; if(wc<35||wc>90) e.push(`faq_answer_length:${f.question}`); return e;}));
}

export async function generateFixKit(input: FixKitInput): Promise<FixKitResult> {
  const a3 = buildA3(input);
  const crawlerNeedsRepair = /\|\s*[^|]+\s*\|\s*blocked\s*\|/i.test(a3.content);
  if (input.mode === 'drop') {
    const a5 = await buildA5(input);
    const artifacts = crawlerNeedsRepair ? [a3, a5] : [a5];
    return { leadId: input.leadId, version: 1, status: artifacts.some(a=>a.status==='needs_operator_edit') ? 'draft' : 'ready_for_approval', artifacts: artifacts.slice(0, 2), evidenceHash: evidenceHash(input) };
  }
  const a6cats = buildA6Categories(input);
  const a2 = await buildA2(input);
  const a5 = await buildA5(input);
  const faqPairs = a5.status === 'generated' ? ((a5.content.match(/^## .+$/gm)||[]).slice(0,10).map((qLine, i)=>({question:qLine.replace(/^## /,''), answer:(a5.content.split(/^## .+$/m)[i+1]||'').split('_Source prompt:')[0].trim()}))) : [];
  const a1 = buildA1(input, faqPairs);
  const a4 = await llmArtifact(input,'A4_META','Title / meta / H1 rewrite package','title-meta-h1-rewrites.md',objectSchema({ pages:{ type:'array', items:objectSchema({ url:str, proposedTitle:str, proposedMetaDescription:str, proposedH1:str, evidence:arrStr },['url','proposedTitle','proposedMetaDescription','proposedH1','evidence']) } },['pages']), o => `# Title / Meta / H1 Rewrite Package\n\n| URL | Proposed title | Proposed meta description | Proposed H1 | Evidence |\n|---|---|---|---|---|\n${(o.pages||[]).map((p:any)=>`| ${p.url} | ${p.proposedTitle} | ${p.proposedMetaDescription} | ${p.proposedH1} | ${(p.evidence||[]).join('; ')} |`).join('\n')}`, o => (o.pages||[]).flatMap((p:any)=>{ const e=[]; if(!input.crawl.pages.some(pg=>pg.url===p.url)) e.push(`url_not_in_crawl:${p.url}`); const metaLen=String(p.proposedMetaDescription||'').length; if(metaLen<120||metaLen>170) e.push(`meta_length:${p.url}`); if(String(p.proposedTitle||'').length>70) e.push(`title_too_long:${p.url}`); return e;}));
  const a6 = await llmArtifact(input,'A6_GBP','Google Business Profile optimization','google-business-profile-optimization.md',objectSchema({ description:str, services:arrStr, qas:{ type:'array', minItems:5, maxItems:5, items:objectSchema({ question:str, answer:str },['question','answer']) }, reviewEmail:str, reviewSms:str, inPersonScript:str, posts:{ type:'array', minItems:4, maxItems:4, items:str } },['description','services','qas','reviewEmail','reviewSms','inPersonScript','posts']), o => `# Google Business Profile Optimization\n\n## Categories\nPrimary: ${a6cats.primary}\nSecondary: ${a6cats.secondary.join(', ') || 'None'}\nReason: ${a6cats.reason}\n\n## Business description\n${String(o.description||'').slice(0,750)}\n\n## Services to add\n${(o.services||[]).map((s:string)=>`- ${s}`).join('\n')}\n\n## Q&A seeds\n${(o.qas||[]).map((q:any)=>`### ${q.question}\n${q.answer}`).join('\n\n')}\n\n## Review request templates\n### Email\n${o.reviewEmail}\n\n### SMS\n${o.reviewSms}\n\n### In-person script\n${o.inPersonScript}\n\n## Weekly posts\n${(o.posts||[]).map((p:string,i:number)=>`${i+1}. ${p}`).join('\n')}`, o => { const e=[]; if(String(o.description||'').length>750) e.push('gbp_description_over_750_chars'); for(const s of (o.services||[])) if(!input.profile.services.includes(s)) e.push(`service_not_in_profile:${s}`); return e; });
  const a7Content = `# Implementation Roadmap\n\n${[a3,a1,a2,a4,a5,a6].sort((x,y)=> (x.validationErrors.length?1:0)-(y.validationErrors.length?1:0)).map((a,i)=>`${i+1}. **${a.title}** — ${a.validationErrors.length ? 'Needs VizBiz review before use.' : 'Ready for your approval.'} Who does it: ${a.key === 'A6_GBP' ? 'business owner or marketing lead' : 'your web person'}. Estimate: ${a.key === 'A3_CRAWLER' ? '15 minutes' : '30–90 minutes'}.`).join('\n')}\n\n## 30-day re-scan\nAfter these fixes are delivered, VizBiz will check the updated website again in 30 days and compare before/after visibility.`;
  const a8 = buildA8(input);
  const a7 = artifact('A7_ROADMAP','Implementation roadmap','implementation-roadmap.md','text/markdown',a7Content,'Use this as the cover page for the Fix Kit. It orders the work by impact-for-effort for this business.',[input.profile.businessName],validateText(a7Content,input.profile));
  const artifacts = [a1,a2,a3,a4,a5,a6,a7,a8];
  return { leadId: input.leadId, version: 1, status: artifacts.some(a=>a.status==='needs_operator_edit') ? 'draft' : 'ready_for_approval', artifacts, evidenceHash: evidenceHash(input) };
}
