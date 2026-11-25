"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Site-wide smooth scrolling (the gliding, inertial wheel scroll of 14islands.com), via Lenis.
 * The page still scrolls natively underneath — sticky sections, scroll events and the Careers
 * scenes keep working — Lenis only eases the wheel/trackpad input. Touch keeps the device's own
 * native scrolling, and reduced motion turns it off entirely.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.075, // how much of the remaining distance each frame covers: lower = silkier, longer glide
      wheelMultiplier: 1,
      smoothWheel: true,
      anchors: true, // in-page links (#main etc.) glide too
      autoRaf: true,
    });
    /* handle for code that needs to jump the scroll (and for testing): window.lenis.scrollTo(y, { immediate: true }) */
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    return () => {
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);
  return null;
}
