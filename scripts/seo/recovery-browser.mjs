// Local-only responsive/navigation regression. No customer write, quote creation or payment.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3421';
const out = process.env.AUDIT_OUT ?? '/tmp/hmc-seo-recovery/browser';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('Browser audit requires loopback');
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const report = {
  completed: false,
  views: [],
  bookingReadViews: [],
  blockedWrites: [],
  externalRequests: [],
  pageErrors: [],
};
const paths = [
  '/',
  '/routes',
  '/jaipur-to-delhi-cab',
  '/jaipur-to-delhi-round-trip-cab',
  '/jaipur-to-delhi-airport-cab',
  '/cab-service-in-agra',
  '/innova-crysta-taxi',
  '/terms',
  '/seo-audit-nonexistent-20261018',
];
async function pageFor(width) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({
    width,
    height: width < 768 ? 844 : 900,
    isMobile: width < 768,
    hasTouch: width < 1024,
  });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedWrites.push(request.method() + ' ' + url.pathname);
      return request.abort();
    }
    if (url.protocol === 'data:' || url.hostname === '127.0.0.1') return request.continue();
    report.externalRequests.push(url.origin + url.pathname);
    return request.abort();
  });
  return page;
}
try {
  for (const width of [360, 390, 768, 1280]) {
    const page = await pageFor(width);
    for (const path of paths) {
      // Prefetch/image optimization can continue after the page is usable. Assert the
      // actual navigation/font state rather than waiting for unrelated network silence.
      const response = await page.goto(base + path, {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(response.status(), path.includes('nonexistent') ? 404 : 200, path);
      const view = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      }));
      assert.ok(view.scrollWidth <= width + 1, `Overflow ${path} at${width}: ${view.scrollWidth}`);
      if (response.status() === 200) {
        assert.equal(view.h1.length, 1, path);
        assert.equal(view.canonical, 'https://www.hellomycabs.com' + (path === '/' ? '' : path));
      }
      report.views.push({ path, width, status: response.status(), ...view });
      if (path === '/routes') {
        const links = await page.$$eval('section[aria-labelledby="route-vehicles"] a', (nodes) =>
          nodes.map((n) => n.getAttribute('href')),
        );
        assert.equal(
          links.length,
          8,
          'Every currently listed vehicle is directly reachable from directory',
        );
        await page.$eval('#route-vehicles', (el) => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: `${out}/routes-${width}.png` });
      }
      if (path === '/jaipur-to-delhi-cab' && width === 390) {
        assert.ok(
          await page.evaluate(() =>
            document.body.innerText.includes('Road distance is an estimate.'),
          ),
        );
        const before = await page.$$eval('input[role="combobox"]', (els) =>
          els.slice(0, 2).map((el) => el.value),
        );
        assert.ok(before[0].includes('Jaipur') && before[1].includes('Delhi'));
        await page.click('button[aria-label="Swap pickup and drop"]');
        await page.waitForFunction(() =>
          document.querySelector('input[role="combobox"]').value.includes('Delhi'),
        );
        const after = await page.$$eval('input[role="combobox"]', (els) =>
          els.slice(0, 2).map((el) => el.value),
        );
        assert.deepEqual(after, [before[1], before[0]]);
        await page.click('button[aria-label="Swap pickup and drop"]');
        await page.screenshot({ path: `${out}/one-way-390.png` });
      }
      if (path === '/' && width === 390) {
        await page.click('button[aria-label="Open menu"]');
        await page.waitForSelector('[role="dialog"]');
        assert.ok(
          await page.$eval('[role="dialog"]', (el) =>
            [...el.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/routes'),
          ),
        );
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        report.mobileMenu = true;
      }
    }
    await page.close();
  }
  const page = await pageFor(390);
  const when = new Date(Date.now() + 7 * 86400000).toISOString();
  for (const tripType of ['one_way', 'round_trip']) {
    const query = new URLSearchParams({ tripType, pickup: 'JAIPUR', drop: 'DELHI', when });
    const response = await page.goto(base + '/booking?' + query, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    // The private booking step streams its existing loading fallback first.
    await page.waitForFunction(
      () =>
        document.body.innerText.includes('Dzire') &&
        !document.body.innerText.includes('Working out your fare'),
    );
    const read = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.textContent,
      robots: document.querySelector('meta[name="robots"]')?.content,
      text: document.body.innerText,
    }));
    assert.match(read.heading, /Jaipur.*Delhi/);
    assert.match(read.robots, /noindex/);
    assert.match(read.text, /Dzire/);
    assert.match(response.headers()['x-robots-tag'], /noindex/);
    report.bookingReadViews.push({ tripType, status: 200, heading: read.heading, noindex: true });
  }
  await page.close();
  assert.equal(report.blockedWrites.length, 0, 'No write should even be attempted');
  assert.equal(
    report.externalRequests.length,
    0,
    'All resources must stay on the isolated local build',
  );
  assert.equal(report.pageErrors.length, 0);
  report.completed = true;
  console.log(
    JSON.stringify(
      {
        completed: true,
        responsiveViews: report.views.length,
        bookingReadViews: report.bookingReadViews.length,
        mobileMenu: report.mobileMenu,
      },
      null,
      2,
    ),
  );
} catch (error) {
  report.failure = error.message;
  throw error;
} finally {
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
