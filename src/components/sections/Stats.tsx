"use client";

import React from "react";
import { ArrowUpRight, Star, GitBranch, CalendarDays, Layers } from "lucide-react";
import statsData from "@/data/stats.json";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

/**
 * CH-04 — Metrics.
 *
 * This section previously embedded three third-party images (github-readme-
 * stats, a Heroku streak app that no longer exists, and a contribution-snake
 * SVG). Each was an external uptime dependency rendering between the visitor
 * and the data, and none worked offline. The panel below states verifiable
 * facts that live with the code, and hands off to the GitHub profile for
 * anything live.
 */
export default function Stats() {
  const { github } = statsData;

  const registerCells = [
    {
      icon: GitBranch,
      label: "PUBLIC REPOSITORIES",
      value: String(github.publicRepos),
      note: "All open source, all inspectable",
    },
    {
      icon: Layers,
      label: "PRIMARY LANGUAGES",
      value: github.topLanguages[0],
      note: github.topLanguages.slice(1).join(" · "),
    },
    {
      icon: CalendarDays,
      label: "BUILDING SINCE",
      value: github.since,
      note: "First public commit to today",
    },
    {
      icon: Star,
      label: "FLAGSHIP BUILDS",
      value: "04",
      note: "Blockchain · Maps · AI · Mobile",
    },
  ];

  return (
    <section
      id="stats"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        <h2 className="sr-only">Metrics and build register</h2>

        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-8 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-04</span>
            <span className="font-bold text-ink">HARDWARE METRICS &amp; BUILD REGISTERS</span>
          </div>
          <a
            href={`https://github.com/${statsData.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ink font-bold hover:text-accent transition-colors"
          >
            <span>GITHUB {"//"} @{statsData.githubUsername}</span>
            <ArrowUpRight size={13} />
          </a>
        </GlassSurface>

        {/* Primary Key Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.stats.map((stat, idx) => (
            <GlassSurface
              key={idx}
              className="p-6 shadow-xs flex flex-col justify-between has-rivets border border-seam"
            >
              <div className="font-mono text-[10px] text-ink-muted uppercase font-bold tracking-wider mb-3">
                {"//"} {stat.label}
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-ink tracking-tight mb-2">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-ink-muted">
                {stat.detail}
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* GitHub Activity Panel — self-contained, no third-party image pins */}
        <GlassSurface className="mb-12 border border-seam shadow-xs has-rivets">
          <div className="flex items-center justify-between px-6 py-3 bg-panel-recess/80 border-b border-seam font-mono text-xs font-bold text-ink">
            <span>{github.label}</span>
            <span className="text-accent">LIVE FEED {"//"} EXTERNAL</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-seam">
            {registerCells.map((cell) => (
              <div key={cell.label} className="p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-mono text-[10px] text-ink-muted uppercase font-bold tracking-wider">
                  <cell.icon size={13} className="text-accent" />
                  {cell.label}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-ink truncate">
                  {cell.value}
                </div>
                {cell.note && (
                  <div className="font-mono text-[11px] text-ink-muted">{cell.note}</div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-seam px-6 py-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-ink-muted">
            <span>{github.note}</span>
            <InteractiveButton
              as="a"
              href={`https://github.com/${statsData.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              className="px-3 py-1.5 uppercase font-bold text-xs"
            >
              <span>OPEN LIVE REGISTER</span>
              <ArrowUpRight size={13} />
            </InteractiveButton>
          </div>
        </GlassSurface>

        {/* Build Registers — the four flagship modules, cross-referenced */}
        <GlassSurface className="border border-seam shadow-xs has-rivets">
          <div className="flex items-center justify-between px-6 py-3 bg-panel-recess/80 border-b border-seam font-mono text-xs font-bold text-ink">
            <span>FLAGSHIP BUILD REGISTERS</span>
            <span className="text-accent">CROSS-REF CH-02</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-seam">
            {statsData.builds.map((build, idx) => (
              <div
                key={idx}
                className="p-6 flex items-start gap-4 hover:bg-panel-recess/50 transition-colors"
              >
                <span className="badge-orange font-mono">
                  {build.ref}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-ink uppercase leading-snug">
                    {build.title}
                  </h3>
                  <p className="font-mono text-xs text-ink-muted mt-1">
                    {"//"} {build.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassSurface>
      </Reveal>
    </section>
  );
}
