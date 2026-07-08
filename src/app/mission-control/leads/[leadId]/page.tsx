'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { parseResearchDataFromNotes } from '@/lib/report-data';

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

type PromptResult = {
  prompt?: string;
  businessAppeared?: boolean;
  competitorAppeared?: boolean;
  provider?: string;
  categoryId?: string;
  categoryName?: string;
  promptId?: string;
};

type ResearchData = {
  promptResults?: PromptResult[];
  appearedCount: number;
  totalPrompts: number;
  statusBand?: string;
  competitorMention?: string;
  competitorLine?: string;
  whyThisMatters?: string;
  competitorCategories?: string[];
  niche?: string;
};

function engineLabel(provider?: string): string {
  const normalized = String(provider || '').toLowerCase();
  if (normalized === 'openai') return 'ChatGPT';
  if (normalized === 'gemini') return 'Gemini';
  if (normalized === 'perplexity') return 'Perplexity';
  if (normalized === 'web-search-fallback') return 'Web fallback';
  return provider ? String(provider) : 'Engine unknown';
}

function eventTitle(event: LeadEvent): string {
  const payload = event.event_payload || {};
  const template = payload.templateId ? ` · ${payload.templateId}` : '';
  const action = payload.action ? ` · ${payload.action}` : '';
  return `${event.event_type.replace(/_/g, ' ')}${template}${action}`;
}

function eventSummary(event: LeadEvent): string {
  const payload = event.event_payload || {};
  return [
    payload.reason ? `Reason: ${payload.reason}` : '',
    payload.trigger ? `Trigger: ${payload.trigger}` : '',
    payload.channel ? `Channel: ${payload.channel}` : '',
    payload.to ? `To: ${payload.to}` : '',
    payload.resendMessageId ? `Message: ${payload.resendMessageId}` : payload.messageId ? `Message: ${payload.messageId}` : '',
  ].filter(Boolean).join(' · ');
}

type RawPipelineData = {
  preflight?: any;
  operatorRevision?: any;
  research?: any;
};

type NichePanelData = {
  submittedNiche: string;
  websiteNiche: string;
  selectedNiche: string;
  confidence: number | null;
  method: string;
  status: string;
  conflictExplanation: string;
  evidence: Array<{ quote: string; sourceUrl?: string; bucket?: string }>;
};

type PaidIntakeData = {
  plan?: string;
  goal?: string;
  mainServices?: string;
  idealCustomer?: string;
};

type LeadEvent = {
  id?: string;
  event_type: string;
  event_payload?: Record<string, any> | null;
  created_at?: string;
};

type FixKitArtifact = {
  key: string;
  title: string;
  status: string;
  filename: string;
  content: string;
  instruction: string;
  validationErrors?: string[];
};

type FixKit = {
  status: string;
  artifacts: FixKitArtifact[];
  rescanScheduledAt?: string | null;
};

type MonthlyOnePager = {
  title: string;
  scoreLine: string;
  platformLines: string[];
  movementLines: string[];
  nextFocus: string;
};

type MonthlyOnePagerState = {
  status: string;
  onePager: MonthlyOnePager;
  validationErrors: string[];
  reportUrl: string;
  snapshotCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  new: '#22D3EE', researching: '#3B82F6', pending_review: '#F59E0B',
  approved: '#22C55E', email_drafted: '#A855F7', contacted: '#8B5CF6',
  needs_revision: '#F97316', do_not_send: '#EF4444', paid_intake_pending: '#F59E0B',
  paid_intake_submitted: '#22D3EE', paid_report_ready_for_review: '#F59E0B', paid_report_delivered: '#10B981',
  closed_won: '#10B981', closed_lost: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', researching: 'Researching', pending_review: 'Pending Review',
  approved: 'Approved', email_drafted: 'Email Drafted', contacted: 'Contacted',
  needs_revision: 'Needs Revision', do_not_send: 'Do Not Send', paid_intake_pending: 'Paid Intake Pending',
  paid_intake_submitted: 'Paid Intake Submitted', paid_report_ready_for_review: 'Paid Report Review', paid_report_delivered: 'Paid Delivered',
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

function parseResearchData(notes: string): ResearchData | null {
  return parseResearchDataFromNotes(notes) as ResearchData | null;
}

function parseRawPipelineData(notes: string): RawPipelineData | null {
  if (!notes) return null;
  const jsonStart = notes.lastIndexOf('{"preflight"');
  if (jsonStart < 0) return null;
  let depth = 0;
  for (let i = jsonStart; i < notes.length; i += 1) {
    if (notes[i] === '{') depth += 1;
    if (notes[i] === '}') depth -= 1;
    if (depth === 0) {
      try { return JSON.parse(notes.slice(jsonStart, i + 1)); } catch { return null; }
    }
  }
  return null;
}

function collectEvidence(value: any, bucket = ''): Array<{ quote: string; sourceUrl?: string; bucket?: string }> {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectEvidence(item, bucket));
  if (typeof value === 'object') {
    const quote = typeof value.quote === 'string' ? value.quote : typeof value.text === 'string' ? value.text : '';
    const sourceUrl = typeof value.sourceUrl === 'string' ? value.sourceUrl : typeof value.url === 'string' ? value.url : '';
    const here: Array<{ quote: string; sourceUrl?: string; bucket?: string }> = quote ? [{ quote, sourceUrl: sourceUrl || undefined, bucket }] : [];
    const nested: Array<{ quote: string; sourceUrl?: string; bucket?: string }> = Object.entries(value).flatMap(([key, child]) => ['quote', 'text', 'sourceUrl', 'url'].includes(key) ? [] : collectEvidence(child, key));
    return [...here, ...nested];
  }
  return [];
}

function buildNichePanelData(lead: Lead, raw: RawPipelineData | null, research: ResearchData | null): NichePanelData {
  const preflight = raw?.preflight || {};
  const resolution = preflight.nicheResolution || preflight.preflight?.nicheResolution || {};
  const businessNiche = resolution.businessNiche || {};
  const conflict = resolution.conflict || {};
  const submittedNiche = String(conflict.declaredCandidate || preflight.clientDeclaredNiche || preflight.submittedPrimaryService || '').trim();
  const websiteNiche = String(conflict.websiteCandidate || businessNiche.value || preflight.businessType || research?.niche || '').trim();
  const evidence = collectEvidence(businessNiche.primaryEvidence || resolution.primaryEvidence || preflight.evidence || resolution, 'primaryEvidence').slice(0, 8);
  return {
    submittedNiche,
    websiteNiche,
    selectedNiche: String(preflight.nicheLabel || preflight.niche || research?.niche || '').trim(),
    confidence: typeof businessNiche.confidence === 'number' ? businessNiche.confidence : typeof preflight.nicheConfidence === 'number' ? preflight.nicheConfidence : null,
    method: String(resolution.method || preflight.method || preflight.nicheMethod || 'unknown'),
    status: String(resolution.status || preflight.nicheStatus || (conflict.explanation ? 'CONFLICT' : 'OK')),
    conflictExplanation: String(conflict.explanation || resolution.explanation || ''),
    evidence,
  };
}

function parsePaidIntake(notes: string): PaidIntakeData | null {
  if (!notes) return null;
  try {
    const idx = notes.indexOf('PAID_INTAKE:');
    if (idx >= 0) return JSON.parse(notes.slice(idx + 'PAID_INTAKE:'.length));
  } catch {}
  return null;
}

function useLead(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/mission-control/api/pipeline-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { leads?: Lead[] };
      const found = json.leads?.find((l: Lead) => l.leadId === leadId);
      if (found) setLead(found);
      else setError('Lead not found');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
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

  const runAction = async (leadId: string, action: string, data?: Record<string, unknown>) => {
    setLoading(true);
    setLastResult(null);
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

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    if (!lead) return;
    const ok = await runAction(lead.leadId, action, data);
    if (ok) refetch();
  };

  const handleNeedsFix = async (reportType: 'free' | 'paid') => {
    const reason = window.prompt(`What needs fixing before this ${reportType} report goes out?`);
    if (!reason?.trim()) return;
    await handleAction('needs_revision', { reportType, reason: reason.trim(), autoRerun: true });
  };

  const handleNicheResolution = async (resolutionAction: 'use_submitted' | 'use_website' | 'custom') => {
    if (!nichePanel) return;
    const customNiche = resolutionAction === 'custom'
      ? window.prompt('Enter the exact business category/niche to use for the rerun:')?.trim()
      : '';
    if (resolutionAction === 'custom' && !customNiche) return;
    await handleAction('resolve_niche', {
      resolutionAction,
      submittedNiche: nichePanel.submittedNiche,
      websiteNiche: nichePanel.websiteNiche,
      customNiche,
      researchMode: canReviewPaid ? 'paid' : 'free',
    });
  };

  const handleDoNotSend = async () => {
    const reason = window.prompt('Why should this lead/report not be sent?');
    if (!reason?.trim()) return;
    await handleAction('do_not_send', { reason: reason.trim() });
  };

  const handleFixKitAction = async (action: string, body: Record<string, unknown> = {}) => {
    if (!lead) return;
    setFixKitMessage('Working...');
    const url = action === 'deliver'
      ? `/api/fix-kits/${lead.leadId}/deliver/`
      : action === 'artifact'
        ? `/api/fix-kits/${lead.leadId}/artifact/`
        : `/api/fix-kits/${lead.leadId}/`;
    const payload = action === 'generate' ? {} : action === 'approve_all' ? { action: 'approve_all' } : body;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      setFixKitMessage(json.error || `Fix Kit action failed (${res.status})`);
      return;
    }
    setFixKitMessage(action === 'deliver' ? 'Fix Kit delivered and 30-day re-scan scheduled.' : 'Fix Kit updated.');
    if (json.fixKit) setFixKit(json.fixKit);
    await refreshFixKit();
    refetch();
  };

  const research = lead ? parseResearchData(lead.notes) : null;
  const rawPipeline = lead ? parseRawPipelineData(lead.notes) : null;
  const nichePanel = lead ? buildNichePanelData(lead, rawPipeline, research) : null;
  const paidIntake = lead ? parsePaidIntake(lead.notes) : null;
  const timeline = lead ? buildTimeline(lead) : [];
  const [fixKit, setFixKit] = useState<FixKit | null>(null);
  const [fixKitMessage, setFixKitMessage] = useState<string>('');
  const [onePager, setOnePager] = useState<MonthlyOnePagerState | null>(null);
  const [onePagerMessage, setOnePagerMessage] = useState<string>('');
  const [leadEvents, setLeadEvents] = useState<LeadEvent[]>([]);
  const [leadEventsError, setLeadEventsError] = useState<string>('');

  const refreshFixKit = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/fix-kits/${leadId}/`);
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.fixKit) setFixKit(payload.fixKit);
    } catch {
      // Mission Control shows explicit generate errors; absence just means no kit yet.
    }
  }, [leadId]);

  const refreshOnePager = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/monthly-one-pagers/${leadId}/`);
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.onePager) setOnePager(payload as MonthlyOnePagerState);
    } catch {
      // One-pager appears only after two snapshots exist.
    }
  }, [leadId]);

  const refreshLeadEvents = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/mission-control/api/lead-events/${leadId}/`);
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.success === false) throw new Error(payload.error || `HTTP ${res.status}`);
      setLeadEvents(Array.isArray(payload.events) ? payload.events : []);
      setLeadEventsError('');
    } catch (err) {
      setLeadEventsError(err instanceof Error ? err.message : 'Events unavailable');
    }
  }, [leadId]);

  const handleOnePagerAction = async (action: 'approve' | 'send') => {
    if (!lead) return;
    setOnePagerMessage('Working...');
    const res = await fetch(`/api/monthly-one-pagers/${lead.leadId}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || payload.success === false) {
      setOnePagerMessage(payload.error || `One-pager action failed (${res.status})`);
      return;
    }
    setOnePagerMessage(action === 'send' ? `Monthly one-pager sent. Message ID: ${payload.messageId}` : 'Monthly one-pager approved.');
    await refreshOnePager();
    refetch();
  };

  useEffect(() => { refreshFixKit(); refreshOnePager(); refreshLeadEvents(); }, [refreshFixKit, refreshOnePager, refreshLeadEvents]);
  const leadStatus = lead?.status || '';
  const canReviewFree = ['pending_review', 'approved', 'email_drafted'].includes(leadStatus);
  const canRecoverRevision = leadStatus === 'needs_revision';
  const canReviewPaid = ['paid_intake_submitted', 'paid_report_ready_for_review'].includes(leadStatus);

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
              {canReviewFree && (
                <>
                  <Link href={`/mission-control/report-preview/${lead.leadId}`} target="_blank" className="text-sm px-4 py-2.5 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                    Operator Report Preview
                  </Link>
                  <ActionBtn label="✓ Approve & Send Free" color="#22C55E" loading={actionLoading} onClick={() => handleAction('approve_and_send', { reportType: 'free' })} />
                  <ActionBtn label="Send Standard E2" color="#14B8A6" loading={actionLoading} onClick={() => handleAction('approve_and_send', { reportType: 'free', templateId: 'E2_FREE_REPORT_DELIVERY' })} />
                  <ActionBtn label="Send Stale E2B" color="#A78BFA" loading={actionLoading} onClick={() => handleAction('approve_and_send', { reportType: 'free', templateId: 'E2B_STALE_DELIVERY' })} />
                  <ActionBtn label="Needs Fix" color="#F97316" loading={actionLoading} onClick={() => handleNeedsFix('free')} />
                  <ActionBtn label="Do Not Send" color="#EF4444" loading={actionLoading} onClick={handleDoNotSend} />
                  <ActionBtn label="Rerun Research" color="#3B82F6" loading={actionLoading} onClick={() => handleAction('rerun')} />
                </>
              )}
              {canRecoverRevision && (
                <>
                  <Link href={`/mission-control/report-preview/${lead.leadId}`} target="_blank" className="text-sm px-4 py-2.5 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                    Operator Report Preview
                  </Link>
                  <ActionBtn label="Rerun Research" color="#3B82F6" loading={actionLoading} onClick={() => handleAction('rerun', { reason: 'Needs revision fix requested from Mission Control' })} />
                  <ActionBtn label="Do Not Send" color="#EF4444" loading={actionLoading} onClick={handleDoNotSend} />
                </>
              )}
              {canReviewPaid && (
                <>
                  <Link href={`/mission-control/report-preview/${lead.leadId}`} target="_blank" className="text-sm px-4 py-2.5 rounded-lg border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                    Operator Paid Preview
                  </Link>
                  <ActionBtn label="Run Paid Research" color="#3B82F6" loading={actionLoading} onClick={() => handleAction('run_research', { researchMode: 'paid', force: true })} />
                  <ActionBtn label="✓ Approve & Deliver Paid" color="#22C55E" loading={actionLoading} onClick={() => handleAction('approve_and_send', { reportType: 'paid' })} />
                  <ActionBtn label="Needs Fix" color="#F97316" loading={actionLoading} onClick={() => handleNeedsFix('paid')} />
                  <ActionBtn label="Do Not Send" color="#EF4444" loading={actionLoading} onClick={handleDoNotSend} />
                </>
              )}
              <Link href={`/paid-intake/${lead.leadId}?plan=full_report_fix`} target="_blank" className="text-sm px-4 py-2.5 rounded-lg border transition-colors" style={{ background: 'rgba(168, 85, 247, 0.08)', color: '#C084FC', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                Paid Intake Link
              </Link>
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
          <div className="glass-card overflow-hidden rounded-xl p-5">
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

          <div className="glass-card overflow-hidden rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base text-white uppercase tracking-widest font-semibold">Diagnostics Timeline</h2>
                <p className="mt-1 text-xs text-slate-500">Latest lead_events entries, newest first. Use this to verify sends, suppressions, skips, approvals, reruns, and webhook activity.</p>
              </div>
              <button onClick={refreshLeadEvents} className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200">Refresh</button>
            </div>
            {leadEventsError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{leadEventsError}</div>}
            {!leadEventsError && leadEvents.length === 0 && <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-500">No diagnostic events found for this lead yet.</div>}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leadEvents.map((event, i) => (
                <div key={event.id || `${event.event_type}-${event.created_at}-${i}`} className="rounded-lg border border-slate-800/80 bg-slate-950/35 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold capitalize text-white">{eventTitle(event)}</span>
                    <span className="text-[11px] text-slate-500">{event.created_at ? new Date(event.created_at).toLocaleString() : 'time unknown'}</span>
                  </div>
                  {eventSummary(event) && <p className="mt-1 text-xs text-slate-400">{eventSummary(event)}</p>}
                  {event.event_payload && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-slate-600">Payload</summary>
                      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-black/30 p-2 text-[11px] text-slate-400">{JSON.stringify(event.event_payload, null, 2)}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          {nichePanel && (
            <NicheParityPanel
              data={nichePanel}
              loading={actionLoading}
              onResolve={handleNicheResolution}
            />
          )}

          {paidIntake && (
            <div className="glass-card overflow-hidden rounded-xl p-5">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-3">Paid Intake</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <Info label="Plan" value={paidIntake.plan === 'monthly_growth' ? 'Monthly Growth Plan' : 'Full Report + Fix'} />
                <Info label="Goal" value={paidIntake.goal || '—'} />
                <Info label="Main Services" value={paidIntake.mainServices || '—'} />
                <Info label="Ideal Customer" value={paidIntake.idealCustomer || '—'} />
              </div>
            </div>
          )}

          {canReviewPaid && (
            <FixKitPanel
              fixKit={fixKit}
              message={fixKitMessage}
              onGenerate={() => handleFixKitAction('generate')}
              onApproveAll={() => handleFixKitAction('approve_all')}
              onDeliver={() => handleFixKitAction('deliver')}
              onApproveArtifact={(artifactKey) => handleFixKitAction('artifact', { artifactKey, action: 'approve' })}
              onEditArtifact={(artifact) => {
                const edited = window.prompt(`Edit ${artifact.title}. Paste the corrected content:`, artifact.content);
                if (edited && edited.trim()) handleFixKitAction('artifact', { artifactKey: artifact.key, action: 'edit', content: edited });
              }}
            />
          )}

          <MonthlyOnePagerPanel
            onePager={onePager}
            message={onePagerMessage}
            onApprove={() => handleOnePagerAction('approve')}
            onSend={() => handleOnePagerAction('send')}
          />

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
            <div className="glass-card overflow-hidden rounded-xl p-5">
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

            <div className="glass-card overflow-hidden rounded-xl p-5">
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
            <div className="glass-card overflow-hidden rounded-xl p-5">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-4">Prompt Results ({research.promptResults.length} queries)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {research.promptResults.map((pr: PromptResult, i: number) => (
                  <div key={i} className={`px-3 py-2 rounded-lg border text-xs ${pr.businessAppeared ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/30 border-slate-800/30'}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                        {engineLabel(pr.provider)}
                      </span>
                      {pr.categoryId && (
                        <span title={pr.categoryName || pr.promptId || pr.categoryId} className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200">
                          {pr.categoryId}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 line-clamp-2">{pr.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${pr.businessAppeared ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className={pr.businessAppeared ? 'text-emerald-400' : 'text-slate-600'}>
                        {pr.businessAppeared ? `Visible on ${engineLabel(pr.provider)}` : `Not found on ${engineLabel(pr.provider)}`}
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

function NicheParityPanel({ data, loading, onResolve }: {
  data: NichePanelData;
  loading: boolean;
  onResolve: (action: 'use_submitted' | 'use_website' | 'custom') => void;
}) {
  const conflict = data.status === 'CONFLICT' || Boolean(data.conflictExplanation);
  return (
    <div className="glass-card overflow-hidden rounded-xl p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-base text-white uppercase tracking-widest font-semibold">Niche Resolution</p>
          <p className="mt-1 text-sm text-slate-400">Mission Control parity with Telegram: declared / website / custom all write the same resolution marker and rerun path.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${conflict ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}`}>
          {data.status || 'OK'}{data.confidence != null ? ` · ${(data.confidence * 100).toFixed(0)}%` : ''}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Info label="Submitted service / declared" value={data.submittedNiche || 'None captured'} />
        <Info label="Website-inferred type" value={data.websiteNiche || 'Insufficient evidence'} />
        <Info label="Current selected niche" value={data.selectedNiche || 'Not resolved'} />
        <Info label="Resolution method" value={data.method || 'unknown'} />
        <Info label="Confidence" value={data.confidence != null ? `${(data.confidence * 100).toFixed(0)}%` : '—'} />
        <Info label="Conflict explanation" value={data.conflictExplanation || 'No active conflict explanation'} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Verified evidence quotes</p>
        {data.evidence.length > 0 ? (
          <div className="space-y-2">
            {data.evidence.map((item, idx) => (
              <div key={`${item.quote}-${idx}`} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                <p>“{item.quote}”</p>
                <p className="mt-1 text-xs text-slate-600">{item.bucket || 'evidence'}{item.sourceUrl ? ` · ${item.sourceUrl}` : ''}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No verified quote payload found in this lead. Treat as careful-read before resolving.</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-800/50 pt-4 sm:flex-row sm:flex-wrap">
        <button disabled={loading || !data.submittedNiche} onClick={() => onResolve('use_submitted')} className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 disabled:opacity-40 sm:py-2">Use declared</button>
        <button disabled={loading || !data.websiteNiche} onClick={() => onResolve('use_website')} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-40 sm:py-2">Use website</button>
        <button disabled={loading} onClick={() => onResolve('custom')} className="rounded-lg border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-200 disabled:opacity-40 sm:py-2">Custom niche</button>
      </div>
    </div>
  );
}

function FixKitPanel({ fixKit, message, onGenerate, onApproveAll, onDeliver, onApproveArtifact, onEditArtifact }: {
  fixKit: FixKit | null;
  message: string;
  onGenerate: () => void;
  onApproveAll: () => void;
  onDeliver: () => void;
  onApproveArtifact: (artifactKey: string) => void;
  onEditArtifact: (artifact: FixKitArtifact) => void;
}) {
  const approved = Boolean(fixKit?.artifacts?.length && fixKit.artifacts.every((a) => a.status === 'approved' || a.status === 'delivered'));
  return (
    <div className="glass-card overflow-hidden rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base text-white uppercase tracking-widest font-semibold">Fix Kit</h2>
          <p className="text-sm text-slate-400 mt-1">Per-artifact preview, approval, persistent edit, package, and delivery gate.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onGenerate} className="text-sm px-4 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 bg-cyan-400/10">Generate / Regenerate</button>
          <button onClick={onApproveAll} disabled={!fixKit || fixKit.artifacts.some((a) => a.status === 'needs_operator_edit')} className="text-sm px-4 py-2 rounded-lg border border-emerald-400/30 text-emerald-300 bg-emerald-400/10 disabled:opacity-40">Approve all & package</button>
          <button onClick={onDeliver} disabled={!approved} className="text-sm px-4 py-2 rounded-lg border border-violet-400/30 text-violet-300 bg-violet-400/10 disabled:opacity-40">Deliver Fix Kit</button>
        </div>
      </div>
      {message && <div className="mb-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg p-3">{message}</div>}
      {!fixKit && <div className="text-sm text-slate-500">No Fix Kit generated yet. Generate after paid research and paid intake are complete.</div>}
      {fixKit && (
        <>
          <div className="mb-3 text-xs text-slate-400">Status: <span className="text-white">{fixKit.status}</span>{fixKit.rescanScheduledAt ? ` · 30-day re-scan: ${fixKit.rescanScheduledAt}` : ''}</div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {fixKit.artifacts.map((artifact) => (
              <div key={artifact.key} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{artifact.title}</h3>
                    <p className="text-[11px] text-slate-500">{artifact.filename}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full border ${artifact.status === 'approved' || artifact.status === 'delivered' ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' : artifact.status === 'needs_operator_edit' ? 'text-orange-300 border-orange-400/30 bg-orange-400/10' : 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10'}`}>{artifact.status}</span>
                </div>
                {artifact.validationErrors?.length ? <p className="text-xs text-orange-300 mb-2">Validation: {artifact.validationErrors.join(', ')}</p> : null}
                <p className="text-xs text-slate-400 mb-2">{artifact.instruction}</p>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-[11px] text-slate-300 border border-slate-800">{artifact.content}</pre>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onApproveArtifact(artifact.key)} disabled={artifact.status === 'approved' || artifact.status === 'delivered'} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/30 text-emerald-300 disabled:opacity-40">Approve</button>
                  <button onClick={() => onEditArtifact(artifact)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MonthlyOnePagerPanel({ onePager, message, onApprove, onSend }: { onePager: MonthlyOnePagerState | null; message: string; onApprove: () => void; onSend: () => void }) {
  if (!onePager) return null;
  const approved = onePager.status === 'approved' || onePager.status === 'sent';
  return (
    <div className="glass-card overflow-hidden rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base text-white uppercase tracking-widest font-semibold">Monthly One-Pager</h2>
          <p className="text-sm text-slate-400 mt-1">Operator-gated monthly report email. Requires two snapshots and number validation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onApprove} disabled={approved || onePager.validationErrors.length > 0} className="text-sm px-4 py-2 rounded-lg border border-emerald-400/30 text-emerald-300 bg-emerald-400/10 disabled:opacity-40">Approve one-pager</button>
          <button onClick={onSend} disabled={!approved || onePager.status === 'sent'} className="text-sm px-4 py-2 rounded-lg border border-violet-400/30 text-violet-300 bg-violet-400/10 disabled:opacity-40">Send monthly email</button>
        </div>
      </div>
      {message && <div className="mb-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg p-3">{message}</div>}
      <div className="mb-3 text-xs text-slate-400">Status: <span className="text-white">{onePager.status}</span> · Snapshots: {onePager.snapshotCount} · <a href={onePager.reportUrl} target="_blank" className="text-cyan-300 underline">report page</a></div>
      {onePager.validationErrors.length ? <p className="text-xs text-orange-300 mb-3">Validation: {onePager.validationErrors.join(', ')}</p> : null}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-white">{onePager.onePager.title}</h3>
        <p className="mt-2 text-sm text-slate-300">Score trend: {onePager.onePager.scoreLine}</p>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs text-slate-400">
          <div>
            <p className="uppercase tracking-widest text-slate-500 mb-1">Platform movement</p>
            <ul className="space-y-1">{onePager.onePager.platformLines.map((line) => <li key={line}>• {line}</li>)}</ul>
          </div>
          <div>
            <p className="uppercase tracking-widest text-slate-500 mb-1">What changed</p>
            <ul className="space-y-1">{onePager.onePager.movementLines.length ? onePager.onePager.movementLines.map((line) => <li key={line}>• {line}</li>) : <li>No major movement this month.</li>}</ul>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-300">{onePager.onePager.nextFocus}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-800/60 bg-slate-950/30 p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-200">{value || '—'}</p>
    </div>
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
