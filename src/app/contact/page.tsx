import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | VizBiz.ai',
  description: 'Contact VizBiz.ai for AI visibility reports, paid fulfillment, and local business visibility questions.',
  alternates: {
    canonical: 'https://vizbiz.ai/contact/',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-white">← Back to VizBiz.ai</Link>
        <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-white/[0.03] p-8 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Contact VizBiz</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Questions about AI visibility?</h1>
          <p className="mt-5 text-base leading-8 text-white/70">
            If you have a question about a report, paid intake, monthly monitoring, or whether VizBiz is a fit for your business, send a note. Keep it specific and we’ll respond with the useful next step.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a href="mailto:hello@vizbiz.ai" className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition hover:border-cyan-300/50">
              <p className="text-sm font-semibold text-white">General questions</p>
              <p className="mt-2 text-sm text-cyan-300">hello@vizbiz.ai</p>
            </a>
            <a href="mailto:reports@vizbiz.ai" className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition hover:border-cyan-300/50">
              <p className="text-sm font-semibold text-white">Report support</p>
              <p className="mt-2 text-sm text-cyan-300">reports@vizbiz.ai</p>
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#020617] p-5 text-sm leading-7 text-white/65">
            <p className="font-semibold text-white">For fastest help, include:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Your business name and website</li>
              <li>The city or market you care about</li>
              <li>Whether you are asking about a free mini report, full report, fix package, or monthly monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
