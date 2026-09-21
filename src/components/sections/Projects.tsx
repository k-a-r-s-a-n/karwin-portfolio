"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import rawProjects from "@/data/projects.json";
import ProjectModal, { ProjectData } from "@/components/ui/ProjectModal";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";

const projects = rawProjects as unknown as ProjectData[];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  return (
    <section id="work" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          lead="Things I've"
          accent="built."
        />

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.id} y={36} className={index % 2 === 1 ? "md:mt-16" : ""}>
              <TiltCard maxTilt={5}>
                <article
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Cover — image pushes back in 3D while the card tilts */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface"
                    style={{ transform: "translateZ(0)" }}
                  >
                    <Image
                      src={project.coverImage}
                      alt={`${project.title} — project cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                    {/* Hover wash */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
                        Open dossier
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-bg">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                        }}
                        className="text-left font-serif text-2xl text-ink transition-colors duration-200 hover:text-accent sm:text-3xl"
                      >
                        {project.title}
                      </button>
                      <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
                    </div>
                    <span className="mt-2 shrink-0 font-mono text-[11px] tracking-widest text-faint">
                      {project.year}
                    </span>
                  </div>

                  {/* Tags — quiet, mono, dotted */}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    {project.tags.join(" · ")}
                  </p>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
}
