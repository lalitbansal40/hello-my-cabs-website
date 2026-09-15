/**
 * Point old URLs at new route pages as those routes get published.
 *
 *   node scripts/seo/old-domain/update-map.mjs            # show what would change
 *   node scripts/seo/old-domain/update-map.mjs --write    # and write map.json
 *
 * map.json sends an old route that the new site does not have (Jaipur → Pushkar, say) to
 * the nearest city page. When the backend starts publishing that route, the old URL should
 * go to its own page instead. This reads /public/routes and upgrades every entry whose old
 * path names a route that now exists. Run make-redirects.mjs afterwards, and redeploy the
 * redirects if they are live.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const API = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1').replace(
  /\/+$/,
  '',
);
const file = new URL('map.json', import.meta.url);
const map = JSON.parse(readFileSync(file, 'utf8'));

const body = await fetch(`${API}/public/routes`).then((r) => r.json());
if (!body?.ok) throw new Error(`GET /public/routes failed: ${body?.error?.code ?? 'unknown'}`);
const slug = (c) => c.toLowerCase().replace(/_/g, '-');
const live = new Map(
  body.data.routes.map((r) => [
    `${slug(r.pickup)}>${slug(r.drop)}`,
    `/${slug(r.pickup)}-to-${slug(r.drop)}-cab`,
  ]),
);

// The old site spelled a few places its own way.
const ALIAS = {
  jhalwer: 'jhalawar',
  jasilmer: 'jaisalmer',
  ahemdabad: 'ahmedabad',
  palani: 'pilani',
  manhorpur: 'manoharpur',
  khatushyamji: 'khatu-shyam-ji',
};

let changed = 0;
for (const r of map.redirects) {
  const m = r.from.match(/^\/([a-z]+)-to-([a-z-]+?)(?:-one-way-taxi|-taxi-service|-taxi)?\/$/);
  if (!m) continue;
  const to = live.get(`${m[1]}>${ALIAS[m[2]] ?? m[2]}`);
  if (to && to !== r.to) {
    console.log(`${r.from}  ${r.to} → ${to}`);
    r.to = to;
    r.why = 'wahi route';
    changed++;
  }
}
console.log(`${changed} redirect(s) upgraded.`);
if (changed && process.argv.includes('--write')) {
  map.checked = new Date().toISOString().slice(0, 10);
  writeFileSync(file, JSON.stringify(map, null, 2) + '\n');
  console.log('map.json written — now run make-redirects.mjs');
}
