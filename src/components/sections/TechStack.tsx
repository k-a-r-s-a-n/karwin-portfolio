"use client";

import React, { useState } from "react";
import rawSkills from "@/data/skills.json";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";

export default function TechStack() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = rawSkills.categories;
  const inProgress = rawSkills.inProgress;

  const filteredCategories =
    selectedCategory === "all"
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  return (
    <section
      id="skills"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        <h2 className="sr-only">Tech stack and current learning</h2>

        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-8 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-03</span>
            <span className="font-bold text-ink">HARDWARE MATRIX &amp; FLUENCY SPEC</span>
          </div>

          {/* Category Filter as segmented buttons */}
          <div className="flex flex-wrap items-center border border-seam divide-x divide-seam bg-panel-recess">
            <button
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`px-3 py-1 font-mono text-xs uppercase font-semibold transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-ink text-surface"
                  : "text-ink/70 hover:bg-surface"
              }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-3 py-1 font-mono text-xs uppercase font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-ink text-surface"
                    : "text-ink/70 hover:bg-surface"
                }`}
              >
                {cat.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </GlassSurface>

        {/* Specification Tables by Category */}
        <div className="flex flex-col gap-8">
          {filteredCategories.map((category) => (
            <GlassSurface key={category.id} className="border border-seam shadow-xs has-rivets">
              {/* Category Header */}
              <div className="flex items-center justify-between px-6 py-3 bg-panel-recess/80 border-b border-seam font-mono text-xs font-bold text-ink">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent" />
                  <span>MODULE // {category.name.toUpperCase()}</span>
                </div>
                <span className="text-ink-muted text-[11px]">
                  {category.skills.length} INSTRUMENTS VERIFIED
                </span>
              </div>

              {/* Matrix Table Rows */}
              <div className="divide-y divide-seam">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-panel-recess/50 transition-colors"
                  >
                    {/* Tool Name */}
                    <div className="md:col-span-3 font-mono text-sm font-bold text-ink">
                      {skill.name}
                    </div>

                    {/* Milled Progress Bar in Safety Orange */}
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-panel-recess border border-seam overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-ink w-12 text-right">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Application Note */}
                    <div className="md:col-span-5 font-mono text-xs text-ink-muted">
                      {"//"} {skill.highlight}
                    </div>
                  </div>
                ))}
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* Active Research & Learning Vectors Drawer */}
        <GlassSurface className="mt-10 border border-ink shadow-xs has-rivets p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-seam pb-3 mb-6">
            <div className="flex items-center gap-2 font-mono text-xs text-accent font-bold uppercase">
              <span className="w-2 h-2 bg-accent" />
              <span>ACTIVE RESEARCH &amp; LEARNING VECTORS</span>
            </div>
            <span className="badge-zinc">CONTINUOUS DEPLOYMENT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inProgress.map((item, idx) => (
              <div key={idx} className="border border-seam bg-panel-recess p-4">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-ink">{item.subject}</span>
                  <span className="text-accent font-bold">{item.progress}%</span>
                </div>
                <div className="font-mono text-[10px] text-ink-muted uppercase mb-3">
                  DOMAIN: {item.badge}
                </div>
                <div className="w-full h-1.5 bg-panel-recess border border-seam overflow-hidden">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassSurface>
      </Reveal>
    </section>
  );
}
