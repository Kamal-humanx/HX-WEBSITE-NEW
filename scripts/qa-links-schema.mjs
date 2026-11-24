// QA: parse JSON-LD on every page, sanity-check required schema.org props, and verify every internal link/asset resolves.
const base = process.argv[2] ?? "http://localhost:3100";
const pages = ["/", "/about", "/works", "/careers", "/contact"];
const required = {
  Organization: ["name", "url", "logo"], WebSite: ["name", "url"], WebPage: ["name", "url"], AboutPage: ["name", "url"],
  ContactPage: ["name", "url"], CollectionPage: ["name", "url", "mainEntity"], BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"], JobPosting: ["title", "description", "hiringOrganization", "jobLocation"], ProfessionalService: ["name", "address"],
};
const seen = new Set(); const bad = []; const report = [];
for (const p of pages) {
  const html = await (await fetch(base + p)).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const nodes = blocks.flat();
  const types = nodes.map((n) => n["@type"]);
  for (const n of nodes) {
    for (const k of required[n["@type"]] ?? []) if (n[k] == null) bad.push(`${p}: ${n["@type"]} missing ${k}`);
    if (n["@context"] !== "https://schema.org") bad.push(`${p}: ${n["@type"]} bad @context`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  const jumps = levels.filter((l, i) => i && l - levels[i - 1] > 1).length;
  report.push(`${p.padEnd(9)} h1=${h1} headingJumps=${jumps} jsonld=[${types.join(", ")}] canonical=${(html.match(/rel="canonical" href="([^"]+)"/) || [])[1]} title="${(html.match(/<title>([^<]+)/) || [])[1]}"`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)) seen.add(m[1].replace(/&amp;/g, "&"));
}
for (const u of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/manifest.webmanifest", "/opengraph-image.png", "/does-not-exist"]) seen.add(u);
for (const u of [...seen].sort()) {
  const r = await fetch(base + u, { redirect: "manual" });
  const ok = u === "/does-not-exist" ? r.status === 404 : r.status < 400;
  if (!ok) bad.push(`${u} → ${r.status}`);
}
console.log(report.join("\n"));
console.log(`checked ${seen.size} internal URLs`);
console.log(bad.length ? "PROBLEMS:\n" + bad.join("\n") : "No schema or link problems.");
