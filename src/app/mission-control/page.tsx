'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface AlertItem {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  leadId?: string;
  leadName?: string;
  action?: string;
}

interface AttentionFeed {
  alerts: AlertItem[];
  summary: {
    critical: number;
    warning: number;
    info: number;
    total: number;
    daysSinceLastOutreach: number | null;
  };
}

interface PipelineData {
  stats: PipelineStats;
  pipeline: Record<string, Lead[]>;
  leads: Lead[];
}

const STATUS_ORDER = ['new', 'researching', 'pending_review', 'approved', 'email_drafted', 'contacted', 'closed_won', 'closed_lost'];

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

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  new: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  researching: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  pending_review: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
  approved: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
  email_drafted: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
  contacted: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', bar: 'bg-violet-500' },
  closed_won: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  closed_lost: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
};

function usePipelineData() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function doFetch() {
      try {
        const res = await fetch('/api/pipeline-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  }, []);

  const refetch = () => {
    setLoading(true);
    async function doFetch() {
      try {
        const res = await fetch('/api/pipeline-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  };

  return { data, loading, error, refetch };
}

function useAttentionFeed() {
  const [feed, setFeed] = useState<AttentionFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/api/attention-feed');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setFeed(json);
      } catch {
        setFeed(null);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  return { feed, loading };
}

export default function MissionControlDashboard() {
  const { data, loading, error } = usePipelineData();
  const { feed, loading: feedLoading } = useAttentionFeed();
  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mission Control</h1>
        <p className="text-slate-400">Live pipeline from Google Sheets CRM</p>
      </div>

      {/* Attention Feed */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Attention Feed</h2>
        {feedLoading ? (
          <div className="text-slate-400">Loading alerts...</div>
        ) : feed?.alerts && feed.alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feed.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-[#111118] border border-slate-800/50 rounded-xl p-4 ${
                  alert.severity === 'critical'
                    ? 'border-l-4 border-l-red-500'
                    : alert.severity === 'warning'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{alert.message}</p>
                    {alert.leadName && (
                      <p className="text-xs text-slate-500 mt-1">{alert.leadName}</p>
                    )}
                  </div>
                  {alert.action && (
                    <Link
                      href={alert.leadId ? `/mission-control/leads/${alert.leadId}` : '/mission-control/leads'}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
                    >
                      {alert.action}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 text-center">
            <p className="text-slate-400">All clear — no alerts right now</p>
          </div>
        )}
      </section>

      {/* Stats + Funnel */}
      {loading && <div className="text-slate-400">Loading pipeline data...</div>}
      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          Error loading pipeline: {error}
        </div>
      )}

      {stats && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard label="Total" value={stats.total} color="white" />
            <StatCard label="New" value={stats.new} color="cyan" />
            <StatCard label="Researching" value={stats.researching} color="blue" />
            <StatCard label="Pending" value={stats.pending_review} color="amber" />
            <StatCard label="Approved" value={stats.approved} color="green" />
            <StatCard label="Drafted" value={stats.email_drafted || 0} color="purple" />
            <StatCard label="Contacted" value={stats.contacted || 0} color="violet" />
            <StatCard label="Won" value={stats.closed_won} color="emerald" />
          </div>

          {/* Days since last outreach */}
          {feed?.summary?.daysSinceLastOutreach !== null && feed?.summary?.daysSinceLastOutreach !== undefined && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-amber-400 text-sm font-semibold">Outreach</span>
              <span className="text-slate-400 text-sm">
                {feed.summary.daysSinceLastOutreach} days since last outreach
              </span>
            </div>
          )}

          {/* Pipeline Funnel */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pipeline Funnel</h2>
            <div className="flex items-end gap-1 h-40">
              {STATUS_ORDER.map((status) => {
                const count = stats[status as keyof PipelineStats] || 0;
                const max = Math.max(stats.total, 1);
                const height = max > 0 ? (count / max) * 100 : 0;
                const colors = STATUS_COLORS[status];
                return (
                  <div key={status} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-sm font-bold text-white">{count}</div>
                    <div
                      className={`w-full rounded-t-lg ${colors.bar} transition-all`}
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: count > 0 ? 16 : 4, opacity: count > 0 ? 1 : 0.15 }}
                    />
                    <div className={`text-xs ${colors.text} text-center`}>{STATUS_LABELS[status]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <QuickActionButton
                label="Run Research"
                href="/mission-control/leads?status=new"
                color="cyan"
                count={stats.new}
              />
              <QuickActionButton
                label="Review Pending"
                href="/mission-control/leads?status=pending_review"
                color="amber"
                count={stats.pending_review}
              />
              <QuickActionButton
                label="Send Emails"
                href="/mission-control/emails"
                color="purple"
                count={stats.email_drafted || 0}
              />
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
              <Link href="/mission-control/leads" className="text-sm text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {data?.leads?.slice(0, 5).map((lead) => (
                <div key={lead.leadId} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[lead.status]?.bar || 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{lead.dealershipName || 'Unknown'}</p>
                    <p className="text-slate-500 text-xs">{lead.city} • {timeAgo(lead.timestamp)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]?.bg || ''} ${STATUS_COLORS[lead.status]?.text || 'text-slate-400'} ${STATUS_COLORS[lead.status]?.border || 'border-slate-700'}`}>
                    {STATUS_LABELS[lead.status] || lead.status}
                  </span>
                </div>
              ))}
              {(!data?.leads || data.leads.length === 0) && (
                <p className="text-slate-500 text-sm">No leads yet</p>
              )}
            </div>
          </div>

          {/* Cron Health */}
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">Cron Health</h2>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                All systems operational
              </span>
            </div>
            <p className="text-slate-500 text-sm">Heartbeat, Context Sync, Sage crons — static indicator. Will be wired to live cron status.</p>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white',
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
  };
  return (
    <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${colorMap[color] || 'text-white'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function QuickActionButton({ label, href, color, count }: { label: string; href: string; color: string; count: number }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  };
  const c = colorMap[color] || colorMap.cyan;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${c.bg} ${c.text} ${c.border} hover:opacity-80 transition-opacity`}
    >
      <span className="font-medium text-sm">{label}</span>
      {count > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{count}</span>
      )}
    </Link>
  );
}

function timeAgo(timestamp: string): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
