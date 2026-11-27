import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Testimonials } from "@/components/Testimonials";
import { PhilosophyReveal } from "@/components/PhilosophyReveal";
import { WorkCards } from "@/components/WorkCards";
import { HeroIntro } from "@/components/HeroIntro";
import { HeroVideo } from "@/components/HeroVideo";
import { PinStage } from "@/components/PinStage";
import { ToneShift } from "@/components/ToneShift";
import { PinCover } from "@/components/PinCover";
import { SwapStage } from "@/components/SwapStage";
import { LearnReveal } from "@/components/LearnReveal";
import { ArrowLink, DisplayHeading } from "@/components/ui";
import { CapabilitiesSection, LearningSection } from "@/components/sections";
import { HOME } from "@/content/home";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("home");

export default function HomePage() {
  const { hero, work, testimonial, manifesto } = HOME;

  return (
    <>
      <Header current="/" theme="overlay" />
      <main id="main">
        {/* ---------- Hero (5376:1439 image, 5376:1843 heading, 5376:1847 intro) ---------- */}
        <section aria-labelledby="hero-title" className="relative">
          <div className="hero-media relative h-[clamp(360px,27.66vw,531px)] w-full overflow-hidden bg-night">
            {/* looping video in the hero's existing box; no play button, it plays by itself */}
            <HeroVideo />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[127px] bg-gradient-to-b from-black/35 to-transparent" />
          </div>

          <div className="container-page relative grid gap-6 pb-10 pt-[clamp(28px,3.1vw,60px)] lg:grid-cols-[1fr_auto] lg:items-start">
            <HeroIntro line1={hero.heading.line1} line2={hero.heading.line2} intro={hero.intro} />
          </div>
        </section>

        {/* ---------- Client logo marquee (5376:3871) ---------- */}
        {/* Strip 5000:19060: one 115.2px row, cells centred vertically, 84px apart; scales with the
            1920 frame (min 50%). The list is rendered twice and the track moves by exactly one copy,
            so the loop is seamless and runs right → left without stopping. */}
        <section aria-label="Clients" data-seq="clients" className="relative overflow-hidden py-[clamp(16px,1.2vw,24px)]">
          <ul className="flex w-max animate-marquee items-center">
            {[0, 1].flatMap((copy) =>
              HOME.clients.map((c) => (
                <li
                  key={`${copy}-${c.name}`}
                  aria-hidden={copy === 1 ? true : undefined}
                  className="flex h-[clamp(57.6px,6vw,115.2px)] shrink-0 items-center pr-[clamp(42px,4.375vw,84px)]"
                >
                  <Image
                    src={c.src}
                    alt={copy === 0 ? c.name : ""}
                    width={Math.round(c.w * 2)}
                    height={Math.round(c.h * 2)}
                    sizes={`${Math.ceil(c.w)}px`}
                    loading="eager"
                    style={{
                      width: `clamp(${c.w / 2}px, ${(c.w / 19.2).toFixed(4)}vw, ${c.w}px)`,
                      height: `clamp(${c.h / 2}px, ${(c.h / 19.2).toFixed(4)}vw, ${c.h}px)`,
                    }}
                    className="max-w-none"
                  />
                </li>
              )),
            )}
          </ul>
          {/* Left/Right Fade 4899:1335/1337: 460×72.98 at y=17 of the 115.2 row; white 100% → 55% @50% → 0%. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-[clamp(16px,1.2vw,24px)] left-0 w-[23.958vw] max-w-[460px]">
            <div className="absolute inset-x-0 top-[14.76%] h-[63.35%] bg-[linear-gradient(to_right,#fff_0%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0)_100%)]" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-[clamp(16px,1.2vw,24px)] right-0 w-[23.958vw] max-w-[460px]">
            <div className="absolute inset-x-0 top-[14.76%] h-[63.35%] bg-[linear-gradient(to_left,#fff_0%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0)_100%)]" />
          </div>
        </section>

        {/* ---------- Philosophy statement (5376:1804) ---------- */}
        {/* held mid-screen while it reveals, then the work section slides up over it */}
        <PinStage label="Our philosophy" className="container-page">
          <PhilosophyReveal className="mx-auto max-w-[1700px] text-center text-h2 font-normal leading-[1.33] tracking-[-0.02em] text-ink-soft" />
        </PinStage>

        {/* ---------- Work teaser (5376:1440 + 5 × "thumbnail explo") ---------- */}
        {/* cards: x=35, 1853 wide on the 1920 frame → 35px left / 32px right.
            Slides up over the philosophy statement, then holds at its last cards while they sweep
            out, and the dark block rises over it. */}
        <PinCover className="pin-next" hold={70} dim={false} dataPin="work">
        <section aria-labelledby="work-title" className="container-page pb-[clamp(72px,7vw,133px)] pt-[clamp(72px,10vw,200px)] lg:pl-[clamp(16px,1.823vw,35px)] lg:pr-[clamp(16px,1.667vw,32px)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <DisplayHeading id="work-title" className="max-w-[8.6em] text-ink lg:pl-[13px]">
              {work.title}
            </DisplayHeading>
            <Link
              href="/works"
              className="link-arrow text-base capitalize leading-[1.5] text-[#181818] sm:mb-1"
            >
              <span className="la">{work.seeAll}</span>
              <Image className="arrow brightness-0" src="/images/icons/arrow-orange.svg" alt="" width={9} height={9} />
            </Link>
          </div>

          <WorkCards cases={work.cases} readMore={work.readMore} />
        </section>
        </PinCover>

        {/* ---------- Dark block: capabilities, testimonial, manifesto, learning ---------- */}
        {/* as Careers' manifesto → gene: the work section holds, its cards dip out one by one, the
            stage darkens white → black, and the dark block scrolls in already dark */}
        <ToneShift />
        <div className="tone-dark">
          {/* "What We Bring To The Table" holds; its content leaves and the testimonials arrive in
              the same place; then the page scrolls on normally */}
          <SwapStage
            hold={90}
            /* 70 = the work section's hold, during which this stage fades in; + 45 held with the
               capabilities fully in (two or three scrolls) before they start to leave */
            lead={115}
            /* 35 held with the testimonials fully in (a scroll or so) before the page moves on */
            tail={35}
            first={<CapabilitiesSection />}
            second={
              /* Testimonial (5376:2844 / Testimonials 4899:1434) */
              /* testimonials-phone: Figma "testimonials-1" 5969:10826 on phones (globals.css) */
              <section aria-labelledby="testimonial-title" className="testimonials-phone text-white">
                {/* Testimonials block: x=38, 1856 wide on the 1920 frame → 38px left / 26px right. */}
                <div className="container-page pb-[var(--section-y)] pt-[clamp(40px,4.4vw,85px)] lg:pl-[clamp(16px,1.979vw,38px)] lg:pr-[clamp(16px,1.354vw,26px)]">
                  <div data-swap-block="">
                    <DisplayHeading id="testimonial-title" className="text-white">
                      {/* "co-conspirators" never splits at its hyphen; phones break before it, as Figma
                          testimonials-1 ("From Our / Co-Conspirators") */}
                      {testimonial.title.slice(0, testimonial.title.lastIndexOf(" "))}{" "}
                      <br className="md:hidden" />
                      <span className="whitespace-nowrap">{testimonial.title.slice(testimonial.title.lastIndexOf(" ") + 1)}</span>
                    </DisplayHeading>
                  </div>
                  <Testimonials />
                </div>
              </section>
            }
          />

          {/* Human Cognition × System Intelligence (Figma 5692:13015, 1855 wide on the 1920 frame).
              Two columns with no gutter: the title takes 914, the copy starts at 914 and runs 941
              to the right edge — so the body sets in three lines and the quote in three, as drawn.
              Body → quote is a tight 19 px; quote → link is 41 px. */}
          <section aria-labelledby="manifesto-title" className="text-white">
            <div className="container-page grid gap-10 pb-[clamp(80px,8.1vw,156px)] lg:grid-cols-[914fr_941fr] lg:gap-0 lg:px-[clamp(36px,1.9vw,36px)]">
              <h2 id="manifesto-title" className="max-w-[454px] text-h3 font-normal leading-[1.2] tracking-[-0.02em]">
                {manifesto.title}
              </h2>
              <div className="flex flex-col gap-[clamp(24px,2.125vw,41px)]">
                <div className="flex flex-col gap-[clamp(12px,1.01vw,19px)]">
                  <p className="text-xl leading-[1.66] text-gray-4">{manifesto.body}</p>
                  <p className="text-h2 leading-[1.09] tracking-[0.02em] text-white/80">{manifesto.quote}</p>
                </div>
                <ArrowLink href="/contact" onDark>
                  {manifesto.cta}
                </ArrowLink>
              </div>
            </div>
          </section>

          <LearningSection />
          <LearnReveal />
        </div>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("home", "WebPage"), breadcrumbSchema("home", "Home")]} />
    </>
  );
}
