"use client";

import React, { useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal";

/**
 * Bead curtain — hanging strands of beads you can stir with the cursor
 * (or a finger on touch devices). Brush through them and they scatter,
 * swing, and settle back with damped spring physics.
 *
 * Rendered on one 2D canvas with a tiny verlet-ish simulation:
 *  - gravity pulls beads down, a distance constraint keeps each bead a
 *    fixed segment from the one above it (so strands stay strands)
 *  - the pointer repels nearby beads and imparts its own velocity,
 *    so slow drifts nudge and fast swipes fling
 *  - a whisper of breeze keeps strands swaying when idle
 *
 * Reduced motion renders one static frame with no simulation or listeners.
 */
export default function BeadCurtain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    interface Bead {
      x: number;
      y: number;
      vx: number;
      vy: number;
      accent: boolean;
      radius: number;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let strands: Bead[][] = [];
    let segLength = 24;
    let width = 0;
    let height = 0;
    let rafId = 0;
    let lastTime = 0;

    // Pointer in canvas coordinates + its velocity (for flinging).
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const spacing = width < 640 ? 40 : 48;
      const count = Math.max(12, Math.floor(width / spacing));
      const beadCount = Math.max(
        7,
        Math.min(15, Math.floor((height - 40) / 30))
      );
      segLength = (height - 46) / beadCount;

      strands = Array.from({ length: count }, (_, s) => {
        const anchorX = ((s + 0.5) / count) * width;
        return Array.from({ length: beadCount }, (_, i) => ({
          x: anchorX,
          y: 22 + i * segLength,
          vx: 0,
          vy: 0,
          accent: Math.random() < 0.16,
          radius: 5.4 + Math.random() * 2.4,
        }));
      });
    };

    const drawBead = (bead: Bead) => {
      const r = bead.radius;
      const gradient = ctx.createRadialGradient(
        bead.x - r * 0.35,
        bead.y - r * 0.4,
        r * 0.15,
        bead.x,
        bead.y,
        r
      );
      if (bead.accent) {
        gradient.addColorStop(0, "#e4ffb0");
        gradient.addColorStop(0.45, "#c9f158");
        gradient.addColorStop(1, "#5c7118");
      } else {
        gradient.addColorStop(0, "#f6f5f0");
        gradient.addColorStop(0.45, "#b9b9b2");
        gradient.addColorStop(1, "#3c3c40");
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bead.x, bead.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular dot
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(bead.x - r * 0.32, bead.y - r * 0.38, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStrand = (beads: Bead[]) => {
      // Thread
      ctx.strokeStyle = "rgba(242, 241, 236, 0.13)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(beads[0].x, 12);
      for (const bead of beads) {
        ctx.lineTo(bead.x, bead.y - bead.radius * 0.4);
      }
      ctx.stroke();

      // Anchor pin
      ctx.fillStyle = "rgba(242, 241, 236, 0.28)";
      ctx.beginPath();
      ctx.arc(beads[0].x, 12, 1.6, 0, Math.PI * 2);
      ctx.fill();

      for (const bead of beads) drawBead(bead);
    };

    const step = (dt: number) => {
      const influenceRadius = Math.min(150, width * 0.16);
      const time = performance.now() / 1000;

      for (let s = 0; s < strands.length; s++) {
        const beads = strands[s];
        const breeze = Math.sin(time * 0.6 + s * 0.7) * 3;

        for (let i = 1; i < beads.length; i++) {
          const bead = beads[i];
          const prev = beads[i - 1];

          // Gravity + idle breeze
          bead.vy += 900 * dt;
          bead.vx += breeze * dt;

          // Pointer interaction: repel + impart pointer velocity
          const dx = bead.x - pointer.x;
          const dy = bead.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < influenceRadius && dist > 0.001) {
            const falloff = 1 - dist / influenceRadius;
            const push = falloff * falloff * 5200 * dt;
            bead.vx += (dx / dist) * push;
            bead.vy += (dy / dist) * push * 0.45;
            bead.vx += pointer.vx * falloff * 0.24;
            bead.vy += pointer.vy * falloff * 0.24;
          }

          // Damping + integration
          bead.vx *= 0.985;
          bead.vy *= 0.985;
          bead.x += bead.vx * dt;
          bead.y += bead.vy * dt;

          // Distance constraint to the bead above (keeps the strand intact)
          const cx = bead.x - prev.x;
          const cy = bead.y - prev.y;
          const cd = Math.hypot(cx, cy) || 0.001;
          const correction = (cd - segLength) / cd;
          bead.x -= cx * correction;
          bead.y -= cy * correction;

          // Hard floor
          if (bead.y > height - bead.radius) {
            bead.y = height - bead.radius;
            bead.vy *= -0.35;
          }
        }
      }
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const strand of strands) drawStrand(strand);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      step(dt);
      render();
      rafId = requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      // Pointer velocity, clamped so flings stay fun, not explosive.
      pointer.vx = Math.max(-2200, Math.min(2200, (nextX - pointer.x) * 14));
      pointer.vy = Math.max(-2200, Math.min(2200, (nextY - pointer.y) * 14));
      pointer.x = nextX;
      pointer.y = nextY;
    };

    const handlePointerLeaveWindow = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    const handleResize = () => {
      build();
      render();
    };

    build();

    if (reducedMotion) {
      // One calm, static curtain.
      render();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeaveWindow, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeaveWindow);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id="playground" aria-label="Interactive bead curtain" className="relative select-none">
      <div className="px-6 pb-10 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <Reveal y={16}>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {"//"} interactive — move your cursor through
            </p>
            <p className="mt-2 font-serif text-2xl italic text-muted sm:text-3xl">
              Go on, play with the beads.
            </p>
          </Reveal>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="block h-[380px] w-full sm:h-[440px]"
        aria-hidden="true"
      />
    </section>
  );
}
