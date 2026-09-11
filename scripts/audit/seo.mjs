/**
 * npm run seo:check — the ten things that decide whether these pages can rank.
 *
 * No browser. Every one of these checks reads the HTML the server sends, which is also the
 * only thing a crawler reads — running them through a rendered page would hide exactly the
 * faults that matter (a heading that only exists after hydration is a heading Google may
 * never see).
 *
 * The sitemap is the input, not a hand-written list: a page that is not in the sitemap is
 * not part of the site as far as this check is concerned, and check 7 is what catches that.
 *
 * Levels exist because the targets arrive in phases. `SEO_LEVEL=a` gates only what Phase A
 * is responsible for; `all` (the default) gates everything. A check that is not gated is
 * still measured and still printed — it just does not fail the run.
 */
import { writeFileSync } from 'node:fs';

const HOST = (process.env.BASE_URL ?? 'http://localhost:3100').replace(/\/+$/, '');
const LEVEL = process.env.SEO_LEVEL ?? 'all';

/** Which checks fail the run at each level. Everything is always measured and printed. */
const GATED = {
  a: [1, 2, 7, 8, 9],
  b: [1, 2, 3, 7, 8, 9, 10],
  c: [1, 2, 3, 4, 5, 7, 8, 9, 10],
  all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};
const gated = GATED[LEVEL] ?? GATED.all;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const results = [];
function check(n, title, failures, note = '') {
  results.push({ n, title, failures, note });
  const ok = failures.length === 0;
  const tag = gated.includes(n) ? '' : dim(' (not gated at this level)');
  console.log(`\n${bold(`${n}. ${title}`)}${tag}`);
  if (ok) console.log(`  ${green('✓')} ${note || 'nothing to report'}`);
  else {
    console.log(`  ${red('✗')} ${failures.length} problem(s)${note ? ` — ${note}` : ''}`);
    failures.slice(0, 14).forEach((f) => console.log(`      ${f}`));
    if (failures.length > 14) console.log(dim(`      …and ${failures.length - 14} more`));
  }
}

// ── Fetching ─────────────────────────────────────────────────────────────────
const cache = new Map();
async function get(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(HOST + path, { redirect: 'manual' });
  const body = res.status === 200 ? await res.text() : '';
  const out = { status: res.status, body, location: res.headers.get('location') };
  cache.set(path, out);
  return out;
}

// ── Reading a page ───────────────────────────────────────────────────────────
const unescape = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, '’')
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(+d));

/**
 * The words a reader sees. Next ships the whole RSC payload inside <script> tags — leaving
 * it in would double every word on the page and make two different pages look alike.
 */
function visibleText(html) {
  return unescape(
    html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function readPage(path, html) {
  const pick = (re) => html.match(re)?.[1];
  const ld = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/') && !h.startsWith('//'))
    .map((h) => h.split('#')[0])
    .filter(Boolean);
  const text = visibleText(html);
  return {
    path,
    title: unescape(pick(/<title>([^<]*)<\/title>/) ?? ''),
    description: unescape(pick(/<meta name="description" content="([^"]*)"/) ?? ''),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/) ?? '',
    robots: pick(/<meta name="robots" content="([^"]*)"/) ?? '',
    h1: [...html.matchAll(/<h1\b/g)].length,
    faq: [...html.matchAll(/<summary\b/g)].length,
    words: text.split(' ').filter(Boolean).length,
    text,
    ld,
    links: [...new Set(links)],
    linksAll: links,
  };
}

// ── Similarity: Dice coefficient over word bigrams ───────────────────────────
/**
 * Near-duplicate detection, not diffing. Two route pages built from the same template share
 * almost every bigram — which is the fault this is looking for. Measured on the live build
 * the day this was written: Jaipur→Delhi vs Delhi→Jaipur 0.97, two routes from the same
 * city 0.76, two city pages 0.69, two vehicle pages 0.90.
 */
function bigrams(text) {
  const w = text.toLowerCase().split(' ').filter(Boolean);
  const set = new Map();
  for (let i = 0; i < w.length - 1; i++) {
    const k = `${w[i]} ${w[i + 1]}`;
    set.set(k, (set.get(k) ?? 0) + 1);
  }
  return set;
}
function similarity(a, b) {
  let shared = 0;
  let total = 0;
  for (const [, n] of a) total += n;
  for (const [, n] of b) total += n;
  for (const [k, n] of a) shared += Math.min(n, b.get(k) ?? 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

// ── Route tiers ──────────────────────────────────────────────────────────────
const TIER_A = [
  ['jaipur', 'delhi'],
  ['delhi', 'jaipur'],
];
const TIER_B_PAIRS = [
  ['delhi', 'agra'],
  ['delhi', 'chandigarh'],
  ['delhi', 'haridwar'],
  ['delhi', 'noida'],
  ['jaipur', 'agra'],
  ['jaipur', 'chandigarh'],
  ['jaipur', 'ajmer'],
  ['jaipur', 'delhi-airport'],
];
const key = (a, b) => `${a}|${b}`;
const A_SET = new Set(TIER_A.map(([a, b]) => key(a, b)));
const B_SET = new Set(TIER_B_PAIRS.flatMap(([a, b]) => [key(a, b), key(b, a)]));

/** '/jaipur-to-delhi-cab' → { pickup, drop } */
function routeOf(path) {
  const m = path.match(/^\/([a-z-]+)-to-([a-z-]+)-cab$/);
  return m ? { pickup: m[1], drop: m[2] } : null;
}
function tierOf(path) {
  const r = routeOf(path);
  if (!r) return null;
  const k = key(r.pickup, r.drop);
  return A_SET.has(k) ? 'A' : B_SET.has(k) ? 'B' : 'C';
}
const WORD_TARGET = { A: 3200, B: 2200, C: 1500 };
const FAQ_TARGET = { A: 20, B: 14, C: 10 };

const isLanding = (p) => routeOf(p) || /^\/cab-service-in-/.test(p) || /-(taxi|rental)$/.test(p);
const shouldBeNoindex = (p) => /^\/(booking|bookings|login)/.test(p);

// ── Run ──────────────────────────────────────────────────────────────────────
console.log(bold(`SEO check — ${HOST}   (level: ${LEVEL})`));

const sitemapRes = await get('/sitemap.xml');
const sitemapUrls = [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (sitemapUrls.length === 0) {
  console.log(red('\nThe sitemap is empty — is the server running, and the backend reachable?'));
  process.exit(1);
}
const paths = sitemapUrls.map((u) => {
  const p = u.replace(/^https?:\/\/[^/]+/, '');
  return p === '' ? '/' : p;
});

const pages = [];
const sitemapStatus = [];
for (const p of paths) {
  const res = await get(p);
  sitemapStatus.push({ path: p, status: res.status });
  if (res.status === 200) pages.push(readPage(p, res.body));
}

// 1 ── Titles
{
  const bad = [];
  for (const p of pages) {
    const n = p.title.length;
    if (n > 60) bad.push(`${n} chars  ${p.path}  ${dim(p.title)}`);
    else if (n < 30) bad.push(`${n} chars (too short)  ${p.path}  ${dim(p.title)}`);
  }
  const dupes = new Map();
  pages.forEach((p) => dupes.set(p.title, [...(dupes.get(p.title) ?? []), p.path]));
  for (const [t, ps] of dupes)
    if (ps.length > 1) bad.push(`same title on ${ps.length} pages: ${dim(t)}`);
  check(1, 'Title length (30–60) and uniqueness', bad, `${pages.length} pages`);
}

// 2 ── Descriptions
{
  const bad = [];
  for (const p of pages) {
    const n = p.description.length;
    if (n === 0) bad.push(`missing  ${p.path}`);
    else if (n > 155) bad.push(`${n} chars  ${p.path}`);
    else if (n < 120) bad.push(`${n} chars (too short)  ${p.path}`);
  }
  const seen = new Map();
  pages.forEach((p) => seen.set(p.description, [...(seen.get(p.description) ?? []), p.path]));
  for (const [d, ps] of seen)
    if (d && ps.length > 1)
      bad.push(`same description on ${ps.length} pages: ${dim(d.slice(0, 60))}…`);
  check(2, 'Description length (120–155) and uniqueness', bad);
}

// 3 ── Near-duplicate pages
const landing = pages.filter((p) => isLanding(p.path));
{
  const grams = new Map(landing.map((p) => [p.path, bigrams(p.text)]));
  const bad = [];
  const worst = [];
  for (let i = 0; i < landing.length; i++) {
    for (let j = i + 1; j < landing.length; j++) {
      const a = landing[i];
      const b = landing[j];
      const r = similarity(grams.get(a.path), grams.get(b.path));
      worst.push({ r, a: a.path, b: b.path });
      if (r > 0.65) bad.push(`${(r * 100).toFixed(0)}%  ${a.path}  ↔  ${b.path}`);
    }
  }
  worst.sort((x, y) => y.r - x.r);
  const top = worst[0];
  check(
    3,
    'Near-duplicate pages (over 65%)',
    bad.sort().reverse(),
    top ? `worst pair ${(top.r * 100).toFixed(0)}% — ${top.a} ↔ ${top.b}` : '',
  );
}

// 4 ── Word count per tier
{
  const bad = [];
  for (const p of pages) {
    const t = tierOf(p.path);
    if (!t) continue;
    if (p.words < WORD_TARGET[t])
      bad.push(`${p.words} words (tier ${t} wants ${WORD_TARGET[t]})  ${p.path}`);
  }
  const routes = pages.filter((p) => routeOf(p.path));
  const avg = routes.length
    ? Math.round(routes.reduce((s, p) => s + p.words, 0) / routes.length)
    : 0;
  check(
    4,
    'Words per route page, by tier',
    bad,
    `${routes.length} route pages, average ${avg} words`,
  );
}

// 5 ── FAQ count
{
  const bad = [];
  for (const p of pages) {
    const t = tierOf(p.path);
    if (!t) continue;
    if (p.faq < FAQ_TARGET[t])
      bad.push(`${p.faq} questions (tier ${t} wants ${FAQ_TARGET[t]})  ${p.path}`);
  }
  check(5, 'Questions answered per route page', bad);
}

// 6 ── Inbound internal links
{
  const inbound = new Map(pages.map((p) => [p.path, new Set()]));
  for (const p of pages)
    for (const href of p.links) {
      const target = href.replace(/\/$/, '') || '/';
      if (inbound.has(target) && target !== p.path) inbound.get(target).add(p.path);
    }
  const bad = [];
  for (const p of pages) {
    if (!isLanding(p.path)) continue;
    const n = inbound.get(p.path).size;
    if (n < 12) bad.push(`${n} inbound  ${p.path}`);
  }
  const total = [...inbound.values()].reduce((s, v) => s + v.size, 0);
  check(
    6,
    'Inbound internal links per landing page (12+)',
    bad,
    `${total} internal links across the site`,
  );
}

// 7 ── Sitemap
{
  const bad = sitemapStatus.filter((s) => s.status !== 200).map((s) => `${s.status}  ${s.path}`);
  check(7, 'Every sitemap URL returns 200', bad, `${sitemapStatus.length} URLs`);
}

// 8 ── JSON-LD
{
  const bad = [];
  const assets = new Set();
  for (const p of pages) {
    if (p.ld.length === 0 && isLanding(p.path)) bad.push(`no structured data  ${p.path}`);
    for (const block of p.ld) {
      try {
        const data = JSON.parse(block);
        // Structured data names its assets with the production origin, which is not the
        // host being tested. Only the path matters: a logo that 404s on the live domain
        // 404s in the markup a crawler reads, and that is what this is looking for.
        JSON.stringify(data).replace(/"(?:logo|image|url)":"([^"]+)"/g, (_, url) => {
          if (/\.(png|jpe?g|svg|webp|avif|ico)$/i.test(url))
            assets.add(new URL(url, HOST).pathname);
          return '';
        });
      } catch {
        bad.push(`invalid JSON-LD  ${p.path}`);
      }
    }
  }
  for (const a of assets) {
    const res = await get(a);
    if (res.status !== 200) bad.push(`${res.status} for an asset named in structured data: ${a}`);
  }
  check(
    8,
    'Structured data parses, and the images it names exist',
    bad,
    `${assets.size} asset(s) referenced`,
  );
}

// 9 ── Robots
{
  const bad = [];
  for (const p of pages) {
    if (/noindex/.test(p.robots)) bad.push(`noindex on a page in the sitemap  ${p.path}`);
    if (p.h1 !== 1) bad.push(`${p.h1} h1 tags  ${p.path}`);
    if (!p.canonical) bad.push(`no canonical  ${p.path}`);
  }
  for (const p of ['/booking/details', '/bookings', '/login']) {
    const res = await get(p);
    if (res.status === 200 && !/noindex/.test(res.body))
      bad.push(`${p} is indexable — it must not be`);
  }
  check(9, 'Indexable pages indexable, funnel pages not', bad);
}

// 10 ── Internal links resolve
{
  const targets = new Set();
  for (const p of pages) for (const href of p.links) targets.add(href.replace(/\/$/, '') || '/');
  const bad = [];
  for (const t of targets) {
    if (t.startsWith('/api/')) continue;
    const res = await get(t);
    if (res.status === 404) bad.push(`404  ${t}`);
    // /bookings sending a signed-out visitor to /login is the design. Every other
    // redirect on an internal link is a link pointing at the wrong URL.
    else if (res.status >= 300 && res.status < 400 && !shouldBeNoindex(t))
      bad.push(`${res.status} → ${res.location}  ${t}`);
  }
  check(
    10,
    'Every internal link resolves without a redirect',
    bad,
    `${targets.size} distinct targets`,
  );
}

// ── Scorecard ────────────────────────────────────────────────────────────────
{
  const inbound = new Map(pages.map((p) => [p.path, 0]));
  for (const p of pages)
    for (const href of p.links) {
      const t = href.replace(/\/$/, '') || '/';
      if (inbound.has(t) && t !== p.path) inbound.set(t, inbound.get(t) + 1);
    }
  const grams = new Map(landing.map((p) => [p.path, bigrams(p.text)]));
  const rows = pages
    .filter((p) => routeOf(p.path))
    .map((p) => {
      const r = routeOf(p.path);
      const reverse = `/${r.drop}-to-${r.pickup}-cab`;
      const rev = grams.has(reverse) ? similarity(grams.get(p.path), grams.get(reverse)) : null;
      return {
        path: p.path,
        tier: tierOf(p.path),
        words: p.words,
        faq: p.faq,
        inbound: inbound.get(p.path) ?? 0,
        title: p.title.length,
        rev: rev === null ? '—' : `${(rev * 100).toFixed(0)}%`,
      };
    })
    .sort((a, b) => a.tier.localeCompare(b.tier) || a.words - b.words);
  const md = [
    `# Route scorecard — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    '| route | tier | words | questions | inbound links | title chars | vs reverse |',
    '|---|---|---|---|---|---|---|',
    ...rows.map(
      (r) =>
        `| \`${r.path}\` | ${r.tier} | ${r.words} | ${r.faq} | ${r.inbound} | ${r.title} | ${r.rev} |`,
    ),
  ].join('\n');
  writeFileSync('/tmp/hmc-seo-scorecard.md', md);
  console.log(dim(`\nScorecard → /tmp/hmc-seo-scorecard.md (${rows.length} routes)`));
}

// ── Verdict ──────────────────────────────────────────────────────────────────
const failed = results.filter((r) => r.failures.length > 0);
const gatedFailed = failed.filter((r) => gated.includes(r.n));
console.log('');
if (gatedFailed.length === 0) {
  const ungated = failed.length
    ? dim(` (${failed.length} target(s) not met yet, not gated at this level)`)
    : '';
  console.log(green(bold('✓ Every gated check passed.')) + ungated);
  process.exit(0);
}
console.log(
  red(
    bold(
      `✗ ${gatedFailed.length} gated check(s) failed: ${gatedFailed.map((r) => r.n).join(', ')}`,
    ),
  ),
);
process.exit(1);
