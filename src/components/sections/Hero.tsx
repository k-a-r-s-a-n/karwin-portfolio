"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import SplitReveal, { useBootedReveal } from "@/components/ui/AnimatedText";
import InteractiveButton from "@/components/ui/InteractiveButton";
import profileData from "@/data/profile.json";

// Three.js stays out of the first-paint bundle.
const HeroScene = dynamic(() => import("@/components/3d/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Entrances wait for the boot curtain, then cascade.
  const eyebrowIn = useBootedReveal(0.15);
  const subIn = useBootedReveal(1.0);
  const actionsIn = useBootedReveal(1.25);
  const cueIn = useBootedReveal(1.8);

  // Scroll progress of the hero feeds the 3D scene (rotation + parallax).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* 3D sculpture layer */}
      <HeroScene scrollProgress={scrollYProgress} />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl py-28"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={eyebrowIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
        >
          <span className="text-accent">✦</span>
          Portfolio 2026
          <span className="h-px w-10 bg-line" />
          Chennai, India
        </motion.p>

        {/* Headline — reveals as the boot curtain lifts */}
        <h1 className="font-serif leading-[0.98] tracking-[-0.01em]">
          <SplitReveal
            as="span"
            trigger="booted"
            delay={0.35}
            segments={[{ text: "Karwin —" }]}
            className="block text-[clamp(3.2rem,10vw,8.5rem)] text-ink"
          />
          <SplitReveal
            as="span"
            trigger="booted"
            delay={0.75}
            segments={[{ text: "systems engineer", className: "italic text-accent" }]}
            className="block text-[clamp(2.4rem,7.5vw,6.5rem)]"
          />
          <SplitReveal
            as="span"
            trigger="booted"
            delay={1.15}
            segments={[{ text: "& builder." }]}
            className="block text-[clamp(2.4rem,7.5vw,6.5rem)] text-ink"
          />
        </h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={subIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          CS student at VIT Chennai building tamper-proof blockchain ledgers,
          geospatial tools, and LLM agents — obsessed with interfaces that
          feel alive.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={actionsIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="pointer-events-auto mt-10 flex flex-wrap items-center gap-4"
        >
          <InteractiveButton as="a" href="#work" variant="primary">
            <span>See the work</span>
            <ArrowDown size={15} />
          </InteractiveButton>
          <InteractiveButton
            as="a"
            href={profileData.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
          >
            <GithubIcon size={15} />
            <span>GitHub</span>
            <ArrowUpRight size={14} />
          </InteractiveButton>

          <span className="ml-1 inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-accent" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Open to hackathons &amp; collabs
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={cueIn ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
          Scroll
        </span>
        <div className="h-10 w-px overflow-hidden bg-line">
          <motion.div
            className="h-1/2 w-px bg-accent"
            animate={{ y: ["-100%", "220%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
