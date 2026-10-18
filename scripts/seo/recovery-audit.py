#!/usr/bin/env python3
"""Read-only source-HTML crawl; Python3 stdlib only, no JS hydration or API mutations.

python3 scripts/seo/recovery-audit.py --base http://127.0.0.1:3420 \
  --inventory /tmp/hmc-seo-recovery/source-inventory.json --out /tmp/hmc-seo-recovery/before
Add --strict for the final regression gate. Never submits indexing or booking requests.
"""
import argparse
import concurrent.futures
import csv
import datetime
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CANONICAL = 'https://www.hellomycabs.com'
PRIVATE = re.compile(r'^/(?:api|booking|bookings|login|rate|driver|r|c)(?:/|$)')
UNKNOWN = ['/seo-audit-nonexistent-20261018', '/jaipur-to-nonexistent-audit-cab']
UA = 'HelloMyCabs-SEO-Audit/1.0'


def clean(text):
    return re.sub(r'\s+', ' ', html.unescape(text)).strip()


class SourceHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.blocks = []
        self.title = []
        self.headings = {'h1': [], 'h2': []}
        self.paragraphs = []
        self.links = []
        self.meta = []
        self.canonicals = []
        self.schema = []
        self.schema_errors = []
        self.ids = set()
        self.json_text = None
        self.visible = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'meta':
            self.meta.append(attrs)
        if tag == 'link' and 'canonical' in attrs.get('rel', '').lower().split():
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'script' and attrs.get('type', '').lower() == 'application/ld+json':
            self.json_text = []
        if tag in ['title', 'h1', 'h2', 'p', 'a']:
            self.blocks.append({'tag': tag, 'attrs': attrs, 'text': [],
                                'contextual': not any(t in self.stack for t in ['header', 'footer', 'nav'])})
        if tag not in ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == 'script' and self.json_text is not None:
            try:
                self.schema.append(json.loads(''.join(self.json_text)))
            except ValueError as error:
                self.schema_errors.append(str(error))
            self.json_text = None
        for i in range(len(self.blocks) - 1, -1, -1):
            block = self.blocks[i]
            if block['tag'] != tag:
                continue
            del self.blocks[i]
            text = clean(''.join(block['text']))
            if tag == 'title':
                self.title.append(text)
            elif tag in self.headings:
                self.headings[tag].append(text)
            elif tag == 'p' and block['contextual'] and len(text) >= 30:
                self.paragraphs.append(text)
            elif tag == 'a':
                self.links.append({'href': block['attrs'].get('href', ''), 'text': text,
                                   'rel': block['attrs'].get('rel', ''), 'contextual': block['contextual']})
            break
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]

    def handle_data(self, data):
        if self.json_text is not None:
            self.json_text.append(data)
        if any(t in self.stack for t in ['script', 'style', 'template']):
            return
        self.visible.append(data)
        for block in self.blocks:
            block['text'].append(data)


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,application/xml,text/plain;q=0.9'})
    try:
        response = urllib.request.urlopen(request, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read(4 * 1024 * 1024 + 1)
        if len(body) > 4 * 1024 * 1024:
            raise ValueError('Response exceeds4MiB audit limit')
        return response.status, dict(response.headers), body.decode('utf-8', 'replace'), response.url


def local_path(href):
    url = urllib.parse.urlsplit(urllib.parse.urljoin(CANONICAL + '/', href))
    if url.scheme not in ['http', 'https'] or url.netloc != 'www.hellomycabs.com':
        return None
    path = url.path or '/'
    if PRIVATE.match(path) or re.search(r'\.[a-z0-9]{2,5}$', path):
        return None
    return path


def schema_nodes(value):
    if isinstance(value, list):
        for item in value:
            yield from schema_nodes(item)
    elif isinstance(value, dict):
        yield value
        for item in value.values():
            if isinstance(item, (dict, list)):
                yield from schema_nodes(item)


def normalized(text):
    # Diagnostic only. City/number normalization measures template reuse, not quality.
    text = text.lower()
    text = re.sub(r'\b(?:jaipur|delhi|agra|ajmer|kota|noida|sikar|chandigarh|haridwar|airport|innova|crysta|dzire|hatchback)\b', 'ENTITY', text)
    return clean(re.sub(r'[₹\d,.]+', 'NUMBER', text))


def shingles(paragraphs):
    words = normalized(' '.join(paragraphs)).split()
    return {' '.join(words[i:i+5]) for i in range(max(0, len(words)-4))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--inventory', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--strict', action='store_true')
    args = parser.parse_args()
    base = args.base.rstrip('/')
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    expected = json.loads(Path(args.inventory).read_text())['pages']
    expected_map = {r['path']: r for r in expected}
    failures = []
    status, _, xml, _ = fetch(base + '/sitemap.xml')
    root = ET.fromstring(xml)
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [entry.findtext('s:loc', namespaces=ns) for entry in root.findall('s:url', ns)]
    if status != 200 or not urls or len(urls) != len(set(urls)):
        failures.append('Sitemap status/empty/duplicates')
    sitemap = set()
    for url in urls:
        if not url or not url.startswith(CANONICAL + '/') and url != CANONICAL:
            failures.append('Sitemap wrong hostname: ' + str(url))
            continue
        sitemap.add(urllib.parse.urlsplit(url).path or '/')
    intended = {r['path'] for r in expected if r['index']}
    if sitemap != intended:
        failures.append('Sitemap/source inventory mismatch')
    status, _, robots, _ = fetch(base + '/robots.txt')
    if status != 200 or 'Disallow: /\n' in robots or CANONICAL + '/sitemap.xml' not in robots:
        failures.append('Production robots directives')

    def page(path):
        status, headers, body, effective = fetch(base + path)
        doc = SourceHTML()
        doc.feed(body)
        robots = ','.join(m.get('content', '') for m in doc.meta if m.get('name', '').lower() in ['robots', 'googlebot'])
        description = [m.get('content', '') for m in doc.meta if m.get('name', '').lower() == 'description']
        return {'path': path, 'type': expected_map.get(path, {}).get('type', 'linked'), 'status': status,
                'contentType': headers.get('Content-Type', headers.get('content-type', '')),
                'xRobotsTag': headers.get('X-Robots-Tag', headers.get('x-robots-tag', '')),
                'effectivePath': urllib.parse.urlsplit(effective).path or '/',
                'title': doc.title, 'description': description, 'h1': doc.headings['h1'], 'h2': doc.headings['h2'],
                'canonicals': doc.canonicals, 'robots': robots, 'bytes': len(body.encode()),
                'sha256': hashlib.sha256(body.encode()).hexdigest(), 'links': doc.links, 'paragraphs': doc.paragraphs,
                'visibleText': clean(' '.join(doc.visible)),
                'inlineStyleBytes': sum(len(s.encode()) for s in re.findall(r'<style\b[^>]*>([\s\S]*?)</style>', body, re.I)),
                'scriptBytes': sum(len(s.encode()) for s in re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', body, re.I)),
                'schema': doc.schema, 'schemaErrors': doc.schema_errors, 'ids': sorted(doc.ids)}

    paths = sorted(set(expected_map) | sitemap | set(UNKNOWN))
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        pages = list(pool.map(page, paths))
    # Crawl public linked destinations too, bounded; never follow private/customer routes.
    seen = {p['path'] for p in pages}
    for _ in range(3):
        next_paths = sorted({p for row in pages for link in row['links'] if (p := local_path(link['href'])) and p not in seen})
        if not next_paths:
            break
        if len(seen) + len(next_paths) > 240:
            raise ValueError('Public crawl exceeds240-URL audit bound')
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            pages.extend(pool.map(page, next_paths))
        seen.update(next_paths)
    by_path = {p['path']: p for p in pages}
    incoming = {p: set() for p in by_path}
    contextual = {p: set() for p in by_path}
    broken = []
    fragment_issues = []
    schema_findings = []
    for row in pages:
        for link in row['links']:
            target = local_path(link['href'])
            if not target or 'nofollow' in link['rel'].lower().split():
                continue
            if target in by_path and target != row['path']:
                incoming[target].add(row['path'])
                if link['contextual']:
                    contextual[target].add(row['path'])
            if target in by_path and by_path[target]['status'] >= 400:
                broken.append({'from': row['path'], 'to': target})
            fragment = urllib.parse.unquote(urllib.parse.urlsplit(link['href']).fragment)
            if fragment and target in by_path and fragment not in by_path[target]['ids']:
                fragment_issues.append({'from': row['path'], 'to': target + '#' + fragment})
    reachable = {'/'}
    for _ in range(len(by_path)):
        added = {target for p in reachable if p in by_path for link in by_path[p]['links']
                 if (target := local_path(link['href'])) in by_path and 'nofollow' not in link['rel'].lower().split()}
        if added <= reachable:
            break
        reachable |= added
    for row in pages:
        p = row['path']
        row['incoming'] = sorted(incoming[p])
        row['contextualIncoming'] = sorted(contextual[p])
        if p in UNKNOWN:
            if row['status'] != 404 or 'noindex' not in row['robots']:
                failures.append('Missing true404/noindex: ' + p)
            continue
        if p not in intended:
            continue
        if row['status'] != 200 or 'text/html' not in row['contentType']:
            failures.append('Public HTML status/type: ' + p)
        if row['effectivePath'] != p:
            failures.append('Redirecting canonical URL: ' + p)
        if len(row['title']) != 1 or not row['title'][0] or len(row['h1']) != 1 or not row['description']:
            failures.append('Missing/duplicate title/H1/description: ' + p)
        if row['canonicals'] != [CANONICAL + ('' if p == '/' else p)]:
            failures.append('Canonical mismatch: ' + p)
        if re.search(r'noindex|nofollow', row['robots'] + ',' + row['xRobotsTag'], re.I):
            failures.append('Unintended robot directive: ' + p)
        if row['schemaErrors']:
            failures.append('Invalid JSON-LD: ' + p)
        nodes = [node for data in row['schema'] for node in schema_nodes(data)]
        ids = [n['@id'] for n in nodes if '@id' in n and len(n) > 1]
        if len(ids) != len(set(ids)):
            schema_findings.append({'path': p, 'issue': 'Duplicate defined schema @id'})
        for node in nodes:
            if node.get('@type') in ['TaxiService', 'Organization', 'LocalBusiness'] and 'aggregateRating' in node:
                schema_findings.append({'path': p, 'issue': 'Self-serving local business rating'})
            if node.get('availability') == 'https://schema.org/InStock':
                schema_findings.append({'path': p, 'issue': 'Stock assertion without inventory source'})
            if node.get('@type') == 'WebPage' and 'dateModified' in node and row['type'] in ['one-way', 'airport', 'city', 'round-trip', 'route-car']:
                schema_findings.append({'path': p, 'issue': 'Render date used as content revision'})
            if node.get('@type') == 'BreadcrumbList':
                items = node.get('itemListElement', [])
                if [item.get('position') for item in items] != list(range(1, len(items)+1)):
                    schema_findings.append({'path': p, 'issue': 'Invalid breadcrumb positions'})
                linked = {local_path(link['href']) for link in row['links']}
                for item in items[:-1]:
                    if local_path(item.get('item', '')) not in linked:
                        schema_findings.append({'path': p, 'issue': 'Breadcrumb not represented in page navigation'})
            if node.get('@type') == 'FAQPage':
                compact = lambda text: re.sub(r'\s+', '', clean(re.sub(r'<[^>]+>', ' ', text)))
                visible = compact(row['visibleText'])
                for question in node.get('mainEntity', []):
                    if not compact(question.get('name', '')) or compact(question.get('name', '')) not in visible:
                        schema_findings.append({'path': p, 'issue': 'FAQ question absent from source HTML'})
                    answer = compact(question.get('acceptedAnswer', {}).get('text', ''))
                    if not answer or answer not in visible:
                        schema_findings.append({'path': p, 'issue': 'FAQ answer absent from source HTML'})
        if p != '/' and (not incoming[p] or p not in reachable):
            failures.append('Orphan/unreachable: ' + p)
    if broken:
        failures.append('Broken public internal links')
    if fragment_issues:
        failures.append('Broken internal fragments')
    if schema_findings:
        failures.append('Structured data integrity findings')
    pairs = []
    targets = [p for p in pages if p['path'] in intended and p['type'] in ['one-way', 'airport', 'city', 'vehicle', 'round-trip', 'route-car']]
    sets = {p['path']: shingles(p['paragraphs']) for p in targets}
    for i, a in enumerate(targets):
        for b in targets[i+1:]:
            sa, sb = sets[a['path']], sets[b['path']]
            score = len(sa & sb) / len(sa | sb) if sa | sb else 0
            if score >= 0.5:
                pairs.append({'a': a['path'], 'b': b['path'], 'normalizedParagraphJaccard': round(score, 4)})
    report = {'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'base': base,
              'method': 'Raw HTTP source HTML parsed without hydration; source inventory from captured public API data and repository helpers; no customer/API writes',
              'sitemapCount': len(urls), 'expectedIndexable': len(intended), 'sitemapMissing': sorted(intended-sitemap),
              'sitemapUnexpected': sorted(sitemap-intended), 'crawledPages': len(pages),
              'orphans': sorted(p for p in intended if p != '/' and not incoming.get(p)),
              'unreachableFromHome': sorted(intended - reachable), 'brokenLinks': broken,
              'fragmentIssues': fragment_issues, 'schemaFindings': schema_findings, 'similarityPairs': sorted(pairs, key=lambda x: -x['normalizedParagraphJaccard']),
              'failures': failures, 'pages': pages}
    (out/'audit.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
    with (out/'route-content.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['URL', 'Page Type', 'Similarity Risk', 'Incoming Links', 'Content Issues', 'Action', 'Implementation Status', 'Needs Owner Review'])
        for row in sorted(pages, key=lambda p: p['path']):
            if row['path'] not in intended:
                continue
            similar = [p for p in pairs if row['path'] in [p['a'], p['b']]]
            high = any(p['normalizedParagraphJaccard'] >= .8 for p in similar)
            risk = 'High template similarity' if high else 'Review shared paragraphs' if similar else 'No high similarity by this diagnostic'
            writer.writerow([CANONICAL + ('' if row['path']=='/' else row['path']), row['type'], risk, len(incoming[row['path']]),
                             'Normalized similarity is diagnostic, not proof of low quality' if similar else '',
                             'Potential duplicate requiring human decision' if high else 'Keep and improve' if similar else 'Distinct page, already acceptable',
                             'Audited; no merge/redirect/noindex', 'Yes: verify business facts' if high else 'No automatic content publication'])
    print(json.dumps({k: report[k] for k in ['sitemapCount', 'expectedIndexable', 'crawledPages', 'orphans', 'unreachableFromHome', 'brokenLinks', 'failures']}, indent=2))
    if args.strict and failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
