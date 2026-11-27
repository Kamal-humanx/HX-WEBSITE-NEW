"use client";

import { useEffect } from "react";

/**
 * Animates the FAQ's <details> (contact page): the answer unfolds — its box growing from nothing
 * while the text fades in and settles up a touch — and folds away the same way on close. The
 * native <details> still does the work (no script: it just snaps), the plus turns to a minus by
 * CSS as before. Reduced motion: native behaviour.
 * Expects each <details> to hold a `.faq-body` wrapper around the answer.
 */
const EASE = "cubic-bezier(0.2, 0, 0, 1)";

export function FaqAccordion({ root }: { root: string }) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = document.querySelector<HTMLElement>(root);
    if (!list) return;
    const busy = new WeakSet<HTMLDetailsElement>();
    const onClick = (e: Event) => {
      const summary = (e.target as HTMLElement).closest("summary");
      if (!summary || !list.contains(summary)) return;
      const d = summary.parentElement as HTMLDetailsElement | null;
      const body = d?.querySelector<HTMLElement>(".faq-body");
      if (!d || !body || busy.has(d)) return;
      e.preventDefault();
      busy.add(d);
      body.style.overflow = "hidden";
      const inner = body.firstElementChild as HTMLElement | null;
      if (d.open) {
        /* fold away: the text fades out as the box closes */
        const h = body.offsetHeight;
        const a = body.animate([{ height: `${h}px` }, { height: "0px" }], { duration: 320, easing: EASE, fill: "forwards" });
        inner?.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 200, easing: "ease-in", fill: "forwards" });
        a.onfinish = () => {
          d.open = false;
          a.cancel();
          inner?.getAnimations().forEach((x) => x.cancel());
          body.style.overflow = "";
          busy.delete(d);
        };
      } else {
        /* unfold: the box grows to its size while the text rises in, a beat behind */
        d.open = true;
        const h = body.scrollHeight;
        const a = body.animate([{ height: "0px" }, { height: `${h}px` }], { duration: 420, easing: EASE, fill: "forwards" });
        inner?.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: 90, easing: EASE, fill: "backwards" });
        a.onfinish = () => {
          a.cancel();
          body.style.overflow = "";
          busy.delete(d);
        };
      }
    };
    list.addEventListener("click", onClick);
    return () => list.removeEventListener("click", onClick);
  }, [root]);
  return null;
}
