import Link from 'next/link';
import { api } from '@/lib/api';
import { JsonLd, faqSchema } from '@/lib/schema';
import { rupees } from '@/lib/seo';
import { routePath } from '@/lib/slug';

/**
 * How to reach Khatu Shyam ji (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 5.4).
 *
 * The searches: "taxi in khatu", "taxi service in reengus", "khatu shyam taxi" — and the
 * how-to-reach articles that rank for them. What this page can say that they cannot is
 * measured: the road distances and the towns on the road are our route planner's (Ola,
 * 21 Nov 2026 — docs/seo/evidence/jaipur-airport-zones-2026-11-21.md), and every price is the
 * fare API's at build time. Everything else is general and checkable: Reengus (Ringas)
 * Junction is the nearest station; Jaipur's is the nearest airport; Ekadashi and the Phalgun
 * mela are the crowded days. No train names, times or temple timings — those change, and a
 * wrong one sends a family to a closed gate.
 */
const MEASURED = {
  jaipur: { km: 82, via: 'Chomu and Reengus', time: 'an hour and a half to two hours' },
  delhi: { km: 282, via: 'Behror, Kotputli, Shahpura and Reengus', time: 'about four and a half hours' },
  jaipurAirport: { km: 97 },
  reengus: { km: 19 },
  sikar: { km: 47 },
};

export async function KhatuGuide() {
  const [routes, round, reengus] = await Promise.all([
    api.listedRoutes().catch(() => ({ count: 0, fixedCount: 0, routes: [] })),
    api.roundtripFare('JAIPUR', 'KHATU_SHYAM_JI').catch(() => null),
    api.transfer('reengus-khatu'),
  ]);
  const from = (a: string, b: string) => routes.routes.find((r) => r.pickup === a && r.drop === b)?.fromRupees ?? null;
  const jaipur = from('JAIPUR', 'KHATU_SHYAM_JI');
  const delhi = from('DELHI', 'KHATU_SHYAM_JI');
  const airport = from('JAIPUR_AIRPORT', 'KHATU_SHYAM_JI');
  if (process.env.NEXT_PHASE === 'phase-production-build' && (!jaipur || !reengus)) {
    throw new Error('No Khatu fares at build time — refusing to publish how-to-reach-khatu-shyam');
  }
  const roundFrom = round?.vehicles?.length
    ? Math.min(...round.vehicles.map((v) => v.fare).filter((n) => n > 0))
    : null;
  const station = reengus?.zones[0]?.fares;

  const faq = [
    {
      q: 'How far is Khatu Shyam ji from Jaipur?',
      a: `About ${MEASURED.jaipur.km} km by road through ${MEASURED.jaipur.via} — ${MEASURED.jaipur.time} in a car.${jaipur ? ` A one-way taxi is from ${rupees(jaipur)} plus toll and GST.` : ''}`,
    },
    {
      q: 'How far is Khatu Shyam ji from Delhi?',
      a: `About ${MEASURED.delhi.km} km by road, through ${MEASURED.delhi.via} — ${MEASURED.delhi.time}.${delhi ? ` A one-way taxi is from ${rupees(delhi)} plus toll and GST.` : ''}`,
    },
    {
      q: 'Which is the nearest railway station to Khatu Shyam ji?',
      a: `Reengus (Ringas) Junction, ${MEASURED.reengus.km} km from Khatu by road.${station ? ` A taxi from the station is a fixed ${rupees(station.dzire)} in a Dzire.` : ''}`,
    },
    {
      q: 'Which is the nearest airport?',
      a: `Jaipur International Airport, about ${MEASURED.jaipurAirport.km} km from Khatu by road.${airport ? ` A taxi straight from the airport is from ${rupees(airport)}.` : ''}`,
    },
    {
      q: 'When is Khatu Shyam ji most crowded?',
      a: 'On Ekadashi, twice every month, and above all during the Phalgun mela in February–March. On those days the lanes near the temple are closed to cars and the last stretch is walked. Book a car two or three days ahead.',
    },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faq)} />

      <p className="lead">
        Khatu Shyam ji is {MEASURED.jaipur.km} km from Jaipur and {MEASURED.delhi.km} km from Delhi by road. Most
        people come by car — a day out from Jaipur — and those who come by train get off at Reengus,{' '}
        {MEASURED.reengus.km} km away. Below: each way of getting there, what it takes and what it costs,
        with the distances measured by our route planner rather than copied from a map.
      </p>

      <h2>By road from Jaipur</h2>
      <p>
        <strong>About {MEASURED.jaipur.km} km</strong>, {MEASURED.jaipur.time}. The road leaves Jaipur on
        NH52 towards Sikar, through Chomu to Reengus, and turns west at Reengus for the last stretch to
        Khatu. It is the road most taxis and buses take.
      </p>
      <p>
        {jaipur ? (
          <>
            A one-way taxi is from <strong>{rupees(jaipur)}</strong>
            {roundFrom ? (
              <>
                , and a same-day round trip — the driver waits while you have darshan — from{' '}
                <strong>{rupees(roundFrom)}</strong>
              </>
            ) : null}
            .{' '}
          </>
        ) : null}
        <Link href={routePath('JAIPUR', 'KHATU_SHYAM_JI')}>Jaipur to Khatu Shyam ji cab</Link> has every car&rsquo;s
        fare.
      </p>

      <h2>By road from Delhi</h2>
      <p>
        <strong>About {MEASURED.delhi.km} km</strong>, {MEASURED.delhi.time} on the road towards Jaipur — Behror,
        Kotputli, Shahpura — and then west through Reengus. There and back is about nine hours of driving, so
        most families stay a night or take two days.
        {delhi ? (
          <>
            {' '}
            One way from <strong>{rupees(delhi)}</strong>:{' '}
            <Link href={routePath('DELHI', 'KHATU_SHYAM_JI')}>Delhi to Khatu Shyam ji cab</Link>.
          </>
        ) : null}
      </p>

      <h2>By train: Reengus (Ringas) Junction</h2>
      <p>
        Reengus is the nearest station, {MEASURED.reengus.km} km from Khatu by road; trains from Jaipur and from
        the Delhi side stop there. Check the train on the railway&rsquo;s own enquiry before you plan around it —
        timings change.
      </p>
      {station ? (
        <p>
          From the station a taxi is a fixed fare either way: Hatchback {rupees(station.hatchback)}, Dzire{' '}
          {rupees(station.dzire)}, Ertiga {rupees(station.ertiga)}, Innova Crysta {rupees(station.crysta)}
          {reengus?.includes.length ? ` (${reengus.includes.join(' and ')} included)` : ''}.{' '}
          <Link href="/cab-service-in-khatu-shyam-ji#reengus">Book the Reengus–Khatu taxi</Link>.
        </p>
      ) : null}

      <h2>By air: Jaipur</h2>
      <p>
        Jaipur International Airport is the nearest, about {MEASURED.jaipurAirport.km} km from Khatu by road.
        {airport ? ` A taxi straight from the terminal is from ${rupees(airport)} — the same fare as from Jaipur city.` : ''}{' '}
        <Link href="/jaipur-airport-taxi">Jaipur Airport taxi</Link>.
      </p>

      <h2>When to go, and when to book</h2>
      <p>
        Khatu is busiest on <strong>Ekadashi</strong>, twice a month, and above all during the{' '}
        <strong>Phalgun mela</strong> in February–March. On those days the lanes near the temple are closed to
        vehicles, the drop is as near as cars are allowed, and the last part is walked — leave earlier than you
        would, and book the car two or three days ahead, because that is when cars run out first. On an ordinary
        weekday the drive ends close to the temple and the trip is easy in a morning.
      </p>
      <p>
        Sikar is {MEASURED.sikar.km} km on, and Salasar Balaji is further along the same side of the state, so
        many families make it one longer day.{' '}
        <Link href="/cab-service-in-khatu-shyam-ji">Khatu Shyam ji taxi</Link> ·{' '}
        <Link href="/cab-service-in-sikar">Cab service in Sikar</Link> ·{' '}
        <Link href="/guides/jaipur-sikar-by-road">Jaipur to Sikar by road</Link>
      </p>

      <h2>Questions</h2>
      {faq.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </>
  );
}
