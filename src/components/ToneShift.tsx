"use client";

import { useEffect } from "react";

/**
 * Work → dark hand-over, scrubbed by the scroll (both ways) — the Careers manifesto → gene hand-off
 * (Manifesto.tsx exitOut), with the same values:
 *  - The work section holds (PinCover data-pin="work", 70svh).
 *  - Its cards dip out one after another, top first: each fades while sinking p²·72px, card j over
 *    [0.07j, 0.32 + 0.07j] of the hold.
 *  - Over [0.5, 0.95] of the hold the stage darkens white → night (`--tone`).
 *  - The capabilities are already in their final place on that same screen (the dark block is
 *    pulled up over the hold, `.tone-dark.tone-on`) and fade in there with the darkening — clearing
 *    from a soft blur and settling from a hair smaller, title first, then each row and its items.
 *    Nothing scrolls in. Then the page carries straight on into the capabilities → testimonials swap.
 * Reduced motion: none of this; the sections simply follow one another.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

const set = (el: HTMLElement, transform: string, opacity?: number) => {
  el.style.transform = transform;
  el.style.opacity = opacity === undefined || opacity >= 1 ? "" : opacity.toFixed(3);
};

export function ToneShift() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = document.querySelector<HTMLElement>('[data-pin="work"]');
    const stick = pin?.firstElementChild as HTMLElement | null;
    const main = document.getElementById("main");
    const caps = document.querySelector<HTMLElement>(".tone-dark .swap-a > section");
    if (!pin || !stick || !main || !caps) return;
    let lastTone = -1;

    const cards = Array.from(pin.querySelectorAll<HTMLElement>(".case-list > li"));
    const title = caps.querySelector<HTMLElement>("h2");
    const rows = Array.from(caps.querySelectorAll<HTMLElement>(".group")).map((row) => ({
      row,
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
    sortItems();
    const dark = document.querySelector<HTMLElement>(".tone-dark");
    const stage = document.querySelector<HTMLElement>(".tone-dark .swap-stage");
    /* phones (< 768): the capabilities aren't pulled up onto the held screen (their Figma phone list is
       taller than a phone screen): the dark block follows the work section in the normal flow, on the
       night it has darkened to, and nothing fades in there — the work cards still dip out */
    const phoneMq = matchMedia("(max-width: 767px)");
    const capsEls = () => [title, ...rows.flatMap((r) => [r.h, r.rule, r.label, ...r.items])];
    const showCaps = () => {
      capsEls().forEach((el) => {
        if (!el) return;
        el.style.opacity = el.style.filter = el.style.transform = "";
      });
      rows.forEach((r) =>
        r.items.forEach((li) => {
          li.style.removeProperty("--line");
          const txt = li.querySelector<HTMLElement>(".cap-txt");
          if (txt) txt.style.opacity = "";
        }),
      );
    };
    const applyMode = () => {
      dark?.classList.toggle("tone-on", !phoneMq.matches);
      if (phoneMq.matches) {
        showCaps();
        if (stage) stage.style.pointerEvents = "";
      }
    };
    applyMode();
    let raf = 0;

    /* the "in" look: fades in place — clears from a soft blur and settles from a hair smaller */
    const fadeIn = (el: HTMLElement | null, t: number) => {
      if (!el) return;
      if (t >= 1) {
        el.style.opacity = el.style.filter = el.style.transform = "";
        return;
      }
      el.style.opacity = t.toFixed(3);
      el.style.filter = `blur(${(6 * (1 - t)).toFixed(2)}px)`;
      el.style.transform = `scale(${(0.985 + 0.015 * t).toFixed(4)})`;
    };

    const paint = () => {
      raf = 0;
      const V = window.innerHeight;

      /* hold progress (0 → 1 over the 70svh hold) */
      const h = stick.offsetHeight;
      const e = ramp(-pin.getBoundingClientRect().top - Math.max(0, h - V), 0, V * 0.7);

      /* — out: the cards on screen dip out one after another, top first (Careers' values) — */
      let j = 0;
      cards.forEach((li) => {
        const r = li.getBoundingClientRect();
        const onScreen = r.bottom > 0 && r.top < V;
        const p = smooth(ramp(e, (onScreen ? j : 0) * 0.07, 0.32 + (onScreen ? j : 0) * 0.07));
        if (onScreen) j++;
        set(li, p ? `translateY(${(p * p * 72).toFixed(1)}px)` : "", 1 - p);
      });

      /* — ground: the stage darkens white → night over the second half of the hold — */
      const k = smooth(ramp(e, 0.5, 0.95));
      if (Math.abs(k - lastTone) > 0.0005) {
        lastTone = k;
        const c = Math.round(255 + (14 - 255) * k);
        main.style.setProperty("--tone", `rgb(${c},${c},${c})`);
        window.dispatchEvent(new Event("hx:tone"));
      }

      /* phones: the capabilities follow in the normal flow — nothing fades in on the held screen */
      if (phoneMq.matches) return;

      /* — in: the capabilities are already in place on this same held screen; they fade in there
             with the darkening — title first, then each row, its items a beat apart — all done by
             the end of the hold — */
      fadeIn(title, smooth(ramp(e, 0.45, 0.8)));
      rows.forEach((r, i) => {
        const base = 0.5 + i * 0.08;
        fadeIn(r.h, smooth(ramp(e, base, base + 0.3)));
        fadeIn(r.rule, smooth(ramp(e, base + 0.03, base + 0.33)));
        fadeIn(r.label, smooth(ramp(e, base + 0.04, base + 0.32)));
        /* items, after the reference recording: in visual order (row by row across both columns),
           each item's divider draws in right → left, then its text fades in where it sits */
        r.order.forEach((li, k) => {
          const a = base + 0.02 + k * 0.03;
          li.style.setProperty("--line", smooth(ramp(e, a, a + 0.18)).toFixed(4));
          const txt = li.querySelector<HTMLElement>(".cap-txt");
          const t = smooth(ramp(e, a + 0.06, a + 0.24));
          if (txt) txt.style.opacity = t < 1 ? t.toFixed(3) : "";
        });
      });
      /* the held capabilities take the pointer only once they are in */
      if (stage) stage.style.pointerEvents = e >= 1 ? "auto" : "none";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onResize = () => {
      sortItems();
      onScroll();
    };
    const onMode = () => {
      applyMode();
      sortItems();
      onScroll();
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    phoneMq.addEventListener("change", onMode);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      phoneMq.removeEventListener("change", onMode);
      cancelAnimationFrame(raf);
      main.style.removeProperty("--tone");
      dark?.classList.remove("tone-on");
      if (stage) stage.style.pointerEvents = "";
      [...cards, title, ...rows.flatMap((r) => [r.h, r.rule, r.label, ...r.items])].forEach((el) => {
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = "";
        el.style.filter = "";
      });
      rows.forEach((r) =>
        r.items.forEach((li) => {
          li.style.removeProperty("--line");
          const txt = li.querySelector<HTMLElement>(".cap-txt");
          if (txt) txt.style.opacity = "";
        }),
      );
    };
  }, []);
  return null;
}
