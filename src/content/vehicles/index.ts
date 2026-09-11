/**
 * What each vehicle is, in a few lines a person can use to choose.
 *
 * The eight vehicle pages were 78–92% the same text, because everything on them was said
 * about "the vehicle". What actually separates them is what they are for — and that is the
 * first thing somebody choosing between an Ertiga and an Innova Crysta wants to know.
 *
 * ⚠️ Only what is true of the model itself and checkable: body type, seat rows, where the
 * luggage goes. No model year, no air-conditioning claim, no "most popular", and no luggage
 * count until somebody has measured one with bags in it — `luggage` stays empty until then,
 * and the page says nothing rather than guess.
 */

export interface VehicleNote {
  /** Two or three sentences: what it is and what it suits. */
  about: string;
  /** Measured, e.g. "Two large suitcases and two cabin bags." Absent until measured. */
  luggage?: string;
}

const NOTES: Record<string, VehicleNote> = {
  hatchback: {
    about:
      'The smallest car we send — a hatchback with the boot opening into the cabin. It suits one to three people with a bag each, and short intercity runs where the lowest fare matters more than legroom.',
  },
  dzire: {
    about:
      'A compact sedan, which means a separate boot: luggage rides behind the seats rather than beside the passengers. For four adults on a longer drive, that is the difference that matters over a hatchback.',
  },
  ertiga: {
    about:
      'A three-row MPV that seats six besides the driver. With the third row in use there is only a small space behind it for bags, so six people with full luggage is a tight fit — five with luggage, or six travelling light, is what it does best.',
  },
  crysta: {
    about:
      'The largest of the cars: three rows, six passengers, and more room behind the last row than the Ertiga has. It is the car for a long drive where people and luggage both need space, and it is priced accordingly.',
  },
  tt_12: {
    about:
      'A high-roof van for groups — twelve seats in rows behind the driver, with space at the back for bags. The smallest of the tempo travellers, and the lowest per-km rate of the four vans.',
  },
  tt_14: {
    about:
      'The same high-roof tempo traveller with two more seats. Worth it over the twelve-seater only when the group is thirteen or fourteen: the per-km rate is a rupee higher.',
  },
  tt_16: {
    about:
      'The largest tempo traveller, sixteen seats. For a group that would otherwise need two vehicles, it keeps everybody in one — one driver, one booking, and everyone arriving together.',
  },
  urbania: {
    about:
      "Force's newer van, with the same sixteen seats as the largest tempo traveller. It carries the highest per-km rate of the four vans, so the choice between the two sixteen-seaters comes down to the vehicle rather than the headcount.",
  },
};

/** The note for a vehicle, or null — never a generic one written to fill the space. */
export function vehicleNote(key: string): VehicleNote | null {
  return NOTES[key] ?? null;
}
