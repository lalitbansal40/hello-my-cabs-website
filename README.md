# Hello My Cab — customer website

Next.js (App Router) + TypeScript. Customer-facing only: browse routes, see a fare, book.
The driver app and the super-admin console are elsewhere.

## Running it

```bash
cp .env.example .env.local     # already done on a fresh clone
npm install
npm run dev
```

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | The same backend the driver app uses. Only its `/public/*` endpoints are read here. |
| `NEXT_PUBLIC_SITE_URL` | The canonical origin. Every absolute URL — canonicals, sitemap, JSON-LD — is built from it. |

`NEXT_PUBLIC_SITE_URL` has to be the exact host you want indexed. A mismatch splits the
site's ranking across two hosts, and nothing warns you.

## How this is built, and why

**No token, anywhere.** The backend exposes a read-only `/api/v1/public/*` surface for this
site. A search crawler never logs in, and neither does someone checking a price for the
first time — anything behind auth can neither rank nor convert.

**Prices are fetched on the server.** Every fetch runs in a server component, so the HTML a
crawler receives already contains the numbers. A page that fills its prices in from the
browser is a page with no prices to index.

**Cached for a day, revalidated in the background.** Fares change rarely and a route page is
re-crawled several times daily; none of that should reach the database.

**Not every city pair gets a page.** 175 cities make roughly 30,000 combinations. The
backend's `/public/routes` returns only the ~90 carrying a real listed price, and the
sitemap is built from that. A page per combination, differing only in two swapped names, is
what search engines demote an entire site for.

**The palette comes from the driver app**, so the two read as one company. The layout
deliberately does not follow the market convention (boxed search form under a stock photo).

## Layout

```
src/
  app/
    layout.tsx     root metadata — metadataBase, titles, robots directives
    page.tsx       home
    robots.ts      blocks indexing on any non-production host
    sitemap.ts     built from the priced routes
  lib/
    env.ts         config, validated at import — a missing site URL fails the build
    api.ts         typed client for the backend's public endpoints
    schema.tsx     JSON-LD helpers (Organization, FAQ, Breadcrumb)
```

## Before going live

- Point `NEXT_PUBLIC_SITE_URL` at the real host — `robots.ts` blocks indexing until it does
- Add `public/logo.png` (referenced by the Organization schema)
- Submit the sitemap in Search Console
