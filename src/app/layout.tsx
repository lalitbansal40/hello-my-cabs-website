import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { env } from '@/lib/env';
import './globals.css';
import { Analytics } from '@/components/site/Analytics';
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/schema';

/**
 * Two faces, two jobs.
 *
 * Inter for everything a person has to read quickly. Poppins carries the headlines: round,
 * geometric and bold, the same family of shapes as the letters in the logo — which is what
 * makes a heading look like this company rather than a template.
 *
 * Both self-hosted by next/font: no render-blocking request to Google, and no layout shift
 * when the face swaps in. Both are measured by Core Web Vitals, which is a ranking input.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const display = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  // Poppins is not a variable font, so each weight is its own file. Headlines only ever
  // use bold, so only bold is fetched: the Latin file is 7.8 kB (the Fraunces file it
  // replaced was 84 kB).
  weight: '700',
  // Not preloaded: no heading is the largest element on a page, so the first paint does
  // not wait for it. The headlines swap in against a metric-matched fallback.
  preload: false,
});

/**
 * `metadataBase` is what turns every relative canonical and OG image into an absolute URL.
 * Without it Next emits relative ones, which crawlers and social scrapers resolve against
 * whatever host served the page — including preview deployments, which then compete with
 * production for the same keywords.
 */
export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'Hello My Cab — outstation cabs, one way and round trip',
    template: '%s | Hello My Cab',
  },
  description:
    'Book an outstation cab with a driver — one way, round trip or hourly. Fixed fares, no surge, verified drivers.',
  applicationName: 'Hello My Cab',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  // icon.svg and apple-icon.png are picked up from app/ automatically; favicon.ico is
  // named here because Google reads a 48px raster for the icon beside a search result and
  // some older readers never ask for the SVG at all.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Hello My Cab',
    locale: 'en_IN',
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff', // the header is white — the phone's status bar meets it
  width: 'device-width',
  initialScale: 1,
  // The page paints under the notch and the home indicator instead of being letterboxed
  // between them. Everything that touches an edge — the header, the menu, the Book bar —
  // pads itself with env(safe-area-inset-*), so nothing lands under the hardware.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${display.variable}`}>
      <body>
        {/* On every page, not only the home page. These two nodes are what the rest of the
            site's structured data points at by @id — a Service on a route page is only
            "provided by Hello My Cab" if the organisation it names is somewhere a crawler
            reading that page can see. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
