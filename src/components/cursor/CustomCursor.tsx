"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches);

    if (isTouch) return;

    document.body.classList.add("has-custom-cursor");

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const shadow = shadowRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!canvas || !container) return;

    // ─── 2D Wavy Ink Trail Canvas Setup ───
    const trailCtx = trailCanvas ? trailCanvas.getContext("2d") : null;
    const resizeTrailCanvas = () => {
      if (trailCanvas) {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
      }
    };
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas, { passive: true });

    const TRAIL_LENGTH = 22;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;

    const trailPoints = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: currentX,
      y: currentY,
    }));

    // Clock for framerate-independent delta damping
    const clock = new THREE.Clock();

    // ─── Three.js CMM Stylus Compass Setup ───
    const size = 80;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lighting for High-Precision Machined Metal
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff3322, 1.2);
    rimLight.position.set(-4, -4, 2);
    scene.add(rimLight);

    // CMM Probe Tool Geometry
    const probeGroup = new THREE.Group();
    scene.add(probeGroup);

    // Precision Materials — dynamically updated per frame for dark/light mode
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.9,
      roughness: 0.25,
    });
    const darkColletMaterial = new THREE.MeshStandardMaterial({
      color: 0x52525b,
      metalness: 0.7,
      roughness: 0.35,
    });
    const rubyTipMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3322,
      emissive: 0xff1100,
      emissiveIntensity: 0.65,
      metalness: 0.1,
      roughness: 0.1,
    });

    // 1. Top Mounting Shank / Machine Collet
    const shankGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.7, 16);
    const shankMesh = new THREE.Mesh(shankGeom, darkColletMaterial);
    shankMesh.position.y = 1.6;
    probeGroup.add(shankMesh);

    // Knurled grip band
    const knurlGeom = new THREE.CylinderGeometry(0.27, 0.27, 0.2, 16);
    const knurlMesh = new THREE.Mesh(knurlGeom, steelMaterial);
    knurlMesh.position.y = 1.65;
    probeGroup.add(knurlMesh);

    // 2. Tapered Reducer Collar
    const collarGeom = new THREE.CylinderGeometry(0.24, 0.08, 0.4, 16);
    const collarMesh = new THREE.Mesh(collarGeom, steelMaterial);
    collarMesh.position.y = 1.05;
    probeGroup.add(collarMesh);

    // 3. Precision Stylus Shaft (Carbide Stem)
    const shaftGeom = new THREE.CylinderGeometry(0.038, 0.038, 1.8, 12);
    const shaftMesh = new THREE.Mesh(shaftGeom, steelMaterial);
    shaftMesh.position.y = -0.05;
    probeGroup.add(shaftMesh);

    // 4. Ruby / Safety Orange Spherical Tip
    const rubyGeom = new THREE.SphereGeometry(0.16, 20, 20);
    const rubyMesh = new THREE.Mesh(rubyGeom, rubyTipMaterial);
    rubyMesh.position.y = -1.05; // stylus measurement origin
    probeGroup.add(rubyMesh);

    // Angle probe slightly toward the viewer so 3D profile is distinct
    probeGroup.rotation.x = 0.25;

    let isHovering = false;
    let isMouseDown = false;

    // Z-axis descent to "touch" the element
    let targetZ = 0;
    let currentZ = 0;
    let targetTiltX = 0.25;
    let targetTiltZ = 0;
    let currentTiltX = 0.25;
    let currentTiltZ = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor], .panel-surface, article"
      );
      isHovering = !!interactive;
    };

    const onMouseDown = () => {
      isMouseDown = true;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip if tab is hidden — saves GPU when user switches tabs
      if (document.hidden) return;

      // Delta time clamped to 0.1s to avoid jump spikes after inactive tabs
      const delta = Math.min(clock.getDelta(), 0.1);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Framerate-independent damping using THREE.MathUtils.damp
      currentX = THREE.MathUtils.damp(currentX, mouseX, 22, delta);
      currentY = THREE.MathUtils.damp(currentY, mouseY, 22, delta);

      // Position the probe container: center ruby tip exactly at pointer
      if (container) {
        container.style.transform = `translate3d(${currentX - 40}px, ${currentY - 58}px, 0)`;
      }

      // Compute velocity for dynamic tilt
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Velocity-based tilt limits
      const velocityTiltZ = -Math.max(-0.4, Math.min(0.4, vx * 0.022));
      const velocityTiltX = Math.max(-0.3, Math.min(0.3, vy * 0.022));

      targetTiltZ = velocityTiltZ;
      targetTiltX = 0.25 + velocityTiltX;

      currentTiltZ = THREE.MathUtils.damp(currentTiltZ, targetTiltZ, 12, delta);
      currentTiltX = THREE.MathUtils.damp(currentTiltX, targetTiltX, 12, delta);

      probeGroup.rotation.z = currentTiltZ;
      probeGroup.rotation.x = currentTiltX;

      // Z-axis touch interaction
      if (isMouseDown) {
        targetZ = -0.55;
        rubyTipMaterial.emissiveIntensity = 1.6;
      } else if (isHovering) {
        targetZ = -0.35;
        rubyTipMaterial.emissiveIntensity = 1.1;
      } else {
        targetZ = 0;
        rubyTipMaterial.emissiveIntensity = 0.65;
      }

      currentZ = THREE.MathUtils.damp(currentZ, targetZ, 14, delta);
      probeGroup.position.z = currentZ;

      // Update hard contact shadow on the UI underneath
      if (shadow) {
        const shadowScale = isHovering || isMouseDown ? 1.0 : 0.4;
        const shadowOpacity = isMouseDown ? 0.85 : isHovering ? 0.6 : 0.2;
        shadow.style.transform = `translate3d(${currentX - 4}px, ${currentY - 4}px, 0) scale(${shadowScale})`;
        shadow.style.opacity = `${shadowOpacity}`;
      }

      renderer.render(scene, camera);

      // ─── Adapt material colors per frame for dark/light mode ───
      const darkNow = document.documentElement.classList.contains("dark");
      if (darkNow) {
        // In dark mode: brighten steel + collet so the probe is visible
        steelMaterial.color.setHex(0xe4e4e7);
        darkColletMaterial.color.setHex(0x71717a);
      } else {
        steelMaterial.color.setHex(0xd4d4d8);
        darkColletMaterial.color.setHex(0x52525b);
      }

      // ─── Fluid Wavy Ink Trail Simulation (Framerate Independent) ───
      if (trailCanvas && trailCtx) {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

        if (!prefersReducedMotion) {
          // Point 0 follows the stylus ruby tip
          trailPoints[0].x = currentX;
          trailPoints[0].y = currentY;

          // Successive points fluidly lerp toward previous point using delta damping
          for (let i = 1; i < TRAIL_LENGTH; i++) {
            const leader = trailPoints[i - 1];
            const follower = trailPoints[i];
            const dx = leader.x - follower.x;
            const dy = leader.y - follower.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 0.08) {
              follower.x = leader.x;
              follower.y = leader.y;
            } else {
              follower.x = THREE.MathUtils.damp(follower.x, leader.x, 26, delta);
              follower.y = THREE.MathUtils.damp(follower.y, leader.y, 26, delta);
            }
          }

          // Render fluid ribbon path with opacity fade and width taper
          const isDark = document.documentElement.classList.contains("dark");
          const r = 255;
          const g = isDark ? 77 : 51;
          const b = isDark ? 54 : 34;

          trailCtx.lineCap = "round";
          trailCtx.lineJoin = "round";

          for (let i = 0; i < TRAIL_LENGTH - 1; i++) {
            const p0 = trailPoints[i];
            const p1 = trailPoints[i + 1];
            const t = i / (TRAIL_LENGTH - 1); // 0 (tip) -> 1 (tail)

            const alpha = Math.max(0, (1 - t) * 0.75);
            const strokeWidth = (1 - t) * 4.2 + 0.6; // 4.8px -> 0.6px

            trailCtx.beginPath();
            trailCtx.lineWidth = strokeWidth;
            trailCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            trailCtx.moveTo(p0.x, p0.y);
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            trailCtx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            trailCtx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", resizeTrailCanvas);

      renderer.dispose();
      shankGeom.dispose();
      knurlGeom.dispose();
      collarGeom.dispose();
      shaftGeom.dispose();
      rubyGeom.dispose();
      steelMaterial.dispose();
      darkColletMaterial.dispose();
      rubyTipMaterial.dispose();
    };
  }, []);

  return (
    <>
      {/* Wavy Ink Trail Canvas (fluid ribbon behind 3D tip) */}
      <canvas
        ref={trailCanvasRef}
        className="fixed inset-0 pointer-events-none z-[997]"
        aria-hidden="true"
      />

      {/* Precision Hard Contact Shadow Dot (beneath stylus tip) */}
      <div
        ref={shadowRef}
        className="fixed top-0 left-0 pointer-events-none z-[998] w-2 h-2 rounded-full bg-ink dark:bg-white/40 will-change-transform"
        style={{
          boxShadow: "0 0 2px rgba(24, 24, 27, 0.6)",
        }}
        aria-hidden="true"
      />

      {/* 3D CMM Probe Tool Viewport */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 pointer-events-none z-[999] select-none will-change-transform"
        style={{ width: 80, height: 80 }}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} width={80} height={80} className="block" />
      </div>
    </>
  );
}
