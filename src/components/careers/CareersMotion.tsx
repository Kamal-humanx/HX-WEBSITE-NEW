"use client";

import { useEffect } from "react";

/**
 * Careers-only motion gate (the reference's `html.js` class, scoped to the Careers wrapper).
 * The inline script sets `data-motion` on `.hxc` before first paint on a full page load; this effect
 * does the same after a client-side navigation (inline scripts don't run then). Reduced motion =>
 * no attribute => every pinned/scroll effect falls back to a static, fully readable layout.
 */
export const MOTION_GATE_SCRIPT =
  "try{var w=document.currentScript&&document.currentScript.parentElement;if(w&&!matchMedia('(prefers-reduced-motion: reduce)').matches)w.setAttribute('data-motion','')}catch(e){}";

export function CareersMotion() {
  useEffect(() => {
    const wrap = document.querySelector<HTMLElement>(".hxc");
    if (!wrap) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => wrap.toggleAttribute("data-motion", !mq.matches);
    sync();
    mq.addEventListener("change", sync);
    /* Pinned scenes keep easing (and change colour) after the last scroll event; the shared header
       re-reads the ground on scroll, so nudge it every 400ms while on Careers (as the reference
       header does with its own interval). Careers only; stops when you leave the page. */
    const nudge = window.setInterval(() => {
      if (wrap.hasAttribute("data-motion")) window.dispatchEvent(new Event("scroll"));
    }, 400);
    return () => {
      mq.removeEventListener("change", sync);
      clearInterval(nudge);
    };
  }, []);
  return null;
}
