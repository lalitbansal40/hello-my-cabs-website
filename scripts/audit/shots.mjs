/**
 * npm run audit:shots — full-page screenshots of every page on every device, plus the
 * states nobody sees by loading a page: the open menu, the city list, an open question, the
 * cancel dialog, a price about to expire, a driver told this is not their site.
 *
 * Written to /tmp/hmc-shots, never into the repo. Filter with --pages=home,route and
 * --devices=phone-375,tab-768.
 */
import { mkdirSync } from 'node:fs';
import { BASE, DEVICES, context, launch, pages, settle, viewport } from './common.mjs';

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3).split(',');
const onlyPages = arg('pages');
const onlyDevs = arg('devices');
const OUT = '/tmp/hmc-shots';

const browser = await launch();
const signed = await browser.createBrowserContext();
const anon = await browser.createBrowserContext();
const ctx = await context(await signed.newPage());
const devs = DEVICES.filter((d) => !onlyDevs || onlyDevs.includes(d[0]));

for (const [pname, path, opts = {}] of pages(ctx).filter(([n]) => !onlyPages || onlyPages.includes(n))) {
  mkdirSync(`${OUT}/${pname}`, { recursive: true });
  for (const dev of devs) {
    const page = await (opts.signedIn ? signed : anon).newPage();
    await viewport(page, dev);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    await settle(page);
    // Scroll through once so scroll-driven reveals have run, then back to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${OUT}/${pname}/${dev[0]}.png`, fullPage: true, captureBeyondViewport: true });
    await page.close();
  }
  console.log(`  ${pname} ✓`);
}

// ── States ───────────────────────────────────────────────────────────────────
mkdirSync(`${OUT}/_states`, { recursive: true });
const stateDevs = devs.filter((d) => ['phone-320', 'phone-375', 'tab-768', 'tab-1024l', 'lap-1440'].includes(d[0]));
for (const dev of stateDevs) {
  const p = await anon.newPage();
  await viewport(p, dev);

  // mobile menu
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await settle(p);
  const menu = await p.$('button[aria-label="Open menu"]');
  if (menu && (await menu.boundingBox())) {
    await menu.click();
    await new Promise((r) => setTimeout(r, 400));
    await p.screenshot({ path: `${OUT}/_states/menu-${dev[0]}.png` });
    await p.keyboard.press('Escape');
  }

  // city dropdown, typed the way a person types
  const pick = await p.$('input[role="combobox"]');
  if (pick) {
    await pick.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await pick.click();
    await p.keyboard.type('jai', { delay: 60 });
    await new Promise((r) => setTimeout(r, 900));
    await p.keyboard.press('ArrowDown');
    await p.screenshot({ path: `${OUT}/_states/dropdown-${dev[0]}.png` });
  }

  // an open question
  await p.goto(`${BASE}/jaipur-to-delhi-cab`, { waitUntil: 'domcontentloaded' });
  await settle(p);
  const q = await p.$$('button[aria-expanded], summary');
  if (q[0]) {
    await q[0].evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await q[0].click();
    await new Promise((r) => setTimeout(r, 400));
    await p.screenshot({ path: `${OUT}/_states/faq-${dev[0]}.png` });
  }

  // the price about to expire (five minutes left)
  const soon = new Date(Date.now() + 5 * 60_000).toISOString();
  if (ctx.quoteId) {
    await p.goto(
      `${BASE}/booking/details?quoteId=${ctx.quoteId}&vehicleType=dzire&vehicleLabel=Dzire&tripType=one_way&pickup=JAIPUR&drop=DELHI&when=2030-01-01T10:00&expiresAt=${encodeURIComponent(soon)}`,
      { waitUntil: 'domcontentloaded' },
    );
    await settle(p);
    await new Promise((r) => setTimeout(r, 1200));
    await p.screenshot({ path: `${OUT}/_states/timer-${dev[0]}.png`, fullPage: true, captureBeyondViewport: true });
  }
  await p.close();

  // signed in: cancel dialog
  if (ctx.bookingId) {
    const s = await signed.newPage();
    await viewport(s, dev);
    await s.goto(`${BASE}/booking/${ctx.bookingId}`, { waitUntil: 'domcontentloaded' });
    await settle(s);
    const cancel = await s.evaluateHandle(() =>
      [...document.querySelectorAll('button')].find((b) => /cancel this booking/i.test(b.textContent)),
    );
    if (cancel.asElement()) {
      await cancel.asElement().click();
      await new Promise((r) => setTimeout(r, 900));
      await s.screenshot({ path: `${OUT}/_states/cancel-${dev[0]}.png`, fullPage: true, captureBeyondViewport: true });
    }
    await s.close();
  }
}

// A driver's account on the customer site.
const drv = await browser.createBrowserContext();
const d = await drv.newPage();
await viewport(d, DEVICES.find((x) => x[0] === 'phone-375'));
await d.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await d.evaluate(() =>
  fetch('/api/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone: '919000000001', code: '123456', name: 'Driver' }),
  }),
);
await d.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await settle(d);
await d.screenshot({ path: `${OUT}/_states/not-a-customer-phone-375.png`, fullPage: true, captureBeyondViewport: true });

await browser.close();
console.log(`  states ✓  →  ${OUT}`);
