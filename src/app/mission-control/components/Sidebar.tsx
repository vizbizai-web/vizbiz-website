'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/mission-control' },
  { id: 'pipeline', label: 'Pipeline', icon: '📋', href: '/mission-control/leads' },
  { id: 'emails', label: 'Emails', icon: '✉️', href: '/mission-control/emails', badge: 'draftCount' },
  { id: 'calendar', label: 'Tasks', icon: '📅', href: '/mission-control/calendar' },
  { id: 'activity', label: 'Activity', icon: '⚡', href: '/mission-control/activity' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
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

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'rgba(6, 7, 15, 0.5)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}>
      {/* Logo */}
      <div className="p-5 border-b border-slate-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #25D1F2, #06B6D4)' }}>
              <span className="text-[#02091F] font-bold text-sm">VB</span>
            </div>
            <div>
              <h1 className="font-semibold text-white text-sm tracking-tight">Mission Control</h1>
              <p className="text-[10px] text-slate-500 tracking-wide">VizBiz.ai</p>
            </div>
          </div>
          {/* Close button on mobile */}
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const badgeCount = item.badge === 'draftCount' ? draftCount : 0;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={handleNav}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base transition-all
                ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
              `}
              style={isActive ? { background: 'rgba(37, 209, 242, 0.08)', borderLeft: '2px solid #25D1F2' } : {}}
            >
              <span className="text-base">{item.icon}</span>
              <span className={isActive ? 'font-medium' : 'font-normal'}>{item.label}</span>
              {badgeCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded-full" style={{ background: 'rgba(37, 209, 242, 0.15)', color: '#25D1F2' }}>
                  {badgeCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/40">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/50 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #25D1F2, #06B6D4)', color: '#02091F' }}>
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Vlad</p>
            <p className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-400 hover:bg-slate-800/30 transition-colors"
        >
          {isLoggingOut ? 'Logging out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
