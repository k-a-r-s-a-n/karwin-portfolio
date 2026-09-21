"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, ArrowUpRight, Radio, Shield, Terminal } from "lucide-react";
import { GithubIcon, InstagramIcon } from "@/components/ui/Icons";
import profileData from "@/data/profile.json";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [istTime, setIstTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setIstTime(now.toLocaleTimeString("en-GB", options));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or insecure context — fall back to the
      // legacy path so the button still does something useful.
      const textarea = document.createElement("textarea");
      textarea.value = profileData.email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.location.href = `mailto:${profileData.email}`;
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-8 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-05</span>
            <span className="font-bold text-ink">SIGNAL TRANSMITTER &amp; DISPATCH</span>
          </div>
          <div className="text-ink-muted text-[11px] flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-safety-green font-semibold">
              <Radio size={12} className="animate-pulse" />
              RECEIVER ACTIVE
            </span>
            <span>&bull;</span>
            <span>BAUD: 115200</span>
          </div>
        </GlassSurface>

        {/* Main Signal Transmitter Console */}
        <div className="border border-seam bg-surface shadow-xs overflow-hidden">
          {/* Console Header Bar */}
          <div className="bg-panel-recess border-b border-seam px-6 py-3 flex items-center justify-between text-xs font-mono text-ink">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-accent" />
              <span className="font-bold tracking-wider">UNIT: TRANS-SYS-05 // DIRECT LINK</span>
            </div>
            <div className="text-ink-muted text-[11px]">
              PROTOCOL: INBOX_RELAY_V2
            </div>
          </div>

          {/* 2-Column Console Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-seam">
            {/* Left Column: Primary Electronic Mail Dispatch (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between has-rivets bg-surface">
              <div>
                <div className="font-mono text-xs text-ink-muted uppercase mb-2 flex items-center gap-2">
                  <Terminal size={14} className="text-accent" />
                  <span>PRIMARY TELEMETRY DESTINATION</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight uppercase mb-4">
                  OPEN CHANNELS // INITIATE TRANSMISSION
                </h2>

                <p className="text-sm sm:text-base text-ink/80 leading-relaxed mb-8 font-sans">
                  Available for engineering high-integrity Web3 systems, autonomous agentic workflows, geospatial telemetry applications, and collegiate hackathons. Responses dispatched within 24 operational hours.
                </p>

                {/* Direct Address Display Box */}
                <div className="p-4 sm:p-5 bg-panel-recess border border-seam mb-6">
                  <div className="font-mono text-[10px] text-ink-muted uppercase mb-1">
                    CARRIER ADDRESS
                  </div>
                  <div className="font-mono text-lg sm:text-2xl font-bold text-ink select-all break-all">
                    {profileData.email}
                  </div>
                </div>

                {/* Push Action Actuators */}
                <div className="flex flex-wrap gap-4" aria-live="polite">
                  <InteractiveButton
                    onClick={copyEmail}
                    variant="primary"
                    isPrimary={true}
                    distort={true}
                    className="px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-white" />
                        <span>COPIED TO BUFFER</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>COPY ADDRESS</span>
                      </>
                    )}
                  </InteractiveButton>

                  <InteractiveButton
                    as="a"
                    href={`mailto:${profileData.email}`}
                    variant="outline"
                    className="px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    <span>LAUNCH COMPOSER</span>
                    <ArrowUpRight size={16} />
                  </InteractiveButton>
                </div>
              </div>

              {/* Security & Verification Footer */}
              <div className="mt-8 pt-6 border-t border-seam flex items-center gap-4 text-[11px] font-mono text-ink-muted">
                <Shield size={14} className="text-safety-green" />
                <span>END-TO-END TLS VERIFIED &bull; SPAM FILTER ACTIVE &bull; DIRECT RELAY</span>
              </div>
            </div>

            {/* Right Column: Auxiliary Channels & Operator Node (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-panel-recess/60">
              <div>
                <div className="font-mono text-xs text-ink-muted uppercase mb-4">
                  {"//"} AUXILIARY REGISTRIES &amp; BUS NODES
                </div>

                <div className="space-y-4 mb-8">
                  {/* GitHub */}
                  <a
                    href={profileData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-seam bg-surface hover:border-ink transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <GithubIcon size={20} className="text-ink" />
                      <div>
                        <div className="font-mono text-xs font-bold text-ink group-hover:text-accent transition-colors">
                          GITHUB REGISTRY
                        </div>
                        <div className="font-mono text-[11px] text-ink-muted">
                          @{profileData.handle} &bull; REPOS &amp; AUDITS
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-ink-muted group-hover:text-accent transition-colors" />
                  </a>

                  {/* Instagram */}
                  <a
                    href={profileData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-seam bg-surface hover:border-ink transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <InstagramIcon size={20} className="text-ink" />
                      <div>
                        <div className="font-mono text-xs font-bold text-ink group-hover:text-accent transition-colors">
                          INSTAGRAM
                        </div>
                        <div className="font-mono text-[11px] text-ink-muted">
                          @krsc_26307 &bull; OCCASIONAL DISPATCHES
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-ink-muted group-hover:text-accent transition-colors" />
                  </a>
                </div>

                {/* Node Telemetry Box */}
                <div className="border border-seam bg-surface p-5 space-y-3 font-mono text-xs">
                  <div className="text-[10px] text-ink-muted uppercase font-bold border-b border-seam pb-2">
                    OPERATOR TELEMETRY
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span className="text-ink-muted">COORDINATES:</span>
                    <span className="font-semibold">12.8406° N, 80.1534° E</span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span className="text-ink-muted">TIMEZONE:</span>
                    <span className="font-semibold">IST (UTC+05:30)</span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span className="text-ink-muted">LOCAL CLOCK:</span>
                    <span className="font-bold text-accent" suppressHydrationWarning>
                      {istTime || "12:00:00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span className="text-ink-muted">STATUS:</span>
                    <span className="text-safety-green font-bold">ACCEPTING INCOMING DISPATCH</span>
                  </div>
                </div>
              </div>

              {/* Calibration Plate */}
              <div className="mt-8 pt-4 border-t border-seam text-[10px] font-mono text-ink-muted flex items-center justify-between">
                <span>SERIAL: TR-2026-CH05</span>
                <span>CALIBRATED: 0.002mm</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
