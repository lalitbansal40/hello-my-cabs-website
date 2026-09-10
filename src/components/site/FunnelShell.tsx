import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { Icon } from './Icons';
import { Stepper } from '../ui/Stepper';
import { company } from '@/lib/company';

/**
 * The shell around every step of the booking funnel — including its dead ends.
 *
 * The funnel used to be three bare pages: a heading, some text, and nothing else. Somebody
 * walked from a 400-line home page into a 34-line one at the exact moment they were being
 * asked to pay. That is where trust goes, and it went silently, because a page with no
 * header also has no phone number on it — a visitor who got stuck had no way to ask.
 *
 * These pages stay noindex. This is a design fix, not a search one.
 */
export function FunnelShell({
  step,
  title,
  subtitle,
  children,
}: {
  /** Omitted on error states, where showing progress through a broken flow is a lie. */
  step?: number;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {/* The masthead is dark, so it needs dark beneath it — and the trip summary is the
          one thing worth repeating at every step. */}
      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-9 sm:pb-12 sm:pt-10">
          {step !== undefined ? (
            <div className="mb-8">
              <Stepper current={step} tone="dark" />
            </div>
          ) : null}
          <h1 className="font-display text-h1 text-balance">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-lead text-white/70 text-pretty">{subtitle}</p>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:pt-12">{children}</main>

      <TrustBar />
      <Footer />
    </>
  );
}

/**
 * The four things a person wants confirmed between choosing a vehicle and handing over
 * money. They are all true and all checkable elsewhere on the site, which is the only
 * reason they are worth printing.
 */
function TrustBar() {
  const points: [React.ReactNode, string, string?][] = [
    [<Icon.tag key="a" className="h-4 w-4" />, 'Fare fixed when you book'],
    [<Icon.car key="b" className="h-4 w-4" />, 'Driver and fuel included'],
    [<Icon.check key="c" className="h-4 w-4" />, 'Pay cash at the end, if you prefer'],
    [<Icon.shield key="d" className="h-4 w-4" />, 'Free to cancel a cash booking', '/refund'],
  ];

  return (
    <section className="border-y border-line bg-surface-alt">
      <div className="mx-auto max-w-3xl px-5 py-7">
        <ul className="grid text-small gap-x-8 gap-y-4 text-ink-soft sm:grid-cols-2">
          {points.map(([icon, label, href]) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="text-accent">{icon}</span>
              {href ? (
                <Link href={href} className="-my-3 inline-block py-3 underline-offset-4 hover:underline">
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-small border-t border-line pt-5 text-muted max-w-measure">
          Stuck on any of this? Call{' '}
          <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
            {company.phone}
          </a>{' '}
          — {company.hours.toLowerCase()}.
        </p>
      </div>
    </section>
  );
}
