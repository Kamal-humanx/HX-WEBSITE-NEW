import Image from "next/image";
import { CAPABILITIES, LEARNING } from "@/content/shared";
import { DisplayHeading } from "./ui";

/**
 * "What We Bring To The Table" — Figma 5376:2788 (Home), 5376:10179 (About), 5376:4919 (Contact).
 * Rows: 42px title (first row orange), 1px rgba(255,255,255,.1) separators, a vertical rule,
 * "Our Capabilities" (Chivo Mono 16px, +1.94px, #8b8b8b) and two 24px/40px columns.
 */
export function CapabilitiesSection({ id = "capabilities" }: { id?: string }) {
  return (
    <section aria-labelledby={`${id}-title`} className="bg-night text-white">
      <div className="container-page pb-[var(--section-y)] pt-[clamp(56px,5.5vw,104px)] lg:px-[clamp(36px,3.75vw,72px)]">
        <DisplayHeading id={`${id}-title`} className="max-w-[440px] text-white">
          {CAPABILITIES.title}
        </DisplayHeading>
        <div className="mt-[clamp(40px,5.4vw,103px)]">
          {CAPABILITIES.rows.map((row, i) => (
            <div
              key={row.title}
              className="group grid gap-5 border-b border-white/10 py-[23px] md:grid-cols-[minmax(0,39.5%)_1fr] md:gap-0"
            >
              <h3
                className={`whitespace-pre-line text-h3 font-normal leading-[1.39] tracking-[-0.03em] transition-colors ${
                  i === 0 ? "text-accent" : "text-white group-hover:text-accent"
                }`}
              >
                {row.title}
              </h3>
              <div className="md:flex md:gap-[23px]">
                <span aria-hidden="true" className="hidden w-px shrink-0 bg-white/10 md:block" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm uppercase tracking-[0.12em] text-gray">{CAPABILITIES.label}</p>
                  <div className="mt-2 grid sm:grid-cols-2">
                    {row.columns.map((col, c) => (
                      <ul key={c} className={c === 1 ? "max-sm:-mt-px" : ""}>
                        {col.map((item) => (
                          <li key={item} className="border-b border-white/5 py-[9.7px] text-lg leading-[1.67] text-white/90">
                            {item}
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
 * "We're constantly learning in public" — Figma 5376:2864 (Home) / 5376:10234 (About).
 * The cards' CTAs have no destination in the design, so they render as non-interactive labels
 * (see README → "Open content questions").
 */
export function LearningSection({ id = "learning" }: { id?: string }) {
  return (
    <section aria-labelledby={`${id}-title`} className="bg-night text-white">
      <div className="container-page pb-[var(--section-y)] lg:px-[clamp(36px,3.1vw,58px)]">
        <DisplayHeading id={`${id}-title`} className="text-white">
          {LEARNING.title}
        </DisplayHeading>
        <ul className="mt-[clamp(32px,2.4vw,46px)] grid gap-x-[clamp(24px,3.2vw,62px)] gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {LEARNING.posts.map((post) => (
            <li key={post.cta}>
              <article className="flex h-full flex-col gap-[15px] border-b border-white/20 pb-[clamp(24px,2vw,40px)]">
                <Image
                  src={post.image}
                  alt={post.alt}
                  width={post.width}
                  height={post.height}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
                  className="aspect-[565/330] w-full object-cover"
                />
                <p className="mt-[6px] flex items-center justify-between font-mono text-[17px] tracking-[-0.016em] text-white/60">
                  <time dateTime={post.dateTime}>{post.date}</time>
                  <span>{post.type}</span>
                </p>
                <p className="text-base leading-[1.4] text-white/80">{post.excerpt}</p>
                <p className="mt-auto inline-flex items-center gap-2 pt-[16px] text-base font-bold capitalize leading-[1.5] tracking-[-0.02em]">
                  {post.cta}
                  <Image src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
