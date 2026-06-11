import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('client-declared niche override', () => {
  it('keeps paid-intake business category ahead of automated niche classification', () => {
    const source = readFileSync('src/lib/pipeline-controller.ts', 'utf8');
    expect(source).toContain('parseClientDeclaredNiche');
    expect(source).toContain('PAID_INTAKE:');
    expect(source).toContain('businessCategory');
    expect(source).toContain('applyClientDeclaredNicheOverride(rawPreflightResult, declaredNiche, lead.city)');
    expect(source).toContain('paidIntake: paidIntakePayload');
    expect(source).toContain('customerQuestions: Array.isArray(paidIntakePayload?.customerQuestions)');
    expect(source).toContain('Client-declared business category overrides automated classification');
  });

  it('feeds paid-intake customer questions into research prompt seeds', () => {
    const source = readFileSync('src/lib/research-runner.ts', 'utf8');
    expect(source).toContain('preflightProfile.customerQuestions');
    expect(source).toContain('paid-intake customer questions as prompt seeds');
    expect(source).toContain('business-profile customer search queries including');
  });

  it('stores free-intake business category in notes so preflight can honor it', () => {
    const routeSource = readFileSync('src/app/api/pipeline/intake/route.ts', 'utf8');
    const normalizationSource = readFileSync('src/lib/intake-normalization.ts', 'utf8');
    expect(routeSource).toContain('buildIntakeNotes');
    expect(normalizationSource).toContain('ClientBusinessCategory');
    expect(routeSource).toContain('payload.businessCategory || payload.niche || payload.industry || payload.category');
  });

  it('lets Telegram Use declared or Use website become the latest operator override without re-triggering the original conflict', () => {
    const source = readFileSync('src/lib/pipeline-controller.ts', 'utf8');
    const normalizationSource = readFileSync('src/lib/intake-normalization.ts', 'utf8');
    const preflightSource = readFileSync('src/lib/preflight-engine.ts', 'utf8');
    expect(source).toContain('matchAll(/ClientBusinessCategory');
    expect(normalizationSource).toContain('METADATA_SEGMENT_PATTERN');
    expect(source).toContain('latestMatch');
    expect(source).toContain('parsed?.clientDeclaredNiche');
    expect(source).toContain('parsed?.preflight?.clientDeclaredNiche');
    expect(source).toContain('parsed?.preflight?.paidIntake?.businessCategory');
    expect(source).toContain('hasTelegramDeclaredNicheOverride');
    expect(source).toContain('hasTelegramWebsiteNicheOverride');
    expect(source).toContain('Source:\\s*telegram_use_website');
    expect(source).toContain('parsed?.preflight?.operatorRevision?.reason?.includes("use declared service")');
    expect(source).toContain('parsed?.preflight?.operatorRevision?.reason?.includes("use website evidence")');
    expect(source).toContain('const telegramNicheOverride = telegramDeclaredOverride || telegramWebsiteOverride');
    expect(source).toContain('const services = [normalized.businessType]');
    expect(preflightSource).toContain('AI oral assessment tools for verifying student understanding');
    expect(preflightSource).toContain('best ${businessType} alternatives');
    expect(source).toContain('allowBlockedNicheResolution: telegramNicheOverride && Boolean(declaredNiche)');
    expect(source).toContain('submittedPrimaryService: telegramNicheOverride ? null : declaredNiche || null');
  });
});
