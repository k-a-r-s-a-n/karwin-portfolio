"use client";

import React from "react";
import { ArrowUp, Terminal } from "lucide-react";
import profileData from "@/data/profile.json";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-seam bg-panel-recess/60 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Footer Rack Bar */}
        <GlassSurface className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-seam p-6 shadow-xs has-rivets">
          {/* Machine Unit Identification */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="badge-orange">UNIT CHASSIS</span>
            <div>
              <span className="font-bold text-base text-ink tracking-tight">
                {profileData.name.toUpperCase()}
              </span>
              <span className="text-ink-muted text-xs font-mono ml-2">
                // VIT CHENNAI &bull; CSE '29
              </span>
            </div>
          </div>

          {/* Architecture Build Specs */}
          <div className="font-mono text-xs text-ink-muted flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-ink font-semibold">
              <Terminal size={13} className="text-accent" />
              SPEC: NEXT.JS 16 &bull; TURBOPACK &bull; THREE.JS &bull; TAILWIND &bull; LENIS
            </span>
          </div>

          {/* Top of Console Button */}
          <InteractiveButton
            onClick={scrollToTop}
            variant="secondary"
            className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider"
          >
            <span>RETURN TO TOP</span>
            <ArrowUp size={13} />
          </InteractiveButton>
        </GlassSurface>

        {/* Lower Diagnostic Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-muted px-2">
          <div>
            &copy; {new Date().getFullYear()} {profileData.name.toUpperCase()} &bull; ALL HARDWARE REGISTERS &amp; CODEBASES CERTIFIED
          </div>
          <div className="text-[11px] italic text-ink/70">
            "{profileData.quote}"
          </div>
        </div>
      </div>
    </footer>
  );
}
