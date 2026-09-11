import type { MetadataRoute } from 'next';

/**
 * The web app manifest.
 *
 * Not because this is an app — the real app is on the Play Store — but because a phone
 * that is asked to keep a shortcut to this site should get the brand's icon and colours
 * rather than a screenshot of the page, and because the icons declared here are the ones
 * search and share surfaces fall back to when nothing better is offered.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hello My Cab — outstation taxi',
    short_name: 'Hello My Cab',
    description:
      'Outstation cabs with a driver, at a fare agreed before you travel. One way, round trip or by the hour.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F5EF',
    theme_color: '#0B2C22',
    lang: 'en-IN',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
