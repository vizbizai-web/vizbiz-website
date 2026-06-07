import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use | VizBiz.ai',
  description: 'Terms for using VizBiz.ai AI visibility reports and services.',
  alternates: {
    canonical: 'https://vizbiz.ai/terms/',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-white">← Back to VizBiz.ai</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Terms of Use</h1>
        <p className="mt-4 text-sm text-white/50">Last updated: June 5, 2026</p>

        <section className="mt-10 space-y-6 text-sm leading-7 text-white/70">
          <p>
            These terms govern your use of VizBiz.ai and any AI visibility reports, recommendations, or related services we provide.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-white">What VizBiz provides</h2>
            <p className="mt-2">
              VizBiz.ai provides AI visibility intelligence, local discovery analysis, competitor comparisons, and recommendation-readiness guidance for businesses. Reports are informational and strategic, not legal, financial, or guaranteed ranking advice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">No guaranteed rankings or revenue</h2>
            <p className="mt-2">
              AI systems, search engines, maps, and third-party platforms change frequently. We do not guarantee that any business will rank, appear, be cited, receive traffic, or generate revenue from a report or recommendation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Your information</h2>
            <p className="mt-2">
              You are responsible for providing accurate business information, website details, competitor names, and contact information. Better inputs help produce better analysis.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Payments and services</h2>
            <p className="mt-2">
              Paid reports, fix packages, and monitoring plans may have separate scopes, pricing, deliverables, and cancellation terms shown at checkout or agreed in writing. Subscription services renew until cancelled unless otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Use of reports</h2>
            <p className="mt-2">
              Reports are prepared for the business or recipient who requested them. You may use your report internally and with your team or vendors. Do not resell, copy, or misrepresent VizBiz analysis as your own service without written permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="mt-2">
              Questions can be sent to <a className="text-cyan-300 hover:text-white" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
