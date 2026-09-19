"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import GlassSurface from "@/components/ui/GlassSurface";
import WindowShadeToggle from "@/components/ui/WindowShadeToggle";
import InteractiveButton from "@/components/ui/InteractiveButton";

const NAV_CHANNELS = [
  { ch: "CH-01", label: "ABOUT", href: "#about", id: "about" },
  { ch: "CH-02", label: "PROJECTS", href: "#projects", id: "projects" },
  { ch: "CH-03", label: "SPECS", href: "#skills", id: "skills" },
  { ch: "CH-04", label: "METRICS", href: "#stats", id: "stats" },
  { ch: "CH-05", label: "DISPATCH", href: "#contact", id: "contact" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "projects", "skills", "stats", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <GlassSurface
        as="header"
        className="fixed top-0 left-0 right-0 z-40 border-b border-seam"
      >
        {/* Hardware Status Strip */}
        <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-panel-recess/80 border-b border-seam text-[10px] font-mono text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-safety-green inline-block animate-pulse" />
              BUS STATUS: 200 OK
            </span>
            <span>&bull;</span>
            <span>STYLUS TOLERANCE: ±0.002mm</span>
            <span>&bull;</span>
            <span>NODE: AMOY TESTNET</span>
          </div>
          <div className="flex items-center gap-4">
            <span>VIT CHENNAI &bull; CSE '29</span>
            <span>&bull;</span>
            <span>COORDS: 12.8406° N, 80.1534° E</span>
          </div>
        </div>

        {/* Primary Rack Control Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Machine Header ID */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "#hero")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-7 h-7 bg-ink text-surface flex items-center justify-center font-mono font-bold text-xs">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base tracking-tight text-ink group-hover:text-accent transition-colors">
                KARWIN
              </span>
              <span className="font-mono text-[9px] text-ink-muted tracking-wider -mt-1">
                HARDWARE WORKSTATION // REV 2.4
              </span>
            </div>
          </a>

          {/* Industrial Channel Switcher */}
          <nav className="hidden md:flex items-center divide-x divide-seam border border-seam bg-surface/90">
            {NAV_CHANNELS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`px-4 py-2 font-mono text-xs flex items-center gap-1.5 transition-colors relative ${
                    isActive
                      ? "bg-ink text-surface font-bold"
                      : "text-ink/80 hover:bg-panel-recess hover:text-ink"
                  }`}
                >
                  <span className={isActive ? "text-accent" : "text-ink-muted"}>
                    {item.ch}
                  </span>
                  <span>{item.label}</span>
                </motion.a>
              );
            })}
          </nav>

          {/* Right Action: Airplane Window Shade Toggle + Safety Orange Actuator */}
          <div className="flex items-center gap-3">
            {/* Airplane-Window Theme Toggle (Section 2) */}
            <WindowShadeToggle />

            {/* Transmit Dispatch Primary CTA with shimmer sweep */}
            <div className="hidden lg:block">
              <InteractiveButton
                as="a"
                href="#contact"
                variant="primary"
                isPrimary={true}
                onClick={(e) => scrollToSection(e as any, "#contact")}
                className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider"
              >
                <span>TRANSMIT DISPATCH</span>
                <ArrowUpRight size={13} />
              </InteractiveButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-seam bg-surface text-ink hover:border-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </GlassSurface>

      {/* Mobile Control Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-40 bg-chassis border-b border-seam md:hidden px-6 py-6 shadow-md flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-col border border-seam divide-y divide-seam bg-surface">
              {NAV_CHANNELS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="px-4 py-3 font-mono text-xs text-ink flex items-center justify-between hover:bg-panel-recess transition-colors"
                >
                  <span className="font-bold text-accent">{item.ch}</span>
                  <span className="font-semibold">{item.label}</span>
                  <span>→</span>
                </a>
              ))}
            </div>

            <InteractiveButton
              as="a"
              href="#contact"
              variant="primary"
              isPrimary={true}
              onClick={(e) => scrollToSection(e as any, "#contact")}
              className="w-full text-center py-3 font-mono text-xs font-bold uppercase"
            >
              INITIATE DISPATCH
            </InteractiveButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
