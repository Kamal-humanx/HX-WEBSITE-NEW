"use client";

import { useEffect } from "react";

/**
 * About first fold, in order:
 *  1. Headline: word by word, each word rising a touch while it clears from a soft blur.
 *  2. Intro: the same, quicker, starting while the headline is still arriving.
 *  3. The studio photos: once the text has landed, the slides on screen arrive left to right,
 *     each rising and settling from a hair larger, while the carousel keeps drifting.
 * The pieces are marked data-seq, so they wait unseen until this script starts them (globals.css):
 * no flash on load. Reduced motion / no script = everything simply shown.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/* timeline, ms */
const T = {
  title: 150, // first headline word
  titleGap: 75, // between headline words
  titleDur: 1100,
  intro: 650, // first intro word
  introGap: 22,
  introDur: 900,
  mediaAfter: 250, // photos start this long after the last headline word lands… (see below)
  mediaGap: 160, // …one slide after another, left to right
  mediaDur: 1300,
};

export function AboutReveal() {
  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('[data-seq="about-title"]');
    const p = document.querySelector<HTMLElement>('[data-seq="about-intro"]');
    const media = document.querySelector<HTMLElement>('[data-seq="about-media"]');
    const all = [h1, p, media].filter(Boolean) as HTMLElement[];
    if (!all.length) return;
    const show = () => all.forEach((el) => el.classList.add("seq-done"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    const anims: Animation[] = [];
    let alive = true;

    const run = () => {
      if (!alive) return;
      const words = (el: HTMLElement | null) => (el ? Array.from(el.querySelectorAll<HTMLElement>("[data-w]")) : []);
      const tw = words(h1);
      const iw = words(p);

      /* 1–2: words rise into place out of a soft blur */
      const wordIn = (w: HTMLElement, delay: number, dur: number, rise: string, blur: number) =>
        anims.push(
          w.animate(
            [
              { opacity: 0, transform: `translateY(${rise})`, filter: `blur(${blur}px)` },
              { opacity: 1, transform: "none", filter: "blur(0px)" },
            ],
            { duration: dur, delay, easing: EASE, fill: "backwards" },
          ),
        );
      tw.forEach((w, i) => wordIn(w, T.title + i * T.titleGap, T.titleDur, "0.42em", 10));
      iw.forEach((w, i) => wordIn(w, T.intro + i * T.introGap, T.introDur, "0.6em", 6));
      [h1, p].forEach((el) => el?.classList.add("seq-on"));

      /* 3: then the photos on screen, left to right */
      const textLanded = T.title + Math.max(0, tw.length - 1) * T.titleGap + T.titleDur * 0.55;
      if (media) {
        const vw = window.innerWidth;
        const slides = Array.from(media.querySelectorAll<HTMLElement>("li"))
          .map((li) => ({ li, r: li.getBoundingClientRect() }))
          .filter(({ r }) => r.right > 0 && r.left < vw)
          .sort((a, b) => a.r.left - b.r.left);
        slides.forEach(({ li }, i) =>
          anims.push(
            li.animate(
              [
                { opacity: 0, transform: "translateY(48px) scale(1.03)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: T.mediaDur, delay: textLanded + T.mediaAfter + i * T.mediaGap, easing: EASE, fill: "backwards" },
            ),
          ),
        );
        media.classList.add("seq-on");
      }

      /* settled: drop the finished animations, everything stays as plain content */
      Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {
        if (!alive) return;
        anims.forEach((a) => a.cancel());
        all.forEach((el) => {
          el.classList.remove("seq-on");
          el.classList.add("seq-done");
        });
      });
    };

    /* start once the fonts are in, so words don't shift mid-flight */
    (document.fonts?.ready ?? Promise.resolve()).then(run);

    return () => {
      alive = false;
      anims.forEach((a) => a.cancel());
      show();
    };
  }, []);

  return null;
}
