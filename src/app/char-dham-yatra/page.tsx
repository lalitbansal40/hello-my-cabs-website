import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { CharDhamBanner } from '@/components/site/CharDhamBanner';
import { IMAGES } from '@/lib/images';
import { SupportCard } from '@/components/site/SupportCard';
import { Faq } from '@/components/site/Faq';
import { Icon } from '@/components/site/Icons';
import { company } from '@/lib/company';
import { CHARDHAM_IS_SAMPLE, DHAM_PACKAGES, type DhamPackage } from '@/content/chardham';

export const metadata: Metadata = {
  // ≤ 45 characters: the layout adds " | Hello My Cab", and 60 is where a search result cuts.
  title: 'Char Dham Yatra by Cab from Haridwar',
  description:
    'Char Dham, Do Dham and Ek Dham yatra by cab from Haridwar — Yamunotri, Gangotri, Kedarnath and Badrinath, with a driver who knows the hill roads.',
  alternates: { canonical: '/char-dham-yatra' },
  // The packages are sample data until the owner sends the real ones (content/chardham):
  // a made-up price must not be what a search shows. The flag opens it up.
  robots: { index: !CHARDHAM_IS_SAMPLE, follow: true },
};

/** General answers only — nothing here promises a date, a permit or a price. */
const FAQ = [
  {
    q: 'When is the yatra season?',
    a: 'The temples open around late April or May and close for winter around October or November; the exact dates are announced each year. Monsoon weeks (July–August) bring landslides on the hill roads, so plan with a day in hand.',
  },
  {
    q: 'Do I need to register for the yatra?',
    a: 'Yes — the Uttarakhand government asks every pilgrim to register before travelling. Do it before you leave; the driver will need to see it at the check posts.',
  },
  {
    q: 'What does the fare cover?',
    a: 'The car, the driver, his allowance and fuel, with 5% GST added on top. Tolls, parking and state entry taxes are paid as they come and appear on the bill.',
  },
  {
    q: 'Can elders and children do this trip?',
    a: 'Badrinath is road all the way to the temple. Kedarnath and Yamunotri end in a trek, with ponies, palkis and helicopter services available at the foot — tell us when you book and we will plan the halts around it.',
  },
  {
    q: 'Can we start from Delhi or another city?',
    a: 'Yes. The packages start in Haridwar because most pilgrims do; call us and we will price the trip from your city.',
  },
];

const enquiry = (p: DhamPackage) =>
  company.whatsapp
    ? `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(`Char Dham enquiry — ${p.name} (${p.days} days)`)}`
    : null;

export default function CharDhamPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pb-section-sm pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-small text-muted [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Char Dham Yatra</span>
        </nav>

        <CharDhamBanner variant="hero" heading="h1" showButton={false} photo={IMAGES.chardham} />

        <section className="mt-12">
          <p className="text-label font-bold uppercase text-accent">Packages</p>
          <h2 className="font-display mt-3 text-h2">Choose your yatra</h2>
          <p className="mt-3 max-w-2xl text-body text-muted">
            Every package is a car with a driver for the whole run, starting in{' '}
            {DHAM_PACKAGES[0].startsFrom}. Prices are from — the final figure depends on the car
            and the dates.
          </p>

          {/* Until the owner sends the real packages (content/chardham), the prices below
              are samples — and the page says so where the prices are, not in a footnote. */}
          {CHARDHAM_IS_SAMPLE ? (
            <p className="mt-6 inline-flex items-start gap-2 rounded-2xl bg-sun/20 px-4 py-3 text-small font-semibold text-ink-soft">
              <Icon.tag className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              Prices are indicative — call us to confirm the dates and the final fare.
            </p>
          ) : null}

          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {DHAM_PACKAGES.map((p) => {
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
                        {p.days} days / {p.nights} nights · from {p.startsFrom}
                      </p>
                    </div>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-clay/10 text-clay">
                      <Icon.temple className="h-6 w-6" />
                    </span>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.dhams.map((d) => (
                      <li
                        key={d}
                        className="rounded-full bg-surface-alt px-3 py-1 text-small font-semibold text-ink-soft"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>

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

                  <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4">
                    {p.fromRupees.map((v) => (
                      <div key={v.vehicle} className="rounded-xl bg-surface px-3 py-2">
                        <dt className="text-label font-bold uppercase text-faint">{v.vehicle}</dt>
                        <dd className="font-display text-title">
                          ₹{v.rupees.toLocaleString('en-IN')}
                          <span className="ml-1 text-small font-medium text-muted">from</span>
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

        {/* What the fare covers — the same rule as every trip on the site (landing/Included). */}
        <section className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-surface-raised p-6">
            <h2 className="text-label font-bold uppercase text-faint">In the fare</h2>
            <ul className="mt-4 space-y-2.5">
              {['The car and the driver, for the whole run', 'Driver allowance', 'Fuel'].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2.5 text-body text-ink/85">
                    <Icon.check className="mt-1 h-4 w-4 shrink-0 text-success" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-surface-raised p-6">
            <h2 className="text-label font-bold uppercase text-faint">Paid separately</h2>
            <ul className="mt-4 space-y-2.5">
              {['GST, 5% on top of the fare', 'Toll and parking, as they arise', 'State entry tax', 'Night allowance after 10 pm', 'Your stay, meals and trek services'].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2.5 text-body text-ink/85">
                    <Icon.tag className="mt-1 h-4 w-4 shrink-0 text-clay" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
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
