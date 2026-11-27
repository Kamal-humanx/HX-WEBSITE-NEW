"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NAV } from "@/lib/site";
import { Logo } from "./Logo";

/**
 * Mobile / tablet navigation (< 1024px) — Figma "HX mobile navbar" 5654:13717 (393 × 852, #0e0e0e):
 * logo + a 40px round close button (#171717, soft inner light) in the header's own row, so nothing
 * jumps when it opens; the pages centred on the screen in Chivo Mono 32 / 91% on a 70px pitch —
 * current page Bold, white, underlined, the rest Regular #7b7878; and a full-width 49px pill at the
 * foot (20px from the sides, 24px from the bottom; #0e0e0e, a 1px rim that lightens toward the
 * bottom, inner glow) reading "Get in Touch" (the design's Contact item / "Start a Project" were
 * merged into it). A11y: aria-expanded/aria-controls on the trigger, role="dialog" + aria-modal,
 * focus trap, Esc to close, focus returns to the trigger, background scroll locked.
 */
export function MobileMenu({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="tap inline-flex items-center justify-center rounded-full text-current lg:hidden"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Open menu</span>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M4 9h20M4 19h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id={id}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-night text-white lg:hidden"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* the header's own row (same box and padding as Header.tsx), so logo and button stay put */}
            <div className="flex h-[var(--header-h)] w-full shrink-0 items-center justify-between pl-[max(clamp(16px,1.615vw,31px),env(safe-area-inset-left))] pr-[max(clamp(16px,1.771vw,34px),env(safe-area-inset-right))]">
              <Link href="/" onClick={() => setOpen(false)} className="tap -ml-1 inline-flex translate-y-[1.08px] items-center rounded p-1" aria-label="HumanX, home">
                <Logo className="h-auto w-[118.5px]" />
              </Link>
              <button type="button" onClick={close} className="tap inline-flex items-center justify-center rounded-full">
                <span className="sr-only">Close menu</span>
                {/* 5654:13717 "Tab": 40px circle #171717, inner light (-8, -14) 23px / -17 spread, white 13% */}
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-night-3 shadow-[inset_-8px_-14px_23px_-17px_rgba(255,255,255,0.13)]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </div>
            <nav aria-label="Mobile" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {/* the pages, centred in the space between the header row and the pill */}
              <ul className="my-auto flex flex-col items-center gap-[26px] py-6">
                {NAV.map((item) => {
                  const active = item.href === current;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center font-mono text-[32px] leading-[0.91] tracking-normal transition-colors ${
                          active
                            ? "font-bold text-white underline decoration-[2px] underline-offset-[7px]"
                            : "font-normal text-[#7b7878] hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="shrink-0 px-[max(20px,env(safe-area-inset-left))] pb-6">
                <Link href="/contact" onClick={() => setOpen(false)} className="menu-cta">
                  Get in Touch
                </Link>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
