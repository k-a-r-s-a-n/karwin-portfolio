"use client";

import React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Fixed atmospheric glow layer behind everything. Scroll-linked drift,
 * compositor-only transforms, honours reduced motion.
 */
export default function ScrollFlow() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const y1 = useTransform(scrollYProgress, [0, 1], [-60, 260]);
  const x1 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const y2 = useTransform(scrollYProgress, [0, 1], [40, -220]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const y3 = useTransform(scrollYProgress, [0, 1], [-20, 160]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [0.95, 1.18]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
    >
      <motion.div
        style={shouldReduceMotion ? { transform: "none" } : { y: y1, x: x1 }}
        className="absolute -left-40 -top-40 h-[560px] w-[560px] will-change-transform"
      >
        <div
          className="h-full w-full rounded-full blur-[110px]"
          style={{ backgroundColor: "var(--glow-1)" }}
        />
      </motion.div>

      <motion.div
        style={shouldReduceMotion ? { transform: "none" } : { y: y2, x: x2 }}
        className="absolute -right-40 top-1/3 h-[620px] w-[620px] will-change-transform"
      >
        <div
          className="h-full w-full rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--glow-2)" }}
        />
      </motion.div>

      <motion.div
        style={
          shouldReduceMotion
            ? { transform: "none" }
            : { y: y3, scale: scale3 }
        }
        className="absolute bottom-0 left-1/4 h-[520px] w-[660px] will-change-transform"
      >
        <div
          className="h-full w-full rounded-full blur-[110px]"
          style={{ backgroundColor: "var(--glow-3)" }}
        />
      </motion.div>
    </div>
  );
}
