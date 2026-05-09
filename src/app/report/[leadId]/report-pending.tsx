import Link from 'next/link';
import { Lock, ArrowRight, Calendar, Zap } from 'lucide-react';
import { CALENDLY_URL } from '@/lib/lead-flow';

type PendingStatus = 'not_found' | 'no_token' | 'invalid_token' | 'processing';

const statusMessages: Record<PendingStatus, { title: string; description: string }> = {
  not_found: {
    title: 'Report Not Found',
    description: "We couldn't find a report with that ID. If you recently submitted a request, your analysis may still be processing.",
  },
  no_token: {
    title: 'Your AI Visibility Report',
    description: "Our analysis engine is compiling your AI visibility score across 20+ real search queries. You'll receive an email with your interactive report once the analysis is complete.",
  },
  invalid_token: {
    title: 'Report Link Expired',
    description: "This report link has expired or is invalid. Please check your email for the latest link, or request a new one below.",
  },
  processing: {
    title: 'Your AI Visibility Report',
    description: "Our analysis engine is running your AI visibility assessment. The full report will be ready shortly — you'll receive an email with your private link.",
  },
};

export default function ReportPending({
  leadId,
  status,
  businessName,
}: {
  leadId: string;
  status: PendingStatus;
  businessName?: string;
}) {
  const msg = statusMessages[status];

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <img src="/logo.jpg" alt="VizBiz.ai" style={{ height: '36px', width: 'auto' }} />
          </Link>
        </div>
      </header>

      <section className="section-shell px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-18 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(37,209,242,0.06)]">
              <Lock className="h-7 w-7 text-[var(--neon-cyan)]" />
            </div>

            <h1 className="display-font text-[2.2rem] font-semibold leading-[0.96] tracking-[-0.04em] sm:text-[3rem]">
              {msg.title}
            </h1>

            {businessName && (
              <p className="mt-3 text-sm font-medium text-[var(--neon-cyan)]">{businessName}</p>
            )}

            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
              {msg.description}
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {/* What to expect */}
            <div className="glass-card rounded-[2rem] p-6">
              <h2 className="text-lg font-semibold mb-4">What happens next</h2>
              <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neon-cyan)]/10 text-xs font-bold text-[var(--neon-cyan)]">1</div>
                  <p>Our AI analyzes your visibility across 20+ real search scenarios</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neon-cyan)]/10 text-xs font-bold text-[var(--neon-cyan)]">2</div>
                  <p>The system cross-references competitors, identifies gaps, and scores your presence</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neon-cyan)]/10 text-xs font-bold text-[var(--neon-cyan)]">3</div>
                  <p>You receive an email with your interactive report and personalized recommendations</p>
                </div>
              </div>
            </div>

            {/* Book a call */}
            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(0,240,255,0.06)] text-[var(--neon-cyan)]">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">Book Your 15-Minute Review Call</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                The fastest way to get your results. We'll walk you through the full analysis and explain what it means for your business.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button mt-8 flex min-h-13 w-full items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold"
              >
                Book Your 15-Minute Review Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
