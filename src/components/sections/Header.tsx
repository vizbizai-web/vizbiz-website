"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

function BrandMark() {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="logo-badge flex h-11 w-11 rounded-2xl sm:h-12 sm:w-12">
        <span className="logo-metallic display-font text-sm font-black tracking-[0.26em] sm:text-base">VB</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="display-font text-xl font-black uppercase tracking-[-0.05em] text-white sm:text-[1.4rem]">
          VizBiz
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
          AI Visibility Audit
        </span>
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Book a Call", href: "/book-call" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#050505ee] shadow-[0_18px_44px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(182,255,46,0.22)] to-transparent" />

      <div className="mx-auto hidden h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:flex lg:px-8">
        <Link href="/" className="shrink-0">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold uppercase tracking-[0.08em] text-white/72 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="#pricing"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/12 bg-white/6 px-4 text-sm font-medium text-white/80 transition-colors hover:border-white/18 hover:bg-white/10 hover:text-white"
          >
            View pricing
          </Link>
          <Link href="#pricing" className="premium-button rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.04em]">
            Get My Free Score
          </Link>
        </div>
      </div>

      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-center px-3 sm:px-6 lg:hidden">
        <Link href="/" className="inline-flex max-w-[calc(100%-5rem)] justify-center">
          <BrandMark />
        </Link>

        <button
          type="button"
          className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white backdrop-blur-xl transition-colors hover:bg-white/10 sm:right-6"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#050505f2] backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-2xl border border-white/0 px-4 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white/78 transition-all hover:border-white/10 hover:bg-white/6 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#pricing"
              className="premium-button mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.04em]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get My Free Score
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
