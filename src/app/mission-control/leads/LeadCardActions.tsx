"use client";

import { useState } from "react";

export function LeadCardActions({
  subject,
  body,
}: {
  subject: string | null;
  body: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const payload = [subject ? `Subject: ${subject}` : null, body].filter(Boolean).join("\n\n");
    if (!payload) return;

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy email draft", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!subject && !body}
      className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
    >
      {copied ? "Copied" : "📋 Copy Email"}
    </button>
  );
}
