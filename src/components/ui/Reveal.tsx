"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  yOffset?: number;
  as?: React.ElementType;
}

const defaultItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Reveal({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
  duration = 0.6,
  yOffset = 40,
  as = "div",
}: RevealProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const MotionComponent = motion(as as any);

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

        // If child is a RevealItem, leave as is (it attaches itemVariants)
        // Otherwise wrap in motion.div with itemVariants
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
    <motion.div variants={variants || defaultItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
