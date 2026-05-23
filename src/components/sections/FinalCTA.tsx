import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import VizBizLogo from "@/components/VizBizLogo";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#020617] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_36%),linear-gradient(180deg,#0F172A_0%,#020617_72%)]" />
      <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-12 text-center shadow-[0_0_70px_rgba(34,211,238,0.14)] backdrop-blur sm:px-10 lg:px-14 lg:py-16">
        <div className="mb-8 flex justify-center">
          <VizBizLogo variant="dark" size="md" />
        </div>

        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
          <FileSearch className="h-4 w-4 text-[#22D3EE]" />
          Start with the free local AI visibility read
        </div>

        <h2 className="mx-auto max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
          Ready to see if AI recommends your business locally?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Run the free mini report, compare your business against two nearby competitors, and see which local trust signals AI systems need before they recommend you.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="#free-mini-report"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-7 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.28)] transition hover:scale-[1.01]"
          >
            Run my free local AI visibility report <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#pricing"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            View paid options
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          No generic scorecard. Your website, your town or city, and the two nearby competitors customers already compare you with.
        </p>
      </div>
    </section>
  );
}
