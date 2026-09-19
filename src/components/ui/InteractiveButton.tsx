"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import GlassSurface from "@/components/ui/GlassSurface";

export interface InteractiveButtonProps {
  as?: "button" | "a";
  variant?: "primary" | "secondary" | "outline" | "glass";
  isPrimary?: boolean;
  distort?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

export default function InteractiveButton({
  as = "button",
  variant = "primary",
  isPrimary = false,
  distort = false,
  href,
  target,
  rel,
  onClick,
  children,
  className = "",
  style = {},
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}: InteractiveButtonProps) {
  const [isShimmering, setIsShimmering] = useState(false);
  const showShimmer = isPrimary || variant === "primary";

  const handleHoverStart = () => {
    if (showShimmer) {
      setIsShimmering(true);
    }
  };

  const handleHoverEnd = () => {
    if (showShimmer) {
      setIsShimmering(false);
    }
  };

  // Base styling for variant
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "bg-safety-orange hover:bg-[#E02817] text-white border border-safety-orange font-bold";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-panel-recess hover:bg-surface text-ink border border-seam hover:border-ink font-semibold";
  } else if (variant === "outline") {
    variantClasses =
      "bg-surface hover:bg-panel-recess text-ink border border-seam hover:border-accent font-semibold";
  } else if (variant === "glass") {
    variantClasses = "text-ink font-semibold";
  }

  const springTransition = {
    type: "spring" as const,
    stiffness: 350,
    damping: 20,
  };

  const content = (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={`relative inline-flex items-center justify-center select-none overflow-hidden transition-colors duration-250 ease-out cursor-pointer ${variantClasses} ${className}`}
      style={style}
    >
      {/* ─── Shimmer Sweep Diagonal Highlight (Primary CTAs only) ─── */}
      {showShimmer && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-30 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent ${
            isShimmering ? "animate-shimmer" : "hidden"
          }`}
          style={{ willChange: "transform" }}
        />
      )}

      {/* Button Children */}
      <span className="relative z-20 inline-flex items-center gap-2">{children}</span>
    </motion.div>
  );

  if (variant === "glass") {
    return (
      <GlassSurface
        distort={distort || isPrimary}
        as={as === "a" ? "a" : "button"}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={className}
      >
        {content}
      </GlassSurface>
    );
  }

  if (as === "a") {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
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
