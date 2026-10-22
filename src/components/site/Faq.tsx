/**
 * An accordion, not a wall of open text.
 *
 * Twelve paragraphs on screen at once is a page nobody reads. <details> does this with no
 * JavaScript at all, which also means the answers are in the HTML for a crawler to index —
 * a scripted accordion would hide them from both.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-14 border-t border-hmc-line">
      {items.map(({ q, a }) => (
        <details key={q} className="faq-item group border-b border-hmc-line py-2">
          <summary className="flex cursor-pointer list-none rounded-xl transition-colors hover:text-hmc-link items-center justify-between gap-4 py-3.5 sm:gap-6 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-title text-balance">
              {q}
            </span>
            {/* Drawn at 32px, hit at 44: the ring is the size the design wants and the
                span around it is the size a thumb needs. */}
            <span className="grid size-11 shrink-0 place-items-center">
              <span className="relative grid size-8 place-items-center rounded-full border border-hmc-line transition-colors group-open:border-hmc-control group-open:bg-hmc-band group-open:text-white">
                <span className="absolute h-[1.5px] w-3 bg-current" />
                <span className="absolute h-3 w-[1.5px] bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
              </span>
            </span>
          </summary>
          <p className="max-w-2xl text-body pb-6 text-hmc-secondary text-pretty">{a}</p>
        </details>
      ))}
    </div>
  );
}
