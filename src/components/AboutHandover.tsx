"use client";

import { useEffect } from "react";

/**
 * About: principles → capabilities, the homepage's work → capabilities hand-over (PinCover +
 * ToneShift), with the same values.
 * Desktop (≥ 1024):
 *  - the principles stage (.about-stage) sticks once its foot meets the screen's foot (a touch
 *    higher, LIFT) and sits still for a scroll or so (24svh), then over the next 40svh (globals.css
 *    .about-hold) its content dips out, the screen itself darkens white → night, and the
 *    capabilities — pulled up onto that same screen (.about-dark, see-through top; .about-caps-stick
 *    held there, laid out exactly as the homepage's held capabilities) — fade in where they stand
 *    piece by piece as ToneShift fades them in on the homepage, and stay held for a further 36svh to
 *    be read. Then the page scrolls on.
 * Phones (< 768), as the homepage's phone hand-over:
 *  - the stage sticks with its foot at the screen's foot and holds for 70svh; the principles on
 *    screen fold away one after another, top first (each rising ~10% of the screen and shrinking a
 *    little from its top edge); the ground darkens over the middle of the hold; and the capabilities,
 *    pulled up by one screen only (they start 70% down the held screen), rise into place with the
 *    scroll while they fade in piece by piece with the darkening.
 * Tablets keep the plain cut; reduced motion and no script too (the CSS gates leave everything shown).
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
const LIFT = 20; // px: the held principles sit this much higher than their foot-at-the-foot place (desktop)
const REST = 24; // svh: the principles sit still first (desktop)
const HAND = 40; // svh: then the hand-over (together, .about-hold's 64svh on desktop)
const PHONE_HOLD = 70; // svh: the phone hold, as the homepage's work section (.about-hold on phones)

export function AboutHandover() {
  useEffect(() => {
    const main = document.getElementById("main");
    const pin = document.querySelector<HTMLElement>(".about-pin");
    const stage = document.querySelector<HTMLElement>(".about-stage");
    const content = stage?.firstElementChild as HTMLElement | null;
    const caps = document.querySelector<HTMLElement>(".about-caps-stick");
    if (!main || !pin || !stage || !content || !caps || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = matchMedia("(min-width: 1024px)");
    const phone = matchMedia("(max-width: 767px)");
    const mode = () => (wide.matches ? "wide" : phone.matches ? "phone" : null);
    /* phones: the principles leave one by one, as the homepage's work cards — the title block and
       each step of the list */
    const cards = Array.from(content.querySelectorAll<HTMLElement>(":scope > [data-rv], :scope > ol > li:not([aria-hidden])"));
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
      cards.forEach((li) => {
        li.style.transformOrigin = li.style.transform = li.style.opacity = "";
      });
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
      const m = mode();
      if (!m) return clear();
      V = window.innerHeight;
      const h = stage.offsetHeight;
      /* its foot at the screen's foot (or its top at the top, if it fits); on desktop the whole of it
         a touch higher (LIFT) */
      top = Math.min(0, V - h) - (m === "wide" ? LIFT : 0);
      stage.style.top = `${top}px`;
      /* the hold begins when the stage sticks */
      start = pin.getBoundingClientRect().top + window.scrollY - top;
      caps.style.opacity = "1"; // the pieces carry their own, from here on
      sortItems();
      last = -1;
      paint();
    };
    const paint = () => {
      raf = 0;
      const m = mode();
      if (!m) return;
      const rest = m === "wide" ? REST : 0, hand = m === "wide" ? HAND : PHONE_HOLD;
      const e = ramp(window.scrollY - start - (rest / 100) * V, 0, (hand / 100) * V);
      if (Math.abs(e - last) < 0.0015) return;
      last = e;
      if (m === "wide") {
        /* out: the principles sink a little as they fade */
        const o = smooth(ramp(e, 0, 0.45));
        content.style.opacity = o > 0 ? (1 - o).toFixed(3) : "";
        content.style.transform = o > 0 ? `translateY(${(o * o * 48).toFixed(1)}px)` : "";
      } else {
        /* out: the principles on screen leave one after another, top first, each rising and
           shrinking a little from its top edge so it tucks in under the one above — the homepage's
           stack folding away. Card j over [0.07j, 0.32 + 0.07j] of the hold. */
        let j = 0;
        const rise = Math.round(Math.min(120, Math.max(72, V * 0.105)));
        cards.forEach((li) => {
          const r = li.getBoundingClientRect();
          const onScreen = r.bottom > 0 && r.top < V;
          const p = smooth(ramp(e, (onScreen ? j : 0) * 0.07, 0.32 + (onScreen ? j : 0) * 0.07));
          if (onScreen) j++;
          li.style.transformOrigin = p ? "50% 0" : "";
          li.style.transform = p ? `translateY(${(-rise * p).toFixed(1)}px) scale(${(1 - 0.08 * p).toFixed(4)})` : "";
          li.style.opacity = p ? (1 - p).toFixed(3) : "";
        });
      }
      /* phones: the dark and the capabilities start a beat earlier, right as the last principle
         goes, so there's no blank white moment between them (the homepage's offset) */
      const o = m === "phone" ? 0.15 : 0;
      /* ground: the held screen darkens white → night (as the homepage's, over the second half) */
      const g = smooth(ramp(e, 0.5 - o, 0.95 - o));
      const c = Math.round(255 + (14 - 255) * g);
      main.style.backgroundColor = g > 0 ? `rgb(${c},${c},${c})` : ""; // HeaderTheme reads this for the header's ink
      /* in: the capabilities, already in place on that screen (desktop) or rising into it (phones),
         fade in there with the darkening, exactly as on the homepage: title first, then each row,
         its items a beat apart, each item's divider drawing in right → left before its text */
      set(title, smooth(ramp(e, 0.45 - o, 0.8 - o)));
      rows.forEach((r, i) => {
        const base = 0.5 - o + i * 0.08;
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
    phone.addEventListener("change", measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", measure);
      phone.removeEventListener("change", measure);
      cancelAnimationFrame(raf);
      clear();
    };
  }, []);
  return null;
}
