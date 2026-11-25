# HumanX — marketing website

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4, built from the Figma file
**“HumanX - Website 2026 - INT” → 🚀 For Development** (Homepage, About, Works, Careers, Contact).
Every page is statically generated (SSG); all copy is in the initial HTML.

## Setup & run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (all pages prerendered)
npm run start        # serve the production build
npm run lint         # ESLint (next/core-web-vitals + TypeScript)
npx tsc --noEmit     # type-check
```

Node 20+ is required.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (default `https://humanx.io`). Used for canonical URLs, Open Graph, JSON-LD, sitemap, robots, llms.txt. |
| `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Footer social links. Figma names them but gives no URLs, so until set they render as plain text and are omitted from `Organization.sameAs`. |

## Deploy

Any Node host that runs Next.js works; Vercel needs no config. The site is static except
`POST /api/contact` (a serverless route). If you want a fully static export instead, move the
form handler to a third-party endpoint first (`output: "export"` cannot host API routes).

Before launch:
1. Set `NEXT_PUBLIC_SITE_URL` and the social URLs.
2. Set the contact-form and admin variables listed in `.env.example` (see “Contact form, spam protection and admin” below).
3. Review the copy/meta items in [REPORT.md](REPORT.md).

## Contact form, spam protection and admin

`POST /api/contact` runs these layers in order (`src/app/api/contact/route.ts`):

1. Same-origin check and a 20 kB body cap.
2. Rate limit — 30 requests and 5 accepted submissions per visitor per hour.
3. Honeypot field (`website`) — filled means a fake success and nothing is kept.
4. Time check — a signed token from `GET /api/contact/token`; rejected if under 3 s old, missing, forged or reused.
5. Cloudflare Turnstile, invisible (skipped when the keys are not set).
6. Field validation (`src/lib/contact-rules.ts`, shared with the form).
7. Content filter (`src/lib/server/spam.ts`) — `clean`, `flagged` or `spam`.

Clean inquiries are stored and emailed to `NOTIFY_EMAILS` — through the studio's own Google Workspace
mailbox over SMTP when `SMTP_USER` / `SMTP_PASSWORD` are set, otherwise through Brevo (`src/lib/server/notify.ts`). Flagged and spam inquiries are
stored only; clearing one in the admin panel sends the email then.

`/admin` (username + password from env, 12-hour signed session cookie, 5 sign-in attempts per 15 minutes)
lists every inquiry with the form's own field labels, split into Inquiries / Needs review / Spam.

Storage: Upstash Redis over REST (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). Without it, local dev writes
to `.data/inquiries.json`; on Vercel nothing can be stored and rate limits are per-instance only.

The public email address is rendered by `ObfuscatedEmail` and never appears as plain text or a `mailto:`
in the served HTML, JSON-LD, meta description or `llms.txt`.

## Project structure

```
src/
  app/
    layout.tsx            root layout: fonts, skip link, Organization + WebSite JSON-LD, icons
    page.tsx              /            Homepage
    about/page.tsx        /about
    works/page.tsx        /works
    careers/page.tsx      /careers
    contact/page.tsx      /contact
    not-found.tsx         custom 404
    api/contact/route.ts  form handler (spam layers, storage, Brevo notification)
    admin/                /admin       inquiries panel (sign-in required)
    robots.ts  sitemap.ts  manifest.ts  llms.txt/route.ts  favicon.ico
    globals.css           design tokens (@theme) + base/components layers
  components/             Header, MobileMenu, Footer, Logo, sections (Capabilities, Learning),
                          StudioCarousel, FilterChips, ContactForm, IstClock, ui (ArrowLink, PillLink,
                          DisplayHeading), JsonLd
  content/                FROZEN on-page copy, one file per page (+ shared.ts)
  lib/                    site constants, fonts, SEO (metadata + JSON-LD builders)
public/images/            optimized assets exported from Figma (WebP/SVG/PNG)
scripts/
  optimize-assets.mjs     .figma/raw → public/images (sharp; resizes + WebP)
  generate-icons.mjs      favicon set + Open Graph image from the brand mark
  qa-screens.mjs          full-page screenshots at 16 widths + horizontal-overflow check
  qa-compare.mjs          Figma vs build side-by-side at 1920
  qa-links-schema.mjs     JSON-LD sanity, h1/heading order, internal link check
```

`.figma/` (raw MCP exports + Figma page screenshots) and `.qa/` (QA output) are git-ignored working folders.

## Design tokens ↔ Figma

Tokens live in `src/app/globals.css` (`@theme`), so each becomes a Tailwind utility
(`bg-night`, `text-accent`, `text-h2`, …).

| Token | Value | Figma source |
| --- | --- | --- |
| `--color-ink` | `#323232` | headings on light (“Black”) |
| `--color-ink-soft` | `#424142` | philosophy statement |
| `--color-ink-mono` | `#3a3a3a` | Chivo Mono intro copy |
| `--color-ink-form` | `#171717` | form labels / chips |
| `--color-body` | `#5a5a5a` | case descriptions, table cells |
| `--color-night` / `-2` / `-3` | `#0e0e0e` / `#131313` / `#171717` | dark sections, team cards, active tab |
| `--color-night-line` | `#333333` | logo tab borders |
| `--color-gray` / `-2` | `#8b8b8b` / `#9e9e9e` | “Our capabilities”, works meta & chips |
| `--color-accent` | `#f36712` | orange (text on dark, large text) |
| `--color-accent-2` | `#f07412` | chip borders / highlights |
| `--color-apricot` | `#f7ad6b` | accent/Apricot |
| `--color-accent-ink` | `#b84a08` | **AA-adjusted** orange for small text on light (Figma `#f36712` = 3.1:1) |
| `--color-btn-from/-to` | `#c4500a → #b65a24` | **AA-adjusted** pill gradient (Figma `#ff821f → #eba772`) |
| `--font-sans` | Uncut Sans 300–700 | Uncut Sans (self-hosted via `@fontsource/uncut-sans`, `next/font/local`) |
| `--font-mono` | Chivo Mono 300–700 | Chivo Mono (`next/font/google`) |
| `--font-inter` / `--font-hanken` | Inter 500 / Hanken Grotesk 500 | About carousel quotes / Works card titles |
| `--text-display … --text-2xs` | `clamp(min, vw, max)` | 160/140/96/90/80/72/70/64/56/54/48/42/40/28/24/22/20/18/16/14/13 px — `max` equals the Figma size on the 1920 frame |
| `--radius-card/-panel/-feature/-slide` | 12 / 16 / 21 / 36 px | case cards / works cards / featured / studio slides |
| `--shadow-tab`, `--shadow-pill`, `--shadow-thumb` | — | logo tab, pill CTA, case thumbnail inner shadows |
| `--gutter` | `clamp(16px, 1.875vw, 36px)` | 36 px side margin on the 1920 frame |
| `--page-max` | `1920px` | frame width — ultra-wide screens centre the layout |

Breakpoints (mobile-first): `xs 375`, `sm 600`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1440`, `3xl 1920`.

## Accessibility & SEO notes

- One `<h1>` per page, no heading-level jumps; `header/nav/main/section/article/footer` landmarks; skip link.
- Mobile menu: `aria-expanded`/`aria-controls`, `role="dialog"`, focus trap, Esc closes, focus returns.
- Forms: visible labels, `aria-invalid` + `aria-describedby` errors, focus moves to the first error, live status region, works without JS (303 redirect).
- `prefers-reduced-motion` disables the logo marquee and transitions.
- JSON-LD: Organization + WebSite (all pages), WebPage/AboutPage/ContactPage/CollectionPage + BreadcrumbList,
  ItemList of CreativeWork (Works), JobPosting ×5 (Careers), FAQPage (only the one answered FAQ) + ProfessionalService (Contact).
- `robots.txt` allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Googlebot, Bingbot; `sitemap.xml`; `llms.txt` generated from the frozen copy.

## Careers page interactions

The Careers page runs the approved interactions reference (`humanx-careers-page`, see the handoff
`CAREERS-INTERACTIONS-HANDOFF.md`): canvas hero, pinned manifesto with three timed drawings, the
Mutant Gene builder with its 3D helix, and the Openings list washing into the footer.

- Components + logic: `src/components/careers/ref/` (ported as-is; the motion gate is `.hxc[data-motion]`
  instead of `html.js`, set by `CareersMotion` and an inline pre-paint script; reduced motion = static).
- Styles: `src/app/careers/careers-ref.css` is **generated** from the reference's `src/index.css` by
  `node scripts/scope-careers-css.mjs <path-to-reference>/src/index.css` — every selector is scoped to
  `.hxc` and keyframes are renamed `hxc-*`, so nothing reaches other pages. Small overrides live in
  `src/app/careers/careers.css`.
- Assets: `public/careers-ref/`.
- The header is the site-wide one; the footer is the site-wide one with `variant="careers"` (full-screen).
