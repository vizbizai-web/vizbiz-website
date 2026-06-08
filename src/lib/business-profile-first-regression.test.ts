import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildEvidenceFirstQueries, shouldUseEvidenceFirstQueries } from './preflight-engine';
import { getPrompts } from './full-prompts';
import { rebuildPromptsFromScrapedProfileIfContaminated } from './research-runner';

describe('business profile first niche logic', () => {
  it('does not instruct extraction to force a finite taxonomy choice', () => {
    const source = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    expect(source).toContain('businessType');
    expect(source).toContain('services');
    expect(source).toContain('nicheConfidence');
    expect(source).not.toMatch(/Pick the CLOSEST match from this list/i);
    expect(source).not.toMatch(/electrical_contractor,\s*car_dealership/i);
    expect(source).not.toMatch(/must choose|must pick/i);
  });

  it('generates human evidence-first prompts for clear business evidence outside known taxonomy', () => {
    const queries = buildEvidenceFirstQueries({
      businessType: 'neonatal craniosacral therapy clinic',
      services: ['infant craniosacral therapy', 'tongue tie support', 'postpartum parent consultations'],
      market: 'Austin, Texas',
      intakeCity: 'Austin',
    });

    const text = queries.suggestedSearchQueries.join(' ');
    expect(text).toContain('neonatal craniosacral therapy clinic');
    expect(text).toContain('infant craniosacral therapy');
    expect(text).toContain('Austin');
    expect(text).not.toMatch(/car|dealer|dealership|inventory|trade[-\s]?in/i);
    expect(text).not.toMatch(/jewelry|diamond|silversmith|dance studio/i);
  });

  it('uses evidence-first queries when internal niche is generic but business evidence is specific', () => {
    expect(shouldUseEvidenceFirstQueries({
      niche: 'local_business',
      businessType: 'neonatal craniosacral therapy clinic',
      services: ['infant craniosacral therapy', 'tongue tie support'],
      suggestedSearchQueries: [],
      nicheConfidence: 92,
    })).toBe(true);
  });

  it('paid full prompts honor business profile before generic taxonomy defaults', () => {
    const prompts = getPrompts({
      businessName: 'Newborn Balance Clinic',
      city: 'Austin',
      niche: 'local_business',
      businessType: 'neonatal craniosacral therapy clinic',
      targetAudience: 'parents of newborns and infants with feeding or sleep issues',
      services: ['infant craniosacral therapy', 'tongue tie support'],
      websiteInsight: {
        services: ['infant craniosacral therapy', 'tongue tie support'],
        keywords: ['neonatal craniosacral therapy clinic'],
      },
    }, 'paid').map((prompt) => prompt.text);

    const text = prompts.join(' ');
    expect(text).toContain('neonatal craniosacral therapy clinic');
    expect(text).toContain('infant craniosacral therapy');
    expect(text).not.toMatch(/general services|local business|Competitor 1|Competitor 2/i);
    expect(text).not.toMatch(/car dealership|jewelry store|dance studio/i);
  });

  it('rebuilds stale finite-taxonomy prompts from scraped profile evidence before research', () => {
    const gate = rebuildPromptsFromScrapedProfileIfContaminated([
      'best car dealer in Austin',
      'who has the most car inventory in Austin',
      'best place to buy a used car in Austin',
    ], {
      niche: 'local_business',
      businessType: 'neonatal craniosacral therapy clinic',
      services: ['infant craniosacral therapy', 'tongue tie support'],
      city: 'Austin',
      businessName: 'Newborn Balance Clinic',
    });

    expect(gate.rebuilt).toBe(true);
    expect(gate.reason).toMatch(/stale vertical|scraped business type|generic/i);
    const rebuilt = gate.prompts.join(' ');
    expect(rebuilt).toContain('neonatal craniosacral therapy clinic');
    expect(rebuilt).toContain('infant craniosacral therapy');
    expect(rebuilt).not.toMatch(/car dealer|inventory|used car|dealership|trade[-\s]?in/i);
  });
});
