'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { id: 'dashboard', label: 'Home', desktopLabel: 'Command Center', icon: '⚡', href: '/mission-control' },
  { id: 'leads', label: 'Leads', desktopLabel: 'Intake Inbox', icon: '💼', href: '/mission-control/leads' },
  { id: 'tasks', label: 'Tasks', desktopLabel: 'Tasks / To-Do', icon: '✅', href: '/mission-control/tasks' },
  { id: 'calendar', label: 'Calendar', desktopLabel: 'Calendar', icon: '📅', href: '/mission-control/calendar' },
  { id: 'crm', label: 'CRM', desktopLabel: 'CRM Pipeline', icon: '🤝', href: '/mission-control/crm' },
  { id: 'content', label: 'Content', desktopLabel: 'Content Studio', icon: '✍️', href: '/mission-control/content' },
  { id: 'research', label: 'Research', desktopLabel: 'X Research', icon: '𝕏', href: '/mission-control/research' },
  { id: 'reports', label: 'Reports', desktopLabel: 'Reports / Fulfillment', icon: '📊', href: '/mission-control/reports' },
  { id: 'settings', label: 'Settings', desktopLabel: 'Settings', icon: '⚙️', href: '/mission-control/settings' },
];

const bottomNav = navItems.filter((item) => ['dashboard', 'leads', 'tasks', 'calendar', 'content'].includes(item.id));

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/mission-control/api/logout/', { method: 'POST' });
    router.push('/mission-control/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-[#0a0a0f]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/mission-control" className="flex items-center gap-3">
            <Image src="/vizbiz-icon-256.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-[22%]" />
            <div>
              <p className="text-sm font-bold text-white">Mission Control</p>
              <p className="text-xs text-cyan-300">VizBiz.ai</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl border border-cyan-300/25 bg-white/5 px-3 py-2 text-sm font-semibold text-cyan-100"
            aria-label="Toggle Mission Control menu"
          >
            Menu
          </button>
        </div>
        {mobileOpen && (
          <nav className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-3">
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} compact />
            ))}
          </nav>
        )}
      </header>

      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-slate-800/50 bg-[#111118] lg:flex">
        <div className="border-b border-slate-800/50 p-6">
          <Link href="/mission-control" className="flex items-center gap-3">
            <Image src="/vizbiz-icon-256.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-[22%] shadow-[0_0_24px_rgba(34,211,238,0.18)]" />
            <div>
              <h1 className="text-lg font-bold text-white">Mission Control</h1>
              <p className="text-xs text-cyan-300">VizBiz.ai founder cockpit</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 pb-24">
          {navItems.map((item) => <NavLink key={item.id} item={item} pathname={pathname} />)}
        </nav>

        <div className="border-t border-slate-800/50 p-4">
          <div className="mb-3 rounded-2xl bg-slate-800/30 px-4 py-3">
            <p className="text-sm font-medium text-white">Alex</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Founder mode
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-800/70 bg-[#0a0a0f]/95 px-2 py-2 backdrop-blur lg:hidden">
        {bottomNav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link key={item.id} href={item.href} className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold ${active ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-500'}`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavLink({ item, pathname, compact = false, onClick }: { item: typeof navItems[number]; pathname: string; compact?: boolean; onClick?: () => void }) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${compact ? 'px-3 py-2' : 'px-4 py-3'} ${
        active
          ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-200'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <span className="text-lg">{item.icon}</span>
      <span>{compact ? item.label : item.desktopLabel}</span>
      {active && !compact && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />}
    </Link>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/mission-control') return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}
