import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | VizBiz.ai",
  description: "How VizBiz.ai collects, uses, and protects client and lead information for AI visibility reports.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Trust center</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-300">Last updated: May 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-200">
          <section>
            <h2 className="text-lg font-semibold text-white">What we collect</h2>
            <p className="mt-2">When you request a free or paid report, we may collect business and contact details such as your name, email, business name, website URL, city/region, competitor inputs, and lead-source attribution data (for example UTM parameters and referrer information).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">How we use data</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Generate and deliver AI visibility reports and paid deliverables.</li>
              <li>Improve report quality, scoring logic, and service operations.</li>
              <li>Measure lead sources and campaign effectiveness.</li>
              <li>Communicate service updates and support-related notices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data sharing</h2>
            <p className="mt-2">We do not sell personal information. We may share data with trusted subprocessors required to run the service (for example hosting, analytics, payments, and email delivery) under confidentiality and security obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Retention and security</h2>
            <p className="mt-2">We retain data only as long as needed for service delivery, legal obligations, and legitimate business records. We apply reasonable technical and organizational controls to protect stored data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your choices</h2>
            <p className="mt-2">You may request access, correction, or deletion of your data by contacting us at <a className="text-cyan-300 hover:text-cyan-200" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a>.</p>
          </section>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          Questions? Reach us at <a className="text-cyan-300 hover:text-cyan-200" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a> or visit the <Link href="/contact" className="text-cyan-300 hover:text-cyan-200">contact page</Link>.
        </div>
      </section>
    </main>
  );
}
