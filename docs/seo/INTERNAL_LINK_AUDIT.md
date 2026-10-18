# Server-rendered internal link audit

Method: read HTTP HTML without hydration. Ignore serialized RSC/script/style contents; parse real
anchors and hrefs, retain incoming source-page sets and crawl from home. Contextual counts exclude
header/footer/nav blocks (a conservative definition that also excludes breadcrumb links). The
crawl is bounded and excludes personal/API/customer token paths, rather than requesting them.

| Check                                                        | Before | After |
| ------------------------------------------------------------ | -----: | ----: |
| Intended indexable URLs                                      |    145 |   145 |
| Public/generated URLs audited, including held/sample/credits |    154 |   154 |
| URLs crawled including two nonexistent controls              |    156 |   156 |
| Orphans among intended indexable pages                       |      0 |     0 |
| Unreachable from home                                        |      0 |     0 |
| Broken public internal destinations                          |      0 |     0 |
| Broken fragments                                             |      0 |     0 |

## Concrete improvement

The routes directory already linked all listed city pairs, city hubs and published route variants.
It did not have a contextual full-fleet section. `src/app/routes/page.tsx` now reuses the existing
vehicle request to show8 crawlable vehicle links with descriptive taxi/rental intent. No extra
API request, new landing page or homepage/footer keyword dump was added. Six of these targets
already appeared in the directory footer, so unique source-page incoming counts need not rise
for those six; contextual counts still rise. Two vehicles gain a new incoming source page.

| Vehicle URL                         | Incoming before/after | Contextual before/after |
| ----------------------------------- | --------------------- | ----------------------- |
| `/dzire-taxi`                       | 153/153               | 18/19                   |
| `/ertiga-taxi`                      | 153/153               | 18/19                   |
| `/force-urbania-rental`             | 19/20                 | 19/20                   |
| `/hatchback-taxi`                   | 153/153               | 18/19                   |
| `/innova-crysta-taxi`               | 153/153               | 23/24                   |
| `/tempo-traveller-12-seater-rental` | 153/153               | 23/24                   |
| `/tempo-traveller-14-seater-rental` | 153/153               | 18/19                   |
| `/tempo-traveller-16-seater-rental` | 18/19                 | 18/19                   |

## Preserved architecture

Home → /routes → existing city/service hub → individual route already works. Existing one-way/
round-trip/car reciprocal links and matching breadcrumb paths remain. The mobile menu is portalled
and its overlay links are interactive after hydration; essential public destinations are also
present in the initial source through header/footer/directory links. Two representative production
URLs have identical headings, canonicals, paragraphs and anchor sets for audit, Googlebot and
mobile user agents. There is no demonstrated cloaking or JavaScript-only primary content.

Final responsive/browser results and graph artifacts are linked from
[implementation summary](IMPLEMENTATION_SUMMARY.md). No orphan-related Google exclusion cause
was confirmed; the initial graph was already connected. Google recommends normal crawlable
[anchor links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
