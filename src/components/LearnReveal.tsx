"use client";

import { useEffect } from "react";
import { lineBands, maskLines, resetMask, type Band } from "@/components/careers/ref/reveal";

/**
 * Build-in for "We're constantly learning in public" (homepage), scrubbed by the scroll like the
 * capabilities: the heading is drawn in line by line (Careers feathered edge); each card, staggered
 * left to right, unmasks its image upward from the bottom edge while the picture settles from a
 * slight zoom, then its date row, text and link rise in one after another. Each card is complete by
 * the time its top reaches 55% of the screen. Reduced motion: shown plainly.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

export function LearnReveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sec = document.querySelector<HTMLElement>('section[aria-labelledby="learning-title"]');
    if (!sec) return;
    const title = sec.querySelector<HTMLElement>("h2");
    const cards = Array.from(sec.querySelectorAll<HTMLElement>("article")).map((a) => ({
      a,
      img: a.querySelector<HTMLElement>("img"),
      /* the image sits in a clipping frame (.post-media) so its zoom never spills past the card */
      rest: Array.from(a.children).filter((c) => c.tagName !== "IMG" && !c.classList.contains("post-media") && !c.hasAttribute("data-stretch")) as HTMLElement[],
    }));
    let bands: Band[] = title ? lineBands(title) : [];
    let raf = 0;

    const paint = () => {
      raf = 0;
      const V = window.innerHeight;
      /* slower than the first version: each piece runs over ~60% of a screen of scroll */
      if (title && bands.length) {
        const p = ramp(V * 0.98 - title.getBoundingClientRect().top, 0, V * 0.6);
        maskLines(title, bands, bands.map((_, j) => smooth(ramp(p, j * 0.22, 0.75 + j * 0.22))));
      }
      cards.forEach(({ a, img, rest }) => {
        /* stagger by column: cards further right start a little later */
        const col = Math.round((a.getBoundingClientRect().left - sec.getBoundingClientRect().left) / Math.max(1, a.offsetWidth));
        const p = ramp(V * 0.98 - a.getBoundingClientRect().top - col * V * 0.07, 0, V * 0.6);
        if (img) {
          const t = smooth(ramp(p, 0, 0.65));
          img.style.clipPath = t < 1 ? `inset(${((1 - t) * 100).toFixed(2)}% 0 0 0)` : "";
          img.style.transform = t < 1 ? `scale(${(1 + 0.08 * (1 - t)).toFixed(4)})` : "";
        }
        rest.forEach((el, j) => {
          const a0 = 0.32 + j * 0.1; // last of the three finishes at 0.97
          const t = smooth(ramp(p, a0, a0 + 0.45));
          el.style.transform = t < 1 ? `translateY(${(28 * (1 - t)).toFixed(1)}px)` : "";
          el.style.opacity = t < 1 ? t.toFixed(3) : "";
        });
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onResize = () => {
      if (title) {
        resetMask(title);
        bands = lineBands(title);
      }
      onScroll();
    };
    (document.fonts?.ready ?? Promise.resolve()).then(onResize);
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      if (title) resetMask(title);
      cards.forEach(({ img, rest }) => {
        if (img) {
          img.style.clipPath = "";
          img.style.transform = "";
        }
        rest.forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
        });
      });
    };
  }, []);
  return null;
}
