import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Visibility Audit for Dealerships: What It Measures | VizBiz",
  description: "A practical guide to the dealership signals an AI visibility audit should inspect, without invented benchmark data.",
  alternates: { canonical: "https://vizbiz.ai/blog/ai-visibility-audit-what-it-measures-dealership/" },
};

const auditAreas = [
  "Clear dealership identity, brands sold, service department information, parts availability, and financing language.",
  "Crawlable pages for sales, service, parts, financing, reviews, location, hours, and contact paths.",
  "Structured data that helps machines connect the dealership, address, phone, departments, and services.",
  "Review language that mentions real buyer concerns such as service speed, trade-ins, financing, inventory, and staff trust.",
  "Content that answers natural questions a shopper might ask an AI assistant before choosing a dealer.",
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Dealership guide</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">AI Visibility Audit for Dealerships: What It Measures</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          A useful dealership AI visibility audit looks at whether AI systems can understand the business clearly enough to recommend it for sales, service, parts, financing, and local shopper questions.
        </p>
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Core signals to inspect</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            {auditAreas.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What the audit should produce</h2>
          <p className="mt-3 leading-7 text-slate-300">
            The deliverable should be a prioritized action plan: clarify missing business facts, strengthen proof signals, improve service and inventory content, align public profiles, and make the site easier for crawlers to parse.
          </p>
        </section>
        <p className="mt-10 text-slate-300">
          Start with a safe snapshot: <Link href="/intake/" className="text-cyan-300 underline underline-offset-4">run the free VizBiz visibility check</Link>.
        </p>
      </article>
    </main>
  );
}
