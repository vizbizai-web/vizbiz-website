import { describe, expect, it } from 'vitest';
import { buildNicheClassifierDiagnosticLog } from './preflight-engine';

describe('niche classifier diagnostic logging', () => {
  it('records exact classifier input metrics and contamination booleans per lead', () => {
    const log = buildNicheClassifierDiagnosticLog({
      leadId: 'lead_tax_1',
      businessName: 'North Shore Tax Relief',
      websiteUrl: 'https://northshoretax.example',
      classifierInput: 'Page Title: North Shore Tax Relief | Certified Tax Resolution Specialist\nPage Content: IRS tax relief and audit help.',
      submittedPrimaryService: 'Certified Tax Resolution Specialist',
      competitors: ['Bridge Tax Group', 'Audit Rescue'],
    });

    expect(log.leadId).toBe('lead_tax_1');
    expect(log.classifierInput).toContain('Certified Tax Resolution Specialist');
    expect(log.classifierInputCharCount).toBe(log.classifierInput.length);
    expect(log.submittedPrimaryServicePresent).toBe(true);
    expect(log.competitorTextInContext).toBe(false);
    expect(log.competitorMatches).toEqual([]);
  });

  it('flags competitor text when it appears in the classifier context', () => {
    const log = buildNicheClassifierDiagnosticLog({
      leadId: 'lead_contaminated_1',
      businessName: 'Client Co',
      websiteUrl: 'https://client.example',
      classifierInput: 'Client site text. Competitor mention: Bridge Tax Group offers tax debt help.',
      submittedPrimaryService: 'Tax resolution specialist',
      competitors: ['Bridge Tax Group', 'Audit Rescue'],
    });

    expect(log.submittedPrimaryServicePresent).toBe(false);
    expect(log.competitorTextInContext).toBe(true);
    expect(log.competitorMatches).toEqual(['Bridge Tax Group']);
  });
});
