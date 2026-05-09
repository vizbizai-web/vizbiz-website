'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🎯', href: '/mission-control' },
  { id: 'pipeline', label: 'Pipeline', icon: '📋', href: '/mission-control/leads' },
  { id: 'emails', label: 'Emails', icon: '✉️', href: '/mission-control/emails', badge: 'draftCount' },
  { id: 'calendar', label: 'Calendar', icon: '📅', href: '/mission-control/calendar' },
  { id: 'activity', label: 'Activity', icon: '⚡', href: '/mission-control/activity' },
  { id: 'memory', label: 'Memory', icon: '🧠', href: '/mission-control/memory' },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/mission-control/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const res = await fetch('/api/email-drafts');
        if (!res.ok) return;
        const json = await res.json();
        setDraftCount(json.total || 0);
      } catch {
        setDraftCount(0);
      }
    }
    fetchDrafts();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/mission-control/api/logout', { method: 'POST' });
    window.location.href = '/mission-control/login';
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#111118] border-r border-slate-800/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Mission Control</h1>
            <p className="text-xs text-slate-500">VizBiz.ai</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const badgeCount = item.badge === 'draftCount' ? draftCount : 0;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {badgeCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  {badgeCount}
                </span>
              )}
              {isActive && !badgeCount && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/30 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Vlad</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
