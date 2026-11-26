"use client";

import { useEffect } from "react";
import { lineBands, maskLines, resetMask } from "@/components/careers/ref/reveal";

/**
 * About first fold: the same reveal as the homepage hero (HeroIntro) — a soft, feathered edge draws
 * the headline in line by line, then the intro, just after it. The pieces are marked data-seq, so they
 * wait unseen until this script has masked them (globals.css), with no flash on load.
 * Reduced motion / no script = static text.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

/* timeline, ms from start (as the homepage, without its wait for the hero image) */
const T = { start: 250, line: 1000, lineGap: 260, introAt: 750, introGap: 180 };

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

    const run = () => {
      if (!alive) return;
      let bands = els.map((el) => lineBands(el));
      els.forEach((el, i) => maskLines(el, bands[i], bands[i].map(() => 0)));
      els.forEach((el) => el.classList.add("seq-on"));

      const onResize = () => {
        els.forEach((el) => resetMask(el));
        bands = els.map((el) => lineBands(el));
      };
      window.addEventListener("resize", onResize);
      cleanup = () => window.removeEventListener("resize", onResize);

      /* headline lines, then the intro's */
      const timing = els.map((el) => (el === h1 ? { at: T.start, gap: T.lineGap } : { at: T.introAt, gap: T.introGap }));
      const done = Math.max(...els.map((_, i) => timing[i].at + timing[i].gap * (bands[i].length - 1) + T.line));

      let t0 = 0;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = now - t0;
        els.forEach((el, i) =>
          maskLines(el, bands[i], bands[i].map((_, j) => smooth(ramp(t, timing[i].at + j * timing[i].gap, timing[i].at + j * timing[i].gap + T.line)))),
        );
        if (t > done + 100) {
          /* settled: hand everything back as plain text */
          els.forEach((el) => {
            resetMask(el);
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
      els.forEach((el) => {
        resetMask(el);
        el.classList.remove("seq-on");
        el.classList.add("seq-done");
      });
    };
  }, []);

  return null;
}
