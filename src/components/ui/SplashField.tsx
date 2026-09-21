"use client";

import React, { useEffect, useRef } from "react";

/**
 * SplashField — a playable field of small confetti shapes with liquid
 * physics, in the spirit of lusion.co's contact page.
 *
 * Sweep the cursor through the field and the shapes splash aside with your
 * momentum; stop moving and they rain back down, tumble, and settle into a
 * soft pile. Fast swipes fling; slow drifts carve through like a hand
 * through water.
 *
 * Implementation: one 2D canvas, ~500 particles, and a real (if tiny)
 * solver —
 *  - semi-implicit Euler with gravity, drag, and wall/floor response
 *  - particle-particle separation via a uniform spatial hash (typed arrays),
 *    which is what lets shapes PILE UP like sand instead of falling through
 *    each other
 *  - pointer acts as a fluid displacer: radial push + velocity transfer
 *  - each shape tumbles with its own angular velocity, driven by motion
 *
 * Reduced motion renders a pre-settled static pile — no simulation, no
 * listeners. The sim also sleeps while the section is off-screen.
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

    const SHAPE_RECT = 0;
    const SHAPE_CIRCLE = 1;
    const SHAPE_TRIANGLE = 2;
    const SHAPE_CROSS = 3;
    const SHAPE_PLUS = 4;
    const SHAPE_RING = 5;

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      av: number;
      s: number; // half-size
      shape: number;
      tone: 0 | 1; // 0 = primary, 1 = inverse sparkle
    }

    const SHAPE_WEIGHTS: [number, number][] = [
      [SHAPE_RECT, 0.24],
      [SHAPE_CIRCLE, 0.22],
      [SHAPE_TRIANGLE, 0.16],
      [SHAPE_CROSS, 0.16],
      [SHAPE_PLUS, 0.12],
      [SHAPE_RING, 0.1],
    ];

    const pickShape = () => {
      let r = Math.random();
      for (const [shape, w] of SHAPE_WEIGHTS) {
        r -= w;
        if (r <= 0) return shape;
      }
      return SHAPE_CIRCLE;
    };

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: P[] = [];
    let rafId = 0;
    let lastTime = 0;
    let inView = false;

    // Spatial hash (rebuilt each step)
    const CELL = 22;
    let cols = 0;
    let rows = 0;
    let gridHead: Int32Array = new Int32Array(0);
    let gridNext: Int32Array = new Int32Array(0);

    // Pointer state in canvas coordinates + smoothed velocity
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      cols = Math.max(1, Math.ceil(width / CELL));
      rows = Math.max(1, Math.ceil(height / CELL));
      gridHead = new Int32Array(cols * rows).fill(-1);

      const density = width < 640 ? 0.16 : 0.34;
      const count = Math.max(140, Math.min(520, Math.floor(width * density)));
      gridNext = new Int32Array(count);

      particles = Array.from({ length: count }, () => {
        const tone: 0 | 1 = Math.random() < 0.12 ? 1 : 0;
        return {
          x: 6 + Math.random() * (width - 12),
          y: -height * 0.5 + Math.random() * height * 0.85,
          vx: (Math.random() - 0.5) * 60,
          vy: Math.random() * 40,
          angle: Math.random() * Math.PI * 2,
          av: (Math.random() - 0.5) * 3,
          s: 2.6 + Math.random() * 4.6,
          shape: pickShape(),
          tone,
        };
      });
    };

    const drawShape = (p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const ink = dark
        ? p.tone
          ? "rgba(242, 241, 236, 0.9)"
          : "rgba(12, 12, 13, 0.92)"
        : p.tone
        ? "rgba(201, 241, 88, 0.9)"
        : "rgba(242, 241, 236, 0.9)";

      switch (p.shape) {
        case SHAPE_RECT: {
          ctx.fillStyle = ink;
          ctx.fillRect(-p.s * 0.75, -p.s * 0.75, p.s * 1.5, p.s * 1.5);
          break;
        }
        case SHAPE_CIRCLE: {
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 0.72, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case SHAPE_TRIANGLE: {
          ctx.fillStyle = ink;
          const r = p.s * 1.05;
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.87, r * 0.5);
          ctx.lineTo(-r * 0.87, r * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case SHAPE_CROSS: {
          ctx.strokeStyle = ink;
          ctx.lineWidth = Math.max(1.1, p.s * 0.42);
          ctx.lineCap = "round";
          const l = p.s * 0.95;
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
          ctx.lineWidth = Math.max(1.1, p.s * 0.42);
          ctx.lineCap = "round";
          const l = p.s * 1.05;
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
          ctx.lineWidth = Math.max(1.1, p.s * 0.42);
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 0.85, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) drawShape(particles[i]);
    };

    const step = (dt: number) => {
      const GRAVITY = 1500;
      const pointerRadius = Math.max(80, Math.min(130, width * 0.09));
      const n = particles.length;

      // ── Rebuild spatial hash ──
      gridHead.fill(-1);
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const c = Math.min(cols - 1, Math.max(0, Math.floor(p.x / CELL)));
        const r = Math.min(rows - 1, Math.max(0, Math.floor(p.y / CELL)));
        const idx = r * cols + c;
        gridNext[i] = gridHead[idx];
        gridHead[idx] = i;
      }

      for (let i = 0; i < n; i++) {
        const p = particles[i];

        // Gravity
        p.vy += GRAVITY * dt;

        // Pointer displacer: radial push + momentum transfer
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < pointerRadius && dist > 0.0001) {
          const falloff = 1 - dist / pointerRadius;
          const push = falloff * falloff;
          p.vx += (dx / dist) * push * 4200 * dt + pointer.vx * push * 0.16;
          p.vy += (dy / dist) * push * 2400 * dt + pointer.vy * push * 0.16;
          p.av += (pointer.vx * 0.004 + (Math.random() - 0.5) * 2) * push;
        }

        // Drag + integrate
        p.vx *= 0.988;
        p.vy *= 0.988;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Tumble with motion, damped
        p.av += p.vx * 0.9 * dt;
        p.av *= 0.985;
        p.angle += p.av * dt;

        // ── Particle-particle separation (this is what makes piles) ──
        const c = Math.min(cols - 1, Math.max(0, Math.floor(p.x / CELL)));
        const r = Math.min(rows - 1, Math.max(0, Math.floor(p.y / CELL)));
        for (let ro = -1; ro <= 1; ro++) {
          const rr = r + ro;
          if (rr < 0 || rr >= rows) continue;
          for (let co = -1; co <= 1; co++) {
            const cc = c + co;
            if (cc < 0 || cc >= cols) continue;
            let j = gridHead[rr * cols + cc];
            while (j !== -1) {
              if (j > i) {
                const q = particles[j];
                const ddx = q.x - p.x;
                const ddy = q.y - p.y;
                const minDist = (p.s + q.s) * 0.92;
                const d2 = ddx * ddx + ddy * ddy;
                if (d2 < minDist * minDist && d2 > 0.0001) {
                  const d = Math.sqrt(d2);
                  const overlap = ((minDist - d) / d) * 0.32;
                  const ox = ddx * overlap;
                  const oy = ddy * overlap;
                  p.x -= ox;
                  p.y -= oy;
                  q.x += ox;
                  q.y += oy;
                }
              }
              j = gridNext[j];
            }
          }
        }

        // ── Walls & floor — damped, so the pile settles instead of boiling ──
        if (p.x < p.s) {
          p.x = p.s;
          p.vx *= -0.45;
        } else if (p.x > width - p.s) {
          p.x = width - p.s;
          p.vx *= -0.45;
        }
        if (p.y > height - p.s) {
          p.y = height - p.s;
          p.vy *= -0.26;
          p.vx *= 0.9;
          p.av *= 0.88;
        } else if (p.y < p.s) {
          p.y = p.s;
          p.vy *= -0.3;
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      // Smooth the pointer velocity so flings feel weighty, not explosive.
      step(dt);
      render();
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (rafId) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      // Instant velocity, clamped — smoothed by use downstream via falloff.
      pointer.vx = Math.max(-1600, Math.min(1600, nextX - pointer.x) * 10);
      pointer.vy = Math.max(-1600, Math.min(1600, nextY - pointer.y) * 10);
      pointer.x = nextX;
      pointer.y = nextY;
    };

    const handlePointerGone = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reducedMotion) settle();
        render();
      }, 150);
    };

    const settle = () => {
      // Pre-run the sim so reduced-motion users see a natural pile.
      pointer.x = -9999;
      for (let i = 0; i < 320; i++) step(1 / 60);
    };

    build();

    if (reducedMotion) {
      settle();
      render();
      window.addEventListener("resize", handleResize);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", handleResize);
      };
    }

    // Only simulate while the field is actually on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, {
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
      document.removeEventListener("pointerleave", handlePointerGone);
      window.removeEventListener("resize", handleResize);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
