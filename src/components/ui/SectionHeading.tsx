"use client";

import React from "react";
import SplitReveal from "@/components/ui/AnimatedText";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  lead: string;
  accent: string;
  tail?: string;
  className?: string;
}

/**
 * Consistent section opener: mono index label, then a large serif headline
 * that reveals word-by-word on scroll, with an italic accent phrase.
 */
export default function SectionHeading({
  index,
  eyebrow,
  lead,
  accent,
  tail,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line" />
        {eyebrow}
      </p>
      <SplitReveal
        mode="words"
        stagger={0.06}
        segments={[
          { text: lead, className: "text-ink" },
          { text: ` ${accent}`, className: "italic text-accent" },
          ...(tail ? [{ text: tail, className: "text-ink" }] : []),
        ]}
        className="font-serif text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1.05]"
      />
    </div>
  );
}
