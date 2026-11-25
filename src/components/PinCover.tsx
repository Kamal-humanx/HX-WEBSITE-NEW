"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pin-and-cover for a section of any height (the philosophy statement's hand-over, generalised):
 * once the section's bottom reaches the bottom of the screen it holds there for `hold` svh of
 * scrolling, while the next section (class `pin-over`, pulled up 100svh) slides up over it.
 * If `dim`, the held section eases back (smaller, dimmer, drifting up) as it is covered.
 * The wrapper's own className carries its background / stacking.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function PinCover({
  children,
  className = "",
  hold = 100,
  dim = true,
  dataPin,
}: {
  children: ReactNode;
  className?: string;
  hold?: number;
  dim?: boolean;
  dataPin?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const stick = stickRef.current!;
    const move = dim && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let h = 0, V = 0, raf = 0;

    const measure = () => {
      V = window.innerHeight;
      h = stick.offsetHeight;
      /* sticks when its bottom meets the bottom of the screen (or its top the top, if it fits) */
      stick.style.top = `${Math.min(0, V - h)}px`;
      paint();
    };
    const paint = () => {
      raf = 0;
      if (!move) return;
      const s = -wrap.getBoundingClientRect().top;
      const holdPx = (hold / 100) * V;
      /* covered over the last screen of the hold */
      const s0 = Math.max(0, h - V) + holdPx - V;
      const e = clamp((s - s0) / V);
      const k = e * e * (3 - 2 * e);
      const inner = stick.firstElementChild as HTMLElement | null;
      if (!inner) return;
      inner.style.transform = k ? `translateY(${(-6 * k).toFixed(3)}vh) scale(${(1 - 0.06 * k).toFixed(4)})` : "";
      inner.style.opacity = k ? (1 - 0.7 * k).toFixed(3) : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stick);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [hold, dim]);

  return (
    <div ref={wrapRef} data-pin={dataPin} className={`relative ${className}`}>
      <div ref={stickRef} className="sticky">
        <div className="origin-top">{children}</div>
      </div>
      {/* the hold: a spacer the sticky stage rides over (padding would not count for sticky) */}
      <div aria-hidden="true" style={{ height: `${hold}svh` }} />
    </div>
  );
}
