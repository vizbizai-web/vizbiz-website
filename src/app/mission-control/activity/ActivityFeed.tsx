'use client';

import { useState } from 'react';

export interface ParsedDay {
  label: string;
  date: string;
  events: {
    time: string;
    agent: string;
    agentEmoji: string;
    text: string;
    files: string[];
  }[];
}

interface Props {
  days: ParsedDay[];
  totalEvents: number;
  totalFiles: number;
  agentsUsed: number;
}

const FILTERS = ['All', 'Vlad', 'Forge', 'Reko', 'Pulse', 'Gekko'] as const;

export function ActivityFeed({ days, totalEvents, totalFiles, agentsUsed }: Props) {
  const [filter, setFilter] = useState<string>('All');

  const filteredDays = days.map((d) => ({
    ...d,
    events: d.events.filter((e) => filter === 'All' || e.agent === filter),
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Events', value: totalEvents, color: 'text-blue-400' },
          { label: 'Files Changed', value: totalFiles, color: 'text-emerald-400' },
          { label: 'Agents Active', value: agentsUsed, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111118] border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredDays.map((day) =>
        day.events.length > 0 ? (
          <div key={day.date}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {day.label}
            </h2>
            <div className="space-y-3">
              {day.events.map((ev, i) => (
                <div
                  key={i}
                  className="bg-[#111118] border border-slate-800 rounded-xl p-4 flex gap-4"
                >
                  <div className="text-2xl">{ev.agentEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{ev.agent}</span>
                      <span className="text-xs text-slate-500">{ev.time}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{ev.text}</p>
                    {ev.files.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ev.files.map((f, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 bg-slate-800/50 rounded text-xs text-slate-400 font-mono"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
