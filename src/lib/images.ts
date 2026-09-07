/**
 * Placeholder photography.
 *
 * Every one of these is atmospheric — a road, a horizon, movement. None of them is
 * captioned as a place, and none should be: a stock photograph labelled "Udaipur" that is
 * not Udaipur is simply false, and it is the sort of thing a visitor notices.
 *
 * Swap these for the company's own photographs of its cars and drivers. That single change
 * does more for how this site feels than anything else on the page.
 */
export const IMAGES = {
  heroRoad: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
  openRoad: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d',
  monument: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
} as const;

/** Unsplash sizing, kept in one place so every request asks for what it will actually use. */
export const img = (url: string, w: number, q = 70) =>
  `${url}?auto=format&fit=crop&w=${w}&q=${q}`;
