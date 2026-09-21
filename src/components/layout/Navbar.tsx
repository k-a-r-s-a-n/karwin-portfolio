"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useBootedReveal } from "@/components/ui/AnimatedText";

const LINKS = [
  { label: "About", href: "#about", id: "about" },
  { label: "Work", href: "#work", id: "work" },
  { label: "Stack", href: "#stack", id: "stack" },
  { label: "Numbers", href: "#stats", id: "stats" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navIn = useBootedReveal(0.4);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      for (const { id } of LINKS) {
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape closes the mobile menu and returns focus to the trigger.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const goTo = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={navIn ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:top-5"
      >
        <nav
          className={`flex items-center gap-1 rounded-full border py-2 pl-5 pr-2 backdrop-blur-xl transition-colors duration-500 ${
            scrolled ? "border-line bg-bg/75" : "border-transparent bg-bg/40"
          }`}
          aria-label="Primary"
        >
          <a
            href="#hero"
            onClick={(e) => goTo(e, "#hero")}
            className="mr-3 font-serif text-lg text-ink transition-colors hover:text-accent"
          >
            K<span className="text-accent">.</span>
          </a>

          <div className="hidden items-center md:flex">
            {LINKS.map(({ label, href, id }) => (
              <a
                key={id}
                href={href}
                onClick={(e) => goTo(e, href)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
                  activeSection === id
                    ? "bg-raised text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            onClick={(e) => goTo(e, "#contact")}
            className="ml-2 hidden rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-bg transition-all hover:brightness-110 md:inline-block"
          >
            Let&apos;s talk
          </a>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-bg/95 px-8 backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-2">
              {LINKS.map(({ label, href }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={href}
                    onClick={(e) => goTo(e, href)}
                    className="block border-b border-line py-4 font-serif text-4xl text-ink transition-colors hover:text-accent"
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-faint"
            >
              Chennai, India — Open to build
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
