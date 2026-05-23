import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock, Lock, MapPin, Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import VizBizLogo from "@/components/VizBizLogo";
import { buildPaymentLinks } from "@/lib/lead-pipeline";

export const metadata = {
  title: "Alchemy & Stone AI Visibility Snapshot | VizBiz.ai",
  description: "A free VizBiz.ai preview report showing how Alchemy & Stone may appear to AI tools for local Tampa jewelry workshop searches.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const slug = "alchemy-and-stone";

const visibilityGaps = [
  {
    title: "Category clarity",
    body: "AI may not immediately understand whether Alchemy & Stone is primarily a fine jewelry brand, workshop studio, talisman shop, silversmithing experience, or all of the above.",
    icon: Search,
  },
  {
    title: "Local Tampa signals",
    body: "Workshop products mention Tampa, but the core pages could make the local market connection stronger for AI tools comparing local options.",
    icon: MapPin,
  },
  {
    title: "AI-readable trust signals",
    body: "The site could give AI systems clearer proof about the business, workshops, contact details, social presence, and why the experience is credible.",
    icon: ShieldCheck,
  },
];

const competitors = [
  {
    name: "GILDED Gem Studio",
    signal: "Directly describes hands-on ring-making workshops guided by skilled jewelry artisans in Tampa.",
  },
  {
    name: "Studio SLVR Tampa",
    signal: "Uses clear Tampa-specific language around permanent jewelry, sterling silver, and jewelry-making classes.",
  },
];

const unlocks = [
  "Exact wording to clarify the homepage and workshop pages",
  "Page-by-page local AI visibility fixes",
  "Schema and llms.txt recommendations",
  "Competitor-by-competitor gap breakdown",
  "Priority order for the fastest trust and category-signal wins",
];

export default function AlchemyAndStoneFreeReportPage() {
  const links = buildPaymentLinks({
    slug,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    fixPackageUrl: process.env.STRIPE_FIX_PACKAGE_URL,
    monthlyPlanUrl: process.env.STRIPE_MONTHLY_GROWTH_URL,
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(6,182,212,0.11),transparent_28%),linear-gradient(180deg,#020617_0%,#0F172A_62%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-[0.38] [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <VizBizLogo variant="dark" size="md" />
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
              <Link href="/" className="rounded-full border border-cyan-200/20 bg-white/5 px-3 py-2 hover:bg-white/10">← Back home</Link>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-2">Free report preview</span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="min-w-0">
              <p className="mb-3 inline-flex max-w-full rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] sm:text-sm sm:tracking-[0.18em]">
                Free local AI visibility snapshot
              </p>
              <h1 className="max-w-full text-wrap break-words font-serif text-3xl leading-tight sm:text-5xl lg:text-6xl">
                Alchemy & Stone has a memorable brand. AI may need clearer local signals.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                VizBiz reviewed how Alchemy & Stone may appear to AI tools when people search for Tampa jewelry-making workshops, silversmith classes, and artisan metalsmithing experiences.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SignalPill label="Detected niche" value="Jewelry workshops" />
                <SignalPill label="Local market" value="Tampa, FL" />
                <SignalPill label="Competitors" value="2 reviewed" />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={links.fixPackage.trackingUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-5 py-4 font-black text-[#020617] shadow-[0_0_28px_rgba(34,211,238,0.18)]">
                  Unlock the exact fixes — $88 <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#full-report-options" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-4 font-black text-white hover:bg-white/10">
                  See report options
                </a>
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#E0F7FA] via-[#D7FBFF] to-[#CFFAFE] p-6 text-[#0F172A] shadow-[0_0_70px_rgba(34,211,238,0.24)] sm:p-8">
              <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/45 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Estimated AI Visibility Score</p>
                  <Bot className="h-6 w-6 text-[#0891B2]" />
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-7xl font-black tracking-tight sm:text-8xl">46</span>
                  <span className="pb-4 text-2xl font-bold text-slate-600">/100</span>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/80 shadow-inner">
                  <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-[#22D3EE] to-[#06B6D4]" />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Brand strength" value="Strong" />
                  <MiniMetric label="Local clarity" value="Needs lift" />
                  <MiniMetric label="Fix upside" value="High" />
                </div>
                <div className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-5 backdrop-blur">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Main finding</p>
                  <p className="mt-2 text-lg font-bold leading-7 text-slate-950">
                    The brand feels premium to humans, but AI systems may not yet see enough clear evidence connecting Alchemy & Stone to local Tampa workshop searches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-cyan-200/20 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
            <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">What VizBiz identified</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Your best local AI opportunity</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Alchemy & Stone appears positioned as a Tampa-based artisan jewelry and metalsmithing brand offering fine jewelry, talismans, and hands-on workshop experiences.
            </p>
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-5 text-[#0F172A]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">Primary opportunity</p>
              <p className="mt-2 text-2xl font-black">Tampa jewelry-making workshops</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Secondary opportunities include silversmith classes, metalsmith workshops, custom jewelry workshop experiences, and artisan jewelry workshops in Tampa Bay.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-[#0F172A] p-6">
            <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">Why this matters</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Local AI search is becoming a land grab.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              As more customers ask AI tools for local recommendations, businesses with clearer niche, service, location, and trust signals may be easier to recommend first.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "AI needs to understand what the business is.",
                "AI needs to verify where the business serves customers.",
                "AI needs structured proof before comparing local options.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">Top visibility gaps</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Three signals to strengthen first</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300">This free snapshot shows the categories. The paid report gives exact wording, pages, schema, and fix order.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {visibilityGaps.map((gap) => (
              <div key={gap.title} className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.075] to-cyan-300/[0.045] p-6 shadow-[0_18px_55px_rgba(2,6,23,0.22)]">
                <div className="mb-5 inline-flex rounded-2xl bg-cyan-300/12 p-3 text-cyan-100">
                  <gap.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black">{gap.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{gap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-cyan-200/20 bg-white/[0.045] p-6">
            <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">Competitor signal</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Your competitors may be easier for AI to classify.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This does not mean they have a better brand. It means their websites appear to use clearer machine-readable language around jewelry workshops, silversmithing, permanent jewelry, and Tampa-based experiences.
            </p>
          </div>
          <div className="grid gap-4">
            {competitors.map((competitor, index) => (
              <div key={competitor.name} className="rounded-[1.5rem] border border-white/10 bg-[#0F172A] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Competitor {index + 1}</p>
                    <h3 className="mt-1 text-xl font-black">{competitor.name}</h3>
                  </div>
                  <Trophy className="h-5 w-5 text-cyan-200" />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{competitor.signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="full-report-options" className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE4] px-4 py-14 text-[#0F172A] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.88fr] lg:items-start">
          <div>
            <p className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-100 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#0891B2] shadow-sm">Recommended next step</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Unlock the exact fixes before competitors own more local AI attention.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              The free report shows where the visibility gap is likely happening. The full report shows exactly what to change so Alchemy & Stone becomes easier for AI systems to understand, compare, and recommend locally.
            </p>
            <div className="mt-6 grid gap-3">
              {unlocks.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#06B6D4]" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#020617] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Choose your path</p>
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-3xl font-black">$88</p>
              <h3 className="mt-2 text-xl font-black">One-Time Full Report + Fix</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Best if you want the exact priority fix list, AI-readable wording, schema opportunities, and competitor gap breakdown.</p>
            </div>
            <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-3xl font-black">$188<span className="text-base font-bold text-slate-300">/month</span></p>
              <h3 className="mt-2 text-xl font-black">Monthly AI Visibility Growth Plan</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Best if you want ongoing monitoring, competitor movement updates, and monthly action planning.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Link href={links.fixPackage.trackingUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-5 py-4 font-black text-[#020617] shadow-[0_0_28px_rgba(34,211,238,0.24)]">
                Get the $88 Full Report + Fix <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={links.monthlyPlan.trackingUrl} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-4 font-black text-white hover:bg-white/10">
                Start the $188 Monthly Growth Plan <Clock className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Directional visibility analysis only. AI rankings and search behavior are not guaranteed, but the report is designed to make the site clearer and easier for AI systems to interpret.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-cyan-200">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
