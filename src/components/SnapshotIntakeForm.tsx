"use client";

import type { FocusEvent, FormEvent } from "react";

const inputClassName = "input-shell mt-2";
const labelClassName = "block text-sm font-medium text-[var(--text-primary)]";

const WEBSITE_ERROR = "Please enter a valid website (e.g. dealershipname.com)";

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  return (
    <form action="/api/intake" method="POST" className="space-y-5" onSubmit={handleSubmit}>
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
          Dealership Name
        </label>
        <input id="dealershipName" name="dealershipName" type="text" required className={inputClassName} placeholder="Oakville Honda" />
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
          placeholder="dealershipname.com"
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
          Top competitors <span className="text-[var(--text-secondary)]">(optional)</span>
        </label>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Who do you most often compete with in your market?
        </p>
        <input
          id="competitor"
          name="competitor"
          type="text"
          className={inputClassName}
          placeholder="ToyotaTown, Downtown Honda, City Kia"
        />
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
        <input id="email" name="email" type="email" required className={inputClassName} placeholder="alex@dealership.com" />
      </div>

      <button
        type="submit"
        className="premium-button min-h-13 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold"
      >
        Generate My Snapshot
      </button>
    </form>
  );
}
