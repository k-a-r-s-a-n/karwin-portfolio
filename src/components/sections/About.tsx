"use client";

import React from "react";
import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import profileData from "@/data/profile.json";
import SectionHeading from "@/components/ui/SectionHeading";
import { FadeWords } from "@/components/ui/AnimatedText";
import Reveal from "@/components/ui/Reveal";

export default function About() {
  const { education, mission, location } = profileData;

  return (
    <section id="about" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="01"
          eyebrow="About"
          lead="Serious engineering,"
          accent="played with joy."
        />

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12">
          {/* Narrative — words surface one by one as you scroll */}
          <div className="lg:col-span-8">
            <FadeWords
              text={profileData.bio}
              className="text-xl leading-relaxed text-ink/90 sm:text-2xl sm:leading-relaxed"
            />
            <FadeWords
              text={mission}
              stagger={0.012}
              className="mt-8 max-w-2xl text-base leading-relaxed text-muted"
            />

            <Reveal className="mt-10" y={16}>
              <p className="flex items-center gap-2 font-serif text-lg italic text-accent">
                <Sparkles size={16} className="shrink-0" />
                {profileData.quote}
              </p>
            </Reveal>
          </div>

          {/* Facts column — hairlines, no boxes */}
          <div className="lg:col-span-4">
            <Reveal className="flex h-full flex-col justify-between gap-10" y={20}>
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  Education
                </p>
                <ul className="space-y-6">
                  {education.map((edu) => (
                    <li key={edu.institution} className="border-t border-line pt-4">
                      <div className="flex items-start gap-3">
                        <GraduationCap size={16} className="mt-1 shrink-0 text-accent" />
                        <div>
                          <p className="font-medium text-ink">{edu.institution}</p>
                          <p className="mt-0.5 text-sm text-muted">{edu.degree}</p>
                          <p className="mt-1 font-mono text-[11px] tracking-wider text-faint">
                            {edu.period}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  Now
                </p>
                <div className="space-y-3 border-t border-line pt-4 text-sm">
                  <p className="flex items-center gap-3 text-muted">
                    <MapPin size={15} className="shrink-0 text-accent" />
                    {location}
                  </p>
                  <p className="flex items-center gap-3 text-muted">
                    <span className="relative flex h-2 w-2">
                      <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-accent" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    {profileData.status}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
