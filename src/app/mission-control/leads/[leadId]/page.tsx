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

const STATUS_COLORS: Record<string, string> = {
  new: '#22D3EE', researching: '#3B82F6', pending_review: '#F59E0B',
  approved: '#22C55E', email_drafted: '#A855F7', contacted: '#8B5CF6',
  closed_won: '#10B981', closed_lost: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', researching: 'Researching', pending_review: 'Pending Review',
  approved: 'Approved', email_drafted: 'Email Drafted', contacted: 'Contacted',
  closed_won: 'Won', closed_lost: 'Lost',
};

const PIPELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'research', label: 'Research' },
  { key: 'review', label: 'Review' },
  { key: 'report', label: 'Report' },
  { key: 'email', label: 'Email' },
  { key: 'contacted', label: 'Contacted' },
];

function parseResearchData(notes: string): any | null {
  if (!notes) return null;
  try {
    if (notes.includes('RESEARCH_DATA:')) {
      const match = notes.match(/RESEARCH_DATA:\s*(\{[\s\S]*\})/);
      if (match) return JSON.parse(match[1]);
    }
  } catch {}
  return null;
}

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
      found ? setLead(found) : setError('Lead not found');
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { if (leadId) fetchData(); }, [leadId, fetchData]);
  return { lead, loading, error, refetch: fetchData };
}

function useLeadAction() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const runAction = async (leadId: string, action: string, data?: any) => {
    setLoading(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/lead-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastResult('success');
      setTimeout(() => setLastResult(null), 3000);
      return true;
    } catch {
      setLastResult('error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { runAction, loading, lastResult };
}

function buildTimeline(lead: Lead) {
  const statusIdx = ['new', 'researching', 'pending_review', 'approved', 'email_drafted', 'contacted', 'closed_won', 'closed_lost'].indexOf(lead.status);

  return PIPELINE_STEPS.map((step, i) => {
    let state: 'done' | 'current' | 'pending' = 'pending';
    if (i < statusIdx || ['closed_won', 'closed_lost'].includes(lead.status)) state = 'done';
    else if (i === statusIdx || (step.key === 'email' && lead.status === 'email_drafted')) state = 'current';

    // Specific overrides
    if (step.key === 'submitted') state = 'done';
    if (step.key === 'research' && lead.researchStatus === 'complete') state = 'done';
    if (step.key === 'research' && lead.status === 'researching') state = 'current';
    if (step.key === 'review' && lead.status === 'pending_review') state = 'current';
    if (step.key === 'report' && ['approved', 'email_drafted', 'contacted', 'closed_won', 'closed_lost'].includes(lead.status)) state = 'done';
    if (step.key === 'email' && lead.status === 'email_drafted') state = 'current';
    if (step.key === 'contacted' && ['contacted', 'closed_won', 'closed_lost'].includes(lead.status)) state = 'done';

    return { ...step, state };
  });
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.leadId as string;
  const { lead, loading, error, refetch } = useLead(leadId);
  const { runAction, loading: actionLoading, lastResult } = useLeadAction();

  const handleAction = async (action: string, data?: any) => {
    if (!lead) return;
    const ok = await runAction(lead.leadId, action, data);
    if (ok) refetch();
  };

  const research = lead ? parseResearchData(lead.notes) : null;
  const timeline = lead ? buildTimeline(lead) : [];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/mission-control/leads" className="text-slate-500 hover:text-slate-300 transition-colors">← Pipeline</Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-400">{lead?.dealershipName || 'Lead'}</span>
      </div>

      {loading && <div className="text-slate-500 text-sm">Loading...</div>}
      {error && <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">{error}</div>}

      {lead && (
        <>
          {/* Header */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{lead.dealershipName || 'Unknown Business'}</h1>
                <p className="text-slate-400 mt-1 text-base">{lead.city || 'No location'} • {lead.source || 'Unknown source'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{
                  background: `${STATUS_COLORS[lead.status] || '#475569'}15`,
                  color: STATUS_COLORS[lead.status] || '#94A3B8',
                  borderColor: `${STATUS_COLORS[lead.status] || '#475569'}30`
                }}>
                  {STATUS_LABELS[lead.status] || lead.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/30">
              {lead.status === 'pending_review' && (
                <>
                  <ActionBtn label="✓ Approve Free Report" color="#22C55E" loading={actionLoading} onClick={() => handleAction('approve', { reportType: 'free' })} />
                  <ActionBtn label="✓ Approve Paid Report" color="#25D1F2" loading={actionLoading} onClick={() => handleAction('approve', { reportType: 'paid' })} />
                  <ActionBtn label="Rerun Research" color="#3B82F6" loading={actionLoading} onClick={() => handleAction('rerun')} />
                  <ActionBtn label="Hold" color="#F59E0B" loading={actionLoading} onClick={() => handleAction('hold')} />
                </>
              )}
              {lead.status === 'approved' && (
                <>
                  <Link href={`/report/${lead.leadId}`} target="_blank" className="text-sm px-4 py-2.5 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                    View Live Report
                  </Link>
                  <ActionBtn label="Draft Email" color="#A855F7" loading={actionLoading} onClick={() => handleAction('draft_email')} />
                </>
              )}
              {lead.status === 'email_drafted' && (
                <>
                  <ActionBtn label="Approve Email → Drafts" color="#22C55E" loading={actionLoading} onClick={() => handleAction('approve_email')} />
                  <ActionBtn label="Mark Sent" color="#8B5CF6" loading={actionLoading} onClick={() => handleAction('update_status', { status: 'contacted' })} />
                </>
              )}
              {lead.status === 'contacted' && (
                <>
                  <ActionBtn label="Follow Up" color="#F59E0B" loading={actionLoading} onClick={() => handleAction('follow_up')} />
                  <ActionBtn label="Won 🎉" color="#10B981" loading={actionLoading} onClick={() => handleAction('update_status', { status: 'closed_won' })} />
                  <ActionBtn label="Lost" color="#EF4444" loading={actionLoading} onClick={() => handleAction('update_status', { status: 'closed_lost' })} />
                </>
              )}
              {lastResult === 'success' && <span className="text-xs text-emerald-400 self-center">✓ Done</span>}
              {lastResult === 'error' && <span className="text-xs text-red-400 self-center">Error</span>}
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-4">Pipeline Progress</h2>
            <div className="flex items-center gap-0">
              {timeline.map((step, i) => (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-2" style={{
                    background: step.state === 'done' ? '#22C55E' : step.state === 'current' ? '#25D1F2' : '#1E293B',
                    color: step.state === 'pending' ? '#475569' : '#02091F',
                  }}>
                    {step.state === 'done' ? '✓' : step.state === 'current' ? i + 1 : i + 1}
                  </div>
                  <span className="text-xs text-slate-400 text-center">{step.label}</span>
                  {i < timeline.length - 1 && (
                    <div className="absolute" style={{ display: 'none' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Score + Research Data */}
          {research && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* AI Visibility Score */}
              <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center">
                <p className="text-base text-white uppercase tracking-widest font-semibold mb-4">AI Visibility</p>
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1E293B" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                      stroke={research.appearedCount / research.totalPrompts > 0.3 ? '#22C55E' : research.appearedCount / research.totalPrompts > 0.1 ? '#F59E0B' : '#EF4444'}
                      strokeDasharray={`${(research.appearedCount / research.totalPrompts) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{research.appearedCount}</span>
                    <span className="text-[10px] text-slate-500">of {research.totalPrompts}</span>
                  </div>
                </div>
                <span className="text-xs font-medium mt-3" style={{
                  color: research.statusBand === 'Strong' ? '#22C55E' : research.statusBand === 'Moderate' ? '#F59E0B' : '#EF4444'
                }}>
                  {research.statusBand || 'Weak'} visibility
                </span>
              </div>

              {/* Key Insights */}
              <div className="lg:col-span-2 glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-base text-white uppercase tracking-widest font-semibold">Research Insights</h2>

                {research.competitorMention && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Top Competitor</p>
                    <p className="text-sm text-white">{research.competitorMention}</p>
                  </div>
                )}

                {research.competitorLine && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Competitive Position</p>
                    <p className="text-base text-white">{research.competitorLine}</p>
                  </div>
                )}

                {research.whyThisMatters && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Why This Matters</p>
                    <p className="text-base text-white">{research.whyThisMatters}</p>
                  </div>
                )}

                {research.competitorCategories && research.competitorCategories.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Competitor Advantages</p>
                    <ul className="space-y-1">
                      {research.competitorCategories.map((cat: string, i: number) => (
                        <li key={i} className="text-base text-slate-300 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {research.niche && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Niche</p>
                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-800/50 text-slate-400">{research.niche.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-4">Contact</h2>
              <dl className="space-y-3">
                <ContactRow label="Name" value={lead.contactName} />
                <ContactRow label="Email" value={lead.email} isEmail />
                <ContactRow label="Phone" value={lead.phone} />
                <ContactRow label="Website" value={lead.website} isLink />
                <ContactRow label="City" value={lead.city} />
                <ContactRow label="Source" value={lead.source} />
              </dl>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-4">Details</h2>
              <dl className="space-y-3">
                <ContactRow label="Lead ID" value={lead.leadId} />
                <ContactRow label="Submitted" value={formatDate(lead.timestamp)} />
                <ContactRow label="Visibility Band" value={lead.visibilityBand} />
                <ContactRow label="Appeared In" value={lead.snapshotAppeared} />
                <ContactRow label="Research Status" value={lead.researchStatus || 'pending'} />
                <ContactRow label="Email Sent" value={lead.emailSentAt ? formatDate(lead.emailSentAt) : 'Not sent'} />
              </dl>
            </div>
          </div>

          {/* Prompt Results (if available) */}
          {research?.promptResults && (
            <div className="glass-card rounded-xl p-5">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-4">Prompt Results ({research.promptResults.length} queries)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {research.promptResults.map((pr: any, i: number) => (
                  <div key={i} className={`px-3 py-2 rounded-lg border text-xs ${pr.businessAppeared ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/30 border-slate-800/30'}`}>
                    <p className="text-slate-400 truncate">{pr.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${pr.businessAppeared ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className={pr.businessAppeared ? 'text-emerald-400' : 'text-slate-600'}>
                        {pr.businessAppeared ? 'Visible' : 'Not found'}
                      </span>
                      {pr.competitorAppeared && !pr.businessAppeared && (
                        <span className="text-red-400/60">• competitor shown</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActionBtn({ label, color, loading, onClick }: { label: string; color: string; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="text-sm px-4 py-2.5 rounded-lg border transition-colors disabled:opacity-40"
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}>
      {loading ? '...' : label}
    </button>
  );
}

function ContactRow({ label, value, isEmail, isLink }: { label: string; value?: string; isEmail?: boolean; isLink?: boolean }) {
  if (!value || value === 'Not provided via intake form') return (
    <div className="flex justify-between">
      <dt className="text-slate-400 text-sm">{label}</dt>
      <dd className="text-slate-700 text-xs">—</dd>
    </div>
  );
  return (
    <div className="flex justify-between items-center gap-3">
      <dt className="text-slate-400 text-sm">{label}</dt>
      <dd className="text-white text-sm text-right">
        {isEmail ? <a href={`mailto:${value}`} className="hover:text-white transition-colors">{value}</a> :
         isLink ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" className="hover:text-white transition-colors">{value.replace(/^https?:\/\//, '')}</a> :
         value}
      </dd>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}
