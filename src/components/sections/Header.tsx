"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import VizBizLogo from "@/components/VizBizLogo";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "What You Get", href: "#what-you-get" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#020617]/88 backdrop-blur-xl">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <div className="flex h-[4.5rem] items-center justify-between">
          <VizBizLogo variant="dark" size="sm" />

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-[#22D3EE]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="#free-mini-report"
            className="hidden rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-4 py-2 text-sm font-bold text-[#020617] shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:scale-[1.01] lg:inline-flex"
          >
            Run free report
          </Link>

          <button
            className="rounded-xl border border-cyan-300/25 bg-white/5 p-2 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-white/10 hover:text-[#22D3EE] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-[#22D3EE]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="#free-mini-report"
                className="mt-2 rounded-lg bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-4 py-3 text-center font-bold text-[#020617]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Run free report
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
