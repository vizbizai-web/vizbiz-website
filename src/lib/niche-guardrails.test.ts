import { describe, expect, it } from 'vitest';
import { getPromptSetForNiche } from './prompt-curator';
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
});
