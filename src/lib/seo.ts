import type { Metadata } from "next";
import { ADDRESS, LEGAL_NAME, SITE_NAME, SITE_URL, SOCIAL } from "./site";

/**
 * Page titles + descriptions. These are the ONLY newly written strings in the project
 * (drafted from existing Figma copy) — listed in REPORT.md for review.
 */
export const PAGE_META = {
  home: {
    path: "/",
    title: "HumanX — CX Design and Tech Studio | Unmistakably Human",
    description:
      "HumanX is a CX Design and Tech studio that shapes digital experiences with a human edge. We partner with global CXOs who seek to build future ready experiences.",
  },
  about: {
    path: "/about",
    title: "About HumanX — We Partner With Ambitious Brands",
    description:
      "We partner with ambitious brands and challenge convention. Meet the HumanX team, the principles behind every decision we make, and what we bring to the table.",
  },
  works: {
    path: "/works",
    title: "Work — HumanX Projects and Case Studies",
    description:
      "Work that starts with people: Bengaluru International Airport, Mom Verse, Juice AI, MyAdhaar, Quickplay, Stream Discovery and more from the HumanX studio.",
  },
  careers: {
    path: "/careers",
    title: "Careers at HumanX — Open Design Roles in Mumbai",
    description:
      "Research the problem, try it with AI, prototype it, write the code, ship it. Explore open design roles at HumanX in Mumbai, from Product Design Intern to Design Lead.",
  },
  contact: {
    path: "/contact",
    title: "Contact HumanX — Start a Project",
    description:
      "Every great idea needs a co-conspirator. Tell us what brings you here, visit the HumanX studio in Goregaon East, Mumbai, or send us a message.",
  },
} as const;

export type PageKey = keyof typeof PAGE_META;

const OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "HumanX — CX Design and Tech studio" };

export function pageMetadata(key: PageKey): Metadata {
  const m = PAGE_META[key];
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: m.path },
    openGraph: {
      type: "website",
      url: m.path,
      siteName: SITE_NAME,
      title: m.title,
      description: m.description,
      locale: "en_IN",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [OG_IMAGE.url],
    },
  };
}

const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  const sameAs = SOCIAL.map((s) => s.href).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      "We are a CX Design and Tech studio that shapes digital experiences with a human edge. We partner with global CXOs who seek to build future ready experiences.",
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.streetAddress,
      addressLocality: ADDRESS.addressLocality,
      addressRegion: ADDRESS.addressRegion,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.addressCountry,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export function webPageSchema(key: PageKey, type: PageType, extra: Record<string, unknown> = {}) {
  const m = PAGE_META[key];
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${abs(m.path)}#webpage`,
    url: abs(m.path),
    name: m.title,
    description: m.description,
    inLanguage: "en",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    ...extra,
  };
}

export function breadcrumbSchema(key: PageKey, label: string) {
  const items = [{ name: "Home", path: "/" }];
  if (key !== "home") items.push({ name: label, path: PAGE_META[key].path });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export { abs as absoluteUrl, ORG_ID };
