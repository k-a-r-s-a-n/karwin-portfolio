"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useAnimation, PanInfo } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

const WINDOW_HEIGHT = 34; // height of the inner window opening

export default function WindowShadeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const controls = useAnimation();
  const y = useMotionValue(isDark ? WINDOW_HEIGHT : 0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync position when theme changes externally or via click
  React.useEffect(() => {
    controls.start({
      y: isDark ? WINDOW_HEIGHT : 0,
      transition: { type: "spring", stiffness: 380, damping: 26 },
    });
    y.set(isDark ? WINDOW_HEIGHT : 0);
  }, [isDark, controls, y]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const currentY = y.get();
    // If dragged past 50% or pulled with positive downward velocity
    const shouldClose = currentY > WINDOW_HEIGHT * 0.5 || info.velocity.y > 100;

    if (shouldClose) {
      controls.start({
        y: WINDOW_HEIGHT,
        transition: { type: "spring", stiffness: 380, damping: 26 },
      });
      setTheme("dark");
    } else {
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 380, damping: 26 },
      });
      setTheme("light");
    }
  };

  const handleClick = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Outer Cabin Window Bezel */}
      <div
        ref={containerRef}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Airplane cabin window day/night theme toggle"
        title={isDark ? "Pull shade up for daylight" : "Pull shade down for nightfall"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="group relative w-10 h-11 rounded-[14px] bg-panel-recess border-2 border-seam p-[3px] shadow-sm cursor-pointer select-none overflow-hidden transition-colors hover:border-accent focus:outline-hidden focus:ring-1 focus:ring-accent"
      >
        {/* Inner Window Aperture Frame with implied depth */}
        <div className="relative w-full h-full rounded-[11px] overflow-hidden bg-black shadow-inner border border-seam">
          {/* ─── Sky Layer Behind Shade ─── */}
          {/* Daytime Sky */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isDark ? "opacity-0" : "opacity-100"
            }`}
            style={{
              background: "linear-gradient(180deg, #38BDF8 0%, #7DD3FC 60%, #E0F2FE 100%)",
            }}
          >
            {/* Sun Glow */}
            <div className="absolute top-1 right-1.5 w-3.5 h-3.5 rounded-full bg-white/90 blur-[1px] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            {/* Fluffy Cirrus Cloud Accent */}
            <div className="absolute bottom-1 left-1 right-1 h-2 bg-white/40 rounded-full blur-[2px]" />
          </div>

          {/* Night Sky with Payoff Stars */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isDark ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: "linear-gradient(180deg, #05070E 0%, #0B132B 55%, #1C2541 100%)",
            }}
          >
            {/* Star Constellation Dots */}
            <span
              className="absolute top-1.5 left-2 w-1 h-1 bg-white rounded-full shadow-[0_0_3px_#fff]"
              aria-hidden="true"
            />
            <span
              className="absolute top-4 right-1.5 w-0.75 h-0.75 bg-amber-200 rounded-full opacity-90 shadow-[0_0_2px_#fde68a]"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-2 left-2.5 w-0.75 h-0.75 bg-sky-200 rounded-full opacity-80 shadow-[0_0_2px_#bae6fd]"
              aria-hidden="true"
            />
            <span
              className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-70"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-3 right-3 w-1 h-1 bg-white rounded-full opacity-90 shadow-[0_0_3px_#fff]"
              aria-hidden="true"
            />
          </div>

          {/* ─── Mechanical Window Shade Panel ─── */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: WINDOW_HEIGHT }}
            dragElastic={0.08}
            dragMomentum={false}
            animate={controls}
            style={{ y, height: WINDOW_HEIGHT + 6, top: -WINDOW_HEIGHT }}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
              // Allow click to toggle without bubbling twice
              e.stopPropagation();
              handleClick();
            }}
            className="absolute left-0 right-0 z-20 cursor-grab active:cursor-grabbing rounded-b-[7px] border-b border-seam shadow-md flex flex-col justify-end"
            aria-hidden="true"
          >
            {/* Solid Shade Body */}
            <div className="w-full h-full bg-seam dark:bg-panel-recess relative flex flex-col justify-end p-0.5 border-x border-ink-muted/50 dark:border-seam">
              {/* Horizontal Ribbed Slat Texture */}
              <div className="w-full h-0.5 bg-surface/40 dark:bg-black/40 mb-0.5" />
              <div className="w-full h-0.5 bg-surface/40 dark:bg-black/40 mb-0.5" />

              {/* Bottom Curved Pull-Lip & Gripper Handle */}
              <div className="w-full h-2.5 rounded-b-[6px] bg-ink-muted/60 dark:bg-ink flex items-center justify-center shadow-xs">
                {/* Micro Handle Dimple */}
                <div className="w-3 h-0.75 rounded-full bg-ink-muted dark:bg-seam" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Auxiliary Status Micro-Label */}
      <span className="hidden xl:inline font-mono text-[9px] uppercase tracking-wider text-ink-muted">
        {isDark ? "NIGHT" : "CABIN"}
      </span>
    </div>
  );
}
