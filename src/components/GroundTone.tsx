"use client";

import { useEffect } from "react";

/**
 * The page's ground darkens white → night with the scroll as a dark block approaches, as the
 * homepage stage does before its capabilities: once the block's top is 95% of the way down the
 * screen the ground starts to darken, and it is fully night by the time the top reaches 45%, so the
 * block's edge lands on a ground already its own colour. Desktop only (phones keep the plain cut,
 * as on the homepage); none of it for reduced motion.
 * `block`: the dark block's selector. The page leaves a held stretch above it (About: the
 * principles' bottom padding) so nothing with dark text is still on screen while the ground turns.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

export function GroundTone({ block }: { block: string }) {
  useEffect(() => {
    const main = document.getElementById("main");
    const dark = document.querySelector<HTMLElement>(block);
    if (!main || !dark || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 1024px)");
    let raf = 0, last = -1;
    const paint = () => {
      raf = 0;
      const V = window.innerHeight;
      const p = wide.matches ? smooth((V * 0.95 - dark.getBoundingClientRect().top) / (V * 0.5)) : 0;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      const c = Math.round(255 + (14 - 255) * p);
      main.style.backgroundColor = p > 0 ? `rgb(${c},${c},${c})` : "";
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
    };
  }, [block]);
  return null;
}
