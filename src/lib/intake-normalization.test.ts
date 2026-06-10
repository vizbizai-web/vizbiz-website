import { describe, expect, it } from 'vitest';
import { buildIntakeNotes, cleanIntakeBusinessCategory } from './intake-normalization';
import { normalizeSubmittedNicheForInsert } from './google-sheets';

describe('intake normalization', () => {
  it('keeps browser metadata out of the business category at write time', () => {
    const category = cleanIntakeBusinessCategory('Assessments education. TZ: Europe/Malta (UTC+02:00) Locale: en-US');

    expect(category).toBe('Assessments education');
  });

  it('strips inline browser metadata suffixes from category before ClientBusinessCategory is written', () => {
    const category = cleanIntakeBusinessCategory('plumbing tz_America_Toronto locale_en-CA utc_-240 utm_source_gate');

    expect(category).toBe('plumbing');
  });

  it('writes category and browser metadata as separate note segments', () => {
    const notes = buildIntakeNotes({
      source: 'hero form',
      originalCta: 'Show my score preview + prepare email report',
      originalPage: '/',
      businessCategory: 'Assessments education. TZ: Europe/Malta (UTC+02:00) Locale: en-US',
      timezone: 'Europe/Malta',
      utcOffset: '-120',
      locale: 'en-US',
      competitorMode: 'client_provided',
    });

    expect(notes).toContain('ClientBusinessCategory: Assessments education |');
    expect(notes).toContain('TZ: Europe/Malta');
    expect(notes).toContain('Locale: en-US');
    expect(notes).not.toContain('ClientBusinessCategory: Assessments education. TZ');
  });

  it('writes inline-polluted category as a clean ClientBusinessCategory only', () => {
    const notes = buildIntakeNotes({
      source: 'qa_clean_sentinel',
      originalCta: 'Gate 4 clean sentinel intake',
      originalPage: '/free-ai-visibility-test',
      businessCategory: 'plumbing tz_America_Toronto locale_en-CA utc_-240 utm_source_gate',
      timezone: 'America/Toronto',
      utcOffset: '-240',
      locale: 'en-CA',
      competitorMode: 'client_only',
    });

    expect(notes).toContain('ClientBusinessCategory: plumbing |');
    expect(notes).not.toContain('ClientBusinessCategory: plumbing tz_');
    expect(notes).not.toContain('ClientBusinessCategory: plumbing locale_');
    expect(notes).not.toContain('ClientBusinessCategory: plumbing utc_');
    expect(notes).not.toContain('ClientBusinessCategory: plumbing utm_');
  });

  it('keeps blank submitted niche null instead of writing synthetic local_business', () => {
    expect(normalizeSubmittedNicheForInsert(undefined)).toBeNull();
    expect(normalizeSubmittedNicheForInsert('')).toBeNull();
    expect(normalizeSubmittedNicheForInsert('   ')).toBeNull();
    expect(normalizeSubmittedNicheForInsert('functional nutritionist')).toBe('functional nutritionist');
  });
});
