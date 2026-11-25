"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Children marked with the `.rv*` classes (globals.css) animate in when
 * they enter the viewport. Content is fully visible without JS and with reduced motion: the hidden
 * state is only applied after this component mounts.
 *
 * On wide screens the whole group reveals together and `--i` staggers the children (left to
 * right). Below `perItemBelow` px — where the children stack — each child reveals on its own as
 * it is scrolled to.
 *
 * `repeat` replays the reveal every time: once a target has scrolled completely out of view (in
 * either direction) it is reset, so it animates in again on the way back.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  perItemBelow = 0,
  repeat = false,
  ...rest
}: {
  as?: "div" | "section" | "ol" | "ul";
  children: ReactNode;
  className?: string;
  perItemBelow?: number;
  repeat?: boolean;
} & Record<`aria-${string}`, string | undefined>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const perItem = window.innerWidth < perItemBelow;
    const targets = (perItem ? (Array.from(root.children) as HTMLElement[]) : [root]).filter((el) => el.offsetParent !== null);

    // Enter: fires a little inside the bottom edge so the motion is actually seen.
    const enter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          if (!repeat) enter.unobserve(entry.target);
        }
        if (repeat) return;
        // One-shot mode: a fast jump can skip past items without intersecting them — show those too.
        for (const el of targets) {
          if (el.dataset.reveal === "pending" && el.getBoundingClientRect().bottom < 0) {
            el.dataset.reveal = "in";
            enter.unobserve(el);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -14% 0px" },
    );

    // Exit (repeat mode): reset only once the target is entirely off screen, so nothing visible blinks out.
    const exit = repeat
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) (entry.target as HTMLElement).dataset.reveal = "pending";
          }
        })
      : null;

    for (const el of targets) {
      if (perItem) el.style.setProperty("--i", "0");
      const onScreenAtLoad = el.getBoundingClientRect().top < window.innerHeight * 0.86;
      // Already on screen (or above it) at load: leave it visible rather than hide and re-show.
      if (onScreenAtLoad && !repeat) continue;
      if (!onScreenAtLoad) el.dataset.reveal = "pending";
      enter.observe(el);
      exit?.observe(el);
    }
    return () => {
      enter.disconnect();
      exit?.disconnect();
    };
  }, [perItemBelow, repeat]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className} {...rest}>
      {children}
    </Comp>
  );
}
