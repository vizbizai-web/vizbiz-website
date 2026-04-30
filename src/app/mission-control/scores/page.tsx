export const dynamic = 'force-dynamic';

import { readFileSync } from 'fs';
import { join } from 'path';
import { ScoreTracker } from './ScoreTracker';

interface Scan {
  scanId: string;
  timestamp: string;
  aviScore: number;
  aviBand: string;
  categoryScores: Record<string, number>;
  notes: string;
}

interface AuditData {
  clientName: string;
  scans: Scan[];
}

function getAuditData(): AuditData {
  const filePath = join(
    process.cwd(),
    '..',
    'research-engine',
    'audit-history',
    'vizbiz.json'
  );
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { clientName: 'VizBiz', scans: [] };
  }
}

export default function ScoresPage() {
  const data = getAuditData();
  const scans = data.scans;
  const current = scans[scans.length - 1];
  const previous = scans.length > 1 ? scans[scans.length - 2] : null;
  const change = previous ? current.aviScore - previous.aviScore : 0;

  const categories = current
    ? Object.entries(current.categoryScores).map(([name, score]) => ({ name, score }))
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AVI Score Tracker</h1>
        <p className="text-slate-400">AI Visibility Intelligence — performance over time</p>
      </div>

      <ScoreTracker
        currentScore={current?.aviScore ?? 0}
        band={current?.aviBand ?? 'N/A'}
        change={change}
        scans={scans.map((s) => ({
          date: s.timestamp,
          score: s.aviScore,
          band: s.aviBand,
        }))}
        categories={categories}
        history={scans.map((s, i) => ({
          date: new Date(s.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          score: s.aviScore,
          change: i > 0 ? s.aviScore - scans[i - 1].aviScore : 0,
          notes: s.notes.length > 120 ? s.notes.slice(0, 120) + '…' : s.notes,
        }))}
      />
      {/* Dogfood Timeline */}
      <div className="bg-[#111118] border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">VizBiz Dogfood Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
            <div>
              <div className="text-sm text-slate-400">Apr 9, 2026</div>
              <div className="font-medium text-white">Baseline AVI: 9/100</div>
              <div className="text-sm text-slate-500">Initial audit - appeared in 1/11 prompts</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
            <div>
              <div className="text-sm text-slate-400">Apr 13, 2026</div>
              <div className="font-medium text-white">Second audit: still 9/100</div>
              <div className="text-sm text-slate-500">Re-audit after initial fixes - no improvement</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
            <div>
              <div className="text-sm text-slate-400">Apr 30, 2026</div>
              <div className="font-medium text-white">Authority content deployed</div>
              <div className="text-sm text-slate-500">2 blog posts deployed, fix engine built</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div>
              <div className="text-sm text-slate-400">May 1, 2026 (Scheduled)</div>
              <div className="font-medium text-white">Next re-audit</div>
              <div className="text-sm text-slate-500">Monthly re-audit to measure progress</div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
          <div className="text-3xl font-bold text-amber-400">9</div>
          <div className="text-sm text-slate-500">Current AVI Score</div>
          <div className="text-xs text-slate-600 mt-1">Next measurement: May 1, 2026</div>
        </div>
      </div>
    </div>
  );
}
