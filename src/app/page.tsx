import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ArrowLink, DisplayHeading } from "@/components/ui";
import { CapabilitiesSection, LearningSection } from "@/components/sections";
import { HOME } from "@/content/home";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("home");

/** Inline icon used inside the philosophy statement (Figma 5376:1804 "Philosophy — inline icons"). */
function InlineIcon({ src, w, h, className = "" }: { src: string; w: number; h: number; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={w}
      height={h}
      aria-hidden="true"
      className={`mx-[0.12em] inline-block h-[0.72em] w-auto align-[-0.08em] ${className}`}
    />
  );
}

const O = ({ children }: { children: React.ReactNode }) => <span className="text-accent">{children}</span>;

export default function HomePage() {
  const { hero, work, testimonial, manifesto } = HOME;

  return (
    <>
      <Header current="/" theme="overlay" />
      <main id="main">
        {/* ---------- Hero (5376:1439 image, 5376:1843 heading, 5376:1847 intro) ---------- */}
        <section aria-labelledby="hero-title" className="relative">
          <div className="relative h-[clamp(360px,27.66vw,531px)] w-full overflow-hidden bg-night">
            <Image
              src={hero.image.src}
              alt="A woman and a young girl sharing a quiet moment, lit by warm window light"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[127px] bg-gradient-to-b from-black/35 to-transparent" />
            <Image
              src="/images/icons/play.svg"
              alt=""
              width={52}
              height={52}
              aria-hidden="true"
              className="absolute left-1/2 top-[45%] size-[clamp(40px,2.73vw,52px)] -translate-x-1/2"
            />
          </div>

          <div className="container-page relative grid gap-6 pb-10 pt-[clamp(28px,3.1vw,60px)] lg:grid-cols-[1fr_auto] lg:items-start">
            <h1
              id="hero-title"
              className="relative text-h1 font-normal capitalize leading-[1.15] tracking-[-0.04em] text-ink lg:-mt-[0.15em]"
            >
              {hero.heading.line1}
              <br />
              {hero.heading.line2}
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[0.6em] bg-gradient-to-b from-white/0 to-white/70" />
            </h1>
            <p className="max-w-[465px] font-mono text-base font-medium leading-[1.4] tracking-[-0.02em] text-ink-mono lg:pt-[21px] lg:text-right">
              {hero.intro}
            </p>
          </div>
        </section>

        {/* ---------- Client logo marquee (5376:3871) ---------- */}
        <section aria-label="Clients" className="relative overflow-hidden py-[clamp(16px,1.2vw,24px)]">
          <div className="flex w-max animate-marquee motion-reduce:w-full motion-reduce:justify-center">
            {[0, 1].map((i) => (
              <Image
                key={i}
                src="/images/home/client-logos.webp"
                alt={i === 0 ? HOME.clientsAlt : ""}
                aria-hidden={i === 1 ? true : undefined}
                width={3840}
                height={231}
                sizes="(max-width: 864px) 864px, 100vw"
                className={`h-[clamp(52px,6vw,115px)] w-auto max-w-none pr-[84px] ${i === 1 ? "motion-reduce:hidden" : ""}`}
              />
            ))}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[24vw] max-w-[460px] bg-gradient-to-r from-white via-white/55 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[24vw] max-w-[460px] bg-gradient-to-l from-white via-white/55 to-transparent" />
        </section>

        {/* ---------- Philosophy statement (5376:1804) ---------- */}
        <section aria-label="Our philosophy" className="container-page pb-[clamp(72px,10vw,200px)] pt-[clamp(56px,7.5vw,144px)]">
          <p className="mx-auto max-w-[1700px] text-center text-h2 font-normal leading-[1.33] tracking-[-0.02em] text-ink-soft">
            It&apos;s a great time to <O>build</O>
            <InlineIcon src="/images/icons/build.svg" w={80} h={48} /> new ideas,
            <br className="hidden md:block" /> To shape <O>new behaviours</O>
            <InlineIcon src="/images/icons/cross.svg" w={47} h={47} className="h-[0.6em]" /> , To tell a new story
            <br className="hidden md:block" /> You need a new kind of partner, a <O>co-conspirator</O>
            <InlineIcon src="/images/icons/co-conspirator.svg" w={92} h={92} className="h-[1em] align-[-0.2em]" />
            <br className="hidden md:block" /> Who <O>connects</O>
            <InlineIcon src="/images/icons/connects.svg" w={69} h={56} /> the dots and <O>makes it</O>
            <InlineIcon src="/images/icons/bolt.svg" w={82} h={82} className="h-[1em] align-[-0.18em]" /> happen.
          </p>
        </section>

        {/* ---------- Work teaser (5376:1440 + 5 × "thumbnail explo") ---------- */}
        <section aria-labelledby="work-title" className="container-page pb-[clamp(72px,7vw,133px)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <DisplayHeading id="work-title" className="max-w-[8.6em] text-ink lg:pl-[13px]">
              {work.title}
            </DisplayHeading>
            <Link
              href="/works"
              className="link-arrow text-base capitalize leading-[1.5] text-[#181818] sm:mb-1"
            >
              {work.seeAll}
              <Image className="arrow brightness-0" src="/images/icons/arrow-orange.svg" alt="" width={9} height={9} />
            </Link>
          </div>

          <ul className="mt-[clamp(32px,3.6vw,70px)] flex flex-col gap-2">
            {work.cases.map((c, i) => (
              <li key={c.title}>
                <article
                  className={`group relative grid overflow-hidden rounded-card border border-line bg-white transition-colors hover:bg-surface-hover focus-within:bg-surface-hover md:min-h-[306px] md:grid-cols-[29.5%_1fr_minmax(0,27%)] ${
                    i === 0 ? "bg-surface-hover" : ""
                  }`}
                >
                  {/* left notch shown on the active card (Vector 6226) */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-1px] top-1/2 hidden h-[56px] w-[27px] -translate-y-1/2 border-y border-r border-line bg-white [clip-path:polygon(0_0,100%_50%,0_100%)] md:block ${
                      i === 0 ? "" : "opacity-0 group-hover:opacity-100"
                    } transition-opacity`}
                  />
                  <p className="px-6 pt-6 font-mono text-[clamp(1rem,1.25vw,1.5rem)] font-medium uppercase leading-[1.3] tracking-[-0.01em] text-black/[0.54] md:px-[56px] md:pt-[49px]">
                    {c.label}
                  </p>
                  <div className="flex flex-col gap-[clamp(20px,2.9vw,55px)] px-6 pb-6 pt-3 md:pb-[30px] md:pl-0 md:pr-6 md:pt-[30px]">
                    <div>
                      <h3 className="text-h3 font-semibold leading-[1.5] tracking-[-0.02em] text-ink">{c.title}</h3>
                      <p className="mt-1 max-w-[397px] font-mono text-base font-medium leading-[1.4] tracking-[-0.02em] text-body">
                        {c.description}
                      </p>
                    </div>
                    <ArrowLink href="/works" srSuffix={`: ${c.title}`} className="after:absolute after:inset-0 after:content-['']">
                      {work.readMore}
                    </ArrowLink>
                  </div>
                  <div className="relative m-[2px] aspect-[499/302] overflow-hidden rounded-card border-[3px] border-white md:m-0 md:mr-px md:mt-[2px] md:h-[302px] md:self-start">
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(min-width: 768px) 27vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Dark block: capabilities, testimonial, manifesto, learning ---------- */}
        <div className="bg-night">
          <CapabilitiesSection />

          {/* Testimonial (5376:2844 / Testimonials 4899:1434) */}
          <section aria-labelledby="testimonial-title" className="text-white">
            <div className="container-page pb-[var(--section-y)] pt-[clamp(40px,4.4vw,85px)] lg:px-[clamp(36px,3.75vw,72px)]">
              <DisplayHeading id="testimonial-title" className="text-white">
                {testimonial.title}
              </DisplayHeading>
              <figure className="mt-[clamp(40px,6.25vw,120px)] max-w-[1100px]">
                <blockquote>
                  <p className="text-h3 leading-[1.18] tracking-[-0.02em]">{testimonial.quote}</p>
                </blockquote>
                <figcaption className="mt-[clamp(32px,5vw,95px)] flex items-center gap-5">
                  <Image
                    src="/images/home/tarush-singhal.webp"
                    alt="Tarush Singhal"
                    width={47}
                    height={47}
                    className="size-[47px] rounded-full object-cover"
                  />
                  <span className="flex flex-col gap-2 leading-none tracking-[-0.02em]">
                    <span className="text-lg">{testimonial.name}</span>
                    <span className="font-mono text-sm text-gray-5">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>

              {/* Logo tabs (4899:1405) */}
              <ul aria-label="Clients" className="mt-[clamp(48px,5.7vw,110px)] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
                <li className="relative flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line bg-night-3 shadow-[var(--shadow-tab)]">
                  <Image src="/images/logos/apollo-247.webp" alt="Apollo 24|7" width={128} height={128} className="size-[clamp(80px,6.7vw,128px)] rounded-[30px] object-contain object-bottom" />
                </li>
                <li className="flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line">
                  <span className="relative block h-[84px] w-[76px] overflow-hidden mix-blend-screen">
                    <Image src="/images/logos/fox-star.webp" alt="Fox Star Studios" width={404} height={316} className="absolute left-[-63.82%] top-[-29.86%] h-[159.71%] w-[226.28%] max-w-none" />
                  </span>
                </li>
                <li className="flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line">
                  <Image src="/images/logos/jll.webp" alt="JLL" width={130} height={86} className="h-auto w-[clamp(96px,6.8vw,130px)] object-cover" />
                </li>
                <li className="flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line">
                  <span className="flex items-center gap-[2px]" aria-label="Quickplay" role="img">
                    <Image src="/images/logos/quickplay-mark.webp" alt="" width={35} height={35} className="size-[clamp(22px,1.83vw,35px)] mix-blend-luminosity" />
                    <span aria-hidden="true" className="font-hanken text-[clamp(22px,1.95vw,37.5px)] font-medium tracking-[-0.05em] text-white">
                      quickplay
                    </span>
                  </span>
                </li>
                <li className="flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line">
                  <span className="relative block h-[48px] w-[182px] shrink-0 overflow-hidden mix-blend-difference max-sm:scale-[0.7]">
                    <Image src="/images/logos/oml.webp" alt="OML" width={800} height={796} className="absolute left-[-18.48%] top-[-208.33%] h-[513.72%] w-[136.17%] max-w-none" />
                  </span>
                </li>
                <li className="flex h-[clamp(120px,10.9vw,210px)] items-center justify-center border border-night-line">
                  <Image src="/images/logos/ask.svg" alt="ASK" width={126} height={37} className="h-[37px] w-auto" />
                </li>
              </ul>
            </div>
          </section>

          {/* Human Cognition × System Intelligence (5376:2850) */}
          <section aria-labelledby="manifesto-title" className="text-white">
            <div className="container-page grid gap-10 pb-[clamp(80px,8.1vw,156px)] lg:grid-cols-[minmax(0,914px)_1fr] lg:px-[clamp(36px,1.9vw,36px)]">
              <h2 id="manifesto-title" className="max-w-[454px] text-h3 font-normal leading-[1.2] tracking-[-0.02em]">
                {manifesto.title}
              </h2>
              <div className="flex max-w-[941px] flex-col gap-[clamp(20px,2.1vw,40px)]">
                <p className="text-xl leading-[1.66] text-gray-4">{manifesto.body}</p>
                <p className="text-h2 leading-[1.09] tracking-[0.02em] text-white/80">{manifesto.quote}</p>
                <ArrowLink href="/contact" onDark>
                  {manifesto.cta}
                </ArrowLink>
              </div>
            </div>
          </section>

          <LearningSection />
        </div>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("home", "WebPage"), breadcrumbSchema("home", "Home")]} />
    </>
  );
}
