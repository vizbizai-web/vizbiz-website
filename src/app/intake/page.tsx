import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, CheckCircle2, SearchCheck, Waypoints } from "lucide-react";
import SnapshotIntakeForm from "@/components/SnapshotIntakeForm";

export const metadata: Metadata = {
  title: "Get My AI Visibility Snapshot | VizBiz",
  description:
    "Start your AI Visibility Snapshot for your dealership. Submit your website, market, and contact details, then book a 15-minute review call.",
};

const snapshotPoints = [
  "Step 1: dealership name, website, and market.",
  "Step 2: contact info so we can send and review the snapshot.",
  "Then book a 15-minute review call while your snapshot is in progress.",
];

const prepChecklist = [
  {
    icon: SearchCheck,
    title: "Snapshot-focused intake",
    body: "We only ask for the fields needed to frame your dealership, local market, and AI visibility context.",
  },
  {
    icon: Waypoints,
    title: "Fast handoff",
    body: "The goal is momentum. Submit the form, land on the in-progress page, then lock in the review call.",
  },
  {
    icon: Calendar,
    title: "Review call next",
    body: "The call is the second conversion step. It lets us review the right market, competitors, and framing with you.",
  },
];

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string; cta?: string; page?: string }>;
}) {
  const params = await searchParams;
  const selectedPlan = typeof params.plan === "string" ? params.plan : "";
  const originalCta = typeof params.cta === "string" && params.cta.trim() ? params.cta : "Get My AI Visibility Snapshot";
  const originalPage = typeof params.page === "string" && params.page.trim() ? params.page : "/intake";
  const hasError = params.error === "missing-field";

  return (
    <main className="min-h-screen bg-[#060e1a] text-white">
      <section
        className="section-shell relative isolate overflow-hidden bg-[#0a1628] pb-16 pt-28 text-white sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36"
        style={{ ["--transition-from" as string]: "#060e1a" }}
      >
        <div className="hero-mesh" aria-hidden="true" />
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_36%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
            <div className="max-w-2xl pt-4 lg:pt-10">
              <div className="section-kicker">AI visibility snapshot</div>
              <h1 className="mt-6 text-[2.9rem] font-bold leading-[0.96] tracking-[-0.03em] text-white sm:text-[3.6rem] lg:text-[4.4rem]">
                Start your snapshot.
              </h1>
              <p className="mt-6 max-w-xl text-[1.05rem] leading-8 text-white/72 sm:text-[1.15rem] sm:leading-9 lg:text-[1.22rem]">
                Give us the basics, then book a short review call. This is built like a lead magnet funnel,
                not a bloated application.
              </p>

              <div className="mt-8 glass-card rounded-[1.7rem] p-5 sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/88">
                  What happens next
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/72 sm:text-[0.98rem]">
                  {snapshotPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-4">
                {prepChecklist.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="glass-card rounded-[1.5rem] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                          <p className="mt-2 text-sm leading-7 text-white/68 sm:text-[0.98rem]">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-5 shadow-[0_30px_90px_rgba(2,8,23,0.34)] sm:p-7 lg:p-8">
              <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/82">
                    Two-step funnel
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[2rem]">
                    Get My AI Visibility Snapshot
                  </h2>
                </div>
                <p className="text-sm text-white/52">Takes about 90 seconds</p>
              </div>

              <SnapshotIntakeForm
                selectedPlan={selectedPlan}
                originalCta={originalCta}
                originalPage={originalPage}
                hasError={hasError}
              />

              <div className="mt-4 border-t border-white/8 pt-4 text-sm text-white/50">
                Prefer to talk first?{" "}
                <Link href="/book-call" className="font-medium text-white/78 transition-colors hover:text-white">
                  Book a 15-minute review call
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
