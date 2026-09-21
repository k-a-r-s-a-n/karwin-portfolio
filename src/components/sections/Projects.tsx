"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import Image from "next/image";
import rawProjects from "@/data/projects.json";
import ProjectModal, { ProjectData } from "@/components/ui/ProjectModal";
import Reveal from "@/components/ui/Reveal";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

const projects = rawProjects as unknown as ProjectData[];

const PROJECT_COUNT_LABEL = `${String(projects.length).padStart(2, "0")} ACTIVE CASSETTES`;

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-8 max-w-7xl mx-auto"
    >
      <Reveal stagger={0.08}>
        <h2 className="sr-only">Projects</h2>

        {/* Section Header Bar */}
        <GlassSurface className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono mb-8 border border-seam">
          <div className="flex items-center gap-3">
            <span className="badge-orange">CH-02</span>
            <span className="font-bold text-ink">HARDWARE TESTBENCHES &amp; WORK MODULES</span>
          </div>
          <div className="text-ink-muted text-[11px]">
            <span>INDEX: {PROJECT_COUNT_LABEL}</span>
            <span className="mx-2">&bull;</span>
            <span className="text-safety-green font-semibold">ALL COMPLIANT</span>
          </div>
        </GlassSurface>

        {/* Projects Cassette Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const modNum = (index + 1).toString().padStart(2, "0");

            return (
              <GlassSurface
                key={project.id}
                as="article"
                className="p-6 sm:p-8 flex flex-col justify-between shadow-xs has-rivets group border border-seam hover:border-ink transition-colors"
              >
                <div>
                  {/* Module Serial Tag */}
                  <div className="flex items-center justify-between font-mono text-xs text-ink-muted border-b border-seam pb-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="badge-orange">MOD-{modNum}</span>
                      <span className="font-bold text-ink uppercase">{project.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span>YR: {project.year}</span>
                      <span>&bull;</span>
                      <span className="text-safety-green font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-safety-green" />
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Industrial Media Frame */}
                  <div
                    onClick={() => setSelectedProject(project)}
                    className="relative w-full aspect-[16/10] border border-seam bg-panel-recess p-2 overflow-hidden cursor-pointer group-hover:border-accent transition-colors mb-6"
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute top-3 left-3 bg-ink/90 text-surface font-mono text-[9px] px-2 py-0.5 uppercase font-bold tracking-wider">
                      MODULE CASSETTE #{modNum}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-ink uppercase mb-2 cursor-pointer group-hover:text-accent transition-colors"
                  >
                    {project.title}
                  </h3>

                  <div className="font-mono text-xs text-ink-muted mb-4 font-semibold">
                    {"//"} {project.subtitle}
                  </div>

                  <p className="text-sm text-ink/75 leading-relaxed font-sans mb-6">
                    {project.description}
                  </p>

                  {/* Tech Bracketed Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6 font-mono text-[11px]">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-panel-recess text-ink border border-seam font-medium"
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-seam flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <InteractiveButton
                    onClick={() => setSelectedProject(project)}
                    variant="primary"
                    isPrimary={true}
                    className="px-4 py-2 uppercase font-bold text-xs"
                  >
                    <span>INSPECT TESTBENCH DOSSIER</span>
                    <ArrowUpRight size={14} />
                  </InteractiveButton>

                  <InteractiveButton
                    as="a"
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    className="px-3 py-1.5 text-ink-muted hover:text-ink"
                  >
                    <GithubIcon size={14} />
                    <span>REPO</span>
                  </InteractiveButton>
                </div>
              </GlassSurface>
            );
          })}
        </div>
      </Reveal>

      {/* Inspection Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
