'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { QuickActions } from './QuickActions';

export function MCShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const isLoginRoute = pathname?.startsWith('/mission-control/login');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [typeof window !== 'undefined' ? window.location.pathname : '']);

  if (isLoginRoute) {
    return (
      <div className="min-h-screen text-slate-200 relative overflow-x-hidden" style={{ background: '#06070F' }}>
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
          <div
            className="absolute -top-10 -left-10 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37, 209, 242, 0.30) 0%, rgba(37, 209, 242, 0.08) 40%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-5%] right-[-10%] w-[760px] h-[760px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)' }}
          />
        </div>
        <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 relative overflow-x-hidden" style={{ background: '#06070F' }}>
      {/* === GLASS BED — visible gradients that cards blur over === */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {/* Top-left cyan — covers dashboard hero area */}
        <div
          className="absolute -top-10 -left-10 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37, 209, 242, 0.30) 0%, rgba(37, 209, 242, 0.08) 40%, transparent 70%)' }}
        />
        {/* Mid-right teal — covers pipeline area */}
        <div
          className="absolute top-[30%] -right-10 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)' }}
        />
        {/* Bottom-center violet — covers bottom cards */}
        <div
          className="absolute bottom-[-5%] left-[15%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)' }}
        />
        {/* Center amber — warm accent */}
        <div
          className="absolute top-[20%] left-[45%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 60%)' }}
        />
        {/* Bottom-right emerald */}
        <div
          className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)' }}
        />
        {/* Full-width subtle mesh */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(37,209,242,0.06) 0%, transparent 35%, rgba(139,92,246,0.04) 65%, rgba(16,185,129,0.03) 100%)' }}
        />
      </div>

      {/* === MOBILE TOP BAR === */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3" style={{
        background: 'rgba(6, 7, 15, 0.7)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #25D1F2, #06B6D4)' }}>
            <span className="text-[#02091F] font-bold text-[10px]">VB</span>
          </div>
          <span className="font-semibold text-white text-sm">Mission Control</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-2 -mr-2" aria-label="Open menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* === MOBILE SIDEBAR OVERLAY === */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10 animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="absolute inset-0 bg-black/60 z-0" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden lg:flex relative z-10">
        <div className="fixed left-0 top-0 w-60 h-screen overflow-y-auto z-20">
          <Sidebar />
        </div>
        <main className="flex-1 ml-60 min-h-screen flex flex-col relative z-10">
          <QuickActions />
          <div className="p-8 max-w-6xl mx-auto flex-1 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* === MOBILE MAIN CONTENT === */}
      <main className="lg:hidden min-h-screen relative z-10">
        <div className="px-4 py-5 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
