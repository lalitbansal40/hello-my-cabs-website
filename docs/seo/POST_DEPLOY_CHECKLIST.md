# Manual deployment and Search Console checklist

No deployment, push, Search Console action, business-data update or review rebuild was executed.
These are operator steps after an explicit release decision, not completed evidence.

## 1. Build and release the correct candidate

1. Review the SEO branch diff and preserve the owner's pre-existing untracked plans/prompts.
2. Confirm production public configuration: `NEXT_PUBLIC_SITE_URL=https://www.hellomycabs.com`
   and `NEXT_PUBLIC_API_BASE_URL=https://api.hellomycabs.com/api/v1`. Keep existing authorized
   private configuration/analytics unchanged; never commit actual env files.
3. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run test:rating`, `npm run test:seo`
   and a **fresh** `npm run build`. Do not upload the local audit artifact: it embeds the
   loopback snapshot API. Do not deploy snapshot files as business data.
4. Use the existing Amplify Node22 build/artifact workflow. Keep its cache/source-map exclusion
   and artifact-size check. No framework, hosting, quote cache or customer auth redesign is needed.
5. Deploy only once authorized. Record commit, deployment ID/time, public configuration origins,
   real significant content revision dates and operator. A deployment timestamp is not sitemap lastmod.

## 2. Verify actual production responses

Use GETs without redirect-following first, so unexpected redirects are visible:

```bash
AUDIT_SITE=https://www.hellomycabs.com
curl -sS --max-time 25 -D /tmp/hmc-home.headers -o /tmp/hmc-home.html "$AUDIT_SITE/"
curl -sS --max-time 25 -D /tmp/hmc-route.headers -o /tmp/hmc-route.html "$AUDIT_SITE/jaipur-to-delhi-cab"
curl -sS --max-time 25 -D /tmp/hmc-sitemap.headers -o /tmp/hmc-sitemap.xml "$AUDIT_SITE/sitemap.xml"
curl -sS --max-time 25 "$AUDIT_SITE/robots.txt"
```

Check status200/content types; HTML source contains title, one main H1, fare table, actual route
content, links and one self canonical on the www HTTPS host. No unintended noindex/nofollow or
X-Robots-Tag may appear on intended public pages. Check root, /routes, Jaipur–Delhi one way,
round trip, Jaipur–Agra, Jaipur–Delhi Airport, city Agra/Kota, Dzire/Innova/Hatchback, About,
Contact, a policy and a guide. Check mobile navigation, all8 directory vehicle links, source-visible
FAQs and route/return-trip links. Check both nonexistent controls from the audit: true404/noindex,
no homepage blanket redirect. Preserve existing private/sample/held-route noindex behavior.

Use fresh approved public responses or a deployment build's public cache to recreate the source
inventory. With Python3 available, run the full read-only source crawl:

```bash
node scripts/seo/export-public-cache.mjs /tmp/hmc-public-snapshots
node scripts/seo/catalog-inventory.mjs /tmp/hmc-public-snapshots /tmp/hmc-source-inventory.json
python3 scripts/seo/recovery-audit.py --base https://www.hellomycabs.com   --inventory /tmp/hmc-source-inventory.json --out /tmp/hmc-live-seo --strict
```

The export reads only existing known public cache entries, not auth data; cache age is not proof
of a fresh response. A missing required snapshot is a stop condition, never a reason to invent one.
Match inventory to the **actual** current catalog:145 is the recorded snapshot, not a permanent
hardcoded business total. Investigate live API429s calmly; do not bypass limits or enable retries
inside server components. Compare normal, mobile and Googlebot HTML on selected priority pages.

Confirm critical pictures, map SVGs, logos, fonts and JS/CSS load without broken public references.
For a customer-flow smoke use a read-only fare/vehicle step and approved test tooling; never charge,
create a real booking, send OTP/WhatsApp or mutate a database as an unannounced SEO test.

## 3. Sitemap and structured data

1. Open production `/sitemap.xml`: valid XML, preferred absolute canonical URLs, no duplicates,
   redirects, known404s, private/customer links or intentionally noindex samples/held pages.
2. Generic pages should have no lastmod until a genuine revision exists. Explicit editorial
   guide dates remain; there should be no whole-site deployment-date stamp.
3. Confirm robots permits public pages/assets and names the exact sitemap. The API host's missing
   robots file is not proof of a robots block; inspect the actual blocked URL/property.
4. Confirm route/city JSON-LD parses, prices match displayed base fares, no fabricated stock or
   render-time dateModified, and current inconsistent review counters produce no rating schema.
   Visible unmarked feedback remains an owner reconciliation item; don't treat this guard as
   verification of individual reviews.
5. Use https://search.google.com/test/rich-results on the representative URLs in
   STRUCTURED_DATA_AUDIT.md. Record tool output/date; fix real errors, distinguish optional
   warnings from eligibility, and do not promise stars/FAQ results.

## 4. Google Search Console, performed manually by an authorized owner

1. Choose the verified property covering `https://www.hellomycabs.com`. Record the property and
   snapshot date. Check Manual actions/Security issues, without assuming either exists.
2. Under **Sitemaps**, inspect the existing `/sitemap.xml` submission. Record Success/error,
   last read, discovered count and submitted URL. If the existing URL is correct, retain it;
   resubmit after the actual deployment only when appropriate. Do not create duplicate variants.
3. **URL Inspection**: paste the exact canonical Jaipur–Delhi URL. Record indexed status,
   last crawl, fetch/crawl/index permissions and user/Google canonicals. Run **Test Live URL**;
   inspect rendered HTML/resources and screenshots. Availability is not indexing confirmation.
4. Repeat for homepage, /routes, Jaipur–Agra, one round trip, airport, city and vehicle pages,
   prioritizing pages materially improved. After a successful live test of an eligible changed
   page, use **Request indexing** where appropriate. Respect tool limits; repeatedly requesting
   the same URL is not a substitute for quality or a guarantee of faster inclusion.
5. Export the120 discovered and24 crawled URL cohorts, plus exact404 and robots-blocked URLs.
   Do not infer exact URLs from aggregate counts. Map supplied URLs to the audit CSV and server
   logs if available. Investigate unknown/obsolete references before proposing redirects or removals.
6. Use **Validate fix** only for an actual issue that was identified and fixed. No blanket
   robots/noindex change, consolidation or bulk indexing service is justified by these counts.
7. Do not use Google Indexing API for ordinary taxi pages. No automated Search Console setting
   change or indexing request has been performed by this implementation.

## 5. Monitor unchanged URL cohorts over several weeks

Record per URL: original exclusion bucket, page type, owner content-review status, genuine content
revision/deploy dates, latest Google crawl/fetch date, index status, user/Google canonicals,
impressions/clicks and next action. Keep the original cohorts stable so newly generated URLs do
not distort the comparison. Review around weeks1,2,4 and6; record calendar dates rather than
promising a deadline. Compare discovered→crawled→indexed transitions and regressions, sitemap read
changes and crawl responses. A crawl after deployment does not imply the new version was selected
for indexing. Prioritize helpful verified facts for persistent high-similarity pages.

If a deployment regresses customer behavior, use the existing previous-artifact rollback and
verify it; do not edit fare records, resurrect synthetic ratings or use noindex as a rollback.
Search Console reports, validation and indexing update asynchronously. Code cannot guarantee an
indexing result. See Google's [Page indexing report guidance](https://support.google.com/webmasters/answer/7440203).
