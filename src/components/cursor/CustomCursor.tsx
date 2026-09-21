"use client";

import { useEffect } from "react";

/**
 * Fluid ink cursor — a glowing ribbon that trails the pointer with a
 * travelling sine wave, in the spirit of lusio.co / igloo.inc.
 *
 * Rendered on a single 2D canvas (compositor-cheap, no WebGL context):
 *  - the head eases after the pointer for an organic lag
 *  - the trail is a tapered polyline with a wave that grows toward the tail,
 *    so it flows like silk even when the pointer moves in straight lines
 *  - hovering interactive elements brightens and swells the head
 *  - clicking emits a soft pulse ring
 *
 * Contract (unchanged from the ring cursor):
 *  - fine-pointer devices only; disabled entirely under reduced motion
 *  - text fields keep the native I-beam; the native cursor is only hidden
 *    while `cursor-active` is on <html>
 */
export default function CustomCursor() {
  useEffect(() => {
    const root = document.documentElement;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reducedMotion) return;

    root.classList.add("cursor-active");

    const canvas = document.createElement("canvas");
    canvas.className = "cursor-canvas";
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      root.classList.remove("cursor-active");
      return;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── State ──
    const TRAIL_MAX = 26;
    const TRAIL_LIFE_S = 0.58;
    const WAVE_SPEED = 7; // wave phase speed (rad/s)
    const WAVE_LENGTH = 0.55; // spatial frequency along the trail
    const WAVE_MAX_AMP = 5.5; // px, at the tail

    interface TrailPoint {
      x: number;
      y: number;
      t: number;
    }

    const points: TrailPoint[] = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let headX = mouseX;
    let headY = mouseY;
    let alpha = 0; // 0 when the pointer is outside the window
    let interactive = false;
    let pulse = 0; // click pulse 0..1
    let lastMoveAt = 0;
    let rafId = 0;
    let running = false;

    const INTERACTIVE_SELECTOR =
      "a, button, [role='button'], input, textarea, select, label, summary";

    const wake = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    };

    const handleMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      lastMoveAt = performance.now();
      alpha = 1;
      wake();
    };

    const handleOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE_SELECTOR)) interactive = true;
    };

    const handleOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE_SELECTOR)) interactive = false;
    };

    const handleDown = (event: PointerEvent) => {
      pulse = 1;
      mouseX = event.clientX;
      mouseY = event.clientY;
      wake();
    };

    const handleLeave = () => {
      alpha = 0;
      wake();
    };

    const handleEnter = () => {
      alpha = 1;
      wake();
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("pointerout", handleOut, { passive: true });
    document.addEventListener("pointerdown", handleDown, { passive: true });
    document.addEventListener("pointerleave", handleLeave, { passive: true });
    document.addEventListener("pointerenter", handleEnter, { passive: true });

    const frame = (now: number) => {
      // The head eases toward the pointer — heavy, organic lag, never snappy.
      headX += (mouseX - headX) * 0.26;
      headY += (mouseY - headY) * 0.26;
      pulse = Math.max(0, pulse - 0.045);

      points.unshift({ x: headX, y: headY, t: now });
      if (points.length > TRAIL_MAX) points.pop();
      while (points.length > 2 && (now - points[points.length - 1].t) / 1000 > TRAIL_LIFE_S) {
        points.pop();
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const trailAlive = points.length > 2;
      const visible = alpha > 0.02;

      if (visible && trailAlive) {
        const n = points.length;
        const phase = now * 0.001 * WAVE_SPEED;

        // ── The ribbon: tapered, waving segments ──
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Pre-compute wave offsets so segments share continuous points.
        const offsets: { ox: number; oy: number }[] = [];
        for (let i = 0; i < n; i++) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(n - 1, i + 1)];
          // Direction of travel → perpendicular for the wave offset.
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const tailFade = i / (n - 1); // 0 at head, 1 at tail
          const amp = WAVE_MAX_AMP * tailFade * tailFade;
          const wave = Math.sin(i * WAVE_LENGTH - phase) * amp;
          offsets.push({ ox: (-dy / len) * wave, oy: (dx / len) * wave });
        }

        for (let i = 0; i < n - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const f = i / (n - 1);
          const width = 4.6 * (1 - f) + 0.3;
          const a = (1 - f) * (1 - f) * 0.42 * alpha;

          ctx.strokeStyle = `rgba(201, 241, 88, ${a})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p0.x + offsets[i].ox, p0.y + offsets[i].oy);
          ctx.lineTo(p1.x + offsets[i + 1].ox, p1.y + offsets[i + 1].oy);
          ctx.stroke();
        }

        // ── Head: soft glow halo + bright core ──
        const idleScale = Math.min(1, (now - lastMoveAt) / 900);
        const headRadius = (interactive ? 24 : 14) + pulse * 26;
        const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headRadius);
        const glowStrength = (interactive ? 0.4 : 0.26) * alpha * (1 - idleScale * 0.35);
        glow.addColorStop(0, `rgba(201, 241, 88, ${glowStrength})`);
        glow.addColorStop(1, "rgba(201, 241, 88, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = "source-over";
        const coreRadius = (interactive ? 3.4 : 2.3) + pulse * 2.4;
        ctx.fillStyle = `rgba(242, 241, 236, ${0.95 * alpha})`;
        ctx.beginPath();
        ctx.arc(headX, headY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Click pulse ring
        if (pulse > 0.01) {
          ctx.strokeStyle = `rgba(201, 241, 88, ${pulse * 0.5 * alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(headX, headY, (interactive ? 30 : 20) * (1.6 - pulse), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (visible) {
        // Idle: a small resting point of light so the pointer is still visible.
        ctx.fillStyle = `rgba(242, 241, 236, ${0.55 * alpha})`;
        ctx.beginPath();
        ctx.arc(headX, headY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Keep animating while anything is in motion; sleep when settled.
      if (visible || points.length > 0 || pulse > 0.01) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    wake();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("pointerenter", handleEnter);
      window.removeEventListener("resize", resize);
      canvas.remove();
      root.classList.remove("cursor-active", "cursor-interactive");
    };
  }, []);

  // The canvas is created imperatively — nothing renders until active.
  return null;
}
