/** Actual mounted W components with isolated synthetic network responses, never production. */
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.BASE_URL;
assert.ok(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = process.argv.find(a => a.startsWith('--out='))?.slice(6); assert.ok(out); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const results = [], failures = [];
let executedCases = 0;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function open(mode = 'light', signed = false, width = 390) {
  const context = await browser.createBrowserContext();
  const p = await context.newPage(), writes = [], external = [], errors = [];
  await p.setViewport({ width, height: 900 }); await p.setCacheEnabled(false);
  if (signed) await context.setCookie({ name: 'hmc_session', value: signed === 'empty' ? 'theme-empty' : 'theme-user', url: base, httpOnly: true, sameSite: 'Lax' });
  await p.evaluateOnNewDocument(() => {
    window.__themeIntervals = new Set();
    const set = window.setInterval.bind(window), clear = window.clearInterval.bind(window);
    window.setInterval = (...args) => { const id = set(...args); window.__themeIntervals.add(id); return id; };
    window.clearInterval = id => { window.__themeIntervals.delete(id); return clear(id); };
  });
  await p.setRequestInterception(true);
  p.on('request', req => {
    const url = new URL(req.url());
    if (['data:', 'blob:'].includes(url.protocol)) return void req.continue();
    if (url.origin !== new URL(base).origin) { external.push(url.origin + url.pathname); return void req.abort(); }
    if (!['GET', 'HEAD'].includes(req.method())) {
      writes.push(url.pathname);
      if (!/^\/api\/(?:otp|session|quote|book|booking\/lead|bookings\/|guest-booking\/|rate|driver-survey)/.test(url.pathname)) return void req.abort();
    }
    return void req.continue();
  });
  p.on('pageerror', e => errors.push(e.stack ?? e.message));
  await p.goto(base + '/robots.txt');
  await p.evaluate(mode => { localStorage.setItem('hmc:theme:v1', mode); localStorage.setItem('hmc_callback_seen', String(Date.now())); localStorage.setItem('theme-state-sentinel', 'preserved'); }, mode);
  return { p, writes, external, errors, close: () => context.close() };
}
async function ready(p, path) {
  await p.bringToFront(); await p.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await p.waitForFunction(() => [...document.querySelectorAll('.hmc-theme-control')].some(e => e.dataset.ready));
  await p.evaluate(() => document.fonts.ready);
}
async function choose(p, mode) {
  for (const trigger of await p.$$('.hmc-theme-control > button')) if (await trigger.evaluate(e => e.getClientRects().length > 0)) { await trigger.click(); break; }
  await p.waitForSelector('.hmc-theme-control fieldset');
  await p.click(`.hmc-theme-control fieldset input[value="${mode}"]`);
  await p.click('.hmc-theme-control fieldset button');
  await pause(100);
  assert.equal(await p.$eval('html', e => e.dataset.themeMode), mode);
}
const fields = p => p.$$eval('main input, main textarea, main select, [role="dialog"] input, [role="dialog"] textarea', els => els.map(e => ({ id: e.id, value: e.value, checked: e.checked, readOnly: e.readOnly })));
async function button(p, text) {
  for (const b of await p.$$('button')) if (await b.evaluate((e, text) => e.textContent.includes(text), text)) return b;
  throw Error('Missing button: ' + text);
}
async function check(name, fn) {
  const only = process.argv.find(a => a.startsWith('--case='))?.slice(7);
  if (only && !name.toLowerCase().includes(only.toLowerCase())) return;
  executedCases++;
  try { await fn(); console.log('PASS', name); } catch (e) { failures.push({ name, error: e.stack }); console.error('FAIL', name, e.message); }
}
async function pAxe(p, name) {
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.addScriptTag({ content: axeSource });
  const violations = await p.evaluate(async () => (await axe.run(document)).violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })));
  results.push({ privateAxe: name, reducedMotion: true, violations });
  assert.equal(violations.filter(v => ['serious', 'critical'].includes(v.impact)).length, 0, JSON.stringify(violations));
}
const id = n => '00000000000000000000000' + n;
try {
  await check('Actual DetailsForm values/custom advance/caret and no duplicate lead on theme', async () => {
    const c = await open(); const { p } = c;
    try {
      const q = new URLSearchParams({ quoteId: 'theme-quote', vehicleType: 'dzire', pickup: 'JAIPUR', drop: 'DELHI', tripType: 'one_way', when: new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 16), expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), totalRupees: '4000', advanceRupees: '500', fareRupees: '3800', tollRupees: '200', gstRupees: '200', gstPercent: '5' });
      await ready(p, '/booking/details?' + q); await p.type('#phone', '9000000000'); await p.type('#name', 'Theme Fixture Customer'); await p.type('#address', 'Local fixture address');
      await (await p.$$('input[name="payChoice"]'))[1].click(); await p.waitForSelector('#payCustom'); await p.type('#payCustom', '1500');
      await p.$eval('#payCustom', e => e.blur()); await pause(200);
      const before = await fields(p), writes = [...c.writes], intervals = await p.evaluate(() => [...window.__themeIntervals]);
      await choose(p, 'dark'); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes); assert.deepEqual(await p.evaluate(() => [...window.__themeIntervals]), intervals);
      await p.focus('#name'); await p.$eval('#name', e => e.setSelectionRange(3, 8));
      const caret = await p.evaluate(async () => {
        localStorage.setItem('hmc:theme:v1', 'auto'); dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: 'auto' }));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const e = document.querySelector('#name'); return { focused: document.activeElement === e, start: e.selectionStart, end: e.selectionEnd };
      });
      assert.deepEqual(caret, { focused: true, start: 3, end: 8 }); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes); assert.deepEqual(c.errors, []);
      await p.screenshot({ path: `${out}/details-state-dark.png`, fullPage: true }); results.push({ detailsForm: true, customAdvance: true, caret, noDuplicateWrites: true, intervalsPreserved: true });
    } finally { await c.close(); }
  });
  await check('Actual OTP code/cooldown survives theme without another code request', async () => {
    const c = await open(); const { p } = c;
    try {
      await ready(p, '/login'); await p.type('#phone', '9000000000'); await (await button(p, 'Send code')).click(); await p.waitForSelector('#code'); await p.type('#code', '123456');
      const before = await fields(p), writes = [...c.writes], intervals = await p.evaluate(() => [...window.__themeIntervals]);
      await choose(p, 'dark'); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes); assert.deepEqual(await p.evaluate(() => [...window.__themeIntervals]), intervals); assert.deepEqual(c.errors, []);
      results.push({ actualOtp: true, writes, cooldownIntervalPreserved: true });
    } finally { await c.close(); }
  });
  await check('Signed account list, all booking statuses and guest page in both themes', async () => {
    for (const mode of ['light', 'dark']) {
      const c = await open(mode, true, 1280);
      try {
        const paths = ['/bookings', ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => '/booking/' + id(n)), '/booking/' + id(2) + '/confirm', '/rate/theme-eligible', '/rate/theme-rated', '/rate/theme-ineligible', '/driver/route/theme-new', '/driver/route/theme-approved', '/driver/route/theme-rejected', '/booking/theme-missing', '/booking/theme-other-owner', '/r/theme-stale', '/r/theme-reopen'];
        for (const path of paths) {
          console.log('PRIVATE', mode, path);
          await ready(c.p, path); assert.equal(await c.p.$eval('html', e => e.dataset.theme), mode); assert.ok(await c.p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          await pAxe(c.p, path + ':' + mode);
          results.push({ privateView: path, mode, heading: await c.p.$eval('h1', e => e.textContent) });
        }
        assert.deepEqual(c.errors, []);
      } finally { await c.close(); }
      const guest = await open(mode);
      try { await ready(guest.p, '/booking/' + id(1) + '?g=theme-guest'); assert.ok((await guest.p.$eval('main', e => e.textContent)).includes('not confirmed')); results.push({ guestView: true, mode }); } finally { await guest.close(); }
    }
  });
  await check('Actual QR preserves ID/image/white panel/poll interval on theme change', async () => {
    const c = await open('light', true, 1280); const { p } = c;
    try {
      await ready(p, '/booking/' + id(1)); await (await button(p, 'Pay')).click(); await p.waitForSelector('img[alt="UPI QR code to pay for this booking"]');
      const snapshot = () => p.$eval('img[alt="UPI QR code to pay for this booking"]', e => ({ src: e.src, bg: getComputedStyle(e.parentElement).backgroundColor, scheme: getComputedStyle(e.parentElement).colorScheme }));
      const before = await snapshot(), qrPosts = c.writes.filter(x => x.endsWith('/qr')).length, intervals = await p.evaluate(() => [...window.__themeIntervals]);
      await choose(p, 'dark'); assert.deepEqual(await snapshot(), before); assert.equal(before.bg, 'rgb(255, 255, 255)'); assert.equal(before.scheme, 'light'); assert.equal(c.writes.filter(x => x.endsWith('/qr')).length, qrPosts); assert.deepEqual(await p.evaluate(() => [...window.__themeIntervals]), intervals); assert.deepEqual(c.errors, []);
      await p.screenshot({ path: `${out}/qr-dark.png`, fullPage: true }); results.push({ actualQr: true, nonpayableFixture: true, qrRequests: qrPosts, whiteSurface: true, intervalsPreserved: true });
    } finally { await c.close(); }
  });
  await check('Actual signed rating/driver forms keep entered state', async () => {
    for (const path of ['/rate/theme-eligible', '/driver/route/theme-new']) {
      const c = await open(); const { p } = c;
      try {
        await ready(p, path);
        const input = await p.$('main textarea, main input[type="text"]'); if (input) await input.type('Local theme fixture note');
        const before = await fields(p), writes = [...c.writes]; await choose(p, 'dark'); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes); assert.deepEqual(c.errors, []); results.push({ signedForm: path, valuesRetained: true });
      } finally { await c.close(); }
    }
  });
  await check('Callback and cancellation keep open typed state on Auto transition', async () => {
    for (const kind of ['callback', 'cancellation']) {
      const c = await open('light', true); const { p } = c;
      try {
        await ready(p, kind === 'callback' ? '/' : '/booking/' + id(2));
        if (kind === 'callback') {
          await p.$eval('button[aria-label="Get a call back"]', e => e.click());
          await p.waitForSelector('[role="dialog"] input'); await p.type('[role="dialog"] input', '9000000000');
        } else {
          await (await button(p, 'Cancel this booking')).click(); await p.type('#reason', 'Local fixture only');
        }
        await pause(150); const before = await fields(p), writes = [...c.writes];
        await p.evaluate(() => { localStorage.setItem('hmc:theme:v1', 'auto'); dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: 'auto' })); });
        await pause(100); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes); assert.deepEqual(c.errors, []);
        await pAxe(p, kind); results.push({ openForm: kind, noDuplicateWrite: true });
      } finally { await c.close(); }
    }
  });
  await check('Actual booking widget trip/city/stop/time state and three vehicle selections', async () => {
    for (const trip of ['one_way', 'round_trip', 'local']) {
      const c = await open(); const { p } = c;
      try {
        await ready(p, '/jaipur-to-delhi-cab?trip=' + trip);
        await p.waitForFunction(() => document.querySelector('input[type="date"]')?.value);
        if (trip !== 'local') { await (await button(p, 'Add a stop')).click(); await p.type('#stop-0', 'Fixture stop text'); }
        const before = await fields(p), writes = [...c.writes]; await choose(p, 'dark'); assert.deepEqual(await fields(p), before); assert.deepEqual(c.writes, writes);
        const q = new URLSearchParams({ tripType: trip, pickup: 'JAIPUR', drop: 'DELHI', when: new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 16), hours: '8' });
        await ready(p, '/booking?' + q); assert.ok(await p.$('main button')); await pAxe(p, 'vehicle-selection-' + trip); assert.deepEqual(c.errors, []);
        results.push({ bookingTrip: trip, realWidgetValuesPreserved: true, selectionPage: true });
      } finally { await c.close(); }
    }
    const c = await open('dark', 'empty'); try { await ready(c.p, '/bookings'); await pAxe(c.p, 'empty-account'); assert.deepEqual(c.errors, []); results.push({ emptyAccount: true }); } finally { await c.close(); }
  });
  await check('Pending OTP verification and cancellation keep values without duplicate requests', async () => {
    for (const kind of ['otp-verify', 'cancel']) {
      const c = await open('light', kind === 'cancel'); const { p } = c; let held;
      try {
        await ready(p, kind === 'cancel' ? '/booking/' + id(2) : '/login');
        if (kind === 'cancel') { await (await button(p, 'Cancel this booking')).click(); await p.type('#reason', 'Local pending cancellation fixture'); }
        else { await p.type('#phone', '9000000000'); await (await button(p, 'Send code')).click(); await p.waitForSelector('#code'); await p.type('#code', '123456'); }
        const target = kind === 'cancel' ? '/api/bookings/' + id(2) + '/cancel' : '/api/session'; let count = 0;
        p.removeAllListeners('request'); p.on('request', req => {
          const u = new URL(req.url()); if (u.origin !== new URL(base).origin && !['data:', 'blob:'].includes(u.protocol)) return void req.abort();
          if (u.pathname === target && req.method() === 'POST') { held = req; count++; return; } return void req.continue();
        });
        await (await button(p, kind === 'cancel' ? 'Yes, cancel it' : 'Sign in')).click();
        for (let n = 0; !held && n < 30; n++) await pause(50); assert.ok(held, 'Expected pending ' + target);
        const before = await fields(p); await p.evaluate(() => dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: 'dark' })));
        await pause(100); assert.deepEqual(await fields(p), before); assert.equal(count, 1);
        await held.respond({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { message: 'Local synthetic request rejected' } }) }); held = null;
        await p.waitForFunction(() => document.body.textContent.includes('Local synthetic request rejected')); assert.deepEqual(c.errors, []); await pAxe(p, kind); results.push({ pendingFunnel: kind, exactlyOneRequest: true, valuesRetained: true });
      } finally { if (held) await held.abort(); await c.close(); }
    }
  });
  await check('Phone UPI methods/closed QR and long signed header remain usable', async () => {
    for (const device of ['android', 'ios']) {
      const c = await open('dark', true); const { p } = c;
      try {
        await p.setUserAgent(device === 'android' ? 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/155.0.0.0 Mobile Safari/537.36' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1');
        p.removeAllListeners('request'); p.on('request', async req => {
          const u = new URL(req.url()); if (u.origin !== new URL(base).origin && !['data:', 'blob:'].includes(u.protocol)) return void req.abort();
          if (u.pathname.endsWith('/qr')) {
            const body = await (await fetch(base + u.pathname, { method: 'POST', headers: { cookie: 'hmc_session=theme-user' } })).json();
            const uri = 'upi://pay?pa=local-fixture@example.invalid&pn=Nonpayable&am=0';
            body.data.qr.upiLinks = { any: uri, gpay: uri, gpayIos: uri, phonepe: uri, paytm: uri };
            return void req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
          }
          return void req.continue();
        });
        await ready(p, '/booking/' + id(1)); await (await button(p, 'Pay')).click(); await p.waitForSelector('a[href^="upi:"]');
        const methods = await p.$$eval('a[href^="upi:"]', els => els.map(e => e.textContent.trim())); assert.equal(methods.length, device === 'android' ? 5 : 3);
        assert.equal(await p.$('img[alt="UPI QR code to pay for this booking"]'), null);
        await (await button(p, 'Show the QR')).click(); await p.waitForSelector('img[alt="UPI QR code to pay for this booking"]');
        const before = await p.$eval('img[alt="UPI QR code to pay for this booking"]', e => e.src); await choose(p, 'light'); assert.equal(await p.$eval('img[alt="UPI QR code to pay for this booking"]', e => e.src), before); assert.deepEqual(c.errors, []); await pAxe(p, 'phone-' + device); results.push({ emulatedDevice: device, methods, externalAppsOpened: false });
      } finally { await c.close(); }
    }
    const c = await open('dark', true, 1920);
    try {
      c.p.removeAllListeners('request'); c.p.on('request', req => {
        const u = new URL(req.url()); if (u.origin !== new URL(base).origin && !['data:', 'blob:'].includes(u.protocol)) return void req.abort();
        if (u.pathname === '/api/me') return void req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { name: 'VeryLongFixtureCustomerNameWithoutSpaces', phone: '919000000000' } }) });
        return void req.continue();
      });
      await ready(c.p, '/bookings'); await pause(100); assert.ok(await c.p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); assert.deepEqual(c.errors, []); await c.p.screenshot({ path: out + '/long-signed-header.png' }); results.push({ longSignedHeader: true, width: 1920 });
    } finally { await c.close(); }
  });
  await check('Pending callback/rating/survey preserve state and submit exactly once', async () => {
    for (const kind of ['callback', 'rating', 'survey']) {
      const c = await open(); const { p } = c;
      let held;
      try {
        await ready(p, { callback: '/', rating: '/rate/theme-eligible', survey: '/driver/route/theme-new' }[kind]);
        if (kind === 'callback') { await p.$eval('button[aria-label="Get a call back"]', e => e.click()); await p.waitForSelector('[role="dialog"] input'); await p.type('[role="dialog"] input', '9000000000'); await pause(100); }
        if (kind === 'rating') { await p.click('[role="radiogroup"][aria-label="Your trip rating"] button[aria-label="5 stars"]'); }
        if (kind === 'survey') await p.type('textarea', 'Local pending fixture');
        const target = { callback: '/api/booking/lead', rating: '/api/rate', survey: '/api/driver-survey' }[kind]; let count = 0;
        p.removeAllListeners('request'); p.on('request', req => {
          const u = new URL(req.url());
          if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== new URL(base).origin) return void req.abort();
          if (u.pathname === target && req.method() === 'POST') { count++; held = req; return; }
          return void req.continue();
        });
        if (kind === 'callback') await p.click('[role="dialog"] button[type="submit"]');
        else await (await button(p, { rating: 'Submit rating', survey: 'Send my answer' }[kind])).click();
        for (let n = 0; !held && n < 30; n++) await pause(50); assert.ok(held);
        const before = await fields(p);
        await p.evaluate(() => dispatchEvent(new StorageEvent('storage', { key: 'hmc:theme:v1', newValue: 'dark' })));
        await pause(100); assert.equal(await p.$eval('html', e => e.dataset.theme), 'dark'); assert.deepEqual(await fields(p), before); assert.equal(count, 1);
        await held.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }); held = null;
        await p.waitForFunction(() => document.body.textContent.includes('Thank you')); assert.deepEqual(c.errors, []); await pAxe(p, 'sent-' + kind); results.push({ pendingSubmit: kind, exactlyOneRequest: true, sentState: true });
      } finally { if (held) await held.abort(); await c.close(); }
    }
  });
  await check('Actual payment error/expired/unavailable and pending/dropped returns', async () => {
    for (const scenario of ['error', 'expired', 'unavailable', 'pending', 'dropped']) {
      const c = await open('light', true, 1280); const { p } = c;
      try {
        let qr = 0, links = 0;
        p.removeAllListeners('request');
        p.on('request', async req => {
          const u = new URL(req.url());
          if (u.origin !== new URL(base).origin && !['data:', 'blob:'].includes(u.protocol)) { c.external.push(u.origin); return void req.abort(); }
          if (u.pathname.endsWith('/qr')) {
            qr++;
            if (scenario === 'error' || scenario === 'unavailable') return void req.respond({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: scenario === 'unavailable' ? 'QR_NOT_AVAILABLE' : 'FIXTURE', message: 'Synthetic payment unavailable' } }) });
            if (scenario === 'expired') {
              const body = await (await fetch(base + u.pathname, { method: 'POST', headers: { cookie: 'hmc_session=theme-user' } })).json();
              body.data.qr.expiresAt = new Date(Date.now() - 1000).toISOString(); return void req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
            }
          }
          if (u.pathname.endsWith('/pay-link')) { links++; return void req.respond({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { message: 'Synthetic hosted page unavailable' } }) }); }
          return void req.continue();
        });
        const isReturn = ['pending', 'dropped'].includes(scenario);
        await ready(p, '/booking/' + id(scenario === 'dropped' ? 8 : 1) + (isReturn ? '/confirm' : ''));
        if (!isReturn) { await (await button(p, 'Pay')).click(); await pause(400); }
        const main = await p.$eval('main', e => e.textContent);
        assert.ok(main.includes({ error: 'Synthetic payment unavailable', unavailable: 'Synthetic hosted page unavailable', expired: 'The QR closed', pending: 'Checking your payment', dropped: 'Payment not completed' }[scenario]), main);
        const beforeQr = qr, beforeLinks = links; await choose(p, 'dark'); assert.equal(qr, beforeQr); assert.equal(links, beforeLinks); assert.deepEqual(c.errors, []); await pAxe(p, scenario);
        results.push({ paymentScenario: scenario, noDuplicateQrOrLink: true, qr, links });
      } finally { await c.close(); }
    }
  });
} finally {
  if (!executedCases) failures.push({ name: 'Case filter', error: 'No case matched the requested filter' });
  writeFileSync(`${out}/result.json`, JSON.stringify({ passed: failures.length === 0, results, failures }, null, 2)); await browser.close();
}
if (failures.length) process.exitCode = 1;
