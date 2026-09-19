"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import Image from "next/image";
import GlassSurface from "@/components/ui/GlassSurface";
import InteractiveButton from "@/components/ui/InteractiveButton";

export interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  tags: string[];
  category: string;
  year: string;
  status: string;
  github: string;
  liveUrl: string;
  coverImage: string;
  accentColor: string;
  glowColor: string;
  highlights: string[];
  metrics: Record<string, string | undefined>;
}

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Dark scrim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer"
            style={{
              backgroundColor: "rgba(9, 9, 11, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* Modal Container: Technical Inspection Dossier using GlassSurface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto z-10 text-ink has-rivets shadow-2xl"
          >
            <GlassSurface className="p-6 sm:p-10 border border-seam">
              {/* Top Sheet Header */}
              <div className="flex items-center justify-between border-b border-seam pb-4 mb-6 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="badge-orange">{project.category}</span>
                  <span className="font-bold text-ink">
                    INSPECTION DOSSIER // {project.id.toUpperCase()}
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 border border-seam bg-surface hover:bg-ink hover:text-surface transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Media Box */}
              <div className="relative w-full h-60 sm:h-80 border border-seam bg-panel-recess p-2 mb-6 overflow-hidden">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute bottom-4 left-4 bg-ink text-surface px-3 py-1 font-mono text-[10px] font-bold uppercase">
                  CASSETTE SPEC: {project.year} &bull; {project.status}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink uppercase mb-2">
                  {project.title}
                </h2>
                <p className="font-mono text-sm text-accent font-semibold">
                  // {project.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-ink/85 leading-relaxed font-sans mb-8">
                {project.longDescription || project.description}
              </p>

              {/* Measured Metrics Spec Table */}
              <div className="mb-8 border border-seam bg-panel-recess/60">
                <div className="font-mono text-xs uppercase px-4 py-2 border-b border-seam text-ink font-bold bg-panel-recess">
                  INSTRUMENTATION METRICS &amp; OPERATIONAL BENCHMARKS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-seam">
                  {Object.entries(project.metrics).map(([key, val]) => (
                    <div key={key} className="p-4">
                      <div className="font-mono text-[10px] text-ink-muted uppercase mb-1">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div className="font-mono text-base font-bold text-ink">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invariant Highlights */}
              <div className="mb-8">
                <div className="font-mono text-xs text-ink uppercase tracking-wider mb-4 font-bold border-b border-seam pb-2">
                  CORE TECHNICAL INVARIANTS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 border border-seam bg-panel-recess text-xs font-mono text-ink"
                    >
                      <span className="text-accent font-bold">[{idx + 1}]</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-8 font-mono text-xs">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-panel-recess text-ink border border-seam"
                  >
                    [{tag}]
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-seam">
                <InteractiveButton
                  as="a"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  isPrimary={true}
                  className="px-5 py-2.5 font-mono text-xs uppercase font-bold"
                >
                  <GithubIcon size={15} />
                  <span>OPEN REPOSITORY</span>
                </InteractiveButton>

                {project.liveUrl && (
                  <InteractiveButton
                    as="a"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    className="px-5 py-2.5 font-mono text-xs uppercase font-bold"
                  >
                    <span>LIVE TARGET</span>
                    <ExternalLink size={14} />
                  </InteractiveButton>
                )}
              </div>
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
