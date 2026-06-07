import { describe, expect, it } from 'vitest';
import { getPromptSetForNiche } from './prompt-curator';
import { detectNiche } from './niche-detector';
import { buildEvidenceFirstQueries, shouldUseEvidenceFirstQueries } from './preflight-engine';
import { rebuildPromptsFromScrapedProfileIfContaminated } from './research-runner';
import { readFileSync } from 'node:fs';

describe('niche guardrails', () => {
  it('has a specific prompt set for Endermologie/body contouring clinics', () => {
    const prompts = getPromptSetForNiche('endermologie_clinic').prompts;
    expect(prompts[0]).toContain('endermologie');
    expect(prompts.join(' ')).toContain('cellulite');
    expect(prompts.join(' ')).not.toContain('car dealer');
  });

  it('prevents Endermologie and beauty/wellness signals from becoming car dealership reports', () => {
    const source = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    expect(source).toContain('applyNicheGuardrails');
    expect(source).toContain('endermologie_clinic');
    expect(source).toContain('Google Places beauty/wellness types block unrelated car-dealership classification');
  });

  it('prevents electrical contractor signals from becoming car dealership reports', () => {
    const preflight = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    const research = readFileSync('src/lib/research-runner.ts', 'utf8');
    const economics = readFileSync('src/lib/niche-economics.ts', 'utf8');

    expect(preflight).toContain('electrical_contractor');
    expect(preflight).toContain('website/schema/Google Places electrical-contractor signals override unrelated car-dealership classification');
    expect(preflight).toContain("['electrician']");
    expect(research).toContain('electrical_contractor');
    expect(economics).toContain('Electrical Contractor');
  });

  it('prevents professional audio and AV businesses from becoming artisan/jewelry workshop reports', () => {
    const preflight = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    const economics = readFileSync('src/lib/niche-economics.ts', 'utf8');

    expect(preflight).toContain('pro_audio_systems');
    expect(preflight).toContain('professional audio/AV/electronics signals override generic workshop or artisan classifications');
    expect(preflight).toContain('professional audio system integrator in {city}');
    expect(preflight).toContain('pro audio distributor in {city}');
    expect(economics).toContain('Professional Audio / AV Systems');
  });

  it('does not let arbitrary new niches fall into car dealership through substring matches', () => {
    const careBusiness = detectNiche(
      'Bright Care Clinic',
      'https://brightcare.example',
      'We provide patient care, home care support, appointments, reviews, and trusted local health services.'
    );
    expect(careBusiness.niche).toBe('local_business');

    const unknownBusiness = detectNiche(
      'North Star Compliance',
      'https://northstar.example',
      'Risk assessment, ISO compliance, staff training, audit preparation, documentation, and advisory services.'
    );
    expect(unknownBusiness.niche).toBe('local_business');
    expect(unknownBusiness.promptTemplates.join(' ')).not.toMatch(/car|dealer|dealership|inventory|trade-in/i);
  });

  it('uses scraped business type and services when a new niche is specific but taxonomy is generic', () => {
    const shouldGate = shouldUseEvidenceFirstQueries({
      niche: 'local_business',
      businessType: 'marine upholstery repair studio',
      services: ['boat seat repair', 'canvas enclosure fabrication'],
      suggestedSearchQueries: [],
      nicheConfidence: 55,
    });
    expect(shouldGate).toBe(true);

    const queries = buildEvidenceFirstQueries({
      businessType: 'marine upholstery repair studio',
      services: ['boat seat repair', 'canvas enclosure fabrication'],
      market: 'Halifax, Canada',
    }).suggestedSearchQueries.join(' ');

    expect(queries).toContain('marine upholstery repair studio');
    expect(queries).toContain('boat seat repair');
    expect(queries).not.toMatch(/car|dealer|dealership|inventory|trade-in|jewelry|diamond|silversmith/i);
  });

  it('rebuilds stale known-niche prompts from scraped profile evidence before research runs', () => {
    const badPrompts = [
      'best car dealer in Halifax',
      'who has the most car inventory in Halifax',
      'best place to buy a used car in Halifax',
    ];

    const gate = rebuildPromptsFromScrapedProfileIfContaminated(badPrompts, {
      niche: 'local_business',
      businessType: 'marine upholstery repair studio',
      services: ['boat seat repair', 'canvas enclosure fabrication'],
      city: 'Halifax',
      businessName: 'Harbour Canvas Co',
    });

    expect(gate.rebuilt).toBe(true);
    expect(gate.prompts.join(' ')).toContain('marine upholstery repair studio');
    expect(gate.prompts.join(' ')).toContain('boat seat repair');
    expect(gate.prompts.join(' ')).not.toMatch(/car dealer|inventory|used car|dealership|trade-in|diamond|silversmith/i);
  });
});
