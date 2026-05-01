"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const menuItems = [
  { label: "AI Visibility", href: "/ai-visibility-for-car-dealerships" },
  { label: "How It Works", href: "/how-dealerships-show-up-in-ai-search" },
  { label: "Audit", href: "/ai-visibility-audit-for-car-dealerships" },
  { label: "Sample Report", href: "/sample-ai-visibility-report-for-car-dealerships" },
  { label: "Blog", href: "/blog" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq-ai-visibility-for-car-dealerships" },
];

type SiteHeaderProps = {
  ctaLabel?: string;
};

export default function SiteHeader({ ctaLabel = "Get My Snapshot" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header relative z-50 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <img src="/logo.jpg" alt="VizBiz.ai" style={{ height: '72px', width: 'auto' }} />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-6 text-sm font-semibold text-white/78">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/intake/" className="premium-button rounded-2xl px-5 py-3 text-sm font-semibold text-[#051018]">
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/6 text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/8 bg-[rgba(2,9,31,0.96)] px-4 pb-4 pt-3 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/8 px-4 py-3 text-sm font-semibold text-white/82 transition-colors hover:border-white/14 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/intake/"
              onClick={() => setOpen(false)}
              className="premium-button mt-2 min-h-12 rounded-2xl px-5 text-sm font-semibold text-[#051018]"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
