"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 640);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200/30 bg-[#020617]/90 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.28)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/60 hover:bg-[#0F172A] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#020617] sm:bottom-7 sm:right-7 sm:h-14 sm:w-14 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300/20 to-cyan-500/5" />
      <ArrowUp className="relative h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}
