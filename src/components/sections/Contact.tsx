"use client";

import React, { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { GithubIcon, InstagramIcon } from "@/components/ui/Icons";
import profileData from "@/data/profile.json";
import SplitReveal from "@/components/ui/AnimatedText";
import Reveal from "@/components/ui/Reveal";
import SplashField from "@/components/ui/SplashField";

/**
 * CH-05 — Contact, done as a full-bleed color-block finale (lusion-style):
 * giant type over a playable field of liquid-confetti shapes. Stir the
 * cursor through them and they scatter; stop, and they rain back down and
 * settle like sand.
 */
export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileData.email);
    } catch {
      // Clipboard API unavailable — fall back to a hidden textarea.
      const textarea = document.createElement("textarea");
      textarea.value = profileData.email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        window.location.href = `mailto:${profileData.email}`;
      }
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ink = "text-[#0c0c0d]";
  const inkMuted = "text-[#0c0c0d]/65";
  const inkFaint = "text-[#0c0c0d]/45";

  return (
    <section
      id="contact"
      className="relative min-h-[100svh] overflow-hidden bg-accent"
      aria-label="Contact"
    >
      {/* Playable liquid-confetti field */}
      <SplashField className="absolute inset-0 h-full w-full" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col px-6 pb-16 pt-24 sm:px-10 sm:pt-28 lg:px-16">
        <Reveal y={14}>
          <p
            className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] ${inkFaint}`}
          >
            <span className={ink}>05</span>
            <span className="h-px w-8 bg-[#0c0c0d]/30" />
            Contact — Chennai, IN
          </p>
        </Reveal>

        {/* Headline */}
        <h2 className={`mt-10 font-serif leading-[0.95] ${ink}`}>
          <SplitReveal
            as="span"
            mode="words"
            stagger={0.08}
            segments={[{ text: "Let's build", className: ink }]}
            className="block text-[clamp(2.9rem,8.5vw,7rem)]"
          />
          <SplitReveal
            as="span"
            mode="words"
            stagger={0.08}
            delay={0.12}
            segments={[{ text: "something", className: "italic text-[#f2f1ec]" }]}
            className="block text-[clamp(2.9rem,8.5vw,7rem)]"
          />
          <SplitReveal
            as="span"
            mode="words"
            stagger={0.08}
            delay={0.24}
            segments={[{ text: "together.", className: ink }]}
            className="block text-[clamp(2.9rem,8.5vw,7rem)]"
          />
        </h2>

        {/* Sub-copy + email */}
        <div className="mt-auto pt-16">
          <Reveal y={18}>
            <p className={`max-w-md text-base leading-relaxed ${inkMuted}`}>
              Hackathons, internships, weird ideas at 2 AM — if it ends with
              something real shipped, my inbox is open.
            </p>
          </Reveal>

          <Reveal y={18} delay={0.08} className="mt-6">
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${profileData.email}`}
                className={`link-sweep break-all font-serif text-xl sm:text-3xl ${ink}`}
              >
                {profileData.email}
              </a>
              <button
                onClick={copyEmail}
                aria-label={copied ? "Email copied" : "Copy email address"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  copied
                    ? "border-[#0c0c0d] bg-[#0c0c0d] text-accent"
                    : "border-[#0c0c0d]/35 text-[#0c0c0d] hover:border-[#0c0c0d] hover:bg-[#0c0c0d] hover:text-accent"
                }`}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <span
                aria-live="polite"
                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${inkFaint}`}
              >
                {copied ? "Copied" : ""}
              </span>
            </div>
          </Reveal>

          {/* Socials + hint */}
          <Reveal y={16} delay={0.14} className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <a
                href={profileData.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${ink} border-[#0c0c0d]/35 hover:bg-[#0c0c0d] hover:text-accent`}
              >
                <GithubIcon size={16} />
              </a>
              <a
                href={profileData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${ink} border-[#0c0c0d]/35 hover:bg-[#0c0c0d] hover:text-accent`}
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={`mailto:${profileData.email}`}
                className={`ml-2 inline-flex items-center gap-2 rounded-full bg-[#0c0c0d] px-5 py-2.5 text-sm font-medium text-[#f2f1ec] transition-transform hover:scale-[1.03] active:scale-[0.98]`}
              >
                <Mail size={14} />
                Say hello
              </a>
            </div>

            <p
              className={`font-mono text-[10px] uppercase tracking-[0.22em] ${inkFaint}`}
            >
              psst — move your cursor through the shapes
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
