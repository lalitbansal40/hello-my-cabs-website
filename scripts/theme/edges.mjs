/** Local browser lifecycle, first-paint and accessibility edges. Never permits external writes. */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const base = process.env.BASE_URL;
assert.ok(base && ['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const out = process.argv.find(a => a.startsWith('--out='))?.slice(6); assert.ok(out); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const results = [], failures = [], denied = [];
let executedCases = 0;
const pause = ms => new Promise(r => setTimeout(r, ms));
async function page(context, mode = 'dark', width = 390, height = 900) {
  const p = await context.newPage(); await p.setViewport({ width, height }); await p.setCacheEnabled(false);
  const errors = [], writes = [];
  p.on('pageerror', e => errors.push(e.stack ?? e.message));
  await p.setRequestInterception(true); p.on('request', r => {
    const u = new URL(r.url());
    if (['data:', 'blob:'].includes(u.protocol)) return void r.continue();
    if (u.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(r.method())) { denied.push(u.origin + u.pathname); writes.push(u.pathname); return void r.abort(); }
    return void r.continue();
  });
  await p.goto(base + '/robots.txt');
  await p.evaluate(mode => { localStorage.setItem('hmc:theme:v1', mode); localStorage.setItem('hmc_callback_seen', String(Date.now())); localStorage.setItem('sentinel', 'preserve'); }, mode);
  return { p, errors, writes };
}
async function ready(p, path = '/login') {
  await p.bringToFront(); await p.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await p.waitForFunction(() => [...document.querySelectorAll('.hmc-theme-control')].some(e => e.dataset.ready));
  await p.evaluate(() => document.fonts.ready);
}
async function theme(p, value) {
  await p.evaluate(value => { localStorage.setItem('hmc:theme:v1', value); dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: value })); }, value);
  await p.waitForFunction(value => document.documentElement.dataset.themeMode === value, {}, value);
}
async function check(name, fn) {
  const only = process.argv.find(a => a.startsWith('--case='))?.slice(7);
  if (only && !name.toLowerCase().includes(only.toLowerCase())) return;
  executedCases++;
  const c = await browser.createBrowserContext();
  try { await fn(c); results.push({ name, passed: true }); console.log('PASS', name); }
  catch (e) { failures.push({ name, error: e.stack }); console.error('FAIL', name, e.message); }
  finally { await c.close(); }
}
try {
  await check('Auto boundary, labelled hidden/resume/BFCache simulation and single live clock', async c => {
    const { p, errors } = await page(c, 'auto');
    await p.emulateTimezone('Asia/Kolkata');
    await p.evaluateOnNewDocument(() => {
      const NativeDate = Date; window.__themeNow = new NativeDate('2026-10-22T17:59:59.990+05:30').getTime();
      window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [window.__themeNow])); } static now() { return window.__themeNow; } };
      window.__themeHidden = false; Object.defineProperty(document, 'hidden', { get: () => window.__themeHidden });
      window.__storageListeners = { added: 0, removed: 0, active: new Set() };
      const addListener = window.addEventListener.bind(window), removeListener = window.removeEventListener.bind(window);
      window.addEventListener = (type, fn, ...args) => { if (type === 'storage') { window.__storageListeners.added++; window.__storageListeners.active.add(fn); } return addListener(type, fn, ...args); };
      window.removeEventListener = (type, fn, ...args) => { if (type === 'storage') { window.__storageListeners.removed++; window.__storageListeners.active.delete(fn); } return removeListener(type, fn, ...args); };
      window.__clockJobs = new Map(); const set = window.setTimeout.bind(window), clear = window.clearTimeout.bind(window);
      window.setTimeout = (fn, ms, ...args) => { const id = set(() => { window.__clockJobs.delete(id); fn(...args); }, ms); if (ms === 10 || ms === 60000) window.__clockJobs.set(id, ms); return id; };
      window.clearTimeout = id => { window.__clockJobs.delete(id); clear(id); };
    });
    await ready(p); assert.equal(await p.$eval('html', e => e.dataset.theme), 'light');
    const listeners = await p.evaluate(() => ({ added: window.__storageListeners.added, removed: window.__storageListeners.removed, active: window.__storageListeners.active.size }));
    assert.equal(listeners.active, 1);
    if (process.argv.includes('--strict')) assert.ok(listeners.added >= 2 && listeners.removed >= 1, JSON.stringify(listeners));
    writeFileSync(`${out}/lifecycle-listeners.json`, JSON.stringify({ actualDevStrictReplay: process.argv.includes('--strict'), listeners }, null, 2));
    await p.evaluate(() => { window.__themeNow += 10; dispatchEvent(new Event('focus')); });
    await p.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.equal(await p.evaluate(() => window.__clockJobs.size), 1);
    await p.evaluate(() => { window.__themeHidden = true; document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await p.evaluate(() => window.__clockJobs.size), 0);
    await p.evaluate(() => { window.__themeNow = new Date('2026-10-23T07:00:00+05:30').getTime(); window.__themeHidden = false; document.dispatchEvent(new Event('visibilitychange')); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
    assert.equal(await p.$eval('html', e => e.dataset.theme), 'light'); assert.equal(await p.evaluate(() => window.__clockJobs.size), 1);
    await theme(p, 'dark'); assert.equal(await p.evaluate(() => window.__clockJobs.size), 0);
    await p.evaluate(() => { window.__themeNow = new Date('2026-10-22T05:00:00+05:30').getTime(); dispatchEvent(new Event('focus')); });
    assert.equal(await p.$eval('html', e => e.dataset.theme), 'dark'); assert.deepEqual(errors, []);
  });
  await check('Real two-tab storage write/remove/clear and unrelated areas', async c => {
    const a = await page(c), b = await page(c); await ready(a.p); await ready(b.p);
    await a.p.evaluate(() => localStorage.setItem('hmc:theme:v1', 'light'));
    await b.p.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    // The writing tab is explicitly notified by the real chooser.
    await a.p.bringToFront();
    for (const t of await a.p.$$('.hmc-theme-control > button')) if (await t.evaluate(e => e.getClientRects().length)) { await t.click(); break; }
    await a.p.click('input[value="light"]'); await a.p.click('input[value="dark"]'); await a.p.click('.hmc-theme-control fieldset button');
    await b.p.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await a.p.evaluate(() => localStorage.removeItem('hmc:theme:v1'));
    await b.p.waitForFunction(() => document.documentElement.dataset.themeMode === 'auto');
    await a.p.evaluate(() => localStorage.clear());
    await b.p.waitForFunction(() => document.documentElement.dataset.themeMode === 'auto');
    await theme(b.p, 'dark');
    await b.p.evaluate(() => {
      dispatchEvent(new StorageEvent('storage', { key: 'unrelated', newValue: 'light' }));
      dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: 'light', storageArea: sessionStorage }));
    }); await pause(50); assert.equal(await b.p.$eval('html', e => e.dataset.theme), 'dark');
    assert.deepEqual(a.errors, []); assert.deepEqual(b.errors, []);
  });
  await check('Storage getter denied, read/write denial and corrupt values remain usable', async c => {
    for (const deniedKind of ['getter', 'methods', 'corrupt']) {
      const { p, errors } = await page(c);
      await p.evaluateOnNewDocument(kind => {
        if (kind === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } });
        if (kind === 'methods') { Storage.prototype.getItem = () => { throw Error('denied read'); }; Storage.prototype.setItem = () => { throw Error('denied write'); }; }
        if (kind === 'corrupt') localStorage.setItem('hmc:theme:v1', '<invalid>');
      }, deniedKind);
      await ready(p); assert.equal(await p.$eval('html', e => e.dataset.themeMode), 'auto');
      for (const t of await p.$$('.hmc-theme-control > button')) if (await t.evaluate(e => e.getClientRects().length)) { await t.click(); break; }
      await p.click('input[value="light"]'); await p.click('.hmc-theme-control fieldset button');
      assert.equal(await p.$eval('html', e => e.dataset.theme), 'light'); assert.deepEqual(errors, []); await p.close();
    }
  });
  await check('Cold 4x CPU slow-network first-content Dark with no opposite frame', async c => {
    const { p, errors } = await page(c, 'dark'); const cd = await p.createCDPSession();
    await cd.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cd.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 100000 });
    await p.evaluateOnNewDocument(() => { window.__paintFrames = []; const f = () => { if (document.body) window.__paintFrames.push({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }); if (window.__paintFrames.length < 30) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await ready(p, '/jaipur-to-delhi-cab'); const frames = await p.evaluate(() => window.__paintFrames);
    assert.ok(frames.length); assert.ok(frames.every(f => f.theme === 'dark' && f.bg === 'rgb(21, 19, 22)')); assert.deepEqual(errors, []);
    writeFileSync(`${out}/slow-frames.json`, JSON.stringify(frames, null, 2)); await p.screenshot({ path: `${out}/slow-dark.png` });
  });
  await check('Default motion settled contrast, manual repaint geometry and soft navigation', async c => {
    const { p, errors } = await page(c, 'light', 1280); await ready(p, '/');
    // Scroll all reveal targets into view as a visitor does, then wait for their actual animations.
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 35)); } });
    await pause(1200); await p.evaluate(() => scrollTo(0, 450)); await pause(300);
    const geometry = () => p.evaluate(() => ({ x: scrollX, y: scrollY, height: document.documentElement.scrollHeight, inputs: [...document.querySelectorAll('input')].map(e => e.value) }));
    await p.evaluate(() => { window.__switchShifts = []; window.__switchObserver = new PerformanceObserver(list => window.__switchShifts.push(...list.getEntries().map(e => ({ value: e.value, hadRecentInput: e.hadRecentInput })))); window.__switchObserver.observe({ type: 'layout-shift', buffered: false }); });
    const before = await geometry(); await theme(p, 'dark'); await pause(150); assert.deepEqual(await geometry(), before);
    const shifts = await p.evaluate(() => { window.__switchObserver.disconnect(); return window.__switchShifts; }); assert.equal(shifts.reduce((n, s) => n + s.value, 0), 0);
    writeFileSync(`${out}/switch-geometry.json`, JSON.stringify({ before, after: await geometry(), shifts }, null, 2));
    await p.addScriptTag({ content: axe });
    const violations = await p.evaluate(async () => (await axe.run(document)).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
    writeFileSync(`${out}/normal-motion-axe.json`, JSON.stringify(violations, null, 2));
    assert.equal(violations.filter(v => ['serious', 'critical'].includes(v.impact)).length, 0, JSON.stringify(violations));
    await p.evaluate(() => scrollTo(0, 0)); await p.$eval('a[href="/routes"]', e => e.click()); await p.waitForFunction(() => location.pathname === '/routes');
    assert.equal(await p.$eval('html', e => e.dataset.theme), 'dark'); assert.equal(await p.evaluate(() => localStorage.getItem('sentinel')), 'preserve'); assert.deepEqual(errors, []);
  });
  await check('Print uses paper and ink; restores selected Dark; forced colours remain native', async c => {
    const { p, errors } = await page(c); await ready(p, '/jaipur-to-delhi-cab'); await p.emulateMediaType('print');
    const print = await p.evaluate(() => ({ scheme: getComputedStyle(document.documentElement).colorScheme, page: getComputedStyle(document.body).backgroundColor, footer: getComputedStyle(document.querySelector('footer')).color, header: getComputedStyle(document.querySelector('header')).display, fab: [...document.querySelectorAll('[data-fab]')].map(e => getComputedStyle(e).display), stored: localStorage.getItem('hmc:theme:v1') }));
    assert.equal(print.scheme, 'light'); assert.equal(print.header, 'none'); assert.equal(print.footer, 'rgb(32, 24, 24)'); assert.ok(print.fab.every(v => v === 'none')); assert.equal(print.stored, 'dark');
    await p.pdf({ path: `${out}/route-print.pdf`, printBackground: false }); await p.emulateMediaType(null); assert.equal(await p.$eval('html', e => e.dataset.theme), 'dark');
    const cd = await p.createCDPSession(); await cd.send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
    assert.equal(await p.$eval('input', e => getComputedStyle(e).forcedColorAdjust), 'auto'); await p.screenshot({ path: `${out}/forced-colours.png` }); assert.deepEqual(errors, []);
    writeFileSync(`${out}/print.json`, JSON.stringify(print, null, 2));
  });
  await check('Focused header/native controls at all requested reflow and landscape sizes', async c => {
    for (const [width, height] of [[320,900],[360,900],[375,900],[390,900],[430,900],[768,900],[820,900],[1024,900],[1180,900],[1280,900],[1440,900],[1920,1080],[667,375],[844,390]]) {
      const { p, errors } = await page(c, 'dark', width, height); await ready(p, '/jaipur-to-delhi-cab');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 820) { await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '200% text at ' + width); }
      assert.deepEqual(errors, []); await p.screenshot({ path: `${out}/reflow-${width}-${height}.png` }); await p.close();
    }
  });
} finally {
  if (!executedCases) failures.push({ name: 'Case filter', error: 'No case matched the requested filter' });
  writeFileSync(`${out}/result.json`, JSON.stringify({ passed: failures.length === 0, results, failures, denied }, null, 2)); await browser.close();
}
if (failures.length) process.exitCode = 1;
