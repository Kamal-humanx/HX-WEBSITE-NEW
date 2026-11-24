import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { StudioCarousel } from "@/components/StudioCarousel";
import { ArrowLink, DisplayHeading } from "@/components/ui";
import { CapabilitiesSection, LearningSection } from "@/components/sections";
import { ABOUT } from "@/content/about";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("about");

/** Staircase heights from Figma 5376:13262 (dashed lines: 218 / 312 / 410 / 506 / 674 px). */
const STEP_H = [218, 312, 410, 506, 674];
const FILL = ["#c5bfb5", "#a79e8f", "#898073"];

export default function AboutPage() {
  const { principles, team } = ABOUT;

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

        {/* ---------- Process + stats + showreel (5376:13428) ---------- */}
        <section aria-labelledby="process-title" className="container-page grid gap-10 py-[clamp(72px,8.8vw,170px)] lg:grid-cols-[minmax(0,681px)_minmax(0,1151px)] lg:justify-between">
          <div>
            <h2 id="process-title" className="text-h3 font-normal leading-[1.2] tracking-[-0.02em] text-ink">
              {ABOUT.process}
            </h2>
            <dl className="mt-[clamp(32px,3vw,58px)]">
              {ABOUT.stats.map((s, i) => (
                <div
                  key={s.value}
                  className={`flex flex-col gap-1 border-b border-[#bdbdbd] pb-3 pt-6 ${i === 1 ? "items-end text-right" : ""}`}
                >
                  <dt className="order-2 font-mono text-xs leading-normal tracking-[-0.03em] text-muted-warm">{s.caption}</dt>
                  <dd className="order-1 text-stat font-medium leading-[1.3] text-ink-strong">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="relative aspect-[1151/718] w-full overflow-hidden bg-black lg:self-start">
            <Image
              src="/images/about/showreel.webp"
              alt="HumanX showreel — Motion · Design"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </figure>
        </section>

        {/* ---------- Principles staircase (5376:13259) ---------- */}
        <section aria-labelledby="principles-title" className="container-page pb-[clamp(72px,7vw,140px)]">
          <DisplayHeading as="h2" id="principles-title" className="max-w-[815px] !text-h1-sm !leading-[1.25] text-ink lg:h-[5.05vw] lg:max-w-[42vw] 3xl:max-w-[815px]">
            {principles.title}
          </DisplayHeading>

          <ol className="mt-[clamp(32px,1.25vw,24px)] grid gap-8 md:mt-12 lg:mt-6 lg:grid-cols-6 lg:items-end lg:gap-0">
            <li aria-hidden="true" className="hidden lg:block">
              <span className="block h-4 bg-[url('/images/about/bar-ticks.svg')] bg-[length:298px_16px] bg-repeat-x" />
            </li>
            {principles.items.map((p, i) => (
              <li key={p.n} className="flex flex-col">
                <div
                  className="flex flex-col border-l border-dashed border-[#b9b2a6] pl-[10px] max-lg:pb-2"
                  style={{ ["--h" as string]: `${STEP_H[i]}px` }}
                >
                  <div className="flex w-full max-w-[266px] flex-col gap-[10px] lg:min-h-[var(--h)]">
                    <p className="font-mono text-xs font-light tracking-[-0.03em] text-black">/{p.n}</p>
                    <h3 className="text-xl font-medium leading-[1.43] tracking-[-0.02em] text-ink-mono">{p.title}</h3>
                    <p className="max-w-[207px] font-mono text-xs font-light leading-normal tracking-[-0.03em] text-muted-brown">{p.caption}</p>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="mt-0 block h-4 lg:mr-[6px]"
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
              </li>
            ))}
          </ol>
        </section>

        <div className="bg-night">
          <CapabilitiesSection />

          {/* ---------- Team (5376:10350 + 5376:10295) ---------- */}
          <section aria-labelledby="team-title" className="pb-[var(--section-y)] text-white">
            <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="team-title" className="text-h3-sm font-normal capitalize leading-[1.25] tracking-[-0.02em]">
                {team.title}
              </h2>
              <ArrowLink href="/careers" tone="white" className="font-medium capitalize">
                {team.cta}
              </ArrowLink>
            </div>
            <ul
              tabIndex={0}
              aria-label="Team members — scroll horizontally"
              className="no-scrollbar mt-[clamp(24px,2.1vw,40px)] flex snap-x gap-6 overflow-x-auto px-[var(--gutter)] pb-2 lg:h-[822px] lg:gap-[24px]"
            >
              {team.people.map((p, i) => {
                const lg = p.size === "lg";
                return (
                  <li
                    key={`${p.name}-${i}`}
                    className={`shrink-0 snap-start self-start bg-night-2 lg:mt-[var(--offset)] ${lg ? "w-[min(426px,78vw)] p-4" : "w-[min(241px,56vw)] p-3"}`}
                    style={{ ["--offset" as string]: `${p.offset}px` }}
                  >
                    <figure>
                      <div className={`relative w-full overflow-hidden bg-night ${lg ? "aspect-[394/452]" : "aspect-[217/229]"}`}>
                        <Image src={p.image} alt={`${p.name.trim()}, ${p.role}`} fill sizes={lg ? "426px" : "241px"} className="object-cover" />
                      </div>
                      <figcaption
                        className={`flex items-center justify-between gap-3 leading-[1.38] ${lg ? "mt-[21px] text-sm" : "mt-4 text-[12px]"}`}
                      >
                        <span className="tracking-[-0.03em] text-white">{p.name}</span>
                        <span className="font-mono tracking-[-0.03em] text-white/60">{p.role}</span>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
          </section>

          <LearningSection id="about-learning" />
        </div>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("about", "AboutPage"), breadcrumbSchema("about", "About")]} />
    </>
  );
}
