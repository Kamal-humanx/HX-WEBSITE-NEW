"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Slide = { image: string; alt: string };

/**
 * About — studio carousel (Figma 5724:39129). Photographs only — the quotes were removed in the
 * 2026 revision. Slides 1070×574, radius 36, gap 36; neighbours peek in from both edges behind
 * white fades, and the lower edge washes to white (5724:39141).
 * All slides are server-rendered; this component only centres slide 2 on load
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
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-white/0 to-white/80" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[7.6vw] max-w-[147px] bg-gradient-to-r from-white to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8.4vw] max-w-[162px] bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
