import { afterEach, describe, expect, it } from 'vitest';
import { generateFixKit, setFixKitLLMForTests, type FixKitInput } from './fix-kit-generator';

function fixture(overrides: Partial<FixKitInput> = {}): FixKitInput {
  return {
    leadId: '00000000-0000-0000-0000-000000000001',
    profile: {
      businessName: 'Clearpath Tax Relief',
      website: 'https://clearpathtax.ca',
      niche: 'tax_resolution',
      nicheLabel: 'Tax resolution specialist',
      businessType: 'tax resolution specialist',
      services: ['tax debt settlement', 'CRA audit help', 'back tax filing', 'wage garnishment help', 'payment plan setup', 'tax lien help'],
      serviceAreas: ['Kitchener', 'Waterloo'],
      primaryMarket: 'Kitchener',
      searchLanguage: 'English',
      valueProposition: 'Tax resolution help for people dealing with CRA debt in Kitchener.',
    },
    seoAudit: { hasSchema: false, robotsTxt: 'User-agent: GPTBot\nDisallow: /\nUser-agent: BingBot\nAllow: /' },
    research: {
      promptResults: [
        { prompt: 'best tax debt help in Kitchener', businessAppeared: false },
        { prompt: 'CRA audit help near me', businessAppeared: false },
        { prompt: 'tax resolution specialist Kitchener', businessAppeared: true },
        { prompt: 'help with wage garnishment Waterloo', businessAppeared: false },
        { prompt: 'back tax filing help Kitchener', businessAppeared: false },
        { prompt: 'CRA payment plan help Waterloo', businessAppeared: false },
      ],
    },
    paidIntake: { customerQuestions: ['Can you stop CRA calls?'], trustAssets: ['Licensed tax preparer'] },
    crawl: { robotsTxt: 'User-agent: GPTBot\nDisallow: /\nUser-agent: BingBot\nAllow: /', pages: [
      { url: 'https://clearpathtax.ca/', title: 'Clearpath', metaDescription: 'Tax help', h1: 'Tax Help' },
      { url: 'https://clearpathtax.ca/services', title: 'Services', metaDescription: 'Services', h1: 'Services' },
    ]},
    ...overrides,
  };
}

function installHappyMock(language = 'English', seenArtifacts?: string[]) {
  setFixKitLLMForTests(async ({ artifact, userMessage }) => {
    seenArtifacts?.push(artifact);
    const evidence = JSON.parse(userMessage);
    const services = evidence.profile.services;
    const pageUrls = evidence.pages.map((p: { url: string }) => p.url);
    const lost = evidence.lostPrompts;
    if (artifact === 'A2_LLMS') return { description: language === 'Spanish' ? 'Proveedor local de suministros industriales para empresas en Madrid.' : `${evidence.profile.businessName} provides ${evidence.profile.businessType} help in ${evidence.profile.primaryMarket}.`, services, serviceAreas: evidence.profile.serviceAreas, keyPages: [{ url: pageUrls[0], description: 'Main page for local service information.' }], contact: 'Use the website contact form.', proof: ['Licensed tax preparer'] };
    if (artifact === 'A4_META') return { pages: pageUrls.slice(0, 2).map((url: string, index: number) => ({
      url,
      proposedTitle: index === 0 ? `${evidence.profile.businessType} in ${evidence.profile.primaryMarket} | ${evidence.profile.businessName}`.slice(0, 68) : `${services[0]} in ${evidence.profile.primaryMarket} | ${evidence.profile.businessName}`.slice(0, 68),
      proposedMetaDescription: `Get ${services.slice(0, 3).join(', ')} and practical support from ${evidence.profile.businessName} in ${evidence.profile.primaryMarket} with clear next steps today.`.slice(0, 158).padEnd(125, '.'),
      proposedH1: `${evidence.profile.businessType} in ${evidence.profile.primaryMarket}`,
      evidence: ['businessType','primaryMarket','services'],
    })) };
    if (artifact === 'A5_FAQ') return { faqs: lost.slice(0,6).map((prompt: string) => ({ question: prompt.endsWith('?') ? prompt : `${prompt}?`, answer: `${evidence.profile.businessName} helps customers understand their options, compare the right next steps, and choose a practical path forward. The best first step is to review the specific need, location, timeline, and service details so the answer is accurate and useful.`, sourcePrompt: prompt })) };
    if (artifact === 'A6_GBP') return { description: `${evidence.profile.businessName} helps customers in ${evidence.profile.primaryMarket} with ${services.slice(0,4).join(', ')} and clear next steps.`.slice(0, 740), services, qas: [1,2,3,4,5].map(i => ({ question: `Service question ${i}?`, answer: `${evidence.profile.businessName} reviews the need and explains the next step.` })), reviewEmail: `Thanks for trusting ${evidence.profile.businessName}. Would you mention the service we helped with and your city in a review?`, reviewSms: `Thanks for choosing ${evidence.profile.businessName}. Could you leave a quick review mentioning the service and city?`, inPersonScript: 'If this helped, a short review mentioning the service and city would help others find us.', posts: ['Service tip of the week','Customer question answered','Local service reminder','How to prepare'] };
    throw new Error(`unexpected ${artifact}`);
  });
}

afterEach(() => setFixKitLLMForTests(null));

describe('Fix Kit generator', () => {
  it('generates A1-A8 with deterministic crawler/schema/category/decision artifacts and no placeholders', async () => {
    installHappyMock();
    const kit = await generateFixKit(fixture());
    expect(kit.artifacts.map(a => a.key)).toEqual(['A1_SCHEMA','A2_LLMS','A3_CRAWLER','A4_META','A5_FAQ','A6_GBP','A7_ROADMAP','A8_DECISION_FRAMEWORK']);
    expect(kit.status).toBe('ready_for_approval');
    expect(kit.artifacts.flatMap(a => a.validationErrors)).toEqual([]);
    expect(kit.artifacts.map(a => a.content).join('\n')).not.toMatch(/TODO|EXAMPLE|Lorem|INSERT|dealership/i);
    const schema = JSON.parse(kit.artifacts.find(a => a.key === 'A1_SCHEMA')!.content);
    expect(schema['@graph'][0].name).toBe('Clearpath Tax Relief');
    expect(kit.artifacts.find(a => a.key === 'A3_CRAWLER')!.content).toContain('GPTBot | blocked');
    expect(kit.artifacts.find(a => a.key === 'A6_GBP')!.content).toContain('Primary: Tax preparation service');
    const a8 = kit.artifacts.find(a => a.key === 'A8_DECISION_FRAMEWORK')!;
    expect(a8.content).toContain('Publish-ready HTML');
    expect(a8.content).toContain('Plain text version');
    expect(a8.content).toContain('FAQ maps to lost prompt: best tax debt help in Kitchener');
    expect(a8.content).toContain('FAQPage');
    expect(a8.content).not.toMatch(/#1|number one|top ranked|guaranteed/i);
  });

  it('surfaces validation failure as needs_operator_edit instead of silently shipping', async () => {
    installHappyMock();
    const kit = await generateFixKit(fixture({ forceValidationFailureFor: ['A5_FAQ'] }));
    expect(kit.status).toBe('draft');
    expect(kit.artifacts.find(a => a.key === 'A5_FAQ')?.status).toBe('needs_operator_edit');
  });

  it('keeps Spanish supplier artifacts in Spanish when the evidence language is Spanish', async () => {
    installHappyMock('Spanish');
    const kit = await generateFixKit(fixture({ profile: { ...fixture().profile, businessName: 'Suministros Madrid', niche: 'spanish_supplier', nicheLabel: 'Proveedor de suministros industriales', businessType: 'proveedor de suministros industriales', searchLanguage: 'Spanish', services: ['suministros industriales','entrega local','catálogo mayorista'], primaryMarket: 'Madrid', serviceAreas: ['Madrid'] } }));
    expect(kit.artifacts.find(a => a.key === 'A2_LLMS')?.content).toContain('Proveedor local de suministros industriales');
    expect(kit.artifacts.find(a => a.key === 'A8_DECISION_FRAMEWORK')?.content).toContain('Cómo elegir');
    expect(kit.artifacts.find(a => a.key === 'A8_DECISION_FRAMEWORK')?.content).toContain('Marco de decisión');
  });

  it('drop mode generates only targeted 1-2 artifacts and does not run full Fix Kit LLM set', async () => {
    const seen: string[] = [];
    installHappyMock('English', seen);
    const kit = await generateFixKit(fixture({ mode: 'drop' }));
    expect(kit.artifacts.map(a => a.key)).toEqual(['A3_CRAWLER', 'A5_FAQ']);
    expect(kit.artifacts.length).toBeLessThanOrEqual(2);
    expect(seen).toEqual(['A5_FAQ']);
    expect(seen).not.toContain('A2_LLMS');
    expect(seen).not.toContain('A4_META');
    expect(seen).not.toContain('A6_GBP');
  });

  it.each([
    ['med_spa', 'Willow Med Spa', 'medical spa', ['facial rejuvenation','laser hair removal','skin consultation','body contouring','injectable consultation','skin care plan']],
    ['audio_supplier', 'Northstar Pro Audio', 'professional audio supplier', ['speaker systems','microphones','AV integration','sound reinforcement','conference audio','equipment rental']],
    ['dealership', 'Maple Honda', 'Honda dealership', ['new Honda sales','used vehicle sales','service department','trade-in appraisal','vehicle financing','parts department']],
  ])('acceptance fixture %s passes G2 blocklist expectations', async (niche, businessName, businessType, services) => {
    installHappyMock();
    const kit = await generateFixKit(fixture({
      profile: { ...fixture().profile, businessName, niche, nicheLabel: businessType, businessType, services, primaryMarket: 'Toronto', serviceAreas: ['Toronto'], valueProposition: `${businessName} provides ${businessType} services in Toronto.` },
      crawl: { robotsTxt: '', pages: [{ url: `https://${businessName.toLowerCase().replace(/[^a-z0-9]+/g,'')}.ca/`, title: businessName }] },
      research: { promptResults: ['best option near me','trusted local provider','service pricing','reviews near me','who should I choose','available this week'].map(prompt => ({ prompt, businessAppeared: false })) },
    }));
    expect(kit.artifacts.flatMap(a => a.validationErrors.filter(e => e.startsWith('g2_vertical_blocklist')))).toEqual([]);
  });
});
