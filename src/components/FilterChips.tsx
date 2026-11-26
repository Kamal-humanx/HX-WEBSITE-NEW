"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progressive-enhancement filter: every item is server-rendered (crawlable); this only toggles
 * `hidden` on elements inside `targetId` whose `data-tags` don't include the chosen filter. Each
 * item lists every filter it shows under, the first ("All") included — so the page decides, per
 * filter, which items show (e.g. a project highlighted on top under one filter and in the grid
 * under another).
 * Every filter stays selectable; one with no matching items yet shows the page's empty note.
 * Changing the filter is animated: the current items sink and fade, then the matching set rises back
 * in one after another (reduced motion: instant).
 */
const OUT_MS = 240;
export function FilterChips({
  filters,
  available,
  targetId,
  variant,
  label,
}: {
  filters: string[];
  available: string[];
  targetId: string;
  variant: "dark" | "light";
  label: string;
}) {
  const [active, setActive] = useState(filters[0]);
  const first = useRef(true);

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-tags]"));
    const show = (el: HTMLElement) => (el.dataset.tags ?? "").split("|").includes(active);
    /* a filter with nothing under it yet shows the empty note (#<targetId>-empty) instead of a blank grid */
    const empty = document.getElementById(`${targetId}-empty`);
    const apply = () => {
      items.forEach((el) => {
        el.hidden = !show(el);
        /* items that were hidden at load hold lazy images the browser doesn't always start once they
           appear (half-loaded layered thumbnails): load them now */
        if (!el.hidden) el.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
      });
      if (empty) empty.hidden = items.some((el) => !el.hidden);
    };

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (first.current || calm) {
      first.current = false;
      apply();
      return;
    }
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const leaving = items.filter((el) => !el.hidden);
    leaving.forEach((el) => el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(16px)" }], { duration: OUT_MS, easing: "ease-in", fill: "forwards" }));
    const t = window.setTimeout(() => {
      apply();
      leaving.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      items
        .filter((el) => !el.hidden)
        .forEach((el, i) =>
          el.animate([{ opacity: 0, transform: "translateY(32px)" }, { opacity: 1, transform: "none" }], { duration: 650, delay: i * 70, easing: ease, fill: "backwards" }),
        );
      /* the grid has re-flowed: let scroll-driven reveals re-measure */
      window.dispatchEvent(new Event("scroll"));
    }, OUT_MS);
    return () => window.clearTimeout(t);
  }, [active, filters, targetId]);

  const base =
    variant === "dark"
      ? "px-5 py-[11px] text-sm leading-[19px]" /* Figma pill: 1 + 11 + 19 + 11 + 1 = 43 */
      : "px-4 py-[9px] text-xs leading-[1.35]";

  return (
    <div role="group" aria-label={label} className="no-scrollbar flex min-w-0 gap-x-3 overflow-x-auto py-1 max-sm:-mx-[var(--gutter)] max-sm:px-[var(--gutter)] lg:flex-wrap lg:gap-y-2 lg:overflow-visible">
      {filters.map((f) => {
        const isActive = f === active;
        /* every pill looks and works the same (as in Figma), whether or not it has projects yet */
        const enabled = available.length > 0 || f === filters[0];
        const tone =
          variant === "dark"
            ? isActive
              ? "border-accent-2 bg-[#271d12] font-medium text-accent-2"
              : "border-[#383838] text-gray-2 hover:border-gray-2 hover:text-white"
            : isActive
              ? "border-accent-2 bg-[#fff8ed] font-medium text-accent-ink"
              : "border-[#d4d4d4] text-ink-form hover:border-ink";
        return (
          <button
            key={f}
            type="button"
            aria-pressed={isActive}
            disabled={!enabled}
            onClick={() => setActive(f)}
            className={`relative inline-flex min-h-11 shrink-0 items-center rounded-full border font-mono transition-colors before:absolute before:-inset-y-1 before:inset-x-0 disabled:cursor-not-allowed disabled:opacity-40 ${base} ${tone}`}
            style={{ minHeight: variant === "light" ? 36 : 43 }}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
