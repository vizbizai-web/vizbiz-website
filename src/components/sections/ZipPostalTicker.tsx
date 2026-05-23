"use client";

import { useEffect, useState } from "react";

const WORDS = ["ZIP code", "postal code"] as const;
const ZIP_POSTAL_TICKER_INTERVAL_MS = 1400;
const ZIP_POSTAL_TICKER_OUT_MS = 240;

export default function ZipPostalTicker() {
  const [index, setIndex] = useState(0);
  const [previousWord, setPreviousWord] = useState<string | null>(null);
  const currentWord = WORDS[index];

  useEffect(() => {
    let cleanupPrevious: number | undefined;

    const interval = window.setInterval(() => {
      setPreviousWord(WORDS[index]);
      setIndex((current) => (current + 1) % WORDS.length);
      cleanupPrevious = window.setTimeout(() => setPreviousWord(null), ZIP_POSTAL_TICKER_OUT_MS + 80);
    }, ZIP_POSTAL_TICKER_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (cleanupPrevious) window.clearTimeout(cleanupPrevious);
    };
  }, [index]);

  return (
    <span className="zip-postal-ticker" aria-live="polite" aria-atomic="true">
      {previousWord ? (
        <span key={`out-${previousWord}`} className="zip-postal-ticker-word zip-postal-ticker-word-out" aria-hidden="true">
          {previousWord}
        </span>
      ) : null}
      <span key={`in-${currentWord}`} className="zip-postal-ticker-word zip-postal-ticker-word-in">
        {currentWord}
      </span>
    </span>
  );
}
