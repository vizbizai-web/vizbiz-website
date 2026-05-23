export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Sidebar } from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Mission Control | VizBiz.ai',
  description: 'Internal operations dashboard for VizBiz.ai',
  robots: { index: false, follow: false }
};

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Sidebar />
      <main className="min-h-screen lg:ml-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
