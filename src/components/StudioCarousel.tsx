"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** `position` is the photo's focal point (CSS object-position), for a photo whose subject is off-centre. */
type Slide = { image: string; alt: string; position?: string };

/** Auto-scroll speed, as a fraction of the carousel's width per second (≈ 65 px/s on a 1440 screen)… */
const SPEED = 0.045;
/** …but never slower than this, so it does not crawl on a phone, where the carousel is narrow. */
const MIN_SPEED_PX = 46;
/** How long to wait after the visitor stops interacting before drifting again. */
const RESUME_MS = 1800;

/**
 * About — studio carousel (Figma 5724:39129, with its "(loop copy)" slides). Photographs only.
 * Slides 1070×574, radius 36, gap 36; neighbours peek in from both edges behind white fades, and
 * the lower edge washes to white (5724:39141).
 *
 * It drifts on its own in an endless loop: the slides are rendered twice (the second set hidden
 * from assistive tech) and the position wraps by exactly one set, so the seam never shows.
 *
 * The drift moves the whole track with a GPU transform rather than by changing the scroll position.
 * Scroll positions snap to whole pixels, so nudging them a fraction of a pixel per frame visibly
 * stutters; a transform is placed with sub-pixel precision on the compositor and glides.
 *
 * It is still an ordinary horizontal scroller. Hovering, touching, dragging or focusing it pauses
 * the drift and hands control to the visitor: the transform is folded into the real scroll position,
 * so it stops exactly where it was. There is deliberately no scroll-snap — snapping would yank the
 * slides to the nearest centre the moment the pointer arrived. It resumes shortly after. It does not move for
 * visitors who prefer reduced motion, or while it is off screen.
 */
export function StudioCarousel({ slides }: { slides: Slide[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const items = track.children;
    const second = items[1] as HTMLElement | undefined;
    if (second) scroller.scrollLeft = second.offsetLeft - (scroller.clientWidth - second.clientWidth) / 2;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Layout is measured once and again only on resize — never inside the frame loop. */
    let span = 0; // width of one full set of slides = distance from slide 1 to its copy
    let start = 0; // left edge of slide 1 (the track's side padding)
    let width = 0;
    const measure = () => {
      start = (items[0] as HTMLElement).offsetLeft;
      span = (items[slides.length] as HTMLElement).offsetLeft - start;
      width = scroller.clientWidth;
    };
    /* Keep the view inside [start, start + span): left of `start` is only the track's padding, so a
       view there has no slide on its left — the slide leaving on the left used to vanish at the wrap.
       From `start` on there is always a real slide (or its copy) on both sides. */
    const wrap = (p: number) => (span > 0 ? (p < start ? p + span : p >= start + span ? p - span : p) : p);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);

    /* `pos` is where the carousel appears to be; `base` is the real scroll position underneath.
       While drifting, the difference is carried by the track's transform. */
    let base = scroller.scrollLeft;
    let pos = base;
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

      if (paused !== wasPaused) {
        if (paused) {
          // Hand over to the visitor: fold the drift into the real scroll position, drop the transform.
          track.style.transform = "";
          scroller.scrollLeft = pos;
        } else {
          // Take over from wherever the visitor left it.
          base = scroller.scrollLeft;
          pos = wrap(base);
        }
        wasPaused = paused;
      }
      if (paused) return;

      pos += Math.max(MIN_SPEED_PX, width * SPEED) * dt;
      pos = wrap(pos); // the copy set looks identical, so the wrap is invisible
      track.style.transform = `translate3d(${(base - pos).toFixed(3)}px, 0, 0)`;
    };

    const hold = () => (touchUntil = performance.now() + RESUME_MS);
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    const focusIn = () => (focus = true);
    const focusOut = () => (focus = false);
    scroller.addEventListener("pointerenter", enter);
    scroller.addEventListener("pointerleave", leave);
    scroller.addEventListener("focusin", focusIn);
    scroller.addEventListener("focusout", focusOut);
    scroller.addEventListener("touchstart", hold, { passive: true });
    scroller.addEventListener("touchmove", hold, { passive: true });
    scroller.addEventListener("touchend", hold, { passive: true });
    scroller.addEventListener("wheel", hold, { passive: true });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(scroller);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      track.style.transform = "";
      scroller.removeEventListener("pointerenter", enter);
      scroller.removeEventListener("pointerleave", leave);
      scroller.removeEventListener("focusin", focusIn);
      scroller.removeEventListener("focusout", focusOut);
      scroller.removeEventListener("touchstart", hold);
      scroller.removeEventListener("touchmove", hold);
      scroller.removeEventListener("touchend", hold);
      scroller.removeEventListener("wheel", hold);
    };
  }, [slides.length]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label="Life at the HumanX studio, scroll horizontally"
        className="no-scrollbar overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-4px]"
      >
        <ul
          ref={trackRef}
          className="flex w-max gap-[clamp(12px,1.875vw,36px)] px-[7.5vw] will-change-transform 2xl:px-[calc((100vw-1070px)/2)]"
        >
          {[...slides, ...slides].map((s, i) => {
            const copy = i >= slides.length;
            return (
              <li
                key={`${s.image}-${copy ? "copy" : "main"}`}
                aria-hidden={copy || undefined}
                className="relative aspect-[4/5] w-[85vw] shrink-0 overflow-hidden rounded-[clamp(18px,1.875vw,36px)] sm:aspect-[1070/574] md:w-[min(1070px,72vw)]"
              >
                <Image
                  src={s.image}
                  alt={copy ? "" : s.alt}
                  fill
                  sizes="(min-width: 768px) 72vw, 85vw"
                  priority={i < 3}
                  fetchPriority={i === 1 ? "high" : undefined}
                  className="object-cover"
                  style={s.position ? { objectPosition: s.position } : undefined}
                />
              </li>
            );
          })}
        </ul>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-white/0 to-white/80" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[7.6vw] max-w-[147px] bg-gradient-to-r from-white to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8.4vw] max-w-[162px] bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
