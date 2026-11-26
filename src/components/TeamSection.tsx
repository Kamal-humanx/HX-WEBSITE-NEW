"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DisplayHeading } from "./ui";
import { TEAM } from "@/content/about";

/** Figma 5880:35949: the 1856 × 677 card stage on the 1920 frame */
const STAGE_W = 1856;
const STAGE_H = 677;
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`;

/**
 * About — "Different Perspectives. Shared Obsession." (Figma 5880:35949).
 * Desktop (≥ 1024): the cards sit scattered on the stage exactly as in Figma, every position and
 * size a share of the stage, so the arrangement holds at any width; padding and type scale with
 * the stage (cq units) down to a readable floor. Phones / tablets: the same cards in a 2 / 3 column
 * grid, co-founders first.
 * Borders: Figma's gradient stroke (dark at the top, lit along the bottom) plus the testimonial
 * tabs' cursor spotlight — the stretch of border nearest the pointer glows, across neighbouring
 * cards too. Each card rises in softly as it's scrolled to (CaseReveal, data-rv).
 */
export function TeamSection() {
  return (
    <section aria-labelledby="team-title" className="bg-night text-white">
      <div className="container-page pb-[var(--section-y)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <div data-rv>
            {/* Figma: 727px text box at 70px → breaks after "Perspectives." */}
            <DisplayHeading id="team-title" className="max-w-[10.4em] leading-[1.25] text-white">
              {TEAM.title}
            </DisplayHeading>
          </div>
          <Link
            data-rv
            href={TEAM.cta.href}
            className="link-arrow shrink-0 self-start text-lg font-medium! leading-[1.5] tracking-[-0.02em] text-white"
          >
            <span className="la">{TEAM.cta.label}</span>
            <Image className="arrow" src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
          </Link>
        </div>

        <ul
          aria-label="Team"
          className="team-stage mt-[clamp(32px,5.73vw,110px)] grid grid-cols-2 gap-x-3 gap-y-5 [container-type:inline-size] md:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:relative lg:block lg:aspect-[1856/677]"
          /* border spotlight, as on the testimonial tabs: each card gets the pointer in its own coordinates */
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const ul = e.currentTarget;
            ul.style.setProperty("--spot", "1");
            ul.querySelectorAll<HTMLElement>(".team-card").forEach((card) => {
              const r = card.getBoundingClientRect();
              card.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(1)}px`);
              card.style.setProperty("--my", `${(e.clientY - r.top).toFixed(1)}px`);
            });
          }}
          onPointerLeave={(e) => e.currentTarget.style.setProperty("--spot", "0")}
        >
          {TEAM.members.map((m) => (
            <li
              key={m.name}
              data-rv
              className={`team-card team-${m.size}`}
              style={
                {
                  "--x": pct(m.x, STAGE_W),
                  "--y": pct(m.y, STAGE_H),
                  "--w": pct(m.cw, STAGE_W),
                  "--pa": `${m.photo[0]} / ${m.photo[1]}`,
                } as CSSProperties
              }
            >
              <div className="team-photo overflow-hidden bg-night">
                <Image
                  src={m.image}
                  alt={`Portrait of ${m.name}`}
                  width={m.w}
                  height={m.h}
                  sizes={m.size === "lg" ? "(min-width: 1024px) 18vw, (min-width: 768px) 31vw, 46vw" : "(min-width: 1024px) 11vw, (min-width: 768px) 31vw, 46vw"}
                  className="size-full object-cover"
                />
              </div>
              <p className="team-meta">
                <span className="team-name">{m.name}</span>
                <span className="team-role">{m.role}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
