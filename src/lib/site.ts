/**
 * Site-wide constants. On-page copy in this file is FROZEN — taken verbatim from Figma.
 * Only `metaTitle` / `metaDescription` strings (in src/lib/seo.ts) are newly written.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanx.io").replace(/\/$/, "");

export const SITE_NAME = "HumanX";
/** Legal name, from the footer: "© 2026 Human Experience Pvt. Ltd. All Rights Reserved" */
export const LEGAL_NAME = "Human Experience Pvt. Ltd.";
export const EMAIL = "hello@humanx.io";

/** Contact page — "Where We Are" card */
export const ADDRESS = {
  label: "HumanX",
  full: "201, Chintamani Avenue, near Virwani Industrial Estate, Vishveshwar Nagar, Goregaon East, Mumbai, Maharashtra 400063",
  streetAddress: "201, Chintamani Avenue, near Virwani Industrial Estate, Vishveshwar Nagar, Goregaon East",
  addressLocality: "Mumbai",
  addressRegion: "Maharashtra",
  postalCode: "400063",
  addressCountry: "IN",
  hours: "Mon–Fri: 9:00–19:00 IST",
};

/**
 * Social profiles shown in the footer. The design names them but gives no URLs.
 * TODO(content): add the real profile URLs. Until then they render as plain text
 * and are left out of Organization.sameAs (no fabricated URLs).
 */
export const SOCIAL: { label: string; href?: string }[] = [
  { label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { label: "Twitter/X", href: process.env.NEXT_PUBLIC_TWITTER_URL },
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/works", label: "Work" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_COPY = {
  manifesto:
    "We are a CX Design and Tech studio that shapes digital experiences with a human edge. We partner with global CXOs who seek to build future ready experiences.",
  letsTalk: "Let’s talk",
  askAi: "Ask AI for Summary:",
  copyright: "© 2026 Human Experience Pvt. Ltd. All Rights Reserved",
};
