"use client";

import { useEffect } from "react";

/**
 * Touch screens have no hover, so a capability row's lit state (title to orange, its items to plain
 * white — the desktop `group-hover`) never showed under a thumb. This lights the row that is touched
 * (data-touch, globals.css) for as long as the finger is on it and a beat after it lifts, so a tap
 * or a thumb resting on the list reads the same as the pointer does on desktop.
 */
export function CapsTouch() {
  useEffect(() => {
    let lit: HTMLElement | null = null, timer = 0;
    const unlight = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lit?.removeAttribute("data-touch");
        lit = null;
      }, 350);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const row = (e.target as HTMLElement).closest<HTMLElement>(".caps-list .group");
      if (!row) return;
      window.clearTimeout(timer);
      if (lit && lit !== row) lit.removeAttribute("data-touch");
      lit = row;
      row.setAttribute("data-touch", "");
    };
    const onUp = () => {
      if (lit) unlight();
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      window.clearTimeout(timer);
      lit?.removeAttribute("data-touch");
    };
  }, []);
  return null;
}
