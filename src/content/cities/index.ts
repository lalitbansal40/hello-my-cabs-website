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
      'Jaipur sits inside a walled old city that was laid out long before cars, and most of what visitors come for is inside it — the City Palace, Hawa Mahal, the bazaars around Badi Chaupar. Those lanes are narrow and slow, so a car reaches the gate rather than the doorway. Most hotels are outside the walls, along Tonk Road and around Civil Lines, where traffic moves. Jaipur is the capital of Rajasthan, and the old city\'s pink-washed walls are where its nickname comes from.',
    drop: 'Amber Fort and Nahargarh are on the hills north of the city, a further half-hour each.',
  },
  DELHI: {
    arrival:
      'Delhi is several cities at once, and the difference between them is an hour of driving at the wrong time of day: the government quarter in the centre, the lanes of Old Delhi, the offices of Gurugram and Noida across the state border. Give the driver the neighbourhood and a landmark rather than just "Delhi". The Red Fort and Chandni Chowk are in the old city to the north, India Gate and the ministries in the centre, and Hauz Khas, Saket and Vasant Kunj to the south.',
    drop: 'Going to Noida rather than Delhi itself? Book Noida as the drop — it is priced as its own journey.',
  },
  DELHI_AIRPORT: {
    arrival:
      'Indira Gandhi International has more than one terminal, and they are far enough apart that the wrong one costs real time. Check which terminal your flight uses on the ticket — airlines move between them — and give it to us with the flight number when you book. Airport parking, like tolls, is paid as it arises rather than being part of the fare. Terminal 3 handles the international flights and some domestic ones; Terminals 1 and 2 are domestic.',
    drop: 'For a departure, allow for the queue at the terminal door, which comes before check-in rather than after it.',
  },
  NOIDA: {
    arrival:
      'Noida is laid out in numbered sectors across the Yamuna from Delhi, and an address without its sector number is not an address — the difference between Sector 18 and Sector 137 is most of the length of the city. Greater Noida is further out again along the expressway. The Delhi border crossings are the slow part of any trip in or out at rush hour. Sector 18 is the main shopping district, and most offices are along the expressway to the south.',
  },
  CHANDIGARH: {
    arrival:
      'Chandigarh is built on a grid of numbered sectors, which makes being driven around it unusually simple — but the sector number is the address, and Panchkula and Mohali on either side are separate towns in separate states. It is the usual last stop on the plains before the hills: Shimla, Manali and Dharamshala all begin from here. The Rock Garden and Sukhna Lake are both at the north end of the city, beside the Capitol Complex that Le Corbusier designed.',
  },
  AGRA: {
    arrival:
      'Agra is a day out for most people who drive to it — the Taj Mahal, Agra Fort, and home the same evening. Traffic is kept away from the monument gates, so the drop is at the nearest parking and the last stretch is walked or taken by battery rickshaw. The Taj is closed on Fridays, which is the one thing worth checking before the car is booked. Agra Fort stands on the Yamuna a short way up river from the Taj, and Mehtab Bagh, on the far bank, is where the Taj is seen from across the water.',
    drop: 'Fatehpur Sikri is about 40 km out on the Jaipur road, close enough to add on the way through.',
  },
  AJMER: {
    arrival:
      'Ajmer is built around the dargah of Moinuddin Chishti, and the lanes leading to it are closed to cars — the drop is at the edge of the bazaar and the rest is on foot. Pushkar is half an hour over the hill, and most people who come this far do both on the same trip. Ana Sagar lake is on the north side of the city, and the Adhai Din Ka Jhonpra mosque is a short walk up from the dargah.',
  },
  KOTA: {
    arrival:
      'Kota sits on the Chambal in southern Rajasthan, and is as often a coaching-college city as a tourist one — a good share of the traffic here is families visiting students. The riverfront and the old palace are the sights; Bundi, which is smaller and quieter, is about 40 km away. Kishore Sagar lake and the Chambal Garden are in the city itself; the Garadia Mahadev viewpoint over the Chambal gorge is a drive out.',
  },
  SIKAR: {
    arrival:
      'Sikar is in Shekhawati, the region of painted havelis north of Jaipur, and the towns worth stopping in — Nawalgarh, Mandawa, Fatehpur — are spread across the district rather than gathered in one place. It is a comfortable half-day from Jaipur and a long one from Delhi. The Khatu Shyam Ji temple, one of the busiest in Rajasthan, is in Sikar district, and Salasar Balaji is a short drive north of it.',
  },
  HARIDWAR: {
    arrival:
      'Haridwar is a pilgrimage town on the Ganga, and the part everybody is heading for — Har Ki Pauri — is closed to vehicles for the last stretch, particularly around the evening aarti. The drop is as close as cars are allowed and the rest is walked. Rishikesh is another hour up the road if you are carrying on. Mansa Devi and Chandi Devi temples are on the hills either side of the town, both reached by ropeway.',
  },
  // The five below are the ends of routes published because people book them
  // (backend constants/demandRoutes.ts). None has a city page of its own yet.
  JODHPUR: {
    arrival:
      'Jodhpur is the blue city under Mehrangarh Fort, which stands on a rock ridge above the old town. The lanes of the old city around the clock tower and Sardar Market are narrow and crowded, so the drop is usually at their edge. Umaid Bhawan Palace is on a separate hill across the city, a drive of its own. Jaswant Thada, the white marble memorial, sits just below the fort.',
  },
  UDAIPUR: {
    arrival:
      'Udaipur is built around its lakes, with the City Palace along the eastern shore of Lake Pichola. The old city between the palace and the Jagdish Temple is a tangle of narrow lanes, and many of the lakeside hotels are reached through them — the car stops where the lane gets too tight, and the last stretch is on foot. Fateh Sagar lake is north of Pichola, and Sajjangarh — the Monsoon Palace — looks down on both from a hill to the west.',
  },
  LUDHIANA: {
    arrival:
      'Ludhiana is the largest city in Punjab and a working one — hosiery, bicycles and machine parts rather than monuments. It is spread wide along the national highway, so give the driver the area and a landmark rather than just the city name. It sits about 100 km west of Chandigarh on the highway towards Jalandhar and Amritsar.',
  },
  MOHALI: {
    arrival:
      'Mohali runs straight on from Chandigarh on its south-western side, but it is in Punjab and has its own numbered phases and sectors — a Chandigarh sector number means nothing here. The Chandigarh airport is on the Mohali side, and so is the cricket stadium. The cricket stadium is in Phase 9, and the newer sectors keep spreading south-west of it.',
  },
  DEHRADUN: {
    arrival:
      'Dehradun is Uttarakhand’s largest city, where the state government sits, in a broad valley below the first ranges of the Himalaya. Mussoorie is up the hill road above it, a separate climb of its own, and Rishikesh and Haridwar are down the valley to the south-east. The Forest Research Institute, a large colonial building in its own grounds, is on the west side of the city.',
  },
};

/** The note for a city, or null — never a generic one written to fill the space. */
export function cityNote(city: string): CityNote | null {
  return NOTES[city] ?? null;
}

/**
 * Where a trip out of each city starts — the stations, airport and bus stands people are
 * collected from, and the parts of town they are collected in.
 *
 * Shown as "Picking up in X" on every route that leaves X. With "Arriving in Y" above, it
 * gives every route page two blocks that belong to its own two ends — the part of a route
 * page that is genuinely different from the next one (2 Oct 2026: two routes into the same
 * city were 88% the same text with the names swapped).
 *
 * ⚠️ Same rule as the notes above: general, checkable facts only — the names of stations,
 * airports, bus stands and neighbourhoods. A place outside the city (an airport 25 km out)
 * is not a pickup point here: the fare is city to city, and a pickup there is not. Nothing about a price, a hotel or a business, and
 * no claim about the service that is not made elsewhere on the site.
 */
export interface CityPickup {
  /** One or two sentences about being collected in this city. */
  about: string;
  /** Stations, airport, bus stands — places people are commonly collected from. */
  points: ReadonlyArray<string>;
  /** Neighbourhoods, named so somebody looking for theirs finds it. */
  areas: ReadonlyArray<string>;
}

const PICKUPS: Record<string, CityPickup> = {
  JAIPUR: {
    about:
      'Most trips out of Jaipur start from a home in the newer colonies to the south and west, a hotel outside the walled city, or one of the stations. Inside the old city the lanes are narrow, so the pickup is at the nearest gate or main road.',
    points: [
      'Jaipur Junction railway station',
      'Gandhinagar and Durgapura stations',
      'Sindhi Camp bus stand',
      'Jaipur International Airport, Sanganer',
    ],
    areas: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Jagatpura', 'C-Scheme', 'Raja Park', 'Tonk Road', 'Sitapura', 'Jhotwara', 'Civil Lines'],
  },
  DELHI: {
    about:
      'Delhi is large enough that where you are collected decides how long the first hour takes. A pickup from the old city or near a station is slower than one from the ring road or the southern colonies; give the area and a landmark, and the platform side for a station.',
    points: [
      'New Delhi railway station',
      'Hazrat Nizamuddin railway station',
      'Old Delhi (Delhi Junction) railway station',
      'Anand Vihar Terminal',
      'Kashmere Gate ISBT',
      'Sarai Kale Khan ISBT',
    ],
    areas: ['Connaught Place', 'Karol Bagh', 'Paharganj', 'Dwarka', 'Janakpuri', 'Rohini', 'Lajpat Nagar', 'Saket', 'Vasant Kunj', 'Mayur Vihar'],
  },
  DELHI_AIRPORT: {
    about:
      'The pickup is at the terminal your flight lands at, and the terminals are far enough apart that the wrong one costs real time. Send the flight number and terminal with the booking, and keep your phone on after landing.',
    points: ['Terminal 1', 'Terminal 2', 'Terminal 3'],
    areas: ['Aerocity', 'Mahipalpur', 'Dwarka'],
  },
  NOIDA: {
    about:
      'An address in Noida is its sector number, and the city runs a long way south along the expressway, so a pickup in the low sectors near the Delhi border and one in Greater Noida are different starts to the same trip.',
    points: ['Noida City Centre metro', 'Botanical Garden metro', 'Sector 18 market'],
    areas: ['Sector 18', 'Sector 62', 'Sector 50', 'Sector 76', 'Sector 137', 'Sector 150', 'Greater Noida', 'Greater Noida West'],
  },
  CHANDIGARH: {
    about:
      'Chandigarh addresses are sector numbers, which makes a pickup quick to find. Panchkula and Zirakpur run on from it on either side, and pickups there are booked the same way.',
    points: [
      'Chandigarh railway station',
      'ISBT Sector 17',
      'ISBT Sector 43',
      'Chandigarh International Airport',
    ],
    areas: ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Manimajra', 'Panchkula', 'Zirakpur'],
  },
  AGRA: {
    about:
      'Most people leaving Agra are collected from a hotel near the Taj or from one of the stations. Vehicles are kept away from the area right around the monument, so a hotel inside it is met at the nearest point a car can reach.',
    points: ['Agra Cantt railway station', 'Agra Fort railway station', 'Raja Ki Mandi railway station', 'Idgah bus stand'],
    areas: ['Taj Ganj', 'Fatehabad Road', 'Sadar Bazaar', 'Kamla Nagar', 'Sikandra', 'Dayal Bagh'],
  },
  AJMER: {
    about:
      'Pickups in Ajmer are usually from the station, the bus stand or a hotel near the dargah, where the lanes close to cars and the meeting point is at the edge of the bazaar. Pushkar is over the hill to the west.',
    points: ['Ajmer Junction railway station', 'Ajmer bus stand'],
    areas: ['Vaishali Nagar', 'Civil Lines', 'Pushkar Road', 'Adarsh Nagar', 'Madar'],
  },
  KOTA: {
    about:
      'A good share of trips out of Kota start from the coaching districts, where students and visiting families stay. Give the hostel or building name with the area — the coaching neighbourhoods are dense and the names repeat.',
    points: ['Kota Junction railway station', 'Nayapura bus stand'],
    areas: ['Talwandi', 'Rajeev Gandhi Nagar', 'Landmark City', 'Kunhadi', 'Mahaveer Nagar', 'Vigyan Nagar'],
  },
  SIKAR: {
    about:
      'Sikar is the main town of its district in Shekhawati, and trips from here often begin in one of the smaller towns around it. A pickup outside Sikar itself is fine — give the town and a landmark.',
    points: ['Sikar Junction railway station', 'Sikar bus stand'],
    areas: ['Piprali Road', 'Station Road', 'Nawalgarh Road', 'Fatehpur Road', 'Radhakishanpura'],
  },
  HARIDWAR: {
    about:
      'Pickups in Haridwar are usually from the station or from a hotel or ashram near the river. Around Har Ki Pauri the roads close to vehicles, especially in the evening and on festival days, so the meeting point is where cars are allowed.',
    points: ['Haridwar Junction railway station', 'Haridwar bus stand'],
    areas: ['Har Ki Pauri', 'Kankhal', 'Jwalapur', 'BHEL Ranipur', 'SIDCUL', 'Bhupatwala'],
  },
  JODHPUR: {
    about:
      'Trips out of Jodhpur start from the old city under the fort, the hotels on the Ratanada side, or the station. The old-city lanes around the clock tower are too tight for a car, so the pickup is at their edge.',
    points: ['Jodhpur Junction railway station', 'Raika Bagh railway station', 'Jodhpur Airport'],
    areas: ['Sardarpura', 'Ratanada', 'Paota', 'Shastri Nagar', 'Chopasni Road'],
  },
  UDAIPUR: {
    about:
      'Many Udaipur hotels sit on the lakes in the old city, reached through lanes a car cannot use; the pickup is at the nearest road. The airport is some way east of the city at Dabok.',
    points: ['Udaipur City railway station', 'Udaipur bus stand'],
    areas: ['Hiran Magri', 'Fatehpura', 'Shobhagpura', 'Bhupalpura', 'Lake Pichola area'],
  },
  LUDHIANA: {
    about:
      'Ludhiana is spread out along the highway and its commercial areas are busy through the day, so an early start makes the first stretch quicker. Give the area and a landmark.',
    points: ['Ludhiana Junction railway station', 'Ludhiana bus stand'],
    areas: ['Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Civil Lines', 'Dugri', 'Ferozepur Road'],
  },
  MOHALI: {
    about:
      'Mohali is addressed by phases and sectors of its own, separate from Chandigarh’s. The international airport serving Chandigarh is on this side, which makes Mohali a common start for airport runs.',
    points: ['Chandigarh International Airport', 'Mohali railway station'],
    areas: ['Phase 3B2', 'Phase 7', 'Phase 10', 'Sector 70', 'Aerocity', 'Kharar'],
  },
  DEHRADUN: {
    about:
      'Pickups in Dehradun are usually from the station, the ISBT on the Haridwar road, or a home or hotel on Rajpur Road. Jolly Grant Airport is outside the city towards Rishikesh.',
    points: ['Dehradun railway station', 'Dehradun ISBT'],
    areas: ['Rajpur Road', 'Clock Tower', 'Clement Town', 'Prem Nagar', 'Sahastradhara Road', 'Ballupur'],
  },
};

/** Where trips out of a city start, or null — never a generic one written to fill the space. */
export function cityPickup(city: string): CityPickup | null {
  return PICKUPS[city] ?? null;
}
