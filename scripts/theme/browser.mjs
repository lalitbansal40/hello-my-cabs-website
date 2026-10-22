/** Isolated browser/axe matrix. Writes/external requests are denied unless a case mocks them. */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const base = process.env.BASE_URL;
assert.ok(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Explicit isolated origin required');
const out = arg('out'); assert.ok(out); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const results = [], failures = [], blocked = [];
const paths = arg('pages')?.split(',') ?? ['/', '/routes', '/jaipur-to-delhi-cab', '/jaipur-to-agra-cab', '/jaipur-to-delhi-round-trip-cab', '/jaipur-to-delhi-airport-cab', '/cab-service-in-jaipur', '/cab-service-in-agra', '/dzire-taxi', '/innova-crysta-taxi', '/tempo-traveller-12-seater-rental', '/guides', '/guides/one-way-or-round-trip', '/guides/group-travel-which-vehicle', '/guides/jaipur-delhi-by-road', '/rajasthan-tours', '/char-dham-yatra', '/luxury-car', '/about', '/contact', '/fares-explained', '/terms', '/privacy', '/refund', '/photo-credits', '/login', '/bookings', '/booking', '/booking/details', '/booking/theme-missing', '/booking/theme-missing/confirm', '/rate/theme-invalid', '/driver/route/theme-invalid', '/hmc-theme-unknown', '/guides/hmc-theme-unknown'];
const widths = arg('widths')?.split(',').map(Number) ?? [360, 1280];
async function pageFor(mode, width, hour) {
  const p = await browser.newPage(); await p.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 1024 });
  await p.setCacheEnabled(false);
  await p.emulateTimezone('Asia/Kolkata');
  await p.evaluateOnNewDocument((mode, hour) => {
    try { localStorage.setItem('hmc_callback_seen', String(Date.now())); if (mode) localStorage.setItem('hmc:theme:v1', mode); else localStorage.removeItem('hmc:theme:v1'); } catch { /* Denied cases have their own assertions. */ }
    if (hour !== undefined) {
      const NativeDate = Date; const fixed = new NativeDate(2026, 9, 22, hour).getTime();
      window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [fixed])); } static now() { return fixed; } };
    }
  }, mode, hour);
  await p.setRequestInterception(true);
  p.on('request', req => {
    const url = new URL(req.url());
    if (['data:', 'blob:'].includes(url.protocol)) return void req.continue();
    if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(req.method())) {
      blocked.push({ method: req.method(), origin: url.origin, path: url.pathname }); return void req.abort();
    }
    return void req.continue();
  });
  return p;
}
async function ready(p, path) {
  await p.bringToFront(); const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', e => { if (e.type() === 'error' && /hydration|hydrating|minified react/i.test(e.text())) errors.push(e.text()); });
  const response = await p.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await p.waitForFunction(() => [...document.querySelectorAll('.hmc-theme-control')].some(e => e.dataset.ready));
  await p.evaluate(() => document.fonts.ready);
  return { status: response.status(), errors };
}
async function check(name, fn) {
  try { await fn(); console.log('PASS', name); }
  catch (e) { failures.push({ name, message: e.message }); console.error('FAIL', name, e.message); }
}
async function visibleTrigger(p) {
  for (const button of await p.$$('.hmc-theme-control > button')) if (await button.evaluate(e => e.getClientRects().length > 0)) return button;
  throw Error('Visible upper chooser missing');
}
try {
  for (const mode of ['light', 'dark']) for (const path of paths) for (const width of widths) await check(`${mode} ${path} ${width}`, async () => {
    const p = await pageFor(mode, width);
    try {
      const response = await ready(p, path);
      const state = await p.evaluate(() => ({ mode: document.documentElement.dataset.themeMode, theme: document.documentElement.dataset.theme, scheme: getComputedStyle(document.documentElement).colorScheme, width: document.documentElement.scrollWidth, background: getComputedStyle(document.body).backgroundColor, chrome: [...document.querySelectorAll('meta[name="theme-color"]')].map(e => e.content) }));
      assert.equal(state.theme, mode); assert.equal(state.mode, mode); assert.equal(state.scheme, mode); assert.ok(state.width <= width + 1, `Overflow ${state.width}/${width}`); assert.equal(state.chrome.length, 1); assert.deepEqual(response.errors, []);
      assert.equal(response.status, path.includes('hmc-theme-unknown') ? 404 : 200);
      // Audit stable colours using the user's real reduced-motion setting, without changing CSS.
      // Default-motion reveal/settle behaviour is checked separately in the edge suite.
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await new Promise(r => setTimeout(r, 350));
      await p.evaluate(async () => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
      await p.addScriptTag({ content: axe });
      const violations = await p.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
      const file = `${mode}-${createHash('sha1').update(path).digest('hex').slice(0, 10)}-${width}.png`;
      await p.screenshot({ path: `${out}/${file}` });
      results.push({ mode, path, width, response, state, axeReducedMotion: true, violations, screenshot: file });
      assert.equal(violations.filter(v => ['serious', 'critical'].includes(v.impact)).length, 0, JSON.stringify(violations.filter(v => ['serious', 'critical'].includes(v.impact))));
    } finally { await p.close(); }
  });
  if (!arg('matrix-only')) {
    await check('Six Auto/manual first-content cases', async () => {
      for (const [mode, hour, expected] of [[null, 10, 'light'], [null, 22, 'dark'], ['dark', 10, 'dark'], ['light', 22, 'light'], ['auto', 6, 'light'], ['auto', 18, 'dark']]) {
        const p = await pageFor(mode, 390, hour);
        try {
          await p.evaluateOnNewDocument(() => { window.__frames = []; const take = () => { if (document.body) window.__frames.push({ theme: document.documentElement.dataset.theme, colour: getComputedStyle(document.body).backgroundColor }); if (window.__frames.length < 12) requestAnimationFrame(take); }; requestAnimationFrame(take); });
          await ready(p, '/'); const frames = await p.evaluate(() => window.__frames); assert.ok(frames.length); assert.ok(frames.every(x => x.theme === expected)); assert.ok(frames.every(x => x.colour === (expected === 'dark' ? 'rgb(21, 19, 22)' : 'rgb(252, 249, 244)'))); results.push({ firstPaint: { mode, hour, expected, frames } });
        } finally { await p.close(); }
      }
    });
    await check('Upper chooser/radio keyboard/popover boundaries and mobile drawer', async () => {
      for (const width of [320, 390, 768, 1024, 1180, 1280, 1440, 1920]) {
        const p = await pageFor('light', width);
        try {
          await ready(p, '/login'); const trigger = await visibleTrigger(p); await trigger.focus(); await p.keyboard.press('Space'); await p.waitForSelector('.hmc-theme-control fieldset');
          const rect = await p.$eval('.hmc-theme-control fieldset', e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right }; }); assert.ok(rect.left >= 0 && rect.right <= width);
          await p.keyboard.press('ArrowDown'); await p.keyboard.press('Escape'); assert.equal(await trigger.evaluate(e => e === document.activeElement), true);
          if (width < 1536) { await p.click('button[aria-label="Open menu"]'); await p.waitForSelector('[data-menu-overlay]'); await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('[data-menu-overlay]')); assert.notEqual(await p.$eval('body', e => e.style.overflow), 'hidden'); }
          results.push({ chooserWidth: width, keyboardAndDrawer: true });
        } finally { await p.close(); }
      }
    });
    await check('No-JS light and inactive chooser', async () => {
      const p = await pageFor('dark', 390); try { await p.setJavaScriptEnabled(false); await p.goto(base + '/login'); assert.equal(await p.$eval('html', e => e.dataset.theme), 'light'); assert.equal(await p.$eval('.hmc-theme-control', e => getComputedStyle(e).visibility), 'hidden'); results.push({ noJS: true }); } finally { await p.close(); }
    });
  }
} finally {
  writeFileSync(`${out}/result.json`, JSON.stringify({ passed: failures.length === 0, base, results, failures, blockedRequests: blocked }, null, 2)); await browser.close();
}
if (failures.length) process.exitCode = 1;
