import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollFlow from "@/components/3d/ScrollFlow";

// Self-hosted fonts (see src/app/fonts/NOTICE.txt) — no network dependency,
// builds fully offline. Instrument Serif carries the display voice; Inter
// handles body copy; JetBrains Mono is reserved for tiny technical labels.
const display = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", style: "normal", weight: "400" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", style: "italic", weight: "400" },
  ],
  variable: "--font-display",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono-jb",
  display: "swap",
  weight: "100 800",
});

const SITE_URL = "https://karwin.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Karwin — Systems Engineer & Builder",
    template: "%s — Karwin",
  },
  description:
    "Karwin is a CS student at VIT Chennai building blockchain ledgers, geospatial mapping tools, and LLM-powered developer tooling. Open to hackathons and collaboration.",
  keywords: [
    "Karwin",
    "k-a-r-s-a-n",
    "VIT Chennai",
    "Software Engineer",
    "Full-Stack Developer",
    "Solidity",
    "Blockchain",
    "GIS",
    "LLM",
  ],
  authors: [{ name: "Karwin", url: "https://github.com/k-a-r-s-a-n" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Karwin — Systems Engineer & Builder",
    title: "Karwin — Systems Engineer & Builder",
    description:
      "Blockchain ledgers, geospatial maps, and LLM tooling — built by a CS student at VIT Chennai. Open to hackathons and collaboration.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Karwin — Systems Engineer & Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karwin — Systems Engineer & Builder",
    description:
      "Blockchain ledgers, geospatial maps, and LLM tooling — built by a CS student at VIT Chennai.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

/**
 * Runs before first paint. The boot curtain plays on every load — it is the
 * signature moment — except for reduced-motion visitors, who get `skip-boot`
 * (page shown instantly, no animation). Everyone else gets `is-booting` so
 * the page stays hidden until the curtain lifts.
 */
const bootstrapScript = `
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('skip-boot');
  } else {
    document.documentElement.classList.add('is-booting');
  }
  // Failsafe: the boot state MUST never outlive this timer, even if a JS
  // chunk fails to load (offline, stale deploy, flaky network). Without
  // this, a failed bundle leaves the header unclickable (visibility:hidden)
  // forever. Inline script = independent of every downloaded asset.
  setTimeout(function () {
    document.documentElement.classList.remove('is-booting');
  }, 5000);
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body
        className="relative overflow-x-hidden bg-bg font-sans text-ink antialiased selection:bg-accent selection:text-bg"
        style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Atmosphere + film grain */}
        <ScrollFlow />
        <div className="grain" aria-hidden="true" />

        <Preloader />
        <SmoothScrollProvider>
          <Navbar />
          <main id="main-content" className="relative z-10 flex min-h-screen flex-col">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
