"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import statsData from "@/data/stats.json";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      // Reduced motion: land on the final number immediately.
      duration: shouldReduceMotion ? 0.01 : 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, shouldReduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { metrics, githubUsername, github } = statsData;

  return (
    <section id="stats" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="04"
          eyebrow="Numbers"
          lead="Receipts, not"
          accent="promises."
        />

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
          {metrics.map((metric, idx) => (
            <Reveal key={metric.label} y={24} delay={idx * 0.06}>
              <div className="border-t border-line pt-6">
                <p className="font-serif text-5xl text-ink sm:text-6xl">
                  {metric.static ? (
                    <span className="tabular-nums">{metric.value}</span>
                  ) : (
                    <CountUp to={metric.value} suffix={metric.suffix} />
                  )}
                </p>
                <p className="mt-3 text-sm font-medium text-ink">{metric.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  {metric.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Hand-off to the live register */}
        <Reveal y={20} className="mt-20">
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border-t border-line pt-6 transition-colors hover:border-accent/60"
          >
            <div>
              <p className="font-serif text-xl text-ink transition-colors group-hover:text-accent sm:text-2xl">
                The live register, on GitHub
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                {github.note}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">
              <ArrowUpRight size={17} />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
