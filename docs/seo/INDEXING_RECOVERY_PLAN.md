# Indexing recovery plan

This is a code/quality recovery candidate, not a guarantee of Google indexing. The user's
18 October2026 GSC figures are150 known/2 indexed/148 excluded:120 discovered,24 crawled,
2 redirects,1 missing,1 robots-blocked. They were supplied as context, not read through an
authenticated Search Console session.

| Priority | Work                                                                | Result / next action                                                                                                                                      |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Preserve owner changes, isolated branch, architecture/baseline      | Complete; see BASELINE_AUDIT.md                                                                                                                           |
| P0       | Independent source inventory vs sitemap vs rendered URLs            | 154 public pages,145 intended indexable,156 crawled including two invalid controls; match                                                                 |
| P0       | SSR/indexability/canonicals/robots/404                              | All intended pages verified; exact production-origin robots check added; existing useful routes/canonicals retained                                       |
| P0       | Upstream outage must not publish an empty directory/partial sitemap | Critical generation reads now propagate failures; actual unavailable-upstream build rejected                                                              |
| P1       | Internal link graph and mobile navigation                           | Zero initial orphans/broken links; directory now links all8 vehicles contextually                                                                         |
| P1       | Route content quality                                               | All145 URLs classified in CSV; estimated distances/time explicitly qualified; no filler or invented facts                                                 |
| P1       | Review integrity and schema                                         | Inconsistent counters excluded from route markup; self-serving city rating removed from schema; visible unmarked feedback retained pending reconciliation |
| P1       | Genuine review provenance                                           | Owner action: investigate ReviewStats/raw completed-booking ratings; no DB repair/delete/rebuild executed                                                 |
| P2       | Reliable dates/structured data                                      | Unsupported build/render lastmod/dateModified removed; explicit guide editorial dates retained; unproven stock removed; JSON-LD safely escaped            |
| P2       | Regression and performance review                                   | Source-HTML full crawl, offline tests, responsive/read-only booking checks and artifact/payload observations; no unmeasured cache/framework rewrite       |
| External | Actual GSC404/robots URL identification                             | Exact URL export needed; counts alone cannot identify these requests                                                                                      |
| External | Deployment/Search Console/monitoring                                | Manual checklist prepared; not executed or authorized here                                                                                                |

## Release order

1. Review the diff and owner decision queues. Preserve existing fares, policies, six held routes,
   sample-package noindex gates and all customer integrations.
2. Use production canonical/API configuration and build a fresh artifact. The local audit build
   embeds a loopback snapshot API and cannot be deployed as-is.
3. Deploy only after explicit authorization. Follow the repository's existing Amplify Node22
   build/artifact cleanup, not an unrelated hosting/framework migration.
4. Verify real responses and live fare/review projections; recheck sitemap, critical page types,
   public assets, booking handoff and invalid URLs. Never submit a real customer booking as a test.
5. Run priority live URL inspections and appropriate indexing requests, then compare unchanged
   URL cohorts over several weeks. Record deploy dates and subsequent Google crawl dates.

No useful page is merged, redirected, newly noindexed or canonicalized away due to indexing status.
No robots API blanket block, Indexing API submission, fake reviews, backlinks or engagement is added.

See [post-deploy checklist](POST_DEPLOY_CHECKLIST.md) for commands and GSC procedure. Google explains
that sitemap submission is a hint, not a crawl/index guarantee in its
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
