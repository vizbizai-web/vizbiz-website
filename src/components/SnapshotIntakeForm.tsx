"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Globe, MapPin } from "lucide-react";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition-all placeholder:text-white/28 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/12";

const labelClassName = "mb-2 block text-sm font-medium text-white/74";

type SnapshotIntakeFormProps = {
  selectedPlan?: string;
  originalCta: string;
  originalPage: string;
  hasError: boolean;
};

type FunnelStep = 1 | 2;

export default function SnapshotIntakeForm({
  selectedPlan = "",
  originalCta,
  originalPage,
  hasError,
}: SnapshotIntakeFormProps) {
  const [step, setStep] = useState<FunnelStep>(1);
  const [dealershipName, setDealershipName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [cityMarket, setCityMarket] = useState("");

  const canContinue = useMemo(() => {
    return dealershipName.trim() && websiteUrl.trim() && cityMarket.trim();
  }, [dealershipName, websiteUrl, cityMarket]);

  return (
    <form action="/api/intake" method="POST" className="mt-6 space-y-5">
      <input type="hidden" name="selectedPlan" value={selectedPlan} />
      <input type="hidden" name="source" value="snapshot funnel" />
      <input type="hidden" name="originalCta" value={originalCta} />
      <input type="hidden" name="originalPage" value={originalPage} />

      <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 p-3 text-sm text-white/62">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold ${step === 1 ? "bg-cyan-400 text-slate-950" : "bg-white/8 text-white/70"}`}>
          1
        </div>
        <div className="h-px flex-1 bg-white/10" />
        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold ${step === 2 ? "bg-cyan-400 text-slate-950" : "bg-white/8 text-white/70"}`}>
          2
        </div>
      </div>

      {hasError ? (
        <div className="rounded-[1.4rem] border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
          A required field was missing. Please review the form and submit again.
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="dealershipName" className={labelClassName}>
              Dealership name *
            </label>
            <input
              id="dealershipName"
              name="dealershipName"
              type="text"
              required
              className={inputClassName}
              placeholder="Oakville Honda"
              value={dealershipName}
              onChange={(event) => setDealershipName(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="websiteUrl" className={labelClassName}>
              Website URL *
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/34" />
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                required
                className={`${inputClassName} pl-11`}
                placeholder="https://www.oakvillehonda.com"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cityMarket" className={labelClassName}>
              Market *
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/34" />
              <input
                id="cityMarket"
                name="cityMarket"
                type="text"
                required
                className={`${inputClassName} pl-11`}
                placeholder="Oakville, ON"
                value={cityMarket}
                onChange={(event) => setCityMarket(event.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canContinue}
            className="premium-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to contact details
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClassName}>
                Name *
              </label>
              <input id="name" name="name" type="text" required className={inputClassName} placeholder="Alex Morgan" />
            </div>
            <div>
              <label htmlFor="phone" className={labelClassName}>
                Phone *
              </label>
              <input id="phone" name="phone" type="tel" required className={inputClassName} placeholder="(905) 555-0123" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClassName}>
              Work email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClassName}
              placeholder="alex@dealership.com"
            />
          </div>

          <div className="rounded-[1.5rem] border border-cyan-400/16 bg-cyan-400/8 p-4 text-sm leading-7 text-white/66 sm:px-5">
            After you submit, we’ll move you to a snapshot-in-progress page and push you straight into booking a 15-minute review call.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-4 text-base font-medium text-white/84 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Back
            </button>
            <button
              type="submit"
              className="premium-button inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold"
            >
              Get My AI Visibility Snapshot
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-white/48">
        No long sales sequence. Just enough info to start your snapshot and move to the review call.
      </p>
    </form>
  );
}
