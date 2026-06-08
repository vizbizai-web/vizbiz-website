import { describe, expect, it } from 'vitest';
import {
  buildEvidenceFirstQueries,
  separateBusinessIdentityFromEvidence,
} from './preflight-engine';

describe('business profile separation before intake research', () => {
  const mopWringersEvidence = [
    'Mop Wringers | Commercial Cleaning Services in Rockwall, TX',
    'Medical-facility cleaning standards for schools, daycares, medical offices, restaurants, and office buildings in Rockwall County, TX.',
    'Your Facility Deserves More Than Surface-Level Clean',
    'Serving Rockwall County and surrounding areas.',
    'Our primary service area covers Rockwall, Heath, Fate, and Rowlett, with extended coverage to Garland, Mesquite, and surrounding communities.',
    'Facilities We Serve Schools and Daycares Medical Offices Restaurants Office Buildings',
    'Sanitizing is the foundation of every cleaning we do.',
    'janitorial cleaning and color-coded sanitization protocols',
  ].join(' ');

  it('separates what the business is from who it serves and what services it provides', () => {
    const profile = separateBusinessIdentityFromEvidence({
      businessName: 'Mop Wringers',
      url: 'https://www.mopwringersllc.com',
      metaTitle: 'Mop Wringers | Commercial Cleaning Services in Rockwall, TX',
      metaDescription: 'Medical-facility cleaning standards for schools, daycares, medical offices, restaurants, and office buildings in Rockwall County, TX.',
      scrapedTitle: 'Mop Wringers | Commercial Cleaning Services in Rockwall, TX',
      evidenceText: mopWringersEvidence,
      htmlLang: 'en-US',
      market: 'Rockwall',
      googlePlaceTypes: [],
    });

    expect(profile.niche).toBe('cleaning_service');
    expect(profile.businessType).toBe('commercial cleaning service');
    expect(profile.services).toEqual(expect.arrayContaining(['commercial cleaning', 'sanitizing', 'janitorial cleaning']));
    expect(profile.customerSegments).toEqual(expect.arrayContaining(['schools and daycares', 'medical offices', 'restaurants', 'office buildings']));
    expect(profile.siteLanguage).toBe('English');
    expect(profile.primaryMarket).toBe('Rockwall County');
    expect(profile.serviceAreas).toEqual(expect.arrayContaining(['Heath', 'Fate', 'Rowlett', 'Garland', 'Mesquite']));
    expect(profile.promptMarketStrategy).toBe('primary_city_plus_nearby_service_areas');
    expect(profile.businessType).not.toMatch(/mop wringers/i);
    expect(profile.services).not.toEqual(expect.arrayContaining(['restaurant']));
  });

  it('generates category-first buyer questions and does not test the brand as the niche', () => {
    const profile = separateBusinessIdentityFromEvidence({
      businessName: 'Mop Wringers',
      url: 'https://www.mopwringersllc.com',
      metaTitle: 'Mop Wringers | Commercial Cleaning Services in Rockwall, TX',
      metaDescription: 'Medical-facility cleaning standards for schools, daycares, medical offices, restaurants, and office buildings in Rockwall County, TX.',
      scrapedTitle: 'Mop Wringers | Commercial Cleaning Services in Rockwall, TX',
      evidenceText: mopWringersEvidence,
      htmlLang: 'en-US',
      market: 'Rockwall',
      googlePlaceTypes: [],
    });

    const queries = buildEvidenceFirstQueries({
      businessType: profile.businessType,
      services: profile.services,
      market: 'Rockwall',
      primaryMarket: profile.primaryMarket,
      serviceAreas: profile.serviceAreas,
      customerSegments: profile.customerSegments,
    }).suggestedSearchQueries;

    const joined = queries.join(' ');
    expect(joined).toMatch(/commercial cleaning/i);
    expect(joined).toMatch(/Rockwall County/i);
    expect(joined).toMatch(/Heath|Fate|Rowlett|Garland|Mesquite/i);
    expect(joined).toMatch(/medical offices|schools|daycares|restaurants|office buildings/i);
    expect(joined).not.toMatch(/mop wringerss|best mop wringers|trusted mop wringers/i);
    expect(joined).not.toMatch(/restaurant provider|who offers restaurant/i);
  });
});
