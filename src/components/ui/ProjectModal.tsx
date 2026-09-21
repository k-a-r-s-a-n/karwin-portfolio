"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import Image from "next/image";
import InteractiveButton from "@/components/ui/InteractiveButton";
import { getLenis } from "@/lib/lenis";

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

const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!project) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const getFocusable = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          ).filter((el) => el.offsetParent !== null)
        : [];

    getFocusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && dialog) {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !dialog.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Freeze background scrolling — Lenis must be stopped explicitly.
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      lenis?.start();
      previousFocusRef.current?.focus?.();
    };
  }, [project, onClose]);

  // Only offer "live" when it goes somewhere different from the repo.
  const hasDistinctLiveUrl =
    !!project?.liveUrl && project.liveUrl !== project.github;

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6 md:p-10">
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-bg/80 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-modal-title-${project.id}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { type: "spring", damping: 30, stiffness: 320 }
            }
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl"
          >
            {/* Cover */}
            <div className="relative h-56 w-full overflow-hidden sm:h-72">
              <Image
                src={project.coverImage}
                alt={`${project.title} — project cover`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg/70 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
              <p className="absolute bottom-4 left-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                {project.category} · {project.year} · {project.status}
              </p>
            </div>

            <div className="px-6 pb-8 sm:px-10 sm:pb-10">
              <h2
                id={`project-modal-title-${project.id}`}
                className="font-serif text-3xl text-ink sm:text-4xl"
              >
                {project.title}
              </h2>
              <p className="mt-2 font-serif text-lg italic text-accent">
                {project.subtitle}
              </p>

              <p className="mt-6 leading-relaxed text-ink/85">
                {project.longDescription || project.description}
              </p>

              {/* Highlights */}
              {project.highlights.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                    Technical notes
                  </p>
                  <ul className="space-y-2.5">
                    {project.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-muted"
                      >
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics — only rendered when there's something real to show */}
              {Object.keys(project.metrics).length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                  {Object.entries(project.metrics).map(([key, val]) => (
                    <div key={key} className="bg-surface p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
                        {key}
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {project.tags.join(" · ")}
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                <InteractiveButton
                  as="a"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  <GithubIcon size={15} />
                  <span>View repository</span>
                </InteractiveButton>

                {hasDistinctLiveUrl && (
                  <InteractiveButton
                    as="a"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                  >
                    <span>Live site</span>
                    <ExternalLink size={14} />
                  </InteractiveButton>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
