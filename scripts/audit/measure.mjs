/**
 * npm run audit:measure — every page on every device, measured, with thresholds.
 *
 * Counts what can be counted: text too small to read, targets too small to hit, lines too
 * long to follow, anything running off the edge, and whether headings actually scale. It
 * cannot see an orphaned word or an empty band — look at the screenshots for those
 * (npm run audit:shots). Exits 1 when a threshold is broken.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, DEVICES, context, launch, pages, settle, viewport } from './common.mjs';

const only = process.argv.find((a) => a.startsWith('--pages='))?.slice(8).split(',');

/** Runs in the page. Everything is read from computed style and real layout. */
function measureInPage(vw, touchCheck) {
  const vis = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity !== 0 && r.width > 2 && r.height > 2;
  };
  const hint = (el) =>
    el.tagName.toLowerCase() +
    (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
      : '');
  const text = (el) =>
    (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  // Things meant to be wider than the screen scroll inside themselves.
  const inScroller = (el) => {
    if (typeof el.className === 'string' && /marquee|w-max/.test(el.className)) return true;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (/(auto|scroll)/.test(s.overflowX)) return true;
      if (typeof n.className === 'string' && /marquee|w-max/.test(n.className)) return true;
    }
    return false;
  };
  const all = [...document.body.querySelectorAll('*')].filter(vis);
  const out = { small: [], touch: [], long: [], overflow: [], h1: null, sizes: [], pSizes: [] };
  const sizes = new Set();
  const pSizes = new Set();
  for (const el of all) {
    const s = getComputedStyle(el);
    const fs = parseFloat(s.fontSize);
    const r = el.getBoundingClientRect();
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (direct) {
      sizes.add(Math.round(fs * 10) / 10);
      if (fs < 12) out.small.push([fs, hint(el), text(el)]);
      if (el.tagName === 'H1' && out.h1 === null) out.h1 = Math.round(fs * 10) / 10;
      if (el.tagName === 'P') {
        // Body copy only. A <p> set as an uppercase label or in the display face is doing a
        // label's or a title's job and is measured as one.
        if (s.textTransform !== 'uppercase' && !/display|Fraunces/i.test(s.fontFamily))
          pSizes.add(Math.round(fs * 10) / 10);
        const lh = parseFloat(s.lineHeight) || fs * 1.5;
        const lines = Math.round(r.height / lh);
        if (lines >= 3) {
          const cpl = Math.round(el.textContent.trim().length / lines);
          if (cpl > 75) out.long.push([cpl, hint(el), text(el)]);
        }
      }
    }
    if (r.right > vw + 1 && !inScroller(el) && s.position !== 'fixed')
      out.overflow.push([Math.round(r.right - vw), hint(el), text(el)]);
  }
  if (touchCheck) {
    const targets = all.filter((e) =>
      e.matches('a,button,input,select,textarea,summary,[role=button],[role=option],[role=tab]'),
    );
    for (const el of targets) {
      // WCAG 2.2 exempts a link that sits inside a sentence; a link on its own line is a target.
      if (el.matches('a') && getComputedStyle(el).display === 'inline' && el.closest('p')) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 43.5 || (r.width < 43.5 && !el.matches('input,select,textarea')))
        out.touch.push([`${Math.round(r.width)}x${Math.round(r.height)}`, hint(el), text(el)]);
    }
  }
  out.sizes = [...sizes].sort((a, b) => a - b);
  out.pSizes = [...pSizes].sort((a, b) => a - b);
  return out;
}

/** The states a static count cannot see: an open menu, the fold, the end of the page. */
async function states(page, dev) {
  const [name, w, h, touch] = dev;
  const s = {};
  // C7 — the booking button must be on the first screen.
  s.ctaBottom = await page.evaluate(() => {
    const b = document.querySelector('form button[type="submit"]');
    return b ? Math.round(b.getBoundingClientRect().bottom) : null;
  });
  // P2 — on a short screen the fixed chrome must not eat the page.
  s.chrome = await page.evaluate(() => {
    const hd = document.querySelector('header');
    const bar =
      document.querySelector('[data-sticky-book]') ||
      [...document.querySelectorAll('div')].find(
        (e) => typeof e.className === 'string' && /fixed/.test(e.className) && /bottom-0/.test(e.className),
      );
    const vis = (e) => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0;
    return Math.round((vis(hd) ? hd.getBoundingClientRect().height : 0) + (vis(bar) ? bar.getBoundingClientRect().height : 0));
  });
  // C5 — at the very end, nothing of the footer may sit behind the bar.
  s.barOverlap = await page.evaluate(async () => {
    document.body.style.overflow = '';
    // The site scrolls smoothly; a measurement must jump, or it reads the page mid-glide.
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 300));
    const bar =
      document.querySelector('[data-sticky-book]') ||
      [...document.querySelectorAll('div')].find(
        (e) => typeof e.className === 'string' && /fixed/.test(e.className) && /bottom-0/.test(e.className),
      );
    const foot = document.querySelector('footer');
    if (!bar || !foot || getComputedStyle(bar).display === 'none') return 0;
    const leaves = [...foot.querySelectorAll('a,p')].filter((e) => e.getBoundingClientRect().height > 0);
    const last = leaves.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
    const over = last.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return Math.max(0, Math.round(over));
  });
  // C1 — the menu must cover the screen.
  if (touch && w < 1024) {
    const btn = await page.$('button[aria-label="Open menu"]');
    if (btn) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 350));
      s.menuHeight = await page.evaluate(() => {
        const o =
          document.querySelector('[data-menu-overlay]') ||
          [...document.querySelectorAll('div')].find(
            (e) => typeof e.className === 'string' && /\bfixed\b/.test(e.className) && /inset-0/.test(e.className) && /z-50/.test(e.className),
          );
        return o ? Math.round(o.getBoundingClientRect().height) : null;
      });
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  void name;
  void h;
  return s;
}

/** C4 — sample the hero figures while they animate; a minus sign is a fault. */
async function counterNegative(page) {
  return page.evaluate(async () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const dl = document.querySelector('dl');
    if (!dl) return false;
    let bad = false;
    for (let i = 0; i < 30; i++) {
      if (/-\d|−\d/.test(dl.innerText)) bad = true;
      await new Promise((r) => setTimeout(r, 50));
    }
    return bad;
  });
}

function staticCodeCheck() {
  const walk = (d) =>
    readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') || p.endsWith('.ts') ? [p] : [];
    });
  const hits = new Set();
  for (const f of walk('src')) for (const m of readFileSync(f, 'utf8').matchAll(/text-\[[0-9.]+(rem|px)\]/g)) hits.add(m[0]);
  return [...hits];
}

async function run() {
  const browser = await launch();
  const signed = await browser.createBrowserContext();
  const anon = await browser.createBrowserContext();
  const ctxPage = await signed.newPage();
  const ctx = await context(ctxPage);
  const list = pages(ctx).filter(([n]) => !only || only.includes(n));
  const R = {};
  for (const [pname, path, opts = {}] of list) {
    R[pname] = {};
    for (const group of [DEVICES.filter((d) => d[3]), DEVICES.filter((d) => !d[3])]) {
      const page = await (opts.signedIn ? signed : anon).newPage();
      await viewport(page, group[0]);
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
      await settle(page);
      for (const dev of group) {
        await viewport(page, dev);
        await new Promise((r) => setTimeout(r, 250));
        const m = await page.evaluate(measureInPage, dev[1], dev[1] <= 1024);
        m.states = pname === 'home' || pname === 'route' ? await states(page, dev) : {};
        if (pname === 'home' && dev[0] === 'phone-390') m.counterNegative = await counterNegative(page);
        R[pname][dev[0]] = m;
      }
      await page.close();
    }
    process.stdout.write(`  ${pname} ✓\n`);
  }
  await browser.close();
  writeFileSync('/tmp/hmc-audit.json', JSON.stringify(R));
  return R;
}

function report(R) {
  const fails = [];
  const sum = (key) => {
    const m = new Map();
    for (const [p, ds] of Object.entries(R))
      for (const [d, x] of Object.entries(ds))
        for (const it of x[key] ?? []) {
          const k = `${it[1]} ${JSON.stringify(it[2])}`;
          if (!m.has(k)) m.set(k, { v: it[0], pages: new Set(), devs: new Set() });
          m.get(k).pages.add(p);
          m.get(k).devs.add(d);
        }
    return m;
  };
  const section = (title, key, limit = 12) => {
    const m = sum(key);
    console.log(`\n${title}: ${m.size}`);
    [...m.entries()].slice(0, limit).forEach(([k, v]) =>
      console.log(`   ${String(v.v).padStart(7)}  ${k.slice(0, 70)}  [${[...v.pages].slice(0, 3).join(',')}${v.pages.size > 3 ? '…' : ''}]`),
    );
    if (m.size) fails.push(`${title}: ${m.size}`);
  };
  section('Text under 12px', 'small');
  section('Touch targets under 44px (≤1024)', 'touch', 20);
  section('Lines over 75 characters', 'long');
  section('Past the right edge', 'overflow');

  console.log('\nH1 by width (320 · 390 · 768 · 1024 · 1440):');
  for (const [p, ds] of Object.entries(R)) {
    const seq = ['phone-320', 'phone-390', 'tab-768', 'tab-1024l', 'lap-1440'].map((d) => ds[d]?.h1);
    const ok = seq.every((v, i) => i === 0 || (v !== null && v > seq[i - 1]));
    console.log(`   ${ok ? '✓' : '✗'} ${p.padEnd(14)} ${seq.join(' · ')}`);
    if (!ok) fails.push(`H1 does not scale on ${p}`);
  }
  const home = R.home ?? {};
  console.log('\nBody-copy sizes on one screen (phone-390):');
  for (const [p, ds] of Object.entries(R)) {
    const n = ds['phone-390']?.pSizes?.length ?? 0;
    if (n > 4) {
      console.log(`   ✗ ${p.padEnd(14)} ${n}: ${ds['phone-390'].pSizes.join(', ')}`);
      fails.push(`${p}: ${n} paragraph sizes`);
    }
  }
  const union = new Set();
  for (const ds of Object.values(R)) for (const s of ds['phone-390']?.sizes ?? []) union.add(s);
  console.log(`\nDistinct text sizes across the site at 390: ${union.size}`);
  if (union.size > 14) fails.push(`distinct text sizes: ${union.size}`);

  console.log('\nStates:');
  for (const [d, x] of Object.entries(home)) {
    const s = x.states ?? {};
    const [, w, h] = DEVICES.find((v) => v[0] === d);
    if (s.menuHeight != null && s.menuHeight < h) {
      console.log(`   ✗ menu overlay ${s.menuHeight}px on ${d} (viewport ${h})`);
      fails.push(`menu overlay ${d}`);
    }
    if (['tab-1024l', 'lap-1280', 'lap-1366'].includes(d) && s.ctaBottom > h) {
      console.log(`   ✗ "See fares" below the fold on ${d}: ${s.ctaBottom} > ${h}`);
      fails.push(`CTA fold ${d}`);
    }
    if (s.barOverlap > 0) {
      console.log(`   ✗ sticky bar covers ${s.barOverlap}px of the footer on ${d}`);
      fails.push(`bar overlap ${d}`);
    }
    if (d.startsWith('land-') && s.chrome / h > 0.2) {
      console.log(`   ✗ fixed chrome ${s.chrome}px of ${h} on ${d}`);
      fails.push(`chrome ${d}`);
    }
    void w;
  }
  if (home['phone-390']?.counterNegative) {
    console.log('   ✗ hero counter went negative');
    fails.push('counter negative');
  }
  const code = staticCodeCheck();
  console.log(`\nHand-written text-[…] sizes in src: ${code.length}`);
  if (code.length) fails.push(`text-[…] in code: ${code.length}`);

  console.log(fails.length ? `\n✗ ${fails.length} threshold(s) broken` : '\n✓ All thresholds met');
  return fails.length ? 1 : 0;
}

const R = await run();
process.exit(report(R));
