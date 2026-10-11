import { cityImage } from '@/content/city-images';
import { cityTitle } from './slug';
import type { OgCity } from './og';
import { OG_PHOTOS } from './og-photos.generated';

/** City keys → the cities a share card shows: the name, and the photo if there is one. */
export function ogCities(keys: string[]): OgCity[] {
  return keys.map((key) => {
    const img = cityImage(key);
    return { name: cityTitle(key), photo: (img && OG_PHOTOS[img.file]) || null };
  });
}
