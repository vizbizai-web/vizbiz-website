import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('client-declared niche override', () => {
  it('keeps paid-intake business category ahead of automated niche classification', () => {
    const source = readFileSync('src/lib/pipeline-controller.ts', 'utf8');
    expect(source).toContain('parseClientDeclaredNiche');
    expect(source).toContain('PAID_INTAKE:');
    expect(source).toContain('businessCategory');
    expect(source).toContain('applyClientDeclaredNicheOverride(rawPreflightResult, declaredNiche)');
    expect(source).toContain('Client-declared business category overrides automated classification');
  });

  it('stores free-intake business category in notes so preflight can honor it', () => {
    const source = readFileSync('src/app/api/pipeline/intake/route.ts', 'utf8');
    expect(source).toContain('ClientBusinessCategory');
    expect(source).toContain('payload.businessCategory || payload.niche || payload.industry || payload.category');
  });
});
