"use client";

import { useEffect, useState } from "react";
import { HERO_TICKER_WORDS } from "./hero-ticker-words";

export const HERO_TICKER_INTERVAL_MS = 1150;

export default function HeroTicker() {
  const [index, setIndex] = useState(0);
  const currentWord = HERO_TICKER_WORDS[index];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_TICKER_WORDS.length);
    }, HERO_TICKER_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="hero-ticker-outer" aria-live="polite" aria-atomic="true">
      <span key={currentWord} className="hero-ticker-word hero-ticker-word-in">
        {currentWord}
      </span>
    </span>
  );
}
