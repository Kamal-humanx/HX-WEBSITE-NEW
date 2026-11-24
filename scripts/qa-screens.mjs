// QA: full-page screenshots at every target breakpoint + horizontal-overflow check.
// Usage: node scripts/qa-screens.mjs [baseUrl] [widths...]   (server must be running)
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3100";
const widths = process.argv.slice(3).map(Number).filter(Boolean);
const WIDTHS = widths.length ? widths : [320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440, 1536, 1728, 1920, 2560];
const PAGES = ["/", "/about", "/works", "/careers", "/contact", "/does-not-exist"];
const OUT = process.env.QA_OUT ?? ".qa";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const problems = [];

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    // trigger lazy images
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 600));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const offenders = [];
      {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > docW + 1 && getComputedStyle(el).position !== "fixed") {
            let clipped = false;
            for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
              const o = getComputedStyle(a);
              if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { clipped = true; break; }
            }
            if (!clipped) offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(r.right)}`);
          }
        }
      }
      return { scrollW: document.documentElement.scrollWidth, docW, offenders: offenders.slice(0, 5) };
    });
    if (overflow.scrollW > overflow.docW || overflow.offenders.length) problems.push({ w, p, ...overflow });
    const name = `${OUT}/${(p === "/" ? "home" : p.slice(1))}-${w}.png`;
    if (!process.env.QA_NO_SHOTS) await page.screenshot({ path: name, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(problems.length ? JSON.stringify(problems, null, 1) : "No horizontal overflow at any width.");
