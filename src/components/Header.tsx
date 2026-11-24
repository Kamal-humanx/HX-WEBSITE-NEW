import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { HeaderTheme } from "./HeaderTheme";
import { CareersHeader } from "./careers/CareersHeader";
import { NAV } from "@/lib/site";

export type HeaderTheme = "light" | "dark" | "overlay";

/**
 * Figma: header 5376:1848 / 5521:369 — 1920×127, frosted band rgba(255,255,255,.1) blur 50,
 * inner bar 1848×63 is sticky. Logo 115.6×29.5 at x=36; nav (Chivo Mono 16px, gap 40.8px,
 * active = Bold + underline) sits immediately left of the "Start a Project" pill (152×42, r21,
 * Uncut Sans Semibold 15.5px) with a ~40px gap. Colour follows the section underneath.
 * `overlay` = the page's first section is dark and starts under the header (Homepage hero).
 */
export function Header({
  current,
  theme = "light",
  variant = "default",
}: {
  current: string;
  theme?: HeaderTheme;
  /** "careers": the Careers page's own interactive header (Careers only). */
  variant?: "default" | "careers";
}) {
  if (variant === "careers") return <CareersHeader current={current} />;
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
      <span aria-hidden="true" className="header-band pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--header-h)+var(--header-gap))]" />
      <span aria-hidden="true" className="header-backdrop pointer-events-none absolute inset-0" />

      <div className="container-page relative flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="tap -ml-1 inline-flex items-center rounded p-1" aria-label="HumanX — home">
          <Logo className="h-[clamp(24px,1.54vw,30px)] w-auto" />
        </Link>

        <div className="flex items-center gap-[clamp(24px,2.05vw,39px)]">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-[clamp(20px,2.125vw,40.8px)] font-mono text-sm">
              {NAV.map((item) => {
                const active = item.href === current;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center leading-[1.5] underline-offset-4 transition-opacity hover:opacity-70 ${
                        active ? "font-bold underline decoration-1" : "font-normal"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link
            href="/contact"
            className="header-pill hidden h-[42px] w-[152px] items-center justify-center rounded-[21px] border border-current text-[15.5px] font-semibold leading-[1.5] transition-colors sm:inline-flex"
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
