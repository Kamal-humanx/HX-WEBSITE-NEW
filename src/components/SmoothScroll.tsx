"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

type LenisHandle = { scrollTo(y: number, o: { immediate?: boolean; force?: boolean }): void };

/**
 * Site-wide smooth scrolling (the gliding, inertial wheel scroll of 14islands.com), via Lenis.
 * The page still scrolls natively underneath — sticky sections, scroll events and the Careers
 * scenes keep working — Lenis only eases the wheel/trackpad input. Touch keeps the device's own
 * native scrolling, and reduced motion turns it off entirely.
 *
 * Page changes: following a link to another page always opens it at the top (Lenis lives across
 * pages and remembered the old position, and Next only scrolls when the new page's top is off
 * screen). Back / Forward are left alone, so the browser returns you to where you were.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const first = useRef(true);
  const historyNav = useRef(false);

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

  /* Back / Forward: remember it, so the next page change keeps the browser's restored position */
  useEffect(() => {
    const onPop = () => (historyNav.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (historyNav.current) {
      historyNav.current = false;
      return;
    }
    if (window.location.hash) return; // a link to a section of the page goes there instead
    const toTop = () => {
      (window as unknown as { lenis?: LenisHandle }).lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    toTop();
    /* once more after the new page has painted, in case anything nudged it */
    const raf = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
