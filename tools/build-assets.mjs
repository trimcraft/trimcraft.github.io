// Generates the optimised images in site/assets/img from the sources in src-images.
// Run from the repository root: `npm --prefix tools ci && node tools/build-assets.mjs`.
// The output is committed, so the Pages workflow needs no build step.
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src-images");
const site = join(root, "site");
const img = join(site, "assets", "img");
await mkdir(img, { recursive: true });

// Screenshots: WebP at full width and at half width for small screens.
const screenshots = ["virtual-controls", "overlay", "connections", "hardware-test", "settings"];
for (const name of screenshots) {
  const input = join(src, `${name}.png`);
  const { width } = await sharp(input).metadata();
  for (const w of [width, Math.round(width / 2)]) {
    const out = join(img, `${name}-${w}.webp`);
    await sharp(input).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(out);
    console.log("wrote", out);
  }
}

// Close-ups: the controls panel of Virtual Controls, and the left column of overlay widgets.
const crops = [
  { from: "virtual-controls", to: "controls-closeup", region: { left: 16, top: 0, width: 1100, height: 440 }, scales: [1, 0.5] },
  { from: "overlay", to: "overlay-widgets", region: { left: 40, top: 76, width: 200, height: 492 }, scales: [1] },
];
for (const { from, to, region, scales } of crops) {
  for (const scale of scales) {
    const w = Math.round(region.width * scale);
    const out = join(img, `${to}-${w}.webp`);
    await sharp(join(src, `${from}.png`)).extract(region).resize({ width: w }).webp({ quality: 85, effort: 6 }).toFile(out);
    console.log("wrote", out);
  }
}

// Icons from the app icon.
const iconSvg = await readFile(join(src, "icon.svg"));
await copyFile(join(src, "icon.svg"), join(site, "favicon.svg"));
const png = (size) => sharp(iconSvg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 });
await png(180).toFile(join(site, "apple-touch-icon.png"));
await png(192).toFile(join(img, "icon-192.png"));
await png(512).toFile(join(img, "icon-512.png"));

// favicon.ico: a single 32x32 PNG wrapped in an ICO container (supported by every browser).
const ico32 = await png(32).toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18); // offset of the image data
await writeFile(join(site, "favicon.ico"), Buffer.concat([header, ico32]));

// Social image, 1200x630: app icon, name and tagline.
const iconInner = iconSvg
  .toString()
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "");
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.22" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#f0a030" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#f0a030" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0d1014"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(90 155) scale(0.3125)">${iconInner}</g>
  <text x="460" y="285" font-family="Segoe UI, Inter, Helvetica, Arial, sans-serif" font-size="104" font-weight="700" fill="#f3f5f7">Trimcraft</text>
  <text x="464" y="352" font-family="Segoe UI, Inter, Helvetica, Arial, sans-serif" font-size="36" fill="#aeb6c0">HOTAS &amp; cockpit toolkit</text>
  <text x="464" y="400" font-family="Segoe UI, Inter, Helvetica, Arial, sans-serif" font-size="36" fill="#aeb6c0">for flight and space sims</text>
  <text x="464" y="470" font-family="Consolas, Menlo, monospace" font-size="26" fill="#f0a030">trimcraft.github.io</text>
  <rect x="0" y="618" width="1200" height="12" fill="#f0a030"/>
</svg>`;
await sharp(Buffer.from(social)).png({ compressionLevel: 9 }).toFile(join(img, "social.png"));
console.log("wrote icons and social image");
