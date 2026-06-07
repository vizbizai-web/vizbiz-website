import { describe, expect, it } from 'vitest';
import { getPromptSetForNiche } from './prompt-curator';
import { detectNiche } from './niche-detector';
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
});
