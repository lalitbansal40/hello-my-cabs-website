import { company } from '@/lib/company';
import { Icon } from './Icons';

/**
 * "Your travel expert" — the phone number, made into the thing on the page that a nervous
 * first-time customer looks for before anything else: a person to ask.
 *
 * A headset, not a face: a photograph or a cartoon of an "expert" would be somebody who
 * does not work here. The number is company.ts's, so it changes in one place. Taps on it
 * are counted by CallTracker, which listens for every tel: link to our number.
 */
export function SupportCard({ className = '' }: { className?: string }) {
  return (
    <section
      aria-label="Talk to a travel expert"
      className={`flex min-h-[11rem] flex-col justify-between gap-4 rounded-3xl border border-accent/20 bg-surface-alt p-5 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-white shadow-[var(--shadow-soft)]">
          <Icon.headset className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-label font-bold uppercase text-muted">Say hello to</p>
          <h2 className="font-display text-title uppercase leading-tight">Your travel expert</h2>
          <p className="mt-1 text-small text-ink-soft">
            Route, fare or the right car for the family — ask a person, any hour.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={company.phoneHref}
          className="inline-flex min-h-11 items-center gap-2.5 rounded-2xl bg-surface-raised px-4 py-2 shadow-[var(--shadow-soft)] transition-colors hover:bg-white"
        >
          <Icon.phone className="h-5 w-5 text-accent" />
          <span className="leading-tight">
            <span className="block text-label font-bold uppercase tracking-normal text-muted">
              Call expert · 24×7
            </span>
            <span className="block text-body font-black tabular-nums text-accent">
              {company.phone}
            </span>
          </span>
        </a>
        {company.whatsapp ? (
          <a
            href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hi, I want to book a cab.')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with a travel expert on WhatsApp"
            className="grid size-11 place-items-center rounded-full bg-[#1c7c43] text-white transition-opacity hover:opacity-90"
          >
            <Icon.whatsapp className="h-6 w-6" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
