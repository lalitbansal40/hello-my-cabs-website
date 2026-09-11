/**
 * What it is like to arrive in each city we drop in.
 *
 * Written once per city and shown on every route that ends there, which is what makes a
 * route page and its reverse genuinely different documents: the Jaipur → Delhi page is
 * about arriving in Delhi, and the Delhi → Jaipur page is about arriving in Jaipur. Before
 * this they were the same page with two names swapped, and everything else on them — the
 * fare table, the policies — is legitimately identical in both directions.
 *
 * ⚠️ Only general, checkable facts about the place and about being dropped there. Nothing
 * about a particular restaurant, hotel or price, and nothing that dates: a note that goes
 * stale is worse than no note, because nobody will be watching it.
 */

export interface CityNote {
  /** Two or three sentences about arriving. Shown under "Arriving in X". */
  arrival: string;
  /** One line for the drop itself — where a car can and cannot go. */
  drop?: string;
}

const NOTES: Record<string, CityNote> = {
  JAIPUR: {
    arrival:
      'Jaipur sits inside a walled old city that was laid out long before cars, and most of what visitors come for is inside it — the City Palace, Hawa Mahal, the bazaars around Badi Chaupar. Those lanes are narrow and slow, so a car reaches the gate rather than the doorway. Most hotels are outside the walls, along Tonk Road and around Civil Lines, where traffic moves.',
    drop: 'Amber Fort and Nahargarh are on the hills north of the city, a further half-hour each.',
  },
  DELHI: {
    arrival:
      'Delhi is several cities at once, and the difference between them is an hour of driving at the wrong time of day: the government quarter in the centre, the lanes of Old Delhi, the offices of Gurugram and Noida across the state border. Give the driver the neighbourhood and a landmark rather than just "Delhi".',
    drop: 'Going to Noida rather than Delhi itself? Book Noida as the drop — it is priced as its own journey.',
  },
  DELHI_AIRPORT: {
    arrival:
      'Indira Gandhi International has more than one terminal, and they are far enough apart that the wrong one costs real time. Check which terminal your flight uses on the ticket — airlines move between them — and give it to us with the flight number when you book. Airport parking, like tolls, is paid as it arises rather than being part of the fare.',
    drop: 'For a departure, allow for the queue at the terminal door, which comes before check-in rather than after it.',
  },
  NOIDA: {
    arrival:
      'Noida is laid out in numbered sectors across the Yamuna from Delhi, and an address without its sector number is not an address — the difference between Sector 18 and Sector 137 is most of the length of the city. Greater Noida is further out again along the expressway. The Delhi border crossings are the slow part of any trip in or out at rush hour.',
  },
  CHANDIGARH: {
    arrival:
      'Chandigarh is built on a grid of numbered sectors, which makes being driven around it unusually simple — but the sector number is the address, and Panchkula and Mohali on either side are separate towns in separate states. It is the usual last stop on the plains before the hills: Shimla, Manali and Dharamshala all begin from here.',
  },
  AGRA: {
    arrival:
      'Agra is a day out for most people who drive to it — the Taj Mahal, Agra Fort, and home the same evening. Traffic is kept away from the monument gates, so the drop is at the nearest parking and the last stretch is walked or taken by battery rickshaw. The Taj is closed on Fridays, which is the one thing worth checking before the car is booked.',
    drop: 'Fatehpur Sikri is about 40 km out on the Jaipur road, close enough to add on the way through.',
  },
  AJMER: {
    arrival:
      'Ajmer is built around the dargah of Moinuddin Chishti, and the lanes leading to it are closed to cars — the drop is at the edge of the bazaar and the rest is on foot. Pushkar is half an hour over the hill, and most people who come this far do both on the same trip.',
  },
  KOTA: {
    arrival:
      'Kota sits on the Chambal in southern Rajasthan, and is as often a coaching-college city as a tourist one — a good share of the traffic here is families visiting students. The riverfront and the old palace are the sights; Bundi, which is smaller and quieter, is about 40 km away.',
  },
  SIKAR: {
    arrival:
      'Sikar is in Shekhawati, the region of painted havelis north of Jaipur, and the towns worth stopping in — Nawalgarh, Mandawa, Fatehpur — are spread across the district rather than gathered in one place. It is a comfortable half-day from Jaipur and a long one from Delhi.',
  },
  HARIDWAR: {
    arrival:
      'Haridwar is a pilgrimage town on the Ganga, and the part everybody is heading for — Har Ki Pauri — is closed to vehicles for the last stretch, particularly around the evening aarti. The drop is as close as cars are allowed and the rest is walked. Rishikesh is another hour up the road if you are carrying on.',
  },
};

/** The note for a city, or null — never a generic one written to fill the space. */
export function cityNote(city: string): CityNote | null {
  return NOTES[city] ?? null;
}
