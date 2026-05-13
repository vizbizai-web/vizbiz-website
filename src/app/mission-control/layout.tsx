import { Metadata } from 'next';
import { MCShell } from './components/MCShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mission Control | VizBiz.ai',
  description: 'Operations dashboard for VizBiz.ai',
  robots: { index: false, follow: false },
};

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MCShell>{children}</MCShell>;
}
