import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | VizBiz.ai',
  description: 'How VizBiz.ai collects, uses, and protects business intake and report information.',
  alternates: {
    canonical: 'https://vizbiz.ai/privacy/',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-white">← Back to VizBiz.ai</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-white/50">Last updated: June 5, 2026</p>

        <section className="mt-10 space-y-6 text-sm leading-7 text-white/70">
          <p>
            VizBiz.ai helps local businesses understand and improve their visibility in AI-assisted search and recommendation systems. This policy explains what information we collect and how we use it.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-white">Information we collect</h2>
            <p className="mt-2">
              When you submit an intake or request a report, we may collect your name, email address, phone number, business name, website, city or market, competitor names you provide, referral/UTM details, and other context you choose to share.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">How we use information</h2>
            <p className="mt-2">
              We use this information to prepare AI visibility reports, understand local market context, contact you about your report, improve VizBiz services, and monitor the reliability of our intake and report workflow.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Service providers</h2>
            <p className="mt-2">
              We may use trusted providers for hosting, database storage, analytics, email delivery, payments, mapping/research data, and business operations. These providers process information only as needed to support VizBiz.ai.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">No sale of personal information</h2>
            <p className="mt-2">
              We do not sell your personal information. We do not use intake information to spam your customers or impersonate your business.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Data retention</h2>
            <p className="mt-2">
              We keep report and intake records for as long as reasonably needed to provide services, maintain business records, resolve issues, and improve report quality. You can request deletion of your information by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="mt-2">
              Questions or requests can be sent to <a className="text-cyan-300 hover:text-white" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
