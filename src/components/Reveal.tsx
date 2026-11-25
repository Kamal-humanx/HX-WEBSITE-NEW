"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Children marked with the `.rv*` classes (globals.css) animate in once
 * they enter the viewport. Content is fully visible without JS and with reduced motion: the hidden
 * state is only applied after this component mounts.
 *
 * On wide screens the whole group reveals together and `--i` staggers the children (left to
 * right). Below `perItemBelow` px — where the children stack — each child reveals on its own as
 * it is scrolled to.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  perItemBelow = 0,
  ...rest
}: {
  as?: "div" | "section" | "ol" | "ul";
  children: ReactNode;
  className?: string;
  perItemBelow?: number;
} & Record<`aria-${string}`, string | undefined>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const perItem = window.innerWidth < perItemBelow;
    const targets = perItem ? (Array.from(root.children) as HTMLElement[]) : [root];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal anything already scrolled past, so nothing can be left hidden.
          if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(entry.target);
        }
        // A fast jump can skip past items without ever intersecting them — show those too.
        for (const el of targets) {
          if (el.dataset.reveal === "pending" && el.getBoundingClientRect().bottom < 0) {
            el.dataset.reveal = "in";
            io.unobserve(el);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -14% 0px" },
    );

    for (const el of targets) {
      // Already on screen (or above it) at load: leave it visible rather than hide and re-show.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.86) continue;
      if (perItem) el.style.setProperty("--i", "0");
      el.dataset.reveal = "pending";
      io.observe(el);
    }
    return () => io.disconnect();
  }, [perItemBelow]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className} {...rest}>
      {children}
    </Comp>
  );
}
