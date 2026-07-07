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
}

type DraftStatus = 'generated' | 'approved' | 'sent';

interface EmailDraft {
  lead: Lead;
  research: any;
  subject: string;
  body: string;
  status: DraftStatus;
}

interface GatedEmailCard {
  leadId: string;
  businessName: string;
  city: string;
  email: string;
  primaryActionLabel: string;
  reportPreviewUrl: string;
  detailUrl: string;
  badges?: Array<{ label: string; tone: string; detail?: string }>;
}

function parseResearch(notes: string): any | null {
  if (!notes) return null;
  try {
    if (notes.includes('RESEARCH_DATA:')) {
      const match = notes.match(/RESEARCH_DATA:\s*(\{[\s\S]*\})/);
      if (match) return JSON.parse(match[1]);
    }
  } catch {}
  return null;
}

function parseSavedEmailDraft(notes: string): { subject: string; body: string; approved: boolean } | null {
  if (!notes) return null;
  const matches = Array.from(notes.matchAll(/\[EMAIL_DRAFT_(SAVED|APPROVED)[^\]]*\]\s*(\{[^\n]+\})/g));
  const latest = matches.at(-1);
  if (!latest) return null;
  try {
    const parsed = JSON.parse(latest[2]);
    if (typeof parsed.subject !== 'string' || typeof parsed.body !== 'string') return null;
    return { subject: parsed.subject, body: parsed.body, approved: latest[1] === 'APPROVED' };
  } catch {
    return null;
  }
}

function generateDraft(lead: Lead, research: any): { subject: string; body: string } {
  const name = lead.contactName || lead.dealershipName;
  const biz = lead.dealershipName;
  const city = lead.city;
  const score = research?.appearedCount || 0;
  const total = research?.totalPrompts || 20;
  const competitor = research?.competitorMention || 'competitors in your area';
  const why = research?.whyThisMatters || 'AI platforms like ChatGPT are shaping purchase decisions before people even visit your website.';
  const niche = (research?.niche || 'business').replace(/_/g, ' ');

  const subject = `Your ${niche} business in ${city} — AI visibility report`;
  const body = `Hi${name ? ` ${name}` : ''},

I ran an AI visibility check on ${biz} and wanted to share what I found.

Out of ${total} buyer-intent queries related to ${niche} in ${city}, ${biz} appeared in ${score}. Meanwhile, ${competitor} showed up consistently.

${why}

I built a free report that breaks down exactly where you're visible, where you're not, and what to fix. No pitch — just the data.

You can view it here: https://vizbiz.ai/report/${lead.leadId}

If you want to talk through what it means, reply here. Happy to walk through it.

— Alex
VizBiz.ai`;

  return { subject, body };
}

function useDrafts() {
  const [drafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [gatedCards, setGatedCards] = useState<GatedEmailCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/mission-control/api/pipeline-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const leads: Lead[] = json.leads || [];

      // Generate drafts for leads that are email_drafted or approved
      const draftable = leads.filter(l => l.status === 'email_drafted' || l.status === 'approved');
      const generated: EmailDraft[] = draftable.map(lead => {
        const research = parseResearch(lead.notes);
        const saved = parseSavedEmailDraft(lead.notes);
        const generatedDraft = generateDraft(lead, research);
        return {
          lead,
          research,
          subject: saved?.subject || generatedDraft.subject,
          body: saved?.body || generatedDraft.body,
          status: saved?.approved ? 'approved' as DraftStatus : 'generated' as DraftStatus,
        };
      });

      setEmailDrafts(generated);
      setGatedCards((json.needsYou || []).filter((item: any) => item.primaryAction === 'approve_gated_email'));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { drafts, setEmailDrafts, gatedCards, setGatedCards, loading, error, refetch: fetchData };
}

export default function EmailsPage() {
  const { drafts, setEmailDrafts, gatedCards, setGatedCards, loading, error, refetch } = useDrafts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'generated' | 'approved' | 'sent'>('all');

  const filtered = drafts.filter(d => filterTab === 'all' || d.status === filterTab);
  const counts = {
    all: drafts.length,
    generated: drafts.filter(d => d.status === 'generated').length,
    approved: drafts.filter(d => d.status === 'approved').length,
    sent: drafts.filter(d => d.status === 'sent').length,
  };

  const handleSaveDraft = async (draft: EmailDraft) => {
    const subject = editSubject.trim();
    const body = editBody.trim();
    const res = await fetch('/mission-control/api/lead-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: draft.lead.leadId, action: 'save_email_draft', data: { subject, body } }),
    });
    if (res.ok) {
      setEmailDrafts((current) => current.map((item) =>
        item.lead.leadId === draft.lead.leadId ? { ...item, subject, body } : item
      ));
      setEditingId(null);
    }
  };

  const handleApprove = async (draft: EmailDraft) => {
    const res = await fetch('/mission-control/api/lead-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: draft.lead.leadId, action: 'approve_email', data: { subject: draft.subject, body: draft.body } }),
    });
    if (res.ok) { setConfirmId(null); refetch(); }
  };

  const handleApproveGated = async (card: GatedEmailCard) => {
    const res = await fetch('/mission-control/api/lead-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: card.leadId, action: 'approve_gated_email', data: { templateId: 'E11_30_DAY_RESCAN' } }),
    });
    if (res.ok) {
      setGatedCards((current) => current.filter((item) => item.leadId !== card.leadId));
      refetch();
    }
  };

  const handleMarkSent = async (draft: EmailDraft) => {
    const res = await fetch('/mission-control/api/lead-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: draft.lead.leadId, action: 'update_status', data: { status: 'contacted' } }),
    });
    if (res.ok) refetch();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-300 uppercase tracking-widest font-semibold">Emails</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Email Hub</h1>
        <p className="text-slate-400 mt-1">{drafts.length} draft{drafts.length !== 1 ? 's' : ''} generated from pipeline</p>
      </div>

      {loading && <div className="text-slate-500 text-sm">Generating drafts...</div>}
      {error && <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">{error}</div>}

      {/* Gated sends */}
      {gatedCards.length > 0 && (
        <section className="rounded-2xl border border-violet-400/25 bg-violet-400/5 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200">Gated sends</p>
          <h2 className="mt-2 text-xl font-bold text-white">Operator approval required</h2>
          <div className="mt-4 space-y-3">
            {gatedCards.map((card) => (
              <div key={card.leadId} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link href={card.detailUrl} className="break-words text-base font-semibold text-white hover:text-cyan-200">{card.businessName}</Link>
                    <p className="mt-1 break-words text-xs text-slate-500">{card.city || 'No city'}{card.email ? ` · ${card.email}` : ''}</p>
                    <p className="mt-2 text-sm text-slate-300">{card.primaryActionLabel}</p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                    <Link href={card.reportPreviewUrl} target="_blank" className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">Preview</Link>
                    <button onClick={() => handleApproveGated(card)} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">Approve send</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex w-full flex-wrap gap-1 bg-[#0A0B14] rounded-lg border border-slate-800/40 p-1 sm:w-fit">
        {(['all', 'generated', 'approved', 'sent'] as const).map(tab => (
          <button key={tab} onClick={() => setFilterTab(tab)}
            className={`text-sm px-4 py-2 rounded-md transition-colors ${filterTab === tab ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {counts[tab] > 0 && <span className="ml-1.5 text-slate-600">({counts[tab]})</span>}
          </button>
        ))}
      </div>

      {/* Draft Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && !loading && (
          <div className="glass-card border-0 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">{filterTab === 'all' ? 'No drafts yet — approve leads to generate emails' : `No ${filterTab} emails`}</p>
          </div>
        )}

        {filtered.map((draft) => {
          const isExpanded = expandedId === draft.lead.leadId;
          const isEditing = editingId === draft.lead.leadId;
          const score = draft.research?.appearedCount || 0;
          const total = draft.research?.totalPrompts || 20;
          const niche = (draft.research?.niche || '').replace(/_/g, ' ');

          return (
            <div key={draft.lead.leadId} className="glass-card border-0 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{
                      background: score / total > 0.3 ? 'rgba(34,197,94,0.1)' : score / total > 0.1 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: score / total > 0.3 ? '#22C55E' : score / total > 0.1 ? '#F59E0B' : '#EF4444',
                    }}>
                      {score}/{total}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/mission-control/leads/${draft.lead.leadId}`} className="break-words text-white font-semibold text-base hover:text-slate-300 transition-colors">
                        {draft.lead.dealershipName || 'Unknown Business'}
                      </Link>
                      <p className="text-[11px] text-slate-600 break-words">{draft.lead.contactName || 'No contact'} • {draft.lead.email || 'No email'} • {draft.lead.city || 'No city'}{niche ? ` • ${niche}` : ''}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                    background: draft.status === 'sent' ? 'rgba(16,185,129,0.1)' : draft.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(168,85,247,0.1)',
                    color: draft.status === 'sent' ? '#10B981' : draft.status === 'approved' ? '#22C55E' : '#A855F7',
                  }}>
                    {draft.status}
                  </span>
                </div>

                {/* Subject */}
                <p className="mt-3 break-words text-base text-white font-semibold">{editingId === draft.lead.leadId ? editSubject : draft.subject}</p>

                {/* Preview */}
                {!isExpanded && !isEditing && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{draft.body}</p>
                )}
              </div>

              {/* Expanded body */}
              {isExpanded && !isEditing && (
                <div className="px-5 pb-4">
                  <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800/20">
                    <pre className="text-base text-white whitespace-pre-wrap break-words font-sans">{draft.body}</pre>
                  </div>
                </div>
              )}

              {/* Inline editor */}
              {isEditing && (
                <div className="px-5 pb-4 space-y-3">
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                    placeholder="Subject line"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full h-64 bg-slate-900/30 border border-slate-800/30 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-600 font-sans resize-y"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveDraft(draft)} className="text-sm px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm px-4 py-2 rounded-lg bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 py-3 border-t border-slate-800/30 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <button onClick={() => { setExpandedId(isExpanded ? null : draft.lead.leadId); setEditingId(null); }}
                  className="text-sm px-4 py-3 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-300 transition-colors sm:py-2">
                  {isExpanded ? 'Collapse' : 'Preview'}
                </button>
                <button onClick={() => {
                  if (isEditing) { setEditingId(null); }
                  else { setEditingId(draft.lead.leadId); setEditBody(draft.body); setEditSubject(draft.subject); setExpandedId(null); }
                }} className="text-sm px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors sm:py-2">
                  Edit
                </button>

                {draft.status === 'generated' && (
                  <button onClick={() => setConfirmId(draft.lead.leadId)}
                    className="text-sm px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors sm:py-2">
                    Approve → Drafts
                  </button>
                )}
                {draft.status === 'approved' && (
                  <button onClick={() => handleMarkSent(draft)}
                    className="text-sm px-4 py-3 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20 transition-colors sm:py-2">
                    Mark Sent
                  </button>
                )}

                <a href={`mailto:${draft.lead.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                  className="text-center text-sm px-4 py-3 rounded-lg transition-colors sm:ml-auto sm:py-2"
                  style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', border: '1px solid rgba(37, 209, 242, 0.2)' }}>
                  Open in Mail App
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmId && (() => {
        const draft = drafts.find(d => d.lead.leadId === confirmId);
        if (!draft) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="glass-card border-0 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">Approve Email</h3>
              <p className="text-slate-400 text-sm mb-3">
                Move this email to the approved drafts folder for {draft.lead.dealershipName}?
              </p>
              <div className="bg-slate-900/30 rounded-lg p-3 mb-4 border border-slate-800/20">
                <p className="text-sm text-slate-300">To: {draft.lead.email}</p>
                <p className="text-sm text-slate-300 mt-1">Subject: {draft.subject}</p>
              </div>
              <p className="text-[10px] text-amber-400/80 mb-4">⚠️ Email will NOT be sent. It moves to the Approved folder for final review.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                <button onClick={() => handleApprove(draft)}
                  className="px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
                  Approve
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
