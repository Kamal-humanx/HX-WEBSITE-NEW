"use client";

import { useEffect, useState } from "react";

/**
 * Progressive-enhancement filter: every item is server-rendered (crawlable); this only toggles
 * `hidden` on elements inside `targetId` whose `data-tags` don't include the chosen filter.
 * Filters with no matching items are disabled rather than showing an empty state (no copy for one in Figma).
 */
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

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-tags]").forEach((el) => {
      const tags = (el.dataset.tags ?? "").split("|");
      el.hidden = active !== filters[0] && !tags.includes(active);
    });
  }, [active, filters, targetId]);

  const base =
    variant === "dark"
      ? "px-5 py-[11px] text-sm"
      : "px-4 py-[9px] text-xs leading-[1.35]";

  return (
    <div role="group" aria-label={label} className="no-scrollbar flex min-w-0 gap-x-3 overflow-x-auto py-1 max-sm:-mx-[var(--gutter)] max-sm:px-[var(--gutter)] lg:flex-wrap lg:gap-y-2 lg:overflow-visible">
      {filters.map((f) => {
        const isActive = f === active;
        const enabled = f === filters[0] || available.includes(f);
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
