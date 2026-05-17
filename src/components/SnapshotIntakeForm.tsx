"use client";

import type { FocusEvent, FormEvent } from "react";
import { useState } from "react";

const inputClassName = "input-shell mt-2";
const labelClassName = "block text-sm font-medium text-[var(--text-primary)]";

const WEBSITE_ERROR = "Please enter a valid website (e.g. yourbusiness.com)";

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidWebsiteUrl(value: string) {
  try {
    const url = new URL(value);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
  }
}

type SnapshotIntakeFormProps = {
  selectedPlan?: string;
  originalCta: string;
  originalPage: string;
  hasError: boolean;
};

export default function SnapshotIntakeForm({
  selectedPlan = "",
  originalCta,
  originalPage,
  hasError,
}: SnapshotIntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  function handleWebsiteBlur(event: FocusEvent<HTMLInputElement>) {
    const normalized = normalizeWebsiteUrl(event.currentTarget.value);
    if (!normalized) {
      event.currentTarget.setCustomValidity("");
      return;
    }

    event.currentTarget.value = normalized;
    event.currentTarget.setCustomValidity(isValidWebsiteUrl(normalized) ? "" : WEBSITE_ERROR);
  }

  function handleWebsiteInput(event: FormEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const websiteInput = form.elements.namedItem("websiteUrl");

    if (!(websiteInput instanceof HTMLInputElement)) {
      return;
    }

    const normalized = normalizeWebsiteUrl(websiteInput.value);
    websiteInput.value = normalized;

    if (normalized && !isValidWebsiteUrl(normalized)) {
      websiteInput.setCustomValidity(WEBSITE_ERROR);
      websiteInput.reportValidity();
      event.preventDefault();
      return;
    }

    websiteInput.setCustomValidity("");

    // Prevent default form submission, handle it manually
    event.preventDefault();
    
    // Set submitting state
    setIsSubmitting(true);

    try {
      // Submit to new pipeline intake
      const formData = new FormData(form);
      const entries = Object.fromEntries(formData.entries()) as Record<string, string>;
      
      // Normalize website URL before sending
      if (entries.websiteUrl) {
        entries.websiteUrl = normalizeWebsiteUrl(entries.websiteUrl);
      }

      // Attribution: capture UTM params + referrer from URL
      try {
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, val] of urlParams.entries()) {
          if (key.startsWith('utm_')) entries[key] = val;
        }
        if (document.referrer) entries.referrer = document.referrer;
      } catch {}

      // Attribution: capture timezone + locale
      try {
        entries.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        entries.utcOffset = String(new Date().getTimezoneOffset());
        entries.locale = navigator.language;
      } catch {}
      
      const response = await fetch("/api/pipeline/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.leadId) {
          window.location.href = `/report/${data.leadId}${data.redirectUrl?.includes('token=') ? '?token=' + data.redirectUrl.split('token=')[1] : ''}`;
        } else {
          window.location.href = '/thank-you?submitted=1';
        }
      } else {
        console.error("Pipeline intake failed:", response.status);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <form method="POST" className="space-y-5" onSubmit={handleSubmit}>
      <input type="hidden" name="selectedPlan" value={selectedPlan} />
      <input type="hidden" name="source" value="snapshot funnel" />
      <input type="hidden" name="originalCta" value={originalCta} />
      <input type="hidden" name="originalPage" value={originalPage} />
      <input type="hidden" name="phone" value="Not provided via intake form" />

      {hasError ? (
        <div className="rounded-2xl border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
          A required field was missing. Please review the form and submit again.
        </div>
      ) : null}

      <div>
        <label htmlFor="dealershipName" className={labelClassName}>
          Business Name
        </label>
        <input id="dealershipName" name="dealershipName" type="text" required className={inputClassName} placeholder="Oakville Dental" />
      </div>

      <div>
        <label htmlFor="websiteUrl" className={labelClassName}>
          Website URL
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          className={inputClassName}
          placeholder="yourbusiness.com"
          onBlur={handleWebsiteBlur}
          onInput={handleWebsiteInput}
          onInvalid={(event) => {
            event.currentTarget.setCustomValidity(WEBSITE_ERROR);
          }}
        />
      </div>

      <div>
        <label htmlFor="cityMarket" className={labelClassName}>
          City / Location
        </label>
        <input id="cityMarket" name="cityMarket" type="text" required className={inputClassName} placeholder="Oakville, ON" />
      </div>

      <div>
        <label htmlFor="competitor" className={labelClassName}>
          Competitor 1 <span className="text-[var(--text-secondary)]">(optional)</span>
        </label>
        <input
          id="competitor"
          name="competitor"
          type="text"
          className={inputClassName}
          placeholder="e.g., Rival Business Name"
        />
      </div>

      <div>
        <label htmlFor="competitor2" className={labelClassName}>
          Competitor 2 <span className="text-[var(--text-secondary)]">(optional)</span>
        </label>
        <input
          id="competitor2"
          name="competitor2"
          type="text"
          className={inputClassName}
          placeholder="e.g., Rival Business Name"
        />
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Optional but strongly recommended: add 1–2 local competitors you want to beat. Your report is more accurate when you name the businesses your customers compare you against. If skipped, your free snapshot will focus on your business only.
        </p>
      </div>

      <div>
        <label htmlFor="name" className={labelClassName}>
          Name
        </label>
        <input id="name" name="name" type="text" required className={inputClassName} placeholder="Alex Morgan" />
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClassName} placeholder="name@yourbusiness.com" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="premium-button min-h-13 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold"
      >
        {isSubmitting ? "Analyzing your AI visibility..." : "Get My Free AI Visibility Report"}
      </button>
    </form>
  );
}
