import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NAV } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Page not found | HumanX" },
  robots: { index: false, follow: true },
};

/** 404 — no Figma frame; built from the site's existing type and colour language. */
export default function NotFound() {
  return (
    <>
      <Header current="" theme="light" />
      <main id="main" className="container-page flex min-h-[60dvh] flex-col justify-center gap-8 py-24">
        <p className="font-mono text-sm uppercase tracking-[0.12em] text-[#6b6b6b]">404</p>
        <h1 className="text-h1 font-normal leading-[1.1] tracking-[-0.04em] text-ink">Page not found</h1>
        <nav aria-label="Suggested pages">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-base">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center text-ink underline underline-offset-4 hover:text-accent-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
}
