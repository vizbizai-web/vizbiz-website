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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
