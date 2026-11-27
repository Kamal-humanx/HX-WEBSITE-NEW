import Image from "next/image";
import { CAPABILITIES, LEARNING } from "@/content/shared";
import { DisplayHeading } from "./ui";

/**
 * "What We Bring To The Table" — Figma 5376:2788 (Home), 5376:10179 (About), 5376:4919 (Contact).
 * Rows: 42px title (first row orange), 1px rgba(255,255,255,.1) separators, a vertical rule,
 * "Our Capabilities" (Chivo Mono 16px, +1.94px, #8b8b8b) and two 24px/40px columns.
 *
 * Phones (< 768px): Figma "Services — Mobile" 5969:6729 on every page (Home, About, Contact) — one
 * full-length list per group with dividers (globals.css .caps-list).
 */
export function CapabilitiesSection({ id = "capabilities", reveal = false }: { id?: string; reveal?: boolean }) {
  /* `reveal`: soft scroll-in reveal (needs <CaseReveal /> on the page) — About, where nothing else animates it */
  const rv = reveal ? { "data-rv": "" } : {};
  return (
    <section aria-labelledby={`${id}-title`} className="caps-list bg-night text-white">
      <div className="container-page pb-[var(--section-y)] pt-[clamp(56px,5.5vw,104px)] lg:px-[clamp(36px,3.75vw,72px)]">
        <div data-swap-block="" {...rv}>
          <DisplayHeading id={`${id}-title`} className="caps-title max-w-[440px] text-white">
            {CAPABILITIES.title}
          </DisplayHeading>
        </div>
        <div className="caps-rows mt-[clamp(20px,5.4vw,103px)]">
          {CAPABILITIES.rows.map((row) => (
            <div
              key={row.title}
              data-swap-block=""
              {...rv}
              className="group grid gap-2 border-b border-white/10 py-[14px] md:grid-cols-[minmax(0,39.5%)_1fr] md:gap-0 md:py-[23px]"
            >
              {/* orange only while the row is hovered */}
              <h3 className="text-[1.3125rem] font-normal leading-[1.3] tracking-[-0.03em] text-white transition-colors duration-300 group-hover:text-accent md:whitespace-pre-line md:text-h3 md:leading-[1.39]">
                {row.title}
              </h3>
              <div className="md:flex md:gap-[23px]">
                <span aria-hidden="true" className="hidden w-px shrink-0 bg-white/10 md:block" />
                <div className="min-w-0 flex-1">
                  <p className="caps-label font-mono text-[11px] uppercase tracking-[0.12em] text-gray md:text-sm">{CAPABILITIES.label}</p>
                  <div className="caps-grid mt-1 grid grid-cols-2 gap-x-4 md:mt-2 md:gap-x-0">
                    {row.columns.map((col, c) => (
                      <ul key={c}>
                        {col.map((item) => (
                          /* row hovered → all its items go to plain white. The divider under each item is
                             drawn as its own line (.cap-item::after) so it can draw in apart from the text. */
                          <li key={item} className="cap-item py-[5px] text-[14px] leading-[1.3] text-white/90 transition-colors duration-300 group-hover:text-white md:py-[9.7px] md:text-lg md:leading-[1.67]">
                            <span className="cap-txt">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * "We're constantly learning" — Figma 5376:2864 (Home) / 5376:10234 (About).
 * Each card links to its post (content/shared.ts → href), opening in a new tab; the whole card is
 * clickable.
 */
export function LearningSection({ id = "learning", reveal = false }: { id?: string; reveal?: boolean }) {
  /* `reveal`: soft scroll-in reveal (needs <CaseReveal />) — About; the homepage has LearnReveal */
  const rv = reveal ? { "data-rv": "" } : {};
  return (
    <section aria-labelledby={`${id}-title`} className="bg-night text-white">
      <div className="container-page pb-[var(--section-y)] lg:px-[clamp(36px,3.1vw,58px)]">
        {/* Figma 4887:5268: Uncut Sans 70 / 66.42px / -3% */}
        <div {...rv}>
          <DisplayHeading id={`${id}-title`} className="text-white leading-[0.9489]! tracking-[-0.03em]!">
            {LEARNING.title}
          </DisplayHeading>
        </div>
        <ul className="mt-[clamp(32px,2.4vw,46px)] grid gap-x-[clamp(24px,3.2vw,62px)] gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {LEARNING.posts.map((post) => (
            <li key={post.cta} {...rv}>
              <article className="post-card group/post relative flex h-full flex-col gap-[15px] border-b border-white/20 pb-[clamp(24px,2vw,40px)]">
                {/* the frame keeps the reveal's slight zoom inside the card */}
                <div className="post-media overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.alt}
                  width={post.width}
                  height={post.height}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
                  className="aspect-[565/330] w-full object-cover"
                />
                </div>
                <p className="mt-[6px] flex items-center justify-between font-mono text-[17px] tracking-[-0.016em] text-white/60">
                  <time dateTime={post.dateTime}>{post.date}</time>
                  <span>{post.type}</span>
                </p>
                <p className="text-base leading-[1.4] text-white/80">{post.excerpt}</p>
                {/* opens the post in a new tab (the card's hover lights it: globals.css .post-card) */}
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-arrow mt-auto inline-flex items-center gap-2 self-start pt-[16px] text-base font-bold capitalize leading-[1.5] tracking-[-0.02em]"
                >
                  <span className="la">{post.cta}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                  <Image className="arrow" src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
                </a>
                {/* the whole card opens the post too: its own layer, never animated (the reveals move
                    the text link, and a moved link's stretched ::after shrank to the link's own box —
                    the picture went unclickable until the reveal was done); hidden from assistive
                    tech and the tab order, which have the link above */}
                <a href={post.href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" data-stretch="" className="absolute inset-0 z-[1]" />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
