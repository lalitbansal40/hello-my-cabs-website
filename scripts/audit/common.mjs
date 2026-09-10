/**
 * Shared setup for the responsive audit: the pages, the devices, and a browser that
 * behaves like the device rather than like a resized desktop window.
 *
 * Two earlier ways of doing this lied, and both are worth remembering. Headless Chrome's
 * --window-size does not give a page a real mobile viewport — it renders wide and crops the
 * image, so a clean layout looked broken. And an iframe stretched to the full page height
 * inflates every vh unit, so an 86vh hero measured 6,500px tall. setViewport with isMobile
 * and hasTouch is what a phone actually reports.
 */
import puppeteer from 'puppeteer-core';

export const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** [name, width, height, touch] — phones and tablets report as mobile, laptops do not. */
export const DEVICES = [
  ['phone-320', 320, 568, true],
  ['phone-360', 360, 800, true],
  ['phone-375', 375, 812, true],
  ['phone-390', 390, 844, true],
  ['phone-393', 393, 852, true],
  ['phone-412', 412, 915, true],
  ['phone-430', 430, 932, true],
  ['land-667', 667, 375, true],
  ['land-844', 844, 390, true],
  ['land-932', 932, 430, true],
  ['tab-768', 768, 1024, true],
  ['tab-820', 820, 1180, true],
  ['tab-834', 834, 1194, true],
  ['tab-1024p', 1024, 1366, true],
  ['tab-1024l', 1024, 768, true],
  ['tab-1180', 1180, 820, true],
  ['lap-1280', 1280, 720, false],
  ['lap-1366', 1366, 768, false],
  ['lap-1440', 1440, 900, false],
  ['lap-1536', 1536, 864, false],
  ['desk-1920', 1920, 1080, false],
  ['desk-2560', 2560, 1440, false],
];

/** A pickup far enough ahead that the booking form accepts it. */
const future = (days) => {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

/**
 * Every page, and what it needs. `signedIn` pages are opened with the demo customer's
 * session; `quote` pages get a fresh quote id, because a quote only lives thirty minutes.
 */
export function pages(ctx = {}) {
  const when = future(40);
  const back = future(42);
  return [
    ['home', '/'],
    ['route', '/jaipur-to-delhi-cab'],
    ['city', '/cab-service-in-jaipur'],
    ['vehicle', '/dzire-taxi'],
    ['vehicle-rt', '/tempo-traveller-12-seater-rental'],
    ['routes', '/routes'],
    ['choose-oneway', `/booking?tripType=one_way&pickup=JAIPUR&drop=DELHI&when=${when}`],
    [
      'choose-round',
      `/booking?tripType=round_trip&pickup=JAIPUR&drop=DELHI&when=${when}&returnWhen=${back}`,
    ],
    ...(ctx.quoteId
      ? [[
          'details',
          `/booking/details?quoteId=${ctx.quoteId}&vehicleType=dzire&vehicleLabel=Dzire&tripType=one_way&pickup=JAIPUR&drop=DELHI&when=${when}&expiresAt=${encodeURIComponent(ctx.expiresAt)}`,
        ]]
      : []),
    ['login', '/login'],
    ['about', '/about'],
    ['contact', '/contact'],
    ['terms', '/terms'],
    ['privacy', '/privacy'],
    ['refund', '/refund'],
    ['404', '/this-page-does-not-exist'],
    ['bookings', '/bookings', { signedIn: true }],
    ...(ctx.bookingId ? [['booking-id', `/booking/${ctx.bookingId}`, { signedIn: true }]] : []),
  ];
}

export async function launch() {
  return puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
}

export async function viewport(page, [, width, height, touch]) {
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1 });
}

/** Sign the page's browser context in as the demo customer. */
export async function signIn(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: '919000000000', code: '123456', name: 'Demo' }),
    });
  });
}

/** A fresh quote, and one of the demo customer's booking ids. */
export async function context(page) {
  const ctx = {};
  for (let i = 0; i < 10 && !ctx.quoteId; i++) {
    const r = await fetch(`${BASE}/api/quote`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tripType: 'one_way', vehicleType: 'dzire', pickupCity: 'JAIPUR', dropCity: 'DELHI' }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.ok) Object.assign(ctx, { quoteId: r.data.quoteId, expiresAt: r.data.expiresAt });
    else await new Promise((res) => setTimeout(res, 6000)); // the public API rate-limits bursts
  }
  await signIn(page);
  const html = await page.evaluate(async () => (await fetch('/bookings')).text());
  ctx.bookingId = html.match(/\/booking\/([a-f0-9]{24})/)?.[1];
  return ctx;
}

/** Wait for the page's heading — a dynamic page renders after the server has asked the API. */
export async function settle(page) {
  await page.waitForSelector('h1', { timeout: 20_000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 350));
}
