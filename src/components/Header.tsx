import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { HeaderTheme } from "./HeaderTheme";
import { NAV } from "@/lib/site";

export type HeaderTheme = "light" | "dark" | "overlay";

/** Text-box widths from Figma 4887:5239–5243 (they set each item's x position in the nav row). */
const NAV_TEXT_W: Record<string, number> = { Home: 39, About: 48, Work: 39, Careers: 68, Contact: 68 };

/**
 * Figma: header 5376:1848 / 5521:369 — 1920×127, frosted band rgba(255,255,255,.1) blur 50,
 * inner bar 1848×63 is sticky. Logo 115.6×29.5 at x=36; nav (Chivo Mono 16px, gap 40.8px,
 * active = Bold + underline) sits immediately left of the "Start a Project" pill (152×42, r21,
 * Uncut Sans Semibold 15.5px) with a ~40px gap. Colour follows the section underneath.
 * `overlay` = the page's first section is dark and starts under the header (Homepage hero).
 */
export function Header({ current, theme = "light" }: { current: string; theme?: HeaderTheme }) {
  const initial = theme === "light" ? "light" : "dark";

  return (
    <header
      data-header
      data-theme={initial}
      data-scrolled="false"
      className={`site-header sticky top-0 z-30 ${theme === "overlay" ? "-mb-[var(--header-h)]" : "mb-[var(--header-gap)]"}`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Frosted band (Rectangle 5376:1849) + scrolled backdrop */}
      {/* diffuse glass: a white tint (::before) over seven progressively stronger blur layers */}
      <span aria-hidden="true" className="header-band pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--header-h)+var(--header-gap))]">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="hb" />
        ))}
      </span>
      <span aria-hidden="true" className="header-backdrop pointer-events-none absolute inset-0" />

      {/* Homepage 4887:4330: inner bar 1855 wide at x=31 → 31px left / 34px right margin on the 1920 frame. */}
      <div className="relative mx-auto flex h-[var(--header-h)] w-full max-w-[var(--page-max)] items-center justify-between gap-6 pl-[max(clamp(16px,1.615vw,31px),env(safe-area-inset-left))] pr-[max(clamp(16px,1.771vw,34px),env(safe-area-inset-right))]">
        {/* Logo 4887:4331: 115.64×29.5 at x=31, y=37.21 (centre 51.96 → +1.08px from the bar centre). */}
        <Link href="/" className="tap -ml-1 inline-flex translate-y-[1.08px] items-center rounded p-1" aria-label="HumanX — home">
          <Logo className="h-auto w-[clamp(94px,6.023vw,115.64px)]" />
        </Link>

        {/* Nav frame 4887:5238 (x=1270, 425.3 wide) → 38.7px → pill 4887:5246 (x=1734). */}
        <div className="flex items-center gap-[clamp(24px,2.016vw,38.7px)]">
          <nav aria-label="Primary" className="hidden lg:block">
            {/* Chivo Mono 16/150%, gap 40.81; text line box top at y=39.15 (centre 51.15 → +0.27px). */}
            <ul className="flex translate-y-[0.27px] items-center gap-[clamp(20px,2.1256vw,40.81px)] font-mono text-[16px]">
              {NAV.map((item) => {
                const active = item.href === current;
                return (
                  <li key={item.href} style={{ minWidth: NAV_TEXT_W[item.label] }}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center leading-[1.5] tracking-normal transition-opacity [text-decoration-skip-ink:none] hover:opacity-70 ${
                        active ? "font-bold underline decoration-from-font underline-offset-auto" : "font-normal"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Pill 4887:5246: 152×42, r21, 1px centre-aligned stroke (box-shadow ±0.5px keeps the 152×42 box);
              label 4887:5245 Uncut Sans Semibold 15.548/150%, 24px from the left, 9.15px from the top. */}
          <Link
            href="/contact"
            className="header-pill hidden h-[42px] w-[152px] -translate-y-[0.88px] items-start justify-start rounded-[21px] pl-[24px] pt-[9.15px] text-[15.548px] font-semibold leading-[1.5] tracking-normal transition-colors sm:inline-flex"
          >
            Start a Project
          </Link>
          <MobileMenu current={current} />
        </div>
      </div>
      <HeaderTheme />
    </header>
  );
}
