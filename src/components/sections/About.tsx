"use client";

import React from "react";
import profileData from "@/data/profile.json";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";

const ARCHITECTURE_STEPS = [
  {
    step: "01",
    label: "FORMAL DECONSTRUCTION",
    desc: "Deconstruct system architectures into formal constraints, cryptographic invariants, and failure boundaries prior to implementation.",
  },
  {
    step: "02",
    label: "AGENTIC SYNTHESIS",
    desc: "Accelerate development using autonomous LLM reasoning pipelines for contract drafting, schema iteration, and testbench generation.",
  },
  {
    step: "03",
    label: "INVARIANT & BOUNDARY AUDIT",
    desc: "Exhaustive stress-testing of state transitions, reentrancy vulnerabilities, and geospatial query edge cases.",
  },
  {
    step: "04",
    label: "DETERMINISTIC DEPLOYMENT",
    desc: "Ship immutable bytecode to Polygon Amoy L2, distributed edge CDNs, and offline-first mobile runtimes.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-6 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-01</span>
            <span className="font-bold text-ink">SUBSYSTEM OPERATOR // DOSSIER</span>
          </div>
          <span className="text-ink-muted">SPEC ID: KARWIN-SPEC-2025</span>
        </GlassSurface>

        {/* Main Two-Column Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-seam bg-surface shadow-xs overflow-hidden">
          {/* Left Column: Narrative & Process (Cols 1-7) */}
          <div className="lg:col-span-7 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-seam flex flex-col justify-between has-rivets bg-surface">
            <div>
              <div className="text-xs font-mono text-accent font-bold uppercase mb-2">
                // PROFILE &amp; PHILOSOPHY
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink uppercase mb-6">
                Engineering with <br />
                <span className="text-accent">Deterministic Rigor.</span>
              </h2>

              <p className="text-base sm:text-lg text-ink/85 leading-relaxed font-sans mb-6">
                {profileData.bio}
              </p>

              <p className="text-sm sm:text-base text-ink/75 leading-relaxed font-sans">
                Currently advancing studies in Computer Science and Engineering at VIT Chennai (Class of 2029).
                My engineering focus centers on tamper-proof smart contracts, distributed geospatial coordination,
                and low-friction tooling built with high mechanical precision.
              </p>

              {/* 4-Step Engineering Pipeline */}
              <div className="mt-10 pt-8 border-t border-seam">
                <div className="text-xs font-mono text-ink font-bold uppercase mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent" />
                  <span>EXECUTION PIPELINE SPECIFICATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ARCHITECTURE_STEPS.map((item) => (
                    <div
                      key={item.step}
                      className="border border-seam bg-panel-recess p-4 flex flex-col justify-between transition-colors hover:border-accent"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge-orange">{item.step}</span>
                          <span className="text-[10px] font-mono text-ink-muted">VERIFIED</span>
                        </div>
                        <h3 className="font-mono text-xs font-bold text-ink mb-2 uppercase">
                          {item.label}
                        </h3>
                        <p className="text-xs text-ink/70 font-sans leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stamped Equipment Rating Plate (Cols 8-12) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-panel-recess flex flex-col justify-between">
            <GlassSurface className="p-6 border border-seam shadow-xs has-rivets">
              {/* Equipment Rating Header */}
              <div className="border-b-2 border-ink pb-3 mb-6 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
                    EQUIPMENT SPECIFICATION PLATE
                  </div>
                  <div className="font-mono text-base font-bold text-ink">
                    OPERATOR // RATING SHEET
                  </div>
                </div>
                <span className="badge-orange">GRADE A</span>
              </div>

              {/* Spec Key-Value Table */}
              <div className="divide-y divide-seam font-mono text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">NAME</span>
                  <span className="font-bold text-ink">{profileData.name}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">INSTITUTION</span>
                  <span className="font-semibold text-ink">VIT Chennai</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">CURRICULUM</span>
                  <span className="font-semibold text-ink">B.Tech CSE (2025–2029)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">BLOCKCHAIN BUS</span>
                  <span className="font-semibold text-accent">Polygon Amoy L2</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">HARDWARE SYNTHESIS</span>
                  <span className="font-semibold text-ink">Verilog / Digital IC</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">COORDINATES</span>
                  <span className="font-semibold text-ink">12.8406° N, 80.1534° E</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-ink-muted">STATUS</span>
                  <span className="font-bold text-safety-green">AVAILABLE FOR HACKATHONS</span>
                </div>
              </div>

              {/* Academic Qualifications List */}
              <div className="mt-6 pt-4 border-t border-seam">
                <div className="font-mono text-[10px] text-ink-muted uppercase mb-3 font-bold">
                  ACADEMIC ACCREDITATION LOG
                </div>
                {profileData.education.map((edu, idx) => (
                  <div key={idx} className="mb-4 last:mb-0 border-l-2 border-ink pl-3 py-0.5">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span className="font-bold text-ink">{edu.institution}</span>
                      <span className="text-accent text-[10px] font-bold">{edu.period}</span>
                    </div>
                    <div className="text-xs text-ink/80 font-sans">{edu.degree}</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5">{edu.focus}</div>
                  </div>
                ))}
              </div>
            </GlassSurface>

            {/* Hackathon Unit Dispatch Callout */}
            <div className="mt-6 border border-accent bg-surface p-4">
              <div className="flex items-center gap-2 font-mono text-xs text-accent font-bold uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>RAPID RESPONSE HACKATHON UNIT</span>
              </div>
              <p className="text-xs text-ink/75 font-sans leading-relaxed">
                Equipped for high-velocity 24h–48h hackathons: immediate contract deployment, GIS map tile generation, and end-to-end full-stack frontend iteration.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
