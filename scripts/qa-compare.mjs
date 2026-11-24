// Side-by-side Figma vs build, split into chunks. Usage: node scripts/qa-compare.mjs home [chunks]
import sharp from "sharp";
const [name, chunksArg] = process.argv.slice(2);
const figma = `.figma/screens/${name}.png`;
const build = `.qa/${name}-1920.png`;
const W = 640;
const a = await sharp(figma).resize({ width: W }).toBuffer({ resolveWithObject: true });
const b = await sharp(build).resize({ width: W }).toBuffer({ resolveWithObject: true });
const H = Math.max(a.info.height, b.info.height);
const chunks = Number(chunksArg ?? Math.ceil(H / 1100));
const step = Math.ceil(H / chunks);
for (let i = 0; i < chunks; i++) {
  const top = i * step;
  const part = async (img) => {
    const h = Math.max(1, Math.min(step, img.info.height - top));
    if (top >= img.info.height) return sharp({ create: { width: W, height: 1, channels: 3, background: "#f0f" } }).png().toBuffer();
    return sharp(img.data).extract({ left: 0, top, width: W, height: h }).toBuffer();
  };
  await sharp({ create: { width: W * 2 + 16, height: step, channels: 3, background: "#ff00ff" } })
    .composite([{ input: await part(a), left: 0, top: 0 }, { input: await part(b), left: W + 16, top: 0 }])
    .png()
    .toFile(`.qa/cmp-${name}-${i}.png`);
}
console.log(`figma ${a.info.height}px vs build ${b.info.height}px → ${chunks} chunks`);
