"use client";

import { useEffect } from "react";

/**
 * Project detail pages: the site's reveal language, applied as each piece scrolls in.
 *  - [data-rv]        text: rises a little and sharpens out of a soft blur (careers / homepage words)
 *  - [data-rv="media"] images and video: unmask upward from the bottom edge while the picture settles
 *                      from a slight zoom (the homepage learning cards and Work page thumbnails)
 * A piece reveals once its top is 90% of the way down the screen; pieces that arrive together are
 * staggered (--rv-i) in reading order. Positions are read from layout boxes, which the media's
 * starting clip doesn't affect. Hidden start states are CSS-only (scripting on + no reduced motion).
 */
export function CaseReveal() {
  useEffect(() => {
    let pending = Array.from(document.querySelectorAll<HTMLElement>("[data-rv]"));
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-autoplay]"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pending.forEach((el) => el.classList.add("rv-in"));
      /* no autoplay: the poster shows, and the viewer can play it */
      videos.forEach((v) => {
        v.controls = true;
        v.preload = "metadata";
      });
      return;
    }
    /* videos load and play only while near the screen, and pause once well off it */
    const playVideos = () => {
      const vh = window.innerHeight;
      videos.forEach((v) => {
        const r = v.getBoundingClientRect();
        const near = r.bottom > -200 && r.top < vh + 200;
        if (near && v.paused) v.play().catch(() => {});
        else if (!near && !v.paused) v.pause();
      });
    };
    let raf = 0;
    const check = () => {
      raf = 0;
      playVideos();
      const line = window.innerHeight * 0.9;
      const now: { el: HTMLElement; top: number; left: number }[] = [];
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < line && r.bottom > 0) {
          now.push({ el, top: r.top, left: r.left });
          return false;
        }
        /* scrolled past without being seen (a jump down the page): just show it */
        if (r.bottom <= 0) {
          el.classList.add("rv-in");
          return false;
        }
        return true;
      });
      now
        .sort((a, b) => a.top - b.top || a.left - b.left)
        .forEach(({ el }, i) => {
          el.style.setProperty("--rv-i", String(Math.min(i, 8)));
          el.classList.add("rv-in");
        });
      if (!pending.length && !videos.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
