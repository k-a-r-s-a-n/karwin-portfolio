"use client";

import { useEffect } from "react";
import { pointerState } from "@/lib/pointer";

/**
 * Fluid ink cursor — precise dot head + silk ribbon trail.
 *
 * Architecture (this matters): the head is drawn SYNCHRONOUSLY inside the
 * pointermove handler at the raw event coordinates. requestAnimationFrame is
 * used only to animate the wave in the trail and decay old segments — it is
 * cosmetic, never authoritative. In environments where rAF gets throttled or
 * stalled (embedded previews, backgrounded frames), the head still tracks the
 * pointer exactly, because pointer events are the source of truth.
 *
 * The same is true for clicks: the pulse is drawn in the pointerdown handler
 * at the raw click coordinates, so a click is always acknowledged exactly
 * where it happened.
 *
 * Contract: fine-pointer devices only; disabled under reduced motion; text
 * fields keep the native I-beam; the native cursor is hidden with inline
 * styles (immune to specificity) plus a universal rule.
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
    // Inline styles override every author rule and UA default, and `cursor`
    // inherits — the native pointer cannot leak through on any element.
    root.style.cursor = "none";
    document.body.style.cursor = "none";
    // One universal rule, stronger than any selector game.
    const style = document.createElement("style");
    style.textContent =
      "html.cursor-active, html.cursor-active * { cursor: none !important; }";
    document.head.appendChild(style);

    const canvas = document.createElement("canvas");
    canvas.className = "cursor-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.pointerEvents = "none";
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      style.remove();
      root.style.cursor = "";
      document.body.style.cursor = "";
      root.classList.remove("cursor-active");
      return;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      draw(); // repaint at the correct scale immediately
    };
    window.addEventListener("resize", resize, { passive: true });
    // Browser zoom and mobile chrome change dpr/viewport without a window
    // resize in some engines — visualViewport covers both.
    const vv = window.visualViewport;
    vv?.addEventListener("resize", resize, { passive: true });

    // ── State ──
    const TRAIL_MAX = 30;
    const TRAIL_LIFE_S = 0.55;
    const WAVE_SPEED = 6.5;
    const WAVE_LENGTH = 0.55;
    const WAVE_MAX_AMP = 5.5;

    interface TrailPoint {
      x: number;
      y: number;
      t: number;
    }

    const points: TrailPoint[] = [];
    let headX = -100;
    let headY = -100;
    let alpha = 0; // 0 while the pointer is outside the window
    let interactive = false;
    let pulse = 0;
    let pulseX = -100;
    let pulseY = -100;
    let lastMoveAt = 0;
    let rafId = 0;
    let running = false;

    const INTERACTIVE_SELECTOR =
      "a, button, [role='button'], input, textarea, select, label, summary";

    const wake = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    // ── Rendering (pure function of current state) ──
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();
      const n = points.length;

      if (alpha > 0.02 && n > 2) {
        const phase = now * 0.001 * WAVE_SPEED;

        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Per-point wave offsets, perpendicular to the local direction.
        const offsets: { ox: number; oy: number }[] = [];
        for (let i = 0; i < n; i++) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(n - 1, i + 1)];
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const tailFade = i / (n - 1);
          const amp = WAVE_MAX_AMP * tailFade * tailFade;
          const wave = Math.sin(i * WAVE_LENGTH - phase) * amp;
          offsets.push({ ox: (-dy / len) * wave, oy: (dx / len) * wave });
        }

        for (let i = 0; i < n - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const f = i / (n - 1);
          const width = 4.4 * (1 - f) + 0.3;
          const a = (1 - f) * (1 - f) * 0.4 * alpha;

          ctx.strokeStyle = `rgba(201, 241, 88, ${a})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p0.x + offsets[i].ox, p0.y + offsets[i].oy);
          ctx.lineTo(p1.x + offsets[i + 1].ox, p1.y + offsets[i + 1].oy);
          ctx.stroke();
        }

        // Head: soft glow halo + bright core — drawn at the RAW pointer.
        const idleScale = Math.min(1, (now - lastMoveAt) / 900);
        const headRadius = (interactive ? 24 : 14) + pulse * 20;
        const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headRadius);
        const glowStrength = (interactive ? 0.38 : 0.24) * alpha * (1 - idleScale * 0.35);
        glow.addColorStop(0, `rgba(201, 241, 88, ${glowStrength})`);
        glow.addColorStop(1, "rgba(201, 241, 88, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = "source-over";
        const coreRadius = (interactive ? 3.4 : 2.3) + pulse * 2;
        ctx.fillStyle = `rgba(242, 241, 236, ${0.95 * alpha})`;
        ctx.beginPath();
        ctx.arc(headX, headY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (alpha > 0.02) {
        // Idle: a small resting point of light, still exactly on the pointer.
        ctx.fillStyle = `rgba(242, 241, 236, ${0.55 * alpha})`;
        ctx.beginPath();
        ctx.arc(headX, headY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Click pulse ring — drawn at the RAW click coordinates.
      if (pulse > 0.01) {
        const t = 1 - pulse;
        ctx.strokeStyle = `rgba(201, 241, 88, ${(1 - t) * 0.85 * alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 10 + t * 52, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // ── rAF: cosmetic only (wave phase + trail/pulse decay) ──
    const loop = (now: number) => {
      pulse = Math.max(0, pulse - 0.03);
      while (points.length > 2 && (now - points[points.length - 1].t) / 1000 > TRAIL_LIFE_S) {
        points.pop();
      }
      if (points.length === TRAIL_MAX + 1) points.pop();

      draw();

      if (alpha > 0.02 || points.length > 0 || pulse > 0.01) {
        rafId = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    // ── Pointer events: the source of truth ──
    let lastEventT = 0;
    let lastX = 0;
    let lastY = 0;

    const handleMove = (event: PointerEvent) => {
      const now = performance.now();
      headX = event.clientX;
      headY = event.clientY;
      alpha = 1;
      lastMoveAt = now;

      // Trail point + published velocity for physics scenes (px/s).
      const dt = lastEventT ? Math.max((event.timeStamp - lastEventT) / 1000, 1 / 240) : 1 / 60;
      pointerState.vx = Math.max(-2600, Math.min(2600, (headX - lastX) / dt));
      pointerState.vy = Math.max(-2600, Math.min(2600, (headY - lastY) / dt));
      lastEventT = event.timeStamp;
      lastX = headX;
      lastY = headY;

      points.unshift({ x: headX, y: headY, t: now });
      if (points.length > TRAIL_MAX) points.pop();

      pointerState.x = headX;
      pointerState.y = headY;
      pointerState.active = true;

      draw(); // immediate paint — tracking never waits for a frame
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
      pulseX = event.clientX;
      pulseY = event.clientY;
      // The visible head lands exactly on the click point.
      headX = event.clientX;
      headY = event.clientY;
      points.length = 0;
      pointerState.down = true;
      draw();
      wake();
    };

    const handleUp = () => {
      pointerState.down = false;
    };

    const handleLeave = () => {
      alpha = 0;
      pointerState.active = false;
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
    window.addEventListener("pointerup", handleUp, { passive: true });
    document.addEventListener("pointerleave", handleLeave, { passive: true });
    document.addEventListener("pointerenter", handleEnter, { passive: true });

    // Helpful for debugging in any environment.
    (window as unknown as Record<string, unknown>).__karwinCursor = {
      get state() {
        return { headX, headY, alpha, running, pulse, interactive };
      },
    };

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("pointerenter", handleEnter);
      window.removeEventListener("resize", resize);
      vv?.removeEventListener("resize", resize);
      canvas.remove();
      style.remove();
      root.style.cursor = "";
      document.body.style.cursor = "";
      root.classList.remove("cursor-active", "cursor-interactive");
      pointerState.active = false;
      pointerState.down = false;
      pointerState.x = -9999;
      pointerState.y = -9999;
      pointerState.vx = 0;
      pointerState.vy = 0;
      delete (window as unknown as Record<string, unknown>).__karwinCursor;
    };
  }, []);

  // The canvas is created imperatively — nothing renders until active.
  return null;
}
