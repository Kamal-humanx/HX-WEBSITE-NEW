import Image from "next/image";
import { FooterTrail } from "@/components/FooterTrail";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { EMAIL_DOMAIN, EMAIL_USER, FOOTER_COPY, SOCIAL } from "@/lib/site";

/**
 * Figma: footer frame 5376:2925 (1920×767, #0e0e0e) — shared by every page.
 * Manifesto (24px), Let’s talk + email, socials, copyright, wordmark + glow (the "Ask AI for
 * Summary" row and the extra footer nav list have been removed, as neither is in Figma).
 * The email is rendered by ObfuscatedEmail so the address never appears as plain text in the HTML.
 *
 * Phones / tablets (< 1024, the max-lg: classes) — Figma "HXmobile-footer" 5654:10931 (393 × 852):
 * one column, 21px sides, bottom-aligned in a screen-tall footer: manifesto 16/160% → 106 → Let’s
 * talk + email (Chivo Mono Medium 16) → 129 → full-width wordmark → 24 → socials (Chivo Mono 12,
 * no dots) → 16 → hairline (white 30%) → 16 → copyright (Chivo Mono 12 / 139% / -1%, two lines).
 * Desktop is unchanged.
 */
/** variant "careers": Careers page only — marks the footer (data-hxc-footer) so the Openings section can
 *  wash down to its dark as it approaches; the footer itself is the same size as everywhere else (it
 *  used to fill the screen, Nov 2026). */
export function Footer({ variant }: { variant?: "careers" } = {}) {
  const [legal, rights] = FOOTER_COPY.copyright.split(" All Rights Reserved");
  return (
    <footer
      className="relative isolate overflow-hidden bg-night text-white"
      data-hxc-footer={variant === "careers" ? "" : undefined}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* cursor trail of HumanX X marks (Figma 5654:9985) — above the glow, beneath the content */}
      <FooterTrail />

      {/* Glow — Ellipse 1801. On phones and tablets it sits lower than on desktop: otherwise its
          near-white core lands behind the white copyright line and the text disappears. */}
      <Image
        src="/images/brand/footer-glow.svg"
        alt=""
        width={2451}
        height={1366}
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 max-w-none select-none max-md:hidden md:bottom-[-340px] md:left-[max(-30%,-577px)] md:w-[max(1100px,127.7%)] lg:bottom-[min(-160px,-33.9vw)] 3xl:left-[calc(50%-1537px)] 3xl:w-[2451px]"
      />
      {/* phones: Figma "HXmobile-footer" 5654:10931's own glow (Ellipse 1801 — a freeform shape, not an
          ellipse, so its edge runs diagonally), exported as rendered in the 393 × 852 frame: the bottom
          440px, flush with the frame's left and bottom edges; scaled with the screen's width */}
      <Image
        src="/images/brand/footer-glow-mobile.webp"
        alt=""
        aria-hidden="true"
        width={524}
        height={587}
        sizes="100vw"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-auto w-full max-w-none select-none md:hidden"
      />

      <div className="container-page relative grid min-h-[clamp(620px,40vw,767px)] grid-cols-1 content-between gap-12 pb-6 pt-[clamp(40px,3.2vw,61px)] max-lg:flex max-lg:min-h-[min(100svh,852px)] max-lg:flex-col max-lg:justify-end max-lg:gap-0 max-lg:pb-[35px] max-lg:pl-[max(21px,env(safe-area-inset-left))] max-lg:pr-[max(21px,env(safe-area-inset-right))] max-lg:pt-16 lg:grid-cols-[minmax(0,610px)_1fr]">
        <div className="flex flex-col gap-[clamp(32px,4vw,56px)] max-lg:gap-[106px] lg:pl-[22px]">
          <p className="max-w-[610px] text-lg leading-[1.6] text-white/90 max-lg:text-[16px]">{FOOTER_COPY.manifesto}</p>

          {/* phones: 16px (Figma 5654:10931) — this site's text-base is 18 */}
          <p className="flex flex-wrap items-end gap-x-[15px] gap-y-1 text-base leading-[1.6] text-white/90 max-lg:text-[16px]">
            <span>{FOOTER_COPY.letsTalk}</span>
            {/* Figma 4887:6362: Chivo Mono Medium 18 / 150% / -2% */}
            <ObfuscatedEmail
              user={EMAIL_USER}
              domain={EMAIL_DOMAIN}
              className="link-arrow -my-2 min-h-0 py-2 font-mono font-medium leading-[1.5] tracking-[-0.02em] text-white underline underline-offset-4"
            >
              <Image className="arrow" src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
            </ObfuscatedEmail>
          </p>
        </div>

        {/* Wordmark — 5376:2928 (1218×311, right 45px); phones: the full column width (352 of 393) */}
        <div className="relative max-lg:mt-[129px] lg:pointer-events-none lg:absolute lg:bottom-[11%] lg:right-[max(var(--gutter),2.35%)] lg:w-[63.4%] lg:max-w-[1218px]">
          <Image
            src="/images/brand/humanx-wordmark.webp"
            alt="HumanX"
            width={2436}
            height={622}
            sizes="(min-width: 1920px) 1218px, (min-width: 1024px) 64vw, 92vw"
            className="ml-auto w-full"
          />
        </div>

        <div className="relative flex flex-col gap-4 max-lg:mt-6 lg:col-span-2">
          <ul className="flex flex-wrap items-center gap-x-[14px] gap-y-1 font-mono text-base leading-[1.6] text-white/90 max-lg:text-[12px]">
            {SOCIAL.map((s, i) => (
              <li key={s.label} className="flex items-center gap-[14px]">
                {i > 0 && <span aria-hidden="true" className="size-1.5 rounded-full bg-white/90 max-lg:hidden" />}
                {/* phones: 12px text in a 19px row — the 44px tap area is padding pulled back by margin */}
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer me" className="inline-flex min-h-11 items-center hover:underline max-lg:-my-3 max-lg:min-h-0 max-lg:py-3">
                    {s.label}
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center max-lg:min-h-0">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
          <Image src="/images/brand/footer-line.svg" alt="" width={1793} height={1} className="h-px w-full opacity-60 max-lg:opacity-100" />
          {/* Figma 4887:6344: Chivo Mono Regular 14 / 126% / -1%; phones 12 / 139%, broken after "Ltd." */}
          <p className="font-mono text-[14px] leading-[1.26] tracking-[-0.01em] text-white max-lg:text-[12px] max-lg:leading-[1.389]">
            {rights !== undefined ? (
              <>
                {legal}
                <br className="lg:hidden" /> All Rights Reserved
              </>
            ) : (
              FOOTER_COPY.copyright
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
