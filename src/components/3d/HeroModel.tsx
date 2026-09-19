"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.8, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "default",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Shadow maps disabled for performance — barely visible but costly
    renderer.shadowMap.enabled = false;

    // 3-Point Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4d4d8, 1.2);
    fillLight.position.set(-6, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xff3322, 3.5, 20, Math.PI / 4, 0.4);
    rimLight.position.set(-4, -2, 6);
    scene.add(rimLight);

    // Shadow plane removed (shadows disabled for perf)

    // ─── Industrial Logic Board / Node Cluster Assembly ───
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);
    rootAssembly.rotation.x = 0.55;
    rootAssembly.rotation.y = -0.45;

    // Materials (Matte injection-molded plastic & milled aluminum)
    const pcbMaterial = new THREE.MeshStandardMaterial({
      color: 0x27272a, // matte zinc-800
      roughness: 0.85,
      metalness: 0.15,
    });
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7, // milled aluminum
      roughness: 0.35,
      metalness: 0.75,
    });
    const darkChipMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b, // matte black silicon package
      roughness: 0.7,
      metalness: 0.2,
    });
    const safetyOrangeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3322, // safety orange terminal header
      roughness: 0.4,
      metalness: 0.1,
    });
    const goldPinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706, // gold connector pins
      roughness: 0.2,
      metalness: 0.9,
    });

    // ─── TIER 1: Bottom Base PCB Layer ───
    const basePcbGroup = new THREE.Group();
    rootAssembly.add(basePcbGroup);

    const boardGeom = new THREE.BoxGeometry(4.2, 0.15, 3.2);
    const boardMesh = new THREE.Mesh(boardGeom, pcbMaterial);
    boardMesh.receiveShadow = true;
    basePcbGroup.add(boardMesh);

    // Standoff corner mounting posts
    const standoffGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12);
    const cornerPositions: [number, number][] = [
      [-1.9, -1.4],
      [1.9, -1.4],
      [-1.9, 1.4],
      [1.9, 1.4],
    ];
    cornerPositions.forEach(([x, z]) => {
      const post = new THREE.Mesh(standoffGeom, aluminumMaterial);
      post.position.set(x, -0.15, z);
      basePcbGroup.add(post);
    });

    // Integrated bus routing tracks (subtle milled channels on base)
    const traceGeom = new THREE.BoxGeometry(3.6, 0.02, 0.08);
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      const trace = new THREE.Mesh(traceGeom, goldPinMaterial);
      trace.position.set(0, 0.085, i);
      basePcbGroup.add(trace);
    }

    // ─── TIER 2: Middle Processor & Heatsink Tier ───
    const middleProcessorGroup = new THREE.Group();
    rootAssembly.add(middleProcessorGroup);

    // Central Cryptographic Processing Unit (CPU)
    const cpuGeom = new THREE.BoxGeometry(1.5, 0.2, 1.5);
    const cpuMesh = new THREE.Mesh(cpuGeom, aluminumMaterial);
    cpuMesh.position.set(-0.6, 0.18, 0);
    cpuMesh.castShadow = true;
    middleProcessorGroup.add(cpuMesh);

    // Finned Heat Sink on CPU
    const finGeom = new THREE.BoxGeometry(0.06, 0.45, 1.4);
    for (let f = -0.55; f <= 0.55; f += 0.15) {
      const fin = new THREE.Mesh(finGeom, aluminumMaterial);
      fin.position.set(-0.6 + f, 0.48, 0);
      fin.castShadow = true;
      middleProcessorGroup.add(fin);
    }

    // Secondary Auxiliary IC Chips (Flash / Ledger State Registers)
    const auxPositions: [number, number, number, number][] = [
      [1.1, 0.8, 0.8, 0.8],
      [1.1, -0.6, 0.8, 1.1],
      [-1.4, -0.8, 0.7, 0.5],
    ];
    auxPositions.forEach(([x, z, w, d]) => {
      const icGeom = new THREE.BoxGeometry(w, 0.15, d);
      const icMesh = new THREE.Mesh(icGeom, darkChipMaterial);
      icMesh.position.set(x, 0.15, z);
      icMesh.castShadow = true;
      middleProcessorGroup.add(icMesh);
    });

    // ─── TIER 3: Top Connector & Header Array (Explodes Highest) ───
    const topArrayGroup = new THREE.Group();
    rootAssembly.add(topArrayGroup);

    // Safety Orange Dual Terminal Blocks
    const terminalGeom = new THREE.BoxGeometry(0.8, 0.5, 0.5);
    const terminalA = new THREE.Mesh(terminalGeom, safetyOrangeMaterial);
    terminalA.position.set(1.4, 0.4, -1.1);
    terminalA.castShadow = true;
    topArrayGroup.add(terminalA);

    const terminalB = new THREE.Mesh(terminalGeom, safetyOrangeMaterial);
    terminalB.position.set(0.4, 0.4, -1.1);
    terminalB.castShadow = true;
    topArrayGroup.add(terminalB);

    // Top Protective Aluminum Baffle with Cutout Vents
    const baffleGeom = new THREE.BoxGeometry(2.4, 0.08, 2.0);
    const baffleMesh = new THREE.Mesh(baffleGeom, aluminumMaterial);
    baffleMesh.position.set(0.3, 0.9, 0.2);
    baffleMesh.castShadow = true;
    topArrayGroup.add(baffleMesh);

    // Safety Orange Core Status Indicator Block
    const indicatorGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const indicatorMesh = new THREE.Mesh(indicatorGeom, safetyOrangeMaterial);
    indicatorMesh.position.set(1.2, 1.05, 0.9);
    indicatorMesh.castShadow = true;
    topArrayGroup.add(indicatorMesh);

    // Clock for framerate-independent damping
    const clock = new THREE.Clock();

    // Mouse Parallax & Scroll Exploded View State
    let targetRotY = -0.45;
    let targetRotX = 0.55;
    let currentRotY = targetRotY;
    let currentRotX = targetRotX;

    let targetExplode = 0;
    let currentExplode = 0;

    let containerRect = container.getBoundingClientRect();

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX - containerRect.left) / (containerRect.width || 1) - 0.5;
      const ny = (e.clientY - containerRect.top) / (containerRect.height || 1) - 0.5;

      targetRotY = -0.45 + nx * 0.7;
      targetRotX = 0.55 + ny * 0.45;
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      containerRect = container.getBoundingClientRect();
      // Explode smoothly over first 500px of scroll
      const factor = Math.min(Math.max(scrollY / 450, 0), 1);
      targetExplode = factor;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pause animation when model is off-screen
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => { isVisible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      containerRect = container.getBoundingClientRect();
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip rendering when scrolled out of view
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);

      // Framerate-independent smooth parallax damping (eliminates 60Hz vs 144Hz shake)
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 6, delta);
      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX, 6, delta);
      rootAssembly.rotation.y = currentRotY;
      rootAssembly.rotation.x = currentRotX;

      // Smooth clock-based resting idle float
      rootAssembly.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.08;

      // Exploded View Assembly Disassembly Math
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 8, delta);

      // Base layer drops downwards on Y and pushes back
      basePcbGroup.position.y = -currentExplode * 0.85;
      basePcbGroup.position.z = -currentExplode * 0.4;

      // Middle layer holds core center
      middleProcessorGroup.position.y = 0;

      // Top tier lifts upwards on Y and forward on Z to expose architecture
      topArrayGroup.position.y = currentExplode * 1.4;
      topArrayGroup.position.z = currentExplode * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      boardGeom.dispose();
      standoffGeom.dispose();
      traceGeom.dispose();
      cpuGeom.dispose();
      finGeom.dispose();
      terminalGeom.dispose();
      baffleGeom.dispose();
      indicatorGeom.dispose();

      pcbMaterial.dispose();
      aluminumMaterial.dispose();
      darkChipMaterial.dispose();
      safetyOrangeMaterial.dispose();
      goldPinMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
}
