"use client";

import { useEffect, useRef } from "react";
import { lineBands, maskLines, resetMask } from "@/components/careers/ref/reveal";

/**
 * Homepage hero (Figma 5376:1843 heading, 5376:1847 intro) and the client logo strip below it,
 * revealed in sequence — the Careers reveal language (a soft, feathered edge drawing each line in):
 *  1. Headline, line by line.
 *  2. "Human" arrives as machine glyphs in the mono face as the edge reaches it, then resolves letter
 *     by letter into the human typeface.
 *  3. Intro, line by line, just after the headline.
 *  4. Client logos — a single opacity fade, all logos at once (still moving), once the hero text is done.
 * Hidden start state is CSS-only (scripting on + no reduced motion), so nothing flashes before
 * hydration. Reduced motion / no script = static.
 */

const titleCase = (s: string) => s.replace(/(^|\s)(\S)/g, (_, a: string, b: string) => a + b.toUpperCase());
const GLYPHS = "#%&*+=<>/\\01[]{}?";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

/* timeline, ms from start */
const T = {
  start: 750, // after the hero image has opened (globals.css .hero-media, 0.95s)
  line: 1000, // one line's sweep
  lineGap: 260, // second line starts this much later
  introAt: 1400,
  introGap: 180,
  resolveGap: 110, // between "Human" letters resolving
};

export function HeroIntro({ line1, line2, intro }: { line1: string; line2: string; intro: string }) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  const l1 = titleCase(line1.trim());
  const l2 = titleCase(line2.trim());
  const cut = l2.lastIndexOf(" ");
  const before = l2.slice(0, cut + 1);
  const human = l2.slice(cut + 1);

  useEffect(() => {
    const h1 = h1Ref.current!;
    const p = introRef.current!;
    const strip = document.querySelector<HTMLElement>('[data-seq="clients"]');
    const els = [h1, p, strip].filter(Boolean) as HTMLElement[];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let alive = true;
    const timers: number[] = [];
    const humanEls = Array.from(h1.querySelectorAll<HTMLElement>(".hh-ch"));
    const finals = humanEls.map((el) => el.textContent ?? "");

    const run = () => {
      if (!alive) return;
      /* "Human" starts as the machine: lock each letter to its real (untransformed) width first */
      humanEls.forEach((el) => {
        el.style.width = `${el.offsetWidth}px`;
        el.classList.add("hh-machine");
        el.textContent = rnd();
      });
      const resolved = humanEls.map(() => false);

      let h1Bands = lineBands(h1);
      let pBands = lineBands(p);

      maskLines(h1, h1Bands, h1Bands.map(() => 0));
      maskLines(p, pBands, pBands.map(() => 0));
      [h1, p].forEach((el) => el.classList.add("seq-on"));

      const onResize = () => {
        [h1, p].forEach((el) => resetMask(el));
        h1Bands = lineBands(h1);
        pBands = lineBands(p);
      };
      window.addEventListener("resize", onResize);

      const lineEnd = T.start + T.lineGap * (h1Bands.length - 1) + T.line;
      const resolveAt = lineEnd - 150;
      const heroDone = Math.max(lineEnd, T.introAt + T.introGap * (pBands.length - 1) + T.line);

      let t0 = 0, lastSwap = 0, logosIn = false;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = now - t0;

        /* 1 + 3: headline and intro, line by line */
        maskLines(h1, h1Bands, h1Bands.map((_, j) => smooth(ramp(t, T.start + j * T.lineGap, T.start + j * T.lineGap + T.line))));
        maskLines(p, pBands, pBands.map((_, j) => smooth(ramp(t, T.introAt + j * T.introGap, T.introAt + j * T.introGap + T.line))));

        /* 2: "Human" cycles as the machine, then resolves letter by letter */
        if (now - lastSwap > 70) {
          lastSwap = now;
          humanEls.forEach((el, i) => !resolved[i] && (el.textContent = rnd()));
        }
        humanEls.forEach((el, i) => {
          if (!resolved[i] && t >= resolveAt + i * T.resolveGap) {
            resolved[i] = true;
            el.textContent = finals[i];
            el.classList.remove("hh-machine");
            el.classList.add("hh-resolved");
          }
        });

        /* 4: logos — one plain fade, all at once (CSS), as soon as the hero text is done */
        if (!logosIn && t >= heroDone) {
          logosIn = true;
          strip?.classList.add("seq-done");
        }

        if (resolved.every(Boolean) && t > heroDone + 700) {
          /* all settled: hand everything back as plain text */
          humanEls.forEach((el) => (el.style.width = ""));
          els.forEach((el) => el.classList.add("seq-done"));
          window.removeEventListener("resize", onResize);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => window.removeEventListener("resize", onResize);
    };

    let cleanup = () => {};
    /* measure the lines only once the fonts are in, so the bands sit on the final layout */
    (document.fonts?.ready ?? Promise.resolve()).then(run);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanup();
      humanEls.forEach((el, i) => {
        el.textContent = finals[i];
        el.style.width = "";
        el.classList.remove("hh-machine", "hh-resolved");
      });
      els.forEach((el) => {
        resetMask(el);
        el.classList.remove("seq-on");
        el.classList.add("seq-done");
      });
    };
  }, []);

  return (
    <>
      <h1
        ref={h1Ref}
        id="hero-title"
        data-seq="hero-title"
        aria-label={`${l1} ${l2}`}
        className="hh relative text-h1 font-normal leading-[1.15] tracking-[-0.04em] text-ink lg:-mt-[0.15em]"
      >
        <span aria-hidden="true">
          {l1}
          <br />
          {before}
          <span className="whitespace-nowrap">
            {Array.from(human).map((ch, i) => (
              <span key={i} className="hh-ch">
                {ch}
              </span>
            ))}
          </span>
        </span>
      </h1>
      <p
        ref={introRef}
        data-seq="hero-intro"
        className="max-w-[465px] font-mono text-base font-medium leading-[1.4] tracking-[-0.02em] text-ink-mono lg:pt-[21px] lg:text-right"
      >
        {intro}
      </p>
    </>
  );
}
