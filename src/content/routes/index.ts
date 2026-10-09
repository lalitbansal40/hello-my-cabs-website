import { DRIVER_DATA } from './driver.generated';

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

/**
 * One neighbourhood, station or landmark at either end. Every field is a checkable fact about
 * the place — never a drive time or a road from it, which only the drivers can tell us.
 */
export interface Place {
  /** A part of the city: "South-east Jaipur". */
  name: string;
  /** What that part is, in a few words. */
  where: string;
  /** The neighbourhoods in it — the names people book from or to. */
  areas?: ReadonlyArray<string>;
  /** What people name to a driver there. */
  landmarks?: ReadonlyArray<string>;
  /** One line worth knowing before a pickup or a drop there. */
  note?: string;
}

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
  /**
   * The pickup city's neighbourhoods, named so somebody looking for theirs finds it. The fare
   * is city to city, so the list says where the driver comes to — not a price per area.
   */
  pickupAreas?: ReadonlyArray<string>;
  /**
   * The same, written up one place at a time: where in the city it is and the landmarks
   * people give a driver there. Takes the place of `pickupAreas` where it is written. A list
   * of names alone is what Google's spam policy calls keyword stuffing ("blocks of text that
   * list cities and regions"); a line of use about each place is not.
   */
  pickupPlaces?: ReadonlyArray<Place>;
  /** The drop city's places, written up the same way — where people on this route are going. */
  dropPlaces?: ReadonlyArray<Place>;
  /**
   * Places at either end with a route of their own ([pickup, drop] city keys), which are
   * booked as that route rather than as this one. Shown only if the route is listed.
   */
  ownRoutes?: ReadonlyArray<readonly [string, string]>;
  /** Show what a round trip costs over two and three days, from the fare API. */
  multiDay?: boolean;
}

/**
 * Jaipur a part at a time — every neighbourhood people book from or to, each in the one part
 * of the city it belongs to (9 Oct 2026, owner: "sab cover karo"; checked against
 * OpenStreetMap's suburbs). The main ones, not every colony: a longer list of names is what
 * Google calls keyword stuffing. Shared by the routes in and out of the city, so a fix here is
 * a fix on both; each route adds its own line to a part with `withNotes`.
 */
const JAIPUR_PARTS: ReadonlyArray<Place> = [
  {
    name: 'The walled city',
    where: 'The old city, inside the walls',
    areas: ['Johari Bazaar', 'Bapu Bazaar', 'Chandpole', 'Tripolia', 'Ramganj', 'Subhash Chowk', 'Brahmpuri', 'Ghat Gate', 'Surajpol'],
    landmarks: ['Hawa Mahal', 'City Palace', 'Badi Chaupar'],
  },
  {
    name: 'Central Jaipur',
    where: 'South and west of the walls',
    areas: ['C-Scheme', 'MI Road', 'Bani Park', 'Civil Lines', 'Ashok Nagar', 'Lal Kothi', 'Rambagh', 'Sindhi Camp', 'Station Road', 'Hasanpura', 'Panipech', 'Gopalbari', 'Sahakar Marg', '22 Godam', 'Bais Godam', 'Jyoti Nagar'],
    landmarks: ['Statue Circle', 'Albert Hall'],
  },
  {
    name: 'South-east Jaipur',
    where: 'Along JLN Marg and beyond',
    areas: ['Malviya Nagar', 'Jagatpura', 'Bapu Nagar', 'Tilak Nagar', 'Moti Doongri', 'Jawahar Circle', 'Goner Road', 'Mahal Road'],
    landmarks: ['World Trade Park', 'Gaurav Tower', 'MNIT', 'Jagatpura railway station', 'Akshaya Patra temple'],
  },
  {
    name: 'South Jaipur',
    where: 'Along Tonk Road, towards the airport',
    areas: ['Tonk Road', 'Gandhi Nagar', 'Durgapura', 'Barkat Nagar', 'Bajaj Nagar', 'Gopalpura', 'Triveni Nagar', 'Mahesh Nagar', 'Pratap Nagar', 'Sanganer', 'Sitapura', 'Tonk Phatak'],
    landmarks: ['Sitapura industrial area', 'Chokhi Dhani'],
  },
  {
    name: 'South-west Jaipur',
    where: 'Off New Sanganer Road',
    areas: ['Mansarovar', 'Shipra Path', 'Patrakar Colony', 'Shyam Nagar', 'Muhana', 'Kartarpura', 'Devi Nagar', 'Vivek Vihar', 'Shanti Nagar', 'Tagore Nagar', 'Badrawas'],
    landmarks: ['Mansarovar metro station', 'VT Road'],
  },
  {
    name: 'West Jaipur',
    where: 'Along Ajmer Road and Sirsi Road',
    areas: ['Vaishali Nagar', 'Chitrakoot', 'Nirman Nagar', 'Khatipura', 'Sirsi Road', 'Heerapura', 'Sodala', 'Ajmer Road', 'Bhankrota', 'Nandpuri', 'Panchyawala', 'Ram Nagar', 'Sanjay Nagar', 'Nemi Nagar', 'Lalarpura', 'Kanakpura'],
    landmarks: ['Amrapali Circle', 'Gandhi Path'],
  },
  {
    name: 'North and north-west Jaipur',
    where: 'Along Sikar Road, Kalwar Road and Delhi Road',
    areas: ['Jhotwara', 'Niwaru Road', 'Vidyadhar Nagar', 'Shastri Nagar', 'Murlipura', 'Jaisinghpura Khor', 'Amer', 'Ambabari', 'VKI Area'],
    landmarks: ['Amer Fort', 'Jal Mahal'],
  },
  {
    name: 'East Jaipur',
    where: 'Towards Agra Road',
    areas: ['Raja Park', 'Jawahar Nagar', 'Adarsh Nagar', 'Transport Nagar', 'Galta Gate', 'Agra Road'],
    landmarks: ['Galta Ji'],
  },
];

/** Delhi the same way — every suburb inside the state, none of Noida, Gurugram or Ghaziabad. */
const DELHI_PARTS: ReadonlyArray<Place> = [
  {
    name: 'New Delhi',
    where: 'The government quarter and around',
    areas: ['India Gate', 'Connaught Place', 'Chanakyapuri', 'Lodhi Road', 'Khan Market', 'Gole Market', 'Sarojini Nagar', 'Pragati Maidan', 'Golf Links', 'INA', 'Lodhi Colony', 'Moti Bagh', 'Jor Bagh', 'Sunder Nagar', 'Kidwai Nagar', 'Netaji Nagar'],
    landmarks: ['Kartavya Path', 'Rajiv Chowk metro station', 'Lodhi Garden'],
  },
  {
    name: 'Central Delhi',
    where: 'West and north of Connaught Place',
    areas: ['Karol Bagh', 'Paharganj', 'Rajinder Nagar', 'Rajendra Place', 'Patel Nagar', 'Jhandewalan', 'Daryaganj', 'Naraina', 'Inderpuri', 'Anand Parbat'],
    landmarks: ['New Delhi railway station', 'Ajmal Khan Road'],
  },
  {
    name: 'Old Delhi',
    where: 'North of the centre',
    areas: ['Chandni Chowk', 'Sadar Bazar', 'Kashmere Gate', 'Civil Lines', 'Tis Hazari', 'Majnu-ka-tilla'],
    landmarks: ['Red Fort', 'Jama Masjid', 'Old Delhi railway station', 'Sarai Rohilla railway station', 'Kashmere Gate ISBT'],
  },
  {
    name: 'North Delhi',
    where: 'Around the university',
    areas: ['Kamla Nagar', 'Shakti Nagar', 'Mukherjee Nagar', 'Model Town', 'GTB Nagar', 'Kingsway Camp', 'Timarpur', 'Azadpur', 'Burari', 'Gulabi Bagh', 'Wazirabad'],
    landmarks: ['Delhi University North Campus'],
  },
  {
    name: 'North-west Delhi',
    where: 'Rohini and around',
    areas: ['Rohini', 'Pitampura', 'Shalimar Bagh', 'Ashok Vihar', 'Prashant Vihar', 'Keshav Puram', 'Wazirpur', 'Mangolpuri', 'Bawana', 'Narela', 'Alipur', 'Rani Bagh', 'Netaji Subhash Place', 'Jahangir Puri', 'Badli', 'Bhalswa', 'Sultanpuri', 'Swaroop Nagar'],
  },
  {
    name: 'West Delhi',
    where: 'Between the centre and the airport side',
    areas: ['Janakpuri', 'Rajouri Garden', 'Punjabi Bagh', 'Tilak Nagar', 'Vikaspuri', 'Paschim Vihar', 'Uttam Nagar', 'Kirti Nagar', 'Moti Nagar', 'Nangloi', 'Mundka', 'Meera Bagh', 'Mayapuri', 'Hari Nagar', 'Subhash Nagar', 'Tagore Garden', 'Hastsal'],
  },
  {
    name: 'South-west Delhi',
    where: 'Beside the airport',
    areas: ['Dwarka', 'Vasant Kunj', 'Aerocity', 'Mahipalpur', 'Palam', 'Delhi Cantonment', 'Bijwasan', 'Kapashera', 'Najafgarh', 'Dhaula Kuan', 'Sagar Pur', 'Ghitorni', 'Mahavir Enclave', 'Raj Nagar'],
    landmarks: ['DLF Promenade'],
  },
  {
    name: 'South Delhi',
    where: 'South of the centre, towards Gurugram',
    areas: ['Saket', 'Hauz Khas', 'Green Park', 'Malviya Nagar', 'RK Puram', 'Munirka', 'Vasant Vihar', 'South Extension', 'Safdarjung Enclave', 'Kailash Colony', 'Andrews Ganj', 'Shahpur Jat', 'Panchsheel', 'Chirag Delhi'],
    landmarks: ['Select Citywalk', 'Hauz Khas Village'],
  },
  {
    name: 'Mehrauli and Chhatarpur',
    where: 'The far south, towards Gurugram',
    areas: ['Mehrauli', 'Lado Sarai', 'Kishangarh', 'Chhatarpur', 'Satbari', 'Maidan Garhi', 'Neb Sarai', 'Sainik Farm', 'Sangam Vihar', 'Khanpur'],
    landmarks: ['Qutub Minar', 'Chhatarpur temple'],
  },
  {
    name: 'South-east Delhi',
    where: 'Towards the Yamuna and Noida',
    areas: ['Lajpat Nagar', 'Defence Colony', 'Greater Kailash', 'Kalkaji', 'Nehru Place', 'Govindpuri', 'Jangpura', 'Nizamuddin', 'Okhla', 'Jasola', 'Sarita Vihar', 'Tughlakabad', 'Badarpur', 'Chittaranjan Park', 'New Friends Colony', 'Ashram', 'Shaheen Bagh', 'Alaknanda', 'Jamia Nagar'],
    landmarks: ['Lajpat Nagar Central Market', 'Lotus Temple', 'Hazrat Nizamuddin railway station', 'Sarai Kale Khan ISBT'],
  },
  {
    name: 'East Delhi',
    where: 'Across the Yamuna',
    areas: ['Mayur Vihar', 'Laxmi Nagar', 'Preet Vihar', 'Krishna Nagar', 'Geeta Colony', 'Patparganj', 'Indraprastha Extension', 'Anand Vihar', 'Pandav Nagar', 'Vinod Nagar', 'Shakarpur', 'Karkarduma', 'Trilok Puri', 'Kalyan Puri', 'Chilla', 'New Ashok Nagar', 'Ghazipur'],
    landmarks: ['Akshardham', 'Anand Vihar Terminal'],
  },
  {
    name: 'Shahdara',
    where: 'Across the Yamuna, towards Ghaziabad',
    areas: ['Shahdara', 'Gandhi Nagar', 'Vivek Vihar', 'Dilshad Garden', 'Seemapuri'],
  },
  {
    name: 'North-east Delhi',
    where: 'Across the Yamuna, north of Shahdara',
    areas: ['Seelampur', 'Jaffrabad', 'Babarpur', 'Yamuna Vihar', 'Bhajanpura', 'Khajuri', 'Gokulpuri', 'Mustafabad', 'Karawal Nagar', 'Shastri Park', 'Nand Nagri'],
  },
];

/**
 * Agra the same way. OpenStreetMap names few of Agra's suburbs, so these are placed by the
 * ones it does (Taj Ganj south-east of the Fort, Sikandra north-west, Shahganj and Bodla west,
 * Balkeshwar north, Agra Cantonment south-west) and by where the landmarks are.
 */
const AGRA_PARTS: ReadonlyArray<Place> = [
  {
    name: 'Taj Ganj and Fatehabad Road',
    where: 'South-east, around the Taj Mahal',
    areas: ['Taj Ganj', 'Fatehabad Road', 'Basai', 'Tajnagari', 'Nehru Enclave'],
    landmarks: ['Taj Mahal', 'Shilpgram'],
  },
  {
    name: 'Agra Fort and the old city',
    where: 'The centre, by the Yamuna',
    areas: ['Kinari Bazaar', 'Belanganj', 'Subhash Bazaar', 'Rawatpara'],
    landmarks: ['Agra Fort', 'Jama Masjid', 'Agra Fort railway station'],
  },
  {
    name: 'Central Agra',
    where: 'Along MG Road',
    areas: ['Sanjay Place', 'Hari Parwat', 'Civil Lines', 'Raja Ki Mandi', 'Pratappura', 'Wazirpura'],
    landmarks: ['Raja Ki Mandi railway station'],
  },
  {
    name: 'Sadar and Agra Cantt',
    where: 'South-west of the centre',
    areas: ['Sadar Bazaar', 'Agra Cantonment', 'Idgah', 'Shamsabad Road', 'Kheria'],
    landmarks: ['Agra Cantt railway station', 'Idgah bus stand', 'Agra airport'],
  },
  {
    name: 'North Agra',
    where: 'North of the centre, along the river',
    areas: ['Kamla Nagar', 'Balkeshwar', 'Dayal Bagh', 'Khandari'],
    landmarks: ['Dayal Bagh temple'],
  },
  {
    name: 'West Agra',
    where: 'West of the centre',
    areas: ['Shahganj', 'Bodla', 'Lohamandi', 'Shastripuram', 'Awadhpuri', 'Balaji Puram'],
  },
  {
    name: 'Sikandra',
    where: 'North-west, on the Delhi road',
    areas: ['Sikandra', 'Awas Vikas Colony', 'Bichpuri'],
    landmarks: ["Akbar's Tomb"],
  },
  {
    name: 'Across the Yamuna',
    where: 'The east bank',
    areas: ['Trans Yamuna Colony', 'Ram Bagh'],
    landmarks: ['Itimad-ud-Daulah', 'Mehtab Bagh'],
  },
];

/** The parts with this route's own line on some of them, by part name. */
function withNotes(parts: ReadonlyArray<Place>, notes: Record<string, string>): ReadonlyArray<Place> {
  return parts.map((p) => (notes[p.name] ? { ...p, note: notes[p.name] } : p));
}

/**
 * The written notes. Everything here is a general, checkable fact about the destination —
 * what the place is, what people go there for, what to know on arrival. Nothing about our
 * service is claimed here that is not claimed elsewhere on the site.
 */
const CONTENT: Record<string, RouteContent> = {
  'JAIPUR-DELHI': {
    pickupPlaces: JAIPUR_PARTS,
    dropPlaces: withNotes(DELHI_PARTS, {
      'New Delhi': 'In Connaught Place, say inner or outer circle and the block letter.',
      'Central Delhi': 'New Delhi station has two sides, Paharganj and Ajmeri Gate. Say which one.',
      'Old Delhi': 'The main Chandni Chowk road is closed to cars during the day, so the drop is at the nearest road open to them.',
      'North-west Delhi': 'Give the sector (Rohini) or block.',
      'West Delhi': 'Give the block.',
      'South-west Delhi': 'In Dwarka, give the sector number. A drop at the airport itself is its own route.',
      'East Delhi': 'Noida and Ghaziabad are across the state border from here — a drop there is not a Delhi drop.',
      'North-east Delhi': 'Ghaziabad is across the state border from here — a drop there is not a Delhi drop.',
    }),
    ownRoutes: [
      ['JAIPUR', 'DELHI_AIRPORT'],
      ['JAIPUR', 'NOIDA'],
    ],
    multiDay: true,
    arrival:
      'Delhi is a set of cities rather than one — the government quarter around Central Delhi, the markets of Old Delhi, the offices of Gurugram and Noida across the border. Tell the driver the neighbourhood rather than "Delhi", because the difference between Dwarka and Noida is an hour of driving at the wrong time of day. State entry tax at the border is paid as it arises, the same as tolls.',
    faq: [
      {
        q: 'What if I am going to Noida, not Delhi?',
        a: 'Book Noida as the drop. It is priced as its own journey from Jaipur, and the fare on that page is the one that applies — a Delhi fare does not stretch to cover a drop across the border.',
      },
      {
        q: 'Can I be picked up from Jagatpura, Mansarovar or Vaishali Nagar?',
        a: 'Yes. The driver comes to the address you give anywhere in Jaipur, and the fare to Delhi is the same from every part of the city. Name the area and a landmark when you book.',
      },
      {
        q: 'Can you drop me at India Gate or Connaught Place?',
        a: 'Yes. Both are in Delhi, so book Delhi as the drop, and give the landmark or the address you are going to.',
      },
      {
        q: 'Which station in Delhi should I be dropped at?',
        a: 'Delhi has three main railway stations — New Delhi, Old Delhi and Hazrat Nizamuddin — and they are far apart. Check which one is on your ticket. For New Delhi, say whether you want the Paharganj side or the Ajmeri Gate side.',
      },
      {
        q: 'Which road does the Jaipur to Delhi cab take?',
        a: 'The usual run is the Jaipur–Delhi highway through Rajasthan into Haryana. Which way the driver turns at the Delhi end depends on where you are being dropped and the time of day.',
      },
    ],
  },

  'DELHI-JAIPUR': {
    pickupPlaces: withNotes(DELHI_PARTS, {
      'New Delhi': 'In Connaught Place, say inner or outer circle and the block letter.',
      'Central Delhi': 'For a pickup at New Delhi station, say which side — Paharganj or Ajmeri Gate — and add the train number.',
      'Old Delhi': 'The main Chandni Chowk road is closed to cars during the day, so the pickup is at the nearest road open to them.',
      'North-west Delhi': 'Give the sector (Rohini) or block.',
      'West Delhi': 'Give the block.',
      'South-west Delhi': 'In Dwarka, give the sector number. A pickup at the airport itself is its own route.',
      'East Delhi': 'Noida and Ghaziabad are across the state border from here — a pickup there is booked from that city, not from Delhi.',
      'North-east Delhi': 'Ghaziabad is across the state border from here — a pickup there is booked from Ghaziabad, not from Delhi.',
    }),
    dropPlaces: withNotes(JAIPUR_PARTS, {
      'The walled city': 'The drop is at the nearest gate or main road — the lanes inside the walls are narrow.',
      'Central Jaipur': 'Jaipur Junction and the Sindhi Camp bus stand are here, for an onward train or bus.',
      'South Jaipur': 'Durgapura station and the airport are at this end of the city.',
    }),
    ownRoutes: [
      ['DELHI_AIRPORT', 'JAIPUR'],
      ['NOIDA', 'JAIPUR'],
    ],
    multiDay: true,
    arrival:
      'Jaipur sits inside a ring of walls that were built for a smaller city, and the old town inside them is where most visitors are heading — Hawa Mahal, the City Palace, the bazaars around Badi Chaupar. Those lanes are narrow and slow; a car will get you to the gate rather than to the door. Hotels are mostly outside the walls, towards Civil Lines and Tonk Road, where the traffic moves.',
    faq: [
      {
        q: 'Can the driver wait and bring us back to Delhi the same day?',
        a: 'Yes, but book it as a round trip rather than two one-way journeys — one booking covers the wait and the return, and it is priced for the whole journey.',
      },
      {
        q: 'Can I be picked up from Rohini, Dwarka or Lajpat Nagar?',
        a: 'Yes. The driver comes to the address you give anywhere in Delhi, and the fare to Jaipur is the same from every part of the city. Name the area and a landmark when you book.',
      },
      {
        q: 'Can you drop me in Malviya Nagar, Mansarovar or Vaishali Nagar?',
        a: 'Yes. The drop is at the address you give anywhere in Jaipur. Give the area and a landmark — and for the old city, which gate.',
      },
      {
        q: 'Is a Delhi to Jaipur cab available at night?',
        a: 'Yes. The road runs all night, and leaving Delhi before dawn gets you out ahead of the city traffic. A night allowance applies after 10 pm, and it is listed with the fare before you book.',
      },
    ],
  },

  'DELHI-AGRA': {
    pickupPlaces: withNotes(DELHI_PARTS, {
      'New Delhi': 'In Connaught Place, say inner or outer circle and the block letter.',
      'Central Delhi': 'For a pickup at New Delhi station, say which side — Paharganj or Ajmeri Gate — and add the train number.',
      'Old Delhi': 'The main Chandni Chowk road is closed to cars during the day, so the pickup is at the nearest road open to them.',
      'North-west Delhi': 'Give the sector (Rohini) or block.',
      'West Delhi': 'Give the block.',
      'South-west Delhi': 'In Dwarka, give the sector number. A pickup at the airport itself is its own route.',
      'East Delhi': 'Noida and Ghaziabad are across the state border from here — a pickup there is booked from that city, not from Delhi.',
      'North-east Delhi': 'Ghaziabad is across the state border from here — a pickup there is booked from Ghaziabad, not from Delhi.',
    }),
    dropPlaces: withNotes(AGRA_PARTS, {
      'Agra Fort and the old city': 'The bazaar lanes are narrow — give the nearest main road.',
    }),
    arrival:
      'Agra is a day out for most people who drive it: the Taj Mahal, Agra Fort, and back the same evening. The monuments are closed to traffic at the gates, so the drop is at the nearest parking and it is a short walk or a battery-rickshaw the rest of the way. The Taj is shut on Fridays, which is the one thing worth checking before booking the car.',
    faq: [
      {
        q: 'Can the driver wait while we see the Taj Mahal?',
        a: 'Yes. Book it as a round trip — the wait and the return are part of the one journey. Parking at the monument is paid as it arises, like tolls.',
      },
    ],
  },

  'AGRA-DELHI': {
    pickupPlaces: withNotes(AGRA_PARTS, {
      'Sadar and Agra Cantt': 'For a station pickup, add the train number.',
    }),
    dropPlaces: withNotes(DELHI_PARTS, {
      'New Delhi': 'In Connaught Place, say inner or outer circle and the block letter.',
      'Central Delhi': 'New Delhi station has two sides, Paharganj and Ajmeri Gate. Say which one.',
      'Old Delhi': 'The main Chandni Chowk road is closed to cars during the day, so the drop is at the nearest road open to them.',
      'South-west Delhi': 'In Dwarka, give the sector number. A drop at the airport itself is its own route.',
      'East Delhi': 'Noida and Ghaziabad are across the state border from here — a drop there is not a Delhi drop.',
    }),
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
        a: 'Yes — book Rishikesh as the destination rather than Haridwar. It is a separate journey with its own fare, and booking it that way means the driver plans for the whole run.',
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
/**
 * Questions only one route has — what people on THIS trip ask, answered with general,
 * checkable facts about the places on it (2 Oct 2026). Added after the route's own `faq`.
 *
 * ⚠️ The same rule as everything here: nothing guessed. A stop is named only when it is a
 * well-known place on or beside the road; no price, timing or road detail is claimed that
 * the fare API or the drivers do not give. A stop is never priced online (lib/stops.ts) —
 * the answers say so.
 */
const STOP_NOTE = 'Add it under "Add a stop on the way" when you book; the fare shown is the direct route\'s, and the desk calls to confirm what the stop adds.';

const ROUTE_FAQ: Record<string, ReadonlyArray<{ q: string; a: string }>> = {
  'JAIPUR-DELHI': [
    { q: 'Can I stop at Neemrana on the way?', a: `Neemrana, with its fort on the hillside, is beside the Jaipur–Delhi highway near the Rajasthan–Haryana border. ${STOP_NOTE}` },
    { q: 'Can I be dropped in Gurugram instead of Delhi?', a: 'Yes. Gurugram is on the way into Delhi from Jaipur — give the Gurugram address as the drop when you book, and the fare for it is shown before you confirm.' },
  ],
  'DELHI-JAIPUR': [
    { q: 'Can I stop at Neemrana on the way?', a: `Neemrana, with its fort on the hillside, is beside the Delhi–Jaipur highway just inside Rajasthan. ${STOP_NOTE}` },
    { q: 'Can I be collected in Gurugram rather than Delhi?', a: 'Yes. Book Gurugram as the pickup and the fare for it is shown before you confirm — Gurugram is on the way out of Delhi towards Jaipur.' },
  ],
  'DELHI-AGRA': [
    { q: 'Can I see Agra and be back in Delhi the same day?', a: 'Yes — most people do. Book the same-day round trip from the table above and leave early: the Taj Mahal opens at sunrise, and it is closed on Fridays.' },
    { q: 'Can I stop at Mathura or Vrindavan?', a: `Both are close to the road between Delhi and Agra. ${STOP_NOTE}` },
  ],
  'AGRA-DELHI': [
    { q: 'Can I stop at Mathura or Vrindavan on the way back?', a: `Both are close to the road between Agra and Delhi. ${STOP_NOTE}` },
  ],
  'DELHI-HARIDWAR': [
    { q: 'Can I carry on to Rishikesh?', a: 'Rishikesh is a short way further up the Ganga from Haridwar. Book Rishikesh as the drop, or add it as a stop, and the desk confirms the fare before the trip.' },
    { q: 'Can I stay for the evening Ganga aarti and come back the same day?', a: 'Yes. The aarti at Har Ki Pauri is held at sunset. On a round trip the car stays with you, so staying for it only means a later return to Delhi; staying the night is priced as a two-day round trip.' },
  ],
  'HARIDWAR-DELHI': [
    { q: 'Can I leave after the evening Ganga aarti?', a: 'Yes. The aarti at Har Ki Pauri is held at sunset; set the pickup time for after it and allow time to walk back to where cars are allowed.' },
  ],
  'DELHI-CHANDIGARH': [
    { q: 'Can the car take us on to the hills?', a: 'Chandigarh is where the roads to Shimla, Kasauli and Manali begin. If the hills are where you are going, book that town as the drop rather than Chandigarh — hill driving is priced on its own, and you see that fare before you confirm.' },
  ],
  'JAIPUR-CHANDIGARH': [
    { q: 'Can the car take us on to the hills?', a: 'Chandigarh is where the roads to Shimla, Kasauli and Manali begin. If the hills are where you are going, book that town as the drop rather than Chandigarh — hill driving is priced on its own, and you see that fare before you confirm.' },
  ],
  'JAIPUR-AJMER': [
    { q: 'Can I add Pushkar?', a: `Pushkar is just beyond Ajmer, over the hill — most people who come this far see both. ${STOP_NOTE}` },
  ],
  'AJMER-JAIPUR': [
    { q: 'Can I see Pushkar before leaving?', a: 'Pushkar is just outside Ajmer, over the hill. Book Pushkar as the pickup, or add it as a stop, and the desk confirms the fare before the trip.' },
  ],
  'JAIPUR-AGRA': [
    { q: 'Can I stop at Fatehpur Sikri or the Abhaneri stepwell?', a: `Fatehpur Sikri is on the road into Agra, and the Chand Baori stepwell at Abhaneri is a short detour off it in Dausa district. ${STOP_NOTE}` },
  ],
  'AGRA-JAIPUR': [
    { q: 'Can I stop at Fatehpur Sikri or the Abhaneri stepwell?', a: `Fatehpur Sikri is on the road out of Agra towards Jaipur, and the Chand Baori stepwell at Abhaneri is a short detour off it in Dausa district. ${STOP_NOTE}` },
  ],
  'JAIPUR-DELHI_AIRPORT': [
    { q: 'How early should I leave Jaipur for a flight?', a: 'Take the drive time on this page and add the time your airline asks you to be at the terminal — usually about two hours before a domestic flight and three before an international one — and leave some room for traffic into Delhi.' },
  ],
};

export function routeContent(pickup: string, drop: string): RouteContent {
  const key = `${pickup}-${drop}`;
  const base = CONTENT[key] ?? {};
  const own = ROUTE_FAQ[key];
  const written: RouteContent = own ? { ...base, faq: [...(base.faq ?? []), ...own] } : base;
  // What drivers reported comes from the generated file, never typed in here. A hand-written
  // `driver` entry, if one exists, still wins — it is somebody's deliberate correction.
  const driver = written.driver ?? DRIVER_DATA[key];
  return driver ? { ...written, driver } : written;
}

/** How many routes have been written up, for the scorecard. */
export const WRITTEN_ROUTES = Object.keys(CONTENT).length;
