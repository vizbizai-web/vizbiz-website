import { ArrowRight, MapPinned, Radar, ShieldCheck, TimerReset } from "lucide-react";
import Link from "next/link";
import ZipPostalTicker from "./ZipPostalTicker";

const points = [
  {
    icon: MapPinned,
    title: "Own service + city questions, not just your homepage",
    body: "AI/search often fans one local recommendation prompt into service, city, review, comparison, and proof searches. VizBiz turns those into pages, FAQs, and trust assets your town can actually find.",
  },
  {
    icon: Radar,
    title: "Syndicate reviews into AI-readable proof",
    body: "A review should not live in one place. The monthly plan turns customer proof into website snippets, GBP responses, searchable social posts, short videos, and FAQ proof blocks.",
  },
  {
    icon: TimerReset,
    title: "Build reputation before the channel gets crowded",
    body: "AI-powered discovery is still early. Build your visibility foundation now while many local competitors are still invisible, inconsistent, or hard for AI systems to verify.",
  },
  {
    icon: ShieldCheck,
    title: "Protect brand searches before others do",
    body: "If buyers or AI search your name plus reviews, legit, best, or alternatives, your own proof should show up first. We check and improve those trust-defense prompts over time.",
  },
];

export default function LocalAiLandGrab() {
  return (
    <section className="relative overflow-hidden bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22D3EE]">Local AI search land grab</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
              <span className="inline-flex items-center whitespace-nowrap">
                Own your <ZipPostalTicker />
              </span>{" "}
              before nearby competitors catch up.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Google still matters, but it is no longer the only discovery path. AI-powered search is becoming a new front door for local discovery. When customers ask who to trust nearby, AI looks for repeated proof across service pages, reviews, social posts, local listings, and competitor comparisons — not just one pretty homepage.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              VizBiz helps small and local businesses turn real-world trust into AI-readable signals so they can build a stronger footprint in their town, city, ZIP code, or postal code.
            </p>
            <Link href="#free-mini-report" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-7 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.28)] transition hover:scale-[1.01]">
              Email me my free AI visibility snapshot <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_50px_rgba(15,23,42,0.3)] backdrop-blur">
                  <div className="mb-5 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-[#22D3EE]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{point.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{point.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
