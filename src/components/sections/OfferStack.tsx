import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, ShieldCheck } from "lucide-react";

const deliverables = [
  "120 buyer-intent AI prompts across discovery, trust, service, urgent, comparison, and nearby-market questions",
  "Two nearby competitor benchmark showing where AI recommends them instead of you",
  "Prompt evidence table with provider, outcome, rank, answer excerpt, and citation/source notes where available",
  "Website, schema, sitemap, robots.txt, llms.txt, GBP, reviews, and local entity readiness audit",
  "Why AI recommended your competitor section with evidence, missing proof, and fix needed",
  "30 / 60 / 90-day local visibility action plan ranked by commercial intent and implementation difficulty",
  "A simple estimate of how much visibility you may be losing to local competitors",
  "Walkthrough-ready report you can use internally or hand to a marketing/web team",
];

export default function OfferStack() {
  return (
    <section className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE4] px-4 py-16 text-[#0F172A] sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#020617] px-4 py-2 text-sm font-bold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              <Gift className="h-4 w-4 text-[#22D3EE]" />
               Founding local business offer
            </div>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
              Start with a low-friction paid step, then keep building if you want to own your local market.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              The full report is built to feel concrete: a measured prompt set, named local competitors, evidence screenshots/source notes where available, and fixes your site can actually use. No mass AI content dump. No vague SEO scorecard.
            </p>

            <div className="mt-8 rounded-[2rem] border border-[#0F172A]/10 bg-white/75 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-6 w-6 flex-none text-[#06B6D4]" />
                <div>
                  <p className="font-bold text-[#0F172A]">Risk reversal</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    The $88 one-time report is designed to give a concrete fix list, not a vague scorecard. We guarantee the depth of the diagnosis — not impossible-to-control AI rankings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#020617] p-5 text-white shadow-2xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">One-time full report + fix</p>
                <h3 className="mt-2 font-serif text-3xl">Full report that tells you what to fix first.</h3>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-400">one-time</p>
                <p className="text-4xl font-bold text-white">$88</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">USD</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {deliverables.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#22D3EE]" />
                  <span className="text-sm leading-6 text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <Link href="#free-mini-report" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-6 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.26)]">
              Run my free local AI visibility report <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-400">Free report first. Then choose the $88 one-time report if you want the full fix list.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
