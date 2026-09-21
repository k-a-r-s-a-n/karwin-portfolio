"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { motion, useReducedMotion, type MotionValue } from "framer-motion";
import { useBootedReveal } from "@/components/ui/AnimatedText";
import * as THREE from "three";

interface SceneContentProps {
  scrollProgress: MotionValue<number>;
  isStatic: boolean;
}

/**
 * The sculpture: a slowly undulating dark-chrome sphere with an orbital ring
 * and drifting particles. Reacts to pointer (parallax tilt) and scroll
 * (rotation + drift). All procedural — no external HDR/model downloads, so
 * it works offline.
 */
function SceneContent({ scrollProgress, isStatic }: SceneContentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const { pointer, size } = useThree();

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const scroll = scrollProgress.get();

    // Base placement: right of center on wide screens, centered on mobile.
    const targetX = size.width > 900 ? 1.9 : 0;
    const targetScale = size.width > 900 ? 1 : 0.62;
    group.position.x = THREE.MathUtils.damp(group.position.x, targetX, 4, delta);
    const s = THREE.MathUtils.damp(group.scale.x, targetScale, 4, delta);
    group.scale.setScalar(s);

    if (!isStatic) {
      // Scroll drives the main rotation; pointer adds a gentle parallax tilt.
      group.rotation.y = scroll * Math.PI * 1.4 + state.clock.elapsedTime * 0.08;
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        pointer.y * 0.22 + scroll * 0.5,
        5,
        delta
      );
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, -pointer.x * 0.12, 5, delta);

      // Parallax drift upward as the visitor scrolls away.
      group.position.y = THREE.MathUtils.damp(group.position.y, scroll * 2.2, 4, delta);

      if (ringRef.current) ringRef.current.rotation.z = state.clock.elapsedTime * 0.25;
      if (ring2Ref.current) ring2Ref.current.rotation.z = -state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={isStatic ? 0 : 1.4} rotationIntensity={isStatic ? 0 : 0.35} floatIntensity={isStatic ? 0 : 0.9}>
        {/* Central sculpture */}
        <mesh>
          <sphereGeometry args={[1.7, 96, 96]} />
          <MeshDistortMaterial
            color="#151517"
            metalness={0.85}
            roughness={0.22}
            distort={isStatic ? 0.24 : 0.38}
            speed={isStatic ? 0 : 1.6}
            envMapIntensity={0.6}
          />
        </mesh>

        {/* Orbital rings */}
        <mesh ref={ringRef} rotation={[Math.PI / 2.35, 0.35, 0]}>
          <torusGeometry args={[2.85, 0.012, 16, 200]} />
          <meshStandardMaterial color="#c9f158" emissive="#c9f158" emissiveIntensity={1.6} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 1.8, -0.5, 0.4]}>
          <torusGeometry args={[3.35, 0.006, 16, 200]} />
          <meshStandardMaterial color="#8f8f8a" emissive="#8f8f8a" emissiveIntensity={0.5} metalness={0.6} roughness={0.4} />
        </mesh>
      </Float>

      {/* Drifting particles */}
      <Sparkles count={110} scale={[9, 7, 6]} size={1.6} speed={isStatic ? 0 : 0.28} color="#c9f158" opacity={0.55} />
      <Sparkles count={70} scale={[12, 9, 8]} size={2.4} speed={isStatic ? 0 : 0.16} color="#f2f1ec" opacity={0.28} />
    </group>
  );
}

export default function HeroScene({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const sceneIn = useBootedReveal(0.25);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={sceneIn ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Light rig — no external environment maps (offline-safe) */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 6, 8]} intensity={2.6} color="#ffffff" />
        <pointLight position={[-6, -3, -6]} intensity={26} color="#c9f158" distance={20} />
        <pointLight position={[7, -4, 4]} intensity={10} color="#7c8cff" distance={18} />
        <SceneContent scrollProgress={scrollProgress} isStatic={!!shouldReduceMotion} />
      </Canvas>
    </motion.div>
  );
}
