"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import statsData from "@/data/stats.json";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Stats() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const githubBg = isDark ? "141417" : "F4F4F5";
  const githubText = isDark ? "F4F4F5" : "18181B";
  const githubAccent = isDark ? "FF4D36" : "FF3322";

  return (
    <section
      id="stats"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-8 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-04</span>
            <span className="font-bold text-ink">HARDWARE METRICS &amp; AUDIT TRAIL</span>
          </div>
          <a
            href="https://github.com/k-a-r-s-a-n"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ink font-bold hover:text-accent transition-colors"
          >
            <span>GITHUB // @k-a-r-s-a-n</span>
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
                // {stat.label}
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

        {/* Distinction & Hackathon Plaques */}
        <GlassSurface className="mb-12 border border-seam shadow-xs has-rivets">
          <div className="flex items-center justify-between px-6 py-3 bg-panel-recess/80 border-b border-seam font-mono text-xs font-bold text-ink">
            <span>VERIFIED MILESTONES &amp; HARDWARE DISTINCTIONS</span>
            <span className="text-accent">AUDIT REGISTER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-seam">
            {statsData.trophies.map((trophy, idx) => (
              <div
                key={idx}
                className="p-6 flex items-start gap-4 hover:bg-panel-recess/50 transition-colors"
              >
                <span className="badge-orange font-mono">
                  {trophy.rank}
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-ink uppercase leading-snug">
                    {trophy.title}
                  </h4>
                  <p className="font-mono text-xs text-ink-muted mt-1">
                    // {trophy.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassSurface>

        {/* GitHub High-Contrast Telemetry Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* GitHub Commit Metrics */}
          <GlassSurface className="lg:col-span-6 border border-seam p-6 shadow-xs">
            <div className="flex items-center justify-between font-mono text-xs text-ink-muted border-b border-seam pb-3 mb-4">
              <span className="font-bold text-ink">GITHUB COMMIT REGISTER</span>
              <span>USER: k-a-r-s-a-n</span>
            </div>

            <div className="flex justify-center items-center py-2 bg-panel-recess border border-seam overflow-hidden">
              <img
                src={`https://github-readme-stats.vercel.app/api?username=k-a-r-s-a-n&show_icons=true&theme=default&hide_border=true&count_private=true&bg_color=${githubBg}&title_color=${githubText}&text_color=${githubText}&icon_color=${githubAccent}`}
                alt="Karwin's GitHub Stats"
                className="w-full max-w-md object-contain"
                loading="lazy"
              />
            </div>
          </GlassSurface>

          {/* GitHub Streak Stats */}
          <GlassSurface className="lg:col-span-6 border border-seam p-6 shadow-xs">
            <div className="flex items-center justify-between font-mono text-xs text-ink-muted border-b border-seam pb-3 mb-4">
              <span className="font-bold text-ink">STREAK LOG &amp; CONTINUITY</span>
              <span>MEASURED DAYS</span>
            </div>

            <div className="flex justify-center items-center py-2 bg-panel-recess border border-seam overflow-hidden">
              <img
                src={`https://github-readme-streak-stats.herokuapp.com/?user=k-a-r-s-a-n&theme=default&hide_border=true&background=${githubBg}&stroke=${isDark ? "27272A" : "D4D4D8"}&ring=${githubAccent}&fire=${githubAccent}&currStreakLabel=${githubText}&sideNums=${githubText}&sideLabels=${githubText}`}
                alt="Karwin's GitHub Streak"
                className="w-full max-w-md object-contain"
                loading="lazy"
              />
            </div>
          </GlassSurface>

          {/* Contribution Activity Stream */}
          <GlassSurface className="lg:col-span-12 border border-seam p-6 shadow-xs">
            <div className="flex items-center justify-between font-mono text-xs text-ink-muted border-b border-seam pb-3 mb-4">
              <span className="font-bold text-ink">ANNUAL CONTRIBUTION REGISTER</span>
              <span className="badge-zinc">FEED: MAIN</span>
            </div>

            <div className="flex justify-center items-center py-4 bg-panel-recess border border-seam overflow-hidden">
              <img
                alt="GitHub contribution snake"
                src="https://raw.githubusercontent.com/k-a-r-s-a-n/k-a-r-s-a-n/output/github-contribution-grid-snake.svg"
                className="w-full max-w-3xl object-contain"
                loading="lazy"
              />
            </div>
          </GlassSurface>
        </div>
      </Reveal>
    </section>
  );
}
