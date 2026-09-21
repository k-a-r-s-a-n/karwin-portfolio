"use client";

import React, { useEffect, useRef } from "react";
import {
  createWorld,
  tick,
  EMPTY_INPUT,
  SHAPE_RECT,
  SHAPE_CIRCLE,
  SHAPE_TRIANGLE,
  SHAPE_CROSS,
  SHAPE_PLUS,
  SHAPE_RING,
  type SplashInput,
} from "@/lib/splash-physics";

/**
 * SplashField — a full-width field of liquid-confetti shapes with real,
 * verified pile physics (see src/lib/splash-physics.ts — the simulation is
 * pure and unit-checked: settles calm, never overlaps, sweeps carve, clicks
 * burst, and everything rains back down).
 *
 * Input: raw pointer events (window-level), converted to canvas coordinates
 * every frame — one source of truth, works for mouse, pen and touch. Pointer
 * velocity is computed from consecutive move events. Clicks fire a burst.
 *
 * Rendering: one 2D canvas; the simulation runs on a fixed 1/60s accumulator
 * and sleeps when the section scrolls off-screen. Reduced-motion visitors get
 * a pre-settled static pile.
 */
export default function SplashField({
  className = "",
  dark = true,
}: {
  className?: string;
  /** Shape color: `true` renders dark shapes (for lime/bright backgrounds). */
  dark?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let world = createWorld(1, 1);
    let rafId = 0;
    let lastTime = 0;
    let acc = 0;

    // Local (fallback) pointer state in canvas coordinates, px/s.
    const local: SplashInput = { ...EMPTY_INPUT };
    const clicks: { x: number; y: number }[] = [];

    // Batched transform: one setMatrix per shape instead of save/restore —
    // meaningful at ~2000 shapes.
    const drawShape = (p: (typeof world.particles)[number]) => {
      const cos = Math.cos(p.angle);
      const sin = Math.sin(p.angle);
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * p.x, dpr * p.y);
      const ink = dark
        ? p.tone
          ? "rgba(242, 241, 236, 0.92)"
          : "rgba(10, 10, 11, 0.92)"
        : p.tone
        ? "rgba(201, 241, 88, 0.92)"
        : "rgba(242, 241, 236, 0.92)";

      switch (p.shape) {
        case SHAPE_RECT: {
          const s = p.r * 0.74; // half-diagonal stays within r
          ctx.fillStyle = ink;
          ctx.fillRect(-s, -s, s * 2, s * 2);
          break;
        }
        case SHAPE_CIRCLE: {
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case SHAPE_TRIANGLE: {
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.moveTo(0, -p.r * 0.98);
          ctx.lineTo(p.r * 0.85, p.r * 0.49);
          ctx.lineTo(-p.r * 0.85, p.r * 0.49);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case SHAPE_CROSS: {
          ctx.strokeStyle = ink;
          ctx.lineWidth = Math.max(1.4, p.r * 0.42);
          ctx.lineCap = "round";
          const l = p.r * 0.8;
          ctx.beginPath();
          ctx.moveTo(-l, -l);
          ctx.lineTo(l, l);
          ctx.moveTo(l, -l);
          ctx.lineTo(-l, l);
          ctx.stroke();
          break;
        }
        case SHAPE_PLUS: {
          ctx.strokeStyle = ink;
          ctx.lineWidth = Math.max(1.4, p.r * 0.42);
          ctx.lineCap = "round";
          const l = p.r * 0.92;
          ctx.beginPath();
          ctx.moveTo(0, -l);
          ctx.lineTo(0, l);
          ctx.moveTo(-l, 0);
          ctx.lineTo(l, 0);
          ctx.stroke();
          break;
        }
        case SHAPE_RING: {
          ctx.strokeStyle = ink;
          ctx.lineWidth = Math.max(1.4, p.r * 0.34);
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.78, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, world.width, world.height);
      for (const p of world.particles) {
        if (p.y > -16) drawShape(p); // skip shapes still above the canvas
      }
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      world = createWorld(w, h);
    };

    const frame = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;
      acc += dt;

      // Drain the simulation in fixed 1/60s steps (deterministic + stable).
      let stepped = false;
      while (acc >= 1 / 60) {
        tick(world, local, clicks);
        clicks.length = 0;
        acc -= 1 / 60;
        stepped = true;
      }
      // Velocity decays so a stopped pointer stops pushing immediately.
      local.vx *= 0.8;
      local.vy *= 0.8;

      if (stepped) render();
      rafId = requestAnimationFrame(frame);
    };

    // ── Raw pointer input — the single source of truth ──
    let lastX = -9999;
    let lastY = -9999;
    let lastT = 0;

    const toCanvas = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { x, y } = toCanvas(event.clientX, event.clientY);
      const now = performance.now();
      const dt = lastT ? Math.max((now - lastT) / 1000, 1 / 240) : 1 / 60;
      local.vx = Math.max(-3000, Math.min(3000, (x - lastX) / dt));
      local.vy = Math.max(-3000, Math.min(3000, (y - lastY) / dt));
      lastX = x;
      lastY = y;
      lastT = now;
      local.x = x;
      local.y = y;
      local.active = true;
    };

    const handlePointerDown = (event: PointerEvent) => {
      const { x, y } = toCanvas(event.clientX, event.clientY);
      // A click is also an instantaneous position update, so bursts land
      // exactly where the pointer is — even for the very first interaction.
      lastX = x;
      lastY = y;
      lastT = performance.now();
      local.x = x;
      local.y = y;
      local.active = true;
      clicks.push({ x, y });
    };

    const handlePointerGone = () => {
      local.active = false;
      local.vx = 0;
      local.vy = 0;
      lastX = -9999;
      lastY = -9999;
    };

    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reducedMotion) {
          for (let i = 0; i < 900; i++) tick(world, EMPTY_INPUT, []);
        }
        render();
      }, 150);
    };

    const start = () => {
      if (!rafId) {
        lastTime = 0;
        acc = 0;
        rafId = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    build();

    if (reducedMotion) {
      // Pre-settle into a natural pile; static, no listeners.
      for (let i = 0; i < 900; i++) tick(world, EMPTY_INPUT, []);
      render();
      window.addEventListener("resize", handleResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", handleResize);
      };
    }

    // Simulate only while the field is on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerGone, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      stop();
      observer.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerleave", handlePointerGone);
      window.removeEventListener("resize", handleResize);
    };
  }, [dark]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
