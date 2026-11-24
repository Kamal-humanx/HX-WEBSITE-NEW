"use client";

import { useEffect } from "react";

/**
 * Keeps the sticky header legible: samples the section underneath the header and sets
 * data-theme="light|dark" (Figma shows the light header on white sections and the dark header
 * over dark sections, e.g. About 5376:12223), plus data-scrolled once the page has moved.
 */
export function HeaderTheme() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-header]");
    if (!header) return;
    let raf = 0;

    const bgLuminance = (el: Element | null): number | null => {
      for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor;
        const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
        if (m && (m[4] === undefined || +m[4] > 0.5)) {
          const [r, g, b] = [m[1], m[2], m[3]].map((v) => +v / 255);
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
      }
      return null;
    };

    const update = () => {
      raf = 0;
      const y = header.offsetHeight / 2;
      const x = Math.min(window.innerWidth - 4, 40);
      const under = document.elementsFromPoint(x, y).find((el) => !header.contains(el));
      const lum = bgLuminance(under ?? null);
      header.dataset.theme = lum === null ? "light" : lum < 0.45 ? "dark" : "light";
      header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
