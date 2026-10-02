'use client';

import { useEffect, useState } from 'react';

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/**
 * "On this page" — a jump to each section of a long landing page.
 *
 * A route page runs to eight sections (fares, pickup, arrival, context, which cab…) and
 * somebody who came for one of them scrolled past the rest to find it. The list is read
 * from the page's own h2s once it is on screen, so it can never name a section that is
 * not there; each heading gets an id to jump to. The row keeps its height while empty, so
 * the page does not shift when it fills in.
 */
export function OnThisPage({ scope = 'main' }: { scope?: string }) {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const seen = new Set<string>();
    const out: { id: string; text: string }[] = [];
    for (const h of document.querySelectorAll<HTMLHeadingElement>(`${scope} h2`)) {
      const text = (h.textContent ?? '').trim();
      if (!text) continue;
      let id = h.id || slug(text);
      while (seen.has(id)) id = `${id}-x`;
      seen.add(id);
      h.id = id;
      out.push({ id, text });
    }
    // On the next frame, like every other first read on this site: no state is set while
    // React is still committing this render.
    const frame = requestAnimationFrame(() => setItems(out));
    return () => cancelAnimationFrame(frame);
  }, [scope]);

  return (
    <nav aria-label="On this page" className="min-h-11">
      {items.length > 1 ? (
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <li className="flex shrink-0 items-center pr-1 text-label font-bold uppercase text-faint">
            On this page
          </li>
          {items.map((it) => (
            <li key={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-raised px-4 text-small font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
