import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FilterChips } from "@/components/FilterChips";
import { WorksMotion } from "@/components/WorksMotion";
import { ArrowLink } from "@/components/ui";
import { WORKS, parseMeta } from "@/content/works";
import { WORK_LAYERS, type WorkCardLayers } from "@/content/workLayers";
import { ORG_ID, absoluteUrl, breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("works");

/* Featured card layers, placed as in Figma 5740:95311 (1848×780): % of the card's box.
   The phone export carries its 36px drop shadow on every side, so its box starts 36px up/left. */
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
const LAYER_BOX = {
  plane: { left: pct(389, 1848), top: pct(63, 780), width: pct(1459, 1848) },
  phone: { left: pct(1173.5 - 36, 1848), top: pct(102 - 36, 780), width: pct(525.5, 1848) },
  flight: { left: pct(967, 1848), top: pct(390, 780), width: pct(388.2, 1848) },
  care: { left: pct(1467, 1848), top: pct(226, 780), width: pct(320.5, 1848) },
};

/* A project thumbnail as its Figma layers: d = depth (0 = background; higher = nearer, moves more).
   WorksMotion drives the outer .wk-l (build-in, scroll parallax, pointer drift); the inner .wk-f carries
   a slow CSS float on the nearest layers. The "Coming Soon" pill is live glass, as on the featured card. */
/* hover border glow, tinted to each thumbnail's own background (light → its accent) */
const GLOW: Record<string, string> = {
  aadhaar: "255, 186, 140", momverse: "240, 214, 190", "amazon-now": "120, 225, 255", "juice-ai": "255, 226, 110",
  quickplay: "255, 140, 80", "sbi-life": "196, 166, 255", aokah: "120, 196, 255", hurun: "226, 178, 98",
  ask: "222, 176, 90", minitv: "255, 96, 186", setu: "250, 182, 150", godrej: "245, 170, 80",
};

/* a thumbnail's layers, placed in % of its 912×640 box; `sizes` scales with the box's share of the screen */
function Layers({ layers, scale = 1, still = false }: { layers: WorkCardLayers; scale?: number; still?: boolean }) {
  const base = layers.layers.filter((l) => l.d === 0);
  const rest = layers.layers.filter((l) => l.d > 0);
  const layer = (l: WorkCardLayers["layers"][number], i: number) => (
    <div
      key={l.src}
      className={still ? "absolute" : "wk-l absolute"}
      data-d={still ? undefined : l.d}
      style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`, ["--fd" as string]: `${(i * 0.9).toFixed(1)}s` }}
    >
      <div className="relative h-full w-full">
        <Image
          src={l.src}
          alt=""
          fill
          sizes={`(min-width: 1920px) ${Math.round(9.12 * l.w * scale)}px, (min-width: 768px) ${(0.48 * l.w * scale).toFixed(1)}vw, ${(0.92 * l.w * scale).toFixed(1)}vw`}
          className="object-fill"
        />
      </div>
    </div>
  );
  return (
    <>
      {base.map(layer)}
      {layers.overlay && <div aria-hidden="true" className="absolute inset-0" style={{ background: layers.overlay }} />}
      {rest.map((l, i) => layer(l, i + 1))}
    </>
  );
}

function WorkThumb({ layers, alt, badge, glow, flush = false, scale = 1 }: { layers: WorkCardLayers; alt: string; badge: string | null; glow: string; flush?: boolean; scale?: number }) {
  return (
    <div
      role="img"
      aria-label={alt}
      /* flush: square-cornered, to sit edge to edge inside a highlighted card */
      className={`wk-media relative aspect-[912/640] overflow-hidden bg-night-2 [container-type:inline-size] ${flush ? "" : "rounded-panel"}`}
      style={{ ...(layers.bg ? { background: layers.bg } : {}), ["--glow" as string]: glow }}
    >
      <div className="wk-zoom absolute inset-0">
        <Layers layers={layers} scale={scale} />
      </div>
      {badge && (
        <span aria-hidden="true" className="wk-badge">
          {badge}
        </span>
      )}
    </div>
  );
}

/* Each highlighted card's ground, in its thumbnail's own palette: a colour field, a very faint pattern
   echoing the artwork (Aokah's dots, Juice's interface grid, Setu's progress rings, ASK's light
   streaks, Hurun's line art, miniTV's glow rings), and light or dark text to suit. */
/* blend — how the thumbnail joins its field:
     haze:   a heavily blurred copy of it spills left beneath it (Momverse, Aokah, Setu, Juice)
     extend: its left edge stretched across the card (ASK: the bridge runs on behind the text)
     fade:   nothing of it is copied; it simply fades into a field matched to its edge (miniTV, Hurun)
   fw — how much of the thumbnail's width its left-edge fade takes (Setu: short, so its logo stays whole;
   Hurun: short, so its laptop screen keeps its edge instead of dissolving); po — the pattern's strength */
type Spot = { field: string; ink: "dark" | "light"; pattern: "dots" | "grid" | "arcs" | "lines"; tint: string; blend: "haze" | "extend" | "fade"; fw?: number; po?: number };
const SPOT: Record<string, Spot> = {
  momverse: { field: "linear-gradient(118deg, #f5f2ef 0%, #e9e3dd 52%, #d3cbc4 100%)", ink: "dark", pattern: "dots", tint: "120, 96, 84", blend: "haze" },
  aokah: { field: "linear-gradient(122deg, #0b1f4a 0%, #173f8e 52%, #3375d6 100%)", ink: "dark", pattern: "dots", tint: "20, 52, 120", blend: "haze" },
  setu: { field: "linear-gradient(118deg, #f7f1eb 0%, #eee2d8 52%, #e2d1c4 100%)", ink: "dark", pattern: "arcs", tint: "196, 112, 80", blend: "haze", fw: 14 },
  "juice-ai": { field: "linear-gradient(118deg, #fffbe2 0%, #fff2ab 50%, #ffe38f 100%)", ink: "dark", pattern: "grid", tint: "150, 116, 20", blend: "haze" },
  ask: { field: "linear-gradient(122deg, #06070d 0%, #0d1229 55%, #1a2350 100%)", ink: "light", pattern: "lines", tint: "214, 178, 112", blend: "extend", fw: 34 },
  minitv: { field: "linear-gradient(122deg, #12060f 0%, #2a0c24 45%, #4a1440 100%)", ink: "light", pattern: "arcs", tint: "255, 110, 196", blend: "fade", fw: 46, po: 0.5 },
  hurun: { field: "linear-gradient(122deg, #0c0606 0%, #1a0a0b 50%, #3a0e11 100%)", ink: "light", pattern: "grid", tint: "226, 178, 98", blend: "fade", fw: 13 },
};
const SPOT_DEFAULT: Spot = { field: "linear-gradient(122deg, #111 0%, #1c1c1c 100%)", ink: "light", pattern: "dots", tint: "255, 255, 255", blend: "fade" };
/* patterns: noticeable on a second look, never competing with the text (mask keeps them top-left) */
const pattern = (s: Spot) =>
  ({
    dots: { backgroundImage: `radial-gradient(rgba(${s.tint}, 0.3) 1.2px, transparent 1.7px)`, backgroundSize: "22px 22px" },
    grid: {
      backgroundImage: `linear-gradient(rgba(${s.tint}, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(${s.tint}, 0.14) 1px, transparent 1px)`,
      backgroundSize: "56px 56px",
    },
    arcs: { backgroundImage: `repeating-radial-gradient(circle at 0% 0%, rgba(${s.tint}, 0.17) 0 1px, transparent 1px 36px)` },
    lines: { backgroundImage: `repeating-linear-gradient(112deg, rgba(${s.tint}, 0.13) 0 1px, transparent 1px 28px)` },
  })[s.pattern];

/* A category's highlighted project when it isn't BIAL, built like the BIAL card — eyebrow, title, a
   two-line description and Read More (Coming Soon projects: the glass pill in its place) — and made
   one piece with its thumbnail: the colour field and pattern fill the card, a heavily blurred copy of
   the thumbnail spills left beneath it, and the thumbnail (untouched) sits flush right at full height,
   its left edge fading out along an eased curve. Hidden until its filter is chosen. */
function SpotCard({ p, cats, glow }: { p: (typeof WORKS.projects)[number]; cats: string[]; glow: string }) {
  const soon = p.soon !== false;
  const L = WORK_LAYERS[p.key];
  const s = SPOT[p.key] ?? SPOT_DEFAULT;
  const dark = s.ink === "dark";
  /* no pill on the thumbnail here: the Coming Soon pill sits under the description instead */
  const thumb = <WorkThumb layers={L} alt={p.alt} badge={null} glow={glow} flush scale={1.25} />;
  return (
    <section data-tags={cats.join("|")} hidden aria-label={p.name} className="container-page mt-[clamp(32px,2.969vw,57px)]">
      {/* wk-item: the grid's hover (none for Coming Soon); data-spot: no unmask build (WorksMotion) */}
      <div className="wk-item" data-spot="" data-soon={soon ? "" : undefined}>
        <article
          className={`spot-card relative isolate overflow-hidden rounded-feature md:aspect-[1848/780] md:[container-type:size] ${dark ? "text-ink" : "text-white"}`}
          style={{ background: s.field, boxShadow: `inset 14px 11px 84px rgba(244, 244, 244, ${dark ? 0.18 : 0.07})` }}
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            {s.blend === "haze" && (
              /* the thumbnail's own colours, blurred and spilling left beneath it */
              <div className="spot-haze absolute aspect-[912/640]" style={{ background: L.bg ?? undefined }}>
                <Layers layers={L} scale={0.3} still />
              </div>
            )}
            {s.blend === "extend" && (
              <>
                {/* its left edge, stretched across the card and softened; a dark wash keeps the text clear */}
                <div className="spot-ext absolute aspect-[912/640]" style={{ background: L.bg ?? undefined }}>
                  <Layers layers={L} scale={0.4} still />
                </div>
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,8,14,0.7) 0%, rgba(8,8,14,0.45) 34%, rgba(8,8,14,0) 60%)" }} />
              </>
            )}
            {/* the pattern, in the empty top-left and fading away toward the text and the picture */}
            <div className="spot-pattern absolute inset-0" style={{ ...pattern(s), opacity: s.po ?? 1 }} />
          </div>
          <div
            className="spot-thumb relative md:absolute md:inset-y-0 md:right-0 md:aspect-[912/640] md:h-full"
            style={s.fw ? ({ ["--fw" as string]: `${s.fw}%` } as CSSProperties) : undefined}
          >
            {p.href ? (
              <Link href={p.href} tabIndex={-1} aria-hidden="true" className="block cursor-pointer">
                {thumb}
              </Link>
            ) : (
              thumb
            )}
          </div>
          {/* text: the BIAL card's block — 35px in from the left, 72px up from the bottom (at 1848) */}
          <div className="relative flex flex-col gap-[clamp(16px,1.667vw,32px)] p-5 md:absolute md:bottom-[9.231%] md:left-[3.842%] md:w-[40%] md:p-0">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase leading-[1.2] tracking-[-0.015em]">{cats[0]}</p>
              <h2 className="text-h3-md font-medium leading-[1.2]">
                {p.name}
                {soon && <span className="sr-only"> ({WORKS.badge.toLowerCase()})</span>}
              </h2>
              {p.description && (
                <p className={`max-w-[34em] md:line-clamp-2 font-mono text-base leading-[1.4] tracking-[-0.02em] ${dark ? "text-ink/85" : "text-[#fafaf8]"}`}>{p.description}</p>
              )}
            </div>
            {p.href ? (
              <ArrowLink href={p.href} srSuffix={`: ${p.name}`} className="self-start after:absolute after:inset-0 after:content-['']">
                {WORKS.featured.cta}
              </ArrowLink>
            ) : (
              /* not out yet: the glass Coming Soon pill where Read More would be */
              <span aria-hidden="true" className="wk-badge spot-pill self-start">
                {WORKS.badge}
              </span>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default function WorksPage() {
  const { featured } = WORKS;
  const projects = WORKS.projects.map((p) => ({ ...p, ...parseMeta(p.meta) }));

  /* Filters: All shows BIAL on top and every project below it. A category with an odd number of
     projects highlights one on top (the same treatment) and lists the rest in the two-column grid;
     an even number goes straight into the grid. The one on top is BIAL when it's in the category,
     else the first with a project page (Coming Soon ones after), in grid order. Every card lists the
     filters it shows under (data-tags; FilterChips). */
  const CATS = WORKS.filters.slice(1);
  type P = (typeof projects)[number];
  const pageFirst = (a: P, b: P) => Number(a.soon !== false) - Number(b.soon !== false);
  const spotlight: Record<string, string> = {};
  for (const c of CATS) {
    const members = [...(featured.cats.includes(c) ? ["bial"] : []), ...projects.filter((p) => p.cats.includes(c)).sort(pageFirst).map((p) => p.key)];
    if (members.length % 2 === 1) spotlight[c] = members[0];
  }
  /* (BIAL has no grid card, so it must be highlighted wherever it appears: its categories are odd) */
  const bialTags = ["All", ...CATS.filter((c) => spotlight[c] === "bial")];
  const gridTags = (p: P) => ["All", ...p.cats.filter((c) => spotlight[c] !== p.key)];
  const spots = projects.map((p) => ({ p, cats: CATS.filter((c) => spotlight[c] === p.key) })).filter((s) => s.cats.length);
  const available = CATS.filter((c) => featured.cats.includes(c) || projects.some((p) => p.cats.includes(c)));

  // ItemList — unique projects as named in the design.
  const unique = [
    { name: featured.title, description: featured.description, image: featured.layers.phone.src },
    ...projects.filter((p, i) => projects.findIndex((q) => q.name === p.name) === i),
  ];
  const itemList = {
    "@type": "ItemList",
    numberOfItems: unique.length,
    itemListElement: unique.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.name,
        image: absoluteUrl(p.image),
        creator: { "@id": ORG_ID },
        ...("description" in p && p.description ? { description: p.description } : {}),
        ...("tags" in p ? { keywords: (p.tags as string[]).join(", "), dateCreated: p.year } : {}),
      },
    })),
  };

  return (
    <div className="bg-night text-white">
      <Header current="/works" theme="dark" />
      <main id="main">
        {/* ---------- Intro (5740:94338): title 70/115% −2%, intro 18/26 right-aligned ---------- */}
        <section aria-labelledby="works-title" className="container-page pt-[clamp(24px,2.7vw,52px)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <h1 id="works-title" data-seq="wk-title" className="max-w-[7.7em] text-h2 font-normal capitalize leading-[1.15] tracking-[-0.02em]">
              {WORKS.title}
            </h1>
            <p data-seq="wk-intro" className="max-w-[616px] text-base leading-[1.4444] text-white lg:text-right">
              {WORKS.intro}
            </p>
          </div>

          {/* Filters (5740:94341, 81px under the title); the project count was removed on feedback */}
          <div className="mt-[clamp(32px,4.219vw,81px)] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* -my-1 cancels the chip row's 4px tap padding so the pills sit exactly 81px under the title */}
            <div data-seq="wk-filters" className="-my-1 min-w-0">
              <FilterChips filters={WORKS.filters} available={available} targetId="work-list" variant="dark" label="Filter projects" />
            </div>
          </div>
        </section>

        {/* everything the filter shows and hides */}
        <div id="work-list">
        {/* ---------- Featured (5740:95311, 57px under the filters): built from its layers ---------- */}
        <section aria-labelledby="featured-title" data-tags={bialTags.join("|")} className="container-page mt-[clamp(32px,2.969vw,57px)]">
          <article
            data-seq="wk-feat"
            className="wk-feat relative isolate overflow-hidden rounded-feature md:aspect-[1848/780]"
            style={{
              /* Rectangle 1000004716: linear #1F1236 → #59339C (from its gradient transform), inner shadow 14/11 blur 84 #F4F4F4 @25% */
              background: "linear-gradient(123deg, #1f1236 6%, #59339c 111%)",
              boxShadow: "inset 14px 11px 84px rgba(244, 244, 244, 0.25)",
            }}
          >
            <div role="img" aria-label={featured.alt} className="wk-feat-visual relative aspect-[1848/780] md:absolute md:inset-0 md:aspect-auto">
              {(["plane", "phone", "flight", "care"] as const).map((k) => (
                <div key={k} data-layer={k} className="absolute" style={LAYER_BOX[k]}>
                  <Image
                    src={featured.layers[k].src}
                    alt=""
                    width={featured.layers[k].w}
                    height={featured.layers[k].h}
                    priority={k === "plane" || k === "phone"}
                    sizes={k === "plane" ? "(min-width: 1920px) 1459px, 76vw" : "(min-width: 1920px) 526px, 28vw"}
                    className="wk-layer h-auto w-full"
                  />
                </div>
              ))}
              {/* (the featured card's "Coming Soon" pill was removed in Figma) */}
            </div>
            {/* text block 5740:95371: 35px in from the left, 72px up from the bottom, 858 wide */}
            <div data-feat="text" className="relative flex flex-col gap-[clamp(16px,1.667vw,32px)] p-5 md:absolute md:bottom-[9.231%] md:left-[3.842%] md:w-[46.43%] md:p-0">
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs uppercase leading-[1.2] tracking-[-0.015em] text-white">{featured.label}</p>
                {/* Figma breaks the title after "Bengaluru" */}
                <h2 id="featured-title" className="text-h3-md font-medium leading-[1.2]">
                  {featured.title.split(" ")[0]}
                  <br />
                  {featured.title.split(" ").slice(1).join(" ")}
                </h2>
                <p className="font-mono text-base leading-[1.4] tracking-[-0.02em] text-[#fafaf8]">{featured.description}</p>
              </div>
              {/* opens the project page; the link's ::after covers the whole card, so the card is clickable */}
              <ArrowLink href={featured.href} srSuffix={`: ${featured.title}`} className="self-start after:absolute after:inset-0 after:content-['']">
                {featured.cta}
              </ArrowLink>
            </div>
          </article>
        </section>

        {/* a category's highlighted project, when it isn't BIAL */}
        {spots.map(({ p, cats }) => (
          <SpotCard key={p.key} p={p} cats={cats} glow={GLOW[p.key] ?? "255, 255, 255"} />
        ))}

        {/* ---------- All work grid: label 30px under the featured card, grid 42px under the label ---------- */}
        <section aria-labelledby="all-work-title" className="container-page pb-[clamp(80px,9.115vw,175px)] pt-[clamp(20px,1.5625vw,30px)]">
          {/* the visible "All Work" label was removed on feedback; kept for screen readers as the list's heading */}
          <h2 id="all-work-title" className="sr-only">
            {WORKS.allWork}
          </h2>
          <ul id="all-work" className="mt-[clamp(24px,2.1875vw,42px)] grid gap-x-6 gap-y-[clamp(40px,4.167vw,80px)] md:grid-cols-2">
            {projects.map((p, i) => {
              const href = (p as { href?: string }).href;
              const soon = (p as { soon?: boolean }).soon !== false;
              const thumb = (
                <WorkThumb
                  layers={WORK_LAYERS[p.key]}
                  alt={p.alt}
                  badge={soon ? WORKS.badge : null}
                  glow={GLOW[p.key] ?? "255, 255, 255"}
                />
              );
              return (
              /* data-soon: "Coming Soon" — not clickable, so no hover (WorksMotion) */
              <li key={`${p.name}-${i}`} data-tags={gridTags(p).join("|")} hidden={!gridTags(p).includes("All")} data-soon={soon ? "" : undefined} className="wk-item">
                <article>
                  {/* thumbnail 912×640, r16 — built from its Figma layers so each can float on its own.
                      With a project page, the thumbnail and the name both open it (the name is the
                      link screen readers and keyboards use). */}
                  {href ? (
                    <Link href={href} tabIndex={-1} aria-hidden="true" className="block cursor-pointer">
                      {thumb}
                    </Link>
                  ) : (
                    thumb
                  )}

                  {/* name Hanken Grotesk Medium 28, tags Chivo Mono 15 #9E9E9E — 20px under the thumbnail */}
                  <div className="wk-cap mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    {/* the name rests a soft grey and turns white with the card's hover (.wk-name, globals.css) */}
                    <h3 className="wk-name font-hanken text-xl font-medium leading-[1.286]">
                      {href ? (
                        <Link href={href} className="-my-2 inline-block py-2">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                      {soon && <span className="sr-only"> ({WORKS.badge.toLowerCase()})</span>}
                    </h3>
                    {/* its category (the filter it's under); the design's old tags only if it has none yet */}
                    <p className="whitespace-pre font-mono text-[15px] text-gray-2">{(p.cats.length ? p.cats : p.tags).join(" · ")}</p>
                  </div>
                </article>
              </li>
              );
            })}
          </ul>
          {/* shown by the filter when a category has no projects yet (not in Figma: the design shows "All" only) */}
          <p id="work-list-empty" hidden className="py-[clamp(48px,6vw,120px)] font-mono text-sm text-gray-2">
            New work in this category is on its way.
          </p>
        </section>
        </div>
      </main>
      <Footer />
      <WorksMotion />
      <JsonLd data={[webPageSchema("works", "CollectionPage", { mainEntity: itemList }), breadcrumbSchema("works", "Work")]} />
    </div>
  );
}
