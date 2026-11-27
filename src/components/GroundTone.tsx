"use client";

import { useEffect } from "react";

/**
 * The hand-over from a light section into a dark block, scrubbed by the scroll as the homepage's
 * work → capabilities is: as the block's top comes up the screen, the light section's content dips
 * out (sinking a little as it fades), the page's ground darkens white → night, and only then does
 * the block's own content come in. Desktop only (phones keep the plain cut); none for reduced motion.
 *  - `block`: the dark block's selector; `fade`: the light content that leaves (a selector)
 *  - progress p runs from the block's top at 100% of the screen height to 42%:
 *    content out over p 0 → 0.55, ground over 0.2 → 0.85, the block's content in over 0.82 → 1
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

export function GroundTone({ block, fade }: { block: string; fade?: string }) {
  useEffect(() => {
    const main = document.getElementById("main");
    const dark = document.querySelector<HTMLElement>(block);
    const out = fade ? document.querySelector<HTMLElement>(fade) : null;
    const inner = dark?.firstElementChild as HTMLElement | null;
    if (!main || !dark || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 1024px)");
    let raf = 0, last = -1;
    const paint = () => {
      raf = 0;
      const V = window.innerHeight;
      const p = wide.matches ? ramp(V - dark.getBoundingClientRect().top, 0, V * 0.58) : 0;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      const g = smooth(ramp(p, 0.2, 0.85));
      const c = Math.round(255 + (14 - 255) * g);
      main.style.backgroundColor = g > 0 ? `rgb(${c},${c},${c})` : "";
      if (out) {
        const o = smooth(ramp(p, 0, 0.55));
        out.style.opacity = o > 0 ? (1 - o).toFixed(3) : "";
        out.style.transform = o > 0 ? `translateY(${(o * o * 48).toFixed(1)}px)` : "";
      }
      if (inner) {
        const i = smooth(ramp(p, 0.82, 1));
        inner.style.opacity = p > 0 && i < 1 ? i.toFixed(3) : "";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    wide.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      wide.removeEventListener("change", onScroll);
      cancelAnimationFrame(raf);
      main.style.backgroundColor = "";
      if (out) out.style.opacity = out.style.transform = "";
      if (inner) inner.style.opacity = "";
    };
  }, [block, fade]);
  return null;
}
