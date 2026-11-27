/** Works page copy — verbatim from Figma frame 5740:93418 ("Works – Thumbnails (Coming soon)"). */

export const WORKS = {
  title: "Work That Starts With People",
  intro:
    "Every project is a partnership. Here’s what we built together, and the teams who trusted us with it.",
  /** Filter pills: All, then the project categories (client list, revised Nov 2026), in that list's order.
   *  Each project's `cats` says where it appears. */
  filters: ["All", "Health", "Consumer", "Finance", "B2B", "AI", "Impact"],
  count: "28 projects",
  /** the glass pill on a thumbnail (Figma Frame 2147240663); shown unless a project sets soon: false */
  badge: "Coming Soon",
  featured: {
    label: "AIRPORT SUPER APP",
    title: "Bengaluru International Airport",
    description: "Reimagining how 40M+ viewers discover content through behaviour-aware Al.",
    cta: "Read More",
    href: "/work/bengaluru-international-airport",
    cats: ["Impact"],
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
    /* BIAL's grid card: only under its categories — under All it's the featured card on top */
    { name: "Bengaluru International Airport", meta: "Mobile · Travel  ·  2024", cats: ["Impact"], soon: false, allHidden: true, key: "bial", href: "/work/bengaluru-international-airport", image: "/images/work/bial-phone.webp", alt: "Bengaluru International Airport’s Pulse app: the “Welcome to Bengaluru” home screen with the EZPass security-slot and Care by BLR cards" },
    { name: "MyAadhaar", meta: "Mobile · Security  ·  2024", cats: ["Impact"], key: "aadhaar", image: "/images/work/w-aadhaar-2026.webp", alt: "myAadhaar on a laptop and phone: the Address Update page and its upload-document step",
      description: "Simplifying government digital identity through intuitive, trust-led design." },
    { name: "Apollo Momverse", meta: "AI · Enterprise  ·  2025", cats: ["Health"], soon: false, key: "momverse", href: "/work/apollo-momverse", image: "/images/work/w-momverse.webp", alt: "Apollo Momverse brand and app: a pregnant woman on her phone beside the community post screen",
      description: "A personalised parenting companion with trusted advice for every stage." },
    { name: "Amazon Now", meta: "AI · Consumer  ·  2025", cats: ["Consumer", "Impact"], key: "amazon-now", image: "/images/work/w-amazon-now.webp", alt: "Amazon Now quick-commerce app on a phone among groceries, with an “Arriving in 10 mins” card",
      description: "Making quick commerce simpler with effortless discovery and shopping journeys." },
    { name: "Juice AI", meta: "Consumer · Brand  ·  2025", cats: ["AI"], key: "juice-ai", image: "/images/work/juice-ai-editor.webp", alt: "Juice AI video editor: a clip on the canvas above a timeline with Cutter, Layers, Captions and Sound tools, on a yellow ground",
      description: "Bringing brand strategy and creative production together on one AI platform." },
    { name: "Quickplay", meta: "Enterprise · Mobile  ·  2024", cats: ["Consumer"], soon: false, key: "quickplay", href: "/work/quickplay", image: "/images/work/w-quickplay.webp", alt: "Quickplay screens: a live basketball stream on a phone and the widget builder on a tablet",
      description: "Industry-first generative AI concepts for streaming, unveiled at IBC 2023 in Amsterdam." },
    { name: "SBI Life", meta: "Consumer · Mobile  ·  2024", cats: ["Finance", "Impact"], key: "sbi-life", image: "/images/work/w-sbi-life.webp", alt: "SBI Life eShield Next protection-plan screens on three phones" },
    /* (Godrej Wealth and Aokah swapped places on feedback) */
    { name: "Godrej Wealth", meta: "Consumer · Mobile  ·  2024", cats: ["Finance", "AI"], key: "godrej", image: "/images/work/w-godrej.webp", alt: "Godrej wealth app portfolio screens and insight cards: “Opportunities that reflect your behaviour”" },
    { name: "Hurun India", meta: "AI · Enterprise  ·  2025", cats: ["B2B"], soon: false, key: "hurun", href: "/work/hurun", image: "/images/work/w-hurun.webp", alt: "Hurun India website on a phone over gold line illustrations: “Promoting Indian Entrepreneurship”",
      description: "A facelift telling Hurun's story of championing Indian entrepreneurship." },
    { name: "ASK", meta: "Mobile · Security  ·  2024", cats: ["Finance"], soon: false, key: "ask", href: "/work/ask-financials", image: "/images/work/w-ask.webp", alt: "ASK Wealth app “Investment Filters” screen over Mumbai’s sea link at night: “Led by foresight realized by expertise”",
      description: "A digital facelift for ASK's HNI and Ultra HNI clientele." },
    { name: "Amazon Mini TV", meta: "AI · Consumer  ·  2025", cats: ["Impact"], soon: false, key: "minitv", href: "/work/minitv", image: "/images/work/w-minitv.webp", alt: "Amazon miniTV app with zodiac show picks, Mini Laughs memes and a show notification",
      description: "Reimagining streaming with smarter discovery that keeps viewers watching." },
    { name: "Setu App", meta: "Enterprise · Mobile  ·  2024", cats: ["Health"], soon: false, key: "setu", href: "/work/setu-app", image: "/images/work/w-setu.webp", alt: "Setu wellness app held in hand: movement-days progress, supplement subscription and science cards",
      description: "A companion app that helps customers stick to their supplements." },
    /* no case study yet: description written from the project's screens (city explorer, scores, advisors) */
    { name: "Aokah", meta: "Consumer · Brand  ·  2025", cats: ["B2B", "AI"], key: "aokah", image: "/images/work/w-aokah.webp", alt: "Aokah location explorer dashboard with city recommendations and a “Need expert guidance?” card",
      description: "Helping companies choose where to build their next team, city by city." },
    /* Coming Soon projects added Nov 2026 (thumbnails: Figma 6046:98719 and its neighbours) */
    { name: "Fabelle", meta: "Consumer · Brand  ·  2025", cats: ["Consumer"], key: "fabelle", image: "/images/work/w-fabelle-2026.webp", alt: "Fabelle chocolate website on a laptop with product cards, on a brown ground with gold line-art mountains" },
    { name: "Sho-Up", meta: "Consumer · Mobile  ·  2025", cats: ["Consumer", "Health"], key: "sho-up", image: "/images/work/w-sho-up-2026.webp", alt: "Sho-Up fitness app on a phone: “Explore, move, and make every day count!”, beside a silhouette stretching" },
    { name: "Amazon Fresh", meta: "Consumer · Mobile  ·  2025", cats: ["Consumer", "Impact"], key: "amazon-fresh", image: "/images/work/w-amazon-fresh-2026.webp", alt: "Amazon Fresh grocery order screen on a phone, in a green crate among fruit and vegetables" },
    { name: "Hamleys", meta: "Consumer · Brand  ·  2025", cats: ["Consumer"], key: "hamleys", image: "/images/work/w-hamleys-2026.webp", alt: "Hamleys logo on red beside a smiling child against a blue sky" },
    { name: "Seclore", meta: "Enterprise · AI  ·  2025", cats: ["B2B", "AI"], key: "seclore", image: "/images/work/w-seclore-2026.webp", alt: "Seclore data catalog dashboard with file-scanning statistics, on a purple ground" },
  ] as { name: string; meta: string; cats: string[]; key: string; image: string; alt: string; soon?: boolean; href?: string; description?: string; allHidden?: boolean }[],
};

/** "Consumer · Brand  ·  2025" → { tags: ["Consumer", "Brand"], year: "2025" } */
export function parseMeta(meta: string) {
  const parts = meta.split("·").map((s) => s.trim());
  return { tags: parts.slice(0, -1), year: parts[parts.length - 1] };
}
