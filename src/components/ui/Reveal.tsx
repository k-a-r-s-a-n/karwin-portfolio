"use client";

import React from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";

/**
 * Static map of motion components.
 *
 * These are created once at module scope on purpose: calling `motion(as)` inside
 * the render body produces a brand-new component type on every render, which
 * makes React unmount and remount the whole subtree (state resets, animations
 * restart).
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  ul: motion.ul,
  li: motion.li,
  span: motion.span,
} as const;

type MotionTag = keyof typeof MOTION_TAGS;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  y?: number;
  as?: MotionTag;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.08,
  y = 24,
  as = "div",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = MOTION_TAGS[as] ?? motion.div;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Honour the OS "reduce motion" setting: render the content immediately.
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div variants={itemVariants} className="w-full">
            {child}
          </motion.div>
        );
      })}
    </MotionComponent>
  );
}

export function RevealItem({
  children,
  className = "",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
