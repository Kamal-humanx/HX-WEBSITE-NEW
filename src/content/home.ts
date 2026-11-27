/** Homepage copy — verbatim from Figma frame 5376:1438. */

export const HOME = {
  hero: {
    image: { src: "/images/home/hero.webp", width: 1920, height: 531 },
    heading: { line1: "We craft products ", line2: "that are Unmistakably Human" },
    intro: "CX Design and Tech studio that shapes digital experiences with a human edge",
  },
  /**
   * Client logo carousel — order = numbered list in Figma section "logos" (5654:9565).
   * Images exported from that section at 2×; w/h = the logo's cell size in the homepage strip
   * (Group 2147206535, 5000:19060: row 115.2px tall, 84px between cells). Momverse isn't in the
   * strip, so it uses the strip's 0.9× scale of its section size (140×73). HP is on the list but
   * has no logo in Figma yet.
   */
  clients: [
    { name: "Amazon", src: "/images/clients/amazon.png", w: 171.9, h: 75.2 },
    { name: "Aadhaar", src: "/images/clients/aadhaar.png", w: 102.6, h: 65.7 },
    { name: "Apollo Momverse", src: "/images/clients/apollo-momverse.png", w: 126, h: 65.7 },
    { name: "Godrej Industries", src: "/images/clients/godrej-industries.png", w: 171.9, h: 75.6 },
    { name: "Grubhub", src: "/images/clients/grubhub.png", w: 206.1, h: 52.2 },
    { name: "Hamleys", src: "/images/clients/hamleys.png", w: 124.2, h: 65.7 },
    { name: "SBI Life", src: "/images/clients/sbi-life.png", w: 124.2, h: 65.7 },
    { name: "Kotak Mahindra Bank", src: "/images/clients/kotak.png", w: 124.2, h: 65.7 },
    { name: "HDFC Bank", src: "/images/clients/hdfc-bank.png", w: 124.2, h: 65.7 },
    { name: "NPCI", src: "/images/clients/npci.png", w: 124.2, h: 65.7 },
    { name: "DBS", src: "/images/clients/dbs.png", w: 124.2, h: 65.7 },
    { name: "ThinkPlace", src: "/images/clients/thinkplace.png", w: 161.9, h: 85.6 },
    { name: "JLL", src: "/images/clients/jll.png", w: 161.9, h: 85.6 },
    { name: "ITC", src: "/images/clients/itc.png", w: 161.9, h: 85.6 },
    { name: "Kempegowda International Airport Bengaluru", src: "/images/clients/bial.png", w: 161.9, h: 85.6 },
    { name: "Axis Bank", src: "/images/clients/axis-bank.png", w: 161.9, h: 85.6 },
    { name: "Apollo 24|7", src: "/images/clients/apollo-247.png", w: 115.2, h: 115.2 },
    { name: "Aditya Birla Capital", src: "/images/clients/aditya-birla-capital.png", w: 161.9, h: 85.6 },
    { name: "Centre for Strategic Negotiations", src: "/images/clients/csn.png", w: 161.9, h: 85.6 },
  ],
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
        /* its project page; the other cards go to the Work page until theirs are built */
        href: "/works/bengaluru-international-airport",
      },
      {
        /* replaced Amazon Now (no case study yet) — Figma 5253:31411, without its Coming Soon pill */
        label: "Media",
        title: "Amazon Mini TV",
        description: "Reimagining entertainment streaming with smarter content discovery and experiences that drive engagement.",
        image: "/images/work/minitv-thumb-2026.webp",
        alt: "Amazon miniTV app: the Your Honor home screen, a zodiac show finder, Mini Laughs memes and a show notification",
        w: 998,
        h: 604,
        href: "/works/minitv",
      },
      {
        label: "Creative Intelligence",
        title: "Juice AI",
        description: "Bringing brand strategy and creative production together through an AI-powered platform.",
        image: "/images/work/juice-ai-thumb-2026.webp",
        soon: true,
        /* 2026 thumbnail (Figma 5740:99544), composed for this card from the Work page's layers */
        alt: "Juice AI: “Rethinking Creative Production”, a “Glass lips beat matte” insight card over the app, on a yellow background",
        w: 998,
        h: 604,
      },
      {
        label: "GovTech",
        title: "myAadhaar",
        description: "Simplifying government digital identity services through intuitive, trust-led design.",
        /* 2026 thumbnail (Figma 5917:21123), composed for this card */
        image: "/images/work/myaadhaar-thumb-2026.webp",
        soon: true,
        alt: "myAadhaar on a laptop and phone: the Address Update page and its upload-document step",
        w: 1006,
        h: 610,
      },
      {
        label: "Health-tech",
        title: "Apollo Momverse",
        description: "Designing a personalised parenting experience with trusted advice and support at every stage.",
        image: "/images/work/apollo-momverse-thumb.webp",
        alt: "Apollo Momverse brand artwork: “Empowering your journey” beside a woman drinking from a glass",
        w: 998,
        h: 604,
        href: "/works/apollo-momverse",
      },
    ],
    readMore: "Read More",
  },
  testimonial: {
    title: "from our co-conspirators",
    /** Quotes, names, roles and headshots: Figma component set "Testimonial Slide" (4905:65), one per
     *  logo tab (component set "Logo Tab", 4905:154), in tab order. */
    items: [
      {
        company: "Apollo 24|7",
        quote:
          "HumanX's design is sharp. If you want a product that actually works and drives growth for your business, these are your people.",
        name: "Tarush Singhal",
        role: "Head of Content Marketing, Apollo 24|7",
        photo: "/images/testimonials/tarush-singhal.png",
      },
      {
        company: "Fox Star Studios",
        quote: "They delivered a high quality AR experience leading to 3x improvement in time spent.",
        name: "Irshad Daftari",
        role: "Fox Star Studio",
        photo: "/images/testimonials/irshad-daftari.png",
      },
      {
        company: "JLL",
        quote: "They hit the ground running and quickly became a seamless extension of our team.",
        name: "Lori Louis",
        role: "JLL Tech",
        photo: "/images/testimonials/lori-louis.png",
      },
      {
        company: "Quickplay",
        quote: "The product received outstanding reviews and garnered several industry awards.",
        name: "Naveen Narayanan",
        role: "Head of Product Innovation & Data Science, Quickplay",
        photo: "/images/testimonials/naveen-narayanan.png",
      },
      {
        company: "OML",
        quote: "We really loved collaborating and working with HumanX, you are a very big part of our journey.",
        name: "Himani Agrawal",
        role: "Senior VP, Hypothesis – OML",
        photo: "/images/testimonials/himani-agrawal.png",
      },
      {
        company: "ASK",
        quote:
          "From start to finish, their team demonstrated exceptional professionalism, creativity, solution orientation and attention to detail.",
        name: "Shanu Singh",
        role: "CMO, ASK Asset & Wealth Management Group",
        photo: "/images/testimonials/shanu-singh.png",
      },
    ],
  },
  manifesto: {
    title: "Human Cognition × System Intelligence",
    body: "AI gives us speed and scale. It does not give us direction. Knowing what to ask, and what to build takes empathy. Nothing replaces watching real behaviour, listening to real conversations, and getting real feedback. ",
    quote: "In our world, the tools will keep changing. Our craft stays unmistakably human.",
    cta: "Get In Touch",
  },
};
