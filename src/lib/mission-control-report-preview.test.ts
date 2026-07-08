import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseResearchDataFromNotes } from './report-data';

describe('Mission Control report preview', () => {
  it('parses current pipeline research JSON followed by review notes', () => {
    const notes = JSON.stringify({
      preflight: {
        niche: 'endermologie_clinic',
        nicheLabel: 'Endermologie / Body Contouring Clinic',
        aiReadinessScore: 50,
        hasLlmsTxt: false,
        hasSchema: true,
        contentQuality: 'medium',
        hasReviews: true,
        hasBlog: false,
        indexedPages: 14,
        paidIntake: {
          competitors: [
            { name: 'Bayside Endermologie', website: 'https://bayside.example' },
            { name: 'Natural Health and Beauty with Endermologie', website: 'https://natural.example' },
          ],
        },
      },
      competitorMode: 'client_provided',
      competitors: ['Bayside Endermologie', 'Natural Health and Beauty with Endermologie'],
      research: {
        businessName: 'Peninsula Endermologie',
        appearedCount: 0,
        totalPrompts: 5,
        statusBand: 'Weak',
        promptResults: [{ prompt: 'best endermologie clinic in Melbourne', businessAppeared: false, competitorAppeared: true }],
        niche: 'endermologie_clinic',
        competitorValidations: [{ name: 'Bayside Endermologie', validationStatus: 'validated', rating: 5, userReviewCount: 37 }],
      },
    }) + '\n[Review: pending_review at 2026-06-07T03:41:17.196Z]';

    const parsed = parseResearchDataFromNotes(notes);
    expect(parsed?.businessName).toBe('Peninsula Endermologie');
    expect(parsed?.appearedCount).toBe(0);
    expect(parsed?.totalPrompts).toBe(5);
    expect(parsed?.competitorMode).toBe('client_provided');
    expect(parsed?.nicheLabel).toBe('Endermologie / Body Contouring Clinic');
    expect(parsed?.technicalReadiness).toMatchObject({
      score: 50,
      hasLlmsTxt: false,
      hasSchema: true,
      contentQuality: 'medium',
      hasReviews: true,
      hasBlog: false,
      indexedPages: 14,
    });
    expect(parsed?.competitorValidations?.[0]?.name).toBe('Bayside Endermologie');
    expect(parsed?.suppliedCompetitors).toEqual([
      { name: 'Bayside Endermologie', website: 'https://bayside.example' },
      { name: 'Natural Health and Beauty with Endermologie', website: 'https://natural.example' },
    ]);
  });

  it('prefers richer preflight Google Places enrichment when research stores a compact Places summary', () => {
    const notes = JSON.stringify({
      preflight: {
        googlePlaceEnrichment: {
          placeId: 'ChIJB0bwHFsrFZYRcS-dMTs8LfM',
          displayName: 'Clínica Veterinaria San Isidro',
          formattedAddress: 'Av. Los Raulies 0132, Labranza, Temuco, Araucanía, Chile',
          cityMatch: true,
          websiteUri: 'https://www.instagram.com/clinicavetsanisidro.cl/',
          websiteMatch: true,
          googleMapsUri: 'https://maps.google.com/?cid=17522727950101589873',
          rating: 4.7,
          userReviewCount: 15,
          googleProfileFound: true,
          validationStatus: 'validated',
          confidence: 'high',
          warnings: [],
        },
      },
      competitorMode: 'client_provided',
      competitors: ['https://www.instagram.com/veterinariafriendlyvets/?hl=es'],
      research: {
        businessName: 'Clínica Veterinaria San Isidro',
        website: 'https://www.instagram.com/clinicavetsanisidro.cl/',
        city: 'Temuco',
        appearedCount: 1,
        totalPrompts: 1,
        statusBand: 'Strong',
        serviceVisibility: 'Visible in this snapshot.',
        promptResults: [{ prompt: 'Clínica Veterinaria San Isidro Temuco', businessAppeared: true, competitorAppeared: false }],
        niche: 'veterinary clinic',
        googlePlaceEnrichment: { placeId: 'ChIJB0bwHFsrFZYRcS-dMTs8LfM', rating: 4.7, userReviewCount: 15, websiteMatch: true },
      },
    });
    const parsed = parseResearchDataFromNotes(notes);
    expect(parsed?.googlePlaceEnrichment?.displayName).toBe('Clínica Veterinaria San Isidro');
    expect(parsed?.googlePlaceMatchState?.status).toBe('matched');
  });

  it('does not send pending-review operators to the client-gated public report URL', () => {
    const leadPage = readFileSync('src/app/mission-control/leads/[leadId]/page.tsx', 'utf8');
    expect(leadPage).toContain('/mission-control/report-preview/');
    expect(leadPage).toContain('Operator Report Preview');
    expect(leadPage).not.toContain('Preview Client Report');
  });
});
