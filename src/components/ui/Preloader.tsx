"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_KEY = "karwin-booted";
const NAME = "KARWIN".split("");

// How long the sequence runs at minimum — long enough to actually be seen.
const MIN_DURATION_MS = 3000;
// Held at 100% before the curtain lifts, so "Ready" registers.
const SETTLE_MS = 420;
// Never hold the page hostage for a slow connection beyond this.
const MAX_EXTRA_WAIT_MS = 1600;

const STATUS_LINES = [
  "Warming up the GPU",
  "Kerning the display type",
  "Seeding the particle field",
  "Polishing pixels",
];

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Boot sequence — runs once per browser session, never for reduced-motion
 * visitors. The inline script in layout.tsx decides before first paint
 * whether this overlay runs at all (`skip-boot`) and hides the page
 * (`is-booting`) until the curtain lifts.
 *
 * The counter runs to 100%, then waits for the document to actually finish
 * loading (bounded), settles on "Ready", and only then lifts.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(STATUS_LINES[0]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("skip-boot")) {
      queueMicrotask(() => setIsComplete(true));
      return;
    }

    document.documentElement.classList.add("is-booting");

    const start = performance.now();
    let rafId = 0;
    let settleTimer = 0;
    let finished = false;

    const statusInterval = window.setInterval(() => {
      setStatus((prev) => {
        const idx = STATUS_LINES.indexOf(prev ?? "");
        return STATUS_LINES[(idx + 1) % STATUS_LINES.length] ?? null;
      });
    }, 900);

    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(statusInterval);
      setStatus(null);
      setProgress(100);
      // Let "Ready / 100%" register before the lift.
      settleTimer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(BOOT_KEY, "1");
        } catch {
          // Non-fatal: worst case the boot replays next reload.
        }
        document.documentElement.classList.remove("is-booting");
        setIsComplete(true);
      }, SETTLE_MS);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / MIN_DURATION_MS, 1);
      setProgress(Math.round(easeInOutCubic(t) * 100));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Time is up — but if the document is still loading, give it a bounded
      // grace period so the "load" feels real, not theatrical.
      if (
        document.readyState === "complete" ||
        elapsed > MIN_DURATION_MS + MAX_EXTRA_WAIT_MS
      ) {
        finish();
      } else {
        window.addEventListener("load", finish, { once: true });
        // Re-check periodically in case `load` already fired between ticks.
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(statusInterval);
      window.clearTimeout(settleTimer);
      window.removeEventListener("load", finish);
      document.documentElement.classList.remove("is-booting");
    };
  }, []);

  // Tell the page (hero headline, nav, scene) that the stage is clear.
  useEffect(() => {
    if (isComplete) {
      window.dispatchEvent(new Event("karwin:booted"));
    }
  }, [isComplete]);

  const ready = progress >= 100;

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
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-bg px-6 py-8 sm:px-12 sm:py-10"
        >
          {/* Faint breathing glow behind the name */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,241,88,0.07) 0%, rgba(201,241,88,0) 70%)",
            }}
            animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Top row */}
          <div className="relative flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span>Portfolio — 2026</span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Chennai, IN
            </span>
          </div>

          {/* Center: name reveal */}
          <div className="relative flex flex-col items-center">
            <h1 className="flex overflow-hidden font-serif text-[17vw] leading-none text-ink sm:text-[11vw] lg:text-[9.5rem]">
              {NAME.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "112%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 1.0,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2 + i * 0.085,
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
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.35em] text-muted"
            >
              Systems engineer <span className="text-accent">&amp;</span> builder
            </motion.p>
          </div>

          {/* Bottom: status + progress hairline + counter */}
          <div className="relative">
            <div className="mb-3 flex items-end justify-between">
              <span
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
                aria-live="off"
              >
                {ready ? (
                  <span className="text-accent">Ready — welcome in</span>
                ) : (
                  <motion.span
                    key={status ?? ""}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {status}
                  </motion.span>
                )}
              </span>
              <span className="font-serif text-4xl tabular-nums text-ink">
                {progress}
                <span className="text-accent">%</span>
              </span>
            </div>
            <div className="h-px w-full bg-line">
              <div
                className="h-px bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
