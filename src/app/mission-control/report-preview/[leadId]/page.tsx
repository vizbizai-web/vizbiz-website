import type { Metadata } from 'next';
import Link from 'next/link';
import { getLeadByLeadId, isSheetsConfigured } from '@/lib/google-sheets';
import { parseResearchDataFromNotes } from '@/lib/report-data';
import ReportContent from '@/app/report/[leadId]/report-content';
import type { LeadPageData } from '@/app/report/[leadId]/page';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function MissionControlReportPreviewPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  let lead = null;
  if (isSheetsConfigured()) {
    try {
      lead = await getLeadByLeadId(leadId);
    } catch (err) {
      console.error('[mission-control/report-preview] Failed to load lead:', err);
    }
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h1 className="text-2xl font-bold mb-3">Lead not found</h1>
          <p className="text-slate-300 mb-5">Mission Control could not load this lead from the CRM.</p>
          <Link className="text-cyan-300 hover:text-cyan-200" href="/mission-control/leads">Back to Pipeline</Link>
        </div>
      </div>
    );
  }

  const researchData = parseResearchDataFromNotes(lead.notes);
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

  if (!researchData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200 mb-3">Operator Preview</p>
          <h1 className="text-2xl font-bold mb-3">Report data is not ready yet</h1>
          <p className="text-slate-300 mb-5">The lead exists, but Mission Control could not parse completed research data yet.</p>
          <Link className="text-cyan-300 hover:text-cyan-200" href={`/mission-control/leads/${leadId}`}>Back to Lead</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617]">
      <div className="sticky top-0 z-50 border-b border-amber-300/20 bg-[#020617]/95 px-4 py-3 text-sm text-amber-100 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <strong>Mission Control operator preview.</strong> This is visible for review before client approval. Do not send if niche, prompts, or evidence are wrong.
            <div className="mt-1 text-xs text-amber-200/90">
              Niche: {researchData.nicheLabel || researchData.niche || 'Unknown'} · Visibility: {researchData.appearedCount} of {researchData.totalPrompts} AI queries · Competitors: {lead.competitor || 'None supplied'}
            </div>
          </div>
          <Link className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-cyan-200 hover:bg-cyan-300/10" href={`/mission-control/leads/${leadId}`}>
            Back to lead
          </Link>
        </div>
      </div>
      <ReportContent leadId={leadId} leadData={leadData} researchData={researchData} />
    </div>
  );
}
