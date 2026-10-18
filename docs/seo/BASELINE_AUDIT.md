# SEO recovery baseline — 18 October 2026

Repository: `hello-my-cabs-website`, initial HEAD `9296a19`, working branch
`seo/indexing-recovery-2026-10-18`. Existing untracked owner plans/prompts remain untouched.
This task supersedes the previous Ghoomo commit task. No commit, push, deployment, database
operation, Search Console change, booking, payment or message is authorized by this audit.

## Architecture and preserved behavior

Next16.3.4/React19.2.8/TypeScript App Router; AWS Amplify Node22 build in `amplify.yml`.
`src/app/[slug]/page.tsx` dispatches one-way, round-trip, by-car, city and vehicle pages.
Its API-backed allowlist permits runtime generation; only busiest routes/variants/cities/fleet
prebuild to stay within the existing Amplify artifact limit. Public fares are read through
`src/lib/api.ts`, mostly from one bulk `/public/fares/all` response, with existing daily fetch
cache/revalidation. Review summaries have an hourly cache and an intersection-triggered browser
refresh. Booking, payment, auth, quote, customer and WhatsApp endpoints are separate and remain
outside the change scope. No customer requests are submitted during checks.

Canonical origin comes from `NEXT_PUBLIC_SITE_URL`; this audit explicitly uses
`https://www.hellomycabs.com`. Root/page metadata, allowlist/404, robots, sitemap, variants, held
routes, route/city/vehicle content, schema, header/footer/mobile navigation and existing audit/test
scripts are inspected. Installed Next sitemap/robots/metadata/static-params/notFound docs were
read before edits. No framework/dependency upgrade or pricing/policy change is planned.

## Initial checks and live observations

Baseline `npm run lint`, `npm run test:rating` (10 cases), `tsc --noEmit` and `npm run build`
all pass. Exact commands/exits and logs are retained with audit evidence. Existing fetch cache was
present: a successful build alone does not prove fresh upstream API availability.

Read-only HTTP checks find13 priority HTML pages200, self canonicals, server-rendered headings,
fares and content, and two nonexistent URLs404. Live sitemap is145 URLs; robots permits public
crawling and references the preferred sitemap. HTTP non-www takes two redirects; HTTPS non-www
takes one; trailing slash takes one308; tracking query retains the clean canonical. Hosting owns
the hostname redirects; no redirect/SEO strategy changes are inferred.

Direct API checks during the initial survey return429 with remaining0/reset48s. No retry loop or
rate-limit bypass is used. Public cached API snapshots already present in the local Next cache
are copied to a temporary audit directory for reproducible offline reads, not treated as newly
retrieved production responses. Full route inventory/graph and final validation follow below via
the companion reports.

## Confirmed weaknesses to investigate/fix

1. `next.config.ts` creates `BUILD_TIME`; sitemap copies it to nearly every URL. Deploy/render
   time is not evidence of significant content modification. `webPageSchema` similarly receives
   a render-time “fares checked” timestamp. Policy dates are precise days although the visible
   source states only a month; retain explicit editorial guide dates, omit unsupported dates.
2. `robots.ts` uses substring matching, so a preview/lookalike hostname containing the brand
   could incorrectly receive production crawling rules. Exact approved origin comparison is safer.
3. Route schema emits Service plus Product with repeated offers, `InStock` without inventory
   evidence, and route rating; city TaxiService includes its own business rating. The cached
   review snapshot is internally inconsistent:94 route counts sum5,946,041 while site count is
   62,734; even its smallest route count62,744 exceeds the site total. Production Jaipur–Delhi
   HTML independently contains ratingCount63,209. This proves inconsistent counters, not fabricated
   reviews or a specific Google non-indexing cause. Backend source reads ReviewStats, populated
   from customer ratings; no `isSyntheticTestData` marker is found in current source. No raw
   production rating records were accessed or changed. Preserve visible reviews while introducing
   scoped structured-data integrity checks and documenting owner reconciliation.
4. Representative live HTML is large: home588,432 bytes, Jaipur–Delhi670,456, Jaipur–Agra617,620.
   Existing inline CSS is an intentional measured first-paint/deploy-size tradeoff. Measure actual
   duplication; do not disable it or alter fare caching without evidence.

## Evidence boundaries

GSC statistics/inspection dates are supplied by the user, not authenticated independently.
No server access logs or the actual GSC404/blocked URL list were supplied; the reported6%404 and
one blocked URL cannot be attributed to exact requests from these figures. Production source HTML
is available through curl even though the browsing tool could not open the site. Google guidance
is checked against primary Search Central docs; final reports link the applicable pages.

See [recovery plan](INDEXING_RECOVERY_PLAN.md), [internal links](INTERNAL_LINK_AUDIT.md),
[route content](ROUTE_CONTENT_AUDIT.md), [schema](STRUCTURED_DATA_AUDIT.md) and
[implementation summary](IMPLEMENTATION_SUMMARY.md) for final findings and results.
