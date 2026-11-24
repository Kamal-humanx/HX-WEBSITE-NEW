/** Homepage copy — verbatim from Figma frame 5376:1438. */

export const HOME = {
  hero: {
    image: { src: "/images/home/hero.webp", width: 1920, height: 531 },
    heading: { line1: "We craft products ", line2: "that are Unmistakably Human" },
    intro: "CX Design and Tech studio that shapes digital experiences with a human edge",
  },
  clientsAlt:
    "Client logos: Aadhaar, Apollo 24|7, Godrej Industries, Grubhub, Hamleys, SBI Life, Kotak, HDFC, NPCI, DBS, ThinkPlace, JLL, Bengaluru International Airport, Axis Bank and Aditya Birla Group",
  work: {
    title: "Good ideas are only the beginning",
    seeAll: "See all Work",
    /** Order = vertical order on the Figma frame (y 1985 → 3238). */
    cases: [
      {
        label: "Airport Super App",
        title: "Bengaluru International Airport",
        description: "Connecting airport services, retail, and journeys in one experience.",
        image: "/images/work/bial-thumb.webp",
        alt: "Bengaluru International Airport app screens showing the Care by BLR services and EZPass security slot booking",
        w: 1006,
        h: 610,
      },
      {
        label: "Quick Commerce",
        title: "Amazon Now",
        description: "Making quick commerce simpler through effortless discovery and intuitive shopping journeys.",
        image: "/images/work/amazon-now-thumb.webp",
        alt: "Amazon Now quick-commerce app on a phone held in hand",
        w: 998,
        h: 604,
      },
      {
        label: "Creative Intelligence",
        title: "Juice AI",
        description: "Bringing brand strategy and creative production together through an AI-powered platform.",
        image: "/images/work/juice-ai-thumb.webp",
        alt: "Juice AI platform interface with the Recipe insights panel on a yellow background",
        w: 998,
        h: 604,
      },
      {
        label: "Health-tech",
        title: "Apollo Momverse",
        description: "Designing a personalised parenting experience with trusted advice and support at every stage.",
        image: "/images/work/apollo-momverse-thumb.webp",
        alt: "Mom Verse brand artwork: “Empowering your journey” beside a woman drinking from a glass",
        w: 998,
        h: 604,
      },
      {
        label: "GovTech",
        title: "myAadhaar",
        description: "Simplifying government digital identity services through intuitive, trust-led design.",
        image: "/images/work/myaadhaar-thumb.webp",
        alt: "myAadhaar web portal welcome screen with service shortcuts",
        w: 1006,
        h: 610,
      },
    ],
    readMore: "Read More",
  },
  testimonial: {
    title: "from our co-conspirators",
    quote:
      "Their product thinking transformed our onboarding flow. Users stayed longer, engaged deeper, and our churn dropped dramatically-ultimately delivering 3× retention.",
    name: "Tarush Singhal",
    role: "Head of Content Marketing, Apollo 24|7",
  },
  manifesto: {
    title: "Human Cognition × System Intelligence",
    body: "AI gives us speed and scale. It does not give us direction. Knowing what to ask, and what to build takes empathy. Nothing replaces watching real behaviour, listening to real conversations, and getting real feedback. ",
    quote: "In our world, the tools will keep changing. Our craft stays unmistakably human.",
    cta: "Get In Touch",
  },
};
