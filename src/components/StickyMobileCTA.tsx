"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const heroHeight = window.innerHeight * 0.72;
      setVisible(window.scrollY > heroHeight);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 md:hidden"
        >
          <div className="rounded-[1.35rem] border border-white/10 bg-[#090909eb] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            <motion.div whileHover={{ scale: 1.02, y: -1 }}>
              <Link
                href="/intake/"
                className="premium-button flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-bold uppercase tracking-[0.04em]"
              >
                Get My AI Visibility Snapshot
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
