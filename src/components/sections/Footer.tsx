"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "What You Get", href: "#what-you-get" },
    { label: "Pricing", href: "#pricing" },
    { label: "Book a Call", href: "/book-call" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="section-shell section-transition bg-[#030303] px-3 py-10 text-white sm:px-6 sm:py-12 lg:px-8" style={{ ["--transition-from" as string]: "#050505" }}>
      <div className="mx-auto mb-6 h-px max-w-7xl bg-gradient-to-r from-transparent via-[rgba(182,255,46,0.72)] to-transparent" />
      <AnimateIn className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[1.9rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="logo-badge flex h-11 w-11 rounded-2xl">
              <span className="logo-metallic display-font text-sm font-black tracking-[0.24em]">VB</span>
            </div>
            <div>
              <p className="display-font text-lg font-black uppercase tracking-[-0.04em]">VizBiz</p>
              <p className="text-sm text-white/58">AI Visibility Audit for Local Businesses</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/68">
          {navLinks.map((link) => (
            <motion.div key={link.label} whileHover={{ y: -1 }}>
              <Link href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="text-sm text-white/50 lg:text-right">
          <p>{currentYear} VizBiz.ai. All rights reserved.</p>
          <p className="mt-1">One-time audit. No subscription.</p>
        </div>
      </AnimateIn>
    </footer>
  );
}
