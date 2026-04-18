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
    </div>
  );
}
