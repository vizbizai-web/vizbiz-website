import { describe, expect, it } from 'vitest';
import { buildFreeReportPdfModel, renderFreeReportPdf } from './free-report-pdf';
import type { ResearchData, LeadPageData } from '@/app/report/[leadId]/page';

const lead: LeadPageData = {
  leadId: 'lead-1234567890',
  businessName: 'Clínica Veterinaria San Isidro',
  contactName: 'Alex',
  location: 'Temuco',
  website: 'https://example.com',
  email: 'client@example.com',
  phone: '',
  competitor: '',
  source: 'qa_pdf',
  status: 'approved',
  researchStatus: 'completed',
  snapshotAppeared: '12 of 15',
  visibilityBand: 'Strong signal',
  notes: '',
};

const research: ResearchData = {
  leadId: lead.leadId,
  businessName: lead.businessName,
  website: lead.website,
  city: lead.location,
  contactName: lead.contactName,
  competitor: 'Friendly Vet\'s, Clinica veterinaria labranza',
  niche: 'veterinary clinic',
  nicheLabel: 'Servicios veterinarios',
  appearedCount: 12,
  totalPrompts: 15,
  statusBand: 'Strong signal',
  serviceVisibility: 'Visible in this snapshot.',
  promptResults: [
    { prompt: 'mejor Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, in Temuco', businessAppeared: true, competitorAppeared: false },
    { prompt: 'is Clínica Veterinaria San Isidro reputable', businessAppeared: true, competitorAppeared: false },
    { prompt: 'Clínica Veterinaria San Isidro Temuco', businessAppeared: true, competitorAppeared: false },
    { prompt: 'best emergency veterinary clinic in Temuco', businessAppeared: false, competitorAppeared: true, competitorName: 'Friendly Vet\'s' },
  ],
  competitorMention: '',
  competitorLine: '',
  competitorCategories: [],
  whyThisMatters: '',
  processedAt: '2026-07-08T18:00:00.000Z',
  googlePlaceEnrichment: { placeId: 'abc', displayName: 'Clínica Veterinaria San Isidro', rating: 4.7, userReviewCount: 15, websiteMatch: true, validationStatus: 'validated', confidence: 'high' },
  localEntityTrustScore: 90,
  competitorValidations: [
    { name: "Friendly Vet's", validationStatus: 'validated', rating: 4, userReviewCount: 24, distanceFromClientKm: null },
    { name: 'Clinica veterinaria labranza', validationStatus: 'validated', rating: 4.4, userReviewCount: 38, distanceFromClientKm: null },
  ],
};

describe('free report PDF before snapshot', () => {
  it('builds a branded dated before-snapshot model from shared report data', () => {
    const model = buildFreeReportPdfModel({ leadId: lead.leadId, leadData: lead, researchData: research, now: new Date('2026-07-08T18:00:00Z') });

    expect(model.title).toBe('AI Visibility Before Snapshot');
    expect(model.brand).toBe('VizBiz.ai');
    expect(model.preparedBeforeLine).toBe('Prepared before optimization work began');
    expect(model.snapshotDate).toBe('July 8, 2026');
    expect(model.businessName).toBe('Clínica Veterinaria San Isidro');
    expect(model.market).toBe('Temuco');
    expect(model.metrics).toEqual(expect.arrayContaining([
      { label: 'Snapshot Visibility Score', value: '80/100' },
      { label: 'AI appearances', value: '12/15' },
      { label: 'Visibility gap', value: '20%' },
    ]));
    expect(model.localTrust).toContain('Google rating: 4.7');
    expect(model.localTrust).toContain('Google reviews: 15');
    expect(model.competitorBenchmarks.join('\n')).toContain("Friendly Vet's — 4⭐, 24 reviews");
    expect(model.appearedThemes[0]).toMatchObject({ label: expect.any(String), count: expect.any(Number), example: expect.any(String) });
    expect(model.ctaPrimary).toBe('Get the Full Report + Fix Plan + 30-Day Update — $88');
  });

  it('renders a valid PDF buffer with branded metadata and downloadable filename', () => {
    const model = buildFreeReportPdfModel({ leadId: lead.leadId, leadData: lead, researchData: research, now: new Date('2026-07-08T18:00:00Z') });
    const pdf = renderFreeReportPdf(model);

    expect(pdf.buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-');
    expect(pdf.buffer.includes(Buffer.from('/Subtype /Image'))).toBe(true);
    expect(pdf.buffer.includes(Buffer.from('/Logo'))).toBe(true);
    expect(pdf.filename).toBe('vizbiz-before-snapshot-clinica-veterinaria-san-isidro-lead-1234.pdf');
    expect(pdf.contentType).toBe('application/pdf');
    expect(pdf.buffer.byteLength).toBeGreaterThan(10000);
  });
});
