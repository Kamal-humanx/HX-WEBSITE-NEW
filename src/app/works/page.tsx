import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FilterChips } from "@/components/FilterChips";
import { WorksMotion } from "@/components/WorksMotion";
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

function WorkThumb({ layers, alt, badge, glow }: { layers: WorkCardLayers; alt: string; badge: string; glow: string }) {
  const base = layers.layers.filter((l) => l.d === 0);
  const rest = layers.layers.filter((l) => l.d > 0);
  const layer = (l: WorkCardLayers["layers"][number], i: number) => (
    <div
      key={l.src}
      className="wk-l absolute"
      data-d={l.d}
      style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`, ["--fd" as string]: `${(i * 0.9).toFixed(1)}s` }}
    >
      <div className={`relative h-full w-full ${l.d >= 1.8 ? "wk-f" : ""}`}>
        <Image src={l.src} alt="" fill sizes={`(min-width: 1920px) ${Math.round(9.12 * l.w)}px, (min-width: 768px) ${(0.48 * l.w).toFixed(1)}vw, ${(0.92 * l.w).toFixed(1)}vw`} className="object-fill" />
      </div>
    </div>
  );
  return (
    <div
      role="img"
      aria-label={alt}
      className="wk-media relative aspect-[912/640] overflow-hidden rounded-panel bg-night-2"
      style={{ ...(layers.bg ? { background: layers.bg } : {}), ["--glow" as string]: glow }}
    >
      <div className="wk-zoom absolute inset-0">
        {base.map(layer)}
        {layers.overlay && <div aria-hidden="true" className="absolute inset-0" style={{ background: layers.overlay }} />}
        {rest.map((l, i) => layer(l, i + 1))}
      </div>
      <span aria-hidden="true" className="wk-badge absolute left-[6.25%] top-[7.34%] z-[1]">
        {badge}
      </span>
    </div>
  );
}

export default function WorksPage() {
  const { featured } = WORKS;
  const projects = WORKS.projects.map((p) => ({ ...p, ...parseMeta(p.meta) }));
  const available = Array.from(new Set(projects.flatMap((p) => p.tags)));

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

          {/* Filters (5740:94341, 81px under the title) + count */}
          <div className="mt-[clamp(32px,4.219vw,81px)] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* -my-1 cancels the chip row's 4px tap padding so the pills sit exactly 81px under the title */}
            <div data-seq="wk-filters" className="-my-1 min-w-0">
              <FilterChips filters={WORKS.filters} available={available} targetId="all-work" variant="dark" label="Filter projects" />
            </div>
            <p data-seq="wk-count" className="font-mono text-sm text-gray-2">
              {WORKS.count}
            </p>
          </div>
        </section>

        {/* ---------- Featured (5740:95311, 57px under the filters): built from its layers ---------- */}
        <section aria-labelledby="featured-title" className="container-page mt-[clamp(32px,2.969vw,57px)]">
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
              <span data-feat="badge" className="wk-badge absolute left-[3.842%] top-[8.077%]">
                {WORKS.badge}
              </span>
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
              <p className="inline-flex items-center gap-1.5 text-base font-bold leading-[1.5] tracking-[-0.02em] text-accent">
                {featured.cta}
                <Image src="/images/icons/arrow-orange.svg" alt="" width={9} height={9} />
              </p>
            </div>
          </article>
        </section>

        {/* ---------- All work grid: label 30px under the featured card, grid 42px under the label ---------- */}
        <section aria-labelledby="all-work-title" className="container-page pb-[clamp(80px,9.115vw,175px)] pt-[clamp(20px,1.5625vw,30px)]">
          <h2 id="all-work-title" data-wk="allwork" className="font-mono text-[15px] font-normal leading-[1.2]">
            {WORKS.allWork}
          </h2>
          <ul id="all-work" className="mt-[clamp(24px,2.1875vw,42px)] grid gap-x-6 gap-y-[clamp(40px,4.167vw,80px)] md:grid-cols-2">
            {projects.map((p, i) => (
              <li key={`${p.name}-${i}`} data-tags={p.tags.join("|")} className="wk-item">
                <article>
                  {/* thumbnail 912×640, r16 — built from its Figma layers so each can float on its own */}
                  <WorkThumb layers={WORK_LAYERS[p.key]} alt={p.alt} badge={WORKS.badge} glow={GLOW[p.key] ?? "255, 255, 255"} />

                  {/* name Hanken Grotesk Medium 28, tags Chivo Mono 15 #9E9E9E — 20px under the thumbnail */}
                  <div className="wk-cap mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h3 className="font-hanken text-xl font-medium leading-[1.286]">
                      {p.name}
                      <span className="sr-only"> ({WORKS.badge.toLowerCase()})</span>
                    </h3>
                    <p className="whitespace-pre font-mono text-[15px] text-gray-2">{p.meta}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {/* shown by the filter when a category has no projects yet (not in Figma: the design shows "All" only) */}
          <p id="all-work-empty" hidden className="py-[clamp(48px,6vw,120px)] font-mono text-sm text-gray-2">
            New work in this category is on its way.
          </p>
        </section>
      </main>
      <Footer />
      <WorksMotion />
      <JsonLd data={[webPageSchema("works", "CollectionPage", { mainEntity: itemList }), breadcrumbSchema("works", "Work")]} />
    </div>
  );
}
