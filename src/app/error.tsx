'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Button } from '@/components/ui/Button';
import { company } from '@/lib/company';
import { RoadLine } from '@/components/site/RoadLine';
import { VehicleArt } from '@/components/site/VehicleArt';

/**
 * The last resort, dressed as the rest of the site.
 *
 * A funnel that dies on an unexpected error takes the booking with it, so there is always
 * a way back, and it says outright that nothing has been booked — the one thing a person
 * needs to know at that moment.
 *
 * This is a client component, so the footer (which reads the route list on the server)
 * cannot be used here; a short static footer stands in for it.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <>
      <Header />

      <section className="hero-ground grain relative isolate overflow-hidden text-white">
        {/* The road runs under the words, not through them, and the car is on it. */}
        <RoadLine className="top-1/2" />
        <div className="relative mx-auto max-w-3xl px-gutter pb-28 pt-12 sm:pb-32">
          <VehicleArt
            vehicleKey="sedan"
            label=""
            tone="dark"
            className="pointer-events-none absolute bottom-6 right-gutter w-32 sm:w-44"
          />
          <h1 className="font-display text-h1 text-balance">Something went wrong</h1>
          <p className="mt-5 max-w-measure text-lead text-pretty text-white/75">
            Please try again in a moment — your booking has not been made.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-gutter py-section-sm">
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="ghost" onClick={() => router.push('/')}>
            Go home
          </Button>
        </div>
        <p className="mt-8 text-body text-muted">
          Or call{' '}
          <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
            {company.phone}
          </a>{' '}
          and we will book it with you.
        </p>
      </main>

      <footer className="hero-ground grain border-t border-white/10 text-white">
        <div className="mx-auto flex max-w-6xl 2xl:max-w-7xl flex-wrap items-center justify-between gap-4 px-gutter py-8 text-small text-white/55">
          <span>© {new Date().getFullYear()} Hello My Cab</span>
          <span className="flex flex-wrap gap-x-6">
            <Link className="inline-flex min-h-11 items-center hover:text-white" href="/routes">
              Routes
            </Link>
            <a className="inline-flex min-h-11 items-center hover:text-white" href={company.phoneHref}>
              {company.phone}
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
