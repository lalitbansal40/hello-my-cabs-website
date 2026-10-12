import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { RajasthanToursBanner } from '@/components/site/RajasthanToursBanner';
import { SupportCard } from '@/components/site/SupportCard';
import { Faq } from '@/components/site/Faq';
import { Icon } from '@/components/site/Icons';
import { BookingWidget } from '@/components/BookingWidget';
import { api } from '@/lib/api';
import { company } from '@/lib/company';
import {
  RAJASTHAN_IS_SAMPLE,
  TOUR_INCLUDED,
  TOUR_NOT_INCLUDED,
  TOUR_PACKAGES,
  type TourPackage,
} from '@/content/rajasthan';

export const metadata: Metadata = {
  // ≤ 45 characters: the layout adds " | Hello My Cab".
  title: 'Rajasthan Tour Packages by Car',
  description:
    'Rajasthan tours by car with a driver — Jaipur, Ajmer and Pushkar, Udaipur, Jodhpur, Jaisalmer, Ranthambore and Mount Abu. One car for the whole tour.',
  alternates: { canonical: '/rajasthan-tours' },
  // The packages are sample data until the owner sends the real ones (content/rajasthan):
  // a made-up price must not be what a search shows. The flag opens it up.
  robots: { index: !RAJASTHAN_IS_SAMPLE, follow: true },
};

/** General answers only — nothing here promises a date, a hotel or a price. */
const FAQ = [
  {
    q: 'Can I change a tour, or make my own?',
    a: 'Yes. These are the tours people ask for most; tell us the places and the days you have, and we will price the trip for your route.',
  },
  {
    q: 'Where does a tour start?',
    a: 'From your hotel, the railway station or the airport in the city the tour starts from. We can also start from Delhi or another city — call us for the price.',
  },
  {
    q: 'Are hotels and meals included?',
    a: 'No — the tour is the car, the driver and the fuel. You choose and pay for your own hotels and meals; the driver’s stay and allowance are ours.',
  },
  {
    q: 'Is the price fixed?',
    a: 'The fare is fixed for the days and the route you book, with 5% GST added on top. Toll, parking, state tax and entry tickets are paid as they arise.',
  },
  {
    q: 'Which car should we take?',
    a: 'A Dzire for two or three people with luggage, an Ertiga for up to six, an Innova Crysta for six in more comfort. For a bigger group, call us for a Tempo Traveller.',
  },
];

const enquiry = (p: TourPackage) =>
  company.whatsapp
    ? `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(`Rajasthan tour — ${p.name} (${p.days} days)`)}`
    : null;

export default async function RajasthanToursPage() {
  // A round trip from Jaipur, ready in the booking card — the tours start there.
  const cities = await api.cities().catch(() => []);
  const jaipur = cities.find((c) => c.name === 'JAIPUR');

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-small text-muted [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Rajasthan Tours</span>
        </nav>

        <RajasthanToursBanner variant="hero" heading="h1" showButton={false} />

        <section className="mt-12">
          <p className="text-label font-bold uppercase text-accent">Packages</p>
          <h2 className="font-display mt-3 text-h2">Choose your tour</h2>
          <p className="mt-3 max-w-2xl text-body text-muted">
            Every tour is one car with one driver for all of its days. Prices are from — the final
            figure depends on the car and the dates.
          </p>

          {/* Until the owner sends the real packages (content/rajasthan), the prices below
              are samples — and the page says so where the prices are, not in a footnote. */}
          {RAJASTHAN_IS_SAMPLE ? (
            <p className="mt-6 inline-flex items-start gap-2 rounded-2xl bg-sun/20 px-4 py-3 text-small font-semibold text-ink-soft">
              <Icon.tag className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              Prices are indicative — call us to confirm the dates and the final fare.
            </p>
          ) : null}

          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {TOUR_PACKAGES.map((p) => {
              const wa = enquiry(p);
              return (
                <li
                  key={p.slug}
                  className="row-lift flex flex-col rounded-3xl border border-line bg-surface-raised p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-title-lg">{p.name}</h3>
                      <p className="mt-1 text-small font-semibold text-muted">
                        {p.days} days / {p.nights} {p.nights === 1 ? 'night' : 'nights'} · from{' '}
                        {p.startsFrom}
                      </p>
                    </div>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-clay/10 text-clay">
                      <Icon.route className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="mt-4 text-small text-muted">
                    <span className="font-semibold text-ink-soft">Route: </span>
                    {p.route.join(' → ')}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-small text-ink-soft">
                        <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* "From" said once above the three, not squeezed beside each price — three
                      columns on a 360px phone leave no room for it. */}
                  <p className="mt-5 border-t border-line pt-4 text-label font-bold uppercase text-faint">
                    From, by car
                  </p>
                  <dl className="mt-2 grid grid-cols-3 gap-2">
                    {p.fromRupees.map((v) => (
                      <div key={v.vehicle} className="min-w-0 rounded-xl bg-surface px-2.5 py-2 sm:px-3">
                        <dt className="text-label font-bold uppercase text-faint">{v.vehicle}</dt>
                        <dd className="font-display text-body tabular-nums sm:text-title">
                          ₹{v.rupees.toLocaleString('en-IN')}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={company.phoneHref}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap ticket-stub rounded-xl bg-accent pl-6 pr-5 text-small font-bold text-white transition-colors hover:bg-accent-dark"
                    >
                      <Icon.phone className="h-4 w-4" />
                      Call to book
                    </a>
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-5 text-small font-bold text-ink transition-colors hover:border-success hover:text-success"
                      >
                        <Icon.whatsapp className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* What a tour covers — the same rule as every trip on the site. */}
        <section className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-surface-raised p-6">
            <h2 className="text-label font-bold uppercase text-faint">In the package</h2>
            <ul className="mt-4 space-y-2.5">
              {TOUR_INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-body text-ink/85">
                  <Icon.check className="mt-1 h-4 w-4 shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-surface-raised p-6">
            <h2 className="text-label font-bold uppercase text-faint">Paid separately</h2>
            <ul className="mt-4 space-y-2.5">
              {TOUR_NOT_INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-body text-ink/85">
                  <Icon.tag className="mt-1 h-4 w-4 shrink-0 text-clay" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Or just a round trip, booked now: the card starts on it, from Jaipur. */}
        <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_minmax(360px,440px)] lg:items-center">
          <div>
            <p className="text-label font-bold uppercase text-accent">Your own route</p>
            <h2 className="font-display mt-3 text-h2">Or book a round trip now</h2>
            <p className="mt-3 max-w-xl text-body text-muted">
              Choose where you are going and when you leave. A round trip is priced for the day;
              keep the car longer and every day is billed at least 250 km.
            </p>
          </div>
          <BookingWidget defaultPickup={jaipur} defaultTripType="round_trip" />
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-label font-bold uppercase text-accent">Questions</p>
            <h2 className="font-display mt-3 text-h2">Before you go</h2>
            {/* No FAQ schema while the page is sample data — it is out of search anyway. */}
            <Faq items={FAQ} />
          </div>
          <SupportCard className="self-start" />
        </section>
      </main>
      <WhatsAppFab />
      <Footer />
    </>
  );
}
