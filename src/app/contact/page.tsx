import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ContactBlob } from "@/components/ContactBlob";
import { ContactForm } from "@/components/ContactForm";
import { CapabilitiesSection } from "@/components/sections";
import { CaseReveal } from "@/components/CaseReveal";
import { DisplayHeading } from "@/components/ui";
import { CONTACT } from "@/content/contact";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { ADDRESS, EMAIL_DOMAIN, EMAIL_USER } from "@/lib/site";
import { ORG_ID, absoluteUrl, breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("contact");

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`HumanX, ${ADDRESS.full}`)}`;

export default function ContactPage() {
  const { where, faq } = CONTACT;
  const faqWithAnswers = faq.items.filter((i) => i.a);

  return (
    <>
      <Header current="/contact" theme="light" />
      {/* rv-soft: pieces rise in gently on load and as they're scrolled to (CaseReveal, as on About);
          the hero artwork keeps its own float */}
      <main id="main" className="rv-soft">
        {/* ---------- Hero + form (5376:6866) ----------
            On the 1920 frame the form is a fixed 844px column. Kept as-is from 1440 up; between
            1024 and 1439 the columns are proportional (5 : 7), otherwise the fixed form leaves the
            heading a sliver ~120px wide on an iPad in landscape or a small laptop and clips it. */}
        <section aria-labelledby="contact-title" className="container-page grid gap-10 pb-[clamp(56px,4.2vw,80px)] pt-[clamp(16px,1vw,20px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,844px)]">
          <div className="flex flex-col">
            <h1 id="contact-title" data-rv className="max-w-[700px] lg:max-w-[36.5vw] 3xl:max-w-[700px] text-h1-xs font-normal capitalize leading-[1.15] tracking-[-0.04em] text-ink">
              {CONTACT.heading}
            </h1>
            <ContactBlob className="mx-auto mt-6 w-[min(665px,80%)] lg:ml-[12%] lg:mt-0" />
            {/* baseline-aligned: the email keeps its 44px tap target, centred, so aligning bottoms
                left it sitting higher than "Let's talk" */}
            <p data-rv className="mt-6 flex flex-wrap items-baseline gap-x-[15px] text-base leading-[1.6] text-black/90 lg:mt-auto">
              <span>Let’s talk</span>
              <ObfuscatedEmail user={EMAIL_USER} domain={EMAIL_DOMAIN} className="link-arrow min-h-11 font-medium text-black underline underline-offset-4">
                <Image className="arrow brightness-0" src="/images/icons/arrow-white.svg" alt="" width={11} height={11} />
              </ObfuscatedEmail>
            </p>
          </div>
          <ContactForm />
        </section>

        <div className="bg-night text-white">
          <CapabilitiesSection id="contact-capabilities" reveal />

          {/* ---------- Where We Are (5376:4974) ---------- */}
          <section aria-labelledby="where-title" className="container-page pb-[var(--section-y)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div data-rv>
                <DisplayHeading id="where-title" className="leading-[1.25] text-white">
                  {where.title}
                </DisplayHeading>
              </div>
              <p data-rv className="max-w-[380px] font-mono text-base font-medium leading-[1.23] tracking-[-0.02em] text-gray-6 md:text-right">
                {where.intro}
              </p>
            </div>

            {/* the map unmasks upward and settles from a slight zoom; the location card then rises in */}
            {/* Desktop: the location card (697px tall) sits on the map. The map is 1845:843 of the width,
                which on 13–16" screens is shorter than the card, so the card spilled past the map's foot
                and "View On Maps" sat on it. The map now keeps at least 812px (card + its 3.1% top inset +
                the button below it); at 1920 it is 838 as in Figma. The map picture, rings and pin live in
                one 1845:843 layer that covers the box, so the pin stays on the studio however it crops.
                Map (Nov 2026): a wider view, so the studio reads against places people know (the highway,
                Oberoi Commerz, Morgan Stanley, Aarey Metro) rather than IITC Road; the pin is a transparent
                PNG (the old one carried a black square). */}
            <div data-rv="media" className="relative mt-[clamp(24px,1.5vw,30px)] overflow-hidden lg:h-[max(812px,calc((min(100vw,1920px)-2*var(--gutter))*0.456911))]" style={{ ["--rv-r" as string]: "0px" }}>
              <div className="relative aspect-[1845/843] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto lg:[container-type:size]">
                <div className="absolute inset-0 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:aspect-[1845/843] lg:w-[max(100cqw,calc(100cqh*1845/843))] lg:-translate-x-1/2 lg:-translate-y-1/2">
                  {/* unoptimized: served as the 5400px file it is — the optimizer's largest size (3840) was being
                      stretched across ~4200 device pixels on a 2x Mac, which read as soft */}
                  <Image src="/images/contact/map-2.webp" alt="Map of Goregaon East, Mumbai, showing the HumanX studio off the Western Express Highway, opposite Oberoi Commerz and Morgan Stanley, near Aarey Metro" fill unoptimized className="object-cover" />
                  <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
                  {/* three waves pulse out from the studio's spot and fade, one after another (globals.css
                      .map-wave); reduced motion: one still ring */}
                  <span aria-hidden="true" className="absolute left-[26.6%] top-[44.1%] size-[clamp(60px,9.9vw,182px)] -translate-x-1/2 -translate-y-1/2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="map-wave absolute inset-0 rounded-full border border-accent bg-accent/15" style={{ animationDelay: `${i * 1.1}s` }} />
                    ))}
                  </span>
                  <Image src="/images/contact/pin-2.png" alt="" aria-hidden="true" width={75} height={84} className="absolute left-[26.6%] top-[43.9%] w-[clamp(36px,4vw,75px)] -translate-x-1/2 -translate-y-full" />
                </div>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill absolute bottom-[clamp(12px,1.5vw,30px)] right-[clamp(12px,1.6vw,30px)] z-10 px-5 py-2.5 text-sm"
                >
                  {where.mapsCta}
                  <span className="sr-only"> (opens Google Maps in a new tab)</span>
                  <Image src="/images/icons/arrow-white.svg" alt="" width={9} height={9} />
                </a>
              </div>

              {/* Location card (5376:4988) */}
              <address className="relative z-[1] not-italic lg:absolute lg:right-[1.2%] lg:top-[3.1%] lg:w-[513px]">
                <div data-rv className="rounded-card bg-night-3 p-4 lg:min-h-[697px]">
                  <Image src="/images/contact/studio.webp" alt="The HumanX studio lounge with orange papasan chairs and pendant lights" width={960} height={720} sizes="(min-width: 1024px) 480px, 92vw" className="aspect-[480/313] w-full rounded-[11px] object-cover" />
                  <div className="px-[15px] pb-4 pt-[clamp(20px,1.9vw,36px)]">
                    <p className="text-lg font-medium leading-[1.25] tracking-[-0.025em] text-white">{ADDRESS.label}</p>
                    <p className="mt-[30px] font-mono text-sm leading-[1.42] text-gray-3">{ADDRESS.full}</p>
                    <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                      <div>
                        <dt className="font-mono text-[12px] uppercase lg:text-[10px] leading-[1.5] tracking-[0.16em] text-gray-3">{where.hoursLabel}</dt>
                        <dd className="mt-2 font-mono text-sm text-white">{ADDRESS.hours}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[12px] uppercase lg:text-[10px] leading-[1.5] tracking-[0.16em] text-gray-3">{where.emailLabel}</dt>
                        <dd className="mt-2 font-mono text-sm text-white">
                          <ObfuscatedEmail user={EMAIL_USER} domain={EMAIL_DOMAIN} className="-my-3 inline-block py-3 hover:underline" />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </address>
            </div>
          </section>

          {/* ---------- FAQ (5376:5946 + 5376:5904…) ---------- */}
          <section aria-labelledby="faq-title" className="container-page grid gap-8 pb-[clamp(96px,10vw,200px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,916px)]">
            <div data-rv>
              <DisplayHeading id="faq-title" className="max-w-[560px] leading-[1.25] text-white">
                {faq.title}
              </DisplayHeading>
            </div>
            <ul className="border-t border-white/10 lg:mt-[clamp(0px,1vw,20px)]">
              {faq.items.map((item, i) =>
                item.a ? (
                  <li key={item.q} data-rv className="border-b border-white/10">
                    <details open={i === 0} className="group">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                        <h3 className="text-base-lg font-medium leading-[1.125]">{item.q}</h3>
                        <span aria-hidden="true" className="relative size-[18px] shrink-0">
                          <span className="absolute left-0 top-1/2 h-px w-full bg-white" />
                          <span className="absolute left-1/2 top-0 h-full w-px bg-white transition-transform group-open:scale-y-0" />
                        </span>
                      </summary>
                      <p className="max-w-[824px] pb-6 font-mono text-xs leading-[1.625] text-gray-3">{item.a}</p>
                    </details>
                  </li>
                ) : (
                  <li key={item.q} data-rv className="flex items-center justify-between gap-6 border-b border-white/10 py-6">
                    <h3 className="text-base-lg font-medium leading-[1.125]">{item.q}</h3>
                    <span aria-hidden="true" className="relative size-[18px] shrink-0 opacity-60">
                      <span className="absolute left-0 top-1/2 h-px w-full bg-white" />
                      <span className="absolute left-1/2 top-0 h-full w-px bg-white" />
                    </span>
                  </li>
                ),
              )}
            </ul>
          </section>
        </div>
      </main>
      <CaseReveal />
      <Footer />
      <JsonLd
        data={[
          webPageSchema("contact", "ContactPage", { mainEntity: { "@id": ORG_ID } }),
          breadcrumbSchema("contact", "Contact"),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqWithAnswers.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": `${ORG_ID.replace("#organization", "#studio")}`,
            name: "HumanX",
            parentOrganization: { "@id": ORG_ID },
            image: absoluteUrl("/images/contact/studio.webp"),
            address: {
              "@type": "PostalAddress",
              streetAddress: ADDRESS.streetAddress,
              addressLocality: ADDRESS.addressLocality,
              addressRegion: ADDRESS.addressRegion,
              postalCode: ADDRESS.postalCode,
              addressCountry: ADDRESS.addressCountry,
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "19:00",
            },
          },
        ]}
      />
    </>
  );
}
