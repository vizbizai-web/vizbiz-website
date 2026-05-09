'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  timestamp: string;
  dealershipName: string;
  website: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
  competitor: string;
  snapshotAppeared: string;
  visibilityBand: string;
  serviceVisibility: string;
  status: string;
  researchStatus: string;
  emailSentAt: string;
  notes: string;
  source: string;
  leadId: string;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  new: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  researching: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  pending_review: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  approved: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  contacted: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  closed_won: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  closed_lost: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

const RESEARCH_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  running: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  complete: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  failed: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  researching: 'In Research',
  pending_review: 'Pending Review',
  approved: 'Approved',
  contacted: 'Contacted',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

function useLead(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/pipeline-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const found = json.leads?.find((l: Lead) => l.leadId === leadId);
        if (!found) {
          setError('Lead not found');
        } else {
          setLead(found);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    if (leadId) fetchData();
  }, [leadId]);

  return { lead, loading, error };
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.leadId as string;
  const { lead, loading, error } = useLead(leadId);

  // Parse preflight notes from the notes field
  const preflightNotes = lead?.notes || '';
  let preflightJson: any = null;
  try {
    if (preflightNotes.includes('PREFLIGHT:')) {
      const match = preflightNotes.match(/PREFLIGHT:\s*(\{[\s\S]*?\})/);
      if (match) {
        preflightJson = JSON.parse(match[1]);
      }
    }
  } catch {
    preflightJson = null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/mission-control/leads" className="text-slate-400 hover:text-white transition-colors">
          ← Pipeline
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300">Lead Detail</span>
      </div>

      {loading && <div className="text-slate-400">Loading lead...</div>}

      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          {error}
        </div>
      )}

      {lead && (
        <>
          {/* Header Card */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{lead.dealershipName || 'Unknown Dealership'}</h1>
                <p className="text-slate-400 mt-1">{lead.city || 'No city'} • {lead.source || 'Unknown source'}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  STATUS_COLORS[lead.status]?.bg || 'bg-slate-500/10'
                } ${STATUS_COLORS[lead.status]?.text || 'text-slate-400'} ${
                  STATUS_COLORS[lead.status]?.border || 'border-slate-500/30'
                }`}>
                  {STATUS_LABELS[lead.status] || lead.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  RESEARCH_COLORS[lead.researchStatus]?.bg || 'bg-slate-500/10'
                } ${RESEARCH_COLORS[lead.researchStatus]?.text || 'text-slate-400'} ${
                  RESEARCH_COLORS[lead.researchStatus]?.border || 'border-slate-500/30'
                }`}>
                  {lead.researchStatus || 'pending'}
                </span>
              </div>
            </div>

            {/* Report Link */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <Link
                href={`https://vizbiz.ai/report/${lead.leadId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Report →
              </Link>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Contact Info</h2>
              <dl className="space-y-3">
                <DetailRow label="Contact Name" value={lead.contactName} />
                <DetailRow label="Email" value={lead.email} isEmail />
                <DetailRow label="Phone" value={lead.phone} />
                <DetailRow label="Submitted" value={formatDate(lead.timestamp)} />
              </dl>
            </div>

            {/* Visibility Data */}
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Visibility Snapshot</h2>
              <dl className="space-y-3">
                <DetailRow label="Website" value={lead.website} isLink />
                <DetailRow label="Appeared In" value={lead.snapshotAppeared} />
                <DetailRow label="Visibility Band" value={lead.visibilityBand} />
                <DetailRow label="Service Visibility" value={lead.serviceVisibility} />
                <DetailRow label="Competitor" value={lead.competitor} />
              </dl>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Notes</h2>
            {preflightJson ? (
              <pre className="text-xs text-slate-400 bg-slate-900/50 rounded-lg p-4 overflow-auto max-h-60">
                {JSON.stringify(preflightJson, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-500 text-sm">
                {lead.notes || 'No notes'}
              </p>
            )}
          </div>

          {/* Email Sent */}
          {lead.emailSentAt && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Email Sent</h2>
              <p className="text-slate-400 text-sm">{formatDate(lead.emailSentAt)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value, isEmail, isLink }: {
  label: string;
  value: string;
  isEmail?: boolean;
  isLink?: boolean;
}) {
  if (!value) return (
    <div className="flex justify-between">
      <dt className="text-slate-500 text-sm">{label}</dt>
      <dd className="text-slate-600 text-sm">—</dd>
    </div>
  );

  return (
    <div className="flex justify-between items-start gap-4">
      <dt className="text-slate-500 text-sm flex-shrink-0">{label}</dt>
      <dd className="text-slate-300 text-sm text-right">
        {isEmail ? (
          <a href={`mailto:${value}`} className="text-blue-400 hover:underline">{value}</a>
        ) : isLink ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{value}</a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
