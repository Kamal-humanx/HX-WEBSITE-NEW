"use client";

import { useEffect } from "react";

/**
 * About: principles → capabilities, the homepage's work → capabilities hand-over (PinCover +
 * ToneShift), on desktop:
 *  - the principles stage (.about-stage) sticks once its foot meets the screen's foot and sits still
 *    for a scroll or two (40svh), then over the next 40svh (globals.css .about-hold) its content dips
 *    out, the screen itself darkens white → night, and the
 *    capabilities — pulled up onto that same screen (.about-dark, see-through top; .about-caps-stick
 *    held there) — fade in where they stand, and stay held for a further 60svh to be read. Then the
 *    page scrolls on.
 * Phones and tablets keep the plain cut; reduced motion too (the CSS gate leaves everything shown).
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));
const REST = 40; // svh: the principles sit still first
const HAND = 40; // svh: then the hand-over (together, .about-hold's 80svh)

export function AboutHandover() {
  useEffect(() => {
    const main = document.getElementById("main");
    const pin = document.querySelector<HTMLElement>(".about-pin");
    const stage = document.querySelector<HTMLElement>(".about-stage");
    const content = stage?.firstElementChild as HTMLElement | null;
    const caps = document.querySelector<HTMLElement>(".about-caps-stick");
    if (!main || !pin || !stage || !content || !caps || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 1024px)");
    let raf = 0, last = -1, V = 0, top = 0, start = 0;

    const clear = () => {
      stage.style.top = "";
      content.style.opacity = content.style.transform = "";
      caps.style.opacity = caps.style.transform = "";
      caps.style.pointerEvents = "";
      main.style.backgroundColor = "";
      last = -1;
    };
    const measure = () => {
      if (!wide.matches) return clear();
      V = window.innerHeight;
      const h = stage.offsetHeight;
      top = Math.min(0, V - h);
      stage.style.top = `${top}px`;
      /* the hold begins when the stage sticks: its foot at the screen's foot */
      start = pin.getBoundingClientRect().top + window.scrollY - top;
      last = -1;
      paint();
    };
    const paint = () => {
      raf = 0;
      if (!wide.matches) return;
      const e = ramp(window.scrollY - start - (REST / 100) * V, 0, (HAND / 100) * V);
      if (Math.abs(e - last) < 0.0015) return;
      last = e;
      /* out: the principles sink a little as they fade */
      const o = smooth(ramp(e, 0, 0.45));
      content.style.opacity = o > 0 ? (1 - o).toFixed(3) : "";
      content.style.transform = o > 0 ? `translateY(${(o * o * 48).toFixed(1)}px)` : "";
      /* ground: the held screen darkens white → night */
      const g = smooth(ramp(e, 0.3, 0.9));
      const c = Math.round(255 + (14 - 255) * g);
      main.style.backgroundColor = g > 0 ? `rgb(${c},${c},${c})` : ""; // HeaderTheme reads this for the header's ink
      /* in: the capabilities, already in place on that screen, fade in with a small settle */
      const k = smooth(ramp(e, 0.5, 1));
      caps.style.opacity = k.toFixed(3);
      caps.style.transform = k < 1 ? `translateY(${(14 * (1 - k)).toFixed(1)}px)` : "";
      caps.style.pointerEvents = k >= 1 ? "auto" : "none";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    wide.addEventListener("change", measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", measure);
      cancelAnimationFrame(raf);
      clear();
    };
  }, []);
  return null;
}
