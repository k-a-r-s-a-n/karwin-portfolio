import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/cursor/CustomCursor";
import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollFlow from "@/components/3d/ScrollFlow";

// Self-hosted variable fonts (see src/app/fonts/NOTICE.txt). No network request
// to Google Fonts at build time or runtime — the site builds fully offline.
const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "300 700",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

/**
 * Runs before first paint so there is never a theme flash, and so the boot
 * overlay can be skipped without a flicker:
 *  - restores the saved theme (or follows the OS preference)
 *  - marks repeat visits with `skip-boot` so the Preloader only runs once
 *    per browser session, and never for reduced-motion visitors
 *  - marks booting state so the page stays hidden until the overlay lifts
 */
const bootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem('karwin-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    document.documentElement.classList.remove('dark');
  }
  try {
    var booted = sessionStorage.getItem('karwin-booted');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (booted || reduced) {
      document.documentElement.classList.add('skip-boot');
    } else {
      document.documentElement.classList.add('is-booting');
    }
  } catch (e) {}
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
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body
        className="bg-chassis text-ink antialiased overflow-x-hidden font-sans relative selection:bg-safety-orange selection:text-white"
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>

        <ThemeProvider>
          {/* Scroll-Linked Ambient Background Flow (atmospheric drift layer) */}
          <ScrollFlow />

          <Preloader />
          <SmoothScrollProvider>
            <CustomCursor />
            <Navbar />
            <main
              id="main-content"
              className="relative z-10 min-h-screen flex flex-col"
            >
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
