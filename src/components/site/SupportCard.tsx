/**
 * The desk, as a chat — what a nervous first-time customer looks for before anything else:
 * somebody to ask.
 *
 * A speech bubble, not a face: a photograph or cartoon of an "expert" would be somebody who
 * does not work here. (It replaced a card that was a competitor's, word for word.) The
 * green dot is true — the desk answers around the clock.
 *
 * No number and no WhatsApp button here any more (owner's decision, 2 Oct 2026): the way
 * to reach the desk is the pair of round buttons at the bottom right of every page — Call
 * (which asks for a number and calls back) and WhatsApp — and the bubble says so.
 */
export function SupportCard({ className = '' }: { className?: string }) {
  return (
    <section aria-label="Talk to our desk" className={`flex flex-col gap-3 ${className}`}>
      {/* The bubble, with its tail at the bottom left. */}
      <div className="relative rounded-3xl rounded-bl-md bg-ink px-5 py-4 text-white">
        <p className="text-body font-semibold leading-snug">
          Hi! Ask us anything — the route, the fare, or which car fits the family.
        </p>
        <p className="mt-1.5 text-small text-white/75">
          Tap Call or WhatsApp at the bottom right of the screen.
        </p>
      </div>
      <p className="flex items-center gap-2 px-1 text-small text-muted">
        <span aria-hidden className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2.5 rounded-full bg-success" />
        </span>
        Hello My Cab desk · 24×7
      </p>
    </section>
  );
}
