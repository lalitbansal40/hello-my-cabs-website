/**
 * Submit the live sitemap to IndexNow — run it after a deploy has gone live.
 *
 *   node scripts/seo/indexnow.mjs --dry-run          # print what would be sent
 *   node scripts/seo/indexnow.mjs                    # send it
 *
 * Reads the key from src/lib/indexnow.ts and checks the live key file first: IndexNow
 * verifies ownership by fetching /<key>.txt from the site, so submitting before that file is
 * deployed gets the key marked as failing.
 */
import { readFileSync } from 'node:fs';

const SITE = (process.env.SITE_URL ?? 'https://www.hellomycabs.com').replace(/\/+$/, '');
const dry = process.argv.includes('--dry-run');
const key = readFileSync(new URL('../../src/lib/indexnow.ts', import.meta.url), 'utf8').match(
  /INDEXNOW_KEY = '([0-9a-f]{32})'/,
)?.[1];
if (!key) throw new Error('No key found in src/lib/indexnow.ts');

const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => u.startsWith(SITE));
const payload = { host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList };

const keyRes = await fetch(payload.keyLocation);
const keyBody = keyRes.ok ? (await keyRes.text()).trim() : '';
console.log(
  `key file  ${payload.keyLocation} → ${keyRes.status}${keyBody === key ? ' (matches)' : ' (MISSING or different)'}`,
);
console.log(`urls      ${urlList.length} from ${SITE}/sitemap.xml`);

if (dry) {
  const shown =
    urlList.length > 3 ? [...urlList.slice(0, 3), `…and ${urlList.length - 3} more`] : urlList;
  console.log(JSON.stringify({ ...payload, urlList: shown }, null, 2));
  process.exit(0);
}
if (keyBody !== key) {
  console.error('Not sending: the key file is not live yet. Deploy first, then run this again.');
  process.exit(1);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
console.log(
  `IndexNow  ${res.status} ${res.status === 200 || res.status === 202 ? 'accepted' : await res.text()}`,
);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
