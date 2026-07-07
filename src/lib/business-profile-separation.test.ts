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

  it('does not misclassify functional nutrition / eczema businesses as cleaning services', () => {
    const profile = separateBusinessIdentityFromEvidence({
      businessName: 'Krysta Harcus',
      url: 'https://www.krystaharcus.com/',
      metaTitle: 'Certified Functional Nutritionist - Eczema and Psoriasis Solutions',
      metaDescription: "I'm a certified Functional Nutritionist. I help people with eczema or psoriasis get the clear, beautiful skin you dream of without creams, pills or biologics.",
      scrapedTitle: 'Certified Functional Nutritionist - Eczema and Psoriasis Solutions',
      evidenceText: [
        'Certified Functional Nutritionist',
        'eczema and psoriasis solutions',
        'clear beautiful skin without creams, pills or biologics',
        'root-cause skin health nutrition support',
      ].join(' '),
      htmlLang: 'en-CA',
      market: 'Kelowna',
      googlePlaceTypes: [],
    });

    expect(profile.niche).toBe('functional_nutrition');
    expect(profile.businessType).toMatch(/functional nutritionist/i);
    expect(profile.services).toEqual(expect.arrayContaining(['eczema support', 'psoriasis support']));
    expect(profile.customerSegments).toEqual(['people with eczema or psoriasis']);
    expect(profile.businessType).not.toMatch(/cleaning/i);
  });

  it('uses human-readable site evidence for new niches instead of forcing a stale taxonomy bucket', () => {
    const profile = separateBusinessIdentityFromEvidence({
      businessName: 'North Shore Tax Relief',
      url: 'https://northshoretaxrelief.example',
      metaTitle: 'North Shore Tax Relief | Certified Tax Resolution Specialist',
      metaDescription: 'We are a certified tax resolution specialist helping small business owners with CRA tax debt, unfiled returns, and bookkeeping cleanup.',
      scrapedTitle: 'Certified Tax Resolution Specialist',
      evidenceText: 'Tax debt help, CRA negotiations, unfiled tax returns, bookkeeping cleanup, small business tax support.',
      htmlLang: 'en-CA',
      market: 'Vancouver',
      googlePlaceTypes: [],
    });

    expect(profile.businessType).toBe('certified tax resolution specialist');
    expect(profile.niche).toBe('tax_resolution_specialist');
    expect(profile.businessType).not.toMatch(/car dealership|local business/i);

    const queries = buildEvidenceFirstQueries({
      businessType: profile.businessType,
      services: profile.services,
      market: 'Vancouver',
      customerSegments: profile.customerSegments,
    }).suggestedSearchQueries.join(' ');
    expect(queries).toMatch(/tax resolution specialist/i);
    expect(queries).not.toMatch(/dealership|inventory|trade-in/i);
  });

  it('classifies Polish leather handbag ecommerce as fashion bags, not beauty salon or brand-as-category', () => {
    const profile = separateBusinessIdentityFromEvidence({
      businessName: 'Genua s.c.',
      url: 'https://genuabags.com',
      metaTitle: 'Genua Bags',
      metaDescription: '',
      scrapedTitle: 'GENUA BAGS',
      evidenceText: [
        'TOREBKI',
        'SASZETKI',
        'torebka skórzana',
        'saszetka skórzana',
        'Cena 1 220,00 zł',
        'Do koszyka',
        'Sklep internetowy Shoper.pl',
      ].join(' '),
      htmlLang: 'pl',
      market: 'Grzybowo',
      googlePlaceTypes: ['store'],
    });

    expect(profile.niche).toBe('fashion_bag_store');
    expect(profile.businessType).toMatch(/leather handbag store/i);
    expect(profile.services).toEqual(expect.arrayContaining(['leather handbags', 'leather pouches']));
    expect(profile.siteLanguage).toBe('Polish');
    expect(profile.businessType).not.toMatch(/genua bags|beauty salon/i);
  });
});
