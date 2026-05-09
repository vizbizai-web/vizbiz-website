'use client';

import { useEffect, useState } from 'react';
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

const COLUMNS = [
  { id: 'new', label: 'New', color: 'cyan' },
  { id: 'researching', label: 'Researching', color: 'blue' },
  { id: 'pending_review', label: 'Pending Review', color: 'amber' },
  { id: 'approved', label: 'Approved', color: 'green' },
  { id: 'contacted', label: 'Contacted', color: 'purple' },
  { id: 'closed_won', label: 'Closed Won', color: 'emerald' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' },
];

const RESEARCH_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  running: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  complete: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  failed: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

function usePipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/pipeline-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setLeads(json.leads || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { leads, loading, error };
}

export default function PipelinePage() {
  const { leads, loading, error } = usePipeline();

  const byColumn = COLUMNS.map((col) => ({
    ...col,
    leads: leads.filter((l) => l.status === col.id),
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Pipeline</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Lead Pipeline</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads</p>
        </div>
        {loading && <span className="text-slate-500 text-sm">Loading...</span>}
      </div>

      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          Error: {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {byColumn.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80">
            {/* Column Header */}
            <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 border-${col.color}-500`}>
              <span className={`w-2 h-2 rounded-full bg-${col.color}-500`} />
              <h3 className="font-semibold text-white text-sm">{col.label}</h3>
              <span className="ml-auto px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full">
                {col.leads.length}
              </span>
            </div>

            {/* Lead Cards */}
            <div className="space-y-3 min-h-[120px]">
              {col.leads.map((lead) => (
                <Link
                  key={lead.leadId}
                  href={`/mission-control/leads/${lead.leadId}`}
                  className="block bg-[#111118] border border-slate-800/50 rounded-xl p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-white font-medium text-sm truncate">
                      {lead.dealershipName || 'Unknown Dealership'}
                    </h4>
                  </div>

                  <div className="space-y-1 mb-3">
                    {lead.city && (
                      <p className="text-xs text-slate-500">📍 {lead.city}</p>
                    )}
                    <p className="text-xs text-slate-500">⏱ {timeInStage(lead.timestamp)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {lead.visibilityBand && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {lead.visibilityBand}
                      </span>
                    )}
                    {lead.researchStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        RESEARCH_COLORS[lead.researchStatus]?.bg || 'bg-slate-500/10'
                      } ${RESEARCH_COLORS[lead.researchStatus]?.text || 'text-slate-400'} ${
                        RESEARCH_COLORS[lead.researchStatus]?.border || 'border-slate-500/30'
                      }`}>
                        {lead.researchStatus}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {col.leads.length === 0 && !loading && (
                <div className="text-center py-6 text-slate-600 text-sm">No leads</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeInStage(timestamp: string): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (days > 0) return `${days}d in stage`;
  if (hours > 0) return `${hours}h in stage`;
  return 'Just added';
}
