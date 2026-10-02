import type { Metadata } from 'next';
import Link from 'next/link';
import { api, type Vehicle } from '@/lib/api';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { SupportCard } from '@/components/site/SupportCard';
import { Icon } from '@/components/site/Icons';
import { VehicleArt } from '@/components/site/VehicleArt';
import { company } from '@/lib/company';
import { vehiclePath } from '@/lib/slug';
import { vehicleNote } from '@/content/vehicles';

export const metadata: Metadata = {
  // ≤ 45 characters: the layout adds " | Hello My Cab", and 60 is where a search result cuts.
  title: 'Luxury Car Hire with Driver — Innova Crysta',
  description:
    'Premium cars with a driver for outstation trips: the Innova Crysta for families, the Force Urbania for groups. Fixed fares and verified drivers.',
  alternates: { canonical: '/luxury-car' },
};

export const revalidate = 86_400;

/**
 * Which of the fleet counts as premium. The backend has no such list, so it is here — and
 * only keys the live catalogue actually has are shown: a key it stops listing simply drops
 * off this page rather than leaving a card for a car we no longer run.
 */
const LUXURY_KEYS = ['crysta', 'urbania'];

export default async function LuxuryPage() {
  const fleet = await api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] }));
  const cars = LUXURY_KEYS.map((k) =>
    [...fleet.intercity, ...fleet.roundTripOnly].find((v) => v.key === k),
  ).filter((v): v is Vehicle => !!v);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-small text-muted">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Luxury cars</span>
        </nav>

        {/* The logo's black with a hairline of gold — on black, the gold is what says
            "premium". */}
        <section className="relative overflow-hidden rounded-3xl bg-ink-band p-7 text-white ring-1 ring-inset ring-gold/60 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-white/10 text-[#ffd27a]">
            <Icon.diamond className="h-7 w-7" />
          </span>
          <h1 className="font-display mt-5 text-h1">Luxury cars, with a driver</h1>
          <p className="mt-3 max-w-xl text-lead text-white/85">
            More room, a smoother ride and a driver who has done the road before — at a fare
            fixed before you leave.
          </p>
        </section>

        {cars.length === 0 ? (
          <p className="mt-10 text-muted">
            The fleet is loading. Please try again shortly, or call {company.phone}.
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {cars.map((v) => {
              const roundOnly = !v.tripTypes.includes('one_way');
              const note = vehicleNote(v.key);
              return (
                <li
                  key={v.key}
                  className="row-lift flex flex-col rounded-3xl border border-line bg-surface-raised p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-title-lg">{v.label}</h2>
                      <p className="mt-1 text-small font-semibold text-muted">
                        {v.seats ? `${v.seats} seats · ` : ''}
                        {roundOnly ? 'Round trips' : 'One way · round trip · local'}
                      </p>
                    </div>

                  </div>
                  <VehicleArt vehicleKey={v.key} label={v.label} className="mt-5 h-auto w-full max-w-[18rem]" />
                  {note ? <p className="mt-4 text-body text-ink-soft">{note.about}</p> : null}
                  <p className="mt-4 font-display text-title">
                    {v.perKm ? (
                      <>
                        ₹{v.perKm}
                        <span className="text-small font-medium text-muted"> / km</span>
                        {v.hillPerKm ? (
                          <span className="ml-2 text-small font-medium text-muted">
                            (hills ₹{v.hillPerKm}/km)
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-body font-semibold text-muted">
                        Fare fixed for your route — see it in the booking card
                      </span>
                    )}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/?trip=${roundOnly ? 'round_trip' : 'one_way'}#book`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 ticket-stub rounded-xl bg-accent pl-6 pr-5 text-small font-bold text-white transition-colors hover:bg-accent-dark"
                    >
                      Book
                      <Icon.arrow className="h-4 w-4" />
                    </Link>
                    <a
                      href={company.phoneHref}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line px-5 text-small font-bold text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon.phone className="h-4 w-4" />
                      Call
                    </a>
                  </div>
                  <Link
                    href={vehiclePath(v.key)}
                    className="mt-3 inline-flex min-h-11 items-center text-small font-semibold text-accent hover:underline"
                  >
                    More about the {v.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-12 max-w-xl">
          <SupportCard />
        </div>
      </main>
      <WhatsAppFab />
      <Footer />
    </>
  );
}
