"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";

export default function MiniAuditFunnel() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/mini-audit/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(formData.entries()),
        ...captureAttribution(),
      }),
    });
    const payload = (await response.json()) as { error?: string; reportUrl?: string };

    if (!response.ok || !payload.reportUrl) {
      setStatus("error");
      setError(payload.error ?? "Unable to create your mini report. Please try again.");
      return;
    }

    window.location.href = payload.reportUrl;
  }

  return (
    <form
      id="free-mini-report"
      onSubmit={submit}
      className="w-full max-w-full overflow-hidden rounded-[1.5rem] border border-cyan-200/40 bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-4 text-[#0F172A] shadow-[0_0_60px_rgba(34,211,238,0.22)] sm:rounded-[2rem] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0F172A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F172A]">
            <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" /> Free local AI visibility report
          </div>
          <h2 className="font-serif text-xl leading-tight sm:text-3xl">See if AI recommends your business locally.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Enter your website and two nearby competitors. We’ll check the AI answers local buyers are likely to see before they call you.
          </p>
        </div>
        <div className="hidden shrink-0 rounded-2xl bg-[#0F172A] p-2 shadow-[0_0_24px_rgba(15,23,42,0.16)] sm:block" aria-hidden="true">
          <Image src="/vizbiz-icon-256.svg" alt="" width={48} height={48} className="h-12 w-12 rounded-[22%]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          Business name
          <input name="name" required placeholder="Oakville Family Dental" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Email to unlock summary
          <input name="email" type="email" required placeholder="you@business.com" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Website
          <input name="websiteUrl" placeholder="business.com" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          City / ZIP / postal code
          <input name="city" required placeholder="Oakville or 90210" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Primary service / niche optional
          <input name="primaryService" placeholder="Dental, roofing, law..." className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
        </label>
        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-semibold">Top 2 nearby competitors recommended</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">
              Competitor 1
              <input name="competitorOne" placeholder="Name or website" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Competitor 2
              <input name="competitorTwo" placeholder="Name or website" className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 font-normal outline-none ring-[#22D3EE] focus:ring-2" />
            </label>
          </div>
          <span className="block text-xs font-normal text-slate-600">
            Add the two local businesses customers compare you against. Names or websites are fine. If you leave one blank, we can research likely competitors later, but your own picks are more accurate.
          </span>
        </div>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-4 font-bold text-white transition hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
        {status === "loading" ? "Building your free local AI visibility report..." : "Run my free local AI visibility report"}
        {status !== "loading" && <ArrowRight className="h-5 w-5" />}
      </button>

      <p className="mt-3 text-center text-xs text-slate-600">
        We’ll infer your niche from the website when possible. Competitors are capped at two so the report stays focused.
      </p>
    </form>
  );
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const trackedKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  const attribution: Record<string, string> = {
    landing_page: window.location.href,
  };

  if (document.referrer) attribution.referrer = document.referrer;

  for (const key of trackedKeys) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }

  try {
    const firstTouchKey = "vizbiz_first_touch_attribution";
    const existing = window.localStorage.getItem(firstTouchKey);
    if (!existing) window.localStorage.setItem(firstTouchKey, JSON.stringify({ ...attribution, captured_at: new Date().toISOString() }));
    const firstTouch = window.localStorage.getItem(firstTouchKey);
    if (firstTouch) attribution.first_touch = firstTouch;
  } catch {
    // Attribution is useful, not required for report generation.
  }

  return { attribution };
}
