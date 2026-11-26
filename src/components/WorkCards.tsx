"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLink } from "@/components/ui";
import { RippleImage } from "@/components/RippleImage";

/** soon: the project page isn't out yet — the Work page's glass "Coming Soon" pill on the thumbnail */
type Case = { label: string; title: string; description: string; image: string; alt: string; href?: string; soon?: boolean };

/*
 * Work cards â€” "thumbnail explo" (5253:31321 active, 5253:31411 rest).
 * The card is one vector (Vector 6225): 1853Ã—305, every vertex rounded 12px (corner smoothing 0),
 * fill white â†’ #F3F3F3, 1px #919191 INSIDE stroke. The left edge folds in to a notch whose points
 * are (0,127.64) â†’ (depth,154) â†’ (0,181.61); depth 0 at rest, 35.92 when active. Drawn here as an
 * SVG path built the way Figma rounds a vector (tangent fillets, circular-arc cubics), so the notch's
 * three corners are rounded too and the outline follows the cut-out. Checked against the vector's
 * fillGeometry: identical coordinates.
 * Thumbnail (active card, Frame 2147230119): 502Ã—302, 1px from the right, 1.64px from the top of the
 * card shape, 3px inside stroke in the card's own fill colour.
 */
const R = 12;
const NOTCH = { a: 127.64, tip: 154, c: 181.61, depth: 35.92 };

function cardPath(w: number, h: number, d: number) {
  /* clockwise, as Figma lists them, starting top-right */
  const pts: [number, number][] = [
    [w, 0],
    [w, h],
    [0, h],
    [0, NOTCH.c],
    [d, NOTCH.tip],
    [0, NOTCH.a],
    [0, 0],
  ];
  const n = pts.length;
  const f = (v: number) => +v.toFixed(3);
  let path = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i], prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
    const inL = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const outL = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const u = [(p[0] - prev[0]) / inL, (p[1] - prev[1]) / inL];
    const v = [(next[0] - p[0]) / outL, (next[1] - p[1]) / outL];
    /* turning angle at this vertex; straight (depth 0 notch points) = no rounding */
    const alpha = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])));
    if (alpha < 1e-4) {
      path += `${i ? "L" : "M"}${f(p[0])} ${f(p[1])} `;
      continue;
    }
    const t = Math.min(R * Math.tan(alpha / 2), inL / 2, outL / 2);
    const r = t / Math.tan(alpha / 2);
    const k = (4 / 3) * Math.tan(alpha / 4) * r;
    const s = [p[0] - u[0] * t, p[1] - u[1] * t];
    const e = [p[0] + v[0] * t, p[1] + v[1] * t];
    path +=
      `${i ? "L" : "M"}${f(s[0])} ${f(s[1])} ` +
      `C${f(s[0] + u[0] * k)} ${f(s[1] + u[1] * k)} ${f(e[0] - v[0] * k)} ${f(e[1] - v[1] * k)} ${f(e[0])} ${f(e[1])} `;
  }
  return path + "Z";
}

const DUR = 450;
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

function Card({ c, active, readMore, onEnter }: { c: Case; active: boolean; readMore: string; onEnter: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const id = useId().replace(/:/g, "");
  const st = useRef({ w: 0, h: 0, d: 0, from: 0, to: 0, t0: 0, raf: 0, wide: false });

  const draw = () => {
    const s = st.current;
    if (!s.w) return;
    const d = cardPath(s.w, s.h, s.wide ? s.d : 0);
    pathRef.current?.setAttribute("d", d);
    clipRef.current?.setAttribute("d", d);
  };

  useEffect(() => {
    const el = ref.current!;
    const s = st.current;
    const mq = matchMedia("(min-width: 768px)");
    const measure = () => {
      s.w = el.offsetWidth;
      s.h = el.offsetHeight;
      s.wide = mq.matches;
      draw();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    measure();
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      cancelAnimationFrame(s.raf);
    };
  }, []);

  useEffect(() => {
    const s = st.current;
    const target = active ? NOTCH.depth : 0;
    if (s.to === target && s.d === target) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.from = s.d;
    s.to = target;
    s.t0 = 0;
    cancelAnimationFrame(s.raf);
    if (calm || !s.w) {
      s.d = target;
      draw();
      return;
    }
    const step = (now: number) => {
      if (!s.t0) s.t0 = now;
      const p = Math.min(1, (now - s.t0) / DUR);
      s.d = s.from + (s.to - s.from) * ease(p);
      draw();
      if (p < 1) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  }, [active]);

  return (
    <article
      ref={ref}
      /* Coming Soon cards don't take the hover (no notch, fill, zoom or ripple): their project isn't out yet */
      onMouseEnter={c.soon ? undefined : onEnter}
      onFocus={c.soon ? undefined : onEnter}
      className={`case-card group relative isolate grid md:min-h-[305px] md:grid-cols-[29.5%_1fr_minmax(0,27.145%)] ${active ? "is-active" : ""}`}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible">
        <defs>
          <clipPath id={`cc${id}`}>
            <path ref={clipRef} />
          </clipPath>
        </defs>
        {/* fill, then a 2px stroke clipped to the shape = Figma's 1px INSIDE stroke */}
        <path ref={pathRef} className="case-shape" clipPath={`url(#cc${id})`} strokeWidth="2" />
      </svg>
      <p className="px-6 pt-6 font-mono text-[clamp(1rem,1.25vw,1.5rem)] font-medium uppercase leading-[1.3] tracking-[-0.01em] text-black/[0.54] md:px-[56px] md:pt-[49px]">
        {c.label}
      </p>
      <div className="flex flex-col gap-[clamp(20px,2.9vw,55px)] px-6 pb-6 pt-3 md:pb-[30px] md:pl-0 md:pr-6 md:pt-[30px]">
        <div>
          <h3 className="text-h3 font-semibold leading-[1.5] tracking-[-0.02em] text-ink">
            {c.title}
          </h3>
          <p className="mt-1 max-w-[397px] font-mono text-base font-medium leading-[1.4] tracking-[-0.02em] text-body">
            {c.description}
          </p>
        </div>
        {c.soon ? (
          /* not out yet: a plain grey label in Read More's place — not a link, no hover */
          <p className="inline-flex min-h-11 items-center self-start text-base font-bold leading-[1.5] tracking-[-0.02em] text-[#8a8a8a]">
            Coming Soon
          </p>
        ) : (
          <ArrowLink href={c.href ?? "/works"} srSuffix={`: ${c.title}`} className="after:absolute after:inset-0 after:content-['']">
            {readMore}
          </ArrowLink>
        )}
      </div>
      {/* thumbnail column = 503/1853 of the card (502 frame + 1px to the card's right edge) */}
      {/* fills the card's height at every width (1.64px from the top, 1.36px from the bottom, 1px from
          the right, as Figma), so the gap around it is even whatever height the text gives the card;
          the picture crops to fit. At 1920 the card is 305px and this is exactly Figma's 502×302. */}
      <div className="case-thumb relative z-[1] m-[4px] aspect-[502/302] overflow-hidden rounded-card border-[3px] [container-type:inline-size] md:m-0 md:mb-[1.36px] md:mr-px md:mt-[1.64px] md:aspect-auto md:w-[calc(100%-1px)] md:self-stretch">
        {/* cursor-local liquid ripple (RippleImage); z-[1] keeps it above the card's full-card link */}
        {c.soon ? (
          <Image src={c.image} alt={c.alt} fill sizes="(min-width: 768px) 27vw, 100vw" className="object-cover" />
        ) : (
          <RippleImage src={c.image} alt={c.alt} sizes="(min-width: 768px) 27vw, 100vw" className="case-img object-cover" />
        )}
        {/* the Work page's pill (.wk-badge), sized by this thumbnail's width, in the top-right corner */}
        {c.soon && (
          <span aria-hidden="true" className="wk-badge pointer-events-none z-[2]">
            Coming Soon
          </span>
        )}
      </div>
    </article>
  );
}

export function WorkCards({ cases, readMore }: { cases: Case[]; readMore: string }) {
  /* no card is active at rest; a card takes the active state only while the mouse (or keyboard
     focus) is on it */
  const [hover, setHover] = useState<number | null>(null);
  const active = hover;
  return (
    <ul className="case-list mt-[clamp(32px,3.6vw,70px)] flex flex-col gap-2" onMouseLeave={() => setHover(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null);
      }}
    >
      {cases.map((c, i) => (
        <li key={c.title}>
          <Card c={c} active={i === active} readMore={readMore} onEnter={() => setHover(i)} />
        </li>
      ))}
    </ul>
  );
}
