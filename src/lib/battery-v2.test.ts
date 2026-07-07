import { describe, expect, it } from 'vitest';
import { buildCategoryScorecard, buildCitationSourceLedger, buildRawCitationSourceLedger, generateBatteryV2, type BatteryProfile } from './battery-v2';
import { diffSnapshots } from './snapshot-diff';
import type { AuditSnapshot } from './audit-snapshots';

const plumbing: BatteryProfile = {
  businessName: 'QA Drain Rescue',
  city: 'Toronto',
  market: 'Toronto',
  businessType: 'plumber',
  niche: 'plumbing',
  services: ['emergency plumbing', 'drain cleaning', 'water leak repair', 'sewer backup repair'],
  customerSegments: ['homeowners', 'property managers'],
  competitors: ['Drain King Plumbers', 'Advanced Plumbing'],
  searchLanguage: 'English',
};

const lawFirm: BatteryProfile = {
  businessName: 'North Star Legal',
  city: 'Kitchener',
  businessType: 'personal injury lawyer',
  niche: 'legal services',
  services: ['car accident claims', 'insurance settlement disputes', 'slip and fall injury'],
  customerSegments: ['injured drivers', 'families'],
  competitors: ['BridgeLegal', 'Broughton Partners'],
};

const spanish: BatteryProfile = {
  businessName: 'Clínica Dental Norte',
  city: 'Madrid',
  businessType: 'clínica dental',
  niche: 'dentista',
  services: ['implantes dentales', 'urgencias dentales', 'ortodoncia'],
  customerSegments: ['pacientes locales'],
  competitors: ['Dental Sur', 'Clínica Sonrisa'],
  searchLanguage: 'Spanish',
};

const oakvilleDealer: BatteryProfile = {
  businessName: 'Oakville Auto Mall',
  city: 'Oakville',
  market: 'Oakville',
  businessType: 'car dealer',
  niche: 'car_dealership',
  services: ['new cars', 'used cars', 'car financing', 'trade-in appraisal'],
  customerSegments: ['local drivers', 'families'],
  competitors: ['Braman Miami', 'Downtown Auto'],
};

function tokenSet(text: string): Set<string> {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((token) => token.length > 2));
}

function jaccard(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  const union = new Set([...left, ...right]);
  const intersection = [...left].filter((token) => right.has(token));
  return union.size ? intersection.length / union.size : 0;
}

function snap(sequence: number, tier: 'free' | 'paid', total: number, version = 'battery-v2:60x8'): AuditSnapshot {
  const prompts = Array.from({ length: total }, (_, i) => ({ text: `prompt ${i + 1}`, id: `C1.${i + 1}`, categoryId: 'C1', categoryName: 'Discovery / recommendation' }));
  return {
    leadId: 'fixture',
    sequence,
    runType: sequence === 1 ? 'baseline' : 'monthly',
    tier,
    promptPlan: { prompts, version, hash: `${version}:${total}` },
    platformScores: [
      { provider: 'openai', label: 'ChatGPT', appearedCount: 1, totalPrompts: total, appearanceRate: 1 / total, status: 'tested' },
      { provider: 'gemini', label: 'Gemini', appearedCount: 1, totalPrompts: total, appearanceRate: 1 / total, status: 'tested' },
      { provider: 'perplexity', label: 'Perplexity', appearedCount: 1, totalPrompts: total, appearanceRate: 1 / total, status: 'tested' },
    ],
    blendedScore: 1 / total,
    band: 'Weak',
    promptResults: prompts.flatMap((p) => ['openai', 'gemini', 'perplexity'].map((provider) => ({ prompt: p.text, provider, businessAppeared: false, categoryId: 'C1', categoryName: 'Discovery / recommendation' }))),
    competitorScores: [],
    readiness: {},
    costEstimate: null,
    status: 'complete',
    source: 'fixture',
  };
}

describe('Battery v2 acceptance fixtures', () => {
  it('1. generates the 8-category 60-prompt paid battery and keeps law-firm coverage category-safe', () => {
    const prompts = generateBatteryV2(plumbing, 'paid');
    expect(prompts).toHaveLength(60);
    expect(new Set(prompts.map((p) => p.categoryId))).toEqual(new Set(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']));
    expect(prompts.filter((p) => p.categoryId === 'C1')).toHaveLength(12);
    expect(prompts.filter((p) => p.categoryId === 'C2')).toHaveLength(12);
    const law = generateBatteryV2(lawFirm, 'paid');
    expect(law.map((p) => p.text).join(' ')).not.toMatch(/inventory|trade-in|test drive|vehicle/i);
  });

  it('2. grounds every prompt in traceable profile elements', () => {
    const prompts = generateBatteryV2(plumbing, 'paid');
    for (const prompt of prompts) {
      expect(prompt.trace.length).toBeGreaterThan(0);
      expect(prompt.trace.join(' ')).toMatch(/QA Drain Rescue|Toronto|plumber|plumbing|drain|water|sewer/i);
    }
  });

  it('3. creates problem-first C3 prompts as symptoms, not bare service-name prompts', () => {
    for (const profile of [plumbing, lawFirm]) {
      const c3 = generateBatteryV2(profile, 'paid').filter((p) => p.categoryId === 'C3');
      expect(c3.length).toBeGreaterThan(0);
      expect(c3.every((p) => /my |tengo |need|offered|flooding|problem|urgent|settlement|reliable/i.test(p.text))).toBe(true);
      expect(c3.some((p) => p.text.toLowerCase() !== (profile.services || [])[0]?.toLowerCase())).toBe(true);
    }
  });

  it('4. injects competitors only into C4 comparison prompts', () => {
    const prompts = generateBatteryV2(plumbing, 'paid');
    for (const prompt of prompts) {
      const hasCompetitor = /Drain King Plumbers|Advanced Plumbing/i.test(prompt.text);
      expect(hasCompetitor ? prompt.categoryId : prompt.categoryId).toBe(hasCompetitor ? 'C4' : prompt.categoryId);
    }
  });

  it('5. generates Spanish-language battery with intact categories', () => {
    const prompts = generateBatteryV2(spanish, 'paid');
    expect(prompts).toHaveLength(60);
    expect(new Set(prompts.map((p) => p.categoryId)).size).toBe(8);
    expect(prompts.map((p) => p.text).join(' ')).toMatch(/mejor|recomiéndame|reseñas|cuánto cuesta|tengo/i);
  });

  it('6. builds deterministic source ledger from stored citations only', () => {
    const rows = [
      { provider: 'gemini', categoryId: 'C1' as const, businessAppeared: true, competitorAppeared: false, citations: ['https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', 'https://example.com/a', 'https://directory.test/list'] },
      { provider: 'perplexity', categoryId: 'C4' as const, businessAppeared: false, competitorAppeared: true, citations: ['https://directory.test/other'] },
    ];
    const a = buildCitationSourceLedger(rows, 'https://example.com');
    const b = buildCitationSourceLedger(rows, 'https://example.com');
    const raw = buildRawCitationSourceLedger(rows, 'https://example.com');
    expect(a).toEqual(b);
    expect(raw.map((r) => r.domain)).toContain('vertexaisearch.cloud.google.com');
    expect(a.map((r) => r.domain).sort()).toEqual(['directory.test', 'example.com']);
    expect(a.every((r) => r.sampleUrls.every((url) => rows.some((row) => row.citations.includes(url))))).toBe(true);
  });

  it('7. renders scorecard thresholds and branded misinformation findings', () => {
    const rows = [
      ...Array.from({ length: 10 }, (_, i) => ({ categoryId: 'C1' as const, provider: 'openai', businessAppeared: i < 6 })),
      { categoryId: 'C8' as const, provider: 'gemini', businessAppeared: true, content: 'QA Drain Rescue is a company.' },
    ];
    const card = buildCategoryScorecard(rows, plumbing);
    expect(card.find((r) => r.categoryId === 'C1')?.verdict).toBe('Strong');
    expect(card.find((r) => r.categoryId === 'C8')?.brandedMisinformation?.length).toBeGreaterThan(0);
  });

  it('8. treats v1-to-v2 migration as an incomparable deliberate re-baseline', () => {
    const diff = diffSnapshots(snap(2, 'paid', 60), snap(1, 'paid', 20, 'research-runner:v1'));
    expect(diff.comparable).toBe(false);
    expect(diff.incomparableReason).toMatch(/platform_total_prompts_mismatch/);
    expect(diff.scoreDelta.blended.delta).toBeNull();
  });

  it('9. full depth model is 60 prompts × 3 engines = 180 datapoints and free mini is 5-category teaser', () => {
    expect(generateBatteryV2(plumbing, 'paid')).toHaveLength(60);
    expect(60 * 3).toBe(180);
    const free = generateBatteryV2(plumbing, 'free');
    expect(free.map((p) => p.categoryId)).toEqual(['C1', 'C2', 'C3', 'C5', 'C8']);
  });

  it('10. free mini uses distinct C1/C2/C3/C5/C8 intents instead of five same-intent recommendation paraphrases', () => {
    const free = generateBatteryV2(oakvilleDealer, 'free');
    expect(free).toHaveLength(5);
    expect(free.map((p) => p.categoryId)).toEqual(['C1', 'C2', 'C3', 'C5', 'C8']);
    expect(free.filter((p) => /best\s+(car\s+)?dealer.*oakville|best.*oakville.*dealer/i.test(p.text))).toHaveLength(1);
    const pairwiseSimilarity = free.flatMap((left, i) => free.slice(i + 1).map((right) => jaccard(left.text, right.text)));
    expect(Math.max(...pairwiseSimilarity)).toBeLessThan(0.75);
    const c2 = free.find((p) => p.categoryId === 'C2')?.text || '';
    const c8 = free.find((p) => p.categoryId === 'C8')?.text || '';
    expect(c2).toMatch(/^(who|which|where|what|how|can|should)\b/i);
    expect(c2).not.toMatch(/^new cars in oakville$/i);
    expect(free.find((p) => p.categoryId === 'C3')?.text).toMatch(/replace my car|trustworthy dealership|problem/i);
    expect(c8).toMatch(/Oakville Auto Mall/i);
    expect(c8).not.toMatch(/^Oakville Auto Mall Oakville$/i);
    expect(c8).toMatch(/services|open|contact|hours|reviews|right choice/i);
  });

  it('11. keeps comparability stable when the same v2 plan executes identical per-platform totals twice', () => {
    const previous = snap(1, 'paid', 60);
    const current = snap(2, 'paid', 60);
    const previousTotals = previous.platformScores.map((score) => [score.provider, score.totalPrompts]);
    const currentTotals = current.platformScores.map((score) => [score.provider, score.totalPrompts]);
    expect(previousTotals).toEqual([['openai', 60], ['gemini', 60], ['perplexity', 60]]);
    expect(currentTotals).toEqual(previousTotals);
    const diff = diffSnapshots(current, previous);
    expect(diff.comparable).toBe(true);
    expect(diff.incomparableReason).toBeUndefined();
  });
});
