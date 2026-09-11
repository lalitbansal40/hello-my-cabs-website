/**
 * What we know about a particular route that no API can tell us.
 *
 * Two kinds of thing live here. `arrival` is a few lines about the city you are being
 * dropped in — written by hand, for the routes that carry the most traffic first. `driver`
 * is what our own drivers report about the road itself: where to eat, how many tolls, when
 * to leave. That second one is the part no aggregator can copy, because it comes from
 * people who drive these roads every week rather than from another website.
 *
 * ⚠️ Nothing in here may be guessed. A dhaba that is not there, a toll count that is wrong,
 * a "best time to leave" invented from a map — each of those is a reader finding out on the
 * road that this site does not know what it is talking about. A route with no entry renders
 * without these blocks, and that is the correct behaviour, not a gap to fill with filler.
 *
 * Keyed `PICKUP-DROP`, using the backend's own city keys.
 */

export interface RouteContent {
  /** Three or four lines about arriving in the drop city. Written, not generated. */
  arrival?: string;
  /** Questions specific to this route, appended after the generated ones. */
  faq?: ReadonlyArray<{ q: string; a: string }>;
  /** Reported by the drivers who run this route. Absent until they have reported it. */
  driver?: {
    /** Where to stop. `aboutKm` is how far into the journey it is. */
    stops?: ReadonlyArray<{ name: string; aboutKm?: number; note?: string }>;
    tolls?: { count?: number; approxRupees?: number; note?: string };
    bestTime?: string;
    roadNote?: string;
    /** What it actually takes, when that differs from the distance-based estimate. */
    realHours?: string;
  };
}

/**
 * The written notes. Everything here is a general, checkable fact about the destination —
 * what the place is, what people go there for, what to know on arrival. Nothing about our
 * service is claimed here that is not claimed elsewhere on the site.
 */
const CONTENT: Record<string, RouteContent> = {
  'JAIPUR-DELHI': {
    arrival:
      'Delhi is a set of cities rather than one — the government quarter around Central Delhi, the markets of Old Delhi, the offices of Gurugram and Noida across the border. Tell the driver the neighbourhood rather than "Delhi", because the difference between Dwarka and Noida is an hour of driving at the wrong time of day. Cars from outside Delhi need a state permit, which is on the vehicle before it leaves Jaipur; you do not arrange anything.',
    faq: [
      {
        q: 'Can the cab drop me anywhere in Delhi NCR?',
        a: 'Yes — Gurugram, Noida, Faridabad and Ghaziabad are all reachable on the same booking. Tell us the drop area when you book, because a drop in Noida is a different run from one in Dwarka and the driver plans the route around it.',
      },
      {
        q: 'Which road does the Jaipur to Delhi cab take?',
        a: 'The usual run is the Jaipur–Delhi highway through Rajasthan into Haryana. Which way the driver turns at the Delhi end depends on where you are being dropped and the time of day.',
      },
    ],
  },

  'DELHI-JAIPUR': {
    arrival:
      'Jaipur sits inside a ring of walls that were built for a smaller city, and the old town inside them is where most visitors are heading — Hawa Mahal, the City Palace, the bazaars around Badi Chaupar. Those lanes are narrow and slow; a car will get you to the gate rather than to the door. Hotels are mostly outside the walls, towards Civil Lines and Tonk Road, where the traffic moves.',
    faq: [
      {
        q: 'Can the driver wait and bring us back to Delhi the same day?',
        a: 'Yes, but book it as a round trip rather than two one-way journeys — one booking covers the wait and the return, and it is priced for the whole journey.',
      },
      {
        q: 'Is a Delhi to Jaipur cab available at night?',
        a: 'Yes. The road runs all night and many people leave Delhi around four in the morning to reach Jaipur by breakfast. A night halt charge applies only when the trip keeps the driver out overnight.',
      },
    ],
  },

  'DELHI-AGRA': {
    arrival:
      'Agra is a day out for most people who drive it: the Taj Mahal, Agra Fort, and back the same evening. The monuments are closed to traffic at the gates, so the drop is at the nearest parking and it is a short walk or a battery-rickshaw the rest of the way. The Taj is shut on Fridays, which is the one thing worth checking before booking the car.',
    faq: [
      {
        q: 'Can the driver wait while we see the Taj Mahal?',
        a: 'Yes. Book it as a round trip — the wait and the return are part of the one journey, and the driver parks at the monument lot while you are inside.',
      },
    ],
  },

  'JAIPUR-AGRA': {
    arrival:
      'Agra and Jaipur are two corners of the route most visitors drive with Delhi as the third, so this leg is usually part of something longer. Fatehpur Sikri sits on the way in, close enough to the road that people stop for an hour without losing the day. Tell us at booking if you want that stop, so the driver plans the timing rather than the other way round.',
  },

  'DELHI-HARIDWAR': {
    arrival:
      'Haridwar is a pilgrimage town on the Ganga, and the part everyone is going to — Har Ki Pauri — is closed to cars for the last stretch, particularly around the evening aarti. The drop is as near as vehicles are allowed and the rest is on foot. Rishikesh is another hour up the road if you are continuing.',
    faq: [
      {
        q: 'Can the cab go on to Rishikesh from Haridwar?',
        a: 'Yes — tell us when you book so the fare covers the whole run. Added on the day it becomes a separate journey, which costs more than asking for it in advance.',
      },
    ],
  },

  'DELHI-CHANDIGARH': {
    arrival:
      'Chandigarh is laid out in numbered sectors, which makes it one of the easier Indian cities to be driven around — but it also means an address without a sector number is not an address. The city is the usual stop before the hills; Shimla and Manali are both a further drive from here.',
  },

  'JAIPUR-AJMER': {
    arrival:
      'Ajmer is the dargah of Moinuddin Chishti, and Pushkar is a further half-hour over the hill — most people do both on the same trip. The lanes around the dargah are closed to cars, so the drop is at the edge and the last part is walked.',
  },
};

/** The entry for a route, or an empty object — never a partially invented one. */
export function routeContent(pickup: string, drop: string): RouteContent {
  return CONTENT[`${pickup}-${drop}`] ?? {};
}

/** How many routes have been written up, for the scorecard. */
export const WRITTEN_ROUTES = Object.keys(CONTENT).length;
