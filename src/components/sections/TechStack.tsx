"use client";

import React from "react";
import rawSkills from "@/data/skills.json";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: string[];
  direction: "left" | "right";
  duration: number;
}) {
  // Content is duplicated so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden py-3">
      <div
        className={`marquee-track marquee-${direction}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        aria-hidden="true"
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className="px-6 font-serif text-3xl text-ink/85 sm:text-4xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
          </span>
        ))}
      </div>
      {/* Screen readers get the plain list once */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TechStack() {
  const { marquee, marqueeAlt, learning } = rawSkills;

  return (
    <section id="stack" className="relative overflow-hidden py-28">
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            index="03"
            eyebrow="Toolkit"
            lead="Weapons of"
            accent="choice."
          />
        </div>
      </div>

      <Reveal className="mt-14" y={24}>
        <MarqueeRow items={marquee} direction="left" duration={46} />
        <MarqueeRow items={marqueeAlt} direction="right" duration={54} />
      </Reveal>

      <Reveal className="px-6 sm:px-10 lg:px-16" y={16}>
        <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Currently exploring
          </span>
          {learning.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
