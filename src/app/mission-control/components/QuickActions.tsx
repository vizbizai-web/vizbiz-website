'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const suggestions = [
  // Navigation
  { label: 'Go to Dashboard', type: 'nav', value: '/mission-control' },
  { label: 'Go to Scores', type: 'nav', value: '/mission-control/scores' },
  { label: 'Go to Activity', type: 'nav', value: '/mission-control/activity' },
  { label: 'Go to Leads', type: 'nav', value: '/mission-control/leads' },
  { label: 'Go to Tasks', type: 'nav', value: '/mission-control/kanban' },
  { label: 'Go to Projects', type: 'nav', value: '/mission-control/projects' },
  { label: 'Go to Calendar', type: 'nav', value: '/mission-control/calendar' },
  { label: 'Go to Memory', type: 'nav', value: '/mission-control/memory' },
  { label: 'Go to Docs', type: 'nav', value: '/mission-control/docs' },
  { label: 'Go to X Strategy', type: 'nav', value: '/mission-control/x-strategy' },
  { label: 'Go to Team', type: 'nav', value: '/mission-control/team' },
  { label: 'Go to Settings', type: 'nav', value: '/mission-control/settings' },
  // Actions
  { label: 'Run VizBiz Audit', type: 'action', value: 'audit' },
  { label: 'Generate daily Sage batch', type: 'action', value: 'sage' },
  { label: 'Check site uptime', type: 'action', value: 'uptime' },
  // Data
  { label: 'Show AVI score', type: 'nav', value: '/mission-control/scores' },
  { label: "Show today's activity", type: 'nav', value: '/mission-control/activity' },
  { label: 'Show X posts queue', type: 'nav', value: '/mission-control/x-strategy' },
  // Files
  { label: 'Open X-STRATEGY.md', type: 'file', value: 'X-STRATEGY.md' },
  { label: 'Open DOGFOOD-CORE-EEAT-AUDIT.md', type: 'file', value: 'DOGFOOD-CORE-EEAT-AUDIT.md' },
  { label: 'Open ACTIVE-PRIORITIES.md', type: 'file', value: 'ACTIVE-PRIORITIES.md' },
  { label: 'Open DAILY-STATUS.md', type: 'file', value: 'DAILY-STATUS.md' },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? suggestions.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSelect = useCallback(
    (item: (typeof suggestions)[number]) => {
      setOpen(false);
      setQuery('');
      if (item.type === 'nav') {
        router.push(item.value);
      } else {
        setToast(`"${item.label}" queued`);
        setTimeout(() => setToast(''), 2000);
      }
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 bg-[#111118] border-b border-slate-800/50 px-6 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Type a command... (audit, score, tweet, agent, file...)"
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            ⌘K
          </kbd>

          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
              {filtered.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800/50 flex items-center gap-3 text-sm transition-colors"
                >
                  <span className="text-xs text-slate-500 uppercase w-12 shrink-0">
                    {item.type === 'nav' ? '→' : item.type === 'action' ? '⚡' : '📄'}
                  </span>
                  <span className="text-slate-200">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm">
          {toast}
        </div>
      )}
    </>
  );
}
