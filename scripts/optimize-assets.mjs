// Converts raw Figma exports (.figma/raw) into optimized web assets (public/images).
// Run: node scripts/optimize-assets.mjs
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const RAW = ".figma/raw";
const OUT = "public/images";

/** [source, destination, maxWidth] — destination extension decides the format */
const jobs = [
  // shared
  ["home/logo.png", "brand/humanx-logo.png", 463],
  ["home/footer-glow.svg", "brand/footer-glow.svg"],
  ["home/footer-line.svg", "brand/footer-line.svg"],
  ["home/ai-gemini.svg", "icons/ai-gemini.svg"],
  ["home/ai-claude.svg", "icons/ai-claude.svg"],
  ["home/ai-openai.svg", "icons/ai-openai.svg"],
  ["home/arrow-read.svg", "icons/arrow-orange.svg"],
  ["home/arrow-white.svg", "icons/arrow-white.svg"],
  ["home/arrow-cta.svg", "icons/arrow-cta.svg"],
  ["home/play.svg", "icons/play.svg"],
  // home
  ["home/hero_export.png", "home/hero.webp", 1920],
  ["home/logos-strip.png", "home/client-logos.webp", 3840],
  ["home/icon-build.svg", "icons/build.svg"],
  ["home/icon-cross.svg", "icons/cross.svg"],
  ["home/icon-coconspirator.svg", "icons/co-conspirator.svg"],
  ["home/icon-connects.svg", "icons/connects.svg"],
  ["home/icon-bolt.svg", "icons/bolt.svg"],
  ["home/case-bial.png", "work/bial-thumb.webp", 1006],
  ["home/case-amazon.png", "work/amazon-now-thumb.webp", 998],
  ["home/case-juice.png", "work/juice-ai-thumb.webp", 998],
  ["home/case-apollo.png", "work/apollo-momverse-thumb.webp", 998],
  ["home/case-aadhaar.png", "work/myaadhaar-thumb.webp", 1006],
  ["home/headshot.png", "home/tarush-singhal.webp", 200],
  ["home/logo-apollo.png", "logos/apollo-247.webp", 583],
  ["home/logo-fox.png", "logos/fox-star.webp", 404],
  ["home/logo-jll.png", "logos/jll.webp", 260],
  ["home/logo-quickplay.png", "logos/quickplay-mark.webp", 200],
  ["home/logo-oml.png", "logos/oml.webp", 800],
  ["home/logo-ask.svg", "logos/ask.svg"],
  ["home/blog-podcast.png", "learning/join-the-conversation.webp", 1131],
  ["home/blog-workshop.png", "learning/crafting-the-one-thing.webp", 1159],
  ["home/blog-perspective.png", "learning/shreya-gulati.webp", 1157],
  // about
  ...["devang", "aayush", "shreya", "jay", "abhishek", "sukhada-visual", "sukhada-product", "krupali", "anushka"].map(
    (n) => [`about/team-${n}.png`, `team/${n}.webp`, 852],
  ),
  ...[1, 2, 3, 4, 5, 6].map((n) => [`about/car-${n}.png`, `about/studio-${n}.webp`, 1672]),
  ["about/showreel-bg.png", "about/showreel.webp", 2208],
  ["about/bar-ticks.svg", "about/bar-ticks.svg"],
  ["about/bar-fill.png", "about/bar-fill.webp", 640],
  ["about/arrow-join.svg", "icons/arrow-white-sm.svg"],
  // contact
  ["contact/blob.png", "contact/x-blob.webp", 1331],
  ["contact/pin.png", "contact/pin.png", 224],
  ["contact/location.png", "contact/studio.webp", 960],
  // works
  ["works/featured.png", "work/bial-featured.webp", 1848],
  ["works/nothing.png", "work/nothing.webp", 912],
  ["works/momverse.png", "work/momverse.webp", 912],
  ["works/momverse-logo.svg", "work/momverse-logo.svg"],
  ["works/myaadhaar.png", "work/myaadhaar.webp", 912],
  ["works/juice.png", "work/juice-ai.webp", 912],
  ["works/quickplay.png", "work/quickplay.webp", 912],
  ["works/stream.png", "work/stream-discovery.webp", 912],
  // careers
  ["careers/needle.png", "careers/move-the-needle.webp", 1088],
  ["careers/helix-render.png", "careers/helix.webp", 505],
];

for (const [src, dest, width] of jobs) {
  const from = path.join(RAW, src);
  const to = path.join(OUT, dest);
  await mkdir(path.dirname(to), { recursive: true });
  const ext = path.extname(dest);
  if (ext === ".svg") {
    await copyFile(from, to);
  } else {
    let img = sharp(from);
    if (width) img = img.resize({ width, withoutEnlargement: true });
    if (ext === ".webp") img = img.webp({ quality: 82, effort: 5 });
    else img = img.png({ compressionLevel: 9, palette: true });
    const info = await img.toFile(to);
    console.log(dest, info.width + "x" + info.height, Math.round(info.size / 1024) + "KB");
  }
}

// Footer wordmark: the Figma export carries the frame's dark fill — key it out to transparency.
{
  const { data, info } = await sharp(path.join(RAW, "home/wordmark.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const m = Math.max(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = Math.min(data[i + 3], Math.max(0, Math.min(255, Math.round(((m - 18) * 255) / 60))));
  }
  await sharp(data, { raw: info }).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(OUT, "brand/humanx-wordmark.webp"));
}

// Contact map: Figma stretches the 1024×413 map to the 1845×843 frame — bake that aspect in so it can use object-cover.
await sharp(path.join(RAW, "contact/map.png")).resize(1600, 731, { fit: "fill" }).webp({ quality: 82 }).toFile(path.join(OUT, "contact/map.webp"));
