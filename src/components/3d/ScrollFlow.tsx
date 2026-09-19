"use client";

import React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function ScrollFlow() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Scroll-driven position shifts — no rotation (rotation forces repaint; translate is compositor-only)
  const y1 = useTransform(scrollYProgress, [0, 1], [-40, 240]);
  const x1 = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const y2 = useTransform(scrollYProgress, [0, 1], [40, -200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const y3 = useTransform(scrollYProgress, [0, 1], [-20, 140]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [0.95, 1.15]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Mesh Node 1: Warm Accent Atmospheric Drift */}
      <motion.div
        style={
          shouldReduceMotion
            ? { transform: "none" }
            : { y: y1, x: x1 }
        }
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full will-change-transform"
      >
        <div
          className="w-full h-full rounded-full blur-[90px]"
          style={{ backgroundColor: "var(--bg-mesh-1)" }}
        />
      </motion.div>

      {/* Mesh Node 2: Secondary Green / Machine Status Haze */}
      <motion.div
        style={
          shouldReduceMotion
            ? { transform: "none" }
            : { y: y2, x: x2 }
        }
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full will-change-transform"
      >
        <div
          className="w-full h-full rounded-full blur-[100px]"
          style={{ backgroundColor: "var(--bg-mesh-2)" }}
        />
      </motion.div>

      {/* Mesh Node 3: Deep Atmospheric Cold Ambient Glow */}
      <motion.div
        style={
          shouldReduceMotion
            ? { transform: "none" }
            : { y: y3, scale: scale3 }
        }
        className="absolute bottom-10 left-1/4 w-[650px] h-[500px] rounded-full will-change-transform"
      >
        <div
          className="w-full h-full rounded-full blur-[90px]"
          style={{ backgroundColor: "var(--bg-mesh-3)" }}
        />
      </motion.div>
    </div>
  );
}
