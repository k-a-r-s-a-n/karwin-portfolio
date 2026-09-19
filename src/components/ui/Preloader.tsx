"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CALIBRATION_LOGS = [
  "[BOOT] INITIALIZING INDUSTRIAL CHASSIS BUS ... OK",
  "[CMM] CALIBRATING MEASURING PROBE STYLUS (0.002mm) ... OK",
  "[L2_BUS] MOUNTING POLYGON AMOY LEDGER INTERFACE ... OK",
  "[GIS] CONNECTING CIVICLENS GEOSPATIAL NODES ... OK",
  "[SYS] ALL CONTROL REGISTERS OPERATIONAL",
];

export default function Preloader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < CALIBRATION_LOGS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 650);

    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 3400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "inset(50% 0 50% 0)",
            opacity: 0,
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-12 bg-chassis text-ink select-none pointer-events-auto panel-grid overflow-hidden border-8 border-panel-recess"
        >
          {/* Top Chassis Telemetry Bar */}
          <div className="flex items-center justify-between border-b border-seam pb-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-accent animate-pulse" />
              <span className="font-bold tracking-wider text-ink">
                SYS-CAL // BOOT DIAGNOSTIC
              </span>
            </div>
            <div className="flex items-center gap-4 text-ink-muted text-[11px]">
              <span>UNIT: KARWIN-CNC-01</span>
              <span>&bull;</span>
              <span>VIT CHENNAI '29</span>
            </div>
          </div>

          {/* Center Hardware Calibration Target & Coordinate Display */}
          <div className="flex flex-col items-center justify-center my-auto">
            {/* Precision Coordinate Reticle */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center border border-seam bg-surface p-6 shadow-xs has-rivets">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                {/* Millimeter grid ticks */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="var(--panel-recess)"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="28"
                  stroke="var(--seam)"
                  strokeWidth="0.75"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="14"
                  stroke="var(--safety-orange)"
                  strokeWidth="1"
                />

                {/* Coordinate Crosshairs */}
                <line x1="50" y1="4" x2="50" y2="96" stroke="var(--ink)" strokeWidth="0.75" />
                <line x1="4" y1="50" x2="96" y2="50" stroke="var(--ink)" strokeWidth="0.75" />

                {/* Rotating alignment bracket */}
                <motion.rect
                  x="36"
                  y="36"
                  width="28"
                  height="28"
                  stroke="var(--ink)"
                  strokeWidth="1.25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "50px", originY: "50px" }}
                />

                {/* Center ruby stylus point */}
                <circle cx="50" cy="50" r="3" fill="var(--safety-orange)" />
              </svg>

              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-ink text-surface font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold">
                PROBE CALIBRATED
              </div>
            </div>

            {/* Diagnostic Log Readout */}
            <div className="mt-10 max-w-lg w-full bg-surface border border-seam p-4 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted border-b border-seam pb-1.5 mb-2.5">
                <span>TERMINAL LOG [PORT: TTY0]</span>
                <span className="text-safety-green font-bold">RATE: 115200 BAUD</span>
              </div>
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-xs text-ink font-semibold"
              >
                &gt; {CALIBRATION_LOGS[stepIndex]}
              </motion.div>
            </div>
          </div>

          {/* Bottom Bus Status */}
          <div className="flex items-center justify-between border-t border-seam pt-3 text-[11px] font-mono text-ink-muted">
            <span>CHASSIS: INDUSTRIAL COLD-ROLLED STEEL</span>
            <span className="text-accent font-bold">HARDWARE CONTROL READY</span>
            <span>STANDBY DISPATCH</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
