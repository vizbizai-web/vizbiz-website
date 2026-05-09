'use client';

import { useEffect, useState } from 'react';

interface CronItem {
  name: string;
  schedule: string;
  lastRun: string | null;
  status: string;
}

interface FollowUpItem {
  leadId: string;
  dealershipName: string;
  stage: string;
  daysInStage: number;
}

interface ContentItem {
  name: string;
  scheduledDate: string;
  status: string;
}

interface CronStatus {
  crons: CronItem[];
  followUps: FollowUpItem[];
  content: ContentItem[];
}

function useCronStatus() {
  const [data, setData] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/cron-status');
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

export default function CalendarPage() {
  const { data, loading, error } = useCronStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Schedule</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Calendar</h1>
        <p className="text-slate-400 mt-1">Upcoming runs, follow-ups, and content schedule</p>
      </div>

      {loading && <div className="text-slate-400">Loading schedule...</div>}
      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          Error: {error}
        </div>
      )}

      {/* Cron Runs */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Scheduled Cron Runs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.crons || []).map((cron, i) => (
            <div
              key={i}
              className="bg-[#111118] border border-slate-800/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-medium text-sm">{cron.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{cron.schedule}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${
                  cron.status === 'running'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : cron.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {cron.status}
                </span>
              </div>
              {cron.lastRun && (
                <p className="text-xs text-slate-600 mt-3">Last run: {new Date(cron.lastRun).toLocaleString()}</p>
              )}
              <div className="mt-3 pt-3 border-t border-slate-800/50">
                <button
                  disabled
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                >
                  Force Run (coming soon)
                </button>
              </div>
            </div>
          ))}
          {(!data?.crons || data.crons.length === 0) && !loading && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm">No scheduled crons</p>
            </div>
          )}
        </div>
      </section>

      {/* Follow-ups */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Follow-ups Needed</h2>
        <div className="space-y-3">
          {(data?.followUps || []).map((f) => (
            <div
              key={f.leadId}
              className="bg-[#111118] border border-slate-800/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white text-sm font-medium">{f.dealershipName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  In {f.stage} for {f.daysInStage} days
                </p>
              </div>
              <a
                href={`/mission-control/leads/${f.leadId}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                Review
              </a>
            </div>
          ))}
          {(!data?.followUps || data.followUps.length === 0) && !loading && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm">No follow-ups needed — all leads are moving</p>
            </div>
          )}
        </div>
      </section>

      {/* Content Schedule */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Content Schedule</h2>
        <div className="space-y-3">
          {(data?.content || []).map((c, i) => (
            <div
              key={i}
              className="bg-[#111118] border border-slate-800/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white text-sm font-medium">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.scheduledDate}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                c.status === 'published'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : c.status === 'draft'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {c.status}
              </span>
            </div>
          ))}
          {(!data?.content || data.content.length === 0) && !loading && (
            <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm">No content scheduled</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
