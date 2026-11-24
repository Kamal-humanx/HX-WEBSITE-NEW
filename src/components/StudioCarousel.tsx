"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Slide = { image: string; alt: string; quote: string; caption: string };

/**
 * About — studio carousel (Figma 5376:13146 + "Carousel quotes (animated)" 5376:13164).
 * Slides 1070×574, radius 36, gap 36; neighbours peek in from both edges behind white fades.
 * All slides + quotes are server-rendered; this component only centres slide 2 on load
 * (the state shown in Figma). Native scroll-snap handles swipe / trackpad / keyboard.
 */
export function StudioCarousel({ slides }: { slides: Slide[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = el?.children[1] as HTMLElement | undefined;
    if (!el || !target) return;
    el.scrollLeft = target.offsetLeft - (el.clientWidth - target.clientWidth) / 2;
  }, []);

  return (
    <div className="relative">
      <ul
        ref={ref}
        tabIndex={0}
        aria-label="Life at the HumanX studio — scroll horizontally"
        className="no-scrollbar flex snap-x snap-mandatory gap-[clamp(12px,1.875vw,36px)] overflow-x-auto overscroll-x-contain px-[7.5vw] focus-visible:outline-offset-[-4px] 2xl:px-[calc((100%-1070px)/2)]"
      >
        {slides.map((s, i) => (
          <li
            key={s.image}
            className="relative aspect-[4/5] w-[85vw] sm:aspect-[1070/574] shrink-0 snap-center overflow-hidden rounded-[clamp(18px,1.875vw,36px)] md:w-[min(1070px,72vw)]"
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              sizes="(min-width: 768px) 72vw, 85vw"
              priority={i < 3}
              fetchPriority={i === 1 ? "high" : undefined}
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <figure className="absolute bottom-[clamp(16px,3.5vw,60px)] left-[clamp(16px,5vw,96px)] right-4 flex max-w-[531px] flex-col gap-[14px] text-white">
              <blockquote>
                <p className="font-inter text-[clamp(1.125rem,2.083vw,2.5rem)] font-medium leading-[1.24] tracking-[-0.02em]">{s.quote}</p>
              </blockquote>
              <figcaption className="font-mono text-2xs uppercase tracking-[0.04em]">{s.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[7.6vw] max-w-[147px] bg-gradient-to-r from-white to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8.4vw] max-w-[162px] bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
