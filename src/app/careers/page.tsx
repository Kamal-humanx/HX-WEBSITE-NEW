import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { CareersMotion, MOTION_GATE_SCRIPT } from "@/components/careers/CareersMotion";
import Hero from "@/components/careers/ref/Hero";
import Manifesto from "@/components/careers/ref/Manifesto";
import Gene from "@/components/careers/ref/Gene";
import OpenRoles from "@/components/careers/ref/OpenRoles";
import { CAREERS } from "@/content/careers";
import { ORG_ID, breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import "./careers-ref.css";
import "./careers.css";

export const metadata = pageMetadata("careers");

/**
 * Careers. Sections and interactions are ported from the approved interactions reference
 * (humanx-careers-page; handoff CAREERS-INTERACTIONS-HANDOFF.md): canvas hero, pinned manifesto with
 * three timed drawings, the Mutant Gene builder with its 3D helix, and the Openings list. The header
 * is the site-wide one; the footer is the site-wide one with its Careers option.
 * Motion only runs when `.hxc[data-motion]` is set (no reduced-motion preference).
 */
export default function CareersPage() {
  const jobPostings = CAREERS.openings.roles.map((r) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: r.role,
    // Only design-provided facts. datePosted/description/employmentType are not supplied (see REPORT.md).
    description: `<p>${r.role} — ${r.level} — ${r.location}</p>`,
    hiringOrganization: { "@id": ORG_ID, "@type": "Organization", name: "HumanX" },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: r.location, addressRegion: "Maharashtra", addressCountry: "IN" },
    },
    directApply: false,
  }));

  return (
    <>
      <Header current="/careers" theme="overlay" />
      <main id="main" className="hxc" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE_SCRIPT }} />
        <CareersMotion />
        <Hero />
        <Manifesto />
        <Gene />
        <OpenRoles />
      </main>
      <Footer variant="careers" />
      <JsonLd data={[webPageSchema("careers", "WebPage"), breadcrumbSchema("careers", "Careers"), ...jobPostings]} />
    </>
  );
}
