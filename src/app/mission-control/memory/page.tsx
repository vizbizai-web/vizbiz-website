import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ops Notes | Mission Control',
  description: 'VizBiz operations notes status',
  robots: { index: false, follow: false },
};

export default function MemoryPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-300 uppercase tracking-widest font-semibold">Ops Notes</p>
        <h1 className="mt-2 text-3xl font-bold text-white">VizBiz Notes</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          This panel is intentionally not connected to any legacy workspace memory. Mission Control should only show verified VizBiz operating data.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="text-sm font-semibold text-amber-200">Not connected yet</p>
        <p className="mt-2 text-sm leading-relaxed text-amber-100/80">
          When VizBiz needs durable operator notes here, wire this page to the approved VizBiz source of truth first, then expose it. No placeholder memory feeds. No legacy project files. No pretend cockpit buttons.
        </p>
      </div>
    </div>
  );
}
