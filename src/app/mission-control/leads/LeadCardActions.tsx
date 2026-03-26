"use client";

import { useState } from "react";

export function LeadCardActions({
  subject,
  body,
  html,
}: {
  subject: string | null;
  body: string | null;
  html?: string | null;
}) {
  const [copied, setCopied] = useState<null | "text" | "html">(null);

  async function handleCopyText() {
    const payload = [subject ? `Subject: ${subject}` : null, body].filter(Boolean).join("\n\n");
    if (!payload) return;

    try {
      await navigator.clipboard.writeText(payload);
      setCopied("text");
      window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy email draft", error);
    }
  }

  async function handleCopyHtml() {
    if (!html) return;

    try {
      await navigator.clipboard.writeText(html);
      setCopied("html");
      window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy HTML email draft", error);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopyText}
        disabled={!subject && !body}
        className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
      >
        {copied === "text" ? "Copied Text" : "📋 Copy Email"}
      </button>

      {html ? (
        <button
          type="button"
          onClick={handleCopyHtml}
          className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/10"
        >
          {copied === "html" ? "Copied HTML" : "</> Copy HTML"}
        </button>
      ) : null}
    </div>
  );
}
