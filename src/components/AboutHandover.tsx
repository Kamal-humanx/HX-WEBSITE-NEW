"use client";

import { useEffect } from "react";

/**
 * About: principles → capabilities, the homepage's work → capabilities hand-over (PinCover +
 * ToneShift), on desktop:
 *  - the principles stage (.about-stage) sticks once its foot meets the screen's foot (a touch
 *    higher, LIFT) and sits still
 *    for a scroll or so (24svh), then over the next 40svh (globals.css .about-hold) its content dips
 *    out, the screen itself darkens white → night, and the
 *    capabilities — pulled up onto that same screen (.about-dark, see-through top; .about-caps-stick
 *    held there, laid out exactly as the homepage's held capabilities) — fade in where they stand
 *    piece by piece as ToneShift fades them in on the homepage, and stay held for a further 36svh to
 *    be read. Then the page scrolls on.
 * Phones and tablets keep the plain cut; reduced motion too (the CSS gate leaves everything shown).
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));
const set = (el: HTMLElement | null, t: number) => {
  /* ToneShift's "in" look: fades in place, clearing from a soft blur and settling from a hair smaller */
  if (!el) return;
  if (t >= 1) {
    el.style.opacity = el.style.filter = el.style.transform = "";
    return;
  }
  el.style.opacity = t.toFixed(3);
  el.style.filter = `blur(${(6 * (1 - t)).toFixed(2)}px)`;
  el.style.transform = `scale(${(0.985 + 0.015 * t).toFixed(4)})`;
};
const LIFT = 20; // px: the held principles sit this much higher than their foot-at-the-foot place
const REST = 24; // svh: the principles sit still first
const HAND = 40; // svh: then the hand-over (together, .about-hold's 64svh)

export function AboutHandover() {
  useEffect(() => {
    const main = document.getElementById("main");
    const pin = document.querySelector<HTMLElement>(".about-pin");
    const stage = document.querySelector<HTMLElement>(".about-stage");
    const content = stage?.firstElementChild as HTMLElement | null;
    const caps = document.querySelector<HTMLElement>(".about-caps-stick");
    if (!main || !pin || !stage || !content || !caps || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 1024px)");
    /* the capabilities' pieces, as ToneShift fades them in on the homepage */
    const title = caps.querySelector<HTMLElement>("h2");
    const rows = Array.from(caps.querySelectorAll<HTMLElement>(".group")).map((row) => ({
      h: row.querySelector<HTMLElement>("h3"),
      rule: row.querySelector<HTMLElement>("span[aria-hidden]"),
      label: row.querySelector<HTMLElement>("p"),
      items: Array.from(row.querySelectorAll<HTMLElement>("li")),
      order: [] as HTMLElement[],
    }));
    /* visual order of a row's items: top to bottom, left column before right on the same line */
    const sortItems = () =>
      rows.forEach((r) => {
        r.order = [...r.items].sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return Math.abs(ra.top - rb.top) > 4 ? ra.top - rb.top : ra.left - rb.left;
        });
      });
    const pieces = () => [title, ...rows.flatMap((r) => [r.h, r.rule, r.label, ...r.items])];
    let raf = 0, last = -1, V = 0, top = 0, start = 0;

    const clear = () => {
      stage.style.top = "";
      content.style.opacity = content.style.transform = "";
      caps.style.opacity = caps.style.pointerEvents = "";
      pieces().forEach((el) => {
        if (!el) return;
        el.style.opacity = el.style.filter = el.style.transform = "";
        el.style.removeProperty("--line");
        el.querySelector<HTMLElement>(".cap-txt")?.style.removeProperty("opacity");
      });
      main.style.backgroundColor = "";
      last = -1;
    };
    const measure = () => {
      if (!wide.matches) return clear();
      V = window.innerHeight;
      const h = stage.offsetHeight;
      /* its foot at the screen's foot, and the whole of it a touch higher (LIFT) */
      top = Math.min(0, V - h) - LIFT;
      stage.style.top = `${top}px`;
      /* the hold begins when the stage sticks: its foot at the screen's foot */
      start = pin.getBoundingClientRect().top + window.scrollY - top;
      caps.style.opacity = "1"; // the pieces carry their own, from here on
      sortItems();
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
      /* ground: the held screen darkens white → night (as the homepage's, over the second half) */
      const g = smooth(ramp(e, 0.5, 0.95));
      const c = Math.round(255 + (14 - 255) * g);
      main.style.backgroundColor = g > 0 ? `rgb(${c},${c},${c})` : ""; // HeaderTheme reads this for the header's ink
      /* in: the capabilities, already in place on that screen, fade in there with the darkening,
         exactly as on the homepage: title first, then each row, its items a beat apart, each item's
         divider drawing in right → left before its text */
      set(title, smooth(ramp(e, 0.45, 0.8)));
      rows.forEach((r, i) => {
        const base = 0.5 + i * 0.08;
        set(r.h, smooth(ramp(e, base, base + 0.3)));
        set(r.rule, smooth(ramp(e, base + 0.03, base + 0.33)));
        set(r.label, smooth(ramp(e, base + 0.04, base + 0.32)));
        r.order.forEach((li, k) => {
          const a = base + 0.02 + k * 0.03;
          li.style.setProperty("--line", smooth(ramp(e, a, a + 0.18)).toFixed(4));
          const txt = li.querySelector<HTMLElement>(".cap-txt");
          const t = smooth(ramp(e, a + 0.06, a + 0.24));
          if (txt) txt.style.opacity = t < 1 ? t.toFixed(3) : "";
        });
      });
      /* they take the pointer once the principles have gone and the title is readable */
      caps.style.pointerEvents = e >= 0.6 ? "auto" : "none";
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
