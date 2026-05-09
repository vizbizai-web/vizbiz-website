'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface Draft {
  leadId: string;
  dealershipName: string;
  email: string;
  contactName: string;
  city: string;
  website: string;
  status: string;
  subject: string;
  body: string;
  templateName: string;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  new: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  researching: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  pending_review: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  approved: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  email_drafted: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  contacted: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
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
  email_drafted: 'Email Drafted',
  contacted: 'Contacted',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const PIPELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'preflight', label: 'Preflight' },
  { key: 'research', label: 'Research' },
  { key: 'review', label: 'Review' },
  { key: 'report', label: 'Report' },
  { key: 'email', label: 'Email' },
  { key: 'contacted', label: 'Contacted' },
];

function useLead(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const found = json.leads?.find((l: Lead) => l.leadId === leadId);
      if (!found) {
        setError('Lead not found');
      } else {
        setLead(found);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) fetchData();
  }, [leadId, fetchData]);

  return { lead, loading, error, refetch: fetchData };
}

function useEmailDraft(leadId: string) {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    async function fetchDraft() {
      try {
        const res = await fetch('/api/email-drafts');
        if (!res.ok) return;
        const json = await res.json();
        const found = json.drafts?.find((d: Draft) => d.leadId === leadId);
        setDraft(found || null);
      } catch {
        setDraft(null);
      }
    }
    if (leadId) fetchDraft();
  }, [leadId]);

  return { draft };
}

function useLeadAction() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const runAction = async (leadId: string, action: string, data?: any) => {
    setLoadingId(leadId);
    setErrorId(null);
    try {
      const res = await fetch('/api/lead-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLoadingId(null);
      return true;
    } catch {
      setErrorId(leadId);
      setLoadingId(null);
      return false;
    }
  };

  return { runAction, loadingId, errorId };
}

function buildTimeline(lead: Lead) {
  const steps = [...PIPELINE_STEPS];
  const timeline = steps.map((step) => {
    let status: 'done' | 'current' | 'pending' = 'pending';
    let ts: string | null = null;

    if (step.key === 'submitted') {
      status = 'done';
      ts = lead.timestamp;
    } else if (step.key === 'preflight') {
      if (lead.notes?.includes('PREFLIGHT:')) {
        status = 'done';
        ts = lead.timestamp;
      }
    } else if (step.key === 'research') {
      if (lead.researchStatus === 'complete') {
        status = 'done';
        ts = lead.timestamp;
      } else if (lead.researchStatus === 'running') {
        status = 'current';
      }
    } else if (step.key === 'review') {
      if (lead.status === 'pending_review') {
        status = 'current';
      } else if (
        ['approved', 'email_drafted', 'contacted', 'closed_won', 'closed_lost'].includes(lead.status)
      ) {
        status = 'done';
        ts = lead.timestamp;
      }
    } else if (step.key === 'report') {
      if (['approved', 'email_drafted', 'contacted', 'closed_won', 'closed_lost'].includes(lead.status)) {
        status = 'done';
        ts = lead.timestamp;
      }
    } else if (step.key === 'email') {
      if (lead.status === 'email_drafted') {
        status = 'current';
      } else if (['contacted', 'closed_won', 'closed_lost'].includes(lead.status)) {
        status = 'done';
        ts = lead.emailSentAt || lead.timestamp;
      }
    } else if (step.key === 'contacted') {
      if (['contacted', 'closed_won', 'closed_lost'].includes(lead.status)) {
        status = 'done';
        ts = lead.emailSentAt || lead.timestamp;
      }
    }

    // Override current if this matches the exact stage
    if (
      (step.key === 'submitted' && lead.status === 'new') ||
      (step.key === 'research' && lead.status === 'researching') ||
      (step.key === 'review' && lead.status === 'pending_review') ||
      (step.key === 'report' && lead.status === 'approved') ||
      (step.key === 'email' && lead.status === 'email_drafted') ||
      (step.key === 'contacted' && lead.status === 'contacted')
    ) {
      status = 'current';
    }

    return { ...step, status, ts };
  });

  return timeline;
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.leadId as string;
  const { lead, loading, error, refetch } = useLead(leadId);
  const { draft } = useEmailDraft(leadId);
  const { runAction, loadingId, errorId } = useLeadAction();

  const handleAction = async (action: string, data?: any) => {
    if (!lead) return;
    const ok = await runAction(lead.leadId, action, data);
    if (ok) refetch();
  };

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

  const timeline = lead ? buildTimeline(lead) : [];

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

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
              {lead.status === 'new' && (
                <>
                  <button
                    onClick={() => handleAction('run_research')}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Run Research'}
                  </button>
                  <button
                    onClick={() => handleAction('mark_junk')}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Mark Junk'}
                  </button>
                </>
              )}

              {lead.status === 'pending_review' && (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Approve ✓'}
                  </button>
                  <button
                    onClick={() => handleAction('hold')}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Hold ⏸'}
                  </button>
                  <button
                    onClick={() => handleAction('rerun')}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Rerun ↻'}
                  </button>
                </>
              )}

              {lead.status === 'email_drafted' && (
                <>
                  <Link
                    href="/mission-control/emails"
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors inline-block"
                  >
                    View Email
                  </Link>
                  <button
                    onClick={() => handleAction('update_status', { status: 'contacted' })}
                    disabled={loadingId === lead.leadId}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === lead.leadId ? '...' : 'Mark Sent'}
                  </button>
                </>
              )}

              {lead.status === 'approved' && (
                <Link
                  href={`/report/${lead.leadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors inline-block"
                >
                  View Report
                </Link>
              )}

              {errorId === lead.leadId && (
                <span className="text-xs text-red-400 self-center">Error</span>
              )}
            </div>

            {/* Report Link */}
            <div className="mt-3">
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

          {/* Pipeline Timeline */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Pipeline Timeline</h2>
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {timeline.map((step, i) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                        step.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : step.status === 'current'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {step.status === 'done' ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${
                      step.status === 'done'
                        ? 'text-emerald-400'
                        : step.status === 'current'
                        ? 'text-cyan-400'
                        : 'text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                    {step.ts && (
                      <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(step.ts)}</p>
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-6 h-px mt-4 ${
                      step.status === 'done' ? 'bg-emerald-500/40' : 'bg-slate-800'
                    }`} />
                  )}
                </div>
              ))}
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

          {/* Email Preview */}
          {draft && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Email Draft</h2>
              <p className="text-sm text-slate-300 font-medium mb-2">{draft.subject || 'No subject'}</p>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{draft.body}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  href="/mission-control/emails"
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors inline-block"
                >
                  Open in Email Hub
                </Link>
              </div>
            </div>
          )}

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
