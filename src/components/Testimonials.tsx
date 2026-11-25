"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
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
 */
export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <>
      {/* Quote Row 4899:1393: starts 170px below the title's top (title box 82.6 → 87.4 gap), fixed 397px
          tall with the quote content centred in it (y 43.5 for the 310px Apollo quote), so tabs never jump. */}
      <div data-swap-block="" className="testimonial-stage mt-[clamp(40px,4.552vw,87.4px)] grid min-h-[clamp(0px,20.677vw,397px)] max-w-[1116px] items-center" aria-live="polite">
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

      {/* Logo tabs (4899:1405) */}
      {/* Logo Tabs 4899:1405: 110px below the quote row, 1856 wide, 6 × 309.2 × 210. */}
      <ul
        data-swap-block=""
        aria-label="Clients"
        className="mt-[clamp(48px,5.729vw,110px)] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
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
          <li key={t.company}>
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
