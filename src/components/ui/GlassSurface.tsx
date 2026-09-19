"use client";

import React, { useState } from "react";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  distort?: boolean;
  intensity?: "normal" | "subtle" | "heavy";
  interactive?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  // Anchor/link props
  href?: string;
  target?: string;
  rel?: string;
  // Form element props
  type?: string;
  disabled?: boolean;
  // Accessibility
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
  // Motion / animation props (passed through for framer-motion)
  [key: string]: unknown;
}

export default function GlassSurface({
  children,
  className = "",
  as: Component = "div",
  distort = false,
  intensity = "normal",
  interactive = false,
  style = {},
  onMouseEnter,
  onMouseLeave,
  ...props
}: GlassSurfaceProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (distort || interactive) {
      setIsHovered(true);
    }
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (distort || interactive) {
      setIsHovered(false);
    }
    if (onMouseLeave) onMouseLeave(e);
  };

  // Optical chromatic displacement on hover when distort={true}
  const distortStyle: React.CSSProperties =
    distort && isHovered
      ? {
          transform: "scale(1.01) translateY(-1px)",
          transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        }
      : distort
      ? {
          transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        }
      : {};

  return (
    <Component
      className={`relative isolate transition-all duration-300 ${className}`}
      style={{
        backgroundColor: "var(--glass-bg)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow: "var(--glass-inner-highlight), var(--glass-shadow)",
        ...distortStyle,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 
        1px Gradient Border simulating implied top-left light source.
        Uses dual-mask composite technique to avoid border-image radius clipping.
        pointer-events-none + absolute so it never captures clicks or obscures content.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, var(--glass-border-start) 0%, var(--glass-border-end) 100%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          zIndex: 0,
        }}
      />

      {/* Surface Content: no height constraint so it naturally sizes to children */}
      <div className="relative">{children}</div>
    </Component>
  );
}
