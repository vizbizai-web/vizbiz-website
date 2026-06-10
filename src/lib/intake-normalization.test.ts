import { describe, expect, it } from 'vitest';
import { buildIntakeNotes, cleanIntakeBusinessCategory } from './intake-normalization';

describe('intake normalization', () => {
  it('keeps browser metadata out of the business category at write time', () => {
    const category = cleanIntakeBusinessCategory('Assessments education. TZ: Europe/Malta (UTC+02:00) Locale: en-US');

    expect(category).toBe('Assessments education');
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
});
