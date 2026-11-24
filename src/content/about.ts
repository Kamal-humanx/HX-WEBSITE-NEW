/** About page copy — verbatim from Figma frame 5376:10174 ("About - Copy"). */

export const ABOUT = {
  heading: "We partner with ambitious brands and challenge convention",
  intro:
    "Products remembered rarely come from following the expected. They come from asking better questions and building with intention from day one.",
  /** Studio carousel (5376:13146) — image ↔ quote pairs, as layered in Figma. */
  slides: [
    { image: "/images/about/studio-1.webp", alt: "Two HumanX designers reviewing work together at a laptop in the studio", quote: "“We start by listening. The brief is a starting point, not the whole story.”", caption: "Design Lead · HumanX" },
    { image: "/images/about/studio-2.webp", alt: "A designer working on a laptop on an orange sofa in the HumanX studio", quote: "“Good work needs room to think. Comfort isn’t a perk here, it’s part of the process.”", caption: "Product Design · HumanX" },
    { image: "/images/about/studio-3.webp", alt: "Two team members in conversation on a yellow sofa", quote: "“The best ideas usually arrive mid-conversation, not mid-presentation.”", caption: "Strategy · HumanX" },
    { image: "/images/about/studio-4.webp", alt: "Two colleagues discussing a problem across a meeting table", quote: "“We’d rather ask an awkward question early than fix an expensive answer late.”", caption: "Engineering · HumanX" },
    { image: "/images/about/studio-5.webp", alt: "A designer focused on her laptop at a desk against a yellow wall", quote: "“Craft is what you notice when nothing feels off.”", caption: "Visual Design · HumanX" },
    { image: "/images/about/studio-6.webp", alt: "A team member working at a laptop in the open studio", quote: "“Every product we ship is built with the people it’s for, not just for them.”", caption: "Research · HumanX" },
  ],
  process: "Great products aren't created by following The Process. They're created by knowing when to challenge It.",
  stats: [
    { value: "12+", caption: "What began as A brother sister duo has grown into a team working across sectors" },
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
  team: {
    title: "Different Perspectives. Shared Obsession.",
    cta: "Join Our Team",
    /** Order + size follow the Figma strip (5376:10295), left → right. */
    people: [
      { name: "Devang Raiyani", role: "Co-Founder", image: "/images/team/devang.webp", size: "lg", offset: 0 },
      { name: "Jay Khut", role: "Sr. Project Manager", image: "/images/team/jay.webp", size: "sm", offset: 0 },
      { name: "Sukhada ", role: "Sr. Visual Designer", image: "/images/team/sukhada-visual.webp", size: "sm", offset: 290 },
      { name: "Krupali Raiyani", role: "Co-Founder", image: "/images/team/krupali.webp", size: "lg", offset: 290 },
      { name: "Shreya Gulati", role: "Design Director", image: "/images/team/shreya.webp", size: "lg", offset: 0 },
      { name: "Abhishek", role: "Project Manager", image: "/images/team/abhishek.webp", size: "sm", offset: 242 },
      { name: "Sukhada ", role: "Sr. Product Designer", image: "/images/team/sukhada-product.webp", size: "sm", offset: 0 },
      { name: "Anushka Menon", role: "Senior Product Designer", image: "/images/team/anushka.webp", size: "lg", offset: 280 },
      { name: "Aayush Sinha", role: "Product Design Lead", image: "/images/team/aayush.webp", size: "lg", offset: 0 },
    ],
  },
};
