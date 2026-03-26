"use client";

import { Children, ReactNode, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
};

export default function AnimateIn({
  children,
  className,
  delay = 0,
  duration = 0.55,
  amount = 0.2,
  once = true,
  stagger = false,
  staggerDelay = 0.1,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once, amount });

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
          staggerChildren: stagger ? staggerDelay : 0,
          delayChildren: stagger ? delay : 0,
        },
      },
    }),
    [delay, duration, stagger, staggerDelay],
  );

  const childVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      },
    }),
    [duration],
  );

  if (!stagger) {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
