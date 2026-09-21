"use client";

import React, { useState } from "react";
import { Check, Copy, Mail, ArrowUpRight } from "lucide-react";
import { GithubIcon, InstagramIcon } from "@/components/ui/Icons";
import profileData from "@/data/profile.json";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import InteractiveButton from "@/components/ui/InteractiveButton";

const SOCIALS = [
  { label: "GitHub", href: profileData.github, icon: GithubIcon },
  { label: "Instagram", href: profileData.instagram, icon: InstagramIcon },
];

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

  return (
    <section id="contact" className="relative px-6 pb-16 pt-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="05"
          eyebrow="Contact"
          lead="Let's build something"
          accent="together."
        />

        <Reveal y={24} className="mt-14">
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Hackathons, internships, weird ideas at 2 AM — if it involves
            shipping something real, my inbox is open.
          </p>
        </Reveal>

        <Reveal y={24} delay={0.08} className="mt-10">
          {/* Email — the centerpiece */}
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={`mailto:${profileData.email}`}
              className="link-sweep break-all font-serif text-2xl text-ink sm:text-4xl"
            >
              {profileData.email}
            </a>
            <button
              onClick={copyEmail}
              aria-label={copied ? "Email copied" : "Copy email address"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-accent hover:text-accent"
            >
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
            </button>
            <span aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              {copied ? "Copied to clipboard" : ""}
            </span>
          </div>
        </Reveal>

        <Reveal y={20} delay={0.14} className="mt-10 flex flex-wrap items-center gap-4">
          <InteractiveButton as="a" href={`mailto:${profileData.email}`} variant="primary">
            <Mail size={15} />
            <span>Send a message</span>
          </InteractiveButton>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-accent hover:text-accent"
              >
                <Icon size={16} />
              </a>
            ))}
            <a
              href={profileData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group ml-2 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
            >
              <span className="link-sweep">@{profileData.handle}</span>
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
