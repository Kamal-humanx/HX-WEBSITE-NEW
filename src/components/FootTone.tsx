"use client";

import { useEffect } from "react";

/**
 * Case study pages: as the footer's content comes into view (its top edge inside the screen), the
 * page takes the footer's own night and its text turns white — the theme variables the page paints
 * from are swapped on `main` (globals.css `.case-page[data-foot] > main`) and ease over, so the
 * footer stops reading as a separate dark block. Scrolling back up restores the case's colours.
 * The header's ink follows (its data-theme), since it sits over whichever ground is there.
 */
export function FootTone() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".case-page");
    const footer = document.querySelector<HTMLElement>("footer");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!page || !footer) return;
    const initialTheme = header?.dataset.theme;
    let on = false, raf = 0;
    const paint = () => {
      raf = 0;
      const V = window.innerHeight;
      const top = footer.getBoundingClientRect().top;
      /* on once the footer's top edge is inside the screen; a little hysteresis on the way back, so a
         scroll that rests near the line never flickers */
      const next = on ? top < V * 1.12 : top < V * 0.96;
      if (next === on) return;
      on = next;
      if (on) page.dataset.foot = "on";
      else delete page.dataset.foot;
      if (header) header.dataset.theme = on ? "dark" : initialTheme ?? "light";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      delete page.dataset.foot;
      if (header && initialTheme) header.dataset.theme = initialTheme;
    };
  }, []);
  return null;
}
