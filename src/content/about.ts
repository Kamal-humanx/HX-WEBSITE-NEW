/** About page copy — verbatim from Figma frame 5724:36157 ("About - Copy", 2026 revision). */

/**
 * Team (Figma 5880:35949, "new"): the scattered cards on the 1856 × 677 stage of the 1920 frame.
 * x / y / w = the card's box in Figma px on that stage; `size` = the card kind (large 351 wide with a
 * 325 × 372 photo; small 199–222 wide with a 179 × 189 photo, Jay's 204 × 188). Listed co-founders
 * first: the order phones and tablets show them in.
 */
export const TEAM = {
  title: "Different Perspectives. Shared Obsession.",
  cta: { label: "Join Our Team", href: "/careers" },
  members: [
    { name: "Devang Raiyani", role: "Co-Founder", image: "/images/team/devang-2026.webp", w: 720, h: 826, size: "lg", x: 0, y: 0, cw: 351, photo: [325, 372] },
    { name: "Krupali Raiyani", role: "Co-Founder", image: "/images/team/krupali-2026.webp", w: 720, h: 826, size: "lg", x: 883, y: 229, cw: 351, photo: [325, 372] },
    { name: "Shreya Gulati", role: "Design Director", image: "/images/team/shreya-2026.webp", w: 720, h: 826, size: "lg", x: 1271, y: 0, cw: 351, photo: [325, 372] },
    { name: "Jay Khut", role: "Sr. Project Manager", image: "/images/team/jay-2026.webp", w: 612, h: 564, size: "sm", x: 388, y: 0, cw: 222, photo: [204, 188] },
    { name: "Abhishek", role: "Project Manager", image: "/images/team/abhishek-2026.webp", w: 537, h: 566, size: "sm", x: 647, y: 229, cw: 199, photo: [179, 189] },
    { name: "Sakshi", role: "Social Media Manager", image: "/images/team/sakshi-2026.webp", w: 537, h: 566, size: "sm", x: 1659, y: 0, cw: 199, photo: [179, 189] },
  ],
} as const;

export const ABOUT = {
  heading: "We partner with ambitious brands and challenge convention",
  intro:
    "Products remembered rarely come from following the expected. They come from asking better questions and building with intention from day one.",
  /** Studio carousel (5724:39129) — photographs only; the quotes were removed in the 2026 revision. */
  slides: [
    { image: "/images/about/team-1.webp", alt: "Two HumanX designers reviewing work together at a laptop in the studio" },
    { image: "/images/about/team-2.webp", alt: "A designer working on a laptop on an orange sofa in the HumanX studio" },
    { image: "/images/about/team-3.webp", alt: "Two team members talking through work at a laptop by the studio window" },
    { image: "/images/about/team-4.webp", alt: "The team gathered around a table covered in sticky notes during a workshop", position: "50% 33%" },
    { image: "/images/about/team-5.webp", alt: "The team in discussion around the meeting room table" },
  ],
  process: "Our journey and impact",
  stats: [
    { value: "12+ Years", caption: "What began as a brother sister duo has grown into a team working across sectors and across continents" },
    { value: "1Billion+", caption: "People who interact with the systems we’ve helped build" },
    { value: "50+", caption: "Strategists, designers, and operations managers bringing their unique perspectives" },
  ],
  principles: {
    title: "The Principles Behind Every Decision We Make.",
    items: [
      { n: "001", title: "Start With People", caption: "Experiences are remembered, not features." },
      { n: "002", title: "Challenge Assumptions", caption: "The brief starts the conversation. We question the obvious." },
      { n: "003", title: "Design With Intent", caption: "Every interaction should earn its place in the experience." },
      { n: "004", title: "Technology With Purpose", caption: "Technology should support people and disappear into delight." },
      { n: "005", title: "Details Matter", caption: "Craft lives in the details most people never notice." },
    ],
  },
};
