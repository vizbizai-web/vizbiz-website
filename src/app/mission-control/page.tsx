'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlass, GlassCard } from './components/LiquidGlass';

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

interface PipelineStats {
  total: number;
  new: number;
  researching: number;
  pending_review: number;
  approved: number;
  email_drafted: number;
  contacted: number;
  closed_won: number;
  closed_lost: number;
}

interface PipelineData {
  stats: PipelineStats;
  pipeline: Record<string, Lead[]>;
  leads: Lead[];
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  researching: 'Researching',
  pending_review: 'Review',
  approved: 'Approved',
  email_drafted: 'Emailed',
  contacted: 'Contacted',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#22D3EE',
  researching: '#3B82F6',
  pending_review: '#F59E0B',
  approved: '#22C55E',
  email_drafted: '#A855F7',
  contacted: '#8B5CF6',
  closed_won: '#10B981',
  closed_lost: '#EF4444',
};

const PIPELINE_FLOW = ['new', 'researching', 'pending_review', 'approved', 'email_drafted', 'contacted', 'closed_won'];

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

function usePipelineData() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function doFetch() {
      try {
        const res = await fetch('/mission-control/api/pipeline-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  }, []);

  return { data, loading, error };
}

export default function MissionControlDashboard() {
  const { data, loading, error } = usePipelineData();
  const [now] = useState(() => Date.now());
  const stats = data?.stats;
  const leads = data?.leads || [];

  // Revenue calc
  const mrr = (stats?.contacted || 0) * 188 + (stats?.closed_won || 0) * 188;
  const lifetime = (stats?.closed_won || 0) * 188;
  const revenueTarget = 10000;
  const revenuePct = Math.min((mrr / revenueTarget) * 100, 100);
  const potentialMrr = ((stats?.email_drafted || 0) + (stats?.contacted || 0) + (stats?.closed_won || 0)) * 188;

  // Days since last outreach
  const contactedLeads = leads.filter(l => l.emailSentAt);
  const daysSinceOutreach = contactedLeads.length > 0
    ? Math.floor((now - new Date(contactedLeads.sort((a,b) => new Date(b.emailSentAt).getTime() - new Date(a.emailSentAt).getTime())[0].emailSentAt).getTime()) / 86400000)
    : null;

  // Attention items
  const attentionItems: { icon: string; text: string; severity: 'red' | 'amber' | 'blue'; action?: { label: string; href: string } }[] = [];

  if ((daysSinceOutreach ?? 999) > 7) {
    attentionItems.push({ icon: '📧', text: `${daysSinceOutreach ?? '46'} days since last outreach`, severity: 'red', action: { label: 'Draft Emails', href: '/mission-control/emails' } });
  }
  const pendingReview = leads.filter(l => l.status === 'pending_review');
  if (pendingReview.length > 0) {
    attentionItems.push({ icon: '📋', text: `${pendingReview.length} lead${pendingReview.length > 1 ? 's' : ''} awaiting review (${pendingReview.map(l => l.dealershipName).join(', ')})`, severity: 'amber', action: { label: 'Review', href: '/mission-control/leads?status=pending_review' } });
  }
  const emailDrafted = leads.filter(l => l.status === 'email_drafted');
  if (emailDrafted.length > 0) {
    attentionItems.push({ icon: '✉️', text: `${emailDrafted.length} email${emailDrafted.length > 1 ? 's' : ''} waiting to be approved`, severity: 'blue', action: { label: 'View Emails', href: '/mission-control/emails' } });
  }
  const approved = leads.filter(l => l.status === 'approved');
  if (approved.length > 0) {
    attentionItems.push({ icon: '📊', text: `${approved.length} approved report${approved.length > 1 ? 's' : ''} — ready to email`, severity: 'blue', action: { label: 'View Reports', href: '/mission-control/leads?status=approved' } });
  }
  if (attentionItems.length === 0) {
    attentionItems.push({ icon: '✅', text: 'All clear — nothing needs immediate attention', severity: 'blue' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-base text-white uppercase tracking-widest font-semibold">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Control Center</h1>
      </div>

      {loading && <div className="text-slate-500 text-sm">Loading pipeline...</div>}
      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">{error}</div>
      )}

      {stats && (
        <>
          {/* Revenue Tracker */}
          <LiquidGlass borderRadius={16} preset='card' tint='rgba(37, 209, 242, 0.03)' className='p-6'>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
              <div>
                <p className="text-[10px] sm:text-base text-white uppercase tracking-widest font-semibold">Monthly Recurring Revenue</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-4xl font-bold" style={{ color: mrr > 0 ? '#25D1F2' : '#94A3B8' }}>${mrr.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs sm:text-sm">/ ${revenueTarget.toLocaleString()}</span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xl sm:text-3xl font-bold text-slate-300">{revenuePct.toFixed(0)}%</span>
                <p className="text-xs text-slate-400 uppercase tracking-wider">of target</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(revenuePct, 1)}%`, background: mrr > 0 ? 'linear-gradient(90deg, #25D1F2, #06B6D4)' : '#334155' }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm text-slate-400">
              <span>{stats.closed_won} client{stats.closed_won !== 1 ? 's' : ''} • ${mrr} MRR • ${lifetime} lifetime</span>
              <span style={{ color: potentialMrr > 0 ? '#25D1F2' : '#475569' }}>
                {potentialMrr > 0 ? `Pipeline potential: $${potentialMrr.toLocaleString()}/mo` : 'No pipeline revenue yet'}
              </span>
            </div>
          </LiquidGlass>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard label="Total Leads" value={stats.total} />
            <MetricCard label="Pending Review" value={stats.pending_review} accent="#F59E0B" />
            <MetricCard label="Approved" value={stats.approved} accent="#22C55E" />
            <MetricCard label="Emails Drafted" value={stats.email_drafted} accent="#A855F7" />
            <MetricCard label="Contacted" value={stats.contacted} accent="#8B5CF6" />
            <MetricCard label="Days No Outreach" value={daysSinceOutreach ?? '—'} accent={(!daysSinceOutreach || daysSinceOutreach > 7) ? '#EF4444' : '#22C55E'} />
          </div>

          {/* Attention Feed */}
          <div>
            <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-3">Needs Attention</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attentionItems.map((item, i) => (
                <div key={i} className="rounded-xl p-3 sm:p-4 bg-[#0A0B14] border border-slate-800/40 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-base sm:text-lg flex-shrink-0">{item.icon}</span>
                    <p className="text-xs sm:text-base text-white">{item.text}</p>
                  </div>
                  {item.action && (
                    <Link href={item.action.href} className="text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors self-start flex-shrink-0" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                      {item.action.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Flow */}
          <div>
            <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-3">Pipeline Flow</h2>
            <div className="glass-card rounded-xl p-3 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {PIPELINE_FLOW.map((status) => {
                  const count = stats[status as keyof PipelineStats] || 0;
                  const color = STATUS_COLORS[status];
                  const active = count > 0;
                  return (
                    <div key={status} className="min-w-0 rounded-xl border p-3 text-center" style={{ background: active ? `${color}12` : '#0F1019', borderColor: active ? `${color}35` : '#1E293B' }}>
                      <div className="text-lg sm:text-xl font-bold" style={{ color: active ? color : '#475569' }}>{count}</div>
                      <div className="mt-2 flex h-7 items-center justify-center rounded-lg" style={{ background: active ? `${color}18` : '#0B0F1A' }}>
                        {active ? <div className="h-2 w-2 rounded-full" style={{ background: color }} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />}
                      </div>
                      <div className="mt-2 break-words text-xs font-medium text-slate-300 sm:text-sm">{STATUS_LABELS[status]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              {pendingReview.length > 0 && (
                <Link href="/mission-control/leads?status=pending_review" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  📋 Review {pendingReview.length} Lead{pendingReview.length > 1 ? 's' : ''}
                </Link>
              )}
              {emailDrafted.length > 0 && (
                <Link href="/mission-control/emails" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors" style={{ background: 'rgba(168, 85, 247, 0.08)', color: '#A855F7', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                  ✉️ Approve {emailDrafted.length} Email{emailDrafted.length > 1 ? 's' : ''}
                </Link>
              )}
              {approved.length > 0 && (
                <Link href="/mission-control/leads?status=approved" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors" style={{ background: 'rgba(37, 209, 242, 0.08)', color: '#25D1F2', borderColor: 'rgba(37, 209, 242, 0.2)' }}>
                  📊 Draft Emails for {approved.length} Approved
                </Link>
              )}
              <Link href="/mission-control/leads" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-colors">
                📋 Pipeline
              </Link>
              <Link href="/mission-control/calendar" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-colors">
                📅 Tasks
              </Link>
            </div>
          </div>

          {/* VizBiz Visibility Engine */}
          <section className="rounded-2xl border border-cyan-300/20 bg-[#07111f]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.07)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">Top priority</span>
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">SEO • GEO • AEO</span>
                </div>
                <h2 className="mt-3 break-words text-xl font-bold text-white sm:text-2xl">VizBiz Visibility Engine</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Build VizBiz.ai into its own proof asset: indexable authority pages, AI-citable answers, schema, llms.txt, Search Console hygiene, vertical pages, and conversion paths into the free mini report. First non-auto vertical is med spas; dentists and law firms are next.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[440px] xl:shrink-0">
                {[
                  ['Score', '6.5→7.2'],
                  ['Phase', 'Expansion'],
                  ['Shipping', 'Med spas'],
                  ['Next', 'Dentists'],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Link href="/mission-control/visibility-engine" className="inline-flex items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15">
                Open project tracker
              </Link>
              <Link href="/mission-control/calendar" className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                See calendar tasks
              </Link>
              <a href="/llms.txt" className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                Check llms.txt
              </a>
            </div>
          </section>

          {/* Recent Leads */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base text-white uppercase tracking-widest font-semibold">Recent Leads</h2>
              <Link href="/mission-control/leads" className="text-sm text-slate-400 hover:text-slate-400 transition-colors">View all →</Link>
            </div>
            <div className="glass-card rounded-xl overflow-hidden divide-y divide-slate-800/30">
              {leads.slice(0, 6).map((lead) => {
                const score = getScore(lead.notes);
                const niche = getNiche(lead.notes);
                return (
                  <Link key={lead.leadId} href={`/mission-control/leads/${lead.leadId}`} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-800/20 transition-colors">
                    {/* Score circle */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold flex-shrink-0" style={{
                      background: score && score.appeared / score.total > 0.3 ? 'rgba(34, 197, 94, 0.1)' : score && score.appeared / score.total > 0.1 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: score && score.appeared / score.total > 0.3 ? '#22C55E' : score && score.appeared / score.total > 0.1 ? '#F59E0B' : '#EF4444',
                      border: score ? `1px solid ${score.appeared / score.total > 0.3 ? 'rgba(34,197,94,0.2)' : score.appeared / score.total > 0.1 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` : '1px solid #1E293B'
                    }}>
                      {score ? `${score.appeared}` : '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white truncate">{lead.dealershipName || 'Unknown Business'}</span>
                        {niche && <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">{niche}</span>}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{lead.city || 'No location'} • {timeAgo(lead.timestamp)}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium flex-shrink-0" style={{
                      background: `${STATUS_COLORS[lead.status] || '#475569'}15`,
                      color: STATUS_COLORS[lead.status] || '#94A3B8',
                      border: `1px solid ${STATUS_COLORS[lead.status] || '#475569'}30`
                    }}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </Link>
                );
              })}
              {leads.length === 0 && !loading && (
                <div className="px-5 py-8 text-center text-slate-600 text-sm">No leads yet</div>
              )}
            </div>
          </div>

          {/* Revenue Forecast */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="text-base text-white uppercase tracking-widest font-semibold mb-3">Revenue Forecast</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: '#A855F7' }}>${((stats.email_drafted || 0) * 188).toLocaleString()}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">If all drafted convert</p>
              </div>
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: '#22C55E' }}>${((stats.approved || 0) * 188).toLocaleString()}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">If all approved convert</p>
              </div>
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: '#25D1F2' }}>${potentialMrr.toLocaleString()}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Full pipeline potential</p>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">All systems operational</span>
            </div>
            <span className="text-[10px] text-slate-700">Pipeline synced from Supabase CRM</span>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <GlassCard className='p-4' tint='rgba(255,255,255,0.02)' borderRadius={12}>
      <p className="text-3xl font-bold" style={{ color: accent || '#E2E8F0' }}>{value}</p>
      <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </GlassCard>
  );
}

function timeAgo(timestamp: string): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
