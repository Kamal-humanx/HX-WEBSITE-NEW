// Builds the favicon set + Open Graph image from Figma brand exports.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const BG = "#0e0e0e";
const X = "public/images/brand/humanx-x.png"; // gradient X from the logo (Figma 5376:1858)
const WORDMARK = "public/images/brand/humanx-wordmark.webp"; // footer wordmark (Figma 5376:2928)

async function square(size, pad = 0.18, bg = BG) {
  const inner = Math.round(size * (1 - pad * 2));
  const x = await sharp(X).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: x, gravity: "center" }])
    .png()
    .toBuffer();
}

for (const [file, size, pad] of [
  ["public/icon-192.png", 192, 0.18],
  ["public/icon-512.png", 512, 0.18],
  ["public/icon-maskable-512.png", 512, 0.26],
  ["public/apple-touch-icon.png", 180, 0.16],
]) {
  await writeFile(file, await square(size, pad));
}

// favicon.ico with embedded PNGs (16, 32, 48)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => square(s, 0.1)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...pngs]));

// Open Graph 1200×630: wordmark on the dark brand background with the footer glow
const glow = await sharp("public/images/brand/footer-glow.svg").resize(1700).extract({ left: 330, top: 0, width: 1200, height: 570 }).png().toBuffer();
const mark = await sharp(WORDMARK).resize(820).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
  .composite([
    { input: glow, left: 0, top: 60 },
    { input: mark, gravity: "center" },
  ])
  .png()
  .toFile("public/opengraph-image.png");

console.log("icons + OG image written");
