/**
 * Draws the brand files that have to exist as real images, from the SVG the site already
 * uses — so they can never drift from it:
 *
 *   src/app/icon.svg   →  public/favicon.ico (16, 32, 48), src/app/apple-icon.png (180)
 *   the full logo      →  public/logo.png (512) — named in the Organization structured
 *                         data, so it is the logo shown beside the company's name.
 *
 * Chrome renders them (puppeteer-core is already a dev dependency, for the audits), which
 * is what makes the curves smooth: the Pillow script this replaced had no antialiasing.
 *
 * Run after changing the mark:  node scripts/brand/make-icons.mjs
 * The output is committed; the build never runs this.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const icon = readFileSync('src/app/icon.svg', 'utf8');
// The car alone, lifted out of icon.svg so the logo uses exactly the same paths.
const car = icon.slice(icon.indexOf('<path'), icon.lastIndexOf('</g>'));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();

async function render(html, size, { transparent = false } = {}) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<html><body style="margin:0;width:${size}px;height:${size}px;overflow:hidden">${html}</body></html>`,
  );
  return page.screenshot({ type: 'png', omitBackground: transparent });
}

const iconAt = (size) =>
  render(icon.replace('<svg ', `<svg width="${size}" height="${size}" `), size, {
    transparent: true,
  });

// The tab icon: three sizes in one .ico, as PNG entries (every browser since IE9 reads them).
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await iconAt(s));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...pngs]));

// The home-screen icon on iOS: square, no transparency (iOS paints transparent as black).
// Square corners too: iOS rounds them itself, and rounding twice leaves red slivers.
writeFileSync(
  'src/app/apple-icon.png',
  await render(icon.replace('rx="7"', 'rx="0"').replace('<svg ', '<svg width="180" height="180" '), 180),
);

// The full logo, as the owner's artwork has it: red ground, white disc, car over the name.
const logo = `
<div style="width:512px;height:512px;background:#D83028;display:grid;place-items:center">
  <div style="width:468px;height:468px;border-radius:50%;background:#fff;box-shadow:0 0 0 6px #201818 inset;
              display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">
    <svg viewBox="0 0 120 30" width="380">${car}</svg>
    <div style="font:500 58px/1 'Helvetica Neue',Arial,sans-serif;letter-spacing:-2px;color:#201818">
      hello<span style="color:#D83028">my</span>cab<span style="color:#D83028;font-size:46px">.com</span>
    </div>
  </div>
</div>`;
writeFileSync('public/logo.png', await render(logo, 512));

await browser.close();
console.log('favicon.ico, apple-icon.png, logo.png written');
