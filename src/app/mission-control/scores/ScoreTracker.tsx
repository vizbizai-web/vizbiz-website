'use client';

interface ScanPoint {
  date: string;
  score: number;
  band: string;
}

interface Category {
  name: string;
  score: number;
}

interface HistoryRow {
  date: string;
  score: number;
  change: number;
  notes: string;
}

interface Props {
  currentScore: number;
  band: string;
  change: number;
  scans: ScanPoint[];
  categories: Category[];
  history: HistoryRow[];
}

const bandColor: Record<string, string> = {
  Strong: 'text-emerald-400',
  Moderate: 'text-yellow-400',
  Weak: 'text-red-400',
  'Very Weak': 'text-red-500',
};

export function ScoreTracker({ currentScore, band, change, scans, categories, history }: Props) {
  // SVG chart dimensions
  const chartW = 600;
  const chartH = 200;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const xScale = (i: number) => padL + (scans.length > 1 ? (i / (scans.length - 1)) * plotW : plotW / 2);
  const yScale = (v: number) => padT + plotH - (v / 100) * plotH;

  const linePoints = scans.map((s, i) => `${xScale(i)},${yScale(s.score)}`).join(' ');
  const areaPoints = scans.map((s, i) => `${xScale(i)},${yScale(s.score)}`).join(' ') +
    ` ${xScale(scans.length - 1)},${yScale(0)} ${xScale(0)},${yScale(0)}`;

  const benchmarkY = yScale(11);

  return (
    <div className="space-y-6">
      {/* Hero Score */}
      <div className="bg-[#111118] border border-slate-800 rounded-xl p-8 flex items-center gap-8">
        <div>
          <div className="text-7xl font-bold text-white">{currentScore}</div>
          <div className="text-sm text-slate-500 mt-1">out of 100</div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`text-xl font-semibold ${bandColor[band] || 'text-slate-400'}`}>
            {band}
          </span>
          <span className="text-sm text-slate-400 flex items-center gap-1">
            {change > 0 ? (
              <span className="text-emerald-400">↑ +{change}</span>
            ) : change < 0 ? (
              <span className="text-red-400">↓ {change}</span>
            ) : (
              <span className="text-slate-500">— no change</span>
            )}
            {' '}from last scan
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-[#111118] border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Score Over Time</h2>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={padL} y1={yScale(v)} x2={chartW - padR} y2={yScale(v)}
                stroke="#1e293b" strokeWidth="1"
              />
              <text x={padL - 8} y={yScale(v) + 4} textAnchor="end" className="fill-slate-500 text-xs">
                {v}
              </text>
            </g>
          ))}
          {/* Benchmark line */}
          <line
            x1={padL} y1={benchmarkY} x2={chartW - padR} y2={benchmarkY}
            stroke="#25D1F2" strokeWidth="1" strokeDasharray="6,4"
          />
          <text x={chartW - padR + 4} y={benchmarkY + 4} className="fill-cyan-500 text-xs">
            ON avg 11
          </text>
          {/* Area */}
          {scans.length > 1 && (
            <polygon points={areaPoints} fill="rgba(37,209,242,0.1)" />
          )}
          {/* Line */}
          <polyline points={linePoints} fill="none" stroke="#25D1F2" strokeWidth="2.5" />
          {/* Points */}
          {scans.map((s, i) => (
            <g key={i}>
              <circle cx={xScale(i)} cy={yScale(s.score)} r="5" fill="#25D1F2" stroke="#111118" strokeWidth="2" />
              <text x={xScale(i)} y={chartH - 5} textAnchor="middle" className="fill-slate-500 text-xs">
                {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#111118] border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Category Breakdown</h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-4">
              <div className="w-44 text-sm text-slate-300 text-right shrink-0">{cat.name}</div>
              <div className="flex-1 h-6 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <div className="w-10 text-sm text-slate-400 text-right">{cat.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#111118] border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Scan History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="text-left pb-3 font-medium">Date</th>
              <th className="text-left pb-3 font-medium">Score</th>
              <th className="text-left pb-3 font-medium">Change</th>
              <th className="text-left pb-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50">
                <td className="py-3 text-slate-300">{row.date}</td>
                <td className="py-3 text-white font-medium">{row.score}</td>
                <td className="py-3">
                  {row.change > 0 ? (
                    <span className="text-emerald-400">+{row.change}</span>
                  ) : row.change < 0 ? (
                    <span className="text-red-400">{row.change}</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-3 text-slate-400 max-w-md truncate">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
