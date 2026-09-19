import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/cursor/CustomCursor";
import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollFlow from "@/components/3d/ScrollFlow";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KARWIN // INDUSTRIAL SYSTEMS & CONTROL PANEL",
  description:
    "Engineering workstation of Karwin (k-a-r-s-a-n) — CS student at VIT Chennai building tamper-proof blockchain ledgers, geospatial node networks, and autonomous AI agents.",
  keywords: [
    "Karwin",
    "k-a-r-s-a-n",
    "VIT Chennai",
    "Systems Engineer",
    "Solidity",
    "Polygon Amoy",
    "GIS",
    "Hardware Control Panel",
  ],
  authors: [{ name: "Karwin", url: "https://github.com/k-a-r-s-a-n" }],
};

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('karwin-theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="bg-chassis text-ink antialiased overflow-x-hidden font-sans relative selection:bg-safety-orange selection:text-white"
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Scroll-Linked Ambient Background Flow (atmospheric drift layer) */}
          <ScrollFlow />

          <Preloader />
          <SmoothScrollProvider>
            <CustomCursor />
            <Navbar />
            <main className="relative z-10 min-h-screen flex flex-col">{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
