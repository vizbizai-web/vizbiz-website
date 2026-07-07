'use client';

import { useEffect, useState, useCallback } from 'react';
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
  triage?: { label: 'junk_candidate' | 'uncertain' | 'clean'; reasons: string[]; score: number };
}

const COLUMNS = [
  { id: 'new', label: 'New', color: '#22D3EE' },
  { id: 'researching', label: 'Researching', color: '#3B82F6' },
  { id: 'pending_review', label: 'Review', color: '#F59E0B' },
  { id: 'approved', label: 'Approved', color: '#22C55E' },
  { id: 'email_drafted', label: 'Email Drafted', color: '#A855F7' },
  { id: 'contacted', label: 'Contacted', color: '#8B5CF6' },
  { id: 'closed_won', label: 'Won', color: '#10B981' },
  { id: 'closed_lost', label: 'Lost', color: '#EF4444' },
];

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  researching: 'Researching',
  pending_review: 'Pending Review',
  approved: 'Approved',
  email_drafted: 'Email Drafted',
  contacted: 'Contacted',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

function getNiche(notes: string): string {
  if (!notes) return '';
  const m = notes.match(/"niche":"([^"]+)"/);
  return m ? m[1].replace(/_/g, ' ') : '';
}

function getScore(notes: string): { appeared: number; total: number } | null {
  if (!notes) return null;
  const m = notes.match(/"appearedCount":(\d+)/);
  const t = notes.match(/"totalPrompts":(\d+)/);
  if (m && t) return { appeared: parseInt(m[1]), total: parseInt(t[1]) };
  return null;
}

function usePipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/mission-control/api/pipeline-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLeads(json.leads || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { leads, loading, error, refetch: fetchData };
}

function useLeadAction() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const runAction = async (leadId: string, action: string, data?: any) => {
    setLoadingId(leadId);
    setErrorId(null);
    setSuccessId(null);
    try {
      const res = await fetch('/mission-control/api/lead-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, data }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }
      setSuccessId(leadId);
      setTimeout(() => setSuccessId(null), 2000);
      return true;
    } catch {
      setErrorId(leadId);
      return false;
    } finally {
      setLoadingId(null);
    }
  };

  return { runAction, loadingId, errorId, successId };
}

export default function PipelinePage() {
  const { leads, loading, error, refetch } = usePipeline();
  const { runAction, loadingId, errorId, successId } = useLeadAction();
  const [triageFilter, setTriageFilter] = useState<'all' | 'junk_candidate' | 'uncertain'>('all');

  const visibleLeads = leads.filter((lead) => triageFilter === 'all' || lead.triage?.label === triageFilter);
  const junkCandidates = leads.filter((lead) => lead.triage?.label === 'junk_candidate');
  const uncertainLeads = leads.filter((lead) => lead.triage?.label === 'uncertain');

  const byColumn = COLUMNS.map((col) => ({
    ...col,
    leads: visibleLeads.filter((l) => l.status === col.id),
  }));

  const handleAction = async (leadId: string, action: string, data?: any) => {
    const ok = await runAction(leadId, action, data);
    if (ok) refetch();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Pipeline</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Lead Pipeline</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads</p>
        </div>
        {loading && <span className="text-slate-500 text-sm">Syncing...</span>}
      </div>

      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm">{error}</div>
      )}

      <div className="glass-card border-0 rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Step 1 triage</p>
            <h2 className="text-white font-semibold mt-1">Spam defense + queue filters</h2>
            <p className="text-sm text-slate-400 mt-1">Bulk-junk is intentionally approval-gated. Candidates below are proposals only until Alex approves them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'junk_candidate', 'uncertain'] as const).map((filter) => (
              <button key={filter} onClick={() => setTriageFilter(filter)} className={`text-sm px-3 py-2 rounded-lg border ${triageFilter === filter ? 'text-cyan-200 border-cyan-400/50 bg-cyan-400/10' : 'text-slate-300 border-slate-700 bg-slate-900/40'}`}>
                {filter === 'all' ? `All (${leads.length})` : filter === 'junk_candidate' ? `Junk candidates (${junkCandidates.length})` : `Uncertain (${uncertainLeads.length})`}
              </button>
            ))}
          </div>
        </div>
        {junkCandidates.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
            Proposed junk candidates are visible in the filter. Do not bulk-junk until Alex approves the list. Uncertain leads are excluded by design.
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col md:flex-row md:gap-3 gap-2 md:overflow-x-auto pb-4">
        {byColumn.map((col) => (
          <div key={col.id} className="md:flex-shrink-0 md:w-72 w-full">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-t-2" style={{ borderColor: col.color }}>
              <h3 className="font-semibold text-white text-sm">{col.label}</h3>
              <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-500 rounded-full font-medium">
                {col.leads.length}
              </span>
            </div>

            {/* Lead Cards */}
            <div className="space-y-2 min-h-[100px]">
              {col.leads.map((lead) => {
                const score = getScore(lead.notes);
                const niche = getNiche(lead.notes);
                const isLoading = loadingId === lead.leadId;
                const isSuccess = successId === lead.leadId;
                const isError = errorId === lead.leadId;

                return (
                  <div key={lead.leadId} className="glass-card border-0 rounded-xl p-4 hover:border-slate-700/50 transition-all">
                    {/* Card header */}
                    <Link href={`/mission-control/leads/${lead.leadId}`}>
                      <div className="flex items-start gap-3 mb-2">
                        {/* Score circle */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{
                          background: score && score.appeared / score.total > 0.3 ? 'rgba(34,197,94,0.1)' : score && score.appeared / score.total > 0.1 ? 'rgba(245,158,11,0.1)' : score ? 'rgba(239,68,68,0.1)' : 'rgba(71,85,105,0.1)',
                          color: score && score.appeared / score.total > 0.3 ? '#22C55E' : score && score.appeared / score.total > 0.1 ? '#F59E0B' : score ? '#EF4444' : '#475569',
                        }}>
                          {score ? `${score.appeared}/${score.total}` : '—'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base truncate">{lead.dealershipName || 'Unknown Business'}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-slate-400">{lead.city || 'No location'}</span>
                            {niche && <span className="text-xs text-slate-400">• {niche}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        {lead.triage?.label === 'junk_candidate' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-200 border border-red-500/20" title={lead.triage.reasons.join(', ')}>Junk candidate · {lead.triage.score}</span>
                        )}
                        {lead.triage?.label === 'uncertain' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-500/20" title={lead.triage.reasons.join(', ')}>Uncertain · {lead.triage.score}</span>
                        )}
                        {lead.visibilityBand && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300">{lead.visibilityBand}</span>
                        )}
                        {niche && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300">{niche}</span>
                        )}
                      </div>
                    </Link>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/30">
                      {lead.status === 'new' && (
                        <>
                          <ActionBtn label="Research" color="#22D3EE" loading={isLoading} onClick={() => handleAction(lead.leadId, 'run_research')} />
                          <ActionBtn label="Junk" color="#EF4444" loading={isLoading} onClick={() => handleAction(lead.leadId, 'mark_junk')} />
                        </>
                      )}

                      {lead.status === 'pending_review' && (
                        <>
                          <ActionBtn label="✓ Send Free" color="#22C55E" loading={isLoading} onClick={() => handleAction(lead.leadId, 'approve_and_send', { reportType: 'free' })} />
                          <Link href={`/paid-intake/${lead.leadId}?plan=full_report_fix`} target="_blank" className="text-sm px-3 py-2 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                            Paid Intake
                          </Link>
                          <ActionBtn label="Needs Fix" color="#F97316" loading={isLoading} onClick={() => {
                            const reason = window.prompt('What needs fixing before this free report goes out?');
                            if (reason?.trim()) handleAction(lead.leadId, 'needs_revision', { reportType: 'free', reason: reason.trim(), autoRerun: true });
                          }} />
                          <ActionBtn label="Rerun" color="#3B82F6" loading={isLoading} onClick={() => handleAction(lead.leadId, 'rerun')} />
                          <ActionBtn label="Hold" color="#F59E0B" loading={isLoading} onClick={() => {
                            const reason = window.prompt('Why should this stay held for review?');
                            handleAction(lead.leadId, 'hold', { reason: reason?.trim() || 'Held from pipeline tab' });
                          }} />
                        </>
                      )}

                      {lead.status === 'approved' && (
                        <>
                          <Link href={`/mission-control/report-preview/${lead.leadId}`} target="_blank" className="text-sm px-3 py-2 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                            Preview
                          </Link>
                          <ActionBtn label="Send Free" color="#22C55E" loading={isLoading} onClick={() => handleAction(lead.leadId, 'approve_and_send', { reportType: 'free' })} />
                        </>
                      )}

                      {lead.status === 'email_drafted' && (
                        <>
                          <Link href="/mission-control/emails" className="text-sm px-3 py-2 rounded-lg border transition-colors" style={{ background: 'rgba(168, 85, 247, 0.08)', color: '#A855F7', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                            View Email
                          </Link>
                          <ActionBtn label="Send Free" color="#22C55E" loading={isLoading} onClick={() => handleAction(lead.leadId, 'approve_and_send', { reportType: 'free' })} />
                          <ActionBtn label="Mark Sent" color="#8B5CF6" loading={isLoading} onClick={() => handleAction(lead.leadId, 'update_status', { status: 'contacted' })} />
                        </>
                      )}

                      {lead.status === 'contacted' && (
                        <>
                          <ActionBtn label="Won 🎉" color="#10B981" loading={isLoading} onClick={() => handleAction(lead.leadId, 'update_status', { status: 'closed_won' })} />
                          <ActionBtn label="Lost" color="#EF4444" loading={isLoading} onClick={() => handleAction(lead.leadId, 'update_status', { status: 'closed_lost' })} />
                        </>
                      )}

                      {isSuccess && <span className="text-[10px] text-emerald-400 px-1">✓ Done</span>}
                      {isError && <span className="text-[10px] text-red-400 px-1">Error</span>}
                    </div>
                  </div>
                );
              })}

              {col.leads.length === 0 && !loading && (
                <div className="text-center py-6 text-slate-700 text-xs">Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, loading, onClick }: { label: string; color: string; loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-sm px-3 py-2 rounded-lg border transition-colors disabled:opacity-40"
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}
    >
      {loading ? '...' : label}
    </button>
  );
}
