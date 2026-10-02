import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { IMAGES, img } from '@/lib/images';
import { JsonLd, faqSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { Icon } from '@/components/site/Icons';
import { CarMark, MarkDivider } from '@/components/site/Brand';
import { RouteCards } from '@/components/site/RouteCards';
import { FleetRail } from '@/components/site/FleetRail';
import { Faq } from '@/components/site/Faq';
import { CityGrid } from '@/components/site/CityGrid';
import { HeroTrust } from '@/components/site/HeroTrust';
import { RouteReviews } from '@/components/landing/RouteReviews';
import { siteReviews } from '@/lib/reviews';
import { IconTile } from '@/components/site/IconTile';
import { TrustStrip } from '@/components/site/TrustStrip';
import { BentoExtras, ServiceBento } from '@/components/site/ServiceBento';
import { TripKinds } from '@/components/site/TripKinds';
import { RoadLine } from '@/components/site/RoadLine';

export const metadata: Metadata = {
  // Absolute, and the brand first: this is the page a search for the company's name has
  // to land on, and the layout template would otherwise put the brand last and cut it.
  title: { absolute: 'Hello My Cab — Outstation Taxi with Fixed Fares' },
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
    q: 'Do I need an account or an OTP to book?',
    a: 'No. Your mobile number is enough to book. A one-time code is asked only when you sign in to see or cancel your trips later.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'At least two hours before pickup. For an early-morning departure, book the night before so the driver can plan the run.',
  },
  {
    q: 'How do I pay?',
    a: 'Cash to the driver at the end of the trip, with nothing to pay when you book. If you would rather pay online, a 15% advance is taken when booking and the rest at the end.',
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
  const [routes, vehicles, cities, reviews] = await Promise.all([
    api.listedRoutes().catch(() => ({ count: 0, fixedCount: 0, routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.cities().catch(() => []),
    // Real ratings from the app, all routes together — null below MIN_REVIEWS, and then
    // neither the section nor the hero's rating appears.
    siteReviews(),
  ]);
  const rating = reviews?.average != null ? { avg: reviews.average, count: reviews.count } : null;

  const ticker = routes.routes.slice(0, 14);

  return (
    <>
      <JsonLd data={faqSchema(FAQ)} />
      <Header />

      {/* ── The first screen ─────────────────────────────────────────────────────
          The booking ticket on the left, a bento of what we run on the right, and the road
          — the logo's swoosh — running faintly behind both. On a phone: the h1, the ticket,
          then the bento, so the ticket is the first thing under the heading. */}
      <section className="relative isolate overflow-hidden bg-surface">
        <RoadLine />
        <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter pt-4 sm:pt-8 short:pt-4">
          {/* The one h1 — it says what a search for the company should land on. Larger on
              a laptop, where it was the size of a card title next to the ticket; smaller on
              a short laptop screen, so the ticket's button still makes the first screen. */}
          <h1 className="font-display text-title-lg leading-tight sm:text-h2 lg:text-h1 short:text-h2">
            Outstation cabs with a fixed fare
          </h1>
          {/* What the fare means, in one line. Not on a phone, where the ticket comes first. */}
          <p className="mt-2 hidden text-lead text-muted sm:block short:hidden">
            Fixed before you book · Driver and fuel included · Pay cash at the end
          </p>
          {/* Under the heading from a tablet up; on a phone under the ticket instead, so the
              ticket's button stays on the first screen. */}
          <HeroTrust className="hidden sm:flex" rating={rating} />

          {/* Laptop: the ticket, with our promise and the desk under it, on the left; the
              bento on the right. Phone: ticket, bento, then promise and desk — DOM order, with
              the grid placing them on a laptop. */}
          <div className="mt-4 grid gap-6 sm:mt-5 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-start short:mt-4">
            {/* scroll-mt: the sticky header must not cover the ticket when a "Book now"
                anywhere on the page brings it into view. */}
            <div id="book" className="scroll-mt-24 lg:col-start-1 lg:row-start-1">
              <BookingWidget />
              <HeroTrust className="flex sm:hidden" rating={rating} />
            </div>
            <ServiceBento
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
              routes={routes.routes}
            />
            <BentoExtras className="lg:col-start-1 lg:row-start-2" />
          </div>
        </div>

        {/* A slow ticker of real routes under the first screen — movement at the seam, and
            it happens to say something true about the size of the network. */}
        {ticker.length > 0 ? (
          <div className="relative mt-8 overflow-hidden border-y border-line bg-surface-raised py-3.5">
            <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
              {/* Twice over so the loop has no seam; the second copy is for the eye only — a
                  screen reader hears each route once. */}
              {[...ticker, ...ticker].map((r, i) => (
                <span
                  key={i}
                  aria-hidden={i >= ticker.length || undefined}
                  className="flex items-center gap-3 text-small font-semibold text-muted"
                >
                  {title(r.pickup)}
                  <Icon.arrow className="h-3.5 w-3.5 text-accent" />
                  {title(r.drop)}
                  <span className="text-faint">·</span>
                  <span className="text-ink">₹{r.fromRupees?.toLocaleString('en-IN')}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <main>
        {/* Straight under the first screen: what the company is, in numbers that come from
            the catalogue rather than from a slogan. */}
        <div className="pt-10">
          <TrustStrip
            cities={cities.length}
            routes={routes.count}
            vehicles={vehicles.intercity.length + vehicles.roundTripOnly.length}
          />
        </div>

        {/* ── Routes — cards to scan for your own trip ───────────────────────── */}
        <section id="routes" className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-label font-bold uppercase text-accent">
                Popular
              </p>
              <h2 className="font-display mt-5 text-balance text-h2">
                Routes we know well
              </h2>
            </div>
            <p className="max-w-md text-pretty text-body text-muted">
              {routes.fixedCount} routes carry a listed fare — a real number, not an estimate that
              moves once you are in the car.
            </p>
          </div>

          {routes.routes.length === 0 ? (
            <p className="mt-12 text-muted">Fares are loading. Please try again shortly.</p>
          ) : (
            <div className="reveal">
              <RouteCards routes={routes.routes.slice(0, 6)} />
              <Link
                href="/routes"
                className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-line px-7 py-3.5 text-small font-bold transition-colors hover:border-forest hover:bg-surface-alt"
              >
                All {routes.count} routes
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </section>

        {/* ── Three ways to ride — what each trip type is, with its road drawn; a tap sets
            the ticket at the top to it. ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <div className="reveal max-w-2xl">
            <p className="text-label font-bold uppercase text-accent">Trip types</p>
            <h2 className="font-display mt-5 text-balance text-h2">Three ways to ride</h2>
          </div>
          <TripKinds className="reveal mt-10" />
        </section>

        {/* ── Fleet — a rail you push sideways ──────────────────────────────── */}
        <section id="fleet" className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-label font-bold uppercase text-accent">Fleet</p>
              <h2 className="font-display mt-5 text-balance text-h2">
                Pick what suits the journey
              </h2>
            </div>
            <p className="max-w-md text-pretty text-body text-muted">
              The larger vehicles run on round trips, where the return leg makes them worth
              taking.
            </p>
          </div>
          <div className="reveal">
            <FleetRail vehicles={[...vehicles.intercity, ...vehicles.roundTripOnly]} />
          </div>
        </section>

        <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <MarkDivider className="reveal" />
        </div>

        {/* ── How — a timeline, not three boxes ───────────────────────────────
            On the dark ground, and the only section between the hero and the footer that
            is. Six ivory sections in a row read as one long page however well each is set;
            one dark band in the middle gives the eye somewhere to land and marks the point
            where the page stops selling and starts explaining. */}
        <section id="how" className="hero-ground grain relative mt-16 overflow-hidden text-white">
          <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl px-5 py-24 sm:py-28">
          <div className="reveal grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <div>
              <p className="text-label font-bold uppercase text-accent">
                How it works
              </p>
              <h2 className="font-display mt-5 text-balance text-h2">
                Booked in three steps
              </h2>
            </div>

            {/* The three steps as stops on a road: a dashed red line, and each step a red
                stop on it — the same road the ticket draws between From and To. */}
            <ol className="relative flex flex-col gap-12 before:absolute before:left-[1.3rem] before:top-3 before:h-[calc(100%-2rem)] before:border-l-2 before:border-dashed before:border-accent/70">
              {[
                ['Tell us the trip', 'Two cities, a date and a time. About twenty seconds of typing.'],
                ['See every fare', 'All vehicles, all prices — before we ask for your number.'],
                ['Confirm and travel', 'Leave your number — no OTP — and pay the driver at the end.'],
              ].map(([head, body], i) => (
                <li key={head} className="relative flex gap-7">
                  <span className="font-display z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-title text-white ring-4 ring-ink">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-h3">
                      {head}
                    </h3>
                    <p className="mt-2 max-w-sm text-pretty text-body text-white/65">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          </div>
        </section>

        {/* ── Why us — real reviews belong right after this, with names, the moment there are
            enough (lib/reviews.ts); never a quote or a rating written by us. ────────
            Three cards on the ivory. This was three lines of type until 30 Sep 2026, on
            the reasoning that a section after a busy hero should let the page breathe —
            the owner asked for the card treatment here, and it is a deliberate reversal
            rather than a drift. The breathing room is kept in the spacing instead: the
            heading gets its own full-width band above, and the cards are the only thing
            in the row. */}
        <section className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          {/* The heading sits above the three rather than beside them. Three cards in a
              column half this wide are 190px each — narrow enough that every title breaks
              across two lines. */}
          <div className="reveal max-w-2xl">
            <p className="text-label font-bold uppercase text-accent">
              Why us
            </p>
            <h2 className="font-display mt-5 text-balance text-h2">
              The things that go wrong in a cab, don’t.
            </h2>
            {/* The line the "What we promise" band used to make on its own, half a page
                later — the same promise three times over was making the page long, not
                more convincing. */}
            <p className="mt-5 max-w-xl text-pretty text-lead text-muted">
              The number you are quoted at midnight is the number you pay the next evening —
              nothing added on arrival, nothing to argue about at the end.
            </p>
          </div>

          {/* Three cards, not three rows of a list: an icon tile, the promise, and a
              badge saying how often it holds. The badge claims nothing new — it is the
              sentence above it in three words. */}
          <ul className="reveal mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [<Icon.tag key="a" className="h-5 w-5" />, 'One price, agreed upfront', 'What you are quoted is what you pay. No surge, and no recalculation when you arrive.', 'Every booking'],
              [<Icon.shield key="b" className="h-5 w-5" />, 'Drivers we know', 'Every driver’s Aadhaar, licence and RC are checked by a person before their first trip, and rated after every one.', 'Every driver'],
              [<Icon.headset key="c" className="h-5 w-5" />, 'Someone always answers', 'A real person on the phone, at any hour, for the length of the journey.', '24×7'],
            ].map(([icon, head, body, badge]) => (
              <li
                key={head as string}
                // On a phone the icon sits beside the words (three stacked cards were
                // 1,180px); a column again from `sm`, where there is room.
                className="row-lift grid grid-cols-[auto_1fr] gap-x-4 rounded-2xl border border-line bg-surface-raised p-5 sm:block sm:p-6"
              >
                {/* The tile's own bottom margin belongs to the stacked layout; beside the
                    words on a phone it only pushed the title away from its sentence. */}
                <span className="row-span-3 max-sm:[&>span]:mb-0">
                  <IconTile>{icon}</IconTile>
                </span>
                <h3 className="col-start-2 font-display text-h3">
                  {head as string}
                </h3>
                <p className="col-start-2 mt-2 text-pretty text-body text-muted">{body as string}</p>
                {/* `tracking-normal`: --text-label carries an eyebrow's 0.12em, which on
                    two or three ordinary words reads as a mistake. */}
                <span className="col-start-2 mt-3 inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-label font-semibold tracking-normal text-accent-dark sm:mt-4">
                  {badge as string}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── What riders say — real ratings only, and only enough of them to mean something
            (lib/reviews.ts). Renders nothing until then. ──────────────────────────── */}
        <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
          <RouteReviews title="What riders say" reviews={reviews} showTripStart />
        </div>

        {/* ── Atmosphere ────────────────────────────────────────────────────────
            No place is named here, deliberately: the picture sets a mood, it does not
            make a claim about where it was taken. */}
        <section className="relative mt-28 overflow-hidden">
          <div className="relative h-[28rem] sm:h-[34rem]">
            <Image src={img(IMAGES.openRoad, 1920, 65)} alt="" fill sizes="100vw" className="object-cover" />
            {/* Two scrims, because the text sits in a different place on each. On a wide
                screen the words are in the left third and the picture is allowed to stay
                bright on the right. On a phone the block spans the whole width, and over
                the lit windscreen white text on a 15% wash was unreadable — so there the
                dark comes up from the bottom, where the words are. */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#201818] from-55% via-[#201818]/95 to-[#201818]/70 sm:bg-gradient-to-r sm:from-[#201818] sm:from-0% sm:via-[#201818]/92 sm:to-[#201818]/40 lg:to-[#201818]/15" />
            <div className="grain absolute inset-0" aria-hidden />
            <div className="absolute inset-0 flex items-end pb-10 sm:items-center sm:pb-0">
              <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-gutter">
                <div className="reveal max-w-lg text-white">
                  <CarMark tone="dark" className="h-auto w-24" />
                  <h2 className="font-display mt-7 text-balance text-h2">
                    Long drives, without the haggling.
                  </h2>
                  <p className="mt-6 text-pretty text-lead text-white/65">
                    Six hundred kilometres or sixty — the fare is agreed before the engine
                    starts, and nobody renegotiates it at a dhaba at midnight.
                  </p>
                  <Link
                    href="/#book"
                    className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-body font-bold text-forest transition-all hover:bg-accent hover:text-white"
                  >
                    Check your route
                    <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reach ─────────────────────────────────────────────────────────
            A number is a claim; the names are the evidence. */}
        <section className="section-gap">
          <div className="reveal mx-auto max-w-6xl 2xl:max-w-7xl px-5">
            <p className="text-label font-bold uppercase text-accent">Reach</p>
            <h2 className="font-display mt-5 max-w-2xl text-balance text-h2">
              We go where the trains don’t
            </h2>
          </div>
          <div className="reveal mx-auto mt-10 max-w-6xl 2xl:max-w-7xl px-5">
            <CityGrid cities={cities.slice(0, 24)} total={cities.length} phoneShows={12} />
          </div>
        </section>

        {/* ── FAQ. Also emitted as FAQPage schema above, which is how these become rich
            results rather than a plain blue link. ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <div className="reveal">
            <p className="text-label font-bold uppercase text-accent">Questions</p>
            <h2 className="font-display mt-5 text-balance text-h2">
              Everything worth asking
            </h2>
          </div>
          <div className="reveal">
            <Faq items={FAQ} />
          </div>
        </section>

        {/* ── Close ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 section-gap">
          <div className="hero-ground grain reveal relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white sm:px-12 sm:py-28">
            <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <CarMark tone="dark" className="mx-auto h-auto w-28" />
              <h2 className="font-display mx-auto mt-8 max-w-2xl text-balance text-h2">
                Find out what your trip costs
              </h2>
              <p className="mx-auto mt-6 max-w-md text-pretty text-lead text-white/60">
                Under a minute, and nothing to pay to ask.
              </p>
              <Link
                href="/#book"
                className="ticket-stub group mt-11 inline-flex items-center gap-2.5 rounded-2xl bg-accent px-10 py-4.5 pl-12 text-body font-bold text-white transition-all hover:bg-white hover:text-ink"
              >
                Check fares
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <WhatsAppFab />

      <Footer />

      {/* "From" is the cheapest listed fare, not the first route's — the bar said ₹3,200
          while Jaipur → Ajmer is ₹1,800. */}
      <StickyBookBar
        from={Math.min(...routes.routes.map((r) => r.fromRupees ?? Infinity).filter(Number.isFinite)) || null}
        href="/#book"
      />
    </>
  );
}
