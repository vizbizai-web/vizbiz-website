import Link from "next/link";
import { ArrowRight, BadgeCheck, Braces, RadioTower } from "lucide-react";
import MiniAuditFunnel from "@/components/MiniAuditFunnel";
import HeroTicker from "./HeroTicker";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#020617] pt-20 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,#020617_0%,#0F172A_65%,#020617_100%)]" />
      <div className="absolute left-1/2 top-16 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="vizbiz-hero-grid mx-auto grid max-w-[88rem] gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.22fr)_minmax(420px,0.78fr)] lg:gap-14 lg:px-10 lg:py-24 xl:gap-16">
        <div className="vizbiz-hero-copy flex min-w-0 max-w-[calc(100vw-2rem)] flex-col justify-center sm:max-w-full">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.85)]" />
            Start now while most local competitors are still invisible to AI search
          </div>

          <h1 className="max-w-full font-sans text-[clamp(2.1rem,9.5vw,5.125rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-[clamp(3rem,6vw,5.125rem)]">
            <span className="block sm:whitespace-nowrap">Become the local</span>
            <span className="block sm:whitespace-nowrap">business AI</span>
            <span className="block sm:whitespace-nowrap">
              recommends <span className="hero-cursor" aria-hidden="true" />
            </span>
            <HeroTicker />
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
            When someone asks ChatGPT, Google AI, Gemini, Claude, Perplexity, or another AI-powered search tool who to choose nearby, does your business show up — or do your competitors? VizBiz checks your local AI visibility and gives you the website, review, schema, and trust fixes that make your business easier to recommend as this search behavior grows.
          </p>

          <div className="mt-6 inline-flex w-fit flex-wrap items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100">
            <span className="text-cyan-200">Local goal:</span>
            <span>own your ZIP code</span>
            <span className="text-slate-500">/</span>
            <span>own your postal code</span>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <RadioTower className="mb-3 h-5 w-5 text-[#22D3EE]" />
              Buyer questions built from your niche and city
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Braces className="mb-3 h-5 w-5 text-[#22D3EE]" />
              Website, reviews, schema, and local trust gaps
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <BadgeCheck className="mb-3 h-5 w-5 text-[#22D3EE]" />
              Two nearby competitors, not a generic average
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="#free-mini-report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-7 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.35)] transition hover:scale-[1.01]">
              Email me my free AI visibility snapshot <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#pricing" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10">
              View full report options
            </Link>
          </div>
        </div>

        <div className="vizbiz-intake-shell w-full max-w-[calc(100vw-2rem)] justify-self-stretch sm:max-w-[34rem] sm:justify-self-end">
          <MiniAuditFunnel />
        </div>
      </div>
    </section>
  );
}
