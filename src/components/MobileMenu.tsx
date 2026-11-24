"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NAV } from "@/lib/site";
import { Logo } from "./Logo";

/**
 * Mobile / tablet navigation drawer (< 1024px). No mobile frame exists in Figma, so it reuses the
 * dark footer language (#0e0e0e, Uncut Sans display type, orange accent).
 * A11y: aria-expanded/aria-controls on the trigger, role="dialog" + aria-modal, focus trap,
 * Esc to close, focus returns to the trigger, background scroll locked.
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
            <div className="container-page flex h-[var(--header-h)] items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="tap inline-flex items-center" aria-label="HumanX — home">
                <Logo className="h-6 w-auto" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="tap inline-flex items-center justify-center rounded-full"
              >
                <span className="sr-only">Close menu</span>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M7 7l14 14M21 7L7 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-between overflow-y-auto pb-8 pt-6">
              <ul className="flex flex-col gap-1">
                {NAV.map((item) => {
                  const active = item.href === current;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-14 items-center text-[clamp(2.25rem,10vw,3.5rem)] leading-tight tracking-[-0.02em] ${
                          active ? "text-accent" : "text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-10 inline-flex h-12 w-max items-center justify-center rounded-full border border-white px-7 text-base font-semibold"
              >
                Start a Project
              </Link>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
