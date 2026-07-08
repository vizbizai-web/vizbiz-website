import { NextResponse } from 'next/server';
import { getLeadByLeadId, isSheetsConfigured } from '@/lib/google-sheets';
import { getClientReportAccessState } from '@/lib/funnel-logic';
import { parseResearchDataFromNotes } from '@/lib/report-data';
import { buildFreeReportPdfModel, renderFreeReportPdf } from '@/lib/free-report-pdf';
import type { LeadPageData } from '@/app/report/[leadId]/page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  if (!isSheetsConfigured()) return NextResponse.json({ error: 'report storage unavailable' }, { status: 503 });

  const lead = await getLeadByLeadId(leadId);
  if (!lead) return NextResponse.json({ error: 'report not found' }, { status: 404 });

  const leadData: LeadPageData = {
    leadId: lead.leadId,
    businessName: lead.dealershipName,
    contactName: lead.contactName,
    location: lead.city,
    website: lead.website,
    email: lead.email,
    phone: lead.phone,
    competitor: lead.competitor,
    source: lead.source,
    status: lead.status,
    researchStatus: lead.researchStatus,
    snapshotAppeared: lead.snapshotAppeared,
    visibilityBand: lead.visibilityBand,
    notes: lead.notes,
  };
  const researchData = parseResearchDataFromNotes(lead.notes);
  const accessState = getClientReportAccessState({
    status: leadData.status,
    researchStatus: leadData.researchStatus,
    hasResearchData: Boolean(researchData),
  });

  if (accessState !== 'ready' || !researchData) {
    return NextResponse.json({ error: 'report not ready' }, { status: 403 });
  }

  const pdf = renderFreeReportPdf(buildFreeReportPdfModel({ leadId, leadData, researchData }));
  return new Response(new Uint8Array(pdf.buffer), {
    status: 200,
    headers: {
      'Content-Type': pdf.contentType,
      'Content-Disposition': `attachment; filename="${pdf.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
