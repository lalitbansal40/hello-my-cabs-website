# Ledger — master runbook (27 Nov 2026)

Implements `docs/seo/PROMPT_MASTER_NEXT_27NOV.md`. Start: backend `002c5e4`, website `c1dc126`, app `b6293e1`.

| Row | Item | Status | Evidence |
|---|---|---|---|
| M0 | status re-check | done | 27 Nov: `/health` 002c5e4; website c1dc126 (7 untracked/owner paths); app b6293e1 clean; sitemap.xml 45 URLs; monitor-domains: apex/http 301 → www, TLS 65–173 days, **hellomycab.com still a separate site (117 pages)**, hellomycab.co unrelated gambling page |
| M1 | weekly 30 Nov | scheduled | |
| M2 | Lighthouse 3-run + Jaipur city verdict | scheduled | |
| M3 | Request Indexing (owner) | scheduled | |
| M4 | weekly 7 Dec | scheduled | |
| M5 | Validate fix 11 Dec (owner) | scheduled | |
| M6 | 2-week rule finding | scheduled | |
| M7 | weekly 14 Dec | scheduled | |
| M8 | weekly 21 Dec | scheduled | |
| M9 | 4-week rule / lean template proposal | scheduled | |
| M10 | later weeklies | scheduled | |
| M11 | monthly checks | scheduled | |
| M12 | keyword-files prompt (K0–K40) | done | `LEDGER_KEYWORD_FILES_27NOV.md` all rows; backend `1e3e63c`, website `2e938cb` |
| M21 | weekly lists held Wave 2 pages | done | `gsc-weekly` 'Waiting for Wave 2: 35 pages, 12 seen by Google' (27 Nov export) + `statusOf()` |
| M22 | release-wave covers WAVE2_PATHS | done | Pages read `isReleasedPath` (RELEASED_WAVES); sitemap lists WAVE2_PATHS once released (station only with its transfer); `--check` measures them |
| M23 | survey prep | waiting (owner F-8) | Dry run to refresh when the owner says 'bhej do' (`npx tsx scripts/send-route-survey.ts`) |
| M24 | baseline discipline | done | `scripts/seo/weekly.md` §11; this release passed the gate without rewriting the baseline |
| M25 | evidence hygiene | done | `weekly.md` §11 rule (≤ 300 kB screenshots); no new PNGs this release |
| M26 | memory update | done | project memory updated (27 Nov) |
| M30 | Wave 2 release | waiting (trigger) | |
| M40 | old domain | waiting (trigger) | |
| M50 | owner decisions applied | waiting (trigger) | |
