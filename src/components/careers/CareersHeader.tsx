"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NAV } from "@/lib/site";
import { Logo } from "../Logo";
import { MobileMenu } from "../MobileMenu";

/**
 * Careers-only header, ported from the interactions reference (SiteHeader.tsx).
 * Fixed, 100px (72px on phones). Over the hero: the Figma white-10% glass band, 127px deep, fading
 * at its foot. Past the hero: a flat band that takes the colour of whatever is under it, sampled at
 * 24 points across the width (so a seam between two sections shows as both colours), at 80% with
 * blur. The logo, each link and the CTA read the ground under their own x-position and switch
 * white/black independently. Re-sampled on scroll (rAF) and every 400ms (pinned scenes change
 * colour without scrolling). The rest of the site keeps the standard <Header>.
 */

/* the first painted background under a point, ignoring the header itself */
function groundAt(x: number, y: number, self: HTMLElement): [number, number, number] {
  for (const el of document.elementsFromPoint(x, y)) {
    if (self.contains(el)) continue;
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = "1"] = m;
    if (+a < 0.5) continue;
    return [+r, +g, +b];
  }
  return [14, 14, 14];
}
const lum = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const N = 24;

export function CareersHeader({ current }: { current: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const W = window.innerWidth;
      if (!W) return; /* background tab: no width yet */
      const scene = document.querySelector("[data-hxc-scene]");
      const past = !!scene && scene.getBoundingClientRect().bottom <= el.offsetHeight;
      const y = el.offsetHeight + 4;
      const raw = Array.from({ length: N }, (_, i) => groundAt(((i + 0.5) / N) * W, y, el));
      /* softened with its neighbours, so a hard seam below becomes a gentle blend above */
      const soft = raw.map((_, i) => {
        const a = raw[Math.max(0, i - 1)],
          b = raw[i],
          c = raw[Math.min(N - 1, i + 1)];
        return [0, 1, 2].map((k) => (a[k] + 2 * b[k] + c[k]) / 4);
      });
      const stops = soft.map(
        (c, i) => `rgba(${c.map(Math.round).join(",")},.8) ${(((i + 0.5) / N) * 100).toFixed(2)}%`,
      );
      el.classList.toggle("is-solid", past);
      el.style.setProperty("--sh-grad", `linear-gradient(90deg,${stops.join(",")})`);
      const at = (x: number) => {
        const f = Math.min(N - 1, Math.max(0, (x / W) * N - 0.5)) || 0;
        const i = Math.floor(f),
          j = Math.min(N - 1, i + 1),
          t = f - i;
        return lum(soft[i]) * (1 - t) + lum(soft[j]) * t;
      };
      el.querySelectorAll<HTMLElement>("[data-ink]").forEach((item) => {
        const r = item.getBoundingClientRect();
        item.dataset.tone = at(r.left + r.width / 2) > 150 ? "light" : "dark";
      });
      el.dataset.tone = at(W / 2) > 150 ? "light" : "dark";
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    const id = window.setInterval(check, 400);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header ref={ref} className="hxc-sh" data-tone="dark">
      <Link href="/" className="hxc-sh-logo" data-ink data-tone="dark" aria-label="HumanX — home">
        <Logo className="h-full w-auto" />
      </Link>
      <nav aria-label="Primary" className="hxc-sh-links">
        {NAV.map((item) => {
          const active = item.href === current;
          return (
            <Link key={item.href} href={item.href} data-ink data-tone="dark" aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/contact" className="hxc-sh-cta" data-ink data-tone="dark">
        Start a Project
      </Link>
      <span className="hxc-sh-menu" data-ink data-tone="dark">
        <MobileMenu current={current} />
      </span>
    </header>
  );
}
