/** Real Next error/loading documents via synthetic delayed/malformed loopback API data. */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.BASE_URL;
assert.ok(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const out = process.argv.find(a => a.startsWith('--out='))?.slice(6); assert.ok(out); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const results = [], failures = [];
async function open(mode, slowUser = false) {
  const c = await browser.createBrowserContext(), p = await c.newPage();
  await p.setViewport({ width: 390, height: 900 }); await p.setCacheEnabled(false);
  if (slowUser) await c.setCookie({ name: 'hmc_session', value: 'theme-slow-user', url: base, httpOnly: true, sameSite: 'Lax' });
  const errors = [], blocked = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.setRequestInterception(true); p.on('request', r => {
    const u = new URL(r.url());
    if (['data:', 'blob:'].includes(u.protocol)) return void r.continue();
    if (u.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(r.method())) { blocked.push(u.origin + u.pathname); return void r.abort(); }
    return void r.continue();
  });
  await p.goto(base + '/robots.txt'); await p.evaluate(mode => { localStorage.setItem('hmc:theme:v1', mode); localStorage.setItem('hmc_callback_seen', String(Date.now())); }, mode);
  return { p, close: () => c.close(), errors, blocked };
}
async function check(name, fn) {
  try { await fn(); console.log('PASS', name); } catch (e) { failures.push({ name, error: e.stack }); console.error('FAIL', name, e.message); }
}
try {
  for (const mode of ['light', 'dark']) {
    await check('Actual Next error document ' + mode, async () => {
      const c = await open(mode);
      try {
        const response = await c.p.goto(base + '/booking?tripType=one_way&pickup=THEME_ERROR&drop=DELHI&when=2027-01-01T09:00');
        await c.p.waitForFunction(() => document.querySelector('h1')?.textContent.includes('Something went wrong'));
        await c.p.waitForSelector('.hmc-theme-control[data-ready]');
        assert.equal(await c.p.$eval('html', e => e.dataset.theme), mode);
        assert.ok((await c.p.$eval('body', e => e.textContent)).includes('your booking has not been made'));
        assert.ok(!c.errors.some(e => /hydration|removeChild|#185/.test(e)));
        await c.p.screenshot({ path: `${out}/error-${mode}.png` });
        results.push({ errorDocument: mode, status: response.status(), expectedSyntheticServerError: c.errors, blocked: c.blocked });
      } finally { await c.close(); }
    });
    for (const kind of ['selection', 'details', 'detail']) await check('Actual streaming loading ' + kind + ' ' + mode, async () => {
      const c = await open(mode, kind !== 'selection');
      try {
        const query = new URLSearchParams({ tripType: 'one_way', pickup: 'THEME_SLOW_' + mode.toUpperCase() + '_' + Date.now(), drop: 'DELHI', when: '2027-01-01T09:00', quoteId: 'theme-quote', vehicleType: 'dzire', totalRupees: '4000', advanceRupees: '500' });
        const path = kind === 'selection' ? '/booking?' + query : kind === 'details' ? '/booking/details?' + query : '/booking/theme-slow-' + mode;
        const navigation = c.p.goto(base + path, { waitUntil: 'load', timeout: 60000 });
        await c.p.waitForSelector('.animate-pulse.bg-hmc-soft', { timeout: 10000 });
        const loading = await c.p.evaluate(() => ({ theme: document.documentElement.dataset.theme, background: getComputedStyle(document.querySelector('.animate-pulse.bg-hmc-soft')).backgroundColor }));
        assert.equal(loading.theme, mode); assert.equal(loading.background, mode === 'dark' ? 'rgb(48, 38, 43)' : 'rgb(255, 246, 245)');
        await c.p.screenshot({ path: `${out}/loading-${kind}-${mode}.png` });
        const response = await navigation; assert.equal(response.status(), 200);
        await c.p.waitForSelector('.hmc-theme-control[data-ready]'); assert.deepEqual(c.errors, []);
        results.push({ actualLoading: kind, mode, loading, status: response.status(), blocked: c.blocked });
      } finally { await c.close(); }
    });
  }
  await check('Encoded call links with JavaScript disabled, malformed call and stale reminder', async () => {
    const c = await open('dark');
    try {
      await c.p.setJavaScriptEnabled(false);
      await c.p.goto(base + '/c/office-%2B91%2090000%2000000');
      assert.equal(await c.p.$eval('main a[href^="tel:"]', e => e.getAttribute('href')), 'tel:+919000000000');
      assert.equal(await c.p.$eval('html', e => e.dataset.theme), 'light');
      await c.p.goto(base + '/c/not-a-number'); assert.equal(new URL(c.p.url()).pathname, '/');
      await c.p.goto(base + '/r/theme-stale'); assert.ok((await c.p.$eval('h1', e => e.textContent)).includes('expired'));
      results.push({ encodedCall: true, noDialAttempt: true, malformedRedirect: true, staleReminder: true });
    } finally { await c.close(); }
  });
} finally { writeFileSync(`${out}/result.json`, JSON.stringify({ passed: failures.length === 0, results, failures }, null, 2)); await browser.close(); }
if (failures.length) process.exitCode = 1;
