"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface InteractiveButtonProps {
  as?: "button" | "a";
  variant?: "primary" | "ghost";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

export default function InteractiveButton({
  as = "button",
  variant = "primary",
  href,
  target,
  rel,
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}: InteractiveButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantClasses =
    variant === "primary"
      ? "bg-accent text-bg font-semibold hover:brightness-110"
      : "border border-line text-ink font-medium hover:border-accent/60 hover:text-accent";

  const spring = shouldReduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 400, damping: 22 };

  const content = (
    <motion.span
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={spring}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-colors duration-200 ${variantClasses} ${className}`}
    >
      {children}
    </motion.span>
  );

  if (as === "a") {
    const resolvedRel = target === "_blank" ? rel ?? "noopener noreferrer" : rel;
    return (
      <a
        href={href}
        target={target}
        rel={resolvedRel}
        onClick={onClick}
        aria-label={ariaLabel}
        className="inline-block"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-block"
    >
      {content}
    </button>
  );
}
