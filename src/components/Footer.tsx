import Image from "next/image";
import Link from "next/link";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { EMAIL_DOMAIN, EMAIL_USER, FOOTER_COPY, NAV, SOCIAL } from "@/lib/site";

/**
 * Figma: footer frame 5376:2925 (1920×767, #0e0e0e) — shared by every page.
 * Manifesto (24px), Let’s talk + email, socials, copyright, wordmark + glow.
 * The "Ask AI for Summary" row in Figma was removed at the client's request.
 * The footer nav list is an addition required by the brief (not in Figma).
 */
/** variant "careers": Careers page only — fills the screen so the Openings wash lands on it (handoff §4.6). */
export function Footer({ variant }: { variant?: "careers" } = {}) {
  return (
    <footer
      className={`relative isolate overflow-hidden bg-night text-white${variant === "careers" ? " hxc-footer" : ""}`}
      data-hxc-footer={variant === "careers" ? "" : undefined}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Glow — Ellipse 1801 */}
      <Image
        src="/images/brand/footer-glow.svg"
        alt=""
        width={2451}
        height={1366}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[min(-160px,-33.9vw)] left-[max(-30%,-577px)] -z-10 w-[max(1100px,127.7%)] max-w-none select-none 3xl:left-[calc(50%-1537px)] 3xl:w-[2451px]"
      />

      <div className="container-page relative grid min-h-[clamp(620px,40vw,767px)] grid-cols-1 content-between gap-12 pb-6 pt-[clamp(40px,3.2vw,61px)] lg:grid-cols-[minmax(0,610px)_1fr]">
        <div className="flex flex-col gap-[clamp(32px,4vw,56px)] lg:pl-[22px]">
          <p className="max-w-[610px] text-lg leading-[1.6] text-white/90">{FOOTER_COPY.manifesto}</p>

          <p className="flex flex-wrap items-end gap-x-[15px] gap-y-1 text-base leading-[1.6] text-white/90">
            <span>{FOOTER_COPY.letsTalk}</span>
            <ObfuscatedEmail user={EMAIL_USER} domain={EMAIL_DOMAIN} className="link-arrow min-h-0 font-medium text-white underline underline-offset-4">
              <Image className="arrow" src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
            </ObfuscatedEmail>
          </p>
        </div>

        <nav aria-label="Footer" className="lg:justify-self-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-base text-white/90">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Wordmark — 5376:2928 (1218×311, right 45px) */}
        <div className="relative lg:pointer-events-none lg:absolute lg:bottom-[11%] lg:right-[max(var(--gutter),2.35%)] lg:w-[63.4%] lg:max-w-[1218px]">
          <Image
            src="/images/brand/humanx-wordmark.webp"
            alt="HumanX"
            width={2436}
            height={622}
            sizes="(min-width: 1920px) 1218px, (min-width: 1024px) 64vw, 92vw"
            className="ml-auto w-full max-lg:w-[92%]"
          />
        </div>

        <div className="relative flex flex-col gap-4 lg:col-span-2">
          <ul className="flex flex-wrap items-center gap-x-[14px] gap-y-1 font-mono text-base leading-[1.6] text-white/90">
            {SOCIAL.map((s, i) => (
              <li key={s.label} className="flex items-center gap-[14px]">
                {i > 0 && <span aria-hidden="true" className="size-1.5 rounded-full bg-white/90" />}
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer me" className="inline-flex min-h-11 items-center hover:underline">
                    {s.label}
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
          <Image src="/images/brand/footer-line.svg" alt="" width={1793} height={1} className="h-px w-full opacity-60" />
          <p className="font-mono text-base leading-[1.256] tracking-[-0.01em] text-white">{FOOTER_COPY.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
