/** Works page copy — verbatim from Figma frame 5740:93418 ("Works – Thumbnails (Coming soon)"). */

export const WORKS = {
  title: "Work That Starts With People",
  intro:
    "We don’t just deliver projects, we build with people. Here’s what we’ve made together, and the teams who trusted us to make it.",
  filters: ["All", "Consumer", "Enterprise", "AI", "Web", "Mobile", "Research", "Brand", "Design System", "CX", "Strategy"],
  count: "28 projects",
  /** every project is marked like this for now (the glass pill on each thumbnail, 5751:106866) */
  badge: "Coming Soon",
  featured: {
    label: "AIRPORT SUPER APP",
    title: "Bengaluru International Airport",
    description: "Reimagining how 40M+ viewers discover content through behaviour-aware Al.",
    cta: "Read More",
    /** the card is built from its Figma layers (5740:95311) so each can move on its own */
    layers: {
      plane: { src: "/images/work/bial-plane.webp", w: 1568, h: 714 },
      phone: { src: "/images/work/bial-phone.webp", w: 1051, h: 1500 },
      flight: { src: "/images/work/bial-flight.webp", w: 1165, h: 432 },
      care: { src: "/images/work/bial-care.webp", w: 962, h: 436 },
    },
    alt: "Bengaluru International Airport’s Pulse app: the “Welcome to Bengaluru” home screen, an EZPass security-slot card and the Care by BLR services, beside a plane in flight",
  },
  allWork: "All Work",
  /** Grid order as laid out in Figma (two columns, left → right, top → bottom). Names and tags are
   *  as written under each thumbnail in the design. */
  projects: [
    { name: "MyAdhaar", meta: "Mobile · Security  ·  2024", key: "aadhaar", image: "/images/work/w-aadhaar.webp", alt: "myAadhaar website on a laptop and phone: “Welcome to myAadhaar” with service shortcuts" },
    { name: "Mom Verse", meta: "AI · Enterprise  ·  2025", key: "momverse", image: "/images/work/w-momverse.webp", alt: "Mom Verse brand and app: a pregnant woman on her phone beside the community post screen" },
    { name: "Amazon Now", meta: "AI · Consumer  ·  2025", key: "amazon-now", image: "/images/work/w-amazon-now.webp", alt: "Amazon Now quick-commerce app on a phone among groceries, with an “Arriving in 10 mins” card" },
    { name: "Juice AI", meta: "Consumer · Brand  ·  2025", key: "juice-ai", image: "/images/work/w-juice-ai.webp", alt: "Juice AI insights screen generating a “Glass lips beat matte” ad insight on a yellow background" },
    { name: "Quickplay", meta: "Enterprise · Mobile  ·  2024", key: "quickplay", image: "/images/work/w-quickplay.webp", alt: "Quickplay screens: a live basketball stream on a phone and the widget builder on a tablet" },
    { name: "Setu App", meta: "Consumer · Mobile  ·  2024", key: "sbi-life", image: "/images/work/w-sbi-life.webp", alt: "SBI Life eShield Next protection-plan screens on three phones" },
    { name: "Hurun India", meta: "Consumer · Brand  ·  2025", key: "aokah", image: "/images/work/w-aokah.webp", alt: "Aokah location explorer dashboard with city recommendations and a “Need expert guidance?” card" },
    { name: "Amazon MiniTV", meta: "AI · Enterprise  ·  2025", key: "hurun", image: "/images/work/w-hurun.webp", alt: "Hurun India website on a phone over gold line illustrations: “Promoting Indian Entrepreneurship”" },
    { name: "Vault", meta: "Mobile · Security  ·  2024", key: "ask", image: "/images/work/w-ask.webp", alt: "ASK Wealth app “Investment Filters” screen over Mumbai’s sea link at night: “Led by foresight realized by expertise”" },
    { name: "Generative TV", meta: "AI · Consumer  ·  2025", key: "minitv", image: "/images/work/w-minitv.webp", alt: "Amazon miniTV app with zodiac show picks, Mini Laughs memes and a show notification" },
    { name: "Setu App", meta: "Enterprise · Mobile  ·  2024", key: "setu", image: "/images/work/w-setu.webp", alt: "Setu wellness app held in hand: movement-days progress, supplement subscription and science cards" },
    { name: "Godrej Wealth", meta: "Consumer · Mobile  ·  2024", key: "godrej", image: "/images/work/w-godrej.webp", alt: "Godrej wealth app portfolio screens and insight cards: “Opportunities that reflect your behaviour”" },
  ],
};

/** "Consumer · Brand  ·  2025" → { tags: ["Consumer", "Brand"], year: "2025" } */
export function parseMeta(meta: string) {
  const parts = meta.split("·").map((s) => s.trim());
  return { tags: parts.slice(0, -1), year: parts[parts.length - 1] };
}
