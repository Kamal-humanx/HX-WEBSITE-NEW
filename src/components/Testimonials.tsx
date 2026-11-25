"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HOME } from "@/content/home";

const ITEMS = HOME.testimonial.items;

/** Logo artwork per tab — unchanged from the previous build (Logo Tab 4905:154 uses the same logos in both states). */
const LOGOS: ReactNode[] = [
  /* exactly as Figma renders "image 464" (4905:67): 128×128, its two cropped fills composed — exported at 3× */
  <Image key="apollo" src="/images/logos/apollo-247-tab.png" alt="" width={384} height={384} className="size-[clamp(80px,6.67vw,128px)]" />,
  <span key="fox" className="relative block h-[84px] w-[76px] overflow-hidden mix-blend-screen">
    <Image src="/images/logos/fox-star.webp" alt="" width={404} height={316} className="absolute left-[-63.82%] top-[-29.86%] h-[159.71%] w-[226.28%] max-w-none" />
  </span>,
  <Image key="jll" src="/images/logos/jll.webp" alt="" width={130} height={86} className="h-auto w-[clamp(96px,6.8vw,130px)] object-cover" />,
  <span key="quickplay" className="flex items-center gap-[2px]">
    {/* Figma blends the mark "luminosity" over the dark tab = its greyscale; done directly so it is
        never orange whatever sits behind it */}
    <Image src="/images/logos/quickplay-mark.webp" alt="" width={35} height={35} className="size-[clamp(22px,1.83vw,35px)] grayscale" />
    <span className="font-hanken text-[clamp(22px,1.95vw,37.5px)] font-medium tracking-[-0.05em] text-white">quickplay</span>
  </span>,
  <span key="oml" className="relative block h-[48px] w-[182px] shrink-0 overflow-hidden mix-blend-difference max-sm:scale-[0.7]">
    <Image src="/images/logos/oml.webp" alt="" width={800} height={796} className="absolute left-[-18.48%] top-[-208.33%] h-[513.72%] w-[136.17%] max-w-none" />
  </span>,
  <Image key="ask" src="/images/logos/ask.svg" alt="" width={126} height={37} className="h-[37px] w-auto" />,
];

/**
 * Testimonials (homepage instance I4899:7681 of "Testimonials" 4899:1434).
 * Clicking (or Enter/Space on) a logo tab makes it Active and shows that client's quote; hovering
 * only lights the borders near the cursor (on every tab except the active one).
 * Logo Tab — Default: no fill, 1px #333 inside stroke. Active: fill #171717 +
 * inner shadow 0 -19 / blur 47.6 / spread -17 / white 41%.
 * Quote: Uncut Sans 42 / 118% / -2%. Author: 47px headshot, gap 20; name Uncut 24 / auto / -2%;
 * role Chivo Mono 16 / auto / -3% #BDBDBD; name→role gap 8; quote→author gap 95.
 *
 * Phones and tablets (< 1024px, no Figma frame): the six logo tabs become one swipeable strip
 * instead of a 2 × 3 grid, and a row of previous / next arrows with a "02 / 06" counter sits
 * between the quote and the strip. The arrows, a tap on a logo, or a sideways swipe on the quote
 * all change the testimonial, and the strip scrolls to keep the active client in view. Together
 * the title, quote, arrows and strip fit one phone screen, so the quote stays readable while the
 * page holds this section.
 */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLUListElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const count = ITEMS.length;
  const go = (step: number) => setActive((i) => (i + step + count) % count);

  /* keep the active client's logo in view inside the strip (never scrolls the page itself) */
  useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth + 1) return;
    strip.scrollTo({ left: tab.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <>
      {/* Quote Row 4899:1393: starts 170px below the title's top (title box 82.6 → 87.4 gap), fixed 397px
          tall with the quote content centred in it (y 43.5 for the 310px Apollo quote), so tabs never jump. */}
      <div
        data-swap-block=""
        className="testimonial-stage mt-[clamp(40px,4.552vw,87.4px)] grid min-h-[clamp(0px,20.677vw,397px)] max-w-[1116px] touch-pan-y items-center"
        aria-live="polite"
        /* a sideways swipe on the quote moves to the next / previous testimonial */
        onTouchStart={(e) => (swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const from = swipe.current;
          swipe.current = null;
          if (!from) return;
          const dx = e.changedTouches[0].clientX - from.x;
          const dy = e.changedTouches[0].clientY - from.y;
          if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
        }}
      >
        {ITEMS.map((t, i) => (
          <figure
            key={t.name}
            aria-hidden={i !== active}
            className={`testimonial-slide col-start-1 row-start-1 ${i === active ? "is-active" : ""}`}
          >
            <blockquote>
              <p className="text-h3 leading-[1.18] tracking-[-0.02em]">{t.quote}</p>
            </blockquote>
            <figcaption className="mt-[clamp(32px,4.948vw,95px)] flex items-center gap-5">
              <Image src={t.photo} alt="" width={141} height={141} className="size-[47px] rounded-full object-cover" />
              <span className="flex flex-col gap-2">
                <span className="text-lg leading-[1.208] tracking-[-0.02em]">{t.name}</span>
                <span className="font-mono text-sm leading-[1.1875] tracking-[-0.03em] text-gray-5">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Phones and tablets: previous / next arrows and a counter */}
      <div data-swap-block="" className="mt-5 flex items-center justify-between lg:hidden">
        <p className="font-mono text-sm tracking-[-0.03em] text-gray-5" aria-hidden="true">
          <span className="text-white">{String(active + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
        </p>
        <div className="flex gap-2.5">
          {[
            { step: -1, label: "Previous testimonial", d: "M11 4 5 10l6 6" },
            { step: 1, label: "Next testimonial", d: "m9 4 6 6-6 6" },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              aria-label={b.label}
              onClick={() => go(b.step)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors active:bg-white active:text-night"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d={b.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Logo tabs (4899:1405) */}
      {/* Logo Tabs 4899:1405: 110px below the quote row, 1856 wide, 6 × 309.2 × 210. */}
      <ul
        ref={stripRef}
        data-swap-block=""
        aria-label="Clients"
        className="no-scrollbar mt-[clamp(48px,5.729vw,110px)] flex overflow-x-auto overscroll-x-contain max-lg:-mx-[var(--gutter)] max-lg:px-[var(--gutter)] lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-6"
        /* border spotlight: every tab gets the pointer position in its own coordinates, so the glow
           lights whichever borders are near it, across neighbouring tabs too */
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const ul = e.currentTarget;
          ul.style.setProperty("--spot", "1");
          ul.querySelectorAll<HTMLElement>(".logo-tab").forEach((tab) => {
            const r = tab.getBoundingClientRect();
            tab.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(1)}px`);
            tab.style.setProperty("--my", `${(e.clientY - r.top).toFixed(1)}px`);
          });
        }}
        onPointerLeave={(e) => e.currentTarget.style.setProperty("--spot", "0")}
      >
        {ITEMS.map((t, i) => (
          <li key={t.company} className="w-[38%] shrink-0 sm:w-[24%] lg:w-auto">
            <button
              type="button"
              aria-label={`${t.company}: show testimonial`}
              aria-pressed={i === active}
              /* click (or Enter/Space) selects a client; hover only shows the border glow */
              onClick={() => setActive(i)}
              className={`logo-tab flex h-[clamp(120px,10.9375vw,210px)] w-full items-center justify-center border border-night-line ${
                i === active ? "is-active" : ""
              }`}
            >
              {LOGOS[i]}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
