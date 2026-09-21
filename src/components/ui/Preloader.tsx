"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_KEY = "karwin-booted";
const NAME = "KARWIN".split("");
const DURATION_MS = 1900;

/**
 * Boot sequence — runs once per browser session, never for reduced-motion
 * visitors. The inline script in layout.tsx decides before first paint
 * whether this overlay runs at all (`skip-boot`) and hides the page
 * (`is-booting`) until the curtain lifts.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("skip-boot")) {
      queueMicrotask(() => setIsComplete(true));
      return;
    }

    document.documentElement.classList.add("is-booting");

    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION_MS, 1);
      // Ease-out so the counter starts fast and settles — feels mechanical.
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        try {
          sessionStorage.setItem(BOOT_KEY, "1");
        } catch {
          // Non-fatal: worst case the boot replays next reload.
        }
        document.documentElement.classList.remove("is-booting");
        setIsComplete(true);
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("is-booting");
    };
  }, []);

  // Tell the page (hero headline, etc.) that the stage is clear.
  useEffect(() => {
    if (isComplete) {
      window.dispatchEvent(new Event("karwin:booted"));
    }
  }, [isComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          data-boot-overlay
          role="status"
          aria-label="Loading portfolio"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-bg px-6 py-8 sm:px-12 sm:py-10"
        >
          {/* Top row */}
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span>Portfolio — 2026</span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Chennai, IN
            </span>
          </div>

          {/* Center: name reveal */}
          <div className="flex flex-col items-center">
            <h1 className="flex overflow-hidden font-serif text-[16vw] leading-none text-ink sm:text-[11vw] lg:text-[9rem]">
              {NAME.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.15 + i * 0.07,
                  }}
                  className="inline-block will-change-transform"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-2 font-mono text-[11px] uppercase tracking-[0.35em] text-muted"
            >
              Systems engineer <span className="text-accent">&amp;</span> builder
            </motion.p>
          </div>

          {/* Bottom: progress hairline + counter */}
          <div>
            <div className="mb-3 flex items-end justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {progress < 100 ? "Warming up the GPU" : "Ready"}
              </span>
              <span className="font-serif text-3xl tabular-nums text-ink">
                {progress}
                <span className="text-accent">%</span>
              </span>
            </div>
            <div className="h-px w-full bg-line">
              <div
                className="h-px bg-accent transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
