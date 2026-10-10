/**
 * A photograph of each city we drive to, shown beside its name on the fares page, the route
 * pages and the details step (owner, 10 Oct 2026).
 *
 * Every one is from Wikimedia Commons under a free licence — never from a search engine or
 * another site. Each file in public/img/cities is the original cropped to 4:3 and resized to
 * 640×480 WebP; CC BY and CC BY-SA ask for the author, the licence and the source to be named
 * and the changes said, which /photo-credits does for all of them. CC0 asks for nothing, but
 * is listed there too.
 *
 * A city with no entry here has no photo, and the banner shows nothing on its side rather
 * than an empty box.
 */

export interface CityImage {
  /** The city key, as the backend names it. */
  key: string;
  /** Under public/. */
  file: string;
  alt: string;
  /** The author, as the file page names them. */
  credit: string;
  license: 'CC0' | 'CC BY 4.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0';
  /** The file page on Wikimedia Commons. */
  sourceUrl: string;
}

export const LICENSE_URL: Record<CityImage['license'], string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

export const CITY_IMAGES: CityImage[] = [
  {
    key: 'AGRA',
    file: '/img/cities/agra.webp',
    alt: 'The Taj Mahal, Agra',
    credit: 'Yann; edited by King of Hearts',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Taj Mahal, Agra, India edit2.jpg'),
  },
  {
    key: 'AJMER',
    file: '/img/cities/ajmer.webp',
    alt: 'A pavilion on Ana Sagar lake at sunset, Ajmer',
    credit: 'Logawi',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Ana Sagar pavilion sunset 2016.jpg'),
  },
  {
    key: 'CHANDIGARH',
    file: '/img/cities/chandigarh.webp',
    alt: 'Boats on Sukhna Lake, Chandigarh',
    credit: 'Navneet Sharma',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Sukhna Lake Chandigarh Evening.jpg'),
  },
  {
    key: 'DEHRADUN',
    file: '/img/cities/dehradun.webp',
    alt: 'The Forest Research Institute, Dehradun',
    credit: 'DesiBoy101',
    license: 'CC BY 4.0',
    sourceUrl: commons('Forest Research Institute in Dehradun 54.jpg'),
  },
  {
    key: 'DELHI',
    file: '/img/cities/delhi.webp',
    alt: 'India Gate, New Delhi',
    credit: 'Nikhilb239',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('India Gate, New Delhi from West.jpg'),
  },
  {
    key: 'DELHI_AIRPORT',
    file: '/img/cities/delhi-airport.webp',
    alt: 'Inside Terminal 3, Delhi Airport',
    credit: 'PDXDUS',
    license: 'CC0',
    sourceUrl: commons('Inside Terminal 3 at Indira Gandhi International Airport.JPG'),
  },
  {
    key: 'HARIDWAR',
    file: '/img/cities/haridwar.webp',
    alt: 'Har Ki Pauri on the Ganga, Haridwar',
    credit: 'आशीष भटनागर',
    license: 'CC BY-SA 3.0',
    sourceUrl: commons('Har ki Pauri, Haridwar 2.jpg'),
  },
  {
    key: 'JAIPUR',
    file: '/img/cities/jaipur.webp',
    alt: 'Hawa Mahal, Jaipur',
    credit: 'Chainwit.',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('East facade Hawa Mahal Jaipur from ground level (July 2022) - img 01.jpg'),
  },
  {
    key: 'JODHPUR',
    file: '/img/cities/jodhpur.webp',
    alt: 'Mehrangarh Fort, Jodhpur',
    credit: 'Yann',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Mehrangarh Fort 2, Jodhpur, Rajasthan, India.jpg'),
  },
  {
    key: 'KOTA',
    file: '/img/cities/kota.webp',
    alt: 'The Garh Palace, Kota',
    credit: 'Shrikant Bansod',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Kotah Garh, City Palace, Kota, Rajasthan (1).jpg'),
  },
  {
    key: 'LUDHIANA',
    file: '/img/cities/ludhiana.webp',
    alt: 'The Ghanta Ghar clock tower, Ludhiana',
    credit: 'Ranjity',
    license: 'CC0',
    sourceUrl: commons('Ghanta Ghar Ludhiana.jpg'),
  },
  {
    key: 'MOHALI',
    file: '/img/cities/mohali.webp',
    alt: 'The PCA cricket stadium, Mohali',
    credit: 'DeepArjunSingh',
    license: 'CC BY-SA 3.0',
    sourceUrl: commons('PCA Stadium, Mohali 1.jpg'),
  },
  {
    key: 'NOIDA',
    file: '/img/cities/noida.webp',
    alt: 'Noida at night, Sector 50 and 75',
    credit: 'SeekeroftheCosmos',
    license: 'CC0',
    sourceUrl: commons('Noida Sector 50 75 Skyline.jpg'),
  },
  {
    key: 'SIKAR',
    file: '/img/cities/sikar.webp',
    alt: 'Harshnath temple, Sikar',
    credit: 'Raj Jalindra',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('Harshnath Temple-Sikar-Rajasthan-DSC0007.jpg'),
  },
  {
    key: 'UDAIPUR',
    file: '/img/cities/udaipur.webp',
    alt: 'The City Palace over Lake Pichola, Udaipur',
    credit: 'Jakub Hałun',
    license: 'CC BY-SA 4.0',
    sourceUrl: commons('20191207 Lake Pichola, City Palace, Udaipur, 1516 7254.jpg'),
  },
];

const BY_KEY = new Map(CITY_IMAGES.map((c) => [c.key, c]));

/** The photo for a city key, or undefined — there is no stand-in. */
export const cityImage = (key?: string | null) => (key ? BY_KEY.get(key) : undefined);
