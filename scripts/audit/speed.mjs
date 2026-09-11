/**
 * npm run audit:speed — Core Web Vitals, measured on the conditions that decide them.
 *
 * Nobody had measured this site's speed. The responsive work assumed it was fine and the
 * SEO work leaned on "prerendered pages are fast", and neither is a number. This is.
 *
 * Mobile is measured the way Lighthouse measures it — a mid-range phone, not the laptop the
 * site is built on: four times slower CPU and a slow 4G connection. Measured on an unthrottled
 * laptop against localhost every page is fast, which is the one result that tells you
 * nothing.
 *
 *   node scripts/audit/speed.mjs                                  # local build on :3100
 *   BASE_URL=https://www.hellomycabs.com node scripts/audit/speed.mjs   # the live site
 *
 * Output: a table on the console and in /tmp/hmc-speed.md.
 * Budgets (mobile): LCP < 1.5 s · CLS < 0.1 · TBT < 200 ms. Exits 1 if any page misses one.
 */
import { writeFileSync } from 'node:fs';
import { PredefinedNetworkConditions } from 'puppeteer-core';
import { BASE, DEVICES, launch, viewport } from './common.mjs';

const PAGES = [
  ['home', '/'],
  ['route', '/jaipur-to-delhi-cab'],
  ['city', '/cab-service-in-jaipur'],
  ['vehicle', '/innova-crysta-taxi'],
  ['routes', '/routes'],
];
const DEVS = ['phone-390', 'tab-768', 'lap-1440'];
const BUDGET = { lcp: 1500, cls: 0.1, tbt: 200 };

/** Runs in the page before any of its own scripts, so no entry is missed. */
const OBSERVE = () => {
  window.__v = { lcp: 0, cls: 0, tbt: 0, lcpEl: '' };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__v.lcp = e.startTime;
      const el = e.element;
      window.__v.lcpEl = el
        ? `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}`
        : e.url || '';
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
  // Total blocking time: the part of every long task beyond 50 ms. It is what makes a tap
  // feel ignored, and it is the lab stand-in for INP.
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__v.tbt += Math.max(0, e.duration - 50);
  }).observe({ type: 'longtask', buffered: true });
};

async function measure(browser, dev, path) {
  const page = await browser.newPage();
  await viewport(page, dev);
  // A cold visit every time. The first version kept the faster of two runs, and the second
  // run came out of the browser cache — 0 kB of JavaScript, which is the number for a
  // returning visitor. Somebody arriving from a search result has nothing cached.
  await page.setCacheEnabled(false);
  const mobile = dev[0].startsWith('phone');
  if (mobile) {
    await page.emulateCPUThrottling(4);
    await page.emulateNetworkConditions(PredefinedNetworkConditions['Slow 4G']);
  }

  // Bytes by type, from the protocol rather than resource timing — cross-origin images do
  // not report a size to the page, and they are most of the weight.
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  const types = new Map();
  const bytes = { script: 0, image: 0, font: 0, total: 0 };
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type));
  cdp.on('Network.loadingFinished', (e) => {
    const t = (types.get(e.requestId) ?? '').toLowerCase();
    bytes.total += e.encodedDataLength;
    if (t === 'script') bytes.script += e.encodedDataLength;
    else if (t === 'image') bytes.image += e.encodedDataLength;
    else if (t === 'font') bytes.font += e.encodedDataLength;
  });

  await page.evaluateOnNewDocument(OBSERVE);
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  // Let late layout shifts and the LCP candidate settle, as a real visit would.
  await new Promise((r) => setTimeout(r, 2500));

  const v = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { ...window.__v, ttfb: nav ? nav.responseStart : 0 };
  });
  await page.close();
  return { ...v, bytes };
}

const browser = await launch();
const rows = [];
for (const [name, path] of PAGES) {
  for (const d of DEVS) {
    const dev = DEVICES.find((x) => x[0] === d);
    // Two cold runs, keep the faster: the first request to a freshly started server
    // measures the server warming up, not the page.
    const a = await measure(browser, dev, path);
    const b = await measure(browser, dev, path);
    const best = a.lcp <= b.lcp ? a : b;
    rows.push({ name, path, dev: d, ...best });
    process.stdout.write('.');
  }
}
await browser.close();
console.log('\n');

const kb = (n) => `${Math.round(n / 1024)}`;
const fails = [];
const lines = [
  `# Speed — ${BASE} — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
  '',
  'Mobile rows: 4× CPU throttle, Slow 4G. Budgets: LCP < 1.5 s · CLS < 0.1 · TBT < 200 ms.',
  '',
  '| page | device | LCP | CLS | TBT | TTFB | JS kB | img kB | total kB | LCP element |',
  '|---|---|---|---|---|---|---|---|---|---|',
];
for (const r of rows) {
  const bad = [];
  if (r.dev.startsWith('phone')) {
    if (r.lcp > BUDGET.lcp) bad.push('LCP');
    if (r.cls > BUDGET.cls) bad.push('CLS');
    if (r.tbt > BUDGET.tbt) bad.push('TBT');
  }
  if (bad.length) fails.push(`${r.name} ${r.dev}: ${bad.join(', ')}`);
  lines.push(
    `| ${r.name} | ${r.dev} | ${(r.lcp / 1000).toFixed(2)} s | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} ms | ${Math.round(r.ttfb)} ms | ${kb(r.bytes.script)} | ${kb(r.bytes.image)} | ${kb(r.bytes.total)} | ${r.lcpEl} |${bad.length ? ' ✗' : ''}`,
  );
}
const md = lines.join('\n');
writeFileSync('/tmp/hmc-speed.md', md);
console.log(md);
console.log('');
if (fails.length) {
  console.log(`✗ ${fails.length} over budget:\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ Every mobile page within budget');
