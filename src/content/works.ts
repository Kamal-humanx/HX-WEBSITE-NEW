/** Works page copy — verbatim from Figma frame 5376:7843 ("Works – A Editorial grid"). */

export const WORKS = {
  title: "Work That Starts With People",
  intro:
    "We don’t just deliver projects, we build with people. Here’s what we’ve made together, and the teams who trusted us to make it.",
  filters: ["All", "Consumer", "Enterprise", "AI", "Web", "Mobile", "Research", "Brand", "Design System", "CX", "Strategy"],
  count: "28 projects",
  featured: {
    label: "AIRPORT SUPER APP",
    title: "Bengaluru International Airport",
    description: "Reimagining how 40M+ viewers discover content through behaviour-aware Al.",
    cta: "Read More",
    image: "/images/work/bial-featured.webp",
    alt: "Bengaluru International Airport app: “Welcome to Bengaluru” home screen, EZPass security slot booking and flight tracking",
  },
  allWork: "All Work",
  /** Grid order as laid out in Figma (two columns, top → bottom). Duplicates are as designed. */
  projects: [
    { name: "Nothing", meta: "Consumer · Brand · 2025", image: "/images/work/nothing.webp", alt: "Amazon Now quick-commerce app on a phone held in hand" },
    { name: "Mom Verse", meta: "AI · Enterprise · 2025", image: "/images/work/momverse.webp", alt: "Mom Verse brand artwork: “Empowering your journey” beside a woman drinking from a glass", logo: true },
    { name: "MyAdhaar", meta: "Mobile · Security · 2024", image: "/images/work/myaadhaar.webp", alt: "Welcome to myAadhaar web portal with service shortcuts" },
    { name: "Juice AI", meta: "AI · Consumer · 2025", image: "/images/work/juice-ai.webp", alt: "Juice AI logo on a yellow background" },
    { name: "Quickplay", meta: "Enterprise · Mobile · 2024", image: "/images/work/quickplay.webp", alt: "Quickplay streaming app screens showing a live cricket match and the “Born Beautiful” title page" },
    { name: "Stream Discovery", meta: "Consumer · Mobile · 2024", image: "/images/work/stream-discovery.webp", alt: "Streaming discovery app screens with a short-video feed and a home screen of shows" },
    { name: "Nothing", meta: "Consumer · Brand · 2025", image: "/images/work/nothing.webp", alt: "Amazon Now quick-commerce app on a phone held in hand" },
    { name: "Work AI for All", meta: "AI · Enterprise · 2025", image: "/images/work/momverse.webp", alt: "Mom Verse brand artwork: “Empowering your journey” beside a woman drinking from a glass", logo: true },
    { name: "Vault", meta: "Mobile · Security · 2024", image: "/images/work/myaadhaar.webp", alt: "Welcome to myAadhaar web portal with service shortcuts" },
    { name: "Generative TV", meta: "AI · Consumer · 2025", image: "/images/work/juice-ai.webp", alt: "Juice AI logo on a yellow background" },
    { name: "Quickplay", meta: "Enterprise · Mobile · 2024", image: "/images/work/quickplay.webp", alt: "Quickplay streaming app screens showing a live cricket match and the “Born Beautiful” title page" },
    { name: "Stream Discovery", meta: "Consumer · Mobile · 2024", image: "/images/work/stream-discovery.webp", alt: "Streaming discovery app screens with a short-video feed and a home screen of shows" },
  ],
};

/** "Consumer · Brand · 2025" → { tags: ["Consumer", "Brand"], year: "2025" } */
export function parseMeta(meta: string) {
  const parts = meta.split("·").map((s) => s.trim());
  return { tags: parts.slice(0, -1), year: parts[parts.length - 1] };
}
