import { ADDRESS, FOOTER_COPY, SITE_URL, SOCIAL } from "@/lib/site";
import { HOME } from "@/content/home";
import { ABOUT } from "@/content/about";
import { WORKS } from "@/content/works";
import { CAREERS } from "@/content/careers";
import { CONTACT } from "@/content/contact";
import { CAPABILITIES } from "@/content/shared";

export const dynamic = "force-static";

/** /llms.txt — plain-language summary for LLM crawlers, assembled only from on-site copy. */
export function GET() {
  const u = (p: string) => `${SITE_URL}${p}`;
  const unique = Array.from(new Set(WORKS.projects.map((p) => `${p.name} (${p.meta.replace(/\s+/g, " ")})`)));
  const body = `# HumanX

> ${FOOTER_COPY.manifesto}

Studio: ${ADDRESS.full}. ${ADDRESS.hours}. Contact: ${SITE_URL}/contact.

## Pages

- [Home](${u("/")}): ${HOME.hero.heading.line1}${HOME.hero.heading.line2}. Selected work: ${HOME.work.cases.map((c) => `${c.title}: ${c.description}`).join(" ")}
- [About](${u("/about")}): ${ABOUT.heading}. ${ABOUT.intro} Principles: ${ABOUT.principles.items.map((p) => `${p.title}: ${p.caption}`).join(" ")}
- [Work](${u("/works")}): ${WORKS.title}. ${WORKS.intro} Featured: ${WORKS.featured.title}. Projects: ${unique.join("; ")}.
- [Careers](${u("/careers")}): ${CAREERS.hero.brief} Open roles: ${CAREERS.openings.roles.map((r) => `${r.role} (${r.level}, ${r.location})`).join("; ")}.
- [Contact](${u("/contact")}): ${CONTACT.heading}. ${CONTACT.where.intro}

## Capabilities

${CAPABILITIES.rows.map((r) => `- ${r.title.replace("\n", " ")}: ${r.columns.flat().join(", ")}`).join("\n")}

## FAQ

${CONTACT.faq.items.filter((i) => i.a).map((i) => `- ${i.q} ${i.a}`).join("\n")}

## Official profiles

${SOCIAL.filter((x) => x.href).map((x) => `- [${x.label}](${x.href})`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
