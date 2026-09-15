/**
 * The card left in the car that asks for a Google review — print-ready.
 *
 *   GBP_REVIEW_URL=https://g.page/r/XXXX/review node scripts/brand/review-card.mjs
 *
 * Writes scripts/brand/review-card.html: a sheet of eight visiting-card sized cards
 * (85 × 55 mm) on A4, with crop marks' worth of gap, ready for a print shop or an office
 * printer. Open it in a browser and print at 100% (no "fit to page").
 *
 * The link is the Google Business Profile's own review link (Business Profile → "Ask for
 * reviews" → copy). Without GBP_REVIEW_URL the cards carry a visible PLACEHOLDER mark and a
 * QR to the website, so an unfinished sheet cannot be printed by mistake and handed out.
 *
 * What the card must not do — every one of these gets a Business Profile's reviews removed or
 * the profile suspended: offer anything for a review, ask only happy customers, or ask for a
 * particular star rating. It asks everyone the same plain question.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const url = process.env.GBP_REVIEW_URL?.trim() || '';
const placeholder = !/^https:\/\//.test(url);
const target = placeholder ? 'https://www.hellomycabs.com' : url;

const logo = readFileSync(new URL('../../public/logo.png', import.meta.url)).toString('base64');
const qr = await QRCode.toString(target, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });

const card = `
  <div class="card">
    ${placeholder ? '<div class="placeholder">PLACEHOLDER — set GBP_REVIEW_URL</div>' : ''}
    <div class="text">
      <img class="logo" src="data:image/png;base64,${logo}" alt="Hello My Cab" />
      <p class="ask">How was your trip?</p>
      <p class="hi">यात्रा कैसी रही?</p>
      <p class="how">Scan to tell others on Google. It takes a minute.</p>
      <p class="contact">+91 96671 11921 · hellomycabs.com</p>
    </div>
    <div class="qr">${qr}</div>
  </div>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Hello My Cab — review card</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #14130f; }
  .sheet { display: grid; grid-template-columns: repeat(2, 85mm); grid-auto-rows: 55mm; gap: 6mm 8mm; justify-content: center; }
  .card { position: relative; display: flex; gap: 4mm; align-items: center; padding: 5mm; border: 0.2mm dashed #bbb; background: #fbfaf6; overflow: hidden; }
  .text { flex: 1; min-width: 0; }
  .logo { height: 9mm; display: block; margin-bottom: 2mm; }
  .ask { margin: 0; font-size: 13pt; font-weight: 800; color: #0b2c22; }
  .hi { margin: 0.5mm 0 1.5mm; font-size: 11pt; font-weight: 700; color: #0b2c22; }
  .how { margin: 0; font-size: 7.5pt; line-height: 1.3; color: #3a3a36; }
  .contact { margin: 2mm 0 0; font-size: 6.5pt; color: #6b6a64; }
  .qr { width: 27mm; height: 27mm; flex: none; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .placeholder { position: absolute; inset: auto 0 0 0; background: #c0392b; color: #fff; font-size: 7pt; font-weight: 800; text-align: center; padding: 1mm; letter-spacing: 0.05em; }
</style>
</head>
<body>
  <div class="sheet">${card.repeat(8)}</div>
</body>
</html>
`;

writeFileSync(new URL('review-card.html', import.meta.url), html);
console.log(
  placeholder
    ? 'review-card.html written with a PLACEHOLDER mark — set GBP_REVIEW_URL for the real one.'
    : `review-card.html written — QR → ${target}`,
);
