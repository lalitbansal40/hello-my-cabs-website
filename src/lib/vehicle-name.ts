/**
 * The name of a vehicle, from the key a booking stores.
 *
 * A booking carries `vehicleType`, which is a key: `tt_14`, `crysta`, `sedan`. The trips
 * list and the booking page were printing those keys at the customer — a person who booked
 * an Innova Crysta was shown "crysta", and one who booked a tempo traveller was shown
 * "tt_14", which reads like a reference number.
 *
 * The live catalogue is the first source: pass the labels from `api.vehicles()` and they
 * win. The table below covers the keys the catalogue no longer lists — bookings made in the
 * app years ago still have them, and those trips are in this list forever. Anything else
 * falls back to the key with its underscores opened out, which at least reads as words.
 */
const KNOWN: Record<string, string> = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  dzire: 'Dzire',
  ertiga: 'Ertiga',
  suv: 'SUV',
  innova: 'Innova',
  crysta: 'Innova Crysta',
  tempo_traveller: 'Tempo Traveller',
  tt_12: 'Tempo Traveller (12 seater)',
  tt_14: 'Tempo Traveller (14 seater)',
  tt_16: 'Tempo Traveller (16 seater)',
  urbania: 'Force Urbania (16 seater)',
  bus: 'Bus',
};

export function vehicleName(key: string | undefined, labels?: Record<string, string>): string {
  if (!key) return '';
  return (
    labels?.[key] ??
    KNOWN[key] ??
    key
      .split('_')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  );
}

/** `{ crysta: 'Innova Crysta', … }` from whatever the catalogue is serving today. */
export function labelMap(vehicles: { key: string; label: string }[]): Record<string, string> {
  return Object.fromEntries(vehicles.map((v) => [v.key, v.label]));
}
