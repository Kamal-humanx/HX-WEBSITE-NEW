import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FilterChips } from "@/components/FilterChips";
import { WORKS, parseMeta } from "@/content/works";
import { ORG_ID, absoluteUrl, breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata("works");

export default function WorksPage() {
  const { featured } = WORKS;
  const projects = WORKS.projects.map((p) => ({ ...p, ...parseMeta(p.meta) }));
  const available = Array.from(new Set(projects.flatMap((p) => p.tags)));

  // ItemList — unique projects that exist in the design (duplicated grid cards are listed once).
  const unique = [
    { name: featured.title, description: featured.description, image: featured.image },
    ...projects.filter((p, i) => projects.findIndex((q) => q.name === p.name) === i),
  ];
  const itemList = {
    "@type": "ItemList",
    numberOfItems: unique.length,
    itemListElement: unique.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.name,
        image: absoluteUrl(p.image),
        creator: { "@id": ORG_ID },
        ...("description" in p && p.description ? { description: p.description } : {}),
        ...("tags" in p ? { keywords: (p.tags as string[]).join(", "), dateCreated: p.year } : {}),
      },
    })),
  };

  return (
    <div className="bg-night text-white">
      <Header current="/works" theme="dark" />
      <main id="main">
        {/* ---------- Intro (5376:8763) ---------- */}
        <section aria-labelledby="works-title" className="container-page pt-[clamp(24px,2.7vw,52px)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <h1 id="works-title" className="max-w-[539px] text-h2 font-normal capitalize leading-[1.15] tracking-[-0.02em]">
              {WORKS.title}
            </h1>
            <p className="max-w-[616px] text-base leading-[1.45] text-white/85 lg:text-right">{WORKS.intro}</p>
          </div>

          {/* Filters (5376:8766) + count */}
          <div className="mt-[clamp(32px,4.2vw,81px)] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <FilterChips filters={WORKS.filters} available={available} targetId="all-work" variant="dark" label="Filter projects" />
            <p className="font-mono text-sm text-gray-2">{WORKS.count}</p>
          </div>
        </section>

        {/* ---------- Featured (5376:9736) ---------- */}
        <section aria-labelledby="featured-title" className="container-page mt-[clamp(32px,3vw,57px)]">
          <article className="relative overflow-hidden rounded-[clamp(12px,1.1vw,21px)] shadow-[inset_0_0_76.8px_rgba(255,255,255,0.2)]">
            <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[1848/739]">
              <Image
                src={featured.image}
                alt={featured.alt}
                fill
                priority
                sizes="(min-width: 1920px) 1848px, 96vw"
                className="object-cover object-right"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:hidden" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex max-w-[858px] flex-col gap-[clamp(16px,1.7vw,32px)] p-[clamp(20px,2.24vw,43px)]">
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs uppercase tracking-[-0.015em] text-white/60">{featured.label}</p>
                <h2 id="featured-title" className="text-h3-md font-medium leading-[1.15]">
                  {featured.title}
                </h2>
                <p className="font-mono text-base leading-[1.4] tracking-[-0.02em] text-[#fafaf8]">{featured.description}</p>
              </div>
              <p className="inline-flex items-center gap-1.5 text-base font-bold leading-[1.5] tracking-[-0.02em] text-accent">
                {featured.cta}
                <Image src="/images/icons/arrow-orange.svg" alt="" width={9} height={9} />
              </p>
            </div>
          </article>
        </section>

        {/* ---------- All work grid ---------- */}
        <section aria-labelledby="all-work-title" className="container-page pb-[clamp(80px,8vw,160px)] pt-[clamp(40px,3.7vw,71px)]">
          <h2 id="all-work-title" className="font-mono text-[15px] font-normal">
            {WORKS.allWork}
          </h2>
          <ul id="all-work" className="mt-[clamp(24px,2.1vw,42px)] grid gap-x-6 gap-y-[clamp(40px,4.3vw,82px)] md:grid-cols-2">
            {projects.map((p, i) => (
              <li key={`${p.name}-${i}`} data-tags={p.tags.join("|")}>
                <article>
                  <div className="relative aspect-[912/640] overflow-hidden rounded-panel bg-night-2">
                    <Image src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 48vw, 92vw" className="object-cover" />
                    {p.logo && (
                      <Image
                        src="/images/work/momverse-logo.svg"
                        alt=""
                        width={267}
                        height={183}
                        className="absolute left-[12%] top-[32.3%] w-[29.2%]"
                      />
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-hanken text-xl font-medium">{p.name}</h3>
                    <p className="font-mono text-[15px] text-gray-2">{p.meta}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
      <JsonLd data={[webPageSchema("works", "CollectionPage", { mainEntity: itemList }), breadcrumbSchema("works", "Work")]} />
    </div>
  );
}
