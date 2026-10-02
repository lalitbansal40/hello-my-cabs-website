/**
 * npm run audit:cursor — everything you can press shows the hand.
 *
 * Tailwind 4 gives <button> the arrow, and on 2 Oct 2026 only three things on the whole
 * site showed the hand: "See fares", the trip tabs, Today / Tomorrow, Select, Send code and
 * the call button all looked like text under the mouse. globals.css fixes it in one place;
 * this keeps it fixed — any page, any width, any clickable without the hand fails the run.
 *
 * Read-only: no sign-in and no quote (both write to the API the site points at).
 */
import { BASE, launch, pages, settle } from './common.mjs';

const SEL =
  'a[href], button, summary, select, label[for], [role=button], [role=tab], ' +
  'input[type=radio], input[type=checkbox], input[type=date], input[type=time]';
const WIDTHS = [
  ['lap-1280', 1280, 800, false],
  ['phone-375', 375, 812, true],
];

const browser = await launch();
const bad = [];
let checked = 0;
for (const [name, path, opts = {}] of pages()) {
  if (opts.signedIn) continue;
  for (const [dev, w, h, touch] of WIDTHS) {
    const page = await browser.newPage();
    // The call-back popup would otherwise open over whatever is being checked.
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('hmc_callback_seen', String(Date.now()));
      } catch {}
    });
    await page.setViewport({ width: w, height: h, isMobile: touch, hasTouch: touch });
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 60_000 }).catch(() => {});
    await settle(page);
    // The buttons that arrive late (call / WhatsApp) are on the page by now.
    await new Promise((r) => setTimeout(r, 3000));
    const found = await page.evaluate((sel) => {
      const out = [];
      let n = 0;
      for (const el of document.querySelectorAll(sel)) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (!el.getClientRects().length) continue;
        n++;
        const off = el.disabled || el.getAttribute('aria-disabled') === 'true';
        const want = off ? 'not-allowed' : 'pointer';
        if (cs.cursor !== want) {
          const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 40);
          out.push(`${el.tagName.toLowerCase()} "${label}" → ${cs.cursor} (want ${want})`);
        }
      }
      return { n, out };
    }, SEL);
    checked += found.n;
    for (const o of [...new Set(found.out)]) bad.push(`${name} @${dev}: ${o}`);
    await page.close();
  }
}
await browser.close();

console.log(`${checked} clickables checked`);
if (bad.length) {
  console.log(`${bad.length} without the right cursor:\n` + bad.join('\n'));
  process.exit(1);
}
console.log('every clickable shows the hand ✓');
