import { createHash } from 'crypto';

export const BATTERY_V2_VERSION = 'battery-v2:60x8';

export type BatteryCategoryId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8';

export type BatteryPrompt = {
  id: string;
  categoryId: BatteryCategoryId;
  categoryName: string;
  ownerLabel: string;
  text: string;
  trace: string[];
};

export type BatteryProfile = {
  businessName: string;
  city: string;
  market?: string;
  niche?: string;
  businessType?: string;
  targetAudience?: string;
  services?: string[];
  customerSegments?: string[];
  competitors?: string[];
  searchLanguage?: string;
  website?: string;
};

export const BATTERY_CATEGORIES: Record<BatteryCategoryId, { name: string; ownerLabel: string; quota: number; implication: string }> = {
  C1: { name: 'Discovery / recommendation', ownerLabel: 'When customers ask who to choose', quota: 12, implication: 'Strengthen category and service pages so AI can confidently recommend the business for first-choice searches.' },
  C2: { name: 'Service-specific', ownerLabel: 'When customers ask for a specific service', quota: 12, implication: 'Thin or unclear service pages usually lose here; this feeds FAQ and service-page fixes.' },
  C3: { name: 'Problem-first / situational', ownerLabel: 'When customers describe a problem', quota: 8, implication: 'Answer symptom-style questions on the site so AI connects real problems to the business.' },
  C4: { name: 'Comparison / alternatives', ownerLabel: 'When customers compare options', quota: 6, implication: 'Position clearly against named competitors and explain when the business is the better fit.' },
  C5: { name: 'Trust / reputation', ownerLabel: 'When customers check trust', quota: 6, implication: 'Make proof, reviews, credentials, and reassurance easier for AI to cite.' },
  C6: { name: 'Local intent variants', ownerLabel: 'When customers ask nearby or urgent local questions', quota: 6, implication: 'Clarify local service area, hours, urgency, and neighborhood coverage.' },
  C7: { name: 'Objection / decision', ownerLabel: 'When customers ask cost and decision questions', quota: 5, implication: 'Add pricing, process, warranty, and decision-support content.' },
  C8: { name: 'Branded', ownerLabel: 'When customers ask about the business by name', quota: 5, implication: 'Fix entity clarity, hours, services, and stale facts in branded AI answers.' },
};

export const FREE_BATTERY_CATEGORY_ORDER: BatteryCategoryId[] = ['C1', 'C2', 'C3', 'C5', 'C8'];

function clean(value?: string | null): string {
  return String(value || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = clean(raw);
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function isSpanish(language?: string): boolean {
  return /spanish|español|\bes\b/i.test(language || '');
}

function providerType(profile: BatteryProfile): string {
  return clean(profile.businessType || profile.niche || 'local service provider');
}

function market(profile: BatteryProfile): string {
  return clean(profile.market || profile.city || 'their market');
}

function businessNameWithMarket(businessName: string, city: string): string {
  const biz = clean(businessName) || 'the business';
  const place = clean(city);
  if (!place) return biz;
  return biz.toLowerCase().includes(place.toLowerCase()) ? biz : `${biz} ${place}`;
}

function services(profile: BatteryProfile): string[] {
  const primary = providerType(profile);
  return uniq([...(profile.services || []), primary]).slice(0, 8);
}

function segments(profile: BatteryProfile): string[] {
  return uniq(profile.customerSegments || (profile.targetAudience ? [profile.targetAudience] : [])).slice(0, 4);
}

function traceable(parts: Array<string | undefined | null>): string[] {
  return uniq(parts.map((p) => clean(p || '')).filter(Boolean));
}

function symptomFor(service: string, type: string, spanish: boolean): string {
  const s = service.toLowerCase();
  if (spanish) {
    if (/plumb|drain|water|pipe|fontan|plomer/.test(s)) return 'tengo una fuga de agua y necesito ayuda hoy';
    if (/law|legal|abogado|lawyer|attorney/.test(s)) return 'tengo un problema legal urgente y no sé a quién llamar';
    if (/dent|clinic|molar|diente/.test(s)) return 'me duele un diente y necesito atención esta semana';
    if (/tax|account|impuesto|contab/.test(s)) return 'necesito ayuda con impuestos y fechas límite';
    return `tengo un problema con ${service} y necesito una solución confiable`;
  }
  if (/plumb|drain|water|pipe|sewer|leak/.test(s)) return 'my basement is flooding and I need someone today';
  if (/law|legal|lawyer|attorney|injury/.test(s)) return 'I was offered a low insurance settlement and need advice';
  if (/dent|clinic|tooth|teeth/.test(s)) return 'I have tooth pain and need an appointment this week';
  if (/tax|account|bookkeep|audit|cra|irs/.test(s)) return 'I need help with taxes, deadlines, and audit risk';
  if (/clean|janitor|mop|sanitize/.test(s)) return 'our office needs reliable cleaning without disrupting staff';
  if (/car|auto|vehicle|dealer|dealership|trade|financ|lease|inventory|used/.test(`${s} ${type}`)) return 'I need to replace my car and want a trustworthy dealership';
  return `I have a problem with ${service} and need a trustworthy ${type}`;
}

function makePrompt(id: BatteryCategoryId, index: number, text: string, profile: BatteryProfile, trace: string[]): BatteryPrompt {
  const cat = BATTERY_CATEGORIES[id];
  return {
    id: `${id}.${index + 1}`,
    categoryId: id,
    categoryName: cat.name,
    ownerLabel: cat.ownerLabel,
    text: clean(text),
    trace: traceable([profile.businessName, market(profile), providerType(profile), ...trace]),
  };
}

function fillCategory(id: BatteryCategoryId, candidates: string[], quota: number, profile: BatteryProfile, trace: string[]): BatteryPrompt[] {
  const unique = uniq(candidates).filter((p) => p.length > 6);
  const out: BatteryPrompt[] = [];
  let cursor = 0;
  while (out.length < quota && unique.length > 0) {
    out.push(makePrompt(id, out.length, unique[cursor % unique.length], profile, trace));
    cursor++;
    if (cursor > quota * 3) break;
  }
  return out.slice(0, quota);
}

export function generateBatteryV2(profile: BatteryProfile, tier: 'free' | 'paid' = 'paid'): BatteryPrompt[] {
  const spanish = isSpanish(profile.searchLanguage);
  const biz = clean(profile.businessName) || 'the business';
  const city = market(profile);
  const type = providerType(profile);
  const serviceList = services(profile);
  const primary = serviceList[0] || type;
  const segmentList = segments(profile);
  const comps = uniq(profile.competitors || []).slice(0, 2);

  const phrases = {
    best: spanish ? 'mejor' : 'best',
    recommend: spanish ? 'recomiéndame' : 'recommend',
    trusted: spanish ? 'confiable' : 'trusted',
    near: spanish ? 'cerca de' : 'near',
    reviews: spanish ? 'reseñas' : 'reviews',
    cost: spanish ? 'cuánto cuesta' : 'how much does',
  };

  const c1 = fillCategory('C1', [
    `${phrases.best} ${type} in ${city}`,
    `${phrases.recommend} a ${type} in ${city} who is ${phrases.trusted}`,
    `who should I call for ${primary} in ${city}`,
    `I need a ${type} in ${city} who can help this week`,
    `${primary} ${phrases.near} ${city} with strong reviews`,
    ...serviceList.map((s) => `${phrases.recommend} a ${type} for ${s} in ${city}`),
  ], 12, profile, [primary, ...serviceList]);

  const c2 = fillCategory('C2', serviceList.flatMap((s) => [
    `who can help with ${s} in ${city}`,
    `which ${type} handles ${s} for ${segmentList[0] || 'local customers'} in ${city}`,
    `where should I go for ${s} near ${city}`,
  ]), 12, profile, serviceList);

  const c3 = fillCategory('C3', serviceList.map((s) => `${symptomFor(s, type, spanish)} in ${city}`), 8, profile, serviceList);

  const c4 = fillCategory('C4', comps.length ? comps.flatMap((c) => [
    `${biz} vs ${c}`,
    `alternatives to ${c} in ${city}`,
    `is ${c} the best option for ${primary} in ${city}`,
  ]) : [
    `${biz} vs other ${type}s in ${city}`,
    `alternatives to leading ${type}s in ${city}`,
    `which ${type} should I choose in ${city}`,
  ], 6, profile, comps.length ? comps : [type]);

  const c5 = fillCategory('C5', [
    `can I trust a ${type} with ${primary} in ${city}`,
    `${type} with verified proof and reviews in ${city}`,
    `most trustworthy ${type} for ${primary} in ${city}`,
    `is ${biz} reputable`,
    `${phrases.reviews} of ${biz} — what do people say`,
  ], 6, profile, [biz, primary]);

  const c6 = fillCategory('C6', [
    `${primary} near me`,
    `${primary} open now in ${city}`,
    `fastest ${primary} around ${city}`,
    `affordable ${primary} around ${city}`,
    `${type} near ${city} available this week`,
    `${primary} close to ${city}`,
  ], 6, profile, [primary, city]);

  const c7 = fillCategory('C7', [
    `${phrases.cost} ${primary} cost in ${city}`,
    `is it worth hiring a ${type} for ${primary}`,
    `do I need a ${type} or can I handle ${primary} myself`,
    `what should I ask before hiring a ${type} in ${city}`,
    `how do I choose the right ${type} for ${primary}`,
  ], 5, profile, [primary, type]);

  const c8 = fillCategory('C8', [
    `what services does ${biz} offer`,
    `is ${businessNameWithMarket(biz, city)} open today`,
    `how do I contact ${biz}`,
    `${biz} hours location contact`,
    `is ${biz} the right choice for ${primary}`,
    `${biz} ${phrases.reviews}`,
  ], 5, profile, [biz]);

  const paid = [...c1, ...c2, ...c3, ...c4, ...c5, ...c6, ...c7, ...c8].slice(0, 60);
  if (tier === 'paid') return paid;

  return FREE_BATTERY_CATEGORY_ORDER.map((categoryId) => paid.find((p) => p.categoryId === categoryId)).filter(Boolean) as BatteryPrompt[];
}

export function hashBatteryPlan(prompts: BatteryPrompt[]): string {
  const normalized = prompts.map((p) => ({ id: p.id, categoryId: p.categoryId, text: p.text }));
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

export type CitationLedgerEntry = {
  domain: string;
  totalCitations: number;
  clientAppearedCitations: number;
  competitorAppearedCitations: number;
  clientPresent: boolean;
  sampleUrls: string[];
  categories: BatteryCategoryId[];
  providers: string[];
};

function domainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

const INFRASTRUCTURE_LEDGER_DOMAINS = /^(vertexaisearch\.cloud\.google\.com|googleusercontent\.com|gstatic\.com|googleapis\.com|cloud\.google\.com)$/i;

function isClientActionableDomain(domain: string): boolean {
  return Boolean(domain) && !INFRASTRUCTURE_LEDGER_DOMAINS.test(domain);
}

export function buildRawCitationSourceLedger(results: Array<{ citations?: string[]; businessAppeared?: boolean; competitorAppeared?: boolean; provider?: string; categoryId?: BatteryCategoryId }>, website?: string): CitationLedgerEntry[] {
  const ownDomain = website ? domainFromUrl(website) : null;
  const map = new Map<string, CitationLedgerEntry>();
  for (const row of results) {
    for (const url of row.citations || []) {
      const domain = domainFromUrl(url);
      if (!domain) continue;
      const entry = map.get(domain) || { domain, totalCitations: 0, clientAppearedCitations: 0, competitorAppearedCitations: 0, clientPresent: ownDomain ? domain === ownDomain : false, sampleUrls: [], categories: [], providers: [] };
      entry.totalCitations += 1;
      if (row.businessAppeared) entry.clientAppearedCitations += 1;
      if (row.competitorAppeared) entry.competitorAppearedCitations += 1;
      if (ownDomain && domain === ownDomain) entry.clientPresent = true;
      if (entry.sampleUrls.length < 3 && !entry.sampleUrls.includes(url)) entry.sampleUrls.push(url);
      if (row.categoryId && !entry.categories.includes(row.categoryId)) entry.categories.push(row.categoryId);
      if (row.provider && !entry.providers.includes(row.provider)) entry.providers.push(row.provider);
      map.set(domain, entry);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalCitations - a.totalCitations || a.domain.localeCompare(b.domain));
}

export function buildCitationSourceLedger(results: Array<{ citations?: string[]; businessAppeared?: boolean; competitorAppeared?: boolean; provider?: string; categoryId?: BatteryCategoryId }>, website?: string): CitationLedgerEntry[] {
  return buildRawCitationSourceLedger(results, website).filter((entry) => isClientActionableDomain(entry.domain));
}

export type CategoryScorecardRow = {
  categoryId: BatteryCategoryId;
  categoryName: string;
  ownerLabel: string;
  appearedCount: number;
  totalPrompts: number;
  appearanceRate: number;
  verdict: 'Invisible' | 'Mixed' | 'Strong';
  implication: string;
  platformRates: { provider: string; appearedCount: number; totalPrompts: number; appearanceRate: number }[];
  brandedMisinformation?: string[];
};

export function categoryVerdict(rate: number): CategoryScorecardRow['verdict'] {
  if (rate > 0.5) return 'Strong';
  if (rate >= 0.15) return 'Mixed';
  return 'Invisible';
}

export function buildCategoryScorecard(results: Array<{ categoryId?: BatteryCategoryId; businessAppeared?: boolean; provider?: string; content?: string }>, profile?: BatteryProfile): CategoryScorecardRow[] {
  return (Object.keys(BATTERY_CATEGORIES) as BatteryCategoryId[]).map((categoryId) => {
    const cat = BATTERY_CATEGORIES[categoryId];
    const rows = results.filter((r) => r.categoryId === categoryId);
    const providerNames = Array.from(new Set(rows.map((r) => r.provider).filter(Boolean))) as string[];
    const platformRates = providerNames.map((provider) => {
      const pRows = rows.filter((r) => r.provider === provider);
      const appearedCount = pRows.filter((r) => r.businessAppeared).length;
      return { provider, appearedCount, totalPrompts: pRows.length, appearanceRate: pRows.length ? appearedCount / pRows.length : 0 };
    });
    const appearedCount = rows.filter((r) => r.businessAppeared).length;
    const totalPrompts = rows.length;
    const appearanceRate = totalPrompts ? appearedCount / totalPrompts : 0;
    const brandedMisinformation: string[] = [];
    if (categoryId === 'C8' && profile) {
      const expectedFacts = [profile.city, ...(profile.services || []).slice(0, 3)].map((v) => clean(v).toLowerCase()).filter(Boolean);
      for (const row of rows.filter((r) => r.businessAppeared && r.content)) {
        const answer = String(row.content || '').toLowerCase();
        if (expectedFacts.length && !expectedFacts.some((fact) => answer.includes(fact))) {
          brandedMisinformation.push('Branded answer mentioned the business but missed expected service/location facts.');
          break;
        }
      }
    }
    return { categoryId, categoryName: cat.name, ownerLabel: cat.ownerLabel, appearedCount, totalPrompts, appearanceRate, verdict: categoryVerdict(appearanceRate), implication: cat.implication, platformRates, brandedMisinformation };
  });
}
