# Karwin — Portfolio

Personal portfolio of **Karwin ([@k-a-r-s-a-n](https://github.com/k-a-r-s-a-n))** — CS student at VIT Chennai building blockchain ledgers, geospatial tools, and LLM-powered developer tooling.

The site is styled as an **industrial control panel**: seam-bordered panels, riveted surfaces, safety-orange actuators, and a CNC "exploded view" logic board rendered in Three.js that disassembles as you scroll.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **Three.js** — hero viewport (lazy-loaded, single WebGL context)
- **Framer Motion** — reveals, modal, scroll-linked atmosphere
- **Lenis** — smooth scrolling (skipped for reduced-motion users)
- Self-hosted variable fonts (Space Grotesk, JetBrains Mono) — no Google Fonts network dependency; builds fully offline

Content lives in `src/data/*.json` — projects, skills, profile, and stats are data, not markup.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # production build
npm run lint    # eslint
```

## Engineering notes

- **Accessibility**: skip link, visible focus rings, focus-trapped project modal, `aria-pressed` filters, reduced-motion support throughout (preloader, smooth scroll, 3D, cursor all opt out).
- **Performance**: one WebGL context (the hero), images resized to display dimensions, no third-party runtime requests (fonts, stats, and social card are all first-party).
- **Theming**: light/dark via CSS variables; an inline pre-paint script prevents flash and decides whether the boot overlay should run (first visit per session, never with reduced motion).

## Deploy

Any Next.js-capable host. On Vercel: import the repo and deploy with defaults.

---

© Karwin. Code is MIT-licensed (see `LICENSE`).
