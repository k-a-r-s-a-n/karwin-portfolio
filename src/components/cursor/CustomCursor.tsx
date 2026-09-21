"use client";

import { useEffect } from "react";

/**
 * Custom cursor: a machined orange dot with a trailing instrument ring.
 *
 * This used to run a second Three.js renderer (a whole WebGL context) just for
 * a 80x80 cursor ornament — on top of the hero canvas. It is now two styled
 * divs moved with transform: translate3d, which the compositor handles for
 * free. No canvas, no render loop, no library.
 *
 * Behaviour contract:
 *  - fine-pointer devices only, and only when the visitor has not asked for
 *    reduced motion (the CSS also self-disables via the same media query)
 *  - the ring trails with a spring-ish lag; grows over interactive elements
 *  - text inputs keep the native I-beam (see globals.css)
 *  - `<html>` gets `cursor-active`; all suppression styles are keyed off that
 */
export default function CustomCursor() {
  useEffect(() => {
    const root = document.documentElement;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Touch devices and reduced-motion visitors keep the native cursor.
    if (!finePointer || reducedMotion) return;

    root.classList.add("cursor-active");

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    root.appendChild(dot);
    root.appendChild(ring);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let rafId = 0;
    let lastTime = performance.now();

    const INTERACTIVE_SELECTOR =
      "a, button, [role='button'], input, textarea, select, label, summary";

    const handlePointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    // Event delegation: no per-element listeners, works for dynamically
    // rendered content (modals, filtered lists).
    const handlePointerOver = (event: PointerEvent) => {
      if (!event.target) return;
      const target = event.target as Element;
      if (target.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.add("cursor-interactive");
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.target) return;
      const target = event.target as Element;
      if (target.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.remove("cursor-interactive");
      }
    };

    const handleDocumentLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handleDocumentEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    // Framerate-independent exponential smoothing (independent of display Hz).
    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Dot tracks 1:1; ring eases behind it (k ≈ 1 - e^(-18·dt)).
      const k = 1 - Math.exp(-18 * delta);
      dotX += (mouseX - dotX) * Math.min(1, k * 2.2);
      dotY += (mouseY - dotY) * Math.min(1, k * 2.2);
      ringX += (mouseX - ringX) * k;
      ringY += (mouseY - ringY) * k;

      dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
      ring.style.transform = `translate3d(${ringX - 15}px, ${ringY - 15}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerover", handlePointerOver, {
      passive: true,
    });
    document.addEventListener("pointerout", handlePointerOut, {
      passive: true,
    });
    document.addEventListener("pointerleave", handleDocumentLeave, {
      passive: true,
    });
    document.addEventListener("pointerenter", handleDocumentEnter, {
      passive: true,
    });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerleave", handleDocumentLeave);
      document.removeEventListener("pointerenter", handleDocumentEnter);
      dot.remove();
      ring.remove();
      root.classList.remove("cursor-active", "cursor-interactive");
    };
  }, []);

  // Elements are created imperatively so nothing renders until the cursor is
  // actually active — no flash on touch devices.
  return null;
}
