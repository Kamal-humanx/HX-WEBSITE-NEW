"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ContactBlob } from "@/components/ContactBlob";
import { Logo } from "@/components/Logo";
import { CONTACT } from "@/content/contact";

type LenisHandle = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: LenisHandle }).lenis;

/**
 * Thank-you pop-up shown after the contact form is sent. A native <dialog>, so focus is trapped
 * inside it, Esc closes it and the page behind is inert; clicking the dimmed backdrop closes it too.
 * Uses the site's own type, colours, pill button, logo and the contact-page artwork.
 */
export function ThankYouDialog({ open, firstName, onClose }: { open: boolean; firstName: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const T = CONTACT.thanks;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lenis()?.stop(); // hold the smooth-scrolled page still behind the pop-up
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      if (open) lenis()?.start();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="thanks-title"
      aria-describedby="thanks-body"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // the backdrop is the dialog element itself
      }}
      data-lenis-prevent
      className="hx-thanks m-auto w-[min(92vw,620px)] max-w-none overflow-visible rounded-[28px] bg-transparent p-0 text-ink backdrop:bg-night/60 backdrop:backdrop-blur-[6px]"
    >
      <div className="relative overflow-hidden rounded-[28px] bg-white px-[clamp(24px,5vw,48px)] pb-[clamp(28px,5vw,48px)] pt-[clamp(22px,4vw,36px)] shadow-[0_30px_80px_-20px_rgba(14,14,14,0.45)]">
        <div className="flex items-center justify-between">
          <Logo className="h-[26px] w-auto text-ink" />
          <button
            type="button"
            onClick={onClose}
            aria-label={T.close}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ContactBlob className="mx-auto mt-2 w-[min(250px,62%)]" />

        <h2 id="thanks-title" className="mt-2 text-h3-sm font-normal leading-[1.15] tracking-[-0.03em] text-ink">
          {firstName ? `${T.title}, ${firstName}.` : `${T.title}.`}
        </h2>
        <p id="thanks-body" className="mt-4 max-w-[440px] font-mono text-sm font-medium leading-[1.64] tracking-[-0.03em] text-ink-mono">
          {T.body}
        </p>

        <button type="button" onClick={onClose} autoFocus className="btn-pill mt-8 justify-center gap-4 py-2.5 pl-[18px] pr-4 text-sm">
          {T.cta}
          <Image src="/images/icons/arrow-white.svg" alt="" width={8} height={8} />
        </button>
      </div>
    </dialog>
  );
}
