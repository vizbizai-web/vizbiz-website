import Link from "next/link";

export const metadata = {
  title: "Terms of Service | VizBiz.ai",
  description: "Terms for using VizBiz.ai reports, services, and paid deliverables.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Trust center</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-300">Last updated: May 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-200">
          <section>
            <h2 className="text-lg font-semibold text-white">Service scope</h2>
            <p className="mt-2">VizBiz.ai provides AI visibility assessments, reports, and related recommendations for local businesses. Deliverables are informational and strategic in nature.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">No guaranteed outcomes</h2>
            <p className="mt-2">Results can vary by market, implementation quality, competition, and platform changes. We do not guarantee rankings, traffic, or revenue outcomes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Client responsibilities</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Provide accurate business and contact information.</li>
              <li>Ensure you have rights to submit provided websites and brand assets.</li>
              <li>Review recommendations before implementation in your environment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Payments and fulfillment</h2>
            <p className="mt-2">Paid products are processed through approved payment providers. Fulfillment timelines depend on package type and intake completeness.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Limitation of liability</h2>
            <p className="mt-2">To the maximum extent permitted by law, VizBiz.ai is not liable for indirect, incidental, or consequential damages arising from service use.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Updates</h2>
            <p className="mt-2">We may update these terms from time to time. Continued use after updates means acceptance of revised terms.</p>
          </section>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          For legal or service questions, contact <a className="text-cyan-300 hover:text-cyan-200" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a> or use our <Link href="/contact" className="text-cyan-300 hover:text-cyan-200">contact page</Link>.
        </div>
      </section>
    </main>
  );
}
