'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const suggestions = [
  { label: 'Go to Dashboard', type: 'nav', value: '/mission-control' },
  { label: 'Go to Pipeline', type: 'nav', value: '/mission-control/leads' },
  { label: 'Go to Emails', type: 'nav', value: '/mission-control/emails' },
  { label: 'Go to Tasks', type: 'nav', value: '/mission-control/calendar' },
  { label: 'Go to Activity', type: 'nav', value: '/mission-control/activity' },
  { label: 'Review pending leads', type: 'nav', value: '/mission-control/leads?status=pending_review' },
  { label: 'View approved reports', type: 'nav', value: '/mission-control/leads?status=approved' },
  { label: 'Draft emails', type: 'nav', value: '/mission-control/emails' },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? suggestions.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSelect = useCallback(
    (item: typeof suggestions[number]) => {
      setOpen(false);
      setQuery('');
      if (item.type === 'nav') router.push(item.value);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-slate-800/30 px-4 md:px-6 py-3 flex items-center gap-4" style={{ background: 'rgba(6, 7, 15, 0.8)', backdropFilter: 'blur(12px)' }}>
      <div className="relative flex-1 max-w-lg">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Jump to... (⌘K)"
          className="w-full bg-slate-800/30 border border-slate-800/40 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
        />
        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0B14] border border-slate-800/40 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
            {filtered.map((item, i) => (
              <button key={i} onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-800/30 flex items-center gap-3 text-sm transition-colors">
                <span className="text-slate-600 text-xs">→</span>
                <span className="text-slate-300">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
