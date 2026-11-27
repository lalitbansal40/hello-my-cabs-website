import { HI_CITY } from './index';

/**
 * One Hindi sentence on Wave 1 route and city pages (27 Nov 2026, PROMPT_KEYWORD_FILES_27NOV
 * Step 4): the owner's keyword file has Hindi searches ("जयपुर से दिल्ली टैक्सी", "खाटू श्याम जी
 * टैक्सी"). Hand-written templates; every number comes from the API at render. Shown only when
 * HINDI_REVIEWED (lib/indexing-tiers.ts) is true — a Hindi reader checks these first (owner E7).
 * Returns null for a place without a Hindi name: no machine transliteration.
 */
const num = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function hiRouteLine(pickup: string, drop: string, fromRupees: number, km?: number | null): string | null {
  const a = HI_CITY[pickup];
  const b = HI_CITY[drop];
  if (!a || !b || !(fromRupees > 0)) return null;
  return `${a} से ${b} टैक्सी का किराया ${num(fromRupees)} से (वन वे)${km ? `, ${km} किमी` : ''}। ड्राइवर और ईंधन शामिल, किराया बुकिंग के समय तय।`;
}

export function hiCityLine(city: string, phone: string): string | null {
  const c = HI_CITY[city];
  if (!c) return null;
  if (city === 'KHATU_SHYAM_JI') return `खाटू श्याम जी टैक्सी — जयपुर, दिल्ली और रींगस स्टेशन से। 24 घंटे: ${phone}`;
  return `${c} में टैक्सी सेवा — आउटस्टेशन, वन वे और लोकल। 24 घंटे: ${phone}`;
}
