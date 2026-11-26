import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { CaseReveal } from "@/components/CaseReveal";
import { ArrowLink } from "@/components/ui";
import { CASE_STUDIES, caseStudy, isVideo, type Block, type Img, type Media, type Testimonial, type Vid } from "@/content/caseStudies";
import { ORG_ID, TWITTER_HANDLE, absoluteUrl } from "@/lib/seo";

/* Project detail page, in the new site's language (header, footer, Uncut Sans + Chivo Mono), coloured
   by each case's own theme: every colour below reads a --c-* variable set from caseStudies.ts. */

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = caseStudy((await params).slug);
  if (!c) return {};
  const title = `${c.client} — ${c.title.replace(/\n/g, " ")} | HumanX`;
  const path = `/works/${c.slug}`;
  return {
    title: { absolute: title },
    description: c.metaDescription,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, siteName: "HumanX", locale: "en_IN", title, description: c.metaDescription, images: [{ url: c.hero.imgs[0].src }] },
    twitter: { card: "summary_large_image", site: TWITTER_HANDLE, creator: TWITTER_HANDLE, title, description: c.metaDescription, images: [c.hero.imgs[0].src] },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* colour utilities (theme variables) */
const FG = "text-[var(--c-fg)]";
const BODY = "text-[var(--c-body)]";
const INK = "text-[var(--c-ink)]";
const LINE = "border-[var(--c-line)]";

/** copy with the old pages' highlighted phrases (**…**) */
function rich(s: string): ReactNode {
  if (!s.includes("**")) return s;
  return s.split("**").map((part, i) =>
    i % 2 ? (
      <strong key={i} className={`font-medium ${INK}`}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

const svg = (src: string) => src.endsWith(".svg");

function Pic({ img, sizes, className = "", style }: { img: Img; sizes: string; className?: string; style?: CSSProperties }) {
  return (
    <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes={sizes} unoptimized={svg(img.src)} className={className} style={style} />
  );
}

function Video({ v, className = "", style }: { v: Vid; className?: string; style?: CSSProperties }) {
  /* played by CaseReveal while on screen (and never for reduced motion) */
  return (
    <video
      data-autoplay
      className={className}
      style={style}
      src={v.src}
      poster={v.poster}
      width={v.w}
      height={v.h}
      muted
      loop
      playsInline
      preload="none"
      aria-label={v.alt}
    />
  );
}

/* an image, optionally on a panel (diagrams and cut-outs); `light` = white ground even on dark pages */
function Figure({ img, sizes, className = "" }: { img: Img; sizes: string; className?: string }) {
  const ground = img.light ? "bg-white" : img.dark ? "bg-[var(--c-deep)]" : img.panel ? "bg-[var(--c-panel)]" : "";
  const padding = img.panel || img.light || img.dark ? "p-[clamp(16px,2.6vw,48px)]" : "";
  return (
    <figure data-rv="media" className={`overflow-hidden rounded-panel ${ground} ${padding} ${className}`}>
      <Pic img={img} sizes={sizes} className="h-auto w-full" />
    </figure>
  );
}

function MediaFig({ m, sizes, className = "", style }: { m: Media; sizes: string; className?: string; style?: CSSProperties }) {
  if (isVideo(m))
    return (
      <figure data-rv="media" className={`overflow-hidden rounded-[18px] bg-black/20 ${className}`} style={style}>
        <Video v={m} className="block h-auto w-full" />
      </figure>
    );
  return (
    <figure data-rv="media" className={`overflow-hidden rounded-[18px] ${m.light ? "bg-white p-4" : ""} ${className}`} style={style}>
      <Pic img={m} sizes={sizes} className="h-auto w-full" />
    </figure>
  );
}

/* "Principle in action: X" — as on the old pages */
function Principle({ name, className = "" }: { name: string; className?: string }) {
  return (
    <p className={`text-sm leading-[1.5] ${FG} ${className}`}>
      <strong className="font-semibold">Principle in action:</strong> <span className={INK}>{name}</span>
    </p>
  );
}

/* ---------------------------------------------------------------- annotated screens */

type Annot = Extract<Block, { type: "annotated" }>;

/** Labels beside a screen, each level with the spot it describes and joined to it by a marker line.
 *  Every label is placed in-flow (all share one grid cell, pushed down by their `at`), so the block
 *  grows to fit a label that runs past the image instead of overlapping what follows. */
function Annotated({ b }: { b: Annot }) {
  const small = b.dw <= 430;
  const imgw = small ? "clamp(300px,26vw,420px)" : `clamp(${Math.round(b.dw * 0.6)}px,${Math.min((b.dw * 0.93) / 15.12, 42).toFixed(2)}vw,${Math.round(b.dw * 1.05)}px)`;
  const ratio = b.img.h / b.img.w;
  const left = b.text === "left";
  const reach = Math.max(0, ...(b.overlays ?? []).map((o) => -o.x));
  const minAt = Math.min(0, ...b.items.map((n) => n.at));
  const vars = {
    "--imgw": imgw,
    "--imgh": `calc(var(--imgw) * ${ratio.toFixed(5)})`,
    "--gap": "20px",
    gridTemplateColumns: left ? "minmax(0,1fr) var(--imgw)" : "var(--imgw) minmax(0,1fr)",
    columnGap: "var(--gap)",
    paddingTop: minAt < 0 ? `calc(var(--imgh) * ${(-minAt / 100).toFixed(4)} + 1.2em)` : undefined,
  } as CSSProperties;
  /* labels must stop short of overlays that reach out of the screen into their column */
  const textMax = reach ? `min(26em, calc(100% + var(--gap) - var(--imgw) * ${(reach / 100).toFixed(4)} - 20px))` : "26em";

  return (
    <div>
      <div className={`hidden ${small ? "lg:grid" : "xl:grid"}`} style={vars}>
        <ul className="relative z-[2] grid self-start" style={{ gridColumn: left ? 1 : 2, gridRow: 1 }}>
          {b.items.map((n, i) => {
            const top = `calc(var(--imgh) * ${(n.at / 100).toFixed(4)})`;
            const line = n.line !== false;
            /* with `x`, the line runs on into the screen so the dot's centre lands on that spot */
            const reachIn = n.x == null ? "0px" : `calc(-1 * (var(--gap) + var(--imgw) * ${((left ? n.x : 100 - n.x) / 100).toFixed(4)} - 3.5px))`;
            const text = (
              <div className="min-w-0" style={{ maxWidth: textMax }}>
                {n.principle && <Principle name={n.principle} className="mt-2" />}
                {n.body && <p className={`mt-1.5 text-sm leading-[1.5] ${BODY}`}>{n.body}</p>}
              </div>
            );
            const title = (
              <h4 className="min-w-0 max-w-[19em] text-base font-medium uppercase leading-[1.3] tracking-[0.01em]" style={!line ? { maxWidth: textMax } : undefined}>
                {n.title}
              </h4>
            );
            /* the marker: a hairline ending in a dot on the screen side */
            const marker = (
              <span aria-hidden="true" className="relative flex h-[1.3em] min-w-6 flex-1 items-center" style={left ? { marginRight: reachIn } : { marginLeft: reachIn }}>
                <span className="h-px w-full bg-[var(--c-fg)] opacity-25" />
                <span className={`absolute top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[var(--c-accent)] ${left ? "right-0" : "left-0"}`} />
              </span>
            );
            return (
              <li key={i} data-rv className={`self-start text-base [grid-area:1/1] ${FG}`} style={{ marginTop: top }}>
                <div className="-mt-[0.65em]">
                  {left ? (
                    <>
                      <div className="flex items-start gap-4">
                        {title}
                        {line && marker}
                      </div>
                      {text}
                    </>
                  ) : (
                    <div className="flex items-start gap-4">
                      {line ? <span className="flex w-[clamp(40px,5vw,96px)] shrink-0">{marker}</span> : <span className="w-[clamp(40px,5vw,96px)] shrink-0" />}
                      <div className="min-w-0">
                        {title}
                        {text}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="relative self-start" style={{ gridColumn: left ? 2 : 1, gridRow: 1 }}>
          <Figure img={b.img} sizes={small ? "(min-width: 1920px) 420px, 26vw" : "(min-width: 1920px) 800px, 42vw"} />
          {b.overlays?.map((o) => (
            <div key={o.img.src} data-rv className="absolute z-[1]" style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%` }}>
              <Pic img={o.img} sizes="(min-width: 1920px) 420px, 26vw" className="h-auto w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.18)]" />
            </div>
          ))}
        </div>
      </div>

      {/* smaller screens: the notes, then the screen */}
      <div className={`flex flex-col gap-6 ${small ? "lg:hidden" : "xl:hidden"}`}>
        <ul className={`border-t ${LINE}`}>
          {b.items.map((n, i) => (
            <li key={i} data-rv className={`border-b ${LINE} py-4`}>
              <h4 className={`text-lg font-medium uppercase leading-[1.3] tracking-[0.01em] ${FG}`}>{n.title}</h4>
              {n.principle && <Principle name={n.principle} className="mt-2" />}
              {n.body && <p className={`mt-2 text-base leading-[1.6] ${BODY}`}>{n.body}</p>}
            </li>
          ))}
        </ul>
        <Figure img={b.img} sizes="80vw" className={`mx-auto ${small ? "w-[min(80vw,360px)]" : "w-full"}`} />
        {b.overlays
          ?.filter((o) => o.img.alt)
          .map((o) => (
            <Figure key={o.img.src} img={o.img} sizes="80vw" className="mx-auto w-[min(80vw,360px)]" />
          ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- blocks */

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "text":
      return (
        <div className={b.center ? "mx-auto max-w-[760px] text-center" : "max-w-[760px]"}>
          {b.heading && (
            <h3 data-rv className={`text-h3 font-normal capitalize leading-[1.15] tracking-[-0.02em] ${FG}`}>
              {b.heading}
            </h3>
          )}
          {b.kicker && (
            <p data-rv className={`text-xl font-medium leading-[1.3] tracking-[-0.02em] ${FG}`}>
              {b.kicker}
            </p>
          )}
          {b.body?.map((p, i) => (
            <p key={i} data-rv className={`text-base leading-[1.6] ${BODY} ${b.heading || b.kicker || i ? "mt-4" : ""}`}>
              {rich(p)}
            </p>
          ))}
        </div>
      );

    case "goals":
      return (
        <ol className={`border-t ${LINE}`}>
          {b.items.map((g, i) => {
            const title = typeof g === "string" ? g : g.title;
            return (
              <li key={title} data-rv className={`flex items-baseline gap-[clamp(16px,2vw,40px)] border-b ${LINE} py-[clamp(16px,1.6vw,28px)]`}>
                <span className={`font-mono text-sm ${INK}`}>{pad(i + 1)}</span>
                <div>
                  <span className={`block text-h3 font-normal leading-[1.15] tracking-[-0.02em] ${FG}`}>{title}</span>
                  {typeof g !== "string" && <p className={`mt-3 max-w-[40em] text-base leading-[1.6] ${BODY}`}>{g.body}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      );

    case "statement":
      return (
        <p data-rv className={`max-w-[30em] text-xl leading-[1.4] tracking-[-0.02em] ${FG}`}>
          {b.text}
        </p>
      );

    case "voices":
      return (
        <ul className="grid gap-4 md:grid-cols-3">
          {b.items.map((q, i) => (
            <li key={i} data-rv className="flex flex-col overflow-hidden rounded-feature bg-[var(--c-deep)]">
              <div className="relative aspect-square">
                <Image src={q.img.src} alt={q.img.alt} fill sizes="(min-width: 768px) 30vw, 92vw" className="object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/80" />
                {q.who && (
                  <span className="absolute left-4 top-4 rounded-pill bg-black/35 px-3 py-1 font-mono text-xs uppercase tracking-[0.04em] text-white backdrop-blur-sm">
                    {q.who}
                  </span>
                )}
                <blockquote className="absolute inset-x-0 bottom-0 p-[clamp(18px,1.8vw,30px)] text-lg font-medium leading-[1.35] tracking-[-0.01em] text-white">
                  {q.quote}
                </blockquote>
              </div>
              {q.note && (
                <div className="flex flex-col gap-2 px-[clamp(18px,1.8vw,30px)] py-4 text-white">
                  {b.noteIcon && <Pic img={b.noteIcon} sizes="80px" className="h-4 w-auto self-start" />}
                  <p className="text-lg font-medium leading-[1.3] tracking-[-0.01em]">{q.note}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      );

    case "image":
      return <Figure img={b.img} sizes={b.wide ? "(min-width: 1920px) 1300px, (min-width: 1024px) 68vw, 92vw" : "(min-width: 1024px) 50vw, 92vw"} />;

    case "video":
      return (
        <figure data-rv="media" className="overflow-hidden rounded-panel bg-[var(--c-deep)]">
          <Video v={b.video} className="block h-auto w-full" />
        </figure>
      );

    case "split":
      return (
        <div className="grid items-center gap-[clamp(24px,3vw,64px)] md:grid-cols-2">
          <Figure img={b.img} sizes="(min-width: 1024px) 34vw, (min-width: 768px) 46vw, 92vw" />
          <div>
            {b.body.map((p, i) => (
              <p key={i} data-rv className={`text-lg leading-[1.5] tracking-[-0.01em] ${FG}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      );

    case "annotated":
      return <Annotated b={b} />;

    case "features":
      return (
        <div className="grid items-start gap-[clamp(24px,3vw,64px)] md:grid-cols-[minmax(0,1fr)_clamp(220px,22vw,380px)]">
          <ul className={`border-t ${LINE}`}>
            {b.items.map((f) => (
              <li key={f.title} data-rv className={`border-b ${LINE} py-[clamp(16px,1.6vw,28px)]`}>
                <h4 className={`text-xl font-medium uppercase leading-[1.3] tracking-[-0.01em] ${FG}`}>{f.title}</h4>
                <p className={`mt-2 max-w-[34em] text-base leading-[1.6] ${BODY}`}>{f.body}</p>
              </li>
            ))}
          </ul>
          <Figure img={{ ...b.img, panel: true }} sizes="(min-width: 768px) 22vw, 80vw" className="md:sticky md:top-[calc(var(--header-h)+24px)]" />
        </div>
      );

    case "showcase":
      return (
        <div className="flex flex-col gap-[clamp(48px,5vw,96px)]">
          {b.items.map((it) => (
            <div key={it.title} className="grid items-center gap-[clamp(24px,3vw,64px)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <h4 data-rv className={`text-h3 font-normal capitalize leading-[1.15] tracking-[-0.02em] ${FG}`}>
                  {it.title}
                </h4>
                <p data-rv className={`mt-4 max-w-[30em] text-base leading-[1.6] ${BODY}`}>
                  {it.body}
                </p>
              </div>
              <div data-rv="media" className="flex items-start justify-center gap-[clamp(10px,1.2vw,20px)] overflow-hidden rounded-panel bg-[var(--c-panel)] p-[clamp(16px,2.6vw,48px)]">
                {it.imgs.map((im) => (
                  <Pic
                    key={im.src}
                    img={im}
                    sizes={`(min-width: 768px) ${Math.round(40 / it.imgs.length)}vw, ${Math.round(80 / it.imgs.length)}vw`}
                    className="h-auto min-w-0 rounded-[10px]"
                    style={{ flex: `${im.w / im.h} 1 0`, maxHeight: "min(70svh, 720px)", objectFit: "contain" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "gallery": {
      const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[b.cols ?? 4];
      return (
        <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${cols}`}>
          {b.imgs.map((im, i) => (
            <li key={im.src} className="flex flex-col gap-3">
              <Figure img={im} sizes={`(min-width: 768px) ${Math.round(68 / (b.cols ?? 4))}vw, 46vw`} className="flex flex-1 items-center" />
              {b.captions?.[i] && (
                <p data-rv className={`text-sm leading-[1.5] ${BODY}`}>
                  {b.captions[i]}
                </p>
              )}
            </li>
          ))}
        </ul>
      );
    }

    case "shifts":
      return (
        <ul className={`border-t ${LINE}`}>
          {b.items.map(([from, to]) => (
            <li
              key={from}
              data-rv
              /* phones: "from" on its own line, then "→ to"; wider screens: one row */
              className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b ${LINE} py-[clamp(16px,1.8vw,32px)] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-[clamp(12px,2vw,40px)]`}
            >
              <span className="col-span-2 text-h3 font-normal leading-[1.15] tracking-[-0.02em] text-[var(--c-muted)] sm:col-span-1">{from}</span>
              <span aria-label="to" className="flex justify-center text-h3 leading-none text-[var(--c-accent)] sm:w-[clamp(24px,3vw,56px)]">
                →
              </span>
              <span className={`text-h3 font-normal leading-[1.15] tracking-[-0.02em] ${FG}`}>{to}</span>
            </li>
          ))}
        </ul>
      );

    case "rows":
      return (
        <div className="flex flex-col gap-[clamp(56px,6vw,112px)]">
          {b.items.map((it) => (
            <div key={it.title} className="grid items-center gap-[clamp(24px,3vw,64px)] md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div className="max-w-[30em]">
                <h4 data-rv className={`text-xl font-medium uppercase leading-[1.25] tracking-[-0.01em] ${FG}`}>
                  {it.title}
                </h4>
                {it.principle && (
                  <div data-rv>
                    <Principle name={it.principle} className="mt-3" />
                  </div>
                )}
                {it.body?.map((p, i) => (
                  <p key={i} data-rv className={`mt-3 text-base leading-[1.6] ${BODY}`}>
                    {p}
                  </p>
                ))}
                {it.list && (
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {it.list.map((li) => (
                      <li key={li} data-rv className={`flex gap-3 text-base leading-[1.5] ${BODY}`}>
                        <span aria-hidden="true" className="mt-[0.6em] size-[6px] shrink-0 rounded-full bg-[var(--c-accent)]" />
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-start justify-center gap-[clamp(10px,1.2vw,20px)]">
                {it.media.map((md, i) => (
                  <MediaFig
                    key={i}
                    m={md}
                    sizes={`(min-width: 768px) ${Math.round(((it.dw / 15.12) * 100) / 100)}vw, ${Math.round(88 / it.media.length)}vw`}
                    className="min-w-0"
                    style={{ flex: `${md.w / md.h} 1 0`, maxWidth: `${(it.dw / 15.12).toFixed(2)}vw` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "spotlight":
      return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
          <h4 data-rv className={`text-h3-sm font-normal leading-[1.12] tracking-[-0.02em] ${FG}`}>
            {b.title}
          </h4>
          <p data-rv className={`mt-4 max-w-[36em] text-base leading-[1.6] ${BODY}`}>
            {b.body}
          </p>
          <MediaFig m={b.video} sizes="(min-width: 1024px) 66vw, 92vw" className="mt-[clamp(24px,3vw,48px)] w-full" />
          <div data-rv>
            <Principle name={b.principle} className="mt-5" />
          </div>
        </div>
      );

    case "metric":
      return (
        <div data-rv className={`flex flex-col gap-2 border-y ${LINE} py-[clamp(24px,2.6vw,44px)]`}>
          <p className={`font-mono text-sm ${BODY}`}>{b.label}</p>
          <p className={`text-h3-md font-medium leading-[1.1] tracking-[-0.02em] ${INK}`}>{b.value}</p>
        </div>
      );

    case "stack":
      return (
        <div className="flex flex-col gap-[clamp(56px,6vw,112px)]">
          {b.items.map((it) => (
            <div key={it.title} className="mx-auto flex w-full max-w-[1000px] flex-col items-center text-center">
              <h4 data-rv className={`text-xl font-medium uppercase leading-[1.25] tracking-[-0.01em] ${FG}`}>
                {it.title}
              </h4>
              <p data-rv className={`mt-3 max-w-[38em] text-base leading-[1.6] ${BODY}`}>
                {it.body}
              </p>
              <MediaFig m={it.video} sizes="(min-width: 1024px) 64vw, 92vw" className="mt-[clamp(20px,2.4vw,40px)] w-full" />
            </div>
          ))}
        </div>
      );

    case "trio":
      return (
        <ul className="grid gap-[clamp(24px,3vw,48px)] md:grid-cols-3">
          {b.items.map((it) => (
            <li key={it.title} className="flex flex-col">
              <div data-rv="media" className="flex aspect-square items-center justify-center overflow-hidden">
                <Video v={it.video} className="orb-mask aspect-square object-cover" style={{ width: it.small ? "72%" : "100%" }} />
              </div>
              <h4 data-rv className={`mt-4 text-xl font-medium uppercase leading-[1.25] ${FG}`}>
                {it.title}
              </h4>
              <p data-rv className={`mt-2 text-base leading-[1.6] ${BODY}`}>
                {it.body}
              </p>
            </li>
          ))}
        </ul>
      );

    case "bento":
      return (
        <ul className="grid gap-4 md:grid-cols-6">
          {b.items.map((it) => {
            const span = { 2: "md:col-span-2", 4: "md:col-span-4", 6: "md:col-span-6" }[it.span];
            const wide = it.span === 6;
            const head = (
              <>
                <h4 className={`text-xl font-medium leading-[1.25] tracking-[-0.01em] ${FG}`}>{it.title}</h4>
                <p className={`mt-2 max-w-[28em] text-base leading-[1.5] ${BODY}`}>{it.body}</p>
              </>
            );
            const pic = (im: Img, cls = "") => (
              <Pic key={im.src} img={im} sizes={wide ? "(min-width: 768px) 34vw, 88vw" : `(min-width: 768px) ${it.span * 11}vw, 88vw`} className={`h-auto w-full ${cls}`} />
            );
            return (
              <li key={it.title} data-rv className={`flex flex-col overflow-hidden rounded-feature bg-[var(--c-panel)] p-[clamp(20px,2vw,36px)] ${span}`}>
                {wide ? (
                  <div className="grid items-center gap-[clamp(20px,2.4vw,44px)] md:grid-cols-2">
                    <div>
                      {head}
                      {it.imgs.slice(0, -1).map((im) => pic(im, "mt-6"))}
                    </div>
                    {pic(it.imgs[it.imgs.length - 1])}
                  </div>
                ) : (
                  <>
                    {head}
                    <div className="mt-auto pt-6">{it.imgs.map((im) => pic(im))}</div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      );

    case "mosaic":
      return (
        <ul className="grid gap-4 md:grid-cols-6">
          {b.items.map((it, i) => {
            const span = { 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4" }[it.span];
            return (
              <li key={i} data-rv className={`flex flex-col overflow-hidden rounded-feature bg-[var(--c-deep)] p-[clamp(20px,2vw,36px)] text-white ${span}`}>
                {it.title && <h4 className="text-xl font-medium uppercase leading-[1.25] tracking-[-0.01em]">{it.title}</h4>}
                {it.body && <p className="mt-2 max-w-[30em] text-base leading-[1.5] text-white/75">{it.body}</p>}
                <div className={`flex flex-1 flex-col justify-end gap-4 ${it.title ? "pt-6" : ""}`}>
                  {it.imgs.map((im) => (
                    <Pic key={im.src} img={im} sizes={`(min-width: 768px) ${it.span * 11}vw, 88vw`} className="h-auto w-full rounded-[10px]" />
                  ))}
                </div>
                {it.caption && <p className="mt-5 text-xl leading-[1.3] tracking-[-0.01em] text-white">{it.caption}</p>}
              </li>
            );
          })}
        </ul>
      );

    case "personas":
      return (
        <ul className="grid gap-[clamp(20px,2vw,32px)] md:grid-cols-3">
          {b.items.map((p) => (
            <li key={p.name} data-rv className="flex flex-col">
              <div className="relative aspect-square overflow-hidden rounded-feature">
                <Image src={p.img.src} alt={p.img.alt} fill sizes="(min-width: 768px) 30vw, 92vw" className="object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--c-deep)]" />
                <h4 className="absolute inset-x-0 bottom-0 p-[clamp(18px,1.8vw,28px)] text-h3 font-medium leading-[1.1] tracking-[-0.02em] text-white">{p.name}</h4>
              </div>
              {[p.first, p.second].map((list, k) => (
                <div key={k} className="mt-6">
                  <h5 className={`font-mono text-sm ${INK}`}>{b.labels[k]}</h5>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {list.map((li) => (
                      <li key={li} className={`flex gap-3 text-base leading-[1.5] ${FG}`}>
                        <span aria-hidden="true" className="mt-[0.45em] size-[9px] shrink-0 rotate-45 rounded-[2px] bg-[var(--c-accent)]" />
                        {li}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ul>
      );

    case "iconCards":
      return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {b.items.map((it, i) => (
            <li key={i} data-rv className="flex flex-col rounded-feature bg-[var(--c-panel)] p-[clamp(22px,2vw,36px)]">
              <Pic img={it.icon} sizes="48px" className="h-[46px] w-auto self-start" />
              <h4 className={`mt-6 text-xl font-medium leading-[1.25] tracking-[-0.01em] ${FG}`}>{it.title}</h4>
              <p className={`mt-3 text-base leading-[1.6] ${BODY}`}>{it.body}</p>
            </li>
          ))}
        </ul>
      );

    case "styleRow": {
      const icons = b.imgs.length > 1 && b.imgs.every((im) => im.w <= 200);
      return (
        <div className="grid items-center gap-[clamp(24px,3vw,64px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {icons ? (
            <div data-rv="media" className="grid grid-cols-3 place-items-center gap-[clamp(16px,2.4vw,40px)] overflow-hidden rounded-panel bg-[var(--c-panel)] p-[clamp(24px,3vw,56px)]">
              {b.imgs.map((im) => (
                <Pic key={im.src} img={im} sizes="90px" className="h-auto w-[min(86px,100%)]" />
              ))}
            </div>
          ) : b.imgs.length > 1 ? (
            <div className={`grid gap-3 ${b.cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {b.imgs.map((im) => (
                <figure key={im.src} data-rv="media" className="aspect-[323/193] overflow-hidden rounded-[12px]">
                  <Pic img={im} sizes="(min-width: 768px) 24vw, 46vw" className="h-full w-full object-cover" />
                </figure>
              ))}
            </div>
          ) : (
            <Figure img={b.imgs[0]} sizes="(min-width: 768px) 40vw, 92vw" />
          )}
          <div>
            <h4 data-rv className={`text-h3 font-normal leading-[1.15] tracking-[-0.02em] ${FG}`}>
              {b.title}
            </h4>
            <p data-rv className={`mt-4 max-w-[30em] text-base leading-[1.6] ${BODY}`}>
              {b.body}
            </p>
          </div>
        </div>
      );
    }

    case "words":
      return (
        <ul className="flex flex-wrap gap-[clamp(10px,1vw,16px)]">
          {b.items.map((w) => (
            <li
              key={w}
              data-rv
              className={`rounded-pill border border-[color-mix(in_srgb,var(--c-accent)_55%,transparent)] px-[clamp(18px,1.6vw,28px)] py-[clamp(8px,0.7vw,12px)] text-xl leading-[1.3] tracking-[-0.01em] ${FG}`}
            >
              {w}
            </li>
          ))}
        </ul>
      );

    case "flow":
      return (
        <ol className="flex flex-wrap items-center gap-y-3">
          {b.items.map((s, i) => (
            <li key={s} data-rv className="flex items-center">
              {i > 0 && (
                <span aria-hidden="true" className="relative mx-2 flex h-3 w-[clamp(28px,3vw,52px)] items-center">
                  <span className="h-px w-full bg-[var(--c-accent)]" />
                  <span className="absolute left-1/2 size-[7px] -translate-x-1/2 rotate-45 bg-[var(--c-accent)]" />
                </span>
              )}
              <span className={`rounded-pill bg-[var(--c-panel)] px-4 py-2 text-sm font-semibold leading-[1.4] ${FG}`}>{s}</span>
            </li>
          ))}
        </ol>
      );

    case "pillars":
      return (
        <ul className="grid gap-4 md:grid-cols-3">
          {b.items.map((p) => (
            <li key={p.n} data-rv className="flex items-center gap-[clamp(16px,1.6vw,28px)] rounded-feature bg-[var(--c-panel)] p-[clamp(20px,2vw,36px)]">
              <span aria-hidden="true" className="text-[clamp(72px,7.4vw,140px)] font-semibold leading-[0.8] tracking-[-0.04em] text-[var(--c-accent)]">
                {p.n}
              </span>
              <span className="sr-only">{p.n}</span>
              <span className="flex flex-col gap-1">
                <span className={`text-base font-medium ${BODY}`}>{p.lead}</span>
                <span className={`text-lg font-semibold leading-[1.25] ${FG}`}>{p.title}</span>
              </span>
            </li>
          ))}
        </ul>
      );

    case "banner":
      return (
        <div data-rv="media" className="relative isolate overflow-hidden rounded-feature bg-[var(--c-deep)]">
          <Image src={b.bg.src} alt="" fill sizes="(min-width: 1024px) 72vw, 100vw" className="-z-10 object-cover" />
          <div className="flex flex-col items-center px-6 py-[clamp(56px,7vw,128px)] text-center">
            {b.fg && <Pic img={b.fg} sizes="240px" className="mb-[clamp(16px,2vw,32px)] h-auto w-[clamp(120px,12vw,220px)]" />}
            <h3 className="max-w-[18em] text-h3-md font-normal leading-[1.15] tracking-[-0.02em] text-white">{b.text}</h3>
          </div>
        </div>
      );

    case "quoteFig":
      return (
        <figure className="grid items-center gap-[clamp(24px,3vw,64px)] md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div>
            <blockquote data-rv className={`text-lg leading-[1.5] tracking-[-0.01em] ${FG}`}>
              {b.quote}
            </blockquote>
            <figcaption data-rv className="mt-6">
              <span className={`block text-base font-medium ${FG}`}>{b.name}</span>
              <span className={`mt-1 block text-sm leading-[1.5] ${BODY}`}>{b.role}</span>
            </figcaption>
          </div>
          <Figure img={b.img} sizes="(min-width: 768px) 44vw, 92vw" />
        </figure>
      );
  }
}

/* ---------------------------------------------------------------- testimonial */

function TestimonialPanel({ t }: { t: Testimonial }) {
  const long = t.quote.length > 420;
  return (
    <figure data-rv className="relative isolate overflow-hidden rounded-feature bg-[var(--c-deep)] px-[clamp(24px,5vw,96px)] py-[clamp(40px,5.4vw,104px)] text-white">
      <span aria-hidden="true" className="case-glow absolute inset-0 -z-10" />
      <span aria-hidden="true" className="block font-mono text-[clamp(64px,7vw,128px)] leading-[0.6] text-[var(--c-accent)]">
        “
      </span>
      {t.lead && <p className="mt-6 max-w-[34em] text-h3 font-normal leading-[1.2] tracking-[-0.02em]">{t.lead}</p>}
      <blockquote
        className={`mt-6 max-w-[46em] ${t.lead ? "text-lg leading-[1.55] text-white/80" : long ? "text-xl leading-[1.45]" : "text-h3 font-normal leading-[1.25] tracking-[-0.02em]"}`}
      >
        {t.quote}
      </blockquote>
      <figcaption className="mt-[clamp(28px,3vw,48px)] flex flex-col gap-1">
        <span className="text-lg font-medium">{t.name}</span>
        <span className="text-sm leading-[1.5] text-white/65">{t.role}</span>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- page */

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = caseStudy((await params).slug);
  if (!c) notFound();
  const path = `/works/${c.slug}`;
  const t = c.theme;
  const dark = t.mode === "dark";
  const themeVars = {
    "--c-bg": t.bg,
    "--c-fg": t.fg,
    "--c-body": t.body,
    "--c-muted": t.muted,
    "--c-line": t.line,
    "--c-panel": t.panel,
    "--c-accent": t.accent,
    "--c-ink": t.ink,
    "--c-deep": t.deep,
  } as CSSProperties;

  /* chapter numbers count the headed chapters only */
  const numbered = c.chapters.filter((ch) => "heading" in ch).length;
  /* the case study after this one, wrapping round to the first */
  const next = CASE_STUDIES[(CASE_STUDIES.findIndex((x) => x.slug === c.slug) + 1) % CASE_STUDIES.length];
  let n = 0;
  const logoH = c.logo.h;

  return (
    <div className={`case-page bg-[var(--c-bg)] ${FG}`} style={themeVars} data-mode={t.mode}>
      <Header current="/works" theme={dark ? "dark" : "light"} />
      <main id="main">
        {/* ---------- Intro ---------- */}
        <section aria-labelledby="case-title" className="container-page pt-[clamp(16px,2vw,40px)]">
          {/* Breadcrumb trail — the same Home › Work › project path as the BreadcrumbList data below,
              so visitors and search engines see one consistent way back up the site. */}
          <nav aria-label="Breadcrumb">
            <ol className={`flex flex-wrap items-center gap-x-2 font-mono text-sm ${BODY}`}>
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center transition-opacity hover:opacity-70">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/works" className="inline-flex min-h-11 items-center transition-opacity hover:opacity-70">
                  Work
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className={`inline-flex items-center py-1 ${FG}`}>
                {c.client}
              </li>
            </ol>
          </nav>
          <div className="mt-[clamp(16px,2.4vw,48px)] grid gap-[clamp(24px,3vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end">
            <div>
              <div
                data-rv
                className={c.logo.plate ? "inline-flex rounded-[14px] bg-[var(--c-deep)] px-[clamp(14px,1.2vw,22px)] py-[clamp(10px,0.9vw,16px)]" : "inline-flex"}
                style={typeof c.logo.plate === "string" ? { background: c.logo.plate } : undefined}
              >
                <Pic
                  img={c.logo.img}
                  sizes="240px"
                  className="w-auto"
                  style={{ height: `clamp(${Math.round(logoH * 0.7)}px, ${((logoH / 15.12) * 0.95).toFixed(2)}vw, ${Math.round(logoH * 1.1)}px)` }}
                />
              </div>
              <h1 id="case-title" data-rv className="mt-[clamp(20px,2vw,36px)] max-w-[11em] whitespace-pre-line text-h2 font-normal capitalize leading-[1.1] tracking-[-0.02em]">
                {c.title}
              </h1>
            </div>
            <div className="flex flex-col gap-4 lg:pb-2">
              {c.intro.map((p, i) => (
                <p key={i} data-rv className={`max-w-[640px] text-base leading-[1.6] ${BODY}`}>
                  {rich(p)}
                </p>
              ))}
            </div>
          </div>

          {c.hero.bleed ? (
            <figure data-rv="media" className="mt-[clamp(32px,4vw,80px)] overflow-hidden rounded-panel">
              <Pic img={c.hero.imgs[0]} sizes="(min-width: 1920px) 1848px, 96vw" className="h-auto w-full" />
            </figure>
          ) : (
            <figure
              data-rv="media"
              className="relative isolate mt-[clamp(32px,4vw,80px)] overflow-hidden rounded-panel bg-[var(--c-panel)] p-[clamp(16px,2.6vw,48px)]"
              style={c.hero.ground ? { background: c.hero.ground } : undefined}
            >
              {!c.hero.ground && <span aria-hidden="true" className="case-glow absolute inset-0 -z-10" />}
              {c.hero.imgs.length > 1 ? (
                <div
                  className="mx-auto flex items-center justify-center gap-[clamp(8px,1vw,16px)]"
                  style={{ maxWidth: `min(100%, calc(min(70svh, 640px) * ${(c.hero.imgs.reduce((s, im) => s + im.w, 0) / Math.max(...c.hero.imgs.map((im) => im.h))).toFixed(3)} + 32px))` }}
                >
                  {c.hero.imgs.map((im) => (
                    <Pic key={im.src} img={im} sizes="(min-width: 1024px) 18vw, 30vw" className="h-auto min-w-0" style={{ flex: `${im.w} 1 0` }} />
                  ))}
                </div>
              ) : (
                <Pic
                  img={c.hero.imgs[0]}
                  sizes="(min-width: 1920px) 1848px, 96vw"
                  /* a website screenshot sits in the panel as a framed screen; app cut-outs fill it */
                  className={`mx-auto h-auto max-h-[min(78svh,900px)] object-contain ${c.hero.imgs[0].w / c.hero.imgs[0].h > 1.5 ? "w-auto max-w-full rounded-[10px]" : "w-full"}`}
                />
              )}
            </figure>
          )}
        </section>

        {/* ---------- Chapters ---------- */}
        {c.chapters.map((ch) => {
          if (!("heading" in ch))
            return (
              <section key={ch.id} id={ch.id} aria-label="Testimonial" className="container-page mt-[clamp(72px,8vw,160px)]">
                <TestimonialPanel t={ch.testimonial} />
              </section>
            );
          n += 1;
          return (
            <section key={ch.id} id={ch.id} aria-labelledby={`${ch.id}-title`} className="container-page mt-[clamp(72px,8vw,160px)]">
              <div className={`grid gap-[clamp(20px,3vw,64px)] border-t ${LINE} pt-[clamp(24px,2.6vw,48px)] lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)]`}>
                {/* chapter number: holds beside the chapter while it scrolls */}
                <p aria-hidden="true" className={`font-mono text-sm ${BODY} lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start`}>
                  <span className={INK}>{pad(n)}</span>
                  <span className="mx-2 opacity-40">/</span>
                  {pad(numbered)}
                </p>
                <div className="flex min-w-0 flex-col gap-[clamp(28px,3vw,56px)]">
                  <h2 id={`${ch.id}-title`} data-rv className="max-w-[20em] text-h3-sm font-normal capitalize leading-[1.12] tracking-[-0.02em]">
                    {ch.heading}
                  </h2>
                  {ch.blocks.map((b, j) => (
                    <BlockView key={j} b={b} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* ---------- Closing ---------- */}
        <section aria-label="What’s next" className="container-page mt-[clamp(72px,8vw,160px)] pb-[clamp(80px,9vw,175px)]">
          <div className={`grid gap-[clamp(24px,3vw,64px)] border-t ${LINE} pt-[clamp(32px,3.6vw,64px)] lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)]`}>
            <span aria-hidden="true" />
            <div>
              {c.closing && (
                <p data-rv className={`mb-[clamp(28px,3vw,56px)] max-w-[28em] text-h3 font-normal leading-[1.2] tracking-[-0.02em] ${FG}`}>
                  {c.closing}
                </p>
              )}
              {/* Onward links: the next case study (they form a loop, so no page is a dead end) and
                  the way back to the full list. */}
              <div data-rv className="flex flex-wrap items-center gap-x-[clamp(24px,3vw,56px)] gap-y-3">
                <ArrowLink href={`/works/${next.slug}`} tone="orange" onDark={dark} className="text-lg">
                  Next project: {next.client}
                </ArrowLink>
                <ArrowLink href="/works" tone="orange" onDark={dark} className="text-lg">
                  Explore more work
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CaseReveal />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: `${c.client}: ${c.title.replace(/\n/g, " ")}`,
            headline: c.title.replace(/\n/g, " "),
            description: c.metaDescription,
            url: absoluteUrl(path),
            image: absoluteUrl(c.hero.imgs[0].src),
            creator: { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
            inLanguage: "en",
            mainEntityOfPage: absoluteUrl(path),
            about: c.client,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Work", item: absoluteUrl("/works") },
              { "@type": "ListItem", position: 3, name: c.client, item: absoluteUrl(path) },
            ],
          },
        ]}
      />
    </div>
  );
}
