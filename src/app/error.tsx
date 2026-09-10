'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Button } from '@/components/ui/Button';
import { company } from '@/lib/company';

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

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-gutter pb-section-sm pt-12">
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
            Home
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
