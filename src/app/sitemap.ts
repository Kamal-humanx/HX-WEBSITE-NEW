import type { MetadataRoute } from "next";
import { PAGE_META } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const priority: Record<string, number> = { "/": 1, "/works": 0.9, "/about": 0.8, "/contact": 0.8, "/careers": 0.7 };
  return Object.values(PAGE_META).map((p) => ({
    url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priority[p.path] ?? 0.5,
  }));
}
