#!/usr/bin/env python3
"""
The site, read the way a crawler reads it (13 Nov 2026, PROMPT_INDEX_AND_RANK_13NOV Step 0).

    python3 -I scripts/seo/crawl-audit.py                          # production
    python3 -I scripts/seo/crawl-audit.py http://localhost:3100    # a local `npm start`
    python3 -I scripts/seo/crawl-audit.py <host> --only /a,/b      # just these paths

For every URL in the host's sitemap (index and groups are followed):
  code, X-Robots-Tag, title/description and their lengths, meta robots, canonical, H1/H2
  counts, visible word count, JSON-LD @types (INVALID when it does not parse), internal
  links out, HTML bytes split into inline <script> / inline <style> / the rest;
then across pages: internal links in, and the 5-word-shingle Jaccard similarity of the
visible text of every pair (the measure the plan's "< 35% for Tier 1" uses).

Writes docs/seo/evidence/crawl-<YYYY-MM-DD>[-<label>].json and a .md summary next to it.
Python 3 standard library only. One request at a time, 300 ms apart, a plain User-Agent.
"""
import datetime
import html
import json
import os
import re
import statistics
import sys
import time
import urllib.request
from html.parser import HTMLParser

UA = 'hellomycabs-site-audit/1.0 (+https://www.hellomycabs.com)'
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.status, dict(r.headers), r.read().decode('utf-8', 'replace')


def sitemap_urls(host):
    seen, out, queue = set(), [], [f'{host}/sitemap.xml']
    while queue:
        sm = queue.pop(0)
        if sm in seen:
            continue
        seen.add(sm)
        _, _, xml = fetch(sm)
        locs = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)
        if '<sitemapindex' in xml:
            queue.extend(locs)
        else:
            out.extend(locs)
    return list(dict.fromkeys(out))


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.in_title = '', False
        self.meta, self.canonical = {}, None
        self.h1, self.in_h1, self.h2 = [], False, 0
        self.text, self.skip = [], 0
        self.links, self.ld, self.in_ld = set(), [], False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            key = (a.get('name') or a.get('property') or '').lower()
            if key:
                self.meta[key] = a.get('content') or ''
        elif tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href')
        elif tag == 'h1':
            self.in_h1 = True
            self.h1.append('')
        elif tag == 'h2':
            self.h2 += 1
        elif tag == 'a':
            href = a.get('href') or ''
            if href.startswith('/') and not href.startswith('//'):
                self.links.add(href.split('#')[0].split('?')[0].rstrip('/') or '/')
        if tag in ('script', 'style', 'noscript', 'template'):
            self.skip += 1
            if tag == 'script' and a.get('type') == 'application/ld+json':
                self.in_ld = True
                self.ld.append('')

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'h1':
            self.in_h1 = False
        if tag in ('script', 'style', 'noscript', 'template'):
            self.skip = max(0, self.skip - 1)
            self.in_ld = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_ld:
            self.ld[-1] += data
        if self.skip:
            return
        if self.in_h1:
            self.h1[-1] += data
        self.text.append(data)


def ld_types(blocks):
    types = []
    for b in blocks:
        try:
            j = json.loads(b)
        except Exception:
            types.append('INVALID')
            continue
        items = j if isinstance(j, list) else j.get('@graph', [j])
        for i in items:
            t = i.get('@type') if isinstance(i, dict) else None
            types.extend(t if isinstance(t, list) else [t or '?'])
    return types


def shingles(text, k=5):
    w = re.findall(r'\w+', text.lower())
    return {' '.join(w[i:i + k]) for i in range(max(0, len(w) - k + 1))}


def audit(host, only=None):
    host = host.rstrip('/')
    urls = sitemap_urls(host) if not only else [host + p for p in only]
    pages = []
    for u in urls:
        # Production sitemaps name the production host; audit the same paths on `host`.
        path = re.sub(r'^https?://[^/]+', '', u) or '/'
        target = host + path
        t0 = time.time()
        try:
            code, headers, body = fetch(target)
        except Exception as e:  # noqa: BLE001 — recorded, not hidden
            pages.append({'path': path, 'error': str(e)})
            continue
        p = Page()
        p.feed(body)
        text = re.sub(r'\s+', ' ', ' '.join(p.text)).strip()
        scripts = sum(len(m) for m in re.findall(r'<script\b[^>]*>.*?</script>', body, re.S))
        styles = sum(len(m) for m in re.findall(r'<style\b[^>]*>.*?</style>', body, re.S))
        desc = p.meta.get('description', '')
        pages.append({
            'path': path,
            'code': code,
            'ms': int((time.time() - t0) * 1000),
            'xRobotsTag': headers.get('X-Robots-Tag') or headers.get('x-robots-tag'),
            'title': html.unescape(p.title.strip()),
            'titleLen': len(html.unescape(p.title.strip())),
            'description': desc,
            'descriptionLen': len(desc),
            'robots': p.meta.get('robots'),
            'canonical': p.canonical,
            'h1': [h.strip() for h in p.h1],
            'h2': p.h2,
            'words': len(text.split()),
            'ldTypes': ld_types(p.ld),
            'linksOut': sorted(p.links),
            'bytes': {'total': len(body), 'inlineScript': scripts, 'inlineStyle': styles,
                      'rest': len(body) - scripts - styles},
            '_text': text,
        })
        time.sleep(0.3)

    ok = [p for p in pages if 'error' not in p]
    inbound = {}
    for p in ok:
        for link in p['linksOut']:
            inbound[link] = inbound.get(link, 0) + 1
    for p in ok:
        p['linksIn'] = inbound.get(p['path'].rstrip('/') or '/', 0)

    sh = {p['path']: shingles(p.pop('_text')) for p in ok}
    paths = list(sh)
    pairs = []
    for i in range(len(paths)):
        for j in range(i + 1, len(paths)):
            a, b = sh[paths[i]], sh[paths[j]]
            if a and b:
                pairs.append((len(a & b) / len(a | b), paths[i], paths[j]))
    pairs.sort(reverse=True)
    maxsim = {}
    for s, a, b in pairs:
        for x, y in ((a, b), (b, a)):
            if s > maxsim.get(x, (0, ''))[0]:
                maxsim[x] = (s, y)
    for p in ok:
        s, other = maxsim.get(p['path'], (0, ''))
        p['maxSimilarity'] = round(s, 3)
        p['mostSimilarTo'] = other
    # Pages with hardly any text in common score 0.0; pages fetched by --only compare
    # among themselves, so a Tier-1-only run is not a whole-site similarity figure.
    return pages, pairs


def summary(pages, pairs, host, scope):
    ok = [p for p in pages if 'error' not in p]
    lines = [f'# Crawl audit — {host} — {datetime.date.today()} ({scope})', '']
    lines.append(f'- pages: {len(pages)}, errors: {len(pages) - len(ok)}')
    if not ok:
        return '\n'.join(lines)
    codes = {}
    for p in ok:
        codes[p['code']] = codes.get(p['code'], 0) + 1
    lines.append(f'- status codes: {codes}')
    lines.append(f"- meta robots: {sorted({str(p['robots']) for p in ok})}; "
                 f"X-Robots-Tag: {sorted({str(p['xRobotsTag']) for p in ok})}")
    bad_canon = [p['path'] for p in ok
                 if (re.sub(r'^https?://[^/]+', '', p['canonical'] or '').rstrip('/') or '/')
                 != (p['path'].rstrip('/') or '/')]
    lines.append(f'- canonical not self: {len(bad_canon)} {bad_canon[:5]}')
    tl = [p['titleLen'] for p in ok]
    dl = [p['descriptionLen'] for p in ok]
    lines.append(f'- title length min/median/max: {min(tl)}/{statistics.median(tl)}/{max(tl)}; '
                 f'outside 30–60: {sum(not 30 <= x <= 60 for x in tl)}')
    lines.append(f'- description length min/median/max: {min(dl)}/{statistics.median(dl)}/{max(dl)}; '
                 f'outside 120–155: {sum(not 120 <= x <= 155 for x in dl)}')
    lines.append(f"- duplicate titles: {len(tl) - len({p['title'] for p in ok})}; "
                 f"duplicate descriptions: {len(dl) - len({p['description'] for p in ok})}")
    lines.append(f"- pages without exactly one H1: {sum(len(p['h1']) != 1 for p in ok)}")
    lines.append(f"- invalid JSON-LD blocks: {sum(p['ldTypes'].count('INVALID') for p in ok)}")
    b = [p['bytes']['total'] for p in ok]
    s = [p['bytes']['inlineScript'] for p in ok]
    lines.append(f'- HTML bytes median/max: {int(statistics.median(b))}/{max(b)}; '
                 f'inline script median: {int(statistics.median(s))}')
    w = [p['words'] for p in ok]
    lines.append(f'- words min/median/max: {min(w)}/{int(statistics.median(w))}/{max(w)}')
    low = sorted(ok, key=lambda p: p['linksIn'])[:15]
    lines.append(f"- pages with < 15 internal links in: {sum(p['linksIn'] < 15 for p in ok)} "
                 f"(fewest: {[(p['path'], p['linksIn']) for p in low[:8]]})")
    lines.append(f'- similar pairs: > 0.6: {sum(x[0] > 0.6 for x in pairs)}, '
                 f'> 0.5: {sum(x[0] > 0.5 for x in pairs)}, > 0.35: {sum(x[0] > 0.35 for x in pairs)}')
    lines += ['', '## Most similar pairs', '']
    for sim, a, bb in pairs[:15]:
        lines.append(f'- {sim:.2f}  {a}  ~  {bb}')
    return '\n'.join(lines) + '\n'


def main():
    args = sys.argv[1:]
    host = next((a for a in args if a.startswith('http')), 'https://www.hellomycabs.com')
    only = None
    label = ''
    if '--only' in args:
        only = [p.strip() for p in args[args.index('--only') + 1].split(',') if p.strip()]
        label = '-subset'
    if '--label' in args:
        label = '-' + args[args.index('--label') + 1]
    pages, pairs = audit(host, only)
    day = datetime.date.today().isoformat()
    out = os.path.join(ROOT, 'docs', 'seo', 'evidence', f'crawl-{day}{label}')
    with open(out + '.json', 'w') as f:
        json.dump({'host': host, 'date': day, 'pages': pages,
                   'topPairs': [{'similarity': round(s, 3), 'a': a, 'b': b} for s, a, b in pairs[:200]]},
                  f, indent=1, ensure_ascii=False)
    with open(out + '.md', 'w') as f:
        f.write(summary(pages, pairs, host, 'subset' if only else 'sitemap'))
    print(summary(pages, pairs, host, 'subset' if only else 'sitemap'))
    print('wrote', out + '.json')


if __name__ == '__main__':
    main()
