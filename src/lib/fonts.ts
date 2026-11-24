import localFont from "next/font/local";
import { Chivo_Mono, Hanken_Grotesk, Inter } from "next/font/google";

/** Uncut Sans — primary typeface in Figma (display + body). Self-hosted from @fontsource/uncut-sans. */
export const uncutSans = localFont({
  src: [
    { path: "../fonts/uncut-sans-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/uncut-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/uncut-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/uncut-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/uncut-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-uncut",
  display: "swap",
  // 5 weights: preloading them all competes with the LCP image on mobile; @font-face is inlined so discovery is immediate.
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial"],
});

/** Chivo Mono — labels, meta, nav (Figma: Chivo Mono Light/Regular/Medium/Bold). */
export const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-chivo-mono",
  display: "swap",
  preload: false,
});

/** Inter Medium — used by the About studio carousel quotes in Figma. */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-inter-face",
  display: "swap",
  preload: false,
});

/** Hanken Grotesk Medium — Works grid project titles in Figma. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-hanken-face",
  display: "swap",
  preload: false,
});
