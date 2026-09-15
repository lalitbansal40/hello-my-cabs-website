# hellomycab.com → www.hellomycabs.com

`hellomycab.com` is this business's own site since 2017: 124 pages in Google's index, the
same phone number, the same routes. Control of the domain and its hosting has been lost
(GoDaddy registration until 2029, DNS and hosting at Hostinger). The day it is back, move
every old page to its new address with a **301 redirect** — that is how a search engine
carries a page's standing across. Until then these files wait here.

| file | what it is |
|---|---|
| `map.json` | the single source: every old path → its new path, and why |
| `make-redirects.mjs` | writes `htaccess.txt` and `cloudflare-bulk.csv` from `map.json` |
| `verify-redirects.mjs` | fetches every old URL and checks it lands on the right new one in one 301 |
| `update-map.mjs` | when a new route is published, points its old URL at the new route page |
| `test-redirects.mjs` | proves the verifier catches mistakes, against a fake local server |

## The day control comes back

1. `node scripts/seo/old-domain/update-map.mjs --write` (routes published since this was made)
2. `node scripts/seo/old-domain/make-redirects.mjs`
3. Put the redirects live — **one** of:
   - **Hosting (Hostinger / WordPress) recovered:** File Manager → `public_html/.htaccess` →
     paste all of `htaccess.txt` at the very top, above `# BEGIN WordPress`. Save.
   - **Only the domain (GoDaddy) recovered:** add the domain to Cloudflare (free plan), change
     the nameservers at GoDaddy to Cloudflare's, add a proxied `A` record for `@` and `www`
     (any IP, e.g. `192.0.2.1` — Cloudflare answers before it), then Rules → Bulk Redirects →
     create a list → import `cloudflare-bulk.csv` → create a rule using the list.
4. `node scripts/seo/old-domain/verify-redirects.mjs` — must say `125/125` (124 + the
   fallback check). Anything else: fix and run again.
5. Google Search Console: verify the old domain as a property too (DNS TXT), then in the old
   property **Settings → Change of address → hellomycabs.com**.
6. Keep the redirects **for good**. Turn on auto-renew for the domain at GoDaddy.
7. If there was email on `@hellomycab.com`, keep its MX records when changing DNS.

## Rules the map follows

- A route the new site has → that route's page (`/jaipur-to-delhi-taxi-service/` →
  `/jaipur-to-delhi-cab`).
- A route it does not have → the city page of where the trip starts (`/jaipur-to-pushkar-taxi/`
  → `/cab-service-in-jaipur`), until that route is published (step 1 upgrades it).
- Gurugram / Faridabad → Jaipur go to Delhi → Jaipur; Ghaziabad → Jaipur to Noida → Jaipur.
- Anything else on the old domain → the new home page.
- Never copy the old site's text onto the new one.
