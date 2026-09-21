"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface TextSegment {
  text: string;
  className?: string;
}

interface SplitRevealProps {
  /** Text segments — use className to style individual words (e.g. italic accent). */
  segments: TextSegment[];
  /** Split granularity: per character or per word. */
  mode?: "chars" | "words";
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** "view" animates when scrolled into view; "booted" waits for the preloader. */
  trigger?: "view" | "booted";
  delay?: number;
  /** Seconds between each char/word. */
  stagger?: number;
  duration?: number;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Coordinates entrance animations with the preloader.
 *
 * Returns `true` once the element should animate in: `delay` seconds after
 * the boot curtain lifts — or after `delay` seconds from mount when the
 * splash was skipped (repeat visit / reduced motion).
 */
export function useBootedReveal(delay = 0) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let armTimer = 0;
    let failsafe = 0;

    const arm = () => {
      armTimer = window.setTimeout(() => setRevealed(true), delay * 1000);
    };

    if (document.documentElement.classList.contains("skip-boot")) {
      arm();
      return () => window.clearTimeout(armTimer);
    }

    window.addEventListener("karwin:booted", arm, { once: true });
    // Safety net: never leave content hidden if the event is missed.
    failsafe = window.setTimeout(() => setRevealed(true), 6500 + delay * 1000);

    return () => {
      window.removeEventListener("karwin:booted", arm);
      window.clearTimeout(armTimer);
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  return revealed;
}

/**
 * Masked type reveal: every char/word rises out of an overflow-hidden line,
 * one after another — the "slowly appearing type" effect.
 *
 * Splitting is done per segment so mixed styling (serif italic accents,
 * colored words) survives the animation.
 */
export default function SplitReveal({
  segments,
  mode = "chars",
  as = "h2",
  trigger = "view",
  delay = 0,
  stagger = 0.028,
  duration = 0.9,
  className = "",
}: SplitRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const [booted, setBooted] = useState(trigger === "view");

  useEffect(() => {
    if (trigger !== "booted") return;
    // Fired by the Preloader when the boot overlay lifts.
    const onBooted = () => setBooted(true);
    window.addEventListener("karwin:booted", onBooted);
    // Safety net: never leave the headline invisible if the event is missed.
    const failsafe = window.setTimeout(() => setBooted(true), 4500);
    return () => {
      window.removeEventListener("karwin:booted", onBooted);
      window.clearTimeout(failsafe);
    };
  }, [trigger]);

  const Tag = as;
  let unitIndex = 0;

  if (shouldReduceMotion) {
    return (
      <Tag className={className}>
        {segments.map((segment, si) => (
          <span key={si} className={segment.className}>
            {segment.text}
          </span>
        ))}
      </Tag>
    );
  }

  // "booted" waits for the preloader's event (animate prop);
  // "view" animates when scrolled into view (whileInView prop).
  // The two are mutually exclusive — mixing them makes content skip the reveal.
  const triggerProps =
    trigger === "booted"
      ? { animate: booted ? { y: "0%", rotate: 0 } : undefined }
      : {
          whileInView: { y: "0%", rotate: 0 },
          viewport: { once: true, margin: "-80px" },
        };

  return (
    <Tag className={className} aria-label={segments.map((s) => s.text).join("")}>
      {segments.map((segment, si) => {
        const units = mode === "chars" ? Array.from(segment.text) : segment.text.split(/(\s+)/);
        return (
          <span key={si} className={segment.className} aria-hidden="true">
            {units.map((unit, ui) => {
              // Whitespace between words stays a plain, unsplittable space.
              if (/^\s+$/.test(unit)) return unit;
              const index = unitIndex++;
              return (
                <span
                  key={ui}
                  className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
                >
                  <motion.span
                    className="inline-block will-change-transform"
                    initial={{ y: "115%", rotate: 4 }}
                    {...triggerProps}
                    transition={{
                      duration,
                      ease: EASE,
                      delay: delay + index * stagger,
                    }}
                  >
                    {unit}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}

interface FadeWordsProps {
  text: string;
  className?: string;
  /** Seconds between words — higher = the paragraph "types in" more slowly. */
  stagger?: number;
  duration?: number;
}

/**
 * Paragraph reveal for scroll: words fade and drift up individually as the
 * block enters the viewport, so long copy appears gradually while scrolling.
 */
export function FadeWords({
  text,
  className = "",
  stagger = 0.016,
  duration = 0.55,
}: FadeWordsProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <p className={className}>{text}</p>;
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };

  const word: Variants = {
    hidden: { opacity: 0.12, y: 8, filter: "blur(3px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: EASE },
    },
  };

  const words = text.split(/(\s+)/);

  return (
    <motion.p
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
    >
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          w
        ) : (
          <motion.span key={i} variants={word} className="inline-block will-change-transform">
            {w}
          </motion.span>
        )
      )}
    </motion.p>
  );
}
