'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PipelineStats {
  total: number;
  new: number;
  researching: number;
  pending_review: number;
  approved: number;
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

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
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
    async function fetchData() {
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
    fetchData();
  }, []);

  return { data, loading, error };
}

function useBlockers() {
  const [blockers, setBlockers] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlockers() {
      try {
        const res = await fetch('/api/pipeline-status');
        // For now, we don't have a dedicated blockers endpoint.
        // We'll skip this and use a static message if needed.
        setBlockers([]);
      } catch {
        setBlockers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBlockers();
  }, []);

  return { blockers, loading };
}

export default function MissionControlDashboard() {
  const { data, loading, error } = usePipelineData();

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pipeline Dashboard</h1>
        <p className="text-slate-400">Live pipeline from Google Sheets CRM</p>
      </div>

      {/* Stat Cards */}
      {loading && (
        <div className="text-slate-400">Loading pipeline data...</div>
      )}
      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          Error loading pipeline: {error}
        </div>
      )}

      {stats && (
        <>
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatCard label="Total" value={stats.total} color="white" />
            <StatCard label="New" value={stats.new} color="cyan" />
            <StatCard label="Researching" value={stats.researching} color="blue" />
            <StatCard label="Pending Review" value={stats.pending_review} color="amber" />
            <StatCard label="Approved" value={stats.approved} color="green" />
            <StatCard label="Contacted" value={(stats as any).contacted || 0} color="violet" />
            <StatCard label="Won" value={stats.closed_won} color="emerald" />
          </div>

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

          {/* Recent Activity */}
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
