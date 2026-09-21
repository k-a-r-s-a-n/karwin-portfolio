"use client";

import { useEffect } from "react";

/**
 * Cursor aura — a fluid lime wake that trails the REAL pointer.
 *
 * Design decision, learned the hard way: this site does NOT hide the native
 * cursor. Some environments (embedded webviews, browser extensions, OS
 * accessibility features) ignore `cursor: none`, which produced the
 * "two cursors" bug. So there is exactly one pointer on screen — the user's —
 * and everything drawn here is unambiguous decoration that is glued to it:
 *
 *  - the interactive aura ring follows the pointer INSTANTLY (same position,
 *    always concentric — it can never drift into a second cursor)
 *  - the waving silk trail streams BEHIND the motion (sampled from real
 *    pointer positions, no easing, no glowing head that could read as a
 *    pointer of its own)
 *  - clicks emit a pulse ring at the exact pointer position
 *
 * Fine-pointer devices only; fully disabled under reduced motion. The trail
 * canvas sleeps whenever nothing is animating.
 */

export default function CustomCursor() {
  useEffect(() => {
    const root = document.documentElement;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reducedMotion) return;

    // ── Instant-follow aura ring (DOM, one transform per frame) ──
    const ring = document.createElement("div");
    ring.className = "cursor-aura";
    ring.setAttribute("aria-hidden", "true");
    root.appendChild(ring);

    // ── Waving silk trail (canvas) ──
    const canvas = document.createElement("canvas");
    canvas.className = "cursor-canvas";
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      ring.remove();
      canvas.remove();
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
    const TRAIL_MAX = 24;
    const TRAIL_LIFE_S = 0.42;
    const WAVE_SPEED = 7;
    const WAVE_LENGTH = 0.55;
    const WAVE_MAX_AMP = 5;
    const PULSE_MS = 520;

    interface TrailPoint {
      x: number;
      y: number;
      t: number;
    }

    const points: TrailPoint[] = [];
    let pulses: { x: number; y: number; t: number }[] = [];
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let rafId = 0;
    let running = false;
    const hideTimer = 0;

    const INTERACTIVE_SELECTOR =
      "a, button, [role='button'], input, textarea, select, label, summary";

    const wake = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
      // While the pointer is idle the trail drains to nothing, then we sleep.
      window.clearTimeout(hideTimer);
    };

    const handleMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;

      // Ring is glued to the real pointer — no easing, ever.
      ring.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, -50%)`;

      points.push({ x: lastX, y: lastY, t: performance.now() });
      if (points.length > TRAIL_MAX) points.shift();
      wake();
    };

    const handleOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        ring.classList.add("cursor-aura-active");
      }
    };

    const handleOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        ring.classList.remove("cursor-aura-active");
      }
    };

    const handleDown = (event: PointerEvent) => {
      // Pulse at the REAL pointer position — the thing that actually clicked.
      pulses.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      ring.classList.add("cursor-aura-down");
      wake();
    };

    const handleUp = () => {
      ring.classList.remove("cursor-aura-down");
    };

    const handleLeave = () => {
      ring.style.opacity = "0";
    };

    const handleEnter = () => {
      ring.style.opacity = "1";
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("pointerout", handleOut, { passive: true });
    document.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    document.addEventListener("pointerleave", handleLeave, { passive: true });
    document.addEventListener("pointerenter", handleEnter, { passive: true });

    const frame = (now: number) => {
      // Drain expired trail points.
      while (
        points.length > 0 &&
        (now - points[0].t) / 1000 > TRAIL_LIFE_S
      ) {
        points.shift();
      }
      pulses = pulses.filter((p) => now - p.t < PULSE_MS);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // ── The waving silk trail ──
      if (points.length > 2) {
        const n = points.length;
        const phase = now * 0.001 * WAVE_SPEED;

        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const offsets: { ox: number; oy: number }[] = [];
        for (let i = 0; i < n; i++) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(n - 1, i + 1)];
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const headFade = i / (n - 1); // 0 = newest (at pointer), 1 = oldest
          const amp = WAVE_MAX_AMP * headFade * headFade;
          const wave = Math.sin(i * WAVE_LENGTH - phase) * amp;
          offsets.push({ ox: (-dy / len) * wave, oy: (dx / len) * wave });
        }

        for (let i = 0; i < n - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const f = i / (n - 1);
          // Width grows toward the tail, alpha fades toward the tail — the
          // newest point (under the native arrow) is deliberately faint so
          // the trail reads as a wake, not a second pointer.
          const width = 0.4 + f * 3.4;
          const a = (1 - f) * 0.5 * (1 - f * 0.35);
          ctx.strokeStyle = `rgba(201, 241, 88, ${a})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p0.x + offsets[i].ox, p0.y + offsets[i].oy);
          ctx.lineTo(p1.x + offsets[i + 1].ox, p1.y + offsets[i + 1].oy);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // ── Click pulse rings ──
      for (const pulse of pulses) {
        const t = (now - pulse.t) / PULSE_MS; // 0 → 1
        const ease = 1 - Math.pow(1 - t, 3);
        ctx.strokeStyle = `rgba(201, 241, 88, ${(1 - t) * 0.8})`;
        ctx.lineWidth = 1.6 * (1 - t) + 0.4;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, 6 + ease * 46, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (points.length > 0 || pulses.length > 0) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(hideTimer);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("pointerenter", handleEnter);
      window.removeEventListener("resize", resize);
      ring.remove();
      canvas.remove();
    };
  }, []);

  // Elements are created imperatively — nothing renders until active.
  return null;
}
