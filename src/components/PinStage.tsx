"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds a statement in the middle of the screen, then lets the next section slide up over it —
 * the Careers hand-over, kept light: one short hold, then the cover.
 *
 * Layout: the section is [stage 100svh] + [hold] + [cover 100svh] tall; the stage is sticky, and the
 * section that follows pulls itself up by 100svh (see `.pin-next`) with its own background on top,
 * so it scrolls over the still-pinned stage instead of pushing it away. While it is being covered the
 * statement eases back (a little smaller, dimmer, drifting up). Reduced motion keeps the layout and
 * drops the easing back.
 */
export function PinStage({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const secRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sec = secRef.current!;
    const inner = innerRef.current!;
    let target = 0, shown = 0, raf = 0, last = 0;

    const read = () => {
      const r = sec.getBoundingClientRect();
      const V = window.innerHeight;
      /* the cover is the last 100svh of the section: 0 as the next section's top reaches the
         bottom of the screen, 1 once it has filled it */
      const coverStart = r.height - V;
      return Math.min(1, Math.max(0, (-r.top - (coverStart - V)) / V));
    };
    const paint = (e: number) => {
      if (e <= 0) {
        inner.style.transform = "";
        inner.style.opacity = "";
        return;
      }
      const k = e * e * (3 - 2 * e);
      inner.style.transform = `translateY(${(-6 * k).toFixed(3)}vh) scale(${(1 - 0.06 * k).toFixed(4)})`;
      inner.style.opacity = (1 - 0.7 * k).toFixed(3);
    };
    /* eased toward the scroll (~85ms, as on Careers) so a notched wheel glides */
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now - 16)) / 1000);
      last = now;
      shown += (target - shown) * (1 - Math.exp(-dt / 0.085));
      if (Math.abs(target - shown) < 0.0005) shown = target;
      paint(shown);
      raf = shown !== target ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    };
    const onScroll = () => {
      target = read();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    target = shown = read();
    paint(shown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={secRef} aria-label={label} className="pin-stage relative">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div ref={innerRef} className={`w-full origin-center will-change-transform ${className}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
