"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import profileData from "@/data/profile.json";
import { getLenis } from "@/lib/lenis";

export default function Footer() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <footer className="relative px-6 pb-10 sm:px-10 lg:px-16">
      {/* Scroll progress hairline */}
      <motion.div
        style={{ scaleX }}
        className="absolute left-6 right-6 top-0 h-px origin-left bg-accent/80 sm:left-10 sm:right-10 lg:left-16 lg:right-16"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 pt-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-serif text-lg text-ink">{profileData.name}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            © {new Date().getFullYear()} · build v2.7 · Next.js, Three.js &amp; Framer Motion
          </p>
        </div>

        <p className="max-w-xs font-serif text-sm italic text-muted">
          &ldquo;{profileData.quote}&rdquo;
        </p>

        <button
          onClick={() => {
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Back to top"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-accent hover:text-accent"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </footer>
  );
}
