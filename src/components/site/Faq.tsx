/**
 * An accordion, not a wall of open text.
 *
 * Twelve paragraphs on screen at once is a page nobody reads. <details> does this with no
 * JavaScript at all, which also means the answers are in the HTML for a crawler to index —
 * a scripted accordion would hide them from both.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-14 border-t border-line">
      {items.map(({ q, a }) => (
        <details key={q} className="group border-b border-line py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-title text-balance">
              {q}
            </span>
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-colors group-open:border-forest group-open:bg-forest group-open:text-white">
              <span className="absolute h-[1.5px] w-3 bg-current" />
              <span className="absolute h-3 w-[1.5px] bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className="max-w-2xl text-body pb-6 text-muted text-pretty">{a}</p>
        </details>
      ))}
    </div>
  );
}
