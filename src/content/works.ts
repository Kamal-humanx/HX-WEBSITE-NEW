/** Works page copy — verbatim from Figma frame 5740:93418 ("Works – Thumbnails (Coming soon)"). */

export const WORKS = {
  title: "Work That Starts With People",
  intro:
    "We don’t just deliver projects, we build with people. Here’s what we’ve made together, and the teams who trusted us to make it.",
  /** Filter pills: All, then the project categories (client list, Nov 2026), in that list's order.
   *  Each project's `cats` says where it appears. */
  filters: ["All", "Scale", "Content x Commerce", "B2B", "D2C", "New Age Platform", "AI", "Financial Services", "Media", "Website"],
  count: "28 projects",
  /** the glass pill on a thumbnail (Figma Frame 2147240663); shown unless a project sets soon: false */
  badge: "Coming Soon",
  featured: {
    label: "AIRPORT SUPER APP",
    title: "Bengaluru International Airport",
    description: "Reimagining how 40M+ viewers discover content through behaviour-aware Al.",
    cta: "Read More",
    href: "/works/bengaluru-international-airport",
    cats: ["Scale"],
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
  /** Grid order as laid out in Figma (two columns, left → right, top → bottom). Names are as written
   *  under each thumbnail in the design. `cats` = the project's category (client list); `meta` keeps
   *  the design's old tags, shown only for a project with no category yet. `description` is used
   *  when the project is the highlighted card of a category: two lines, about the BIAL card's length. */
  projects: [
    { name: "MyAadhaar", meta: "Mobile · Security  ·  2024", cats: ["Scale"], key: "aadhaar", image: "/images/work/w-aadhaar-2026.webp", alt: "myAadhaar on a laptop and phone: the Address Update page and its upload-document step",
      description: "Simplifying government digital identity through intuitive, trust-led design." },
    { name: "Apollo Momverse", meta: "AI · Enterprise  ·  2025", cats: ["Content x Commerce"], soon: false, key: "momverse", href: "/works/apollo-momverse", image: "/images/work/w-momverse.webp", alt: "Apollo Momverse brand and app: a pregnant woman on her phone beside the community post screen",
      description: "A personalised parenting companion with trusted advice for every stage." },
    { name: "Amazon Now", meta: "AI · Consumer  ·  2025", cats: ["Scale"], key: "amazon-now", image: "/images/work/w-amazon-now.webp", alt: "Amazon Now quick-commerce app on a phone among groceries, with an “Arriving in 10 mins” card",
      description: "Making quick commerce simpler with effortless discovery and shopping journeys." },
    { name: "Juice AI", meta: "Consumer · Brand  ·  2025", cats: ["AI"], key: "juice-ai", image: "/images/work/w-juice-ai.webp", alt: "Juice AI insights screen generating a “Glass lips beat matte” ad insight on a yellow background",
      description: "Bringing brand strategy and creative production together on one AI platform." },
    { name: "Quickplay", meta: "Enterprise · Mobile  ·  2024", cats: ["New Age Platform"], soon: false, key: "quickplay", href: "/works/quickplay", image: "/images/work/w-quickplay.webp", alt: "Quickplay screens: a live basketball stream on a phone and the widget builder on a tablet" },
    /* not in the client list yet: shown under All only */
    { name: "SBI Life", meta: "Consumer · Mobile  ·  2024", cats: [], key: "sbi-life", image: "/images/work/w-sbi-life.webp", alt: "SBI Life eShield Next protection-plan screens on three phones" },
    /* (Godrej Wealth and Aokah swapped places on feedback) */
    { name: "Godrej Wealth", meta: "Consumer · Mobile  ·  2024", cats: ["New Age Platform"], key: "godrej", image: "/images/work/w-godrej.webp", alt: "Godrej wealth app portfolio screens and insight cards: “Opportunities that reflect your behaviour”" },
    { name: "Hurun India", meta: "AI · Enterprise  ·  2025", cats: ["Website"], soon: false, key: "hurun", href: "/works/hurun", image: "/images/work/w-hurun.webp", alt: "Hurun India website on a phone over gold line illustrations: “Promoting Indian Entrepreneurship”",
      description: "A facelift telling Hurun's story of championing Indian entrepreneurship." },
    { name: "ASK", meta: "Mobile · Security  ·  2024", cats: ["Financial Services"], soon: false, key: "ask", href: "/works/ask-financials", image: "/images/work/w-ask.webp", alt: "ASK Wealth app “Investment Filters” screen over Mumbai’s sea link at night: “Led by foresight realized by expertise”",
      description: "A digital facelift for ASK's HNI and Ultra HNI clientele." },
    { name: "Amazon Mini TV", meta: "AI · Consumer  ·  2025", cats: ["Media"], soon: false, key: "minitv", href: "/works/minitv", image: "/images/work/w-minitv.webp", alt: "Amazon miniTV app with zodiac show picks, Mini Laughs memes and a show notification",
      description: "Reimagining streaming with smarter discovery that keeps viewers watching." },
    { name: "Setu App", meta: "Enterprise · Mobile  ·  2024", cats: ["D2C"], soon: false, key: "setu", href: "/works/setu-app", image: "/images/work/w-setu.webp", alt: "Setu wellness app held in hand: movement-days progress, supplement subscription and science cards",
      description: "A companion app that helps customers stick to their supplements." },
    /* no case study yet: description written from the project's screens (city explorer, scores, advisors) */
    { name: "Aokah", meta: "Consumer · Brand  ·  2025", cats: ["B2B"], key: "aokah", image: "/images/work/w-aokah.webp", alt: "Aokah location explorer dashboard with city recommendations and a “Need expert guidance?” card",
      description: "Helping companies choose where to build their next team, city by city." },
  ] as { name: string; meta: string; cats: string[]; key: string; image: string; alt: string; soon?: boolean; href?: string; description?: string }[],
};

/** "Consumer · Brand  ·  2025" → { tags: ["Consumer", "Brand"], year: "2025" } */
export function parseMeta(meta: string) {
  const parts = meta.split("·").map((s) => s.trim());
  return { tags: parts.slice(0, -1), year: parts[parts.length - 1] };
}
