/**
 * Project detail pages (/works/[slug]). Every word on these pages is taken verbatim from the
 * existing humanx.io case studies (typos included, so nothing is reworded); the pages themselves are
 * built in the new site's language (header, footer, Uncut Sans + Chivo Mono).
 *
 * Each case has its own identity (`theme`): a light or dark page in the client's colours, used for
 * the hero, panels, numbers, marker dots, arrows and the testimonial.
 *
 * In copy, **double asterisks** mark the phrases the old pages highlighted.
 */
import { CASE_MEDIA } from "./caseMedia";

export type Img = {
  src: string;
  w: number;
  h: number;
  alt: string;
  panel?: boolean;
  /** needs a white ground on dark pages */
  light?: boolean;
  /** carries white text of its own: sits on the case's deep colour */
  dark?: boolean;
};
export type Vid = { kind: "video"; src: string; poster: string; w: number; h: number; alt: string };
export type Media = Img | Vid;

/** An annotation: `at` = where on the image it points, as % of the image's height (measured on the
 *  old pages); `x` = how far into the image the marker line runs, as % of its width (omitted: the line
 *  stops at the image's edge). `line: false` = placed level with `at` but without a marker line. */
export type Note = { title: string; body?: string; at: number; x?: number; principle?: string; line?: false };

export type Block =
  | { type: "text"; heading?: string; kicker?: string; body?: string[]; list?: string[]; center?: boolean }
  | { type: "goals"; items: (string | { title: string; body: string })[] }
  | { type: "statement"; text: string }
  | { type: "voices"; items: { who?: string; quote: string; note?: string; img: Img }[]; noteIcon?: Img }
  | { type: "image"; img: Img; wide?: boolean }
  | { type: "video"; video: Vid }
  | { type: "split"; img: Img; body: string[] }
  /** labels beside an image with marker lines; `text` = which side the labels sit; `dw` = the image's
   *  width on the old page at 1512px, which sets its share of the row */
  | { type: "annotated"; img: Img; dw: number; text: "left" | "right"; items: Note[]; overlays?: { img: Img; x: number; y: number; w: number }[] }
  | { type: "features"; items: { title: string; body: string }[]; img: Img }
  | { type: "showcase"; items: { title: string; body: string; imgs: Img[] }[] }
  | { type: "gallery"; imgs: Img[]; cols?: 2 | 3 | 4; captions?: string[] }
  | { type: "shifts"; items: [string, string][] }
  /** text beside media (MiniTV features, Momverse community) */
  | { type: "rows"; items: { title: string; principle?: string; body?: string[]; list?: string[]; media: Media[]; dw: number }[] }
  | { type: "spotlight"; title: string; body: string; video: Vid; principle: string }
  | { type: "metric"; label: string; value: string }
  | { type: "stack"; items: { title: string; body: string; video: Vid }[] }
  | { type: "trio"; items: { title: string; body: string; video: Vid; small?: boolean }[] }
  | { type: "bento"; items: { title: string; body: string; imgs: Img[]; span: 2 | 4 | 6 }[] }
  | { type: "mosaic"; items: { title?: string; body?: string; caption?: string; imgs: Img[]; span: 2 | 3 | 4 }[] }
  | { type: "personas"; labels: [string, string]; items: { name: string; img: Img; first: string[]; second: string[] }[] }
  | { type: "iconCards"; items: { icon: Img; title: string; body: string }[] }
  | { type: "styleRow"; title: string; body: string; imgs: Img[]; cols?: number }
  | { type: "words"; items: string[] }
  | { type: "flow"; items: string[] }
  | { type: "pillars"; items: { n: string; lead: string; title: string }[] }
  | { type: "banner"; text: string; bg: Img; fg?: Img }
  | { type: "quoteFig"; quote: string; name: string; role: string; img: Img };

export type Testimonial = { lead?: string; quote: string; name: string; role: string };

export type Chapter = { id: string; heading: string; blocks: Block[] } | { id: string; testimonial: Testimonial };

export type Theme = {
  /** page mode */
  mode: "light" | "dark";
  bg: string;
  fg: string;
  body: string;
  muted: string;
  line: string;
  /** media panels and cards */
  panel: string;
  /** brand colour: marker dots, arrows, glows */
  accent: string;
  /** brand colour for small text on `bg` (WCAG AA) */
  ink: string;
  /** deep brand ground: logo plate, banners, testimonial, cards */
  deep: string;
};

export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  /** `plate`: the logo has white type, so it sits on a dark plate (the case's deep colour, or the
   *  colour given) */
  logo: { img: Img; plate?: boolean | string; h: number };
  intro: string[];
  hero: { imgs: Img[]; bleed?: boolean };
  theme: Theme;
  chapters: Chapter[];
  closing?: string;
  /** where the old site kept it — the source of this copy */
  source: string;
  metaDescription: string;
};

/* ---------- helpers ---------- */

const m = (path: string, alt: string, extra: Partial<Img> = {}): Img => {
  const d = CASE_MEDIA[path];
  if (!d) throw new Error(`caseStudies: no size recorded for ${path}`);
  return { src: `/images/work/${path}`, w: d.w, h: d.h, alt, ...extra };
};
const v = (path: string, w: number, h: number, alt: string): Vid => ({
  kind: "video",
  src: `/images/work/${path}`,
  poster: `/images/work/${path.replace(/\.mp4$/, "-poster.webp")}`,
  w,
  h,
  alt,
});
export const isVideo = (x: Media): x is Vid => (x as Vid).kind === "video";

const B = "/images/work/bial";
const BI = "bengaluru-international-airport";

/* ---------- the case studies ---------- */

export const CASE_STUDIES: CaseStudy[] = [
  /* ===================================================================== BIAL */
  {
    slug: "bengaluru-international-airport",
    client: "Bengaluru International Airport",
    title: "Designing an airport super app",
    logo: { img: m(`${BI}/kiab-logo.webp`, "Kempegowda International Airport Bengaluru"), plate: "#172224", h: 84 },
    intro: [
      "If you think airports are just about flights, security and endless paper cups of coffee, think again. Bengaluru’s Kempegowda International Airport (BLR), the gateway to India’s startup capital, is a premier destination for retail, live entertainment and dining experiences.",
      "Since its launch operations in 2008, BLR crossed the 30-million passenger mark. Now, they have embarked on a journey to become one of the most digitally advanced airports globally, and engaged HumanX to design a strong foundation for digital CX.",
    ],
    hero: { imgs: [{ src: `${B}/hero.webp`, w: 1524, h: 1240, alt: "Pulse, the BLR Airport app: home screen with flight status, services and offers on two phones" }] },
    theme: {
      mode: "light",
      bg: "#ffffff",
      fg: "#323232",
      body: "#5a5a5a",
      muted: "#8a8a8a",
      line: "rgba(0,0,0,0.1)",
      panel: "#edf6f5",
      accent: "#0ba5a8",
      ink: "#08767a",
      deep: "#0b3b3e",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [
          { type: "goals", items: ["Reduce passenger anxiety", "Improve revenue opportunities"] },
          {
            type: "statement",
            text: "At the heart of it, Pulse is designed as a digital platform of connected services that enhances the passenger experience and powers the digital airport economy.",
          },
          { type: "video", video: { kind: "video", src: `${B}/pulse.mp4`, poster: `${B}/pulse-poster.webp`, w: 1168, h: 556, alt: "Pulse app screens animating through the passenger journey" } },
        ],
      },
      {
        id: "voice",
        heading: "How do we get there?",
        blocks: [
          {
            type: "text",
            kicker: "It starts with the Voice of the Passengers",
            body: [
              "We conducted Airport Intercepts that helped us get rich insights into passengers’ behaviour, their needs and points of frustration while travelling to and through the airport.",
            ],
          },
          {
            type: "voices",
            items: [
              { quote: "“The minute I step out of home, I don’t feel like I am in control.”", img: m(`${BI}/rectangle-4153591.webp`, "") },
              { quote: "“Booking a cab and getting one are two different stories.”", img: m(`${BI}/rectangle-4153592.webp`, "") },
              { quote: "“Even when I reach the airport early, it’s not early enough.”", img: m(`${BI}/rectangle-4153593.webp`, "") },
            ],
          },
        ],
      },
      {
        id: "needs",
        heading: "How might we be on the Pulse of what passengers need?",
        blocks: [
          {
            type: "split",
            img: { src: `${B}/needs.webp`, w: 1368, h: 1176, alt: "Passengers at the airport, in a row of tall rounded frames" },
            body: [
              "Armed with these insights, it became clear that not all airport needs are equal and they progress on an anxiety axis, we called Airport Hierarchy of Needs. Against each need, was a feature that would help solve that particular passenger challenge.",
            ],
          },
          {
            type: "image",
            wide: true,
            img: { src: `${B}/outcomes.webp`, w: 2336, h: 1003, alt: "Airport Hierarchy of Needs: passenger needs on an anxiety axis, each matched to a feature", panel: true },
          },
        ],
      },
      {
        id: "opportunity",
        heading: "Opportunity Map",
        blocks: [
          {
            type: "text",
            body: [
              "We then mapped the passenger's journey from Home to Gate and unlocked opportunities and interventions, and identified key moments of truth that shaped the outcomes",
            ],
          },
          {
            type: "image",
            wide: true,
            img: { src: `${B}/opportunity-map.webp`, w: 2336, h: 1112, alt: "Opportunity map of the passenger journey from home to gate, with moments of truth", panel: true },
          },
        ],
      },
      {
        id: "features",
        heading: "Features that deliver outcomes",
        blocks: [
          {
            type: "annotated",
            text: "left",
            dw: 368,
            items: [
              { title: "Flight Info", at: 17.29, body: "Upfront flight information that tells you how much time until departure, so you know if you need to rush or if you can relax." },
              { title: "Fastest Entry", at: 47.5, body: "Breeze through the crowd, queue information at your fingertips." },
              { title: "Assured Cab", at: 56.65, body: "Schedule a ride to the airport that’s guaranteed and avoid last minute cancellations." },
              { title: "Book in Advance", at: 68.7, body: "From your flight to duty free to lounge, this is your one stop shop for everything related to your trip." },
              { title: "Airport Essentials", at: 85.13, body: "Quick access to essential services and facilities." },
            ],
            img: { src: `${B}/features.webp`, w: 736, h: 2556, alt: "Pulse home screen: upcoming flight, fastest entry gate, assured cab and airport essentials" },
          },
          {
            type: "features",
            items: [{ title: "3 Axes of Personalisation", body: "Personalised nudges based on who the passenger is, their location and time until flight." }],
            img: { src: `${B}/personalisation.webp`, w: 736, h: 1640, alt: "Pulse screen with nudges personalised to the passenger, their location and time to flight" },
          },
          {
            type: "image",
            wide: true,
            img: m(`${BI}/app-image.webp`, "Five Pulse app screens: Pre-order a meal, Order on Duty Free, Pre-book an assured cab, Pre-book lounge access, Book a stay", {
              dark: true,
            }),
          },
        ],
      },
      {
        id: "experience",
        heading: "Everything else that elevates your travel experience",
        blocks: [
          {
            type: "showcase",
            items: [
              {
                title: "Not just a pitstop, but a destination",
                body: "See the airport as not just a pitstop, but a destination to explore events, art, culture and more.",
                imgs: [
                  { src: `${B}/destination-1.webp`, w: 736, h: 1640, alt: "Explore while you wait: art and culture at the airport" },
                  { src: `${B}/destination-2.webp`, w: 1470, h: 1594, alt: "Events, art and dining at the airport in the Pulse app" },
                ],
              },
              {
                title: "Navigate indoors",
                body: "See the airport as not just a pitstop, but a destination to explore events, art, culture and more.",
                imgs: [{ src: `${B}/navigate.webp`, w: 736, h: 1640, alt: "Indoor map of the terminal with a walking route" }],
              },
              {
                title: "Search",
                body: "See the airport as not just a pitstop, but a destination to explore events, art, culture and more.",
                imgs: [{ src: `${B}/search.webp`, w: 736, h: 2996, alt: "Search results across shops, food and services at the airport" }],
              },
              {
                title: "Rewards",
                body: "A loyalty programme for members and frequent travellers to stand a chance to enjoy the perks that the airport offers across its services.",
                imgs: [
                  { src: `${B}/rewards-1.webp`, w: 540, h: 1170, alt: "Rewards notifications on a lock screen" },
                  { src: `${B}/rewards-2.webp`, w: 540, h: 1170, alt: "Earn reward points on every purchase" },
                  { src: `${B}/rewards-3.webp`, w: 540, h: 1170, alt: "Unlock bonus points and refer friends" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "buzz",
        heading: "Creating buzz around the new app",
        blocks: [
          {
            type: "text",
            body: ["Beyond just designing the app, we created communication that was authentic and something that passengers would relate to."],
          },
          {
            type: "gallery",
            imgs: [
              { src: `${B}/buzz-1.webp`, w: 600, h: 600, alt: "Quick check-ins, for relaxed ‘check outs’" },
              { src: `${B}/buzz-2.webp`, w: 600, h: 600, alt: "The sunglasses that never saw the beach" },
              { src: `${B}/buzz-3.webp`, w: 600, h: 600, alt: "Single since 2022" },
              { src: `${B}/buzz-4.webp`, w: 600, h: 600, alt: "Maybe your flight is stuck in traffic, just like you" },
            ],
          },
        ],
      },
      {
        id: "shifts",
        heading: "Key Shifts",
        blocks: [
          {
            type: "text",
            body: ["Beyond just rethinking the digital assets, our team influenced the internal approach to digital CX leading to certain key shifts:"],
          },
          {
            type: "shifts",
            items: [
              ["Digital Asset", "Airport Infra"],
              ["Feature Centric", "User Outcome Centric"],
              ["Set of Features", "Connected Journeys"],
            ],
          },
        ],
      },
    ],
    closing:
      "Having created this foundation, HumanX team continues to partner with BLR as we build them into a category benchmark and building more features.",
    source: "https://www.humanx.io/case-studies/bengaluru-international-airport",
    metaDescription:
      "Bengaluru’s Kempegowda International Airport (BLR) has embarked on a journey to become one of the most digitally advanced airports globally, and engaged HumanX to design a strong foundation for digital CX.",
  },

  /* ===================================================================== MINITV */
  {
    slug: "minitv",
    client: "Amazon miniTV",
    title: "Beyond the ordinary\nRedefining OTT",
    logo: { img: m("minitv/frame-53.svg", "Amazon miniTV"), h: 31 },
    intro: [
      "Amazon miniTV is the ultimate destination for **free video entertainment**. With tailor-made recommendations just for you, discovering content is as enjoyable as watching one. An advertiser funded OTT platform, Amazon miniTV partnered with HumanX to increase traffic and watch time, and in turn boost sales for Amazon E-Commerce.",
    ],
    hero: {
      imgs: [
        m("minitv/iphone-13-mini-3.webp", "miniTV home screen with shows matched for you"),
        m("minitv/first-fold.webp", "miniTV home screen featuring a new show"),
        m("minitv/third-fold-1.webp", "miniTV screen of top picks and shows to continue watching"),
      ],
    },
    theme: {
      mode: "dark",
      bg: "#13080f",
      fg: "#ffffff",
      body: "#cbbec7",
      muted: "#8d7b87",
      line: "rgba(255,255,255,0.12)",
      panel: "#21101b",
      accent: "#ef1f8f",
      ink: "#ff5aaa",
      deep: "#2a0d1f",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [{ type: "goals", items: ["Increase video watch time", "Increase retention of DAU & MAU", "Improve visitor to streamer ratio"] }],
      },
      {
        id: "voice",
        heading: "How do we get there?",
        blocks: [
          {
            type: "text",
            kicker: "It starts with the Voice of the user",
            body: ["We did in depth domain research and competitive analysis to identify gaps in the domain and uncover insights into actual viewer expectations."],
          },
          { type: "text", heading: "Putting Business goals & user needs at the center of OTT-verse" },
          {
            type: "image",
            wide: true,
            img: m(
              "minitv/frame-1686561058.webp",
              "Viewer journey map. Experiences. Browse: Unsure if I will like it. Feeling confused. Too many steps to know more about the show. Watch: Ads are distracting, I lose the flow. How much do I watch to know if I really like it? How do I control the quality & speed? Continue watching: Loved last one, want to watch more like that. Forgot about a series I was watching, how can I be reminded? Should I turn on notifications, don’t want too many. Find a show without getting bored. Customise watch experience and avoid distractions. Personalised recommendations and reminders.",
              { panel: true, light: true },
            ),
          },
          {
            type: "text",
            body: [
              "Based on an in-depth domain research of experience across apps and gaps in current experiences across the domain, we identified the struggles viewers face at key points in their journey. This helped us built clear understanding of why viewers browse more than watching, and why do they drop during the watch time.",
            ],
          },
        ],
      },
      {
        id: "streamers",
        heading: "How might we Transform Casual Browsers into engaged Streamers",
        blocks: [
          {
            type: "rows",
            items: [
              {
                title: "MINI NEWS",
                principle: "Familiarity Bias",
                body: ["Introducing viewers to upcoming and existing shows in a social media stories format, creating buzz and sharing behind-the-scenes gossip."],
                media: [v("minitv/mini-news.mp4", 332, 720, "Mini News: show news and gossip in a stories format")],
                dw: 366,
              },
              {
                title: "IMMERSIVE SYNOPSIS",
                principle: "Progressive disclosure",
                body: ["For thriller, horror and dark genres - using progressive disclosure to pike curiosity and thrill by making the viewer walk in the shoes of the show lead."],
                media: [m("minitv/group-1686560686.webp", "Immersive synopsis: a show’s story revealed scene by scene around the phone screen")],
                dw: 735,
              },
              {
                title: "MINI LAUGHS",
                principle: "Familiarity Bias",
                body: ["“I haven’t watched the movie, but I’ve seen a meme about it. ” We leveraged this existing behavior to use Memes as a starting point of discovery."],
                media: [v("minitv/mini-laughs.mp4", 332, 720, "Mini Laughs: memes from shows leading to the show")],
                dw: 366,
              },
            ],
          },
          { type: "metric", label: "Metric Impacted", value: "Visitor to Streamer Ratio Increased" },
        ],
      },
      {
        id: "watching",
        heading: "How might we Keep the Viewers engaged during Watching",
        blocks: [
          {
            type: "rows",
            items: [
              {
                title: "CLIFFHANGER PIP",
                principle: "Curiosity Gap",
                body: ["Cliffhanger PiP keeps viewers hooked during ad breaks with sneak peeks of upcoming scenes, maintaining suspense and retaining audience attention."],
                media: [v("minitv/cliddhanger-pip.mp4", 332, 720, "Cliffhanger picture-in-picture: a sneak peek playing during an ad break")],
                dw: 366,
              },
              {
                title: "EPISODE QNA",
                principle: "Positive Reinforcement",
                body: [
                  "By introducing game-like elements such as Q&A segments, viewers are intrinsically motivated to participate and stay engaged with the content, as it makes the experience more enjoyable and rewarding.",
                ],
                media: [v("minitv/qna.mp4", 332, 720, "Episode Q&A: a quiz about the episode while watching")],
                dw: 366,
              },
            ],
          },
          {
            type: "spotlight",
            title: "Emo Cue",
            body: "EmoCue visually signals key moments in the content, piquing anticipation and curiosity to keep viewers hooked throughout the runtime",
            video: v("minitv/emocue.mp4", 1280, 720, "EmoCue: emoji markers on the player’s timeline signal the key moments ahead"),
            principle: "Curiosity Gap",
          },
          { type: "metric", label: "Metric Impacted", value: "Video Watch Time Increased" },
        ],
      },
      {
        id: "coming-back",
        heading: "How might we keep viewers coming back",
        blocks: [
          {
            type: "rows",
            items: [
              {
                title: "DELIGHTFUL NOTIFICATIONS",
                principle: "Emotional Engagement",
                body: [
                  "By incorporating attention-grabbing elements like stickers and pop culture references to evoke humor and foster positive emotions, we have made notifications delightful and entertaining.",
                ],
                media: [
                  m("minitv/group-1686560691.webp", "A playful miniTV notification on a lock screen"),
                  m("minitv/group-1686560692.webp", "A miniTV notification with a sticker on a lock screen"),
                  m("minitv/group-1686560691.webp", "A playful miniTV notification on a lock screen"),
                ],
                dw: 240,
              },
            ],
          },
          { type: "metric", label: "Metric Impacted", value: "DAU & MAU Increased" },
        ],
      },
      {
        id: "shifts",
        heading: "Key Shifts",
        blocks: [
          {
            type: "text",
            body: [
              "Beyond merely redesigning screens, we focused on current viewer behavior and expectations to leverage existing watching habits and create a thoughtfully integrated app.",
            ],
          },
          {
            type: "shifts",
            items: [
              ["Passive Browsing", "Active, engaged browsing"],
              ["More Browsing", "More watching"],
              ["Brief use of app", "More likely to return"],
              ["Choice Paradox", "Better decision-making"],
            ],
          },
        ],
      },
    ],
    closing:
      "Having created this foundation, HumanX team continues to partner with Amazon miniTV as we build them into a category benchmark and making the OTT experience more human.",
    source: "https://www.humanx.io/case-studies/minitv",
    metaDescription:
      "Amazon miniTV is the ultimate destination for free video entertainment. An advertiser funded OTT platform, Amazon miniTV partnered with HumanX to increase traffic and watch time, and in turn boost sales for Amazon E-Commerce.",
  },

  /* ===================================================================== MOMVERSE */
  {
    slug: "apollo-momverse",
    client: "Apollo Momverse",
    title: "Companion for all things parenting",
    logo: { img: m("apollo-momverse/icon.svg", "Apollo Momverse"), h: 52 },
    intro: [
      "Anxiety is common across the motherhood journey - driven by content overload, isolation, and uncertainty. **Apollo Momverse is built to ease** that. Designed as a **content-first platform**, Momverse offers the **benefits of the Apollo ecosystem**, which gives you access to Apollo doctors, expert reviewed articles and purchase of essential products. Momverse also fosters a **vibrant community of mothers** in different stages of their journey ensuring support every step of the way.",
    ],
    hero: { imgs: [m("apollo-momverse/group-1707480934.webp", "Momverse on phone and web: your personalised companion for all things parenting")] },
    theme: {
      mode: "light",
      bg: "#ffffff",
      fg: "#2f2a3a",
      body: "#5b5666",
      muted: "#8c8796",
      line: "rgba(47,42,58,0.12)",
      panel: "#f3effc",
      accent: "#f15a22",
      ink: "#bf410c",
      deep: "#4a2fb4",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [{ type: "goals", items: ["Reduce anxiety of users at every stage of motherhood", "Drive engagement through relevant content, community, and commerce"] }],
      },
      {
        id: "voice",
        heading: "Voice of the User",
        blocks: [
          { type: "text", body: ["We reached out to women in different stages of motherhood to understand the issues they face."] },
          {
            type: "voices",
            noteIcon: m("apollo-momverse/frame-1814108000.webp", "Insight"),
            items: [
              {
                who: "MOTHER TO BE",
                quote: "“I was first to get pregnant in my friend circle and felt like there are too many out dated opinions from older generations.”",
                note: "Lack of relatable support",
                img: m("apollo-momverse/frame-1686560592-7.webp", ""),
              },
              {
                who: "MOTHER TO BE",
                quote: "“I don’t trust any information that does not come from my doctor. Others giving opinions just overwhelms me.”",
                note: "Overwhelmed by opinions",
                img: m("apollo-momverse/frame-1686560592-3.webp", ""),
              },
              {
                who: "MOTHER TO A 4YR OLD",
                quote: "“I want to be a good mother to both my children and need reassurance every now and then that I am doing a good job.”",
                note: "Desire to excel in their new role",
                img: m("apollo-momverse/frame-1686560592-5.webp", ""),
              },
            ],
          },
          {
            type: "text",
            body: [
              "Armed with these insights, we set out to create an experience that is both comforting and empowering. From easing anxieties with **expert-backed credible content**, to creating a supportive ecosystem of tools and products **tailored to each stage** and delivered in formats that are **easy to consume**, every element was thoughtfully designed with user intent in mind. These 3 points then became the pillars around which all our interventions are designed.",
            ],
          },
          { type: "banner", text: "How might we go from - Anxious parenting to happy parenting?", bg: m("apollo-momverse/frame-1686560763.webp", "") },
        ],
      },
      {
        id: "pillars",
        heading: "The 3 pillars of Apollo Momverse",
        blocks: [
          { type: "text", body: ["We followed these pillars while designing the platform that would be applicable across multiple stages of motherhood"] },
          {
            type: "pillars",
            items: [
              { n: "1", lead: "How might we", title: "PERSONALISE THE EXPERIENCE" },
              { n: "2", lead: "How might we", title: "ENHANCE CREDIBILITY" },
              { n: "3", lead: "How might we", title: "MAKE CONTENT CONSUMABLE" },
            ],
          },
        ],
      },
      {
        id: "personalise",
        heading: "How might we personalise the experience",
        blocks: [
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/onboarded-homepage-pregnancy.webp", "Momverse home screen showing the user’s week of pregnancy and what to expect"),
            items: [{ title: "PERSONALISED TO STAGE", at: 26.96, body: "Quick glance at everything the user needs to know about where they are in the journey" }],
          },
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/web-stories-mobile-translucent-bg.webp", "A Momverse web story, full screen on the phone"),
            overlays: [{ img: m("apollo-momverse/frame-1814106651.webp", "This Week’s Guide card with stories on my baby, my exercises and my body"), x: -67.93, y: 12.22, w: 100 }],
            items: [{ title: "WEB STORIES : WHAT’S NEXT FOR YOU", at: 10.9, body: "A deliberate shift from long articles to bite-sized, scrollable content for busy moms" }],
          },
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/onboarded-homepage-pregnancy-1.webp", "Momverse home screen scrolled: checkups for this stage and what comes next"),
            items: [
              { title: "CURATED CHECKUPS FOR RELEVANT STAGE", at: 25.81, body: "Leveraging the power of the Apollo universe and recommending relevant and timely checkups" },
              { title: "KNOW WHAT’S NEXT IN YOUR PERSONAL JOURNEY", at: 73.11, body: "Not only does the user know what the current stage their in but also prepare for the next" },
            ],
          },
          { type: "text", heading: "Content formats that elevate the Momverse experience" },
          { type: "image", wide: true, img: m("apollo-momverse/group-1707480952-2.webp", "Momverse content formats: articles, web stories, videos, tips and expert answers") },
        ],
      },
      {
        id: "credibility",
        heading: "How might we enhance credibility",
        blocks: [
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/onboarded-homepage-pregnancy-2.webp", "Momverse screen with a symptom checker"),
            items: [{ title: "CHECK YOUR SYMPTOMS", at: 1.54, body: "For when a user is anxious about the symptoms they are facing." }],
          },
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/onboarded-homepage-pregnancy-3.webp", "Momverse screen with entry points to ask a doctor"),
            items: [{ title: "ASK A DOCTOR", at: 1.54, body: "Entry points to communities in which questions are exclusively answered by Apollo doctors" }],
          },
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/non-onboarded-non-logged-in.webp", "Momverse screen spotlighting doctors and mothers in the community"),
            items: [{ title: "SPOTLIGHT ON DOCTORS AND MOTHERS", at: 3.08, body: "Providing social proof to encourage users to be a part of the Momverse community" }],
          },
          {
            type: "rows",
            items: [
              {
                title: "COMMUNITY",
                body: ["A Momverse platform for users to connect with other moms and doctors with posts and topics categorised according to stage. Here are some of its features:"],
                list: [
                  "Smart feed that caters to topics and posts that the user cares about",
                  "Posts and responses by expert doctors",
                  "Anonymous posting for those hard to talk about topics",
                  "Interest and stage relevant article and product prompts",
                ],
                media: [
                  m("apollo-momverse/non-onboarded-non-logged-in-2.webp", "Momverse community feed"),
                  m("apollo-momverse/create-a-post-1.webp", "Creating a post in the Momverse community"),
                  m("apollo-momverse/create-a-post-2.webp", "Posting anonymously in the Momverse community"),
                ],
                dw: 270,
              },
            ],
          },
        ],
      },
      {
        id: "consumable",
        heading: "How might we make content consumable",
        blocks: [
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/full-scroll-view.webp", "A Momverse article, full length"),
            overlays: [
              { img: m("apollo-momverse/group-1707480949.webp", ""), x: -87.2, y: 10.0, w: 36.4 },
              { img: m("apollo-momverse/in-this-article-bottom-sheet.webp", "In this article: a bottom sheet listing the article’s sections"), x: -78.5, y: 43.6, w: 97.8 },
            ],
            items: [{ title: "JUMP TO RELEVANT SECTIONS WITH ARTICLE GUIDES", at: 10.0, line: false, body: "For quick access to sections of an article that are relevant to the user" }],
          },
          {
            type: "annotated",
            text: "left",
            dw: 368,
            img: m("apollo-momverse/cluster-page.webp", "Momverse topic page with quick tips for the user’s stage"),
            items: [{ title: "QUICK RELEVANT STAGE BASED TIPS", at: 28.52, body: "For all those times that the users has just a few minutes to read up, all they need is to go through these tips" }],
          },
          {
            type: "rows",
            items: [
              {
                title: "REVENUE THROUGH RELEVANCE",
                body: [
                  "The focus is to showcase curated content with subtle hints at relevant commerce. The user can then choose to buy products or book an appointment with a doctor specifically recommended for their stage.",
                ],
                media: [
                  m("apollo-momverse/onboarded-homepage-pregnancy-5.webp", "Momverse home screen with products recommended for the stage"),
                  m("apollo-momverse/onboarded-homepage-pregnancy-6.webp", "Momverse screen recommending a doctor’s appointment"),
                  m("apollo-momverse/onboarded-homepage-pregnancy-7.webp", "Momverse screen with curated content and relevant products"),
                ],
                dw: 270,
              },
            ],
          },
        ],
      },
      {
        id: "shifts",
        heading: "Desired Shifts",
        blocks: [
          { type: "text", body: ["Armed with these insights, the desired shift became clear"] },
          {
            type: "shifts",
            items: [
              ["Hassle of finding the right info", "Find stage specific information"],
              ["Lack of trust in online information", "Leverage Apollo doctors"],
              ["Anxiety about the unknown", "Support from the community"],
            ],
          },
        ],
      },
      {
        id: "testimonial",
        testimonial: {
          quote:
            "HumanX team’s UI/UX is sharp, the development was relentless, and their project management capability is seamless. As a result, their team will build you a damn good product. If you want a product that actually works and drives growth for your business, these are your people.",
          name: "Tarush Singhal",
          role: "Head of Content Marketing, Apollo 247",
        },
      },
    ],
    source: "https://www.humanx.io/case-studies/apollo-momverse",
    metaDescription:
      "Apollo Momverse is built to ease anxiety across the motherhood journey: a content-first platform with access to Apollo doctors, expert reviewed articles and a vibrant community of mothers.",
  },

  /* ===================================================================== QUICKPLAY */
  {
    slug: "quickplay",
    client: "Quickplay",
    title: "Generative AI concepts for the future of TV",
    logo: { img: m("quickplay/quickplay.webp", "Quickplay"), h: 52 },
    intro: [
      "Quickplay Media is the industry leader in delivering next generation OTT solutions. It’s latest collaboration with **Google Cloud**, as partners aimed to harness the power of generative AI to create new opportunities for **user engagement, discovery and monetisation** for the media and entertainment industry.",
      "With HumanX as the design partner, Quickplay delivered innovative, industry-first concepts at IBC 2023 (International Broadcasting Convention) in Amsterdam. We crafted and brought to life a fully functioning model, showcasing the magic of combining voice commands, large language models (LLMs), and Quickplay’s CMS to dive into a world of seamless discovery and engagement like never before.",
    ],
    hero: { imgs: [m("quickplay/hero-image.webp", "Two people on a sofa in front of a TV showing Quickplay’s generative AI assistant")], bleed: true },
    theme: {
      mode: "dark",
      bg: "#0d070c",
      fg: "#ffffff",
      body: "#c6bac3",
      muted: "#857883",
      line: "rgba(255,255,255,0.12)",
      panel: "#1a1018",
      accent: "#f86828",
      ink: "#ff8a52",
      deep: "#1d0f1a",
    },
    chapters: [
      {
        id: "ibc",
        heading: "IBC 2024",
        blocks: [
          {
            type: "quoteFig",
            quote:
              "“We’re excited that Quickplay will expand its use and application of Google Cloud’s Generative AI capabilities, and help media organizations accelerate their Generative AI development. Our work with Quickplay will help to build customer engagement and foster long-term value.”",
            name: "Kip Schauer",
            role: "Global Head of Media & Entertainment Partnerships at Google Cloud",
            img: m("quickplay/ibc-2024.webp", "Quickplay’s stand at IBC"),
          },
        ],
      },
      {
        id: "challenge",
        heading: "The Challenge",
        blocks: [
          {
            type: "text",
            kicker: "Empowering viewers - AI’s solution to overwhelming OTT choices",
            body: [
              "Navigating through the endless choices on OTT platforms to find the perfect show or movie can be like searching for a needle in a haystack which leaves users overwhelmed. With compelling reasons to stay engaged, the OTT experience often falls short of its potential.",
            ],
          },
        ],
      },
      {
        id: "goal",
        heading: "Goal",
        blocks: [
          {
            type: "goals",
            items: [
              {
                title: "Improve Discovery",
                body: "Our goal was to make content discovery effortless with AI-powered voice commands ensuring personalised recommendations tailored to each user’s preferences.",
              },
              {
                title: "Enhance Engagement",
                body: "We also aimed to boost engagement to foster user retention and enhance the experience of the platform. By giving users more control to personalise their experience, we empower them to consume content on their terms.",
              },
            ],
          },
        ],
      },
      {
        id: "voice",
        heading: "How do we get there?",
        blocks: [
          {
            type: "text",
            kicker: "It starts with the voice of the user",
            body: [
              "We reached out to Cinephiles & TV buffs to understand their current experience with OTT platforms, mainly focusing on content discovery and consumption patterns.",
            ],
          },
          {
            type: "voices",
            items: [
              { who: "INDIVIDUALS", quote: "“With so many choices I’m confused and unsure what to watch”", img: m("quickplay/voice-1.webp", "") },
              { who: "COUPLES", quote: "“We end up spending a lot of time trying to find something we both like.”", img: m("quickplay/voice-2.webp", "") },
              { who: "FAMILIES", quote: "“It’s hard to find something to watch together as a family”", img: m("quickplay/voice-3.webp", "") },
            ],
          },
          {
            type: "banner",
            text: "How might we help users discover content and stay engaged with Generative AI?",
            bg: m("quickplay/discover-bg.webp", ""),
            fg: m("quickplay/discover-fg.webp", ""),
          },
        ],
      },
      {
        id: "behaviours",
        heading: "Emerging behaviours of content discovery",
        blocks: [
          {
            type: "text",
            body: ["With the evolving potential of AI-powered solutions, we explored new interfaces and interactions to observe patterns for content discovery and engagement."],
          },
          { type: "image", wide: true, img: m("quickplay/discovery.webp", "Explorations of AI-powered discovery: conversational search, voice prompts and mood-based recommendations on TV") },
        ],
      },
      {
        id: "ideas",
        heading: "Ideas that focus on behaviour change",
        blocks: [
          {
            type: "text",
            body: ["Taking inspiration from industry learnings, we brainstormed collaboratively to ideate solutions that subtly nudge for behaviour change by leveraging GenAI."],
          },
          {
            type: "bento",
            items: [
              { title: "Lens Mode", body: "Discover the show cast, music, shopping", imgs: [m("quickplay/bento-1.webp", "Lens mode: cast, outfits and music picked out from a paused scene")], span: 6 },
              {
                title: "Couple Decider",
                body: "Smart recommendations that are the “right match” - based on viewers preferences",
                imgs: [m("quickplay/bento-2.webp", "Couple decider: a film matched to both viewers’ favourites")],
                span: 4,
              },
              { title: "Weekly Schedule", body: "Plan content for the week by syncing your calendar", imgs: [m("quickplay/bento-3.webp", "Weekly schedule: shows slotted into the day’s calendar")], span: 2 },
              { title: "Dialogue Search", body: "Search by the most iconic dialogues you recall", imgs: [m("quickplay/bento-4.webp", "Dialogue search: finding a film from a remembered line")], span: 2 },
              {
                title: "Personalised AI Assistant",
                body: "Make your superhero into an AI assistant for a personalised experience",
                imgs: [m("quickplay/bento-5.webp", "A superhero as the viewer’s personal AI assistant")],
                span: 4,
              },
              {
                title: "Spin the Globe",
                body: "A gamified experience to discover global content. AI recommendations that are curated for you.",
                imgs: [m("quickplay/bento-6.webp", "Spin the globe: a voice prompt to stop the globe spinning"), m("quickplay/bento-7.webp", "Movies that are trending in Turkey")],
                span: 6,
              },
            ],
          },
        ],
      },
      {
        id: "shifts",
        heading: "Focus on Key Shifts",
        blocks: [
          { type: "text", body: ["Beyond just rethinking the digital assets, our team influenced the internal approach to digital CX leading to certain key shifts:"] },
          {
            type: "shifts",
            items: [
              ["Complex remote interactions", "Seamless Voice Commands"],
              ["Abundance of choice", "Personalised Recommendations"],
              ["Limited engagement on TV", "Interactive Engagement Features"],
            ],
          },
        ],
      },
      {
        id: "ida",
        heading: "Introducing “Ida” , your personal AI assisstant",
        blocks: [
          { type: "text", body: ["“Ida” showcases visual states depending on the activity - such as speaking, listening, and thinking."] },
          {
            type: "trio",
            items: [
              { title: "SPEAKING", body: "A ripple effect of colour play when the AI speaks", video: v("quickplay/ida-speaking.mp4", 1280, 720, "Ida speaking: rippling colour") },
              { title: "LISTENING", body: "A soft orb absorbing information through visual particle play", video: v("quickplay/ida-listening.mp4", 1280, 720, "Ida listening: a soft orb of particles"), small: true },
              { title: "THINKING", body: "A swirl motion indicating active cognitive processing", video: v("quickplay/ida-thinking.mp4", 1280, 720, "Ida thinking: a swirling motion") },
            ],
          },
        ],
      },
      {
        id: "features",
        heading: "Features that elevate your watching experience",
        blocks: [
          {
            type: "stack",
            items: [
              {
                title: "A CONVERSATIONAL INTERFACE",
                body: "Using Generative AI, we designed a conversational chat interface backed by voice commands that humanises the experience",
                video: v("quickplay/feature-1.mp4", 1280, 718, "Chatting with Ida by voice to find something to watch"),
              },
              {
                title: "PERSONALISED RECOMMENDATIONS",
                body: "We curate recommendations based on user preferences, watch history, feedback, leveraging machine learning to display the most relevant content to each user",
                video: v("quickplay/feature-2.mp4", 1280, 718, "Ida recommending shows for the viewer’s mood"),
              },
              {
                title: "TOPIC BASED DISCOVERY",
                body: "Users get recommendations based topics such as weather, holidays, current events and more to assist with content discovery",
                video: v("quickplay/feature-3.mp4", 1280, 718, "Recommendations built around a topic"),
              },
              {
                title: "PERSONALITY BASED DISCOVERY",
                body: "Gamified the experience to discover content - suggesting relevant recommendations that are tailored to a user’s personality type",
                video: v("quickplay/feature-4.mp4", 1280, 718, "A personality quiz that leads to recommendations"),
              },
            ],
          },
        ],
      },
      {
        id: "testimonial",
        testimonial: {
          quote:
            "“We needed a skilled design partner to assist in creating an application leveraging Gen AI for media discovery and recommendations. Devang and the team at HumanX responded swiftly. They collaborated closely with us on ideating and researching possible use cases and helped us develop an MVP that we launched at a tradeshow. The product received outstanding reviews and garnered several industry awards. Our collaboration with the HumanX team has expanded to include multiple projects, significantly advancing our product roadmap and earning us numerous innovation awards, including a BaM and Product of the Show awards at NAB 2024. The team’s exceptional attitude and design expertise continue to impress us!”",
          name: "Naveen Narayanan",
          role: "Head of Product Innovation and Data Science, QuickPlay",
        },
      },
    ],
    source: "https://www.humanx.io/case-studies/quickplay",
    metaDescription:
      "With HumanX as the design partner, Quickplay delivered innovative, industry-first generative AI concepts at IBC 2023 in Amsterdam, combining voice commands, large language models and Quickplay’s CMS.",
  },

  /* ===================================================================== ASK */
  {
    slug: "ask-financials",
    client: "ASK Asset & Wealth Management",
    title: "Transforming ASK for an Elevated Brand Perception",
    logo: { img: m("ask-financials/ask-a-w-management-sub-brand-horizontal-identity-rgb-positive.svg", "ASK Asset & Wealth Management"), plate: true, h: 40 },
    intro: [
      "ASK Group is a renowned financial services group and a leading industry player in wealth and investment management, catering to some of the most affluent families in India. Started in 1983, ASK is known for strong research-based investment management, asset management, private equity, wealth advisory and multi-family office businesses. The brand pursued a digital facelift to ensure accurate perception and foster meaningful connections with its HNI and Ultra HNI clientele. This goal was achieved through a compelling narrative, brand-aligned imagery, and a design that facilitates easy navigation and content discovery.",
    ],
    hero: { imgs: [m("ask-financials/homepage-desktop-1.webp", "ASK homepage: Led by foresight, realised by expertise")] },
    theme: {
      mode: "light",
      bg: "#faf8f3",
      fg: "#1d2b30",
      body: "#4e5a5e",
      muted: "#8a9195",
      line: "rgba(11,51,64,0.14)",
      panel: "#efe9dc",
      accent: "#b18c4a",
      ink: "#83632a",
      deep: "#0b3340",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [
          {
            type: "goals",
            items: [
              "Increase unique visitors to leads ratio",
              "Enhance the digital investment journey for both new and current clientele",
              "Create a unique narrative that speaks the India Story",
            ],
          },
          { type: "image", wide: true, img: m("ask-financials/ask-fullscreen-mock.webp", "The new ASK website on a large screen") },
        ],
      },
      {
        id: "personality",
        heading: "Crafting a befitting personality",
        blocks: [
          { type: "words", items: ["Affluent", "Contemporary", "Indian", "Warm", "Approachable"] },
          {
            type: "text",
            body: [
              "The process began with identifying attributes that best describe the brand—words that encapsulate its essence and form the cornerstone of the brand visual language. This guided the creation of the right narrative and the design of icons and images that align seamlessly with the brand's identity.",
            ],
          },
          {
            type: "styleRow",
            title: "Icon Style",
            body: "To complement the brand's premium appearance, the icons have been designed to be minimal and abstract.",
            cols: 3,
            imgs: [
              m("ask-financials/frame-1686560778.webp", "Abstract icon: a circle framed by four chevrons"),
              m("ask-financials/frame-1686560779.webp", "Abstract icon: a circle in a ring"),
              m("ask-financials/frame-1686560780.webp", "Abstract icon: a square with corner marks"),
              m("ask-financials/im-ask-icons.webp", "Abstract icon: two overlapping squares, one dashed"),
              m("ask-financials/im-ask-icons-2.webp", "Abstract icon: stacked lines"),
              m("ask-financials/frame-1686560777.webp", "Abstract icon: a diamond in a frame"),
            ],
          },
          {
            type: "styleRow",
            title: "Imagery",
            body: "Images have been carefully filtered to convey the brand's message of affluence, aspiration, and exclusivity.",
            cols: 2,
            imgs: [
              m("ask-financials/screenshot-2024-01-09-at-6-36-3.webp", "Brand imagery: an Indian city at dusk"),
              m("ask-financials/istock-1465539381-1.webp", "Brand imagery: a family in warm light"),
              m("ask-financials/screenshot-2024-06-18-at-6-16-54-pm-1.webp", "Brand imagery: a landmark bridge at night"),
              m("ask-financials/istock-1487843883-1.webp", "Brand imagery: a professional at work"),
            ],
          },
        ],
      },
      {
        id: "outcomes",
        heading: "Interventions that deliver outcomes",
        blocks: [
          {
            type: "text",
            body: ["A meticulously planned flow has been implemented across all key landing pages, creating a narrative that enables users to easily comprehend the offerings."],
          },
          { type: "flow", items: ["Header banner with upfront solutions", "Trust Markers", "Solution Overview", "Primary Call to Action"] },
          {
            type: "annotated",
            text: "left",
            dw: 800,
            img: m("ask-financials/ask-private-wealth-join-our-partner-program-1.webp", "ASK Private Wealth landing page, from header banner to call to action"),
            items: [
              { title: "CLEAR BRAND POSITIONING", at: 12.14, body: "Carefully crafted positioning through copy and imagery to give the legacy experience to visitors" },
              { title: "UPFRONT DISCOVERY", at: 23.72, body: "Each landing page features a clear solution discovery, reducing cognitive load and ensuring a seamless user journey." },
              { title: "TRUST MARKERS", at: 38.84, body: "Key factors demonstrating brand credibility, experience, and expertise." },
              { title: "SOLUTIONS", at: 64.88, body: "Concisely outlined solutions to provide a comprehensive overview of our offerings." },
              { title: "CLEAR CALL TO ACTION", at: 87.38, body: "A clear and compelling call to action to drive lead generation." },
            ],
          },
        ],
      },
      {
        id: "experience",
        heading: "Interventions that elevate your investment experience",
        blocks: [
          {
            type: "text",
            body: [
              "Movement and interaction were key to building intrigue. Visual assets transformed with each scroll, revealing key information. We added micro-interactions and animations to enhance engagement.",
            ],
          },
          {
            type: "mosaic",
            items: [
              { imgs: [m("ask-financials/image-321.webp", "ASK’s legacy section on a laptop")], caption: "A legacy that empowers people uplifts communities.", span: 3 },
              {
                title: "ILLUSTRATED APPROACH",
                body: "Thoughtfully crafted illustrated approach seamlessly integrates with existing products.",
                imgs: [m("ask-financials/preview-1.webp", "Illustrated product page on a tablet")],
                span: 3,
              },
              { imgs: [m("ask-financials/frame-1686560745.webp", "How we invest: investment filters explained interactively")], span: 4 },
              {
                title: "INTERACTIVE CONTENT",
                body: "Smart interactive content effectively simplifies complex information in an engaging and approachable manner.",
                imgs: [m("ask-financials/frame-1707480779.webp", "")],
                span: 2,
              },
              { imgs: [m("ask-financials/image-320.webp", "An ASK page on a phone")], span: 2 },
              { imgs: [m("ask-financials/our-portfolios.webp", "Our Portfolios page")], span: 4 },
            ],
          },
        ],
      },
      {
        id: "shifts",
        heading: "Desired Shifts",
        blocks: [
          { type: "text", body: ["Armed with these insights, the desired shift became clear -- for both CISOs as well as for end users."] },
          {
            type: "shifts",
            items: [
              ["Content Discovery Disarray", "Seamlessly blended in the narrative"],
              ["Ambiguity about the brand", "Reputable, experienced brand"],
              ["Ambiguous Investment Options", "Streamlined Investment Options"],
            ],
          },
        ],
      },
      {
        id: "testimonial",
        testimonial: {
          quote:
            "We’ve worked with HumanX on revamping our website. I couldn’t be happier with outcome. From start to finish, their team demonstrated exceptional professionalism, creativity, solution orientation and attention to detail. They took the time to understand our vision and brought it to life beautifully.",
          name: "Shanu Singh",
          role: "Chief Marketing Officer, ASK Asset & Wealth Management Group",
        },
      },
    ],
    source: "https://www.humanx.io/case-studies/ask-financials",
    metaDescription:
      "ASK Group pursued a digital facelift to ensure accurate perception and foster meaningful connections with its HNI and Ultra HNI clientele, through a compelling narrative, brand-aligned imagery, and easy navigation and content discovery.",
  },

  /* ===================================================================== HURUN */
  {
    slug: "hurun",
    client: "Hurun India",
    title: "Transforming Hurun India for an Elevated Brand Perception",
    logo: { img: m("hurun/hurun-logo.webp", "Hurun India"), h: 52 },
    intro: [
      "Hurun India is part of the global Hurun Report, which is a leading research, luxury publishing, and events group. Hurun India focuses on promoting entrepreneurship through comprehensive lists and research, highlighting wealth creation, innovation, and philanthropy in India.",
      "The objective of the facelift is to craft a compelling narrative that effectively communicates the brand's story, values, and philosophy. The new design reflects the brand's credibility and authenticity, with a touch of prestige. It prioritizes user-friendly navigation, allowing visitors to easily explore and engage with the content.",
    ],
    hero: { imgs: [m("hurun/hurun-homepage-image.webp", "Hurun India homepage: Promoting Indian Entrepreneurship through Lists & Research")] },
    theme: {
      mode: "dark",
      bg: "#0d0c11",
      fg: "#ffffff",
      body: "#bdb8bf",
      muted: "#7a7580",
      line: "rgba(255,255,255,0.12)",
      panel: "#18161d",
      accent: "#e0201f",
      ink: "#ff5a52",
      deep: "#1c1a22",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [
          { type: "goals", items: ["Drive engagement and enhance content discovery", "Increase paid subscriptions", "Celebrate ‘the India economy’ story"] },
          { type: "image", wide: true, img: m("hurun/laptop-image.webp", "The new Hurun India website on a laptop") },
        ],
      },
      {
        id: "personality",
        heading: "Crafting a befitting personality",
        blocks: [
          { type: "words", items: ["Premium", "Contemporary", "Warm", "Approachable"] },
          {
            type: "text",
            body: [
              "We began by addressing the challenge of discovery by creating a dedicated page for each pillar, showcasing all the content categories. To enhance engagement and provide visual breaks on this content-heavy page, we assigned unique illustrations to each pillar. The style is abstract and minimal. The selected colour palette is elegant and offers a maximum contrast for improved legibility while maintaining a premium aesthetic.",
            ],
          },
          {
            type: "styleRow",
            title: "Illustration Style",
            body: "Illustrations for each pillar create a visual break and establish the overall visual language, with the signature red colour maintaining brand association.",
            imgs: [m("hurun/frame-1000003735-1.webp", "Abstract pillar illustrations in red and coral on black")],
          },
          {
            type: "styleRow",
            title: "Icon Style",
            body: "To complement the illustration style, line icons are used subtly, ensuring the focus remains on the illustrations.",
            imgs: [m("hurun/frame-1000003735.webp", "Thin line icons with red accents on black")],
          },
          {
            type: "gallery",
            cols: 3,
            imgs: [
              m("hurun/group-1000003732.webp", "Illustration of Indian landmarks with a red emblem", { panel: true, light: true }),
              m("hurun/group-1000003750.webp", "Illustration for the Future Unicorn list", { panel: true, light: true }),
              m("hurun/group-1000003834.webp", "Illustration for the Impact 50 list", { panel: true, light: true }),
            ],
            captions: ["Hurun launch in India", "Hurun India Future Unicorn List", "Hurun India impact 50"],
          },
          { type: "text", body: ["A unique illustration designed for each list to ensure distinctiveness."] },
        ],
      },
      {
        id: "outcomes",
        heading: "Interventions that deliver outcomes",
        blocks: [
          {
            type: "text",
            heading: "How did we solve the discovery issue?",
            body: ["A dedicated page for each pillar, designed with hierarchy of information simplifying the discovery of content and streamlining information flow."],
          },
          {
            type: "annotated",
            text: "left",
            dw: 768,
            img: m("hurun/wealth-creation.webp", "Hurun India Wealth Creation pillar page"),
            items: [
              { title: "NAVIGATION BAR", at: 2.42, body: "A top navigation bar prominently featuring the five pillars of Hurun India, simplifying content discovery" },
              { title: "RECENT HIGHLIGHT", at: 21.84, body: "A dynamic section to highlight the latest releases under the specific pillar" },
              { title: "LIST SHOWCASE", at: 37.36, body: "A display of all the lists under each pillar, helping users associate the pillar with the list type for easier future discovery" },
              { title: "LIST SHOWCASE", at: 54.41, body: "A display of all the lists under each pillar, helping users associate the pillar with the list type for easier future discovery" },
              { title: "LIST SHOWCASE", at: 87.31, body: "A display of all the lists under each pillar, helping users associate the pillar with the list type for easier future discovery" },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 768,
            img: m("hurun/individual-list-open-card.webp", "A Hurun list with an entrant’s card open"),
            items: [
              { title: "FILTERS & SEARCH", at: 22.69, body: "Filter pills introduced for easy filtering of information based on key parameters and an easy search option for any name" },
              { title: "BRIEF ABOUT THE ENTRANT", at: 53.32, body: "A brief sponsored overview of the top 50 entrants on the list" },
              { title: "A WELL INDICATED LIST", at: 78.3, body: "A clearly marked list highlighting changes compared to last year" },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 768,
            img: m("hurun/hurun-lists.webp", "Hurun lists page with search by pillar, list and year"),
            items: [
              {
                title: "STREAMLINED SEARCH",
                at: 28.38,
                body: "A threefold search enhancing the discovery with streamlined browsing between pillars, exploring lists within a pillar, and selecting the year",
              },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 768,
            img: m("hurun/image-322.webp", "Hurun page with a row of short videos"),
            items: [{ title: "SHORT-FORM CONTENT", at: 60.45, body: "Short, engaging video snippets designed for quick and easy consumption" }],
          },
          {
            type: "annotated",
            text: "right",
            dw: 768,
            img: m("hurun/group-1000004809.webp", "Hurun research page filtered by pillar, with featured content"),
            items: [
              { title: "PILLARS AS FILETRS", at: 8.28, body: "Using pillars as filters to ease the discovery" },
              { title: "FEATURED CONTENT", at: 48.35, body: "Creating more entry points for users to discover content" },
            ],
          },
        ],
      },
      {
        id: "shifts",
        heading: "Desired Shifts",
        blocks: [
          { type: "text", body: ["Armed with these insights, the desired shift became clear -- for both CISOs as well as for end users."] },
          {
            type: "shifts",
            items: [
              ["Content Discovery Disarray", "Seamlessly blended in the narrative"],
              ["Ambiguity about the brand", "Reputable, experienced brand"],
            ],
          },
        ],
      },
    ],
    source: "https://www.humanx.io/case-studies/hurun",
    metaDescription:
      "Hurun India focuses on promoting entrepreneurship through comprehensive lists and research. The facelift crafts a compelling narrative of the brand's story, values, and philosophy, with user-friendly navigation.",
  },

  /* ===================================================================== SETU */
  {
    slug: "setu-app",
    client: "Setu Nutrition",
    title: "A supplement compliance app to help users stay consistent",
    logo: { img: m("setu-app/setu-app-logo.svg", "Setu"), plate: true, h: 48 },
    intro: [
      "Setu Nutrition is a leading new age nutrition brand. The insight was that a large number of customers did not comply to the required dosage of supplements with consistency - thereby seeing poor results and lower repeat purchases. The brief was - “how might we help customers adhere to their supplements routine - so they get the results they desire, and come back for more. ?” We worked with the team to create a companion app that helps customers stick to their supplements.",
    ],
    hero: { imgs: [m("setu-app/setu-app-illustration.webp", "Setu app screens: choosing goals, a daily supplement routine and taking a pledge")] },
    theme: {
      mode: "light",
      bg: "#ffffff",
      fg: "#262c45",
      body: "#555b72",
      muted: "#8b90a3",
      line: "rgba(38,44,69,0.12)",
      panel: "#eef0f9",
      accent: "#5a6cb4",
      ink: "#47579a",
      deep: "#2a3366",
    },
    chapters: [
      {
        id: "goal",
        heading: "Goal",
        blocks: [{ type: "goals", items: ["Improve adherence to consistent intake of supplements", "Increase repeat purchase through this direct channel"] }],
      },
      {
        id: "behaviour",
        heading: "Understanding behaviour around supplements",
        blocks: [
          {
            type: "text",
            body: [
              "To understand people’s daily routine (or lack thereof) with supplements, we interviewed existing Setu customers, potential users of the app and experts in the field.",
            ],
          },
          {
            type: "personas",
            labels: ["Motivation", "Linked Behaviours"],
            items: [
              {
                name: "Health & Performance Optimiser",
                img: m("setu-app/frame-1686560732.webp", ""),
                first: ["Socially motivated to supplement diet to improve appearance, targeting skin, hair, and overall aesthetics."],
                second: ["Choice based on trending ingredients and their promises.", "Experiments frequently based on recommendations or influencer endorsements."],
              },
              {
                name: "The Cosmetic Enthusiast",
                img: m("setu-app/frame-1686560628.webp", ""),
                first: ["Uses supplements as a crucial component of medical care to manage or alleviate health conditions."],
                second: ["Less influenced by price or trends.", "High adherence to prescribed supplement regimens as part of a treatment plan."],
              },
              {
                name: "Patient/ Caretaker",
                img: m("setu-app/frame-1686560733.webp", ""),
                first: ["Seeks to enhance physical fitness and cognitive function through targeted nutritional support."],
                second: ["Engages in meticulous research.", "Typically starts with strong adherence but not motivated to maintain consistent intake"],
              },
            ],
          },
        ],
      },
      {
        id: "factors",
        heading: "Factors affecting compliance",
        blocks: [
          {
            type: "iconCards",
            items: [
              {
                icon: m("setu-app/group.svg", ""),
                title: "Distance to result",
                body: "Improvement in health goals is a gradual process, often leading to discouragement and giving up before noticeable impacts are seen.",
              },
              {
                icon: m("setu-app/group-1000004913.webp", ""),
                title: "No litmus/ Lack of proof",
                body: "Progress varies for each individual based on their bodies, and often, there is no clear way of knowing if sufficient progress is being made.",
              },
              {
                icon: m("setu-app/vector-1.svg", ""),
                title: "Lack of trust",
                body: "Trust in supplement effectiveness is undermined by doubts about ingredient quality and insufficient social proof validating efficacy.",
              },
              {
                icon: m("setu-app/group-1000004914.svg", ""),
                title: "Not a perceived dire need",
                body: "Preventive or performance related adherence is weaker, while underlying health conditions demand more support for better adherence.",
              },
              {
                icon: m("setu-app/group-1.svg", ""),
                title: "Prescription v/s self diagnosis",
                body: "When prescribed by a nutritionist / doctor / consultant / or even HRA , there are higher chances of taking it seriously v/s self exploration.",
              },
              {
                icon: m("setu-app/vector.svg", ""),
                title: "Distance to result",
                body: "Improvement in health goals is a gradual process, often leading to discouragement and giving up before noticeable impacts are seen.",
              },
            ],
          },
        ],
      },
      {
        id: "in-action",
        heading: "Behaviour Change in Action",
        blocks: [
          {
            type: "annotated",
            text: "left",
            dw: 329,
            img: m("setu-app/group-1000004855.webp", "Setu roadmap: how the user’s skin will improve at one, two and three months"),
            items: [
              {
                title: "VISUALISING YOUR PATH TO RESULTS",
                at: -3.6,
                principle: "Anchoring",
                body: "Setting expectations through a roadmap helps users visualise the path to results, so they’re less likely to abort. Tangible milestones make it easy for users to anchor their progress.",
              },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 422,
            img: m("setu-app/group-1000004877.webp", "Setu screen explaining the science behind a supplement"),
            items: [
              {
                title: "REINFORCING THE SCIENCE OF SUPPLEMENTS",
                at: 10.43,
                principle: "Enhancing self-efficacy",
                body: "This makes users more likely to adhere to their supplement routine because they feel more assured that their actions will lead to the desired health outcomes.",
              },
            ],
          },
          {
            type: "annotated",
            text: "left",
            dw: 576,
            img: m("setu-app/group-1000004912.webp", "People like me: progress cards from others with similar goals"),
            items: [
              {
                title: "PEOPLE LIKE ME",
                at: 9.35,
                x: 34.4,
                principle: "Social Proof",
                body: "Seeing progress of others with similar health goals and challenges can build trust, motivate one to stick with their regimen, and encourage one to stay consistent.",
              },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 365,
            img: m("setu-app/opting-in-to-stay-committed-setu.webp", "Setu screen where the user signs a pledge to stay committed"),
            items: [
              {
                title: "OPTING IN TO STAY COMMITTED",
                at: 11.88,
                principle: "Commitment Theory",
                body: "When people publicly commit to a goal or behaviour, they feel a stronger drive to follow through because they want to stay true to their word and the expectations of others. Taking a pledge creates a personal promise that boosts accountability and motivation to stick to the intended behaviour, like consistently taking supplements.",
              },
            ],
          },
          {
            type: "annotated",
            text: "left",
            dw: 625,
            img: m("setu-app/bite-size-goals-setu.webp", "Setu screens setting a small goal and celebrating when it is reached"),
            items: [
              {
                title: "BITE SIZE GOALS",
                at: -2.4,
                x: 36.8,
                principle: "Chunking",
                body: "It involves breaking larger objectives into smaller, manageable tasks. This method reduces overwhelm, boosts motivation through achievable milestones, enhances focus, facilitates clear progress tracking, and promotes effective learning and retention, aligning with strategies for sustained goal achievement.",
              },
            ],
          },
          {
            type: "annotated",
            text: "right",
            dw: 568,
            img: m("setu-app/invite-my-partners-setu.webp", "A partner’s voice note reminding the user to take their supplement"),
            items: [
              {
                title: "INVITE MY PARTNER",
                at: 12.2,
                x: 68.7,
                principle: "Accountability",
                body: "Knowing that someone is monitoring your adherence can enhance motivation and deter deviations from the regimen. This principle capitalizes on the natural tendency of individuals to feel a sense of obligation and commitment to those who are invested in their well-being, fostering a collaborative effort towards achieving health goals.",
              },
            ],
          },
        ],
      },
      {
        id: "testimonial",
        testimonial: {
          lead: "The first thing I should commend them on is the ease and cohesion they bring as an extension of your product team.",
          quote:
            "No problem is too big and no request for a re-think too repetitive. On the design front, they're a sprightly young team, who bring both an academic and customer oriented preface to any design output. They're process oriented, they're prompt, and they tell you frankly if your product idea is good/bad. Be foolish to expect anything less.",
          name: "Saurov Kakoti",
          role: "Chief Product Officer, Setu Nutrition",
        },
      },
      {
        id: "shifts",
        heading: "Key Shifts",
        blocks: [
          { type: "text", body: ["Beyond just rethinking the digital assets, our team influenced the internal approach to digital CX leading to certain key shifts:"] },
          {
            type: "shifts",
            items: [
              ["E-commerce", "Health Goal Partner"],
              ["Poor adherence", "High degree of adherence and results"],
              ["One time purchase", "Returning customer"],
            ],
          },
        ],
      },
    ],
    source: "https://www.humanx.io/case-studies/setu-app",
    metaDescription:
      "Setu Nutrition is a leading new age nutrition brand. We worked with the team to create a companion app that helps customers stick to their supplements.",
  },
];

export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);
