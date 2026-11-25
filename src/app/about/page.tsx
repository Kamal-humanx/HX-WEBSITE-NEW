import type { CSSProperties } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { Showreel } from "@/components/Showreel";
import { StudioCarousel } from "@/components/StudioCarousel";
import { DisplayHeading } from "@/components/ui";
import { CapabilitiesSection, LearningSection } from "@/components/sections";
import { ABOUT } from "@/content/about";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("about");

/** Staircase heights from Figma 5376:13262 (dashed lines: 218 / 312 / 410 / 506 / 674 px). */
const STEP_H = [218, 312, 410, 506, 674];
const FILL = ["#c5bfb5", "#a79e8f", "#898073"];
/** Stagger index for the scroll reveal (see .rv in globals.css). */
const stagger = (i: number) => ({ ["--i" as string]: i }) as CSSProperties;

export default function AboutPage() {
  const { principles } = ABOUT;

  return (
    <>
      <Header current="/about" theme="light" />
      <main id="main">
        {/* ---------- Intro (5376:13451 + 5376:10176) ---------- */}
        <section aria-labelledby="about-title" className="container-page grid gap-6 pb-[clamp(32px,2.9vw,56px)] pt-[clamp(24px,3.8vw,73px)] lg:grid-cols-[minmax(0,1292px)_minmax(0,472px)] lg:justify-between">
          <h1 id="about-title" className="text-h1 font-normal leading-[1.15] tracking-[-0.04em] text-ink">
            {ABOUT.heading}
          </h1>
          <p className="font-mono text-sm font-medium leading-[1.64] tracking-[-0.03em] text-ink-mono lg:pt-3">{ABOUT.intro}</p>
        </section>

        <section aria-label="Life at the studio">
          <StudioCarousel slides={ABOUT.slides} />
        </section>

        {/* ---------- Process + stats + showreel (5724:39318) ----------
            1856 wide on the 1920 frame: 681 copy | 24 gap | 1151×718 showreel. The columns are
            fractions of that, so the showreel keeps its share (62%) and its 1151:718 shape at every
            desktop width, and the last stat rule sits level with the showreel's lower edge. */}
        <section aria-labelledby="process-title" className="container-page grid gap-10 pb-[clamp(72px,10.4vw,200px)] pt-[clamp(72px,8.8vw,170px)] lg:grid-cols-[681fr_1151fr] lg:gap-[1.25vw] 3xl:gap-6">
          <div className="flex flex-col lg:justify-between">
            <h2 id="process-title" className="text-h3 font-normal leading-[1.2] tracking-[-0.02em] text-ink">
              {ABOUT.process}
            </h2>
            <dl className="mt-[clamp(32px,3vw,58px)] lg:mt-6">
              {ABOUT.stats.map((s, i) => (
                <div
                  key={s.value}
                  className={`flex flex-col gap-1 border-b border-[#bdbdbd] pb-3 pt-6 ${i === 1 ? "items-end text-right" : ""} ${i === 2 ? "lg:pb-0" : ""}`}
                >
                  <dt className="order-2 font-mono text-xs leading-normal tracking-[-0.03em] text-muted-warm">{s.caption}</dt>
                  <dd className="order-1 text-stat font-medium leading-[1.3] text-ink-strong">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Showreel />
        </section>

        {/* ---------- Principles staircase (5376:13259) ---------- */}
        <section aria-labelledby="principles-title" className="container-page pb-[clamp(72px,7vw,140px)]">
          <DisplayHeading as="h2" id="principles-title" className="max-w-[815px] !text-h1-sm !leading-[1.25] text-ink lg:h-[5.05vw] lg:max-w-[42vw] 3xl:max-w-[815px]">
            {principles.title}
          </DisplayHeading>

          {/* The staircase builds itself as it scrolls into view, one step at a time from left to
              right: each riser draws upward, its step fades in and its bar wipes across. It replays
              every time the section comes back into view, scrolling down or up. */}
          <Reveal as="ol" perItemBelow={1024} repeat className="mt-[clamp(32px,1.25vw,24px)] grid gap-8 md:mt-12 lg:mt-6 lg:grid-cols-6 lg:items-end lg:gap-0">
            <li aria-hidden="true" className="hidden lg:block">
              <span className="rv-wipe block h-4 bg-[url('/images/about/bar-ticks.svg')] bg-[length:298px_16px] bg-repeat-x" />
            </li>
            {principles.items.map((p, i) => (
              <li key={p.n} className="flex flex-col" style={stagger(i + 1)}>
                <div className="relative flex flex-col pl-[10px] max-lg:pb-2" style={{ ["--h" as string]: `${STEP_H[i]}px` }}>
                  <span aria-hidden="true" className="rv-line absolute inset-y-0 left-0 border-l border-dashed border-[#b9b2a6]" />
                  <div className="rv flex w-full max-w-[266px] flex-col gap-[10px] lg:min-h-[var(--h)]">
                    <p className="font-mono text-xs font-light tracking-[-0.03em] text-black">/{p.n}</p>
                    <h3 className="text-xl font-medium leading-[1.43] tracking-[-0.02em] text-ink-mono">{p.title}</h3>
                    <p className="max-w-[207px] font-mono text-xs font-light leading-normal tracking-[-0.03em] text-muted-brown">{p.caption}</p>
                  </div>
                </div>
                <span aria-hidden="true" className="rv-wipe block lg:mr-[6px]">
                <span
                  className="mt-0 block h-4"
                  style={
                    i % 2 === 0
                      ? {
                          backgroundColor: FILL[i / 2],
                          backgroundImage: "url('/images/about/bar-fill.webp')",
                          backgroundSize: "100% 180%",
                          backgroundPosition: "0 35%",
                          transform: ["scale(-1,-1)", "", "scaleX(-1)", "", "none"][i],
                        }
                      : { background: "url('/images/about/bar-ticks.svg') 0 0 / 298px 16px repeat-x" }
                  }
                />
                </span>
              </li>
            ))}
          </Reveal>
        </section>

        <div className="bg-night">
          <CapabilitiesSection />

          <LearningSection id="about-learning" />
        </div>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("about", "AboutPage"), breadcrumbSchema("about", "About")]} />
    </>
  );
}
