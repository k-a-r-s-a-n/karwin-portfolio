# Karwin — Portfolio

Personal portfolio of **Karwin ([@k-a-r-s-a-n](https://github.com/k-a-r-s-a-n))** — CS student at VIT Chennai building blockchain ledgers, geospatial tools, and LLM-powered agents.

Dark, editorial, and alive: an Instrument Serif voice over a near-black canvas, a liquid-metal 3D sculpture rendered in real time with react-three-fiber, type that reveals itself as you scroll, and a film-grain finish.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **React Three Fiber + drei** — hero sculpture (lazy-loaded, single WebGL context, procedural — no external model/environment downloads)
- **Framer Motion** — masked type reveals, word-by-word paragraphs, tilt cards, counters, preloader
- **Lenis** — smooth scrolling (skipped for reduced-motion users)
- Self-hosted fonts: Instrument Serif (display), Inter variable (body), JetBrains Mono (labels) — builds fully offline

All content lives in `src/data/*.json` — projects, skills, profile, and stats are data, not markup.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # production build
npm run lint    # eslint
```

## Design notes

- **Type system** — serif display with italic accent phrases; body copy reveals word-by-word on scroll (`FadeWords`); headlines reveal char-by-char from mask lines (`SplitReveal`).
- **Splash** — plays on every load (skipped only for reduced-motion visitors via a pre-paint inline script), runs to 100%, waits for real page load, then lifts as the hero choreography begins.
- **3D** — distorted metallic sphere + orbit rings + particles; rotates with scroll, tilts with the pointer; renders one static frame under reduced motion.
- **Accessibility** — skip link, focus rings, focus-trapped modal, `aria-pressed`/`aria-live` where relevant, native cursor never hidden, all motion gated behind `prefers-reduced-motion`.

## Verification tooling

`scripts/` holds node-run audits (not part of the app bundle):

- `physics-check.ts` — simulates the splash-field solver headlessly and asserts settling, non-overlap, sweep response, and click bursts (`npx tsc scripts/physics-check.ts --outDir /tmp/phys --module commonjs --target es2020 --esModuleInterop --skipLibCheck --moduleResolution node && node /tmp/phys/scripts/physics-check.js`)
- `ui-audit.cjs`, `failsafe-audit.cjs`, `visual-probe2.cjs` — real-browser interaction audits (need `npm i -D puppeteer-core @sparticuz/chromium` and a running dev/prod server)

## Deploy

Any Next.js-capable host. Set `SITE_URL` in `src/app/layout.tsx` to the deployed URL so social tags resolve.

---

© Karwin. Code is MIT-licensed (see `LICENSE`).
