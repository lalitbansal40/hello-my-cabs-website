import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { IMAGES, img } from '@/lib/images';
import { JsonLd, faqSchema, organizationSchema, websiteSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/site/Icons';
import { MarkDivider, RouteMark } from '@/components/site/Brand';
import { RouteList } from '@/components/site/RouteList';
import { FleetRail } from '@/components/site/FleetRail';
import { Faq } from '@/components/site/Faq';
import { CityMarquee } from '@/components/site/CityMarquee';
import { Counter } from '@/components/site/Counter';

export const metadata: Metadata = {
  title: 'Outstation cabs across India — one way, round trip, hourly',
  description:
    'Book a cab with a driver for intercity travel. The fare is fixed before you leave, there is no surge, and you pay the driver in cash.',
  alternates: { canonical: '/' },
};

export const revalidate = 86_400;

const FAQ = [
  {
    q: 'Is the fare fixed before I travel?',
    a: 'Yes. You see the full fare before you book and it does not change afterwards. Toll, parking and state taxes are paid as they arise and appear on your bill.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'At least two hours before pickup. For an early-morning departure, book the night before so the driver can plan the run.',
  },
  {
    q: 'How do I pay?',
    a: 'You pay the driver in cash at the end of the trip. There is nothing to pay when you book.',
  },
  {
    q: 'What is the difference between one way and round trip?',
    a: 'A one-way fare covers only the distance you travel. A round trip is priced per kilometre for the whole journey and works out better whenever you are coming back.',
  },
  {
    q: 'Can I book a larger vehicle?',
    a: 'Tempo Travellers and the Force Urbania run on round trips, where the return leg makes them worthwhile. Sedans, hatchbacks and the Innova Crysta are available on every trip type.',
  },
];

const title = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export default async function Home() {
  // Both fetched on the SERVER: the HTML a crawler receives already has the numbers in it.
  // A page that fills its prices in from the browser is a page with no prices to index.
  const [routes, vehicles, cities] = await Promise.all([
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.cities().catch(() => []),
  ]);

  const ticker = routes.routes.slice(0, 14);

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={faqSchema(FAQ)} />
      <Header />

      {/* ── Hero ───────────────────────────────────────────────────────────────
          Full height, with the photograph pushed well back and the display serif
          carrying the page. The booking card overlaps into the ivory below, which is
          what stops the page reading as a stack of separate bands. */}
      <section id="book" className="hero-ground grain vignette relative overflow-hidden text-white">
        <Image
          src={img(IMAGES.heroRoad, 1920, 60)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-[0.22]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b2c22]/45 via-[#0b2c22]/78 to-[#08211a]" />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pb-28 pt-16 lg:min-h-[86vh] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-44 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Serving 2,000+ cities
            </p>

            {/* The break is set by hand. Left to wrap, "price." stranded on a line of its
                own and the headline lost its shape at exactly the width most laptops use. */}
            <h1 className="font-display mt-9 text-[3.25rem] font-normal leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem]">
              Every road.
              <br />
              <em className="not-italic text-accent">One honest&nbsp;price.</em>
            </h1>

            <p className="mt-8 max-w-md text-[17.5px] leading-[1.65] text-white/75">
              Outstation cabs with a driver — one way, round trip, or by the hour. The fare
              is settled before you leave, and it costs nothing to find out what it is.
            </p>

            <dl className="stagger mt-12 grid max-w-xl grid-cols-2 gap-x-10 gap-y-8 border-t border-white/10 pt-9 sm:grid-cols-4">
              {[
                [<><Counter to={2000} />+</>, 'cities'],
                [<><Counter to={15} /> L+</>, 'routes'],
                [<Counter key="r" to={4.8} decimals={1} />, 'rating'],
                ['24×7', 'support'],
              ].map(([big, small], i) => (
                <div key={small as string} style={{ ['--i' as string]: i }}>
                  <dt className="font-display text-[2rem] leading-[1.05] tracking-tight">{big}</dt>
                  <dd className="mt-2 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">
                    {small as string}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:-mb-56">
            <BookingWidget />
          </div>
        </div>

        {/* A slow ticker of real routes — movement at the seam between two sections, and
            it happens to say something true about the size of the network. */}
        {ticker.length > 0 ? (
          <div className="relative overflow-hidden border-t border-white/10 py-4">
            <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
              {[...ticker, ...ticker].map((r, i) => (
                <span key={i} className="flex items-center gap-3 text-[13px] font-semibold text-white/45">
                  {title(r.pickup)}
                  <Icon.arrow className="h-3.5 w-3.5 text-accent/60" />
                  {title(r.drop)}
                  <span className="text-white/25">·</span>
                  <span className="text-white/70">₹{r.fromRupees?.toLocaleString('en-IN')}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <main>
        {/* ── Promise ───────────────────────────────────────────────────────────
            Three lines of type on the ivory, not three cards. The section that
            follows a busy hero should let the page breathe. */}
        <section className="mx-auto max-w-6xl px-5 pt-24 lg:pt-56">
          <div className="reveal grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                Why us
              </p>
              <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                The things that go wrong in a cab, don’t.
              </h2>
            </div>

            <ul className="flex flex-col">
              {[
                [<Icon.tag key="a" className="h-5 w-5" />, 'One price, agreed upfront', 'What you are quoted is what you pay. No surge, and no recalculation when you arrive.'],
                [<Icon.shield key="b" className="h-5 w-5" />, 'Drivers we know', 'Every driver is verified and rated. Poor ratings take them off the platform.'],
                [<Icon.headset key="c" className="h-5 w-5" />, 'Someone always answers', 'A real person on the phone, at any hour, for the length of the journey.'],
              ].map(([icon, head, body], i) => (
                <li
                  key={head as string}
                  className={
                    'group flex gap-6 py-7 ' + (i === 0 ? 'border-y border-line' : 'border-b border-line')
                  }
                >
                  <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors duration-300 group-hover:bg-accent group-hover:text-forest">
                    {icon}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em]">
                      {head as string}
                    </h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{body as string}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Routes — an editorial list, not a card grid ────────────────────── */}
        <section id="routes" className="mx-auto max-w-6xl px-5 pt-24">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                Popular
              </p>
              <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                Routes we know well
              </h2>
            </div>
            <p className="max-w-xs text-[15.5px] leading-relaxed text-muted">
              {routes.count} routes carry a listed fare — a real number, not an estimate that
              moves once you are in the car.
            </p>
          </div>

          {routes.routes.length === 0 ? (
            <p className="mt-12 text-muted">Fares are loading. Please try again shortly.</p>
          ) : (
            <div className="reveal">
              <RouteList routes={routes.routes.slice(0, 6)} />
              <Link
                href="/routes"
                className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-line px-7 py-3.5 text-[15px] font-bold transition-colors hover:border-forest hover:bg-surface-alt"
              >
                All {routes.count} routes
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </section>

        {/* ── Atmosphere ────────────────────────────────────────────────────────
            No place is named here, deliberately: the picture sets a mood, it does not
            make a claim about where it was taken. */}
        <section className="relative mt-28 overflow-hidden">
          <div className="relative h-[28rem] sm:h-[34rem]">
            <Image src={img(IMAGES.openRoad, 1920, 65)} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b2c22] via-[#0b2c22]/88 to-[#0b2c22]/15" />
            <div className="grain absolute inset-0" aria-hidden />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-5">
                <div className="reveal max-w-lg text-white">
                  <RouteMark className="h-8 w-8 text-accent" />
                  <h2 className="font-display mt-7 text-[2.25rem] leading-[1.06] tracking-[-0.03em] sm:text-[3rem]">
                    Long drives, without the haggling.
                  </h2>
                  <p className="mt-6 text-[17px] leading-relaxed text-white/65">
                    Six hundred kilometres or sixty — the fare is agreed before the engine
                    starts, and nobody renegotiates it at a dhaba at midnight.
                  </p>
                  <Link
                    href="/#book"
                    className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-forest transition-all hover:bg-accent"
                  >
                    Check your route
                    <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Fleet — a rail you push sideways ──────────────────────────────── */}
        <section id="fleet" className="mx-auto max-w-6xl px-5 pt-24">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Fleet</p>
              <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                Pick what suits the journey
              </h2>
            </div>
            <p className="max-w-xs text-[15.5px] leading-relaxed text-muted">
              The larger vehicles run on round trips, where the return leg makes them worth
              taking.
            </p>
          </div>
          <div className="reveal">
            <FleetRail vehicles={[...vehicles.intercity, ...vehicles.roundTripOnly]} />
          </div>
        </section>

        {/* ── How — a timeline, not three boxes ─────────────────────────────── */}
        <section id="how" className="mx-auto max-w-6xl px-5 pt-24">
          <MarkDivider className="reveal" />
          <div className="reveal mt-16 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                How it works
              </p>
              <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
                Booked in three steps
              </h2>
            </div>

            <ol className="relative flex flex-col gap-12 before:absolute before:left-[1.4rem] before:top-3 before:h-[calc(100%-2rem)] before:w-px before:bg-line">
              {[
                ['Tell us the trip', 'Two cities, a date and a time. About twenty seconds of typing.'],
                ['See every fare', 'All vehicles, all prices — before we ask for your number.'],
                ['Confirm and travel', 'Verify your phone, then pay the driver at the end.'],
              ].map(([head, body], i) => (
                <li key={head} className="relative flex gap-7">
                  <span className="font-display z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-[17px] text-forest">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em]">
                      {head}
                    </h3>
                    <p className="mt-2 max-w-sm text-[15.5px] leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── One big quote, rather than three small ones ────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-24">
          <div className="reveal rounded-[2rem] bg-surface-alt px-7 py-16 sm:px-16 sm:py-20">
            <span className="flex text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon.star key={i} className="h-5 w-5" />
              ))}
            </span>
            <blockquote className="font-display mt-9 max-w-4xl text-[1.6rem] leading-[1.3] tracking-[-0.02em] sm:text-[2.35rem]">
              “Booked at midnight, quoted a fixed number, and paid exactly that the next
              evening. Nothing added, nothing argued about.”
            </blockquote>
            <p className="mt-9 flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
              <RouteMark className="h-4 w-4 text-accent" />
              Jaipur → Udaipur · 4.8 average across trips
            </p>
          </div>
        </section>

        {/* ── Reach ─────────────────────────────────────────────────────────
            A number is a claim; the names are the evidence. */}
        <section className="pt-24">
          <div className="reveal mx-auto max-w-6xl px-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Reach</p>
            <h2 className="font-display mt-5 max-w-2xl text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
              We go where the trains don’t
            </h2>
          </div>
          <div className="reveal mt-12">
            <CityMarquee cities={cities.slice(0, 44)} />
          </div>
        </section>

        {/* ── FAQ. Also emitted as FAQPage schema above, which is how these become rich
            results rather than a plain blue link. ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-24">
          <div className="reveal">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Questions</p>
            <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
              Everything worth asking
            </h2>
          </div>
          <div className="reveal">
            <Faq items={FAQ} />
          </div>
        </section>

        {/* ── Close ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-24">
          <div className="hero-ground grain reveal relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center text-white sm:px-12 sm:py-28">
            <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <RouteMark className="mx-auto h-9 w-9 text-accent" />
              <h2 className="font-display mx-auto mt-8 max-w-2xl text-[2.25rem] leading-[1.04] tracking-[-0.03em] sm:text-[3rem]">
                Find out what your trip costs
              </h2>
              <p className="mx-auto mt-6 max-w-md text-[17px] text-white/60">
                Under a minute, and nothing to pay to ask.
              </p>
              <Link
                href="/#book"
                className="group mt-11 inline-flex items-center gap-2.5 rounded-full bg-accent px-10 py-4.5 text-[15px] font-bold text-forest transition-all hover:bg-white"
              >
                Check fares
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* On a phone the form is far above the fold once you have scrolled. This keeps the
          one action the page exists for permanently within reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-[0_-8px_32px_-12px_rgba(20,19,15,0.18)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-faint">
              From ₹{routes.routes[0]?.fromRupees?.toLocaleString('en-IN') ?? '—'}
            </p>
            <p className="text-[13px] font-semibold">Fixed fare, no surge</p>
          </div>
          <Link href="/#book" className="rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white">
            Book a cab
          </Link>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
