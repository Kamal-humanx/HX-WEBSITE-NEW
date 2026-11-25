import type { MetadataRoute } from "next";
import { PAGE_META } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { CASE_STUDIES } from "@/content/caseStudies";

export default function sitemap(): MetadataRoute.Sitemap {
  const priority: Record<string, number> = { "/": 1, "/works": 0.9, "/about": 0.8, "/contact": 0.8, "/careers": 0.7 };
  const pages: MetadataRoute.Sitemap = Object.values(PAGE_META).map((p) => ({
    url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priority[p.path] ?? 0.5,
  }));
  /* project detail pages */
  return pages.concat(
    CASE_STUDIES.map((c) => ({ url: `${SITE_URL}/works/${c.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
  );
}
