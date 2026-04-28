import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SnapshotIntakeForm from "@/components/SnapshotIntakeForm";

export const metadata: Metadata = {
  title: "Get My AI Visibility Snapshot | VizBiz",
  description:
    "Submit your dealership details to generate your AI visibility snapshot, then move straight into booking a 15-minute review call.",
  alternates: {
    canonical: "https://vizbiz.ai/intake",
  },
};

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
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="site-header">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="logo-wordmark text-xl sm:text-[1.35rem]">
            <span>VizBiz</span>
            <span className="logo-ai">.ai</span>
          </Link>
        </div>
      </header>

      <section className="section-shell px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-18 lg:px-8 lg:pt-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="max-w-xl">
            <div className="section-kicker">Step 1 of 2</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[3.7rem]">
              Get your AI visibility snapshot.
            </h1>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Share a few basics about your dealership. After you submit, we’ll send you to the booking step for your 15-minute review call.
            </p>
            <div className="glass-card mt-8 rounded-[1.75rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">What happens next</p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <li>1. Submit your dealership details.</li>
                <li>2. We prepare your snapshot.</li>
                <li>3. You book your 15-minute review call on the next page.</li>
              </ol>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <div className="border-b border-white/8 pb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Snapshot intake</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-[2rem]">Generate My Snapshot</h2>
            </div>
            <div className="mt-6">
              <SnapshotIntakeForm
                selectedPlan={selectedPlan}
                originalCta={originalCta}
                originalPage={originalPage}
                hasError={hasError}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
