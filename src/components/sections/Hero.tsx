"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUpRight, Cpu } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import HeroModel from "@/components/3d/HeroModel";
import profileData from "@/data/profile.json";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

export default function Hero() {
  const [coords, setCoords] = useState({ x: "120.44", y: "084.12", z: "000.00" });

  useEffect(() => {
    let rafId: number;
    let pendingX = 0, pendingY = 0, dirty = false;

    const handleMove = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!dirty) {
        dirty = true;
        rafId = requestAnimationFrame(() => {
          const x = (pendingX * 0.25).toFixed(2).padStart(6, "0");
          const y = (pendingY * 0.25).toFixed(2).padStart(6, "0");
          const z = (window.scrollY * 0.5).toFixed(2).padStart(6, "0");
          setCoords({ x, y, z });
          dirty = false;
        });
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between"
    >
      <Reveal stagger={0.1}>
        {/* Top Telemetry Header Strip */}
        <GlassSurface className="p-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-ink mb-4 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">STATION 01</span>
            <span className="font-bold">SYSTEM WORKSTATION // MANIFEST VERIFIED</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-ink-muted">
            <span>X: {coords.x}mm</span>
            <span>Y: {coords.y}mm</span>
            <span className="text-accent font-semibold">Z_EXPLODE: {coords.z}mm</span>
          </div>
        </GlassSurface>

        {/* Main Modular Control Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-seam bg-surface shadow-xs overflow-hidden">
          {/* Left Column: Structured Industrial Text Panel (Cols 1-7) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 lg:border-r border-b lg:border-b-0 border-seam flex flex-col justify-between bg-surface has-rivets">
            <div>
              {/* Operator Identifier */}
              <div className="flex items-center gap-3 font-mono text-xs text-ink-muted mb-6 border-b border-seam pb-3">
                <span className="text-ink font-bold">OPERATOR: {profileData.name.toUpperCase()}</span>
                <span>/</span>
                <span>HANDLE: {profileData.handle}</span>
                <span>/</span>
                <span className="text-safety-green font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-safety-green inline-block animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Massive Heavy Sans-Serif Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.0] uppercase select-none">
                SYSTEMS <br />
                ENGINEER &amp; <br />
                <span className="text-accent">BUILDER.</span>
              </h1>

              {/* Hardware Manifest Specification Table */}
              <div className="mt-8 border border-seam bg-panel-recess divide-y divide-seam text-xs font-mono">
                <div className="px-4 py-2.5 flex justify-between items-center bg-panel-recess font-bold text-ink">
                  <span>HARDWARE &amp; ARCHITECTURE MANIFEST</span>
                  <span className="text-accent">REV 2025.A</span>
                </div>
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-ink-muted">ACADEMIC UNIT</span>
                  <span className="font-semibold text-ink">VIT CHENNAI &bull; B.TECH CSE '29</span>
                </div>
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-ink-muted">PRIMARY STACK</span>
                  <span className="font-semibold text-ink">POLYGON AMOY / MAPLIBRE / NEXT.JS</span>
                </div>
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-ink-muted">REASONING CORE</span>
                  <span className="font-semibold text-ink">AUTONOMOUS AGENTS &bull; RAG PIPELINES</span>
                </div>
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-ink-muted">OPERATIONAL AVAILABILITY</span>
                  <span className="font-bold text-safety-green">READY FOR HACKATHONS &amp; COLLABORATION</span>
                </div>
              </div>

              {/* Executive Field Summary */}
              <p className="mt-6 text-sm sm:text-base text-ink/80 leading-relaxed font-sans">
                Designing immutable distributed ledgers, zero-latency geospatial infrastructure, and agentic LLM developer tooling. Built for deterministic execution and high fault tolerance.
              </p>
            </div>

            {/* Action Actuators */}
            <div className="mt-10 pt-6 border-t border-seam flex flex-wrap items-center gap-4">
              <InteractiveButton
                as="a"
                href="#projects"
                variant="primary"
                isPrimary={true}
                distort={true}
                className="px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider"
              >
                <span>INSPECT WORK MODULES [04]</span>
                <ArrowDown size={14} />
              </InteractiveButton>

              <InteractiveButton
                as="a"
                href="https://github.com/k-a-r-s-a-n"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-wider"
              >
                <GithubIcon size={15} />
                <span>GITHUB @k-a-r-s-a-n</span>
                <ArrowUpRight size={13} className="text-ink-muted" />
              </InteractiveButton>
            </div>
          </div>

          {/* Right Column: Dedicated CNC 3D Viewport Window (Cols 8-12) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-panel-recess">
            {/* Viewport Machine Window Header */}
            <div className="flex items-center justify-between border-b border-seam pb-3 mb-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-accent" />
                <span className="font-bold text-ink">NODE_ENGINE // 3D VIEWPORT</span>
              </div>
              <span className="badge-zinc">INTERACTIVE 3D</span>
            </div>

            {/* Precision Coordinates Reticle Corner */}
            <div className="relative border border-seam bg-surface shadow-inner overflow-hidden p-2">
              <div className="absolute top-2 left-2 z-10 font-mono text-[9px] text-ink-muted bg-surface/90 px-1.5 py-0.5 border border-seam">
                ROT: PARALLAX_INV
              </div>
              <div className="absolute top-2 right-2 z-10 font-mono text-[9px] text-accent bg-surface/90 px-1.5 py-0.5 border border-seam font-bold">
                SCROLL: EXPLODED VIEW
              </div>

              {/* 3D Exploded View Model */}
              <HeroModel />

              <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between font-mono text-[9px] text-ink-muted bg-surface/90 px-2 py-1 border border-seam">
                <span>TIER: BASE PCB / CPU / BUS</span>
                <span className="text-ink font-bold">DISASSEMBLY ON SCROLL</span>
              </div>
            </div>

            {/* Viewport Instruction Footer */}
            <div className="mt-4 pt-3 border-t border-seam flex items-center justify-between text-[10px] font-mono text-ink-muted">
              <span>ENGINE: THREE.JS 3-POINT STUDIO</span>
              <span className="text-accent font-semibold">DRAG TO INSPECT / SCROLL TO EXPAND</span>
            </div>
          </div>
        </div>

        {/* Bottom Physical Chassis Bar */}
        <GlassSurface className="mt-4 p-3 px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-ink-muted border border-seam">
          <div className="flex items-center gap-6">
            <span>SPEC-01: SOLIDITY L2 ENGINE</span>
            <span>&bull;</span>
            <span>SPEC-02: GEOSPATIAL HEATMAPS</span>
            <span>&bull;</span>
            <span>SPEC-03: VERILOG DIGITAL DESIGN</span>
          </div>
          <a
            href="#about"
            className="inline-flex items-center gap-1.5 text-ink font-bold hover:text-accent transition-colors"
          >
            <span>PROCEED TO COMPONENT SPECIFICATIONS</span>
            <ArrowDown size={13} />
          </a>
        </GlassSurface>
      </Reveal>
    </section>
  );
}
