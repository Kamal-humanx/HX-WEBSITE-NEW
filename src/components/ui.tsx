import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "orange" | "white" | "ink";

const toneClass: Record<Tone, string> = {
  orange: "text-accent-ink", // AA-safe orange on light backgrounds
  white: "text-white",
  ink: "text-black",
};
const toneIcon: Record<Tone, string> = {
  orange: "/images/icons/arrow-orange.svg",
  white: "/images/icons/arrow-white.svg",
  ink: "/images/icons/arrow-orange.svg",
};

/** "Read More ↗" / "Get In Touch ↗" — Uncut Sans Bold 18px, -0.36px, with the Figma "Vector 9" arrow. */
export function ArrowLink({
  href,
  children,
  tone = "orange",
  onDark = false,
  className = "",
  srSuffix,
}: {
  href: string;
  children: ReactNode;
  tone?: Tone;
  onDark?: boolean;
  className?: string;
  /** Visually hidden context appended for screen readers (e.g. which case study). */
  srSuffix?: string;
}) {
  const color = tone === "orange" && onDark ? "text-accent" : toneClass[tone];
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const content = (
    <>
      {children}
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
      <Image
        className={`arrow ${tone === "ink" ? "brightness-0" : ""}`}
        src={toneIcon[tone]}
        alt=""
        width={9}
        height={9}
      />
    </>
  );
  const cls = `link-arrow text-base leading-[1.5] ${color} ${className}`;
  return external ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

/** Orange gradient pill (Figma: Submit 5376:7826, careers CTAs 5521:360). */
export function PillLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`btn-pill justify-between px-[22px] py-3 text-sm leading-[1.5] ${className}`}>
      <span>{children}</span>
      <Image src="/images/icons/arrow-white.svg" alt="" width={9} height={9} />
    </Link>
  );
}

/** Capitalised display heading as styled in Figma (text-transform: capitalize keeps source copy intact). */
export function DisplayHeading({
  as: Tag = "h2",
  children,
  className = "",
  id,
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={`text-h2 font-normal capitalize leading-[1.18] tracking-[-0.02em] ${className}`}>
      {children}
    </Tag>
  );
}
