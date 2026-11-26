"use client";

import { useEffect } from "react";
import { lineBands } from "@/components/careers/ref/reveal";

/**
 * About first fold: the homepage hero's reveal family, tuned softer — each line is drawn in by a wide,
 * feathered edge (about a letter's width, so it reads as a soft wash rather than a wipe), on a gentle
 * sine ease, while the block settles up a few pixels. Headline first, then the intro just after it.
 * The pieces are marked data-seq, so they wait unseen until masked (globals.css): no flash on load.
 * Reduced motion / no script = static text.
 */

type Band = ReturnType<typeof lineBands>[number];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
/* gentle sine in-out: no snap at the start, a long, soft landing */
const ease = (t: number) => (1 - Math.cos(Math.PI * clamp(t))) / 2;

/* timeline, ms from start */
const T = { start: 200, line: 1500, lineGap: 320, introAt: 900, introGap: 220, rise: 1600 };

const PROPS = ["mask-image", "mask-size", "mask-position", "mask-repeat"];
const set = (el: HTMLElement, k: string, v: string) => {
  el.style.setProperty(k, v);
  el.style.setProperty("-webkit-" + k, v);
};
const unmask = (el: HTMLElement) => {
  PROPS.forEach((k) => (el.style.removeProperty(k), el.style.removeProperty("-webkit-" + k)));
  delete el.dataset.masked;
};
/* each line's mask grows from its left edge; the trailing `feather` px fade from ink to clear */
const mask = (el: HTMLElement, bands: Band[], reveal: number[], feather: number) => {
  if (!el.dataset.masked) {
    set(el, "mask-image", bands.map(() => `linear-gradient(90deg,#000 calc(100% - ${feather}px),transparent)`).join(","));
    set(el, "mask-position", bands.map((b) => `${(b.x - feather * 0.2).toFixed(1)}px ${b.y.toFixed(1)}px`).join(","));
    set(el, "mask-repeat", "no-repeat");
    el.dataset.masked = "1";
  }
  set(el, "mask-size", bands.map((b, i) => `${((b.w + feather * 1.2) * reveal[i]).toFixed(1)}px ${b.h.toFixed(1)}px`).join(","));
};

export function AboutReveal() {
  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('[data-seq="about-title"]');
    const p = document.querySelector<HTMLElement>('[data-seq="about-intro"]');
    const els = [h1, p].filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("seq-done"));
      return;
    }

    let raf = 0;
    let alive = true;
    let cleanup = () => {};
    const anims: Animation[] = [];

    const run = () => {
      if (!alive) return;
      let bands = els.map((el) => lineBands(el));
      const feather = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize) * 1.1;
      els.forEach((el, i) => mask(el, bands[i], bands[i].map(() => 0), feather(el)));
      els.forEach((el) => el.classList.add("seq-on"));

      const timing = els.map((el) => (el === h1 ? { at: T.start, gap: T.lineGap } : { at: T.introAt, gap: T.introGap }));
      /* the block settles up a touch as it is drawn in */
      els.forEach((el, i) =>
        anims.push(
          el.animate([{ transform: "translateY(14px)" }, { transform: "none" }], {
            duration: T.rise,
            delay: timing[i].at,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          }),
        ),
      );

      const onResize = () => {
        els.forEach((el) => unmask(el));
        bands = els.map((el) => lineBands(el));
      };
      window.addEventListener("resize", onResize);
      cleanup = () => window.removeEventListener("resize", onResize);

      const done = Math.max(...els.map((_, i) => timing[i].at + timing[i].gap * (bands[i].length - 1) + T.line));
      let t0 = 0;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = now - t0;
        els.forEach((el, i) =>
          mask(el, bands[i], bands[i].map((_, j) => ease(ramp(t, timing[i].at + j * timing[i].gap, timing[i].at + j * timing[i].gap + T.line))), feather(el)),
        );
        if (t > done + 50) {
          /* settled: hand everything back as plain text */
          els.forEach((el) => {
            unmask(el);
            el.classList.add("seq-done");
          });
          cleanup();
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    /* measure the lines only once the fonts are in, so the bands sit on the final layout */
    (document.fonts?.ready ?? Promise.resolve()).then(run);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup();
      anims.forEach((a) => a.cancel());
      els.forEach((el) => {
        unmask(el);
        el.classList.remove("seq-on");
        el.classList.add("seq-done");
      });
    };
  }, []);

  return null;
}
