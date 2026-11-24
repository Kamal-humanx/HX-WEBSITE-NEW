import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FilterChips } from "@/components/FilterChips";
import { IstClock } from "@/components/IstClock";
import { CareersMotion, MOTION_GATE_SCRIPT } from "@/components/careers/CareersMotion";
import "./careers.css";
import { PillLink } from "@/components/ui";
import { CAREERS } from "@/content/careers";
import { EMAIL } from "@/lib/site";
import { ORG_ID, breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("careers");

const applyHref = (role: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(`Application: ${role}`)}`;

function Chip({ label, selected }: { label: string; selected: boolean }) {
  return (
    <li
      className={`flex items-center gap-[14px] rounded-full border px-5 py-3 font-mono text-sm leading-[1.5] ${
        selected ? "border-[rgba(250,250,248,0.82)] bg-white/[0.06] text-white" : "border-[#383838] text-gray-2"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-3 shrink-0 rounded-full border ${selected ? "border-accent bg-accent" : "border-[#5a5a5a]"}`}
      />
      {label}
      {selected && <span className="sr-only">(selected)</span>}
    </li>
  );
}

function GroupTitle({ n, title, id }: { n: string; title: string; id: string }) {
  return (
    <h3 id={id} className="flex items-baseline gap-[14px] text-h3 font-normal leading-[1.2] tracking-[-0.03em]">
      <span className="font-mono text-sm tracking-normal text-gray">{n}</span>
      {title}
    </h3>
  );
}

export default function CareersPage() {
  const { hero, manifesto, mutation, openings } = CAREERS;
  const { record } = mutation;

  const jobPostings = openings.roles.map((r) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: r.role,
    // Only design-provided facts. datePosted/description/employmentType are not in Figma (see REPORT.md).
    description: `<p>${r.role} — ${r.level} — ${r.location}</p>`,
    hiringOrganization: { "@id": ORG_ID, "@type": "Organization", name: "HumanX" },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: r.location, addressRegion: "Maharashtra", addressCountry: "IN" },
    },
    directApply: false,
  }));

  return (
    <>
      <Header current="/careers" variant="careers" />
      <main id="main" className="hxc" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE_SCRIPT }} />
        <CareersMotion />
        {/* ---------- Hero (5521:353) ---------- */}
        <section aria-labelledby="careers-title" data-hxc-scene className="relative isolate overflow-hidden bg-night text-white">
          <div className="container-page relative flex min-h-[clamp(620px,100dvh,1080px)] flex-col pb-6 pt-[calc(var(--header-h)+var(--header-gap)+clamp(24px,2.8vw,54px))]">
            <div className="relative flex flex-1 flex-col gap-10">
              <h1
                id="careers-title"
                className="relative text-hero font-normal leading-[0.92] tracking-[-0.04em] [isolation:isolate]"
              >
                <span className="block lg:pl-[25px]">{hero.line1}</span>
                <span className="mt-[0.45em] block lg:pl-[25px]">{hero.line2}</span>
                {/* Canvas square (5521:355) + "Edges." with blend so the overlap reads dark, as in Figma.
                    Positions are % of the 1848px content box: square x 822 (44.5%), "Edges." x 978 (52.9%). */}
                <span className="relative block h-[clamp(200px,23vw,440px)]">
                  <span
                    aria-hidden="true"
                    className="absolute left-[30%] top-0 h-[clamp(120px,15.8vw,304px)] w-[clamp(150px,21.1vw,390px)] bg-white lg:left-[44.5%]"
                  />
                  <span className="absolute left-[38%] top-[clamp(64px,10.1vw,195px)] text-display leading-[1.15] tracking-[-0.04em] mix-blend-difference lg:left-[52.9%]">
                    {hero.line3}
                    <span className="text-accent">.</span>
                  </span>
                </span>
              </h1>
              <div className="flex flex-col gap-10 lg:absolute lg:right-0 lg:top-[1.5vw] lg:w-[min(486px,30vw)]">
                <p className="text-lg leading-[1.6] text-white/90">{hero.brief}</p>
                <div className="flex flex-wrap items-center gap-7">
                  <PillLink href="#openings" className="gap-4 pl-[18px] pr-4">
                    {hero.primaryCta}
                  </PillLink>
                  <Link href="#mutation" className="link-arrow text-base leading-[1.5] text-white">
                    {hero.secondaryCta}
                    <Image className="arrow" src="/images/icons/arrow-white.svg" alt="" width={9} height={9} />
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between font-mono text-sm leading-[1.5] text-white/60">
              <p>{hero.location}</p>
              <IstClock />
            </div>
          </div>
        </section>

        {/* ---------- Manifesto (5521:1290) ---------- */}
        <section aria-labelledby="manifesto-title" className="bg-white">
          <div className="container-page pb-[clamp(80px,10.4vw,200px)] pt-[var(--section-y)]">
            <h2
              id="manifesto-title"
              className="bg-gradient-to-b from-[#262626] to-[#6b6b6b] bg-clip-text text-h1 font-normal leading-[1.23] tracking-[-0.04em] text-transparent"
            >
              {manifesto.line1}
              <Image
                src="/images/icons/cross.svg"
                alt=""
                width={61}
                height={61}
                aria-hidden="true"
                className="ml-[0.1em] inline-block h-[0.64em] w-auto align-[0.02em]"
              />
              <br />
              {manifesto.line2}
              <span className="text-accent">.</span>
            </h2>

            <div className="mt-[clamp(40px,3.6vw,70px)] grid items-center gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,1088px)] lg:gap-[clamp(40px,6.25vw,120px)]">
              <div className="flex flex-col gap-9">
                <div className="flex items-center gap-4">
                  <p className="font-mono text-sm leading-[1.5] text-ink">
                    <span className="font-medium">{manifesto.step.current}</span>
                    {manifesto.step.total}
                  </p>
                  <span aria-hidden="true" className="flex gap-1.5">
                    <span className="h-2 w-12 bg-[url('/images/about/bar-ticks.svg')] bg-[length:298px_8px] opacity-60" />
                    <span className="h-2 w-12 bg-gradient-to-r from-accent to-[#f4a06b]" />
                    <span className="h-2 w-12 bg-[url('/images/about/bar-ticks.svg')] bg-[length:298px_8px] opacity-60" />
                  </span>
                </div>
                <h3 className="bg-gradient-to-b from-[#262626] to-[#6b6b6b] bg-clip-text text-h2-sm font-normal leading-[1.12] tracking-[-0.03em] text-transparent">
                  {manifesto.title[0]}
                  <br />
                  {manifesto.title[1]}
                </h3>
                <p className="max-w-[560px] text-lg leading-[1.6] text-body-soft">{manifesto.body}</p>
              </div>
              <Image
                src="/images/careers/move-the-needle.webp"
                alt={manifesto.diagramAlt}
                width={1088}
                height={982}
                sizes="(min-width: 1024px) 57vw, 100vw"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* ---------- Mutant Gene (5521:2291) ---------- */}
        <section id="mutation" aria-labelledby="mutation-title" className="bg-night text-white">
          <div className="container-page py-[var(--section-y)]">
            <h2 id="mutation-title" className="text-h2 font-normal leading-[1.15] tracking-[-0.02em]">
              {mutation.title}
            </h2>

            <div className="mt-[23px] grid gap-12 [&>*]:min-w-0 md:grid-cols-2 xl:grid-cols-[minmax(0,345px)_minmax(0,504px)_minmax(0,345px)_minmax(0,436px)] xl:justify-between xl:gap-6">
              <div className="flex flex-col gap-6 xl:pt-[116px]">
                <GroupTitle n={mutation.humanEdge.n} title={mutation.humanEdge.title} id="human-edge" />
                <ul aria-labelledby="human-edge" className="flex flex-col gap-2">
                  {mutation.humanEdge.options.map((o) => (
                    <Chip key={o} label={o} selected={o === mutation.humanEdge.selected} />
                  ))}
                </ul>
              </div>

              <Image
                src="/images/careers/helix.webp"
                alt=""
                width={505}
                height={726}
                aria-hidden="true"
                className="mx-auto hidden w-full max-w-[504px] md:block md:order-last md:col-span-2 md:max-w-[320px] xl:order-none xl:col-span-1 xl:block xl:max-w-[504px]"
              />

              <div className="flex flex-col gap-6 xl:pt-[116px]">
                <GroupTitle n={mutation.xStrand.n} title={mutation.xStrand.title} id="x-strand" />
                <ul aria-labelledby="x-strand" className="flex flex-col gap-2">
                  {mutation.xStrand.options.map((o) => (
                    <Chip key={o} label={o} selected={o === mutation.xStrand.selected} />
                  ))}
                </ul>
              </div>

              {/* Record (5521:2348) */}
              <aside aria-label={record.specimen} className="border-l border-accent pl-[40px] xl:mt-[115px] xl:self-start">
                <p className="font-mono text-sm leading-[1.5] text-white/80">{record.specimen}</p>
                <p className="mt-[clamp(32px,3vw,62px)] text-h3-lg leading-[1.08] tracking-[-0.03em]">
                  {record.titleLead}
                  <span className="text-accent">{record.titleAccent}</span>
                  <br />
                  {record.titleEnd}
                </p>
                <dl className="mt-[clamp(32px,2.7vw,52px)] border-t border-white/[0.12] pt-6">
                  <div className="flex items-center gap-6">
                    <dt className="w-[110px] shrink-0 font-mono text-sm leading-[1.5] text-gray sm:w-[140px]">{record.matchedRoleLabel}</dt>
                    <dd>
                      <Link href="#openings" className="link-arrow min-h-0 text-base-lg font-normal leading-[1.4]">
                        {record.matchedRole}
                        <Image className="arrow" src="/images/icons/arrow-orange.svg" alt="" width={8} height={8} />
                      </Link>
                    </dd>
                  </div>
                  <div className="mt-5 flex items-center gap-6">
                    <dt className="w-[110px] shrink-0 font-mono text-sm leading-[1.5] text-gray sm:w-[140px]">{record.sequenceLabel}</dt>
                    <dd className="min-w-0 break-all font-mono text-base leading-[1.4] tracking-[0.18em]">
                      {record.sequence.map(([t, accent], i) => (
                        <span key={i} className={accent ? "text-accent" : undefined}>
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
                <PillLink href="#openings" className="mt-[clamp(32px,3.2vw,62px)] w-full">
                  {record.cta}
                </PillLink>
              </aside>
            </div>

            <div className="mt-[clamp(48px,4vw,80px)] flex flex-col gap-6">
              <GroupTitle n={mutation.years.n} title={mutation.years.title} id="years" />
              <ul aria-labelledby="years" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {mutation.years.options.map((o) => {
                  const sel = o.range === mutation.years.selected;
                  return (
                    <li
                      key={o.range}
                      className={`flex flex-col gap-2 rounded-card border px-6 py-5 ${
                        sel ? "border-[rgba(250,250,248,0.82)] bg-white/[0.06]" : "border-[#383838]"
                      }`}
                    >
                      <span className="font-mono text-base text-white">{o.range}</span>
                      <span className={`text-sm ${sel ? "text-white" : "text-gray-2"}`}>{o.label}</span>
                      {sel && <span className="sr-only">(selected)</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Openings (5521:2380) ---------- */}
        <section id="openings" aria-labelledby="openings-title" className="bg-white">
          <div className="container-page py-[var(--section-y)]">
            <h2 id="openings-title" className="text-h1-sm font-normal leading-[1.25] tracking-[-0.02em] text-ink">
              {openings.title}
            </h2>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <FilterChips
                filters={openings.filters}
                available={openings.roles.map((r) => r.level)}
                targetId="openings-table"
                variant="light"
                label="Filter roles by level"
              />
              <p className="font-mono text-sm leading-[1.5] text-[#6b6b6b]">{openings.count}</p>
            </div>

            <table className="mt-[clamp(32px,3vw,56px)] w-full border-collapse text-left">
              <thead className="max-md:sr-only">
                <tr className="border-b border-[#b9b9b9] font-mono text-xs uppercase leading-[1.4] tracking-[0.12em] text-[#6b6b6b]">
                  <th scope="col" className="w-[8%] pb-4 font-normal">{openings.columns.n}</th>
                  <th scope="col" className="pb-4 font-normal">{openings.columns.role}</th>
                  <th scope="col" className="w-[12%] pb-4 font-normal">{openings.columns.level}</th>
                  <th scope="col" className="w-[16%] pb-4 font-normal">{openings.columns.location}</th>
                  <th scope="col" className="w-[8%] pb-4 font-normal">
                    <span className="sr-only">{openings.apply}</span>
                  </th>
                </tr>
              </thead>
              <tbody id="openings-table">
                {openings.roles.map((r) => (
                  <tr
                    key={r.n}
                    data-tags={r.level}
                    className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-b border-[#e5e5e5] py-6 md:table-row md:py-0"
                  >
                    <td className={`font-mono text-base leading-[1.4] md:py-[34px] ${r.match ? "text-accent-ink" : "text-body"}`}>{r.n}</td>
                    <th scope="row" className="text-left font-normal md:py-[34px]">
                      <span className="text-h3 leading-[1.2] tracking-[-0.03em] text-ink">{r.role}</span>
                      {r.match && (
                        <span className="ml-4 align-middle font-mono text-xs font-bold uppercase leading-[1.4] tracking-[0.16em] text-accent-ink">
                          {openings.match}
                        </span>
                      )}
                    </th>
                    <td className="col-start-2 font-mono text-base leading-[1.4] text-body md:py-[34px]">
                      <span className="md:sr-only">{openings.columns.level}: </span>
                      {r.level}
                    </td>
                    <td className="col-start-2 font-mono text-base leading-[1.4] text-body md:py-[34px]">
                      <span className="md:sr-only">{openings.columns.location}: </span>
                      {r.location}
                    </td>
                    <td className="col-start-2 md:py-[34px] md:text-right">
                      <a href={applyHref(r.role)} className="link-arrow text-base leading-[1.5] text-black">
                        {openings.apply}
                        <span className="sr-only">: {r.role}</span>
                        <Image className="arrow brightness-0" src="/images/icons/arrow-orange.svg" alt="" width={9} height={9} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("careers", "WebPage"), breadcrumbSchema("careers", "Careers"), ...jobPostings]} />
    </>
  );
}
