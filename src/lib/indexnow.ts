import { env } from './env';

/**
 * IndexNow — telling Bing (and Yandex, Seznam, Naver) that a URL is new or changed, instead
 * of waiting for them to notice.
 *
 * Bing matters out of proportion here: it is the index ChatGPT's search and Microsoft
 * Copilot read from. A page Bing has not crawled is a page an AI answer cannot cite.
 *
 * The key is public by design — the protocol proves ownership by serving it at
 * /<key>.txt on the same host, which is what public/1860c7891df29b9743fbf27f626081b5.txt is. Changing the key means
 * replacing that file in the same commit.
 */
export const INDEXNOW_KEY = '1860c7891df29b9743fbf27f626081b5';

const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** The body the protocol expects, for the site's own host. Exported so it can be checked. */
export function indexNowPayload(urls: string[]) {
  const host = new URL(env.siteUrl).host;
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${env.siteUrl}/${INDEXNOW_KEY}.txt`,
    // The protocol takes up to 10,000 a request; the site has nowhere near that.
    urlList: urls.filter((u) => u.startsWith(env.siteUrl)).slice(0, 10_000),
  };
}

/** Submits, and reports what the endpoint said. 200 and 202 both mean accepted. */
export async function submitToIndexNow(urls: string[]) {
  const payload = indexNowPayload(urls);
  if (payload.urlList.length === 0) return { ok: false, status: 0, submitted: 0 };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return {
    ok: res.status === 200 || res.status === 202,
    status: res.status,
    submitted: payload.urlList.length,
  };
}
