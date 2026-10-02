import { company } from '@/lib/company';
import { Icon } from './Icons';

/**
 * The desk, as a chat — the phone number made into what a nervous first-time customer looks
 * for before anything else: somebody to ask.
 *
 * A speech bubble, not a face: a photograph or cartoon of an "expert" would be somebody who
 * does not work here. (It replaced a "Say hello to your travel expert" card that was a
 * competitor's, word for word.) The green dot is true — the desk answers around the clock.
 * The number is company.ts's; taps on it are counted by CallTracker, which listens for every
 * tel: link to our number.
 */
export function SupportCard({ className = '' }: { className?: string }) {
  return (
    <section aria-label="Talk to our desk" className={`flex flex-col gap-3 ${className}`}>
      {/* The bubble, with its tail at the bottom left. */}
      <div className="relative rounded-3xl rounded-bl-md bg-ink px-5 py-4 text-white">
        <p className="text-body font-semibold leading-snug">
          Hi! Ask us anything — the route, the fare, or which car fits the family.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
        <span className="flex items-center gap-2 text-small text-muted">
          <span aria-hidden className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success" />
          </span>
          Hello My Cab desk · 24×7
        </span>
        <span className="ml-auto flex gap-2">
          <a
            href={company.phoneHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-small font-bold text-white transition-colors hover:bg-accent-dark"
          >
            <Icon.phone className="h-4 w-4" />
            {company.phone}
          </a>
          {company.whatsapp ? (
            <a
              href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hi, I want to book a cab.')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with our desk on WhatsApp"
              className="grid size-11 place-items-center rounded-full bg-[#1c7c43] text-white transition-opacity hover:opacity-90"
            >
              <Icon.whatsapp className="h-5 w-5" />
            </a>
          ) : null}
        </span>
      </div>
    </section>
  );
}
