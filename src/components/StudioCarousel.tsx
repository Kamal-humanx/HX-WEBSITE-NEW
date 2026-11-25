"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Slide = { image: string; alt: string };

/** Auto-scroll speed, as a fraction of the carousel's width per second (≈ 58 px/s on a 1920 screen). */
const SPEED = 0.03;
/** How long to wait after the visitor stops interacting before drifting again. */
const RESUME_MS = 1800;

/**
 * About — studio carousel (Figma 5724:39129, with its "(loop copy)" slides). Photographs only.
 * Slides 1070×574, radius 36, gap 36; neighbours peek in from both edges behind white fades, and
 * the lower edge washes to white (5724:39141).
 *
 * It drifts on its own in an endless loop: the slides are rendered twice (the second set hidden
 * from assistive tech) and the scroll position wraps by exactly one set, so the seam never shows.
 * It is still an ordinary horizontal scroller — hovering, touching, dragging or focusing it pauses
 * the drift and hands control to the visitor (with scroll-snap), and it resumes shortly after.
 * It does not move for visitors who prefer reduced motion, or while it is off screen.
 */
export function StudioCarousel({ slides }: { slides: Slide[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.children;
    const second = items[1] as HTMLElement | undefined;
    if (second) el.scrollLeft = second.offsetLeft - (el.clientWidth - second.clientWidth) / 2;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Layout is measured once and again only on resize — never inside the frame loop, where reading
       it every frame would force the browser to recalculate layout 60 times a second. */
    let span = 0; // width of one full set of slides = distance from slide 1 to its copy
    let width = 0;
    const measure = () => {
      span = (items[slides.length] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
      width = el.clientWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let pos = el.scrollLeft;
    let last = 0;
    let raf = 0;
    let hover = false;
    let focus = false;
    let visible = true;
    let touchUntil = 0;
    let wasPaused: boolean | null = null;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - (last || now), 64) / 1000;
      last = now;
      const paused = hover || focus || !visible || document.hidden || now < touchUntil;
      // Snap only while the visitor is in control; it would fight the drift otherwise.
      if (paused !== wasPaused) {
        el.style.scrollSnapType = paused ? "" : "none";
        if (!paused) pos = el.scrollLeft; // pick up from wherever the visitor left it
        wasPaused = paused;
      }
      if (paused) return;
      pos += width * SPEED * dt;
      if (span > 0 && pos >= span) pos -= span;
      el.scrollLeft = pos;
    };

    const hold = () => (touchUntil = performance.now() + RESUME_MS);
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    const focusIn = () => (focus = true);
    const focusOut = () => (focus = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("touchmove", hold, { passive: true });
    el.addEventListener("touchend", hold, { passive: true });
    el.addEventListener("wheel", hold, { passive: true });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchmove", hold);
      el.removeEventListener("touchend", hold);
      el.removeEventListener("wheel", hold);
    };
  }, [slides.length]);

  return (
    <div className="relative">
      <ul
        ref={ref}
        tabIndex={0}
        aria-label="Life at the HumanX studio — scroll horizontally"
        className="no-scrollbar flex snap-x snap-mandatory gap-[clamp(12px,1.875vw,36px)] overflow-x-auto overscroll-x-contain px-[7.5vw] focus-visible:outline-offset-[-4px] 2xl:px-[calc((100%-1070px)/2)]"
      >
        {[...slides, ...slides].map((s, i) => {
          const copy = i >= slides.length;
          return (
            <li
              key={`${s.image}-${copy ? "copy" : "main"}`}
              aria-hidden={copy || undefined}
              className="relative aspect-[4/5] w-[85vw] shrink-0 snap-center overflow-hidden rounded-[clamp(18px,1.875vw,36px)] sm:aspect-[1070/574] md:w-[min(1070px,72vw)]"
            >
              <Image
                src={s.image}
                alt={copy ? "" : s.alt}
                fill
                sizes="(min-width: 768px) 72vw, 85vw"
                priority={i < 3}
                fetchPriority={i === 1 ? "high" : undefined}
                className="object-cover"
              />
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-white/0 to-white/80" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[7.6vw] max-w-[147px] bg-gradient-to-r from-white to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8.4vw] max-w-[162px] bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
