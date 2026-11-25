import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Explicitly welcomes search + answer-engine crawlers. */
export default function robots(): MetadataRoute.Robots {
  const aiAndSearchBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Googlebot", "Bingbot"];
  return {
    rules: [
      ...aiAndSearchBots.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api/", "/admin"] })),
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
