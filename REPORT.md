# HumanX website — build report

Source: Figma “HumanX - Website 2026 - INT”, page **🚀 For Development** (frames: Homepage 5376:1438,
About 5376:10174, Contact 5376:3969, Works 5376:7843, Careers 5521:352). All frames are 1920px desktop only.

## 1. Verification summary

| Check | Result |
| --- | --- |
| `npm run build` | ✅ all routes prerendered static (`/api/contact` is the only dynamic route) |
| `npm run lint`, `tsc --noEmit` | ✅ no errors |
| Horizontal overflow / clipped content at 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440, 1536, 1728, 1920, 2560 (all 5 pages + 404) | ✅ none (Playwright + Edge, `scripts/qa-screens.mjs`) |
| Figma vs build at 1920 | Side-by-side reviewed for every page (`scripts/qa-compare.mjs`); differences listed in §2 |
| JSON-LD parse + required props, one h1, heading order | ✅ (`scripts/qa-links-schema.mjs`) |
| Internal links / assets (90 URLs) | ✅ all 200; unknown URL returns 404 |
| Mobile menu (focus trap, Esc, aria-expanded, focus return) | ✅ tested in browser |
| Contact form (client validation, API 422 on bad data, 200 JSON, 303 no-JS redirect) | ✅ |

### Lighthouse 12 (localhost `next start`, Chrome headless, cold image cache)

| Page | Performance (mobile) | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| / | 86 | 100 | 100 | 100 | 3.9 s | 0 |
| /about | 89 | 100 | 100 | 100 | 3.5 s | 0 |
| /works | 89 | 100 | 100 | 100 | 3.5 s | 0.001 |
| /careers | 92 | 100 | 100 | 100 | 3.1 s | 0.002 |
| /contact | 97 | 100 | 100 | 100 | 2.5 s | 0 |
| / (desktop preset) | 100 | — | — | — | — | — |

Mobile Performance is **below the 95 target on 4 of 5 pages**. The remaining cost is simulated slow-4G
FCP (~1.8–2.3 s for ~50 KB gzipped HTML with inlined CSS + Next/React’s ~100 KB JS) and the image-led LCP.
Already applied: inlined CSS, AVIF/WebP via next/image, priority + `fetchPriority` on LCP images, no font
preload storm, modern browserslist, zero CLS. Expect better numbers behind a CDN (Brotli, HTTP/2, warm
image cache); re-measure on the deployed URL. Further levers if needed: drop Inter/Hanken (2 extra
families used only in 2 spots), or replace the hero bitmap with a smaller art-directed mobile crop.

## 2. Figma vs build — discrepancies

**Accessibility-driven (WCAG 2.2 AA) — deliberate**
1. Small orange text on light backgrounds (Read More, active chips, “Your match”, row “02”) uses `#b84a08` instead of `#f36712`/`#f07412` (3.1:1 / 2.9:1 fail).
2. Orange pill CTAs (Start Something New, See Open Roles, Bring Your X To HumanX, View On Maps): gradient darkened to `#c4500a → #b65a24` (Figma `#ff821f → #eba772`, white text 2.5:1).
3. Philosophy highlights use `#f36712` instead of `#f07412` (needed for 3:1 large-text contrast).
4. Low-alpha text raised: learning card date/type `white/36 → /60`, team roles `white/32 → /60`, Openings column headers & count `#8b8b8b → #6b6b6b`, form footnote `#858585 → #6b6b6b`.
5. ~~Footer scrim~~ removed to match Figma (revision 2). Note: the white socials/copyright text sits on the bright end of the glow, as designed, which is below 4.5:1 in places.

**Brief-driven additions**
6. Footer nav (Home/About/Work/Careers/Contact) added top-right of the footer — not in Figma.
7. Header active state is consistent (bold + underline). Figma shows “Home” as active on About and Contact, and orange on About.
8. Mobile drawer menu, skip link, 404 page — no Figma frames; built in the existing visual language.
9. “Ask AI for Summary” icons link to Gemini / Claude / ChatGPT with a summary prompt for the site.

**Interaction / content limitations**
10. Header (revision 2): sticky, nav right-aligned beside the pill, frosted band rgba(255,255,255,.1) blur 50 on dark sections, and it switches light/dark automatically with the section underneath (matching the About mid-page dark header). The About variant with an IST clock and underlined “Start a Project” is not reproduced; the pill is used everywhere.
11. About studio carousel: native scroll-snap (swipe/trackpad/keyboard), centred on slide 2 as in Figma, every slide shows its own quote; no autoplay. Figma animates a single quote layer.
12. About team strip (Figma marquee, 2860 px wide) is a horizontally scrollable row with the Figma stagger on ≥1024 px.
13. Testimonial “logo tabs” render as a static client-logo row (only one testimonial exists, so tabs would switch to nothing).
14. Careers “mutation” builder (Human Edge / X Strand / Years Shipping → specimen card) is rendered in the designed state, non-interactive. Making it a real quiz needs result logic and copy for other combinations.
15. Works and Openings filters work client-side over server-rendered lists; filters with no matching projects (Web, Research, Design System, CX, Strategy) are disabled because the design has no empty state.
16. Case-study cards, featured “Read More”, and learning-card CTAs (“Join the conversation”, “See the thinking”, “Read story”) have no destination pages, so on Works/learning they render as labels. Homepage “Read More”/“See all Work” go to `/works`; “Get In Touch” and “Start a Project” go to `/contact`; “Join Our Team” goes to `/careers`.
17. Careers “Apply” opens an email to hello@humanx.io with the role in the subject (no ATS link in the design).
18. Hero play button (Home) and Showreel play button (About) are decorative — no video source in the file.
19. The live IST clock replaces the static sample time in Careers.

**Fidelity / asset notes**
20. Complex mockups and illustrations are exported from Figma as images (case thumbnails, Works cards, needle diagram, DNA helix, showreel, map, footer wordmark). Text inside them is not selectable; it is described in alt text.
21. About H1 uses Uncut Sans “Book” in Figma; the self-hosted package has no Book weight, so Regular (400) is used.
22. Testimonial “quickplay” logo text: Hanken Grotesk instead of Work Sans (Work Sans not otherwise used).
23. Homepage case card left “notch” (Vector 6226) is a CSS approximation; shown on the first card and on hover/focus of others.
24. Contact map: Figma stretches a 1024×413 bitmap to 1845×843; the stretched aspect is baked into the asset (avoids a distorted `<img>`).
25. Hidden/obscured Figma layers not rendered: About quote card “The best work happens when curiosity replaces assumptions…” (fully covered by the Showreel) and an off-canvas About heading “The Best Products Begin With Partners Who Challenge Convention.”
26. The homepage hero heading’s fade is approximated with a white gradient overlay.

27. Careers (revision 2): Figma was updated — the white→dark fade between Openings and the footer is gone; Openings ends with 130px padding and a hard edge into the footer.

## 3. Copy issues (left exactly as in Figma)

1. **Works featured card** — description “Reimagining how 40M+ viewers discover content through behaviour-aware Al.” describes a streaming product, not Bengaluru International Airport; “Al” is a lowercase L, not “AI”.
2. **Works grid duplicates** — “Nothing”, “Quickplay” and “Stream Discovery” appear twice; “Work AI for All”, “Vault” and “Generative TV” reuse the imagery of Mom Verse, MyAdhaar and Juice AI; the “Nothing” card shows Amazon Now screens.
3. **“28 projects”** — only 13 projects are shown.
4. **Naming inconsistencies** — “myAadhaar” (Home) vs “MyAdhaar” (Works); “Apollo Momverse” (Home) vs “Mom Verse” (Works); nav label “Work” vs URL/page “Works”.
5. **Testimonial** — “dramatically-ultimately” uses a hyphen where a dash is intended.
6. **Learning card** — “enterpreneurs” (typo); “from R listed companies” is unclear; all three cards are dated “05 Sept 2025”.
7. **About stats** — “What began as A brother sister duo…” (capital “A”, “brother-sister”).
8. **About** — “following The Process… when to challenge It.” (capitalised “The”, “It”).
9. **Team** — two people named “Sukhada ” (trailing space, no surname) with different roles (Sr. Visual Designer, Sr. Product Designer).
10. **FAQ** — the only answer is written in first person (“I can help shape the direction”), unlike the studio voice elsewhere; four questions have no answers.
11. **Contact form** — “Contact ” label has a trailing space and no asterisk; placeholder “XXXXX XXXXX”.
12. **Philosophy line** — “behaviours ✖ , To tell a new story” has a space before the comma.
13. **Careers** — “02 / 03” step indicator but only principle 02 is designed.
14. **Client logo strip** layer names include Grubhub, and JLL and Aditya Birla twice — confirm the client list.

## 4. Newly written text (needs your review)

### Meta titles & descriptions

| Page | Title | Description |
| --- | --- | --- |
| / | HumanX — CX Design and Tech Studio \| Unmistakably Human | HumanX is a CX Design and Tech studio that shapes digital experiences with a human edge. We partner with global CXOs who seek to build future ready experiences. |
| /about | About HumanX — We Partner With Ambitious Brands | We partner with ambitious brands and challenge convention. Meet the HumanX team, the principles behind every decision we make, and what we bring to the table. |
| /works | Work — HumanX Projects and Case Studies | Work that starts with people: Bengaluru International Airport, Mom Verse, Juice AI, MyAdhaar, Quickplay, Stream Discovery and more from the HumanX studio. |
| /careers | Careers at HumanX — Open Design Roles in Mumbai | Research the problem, try it with AI, prototype it, write the code, ship it. Explore open design roles at HumanX in Mumbai, from Product Design Intern to Design Lead. |
| /contact | Contact HumanX — Start a Project | Every great idea needs a co-conspirator. Tell us what brings you here, visit the HumanX studio in Goregaon East, Mumbai, or write to hello@humanx.io. |
| 404 | Page not found \| HumanX | (noindex) |

### Other new strings (functional only, not visible design copy unless noted)
- **Form messages** (visible): “This field is required.”, “Enter a valid email address.”, “Choose a budget range.”, “Sending…”, “Thank you — your message has been sent.”, “Something went wrong. Please try again or email hello@humanx.io.” — Figma has no error/success states.
- **404 page** (visible): “404”, “Page not found” + nav links.
- **Screen-reader labels**: “Skip to content”, “Open menu”, “Close menu”, “(selected)”, “(opens Google Maps in a new tab)”, carousel/team scroll-region labels, “Ask {Gemini|Claude|ChatGPT} for a summary of HumanX”.
- **Alt text** for every meaningful image (in `src/content/*.ts` and page files) — please check the descriptions of people and products.
- **JobPosting description** is composed only from table cells (“Senior UI Designer — Senior — Mumbai”). Google requires `datePosted`, a real `description` and ideally `employmentType`/`validThrough` for job rich results — provide these to enable them.

## 5. Mobile / tablet assumptions (no frames in Figma)

- **Type** scales fluidly with `clamp()`; the Figma size is the max at 1920. Layout is capped at 1920 px and centred on 2560.
- **Header**: nav collapses to a full-screen dark drawer below 1024 px; “Start a Project” stays visible from 600 px.
- **Home**: hero crop keeps the faces centred; heading and intro stack; logo marquee keeps the edge fades; case cards stack label → title/description → thumbnail; testimonial logos become a 2/3/6-column grid; learning cards 1/2/3 columns.
- **About**: carousel slides become 4:5 portrait under 600 px; stats and showreel stack; principles staircase becomes a vertical list with the dashed rule and bar per step; team row scrolls horizontally.
- **Works**: filter chips become a single swipeable row (prevents reflow/CLS); featured card goes portrait with a gradient for legibility; grid 1 → 2 columns at 768.
- **Careers**: “Edges.” keeps the white-canvas overlap with blend mode at all sizes; brief + CTAs move below the headline; mutation columns stack (helix hidden under 768, centred on tablet); openings table becomes stacked rows with inline “Level:”/“Location:” labels.
- **Contact**: heading, blob, email, then the form; budget chips wrap; map keeps its aspect with the location card below it under 1024.
- **Footer**: single column; wordmark in flow above socials; nav wraps.
- Tap targets ≥ 44 px (chips use an extended hit area), `100dvh` for the drawer, safe-area insets on header/footer/drawer.
