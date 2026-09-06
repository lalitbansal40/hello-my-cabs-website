import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { env } from '@/lib/env';
import './globals.css';

// Self-hosted by next/font: no render-blocking request to Google, and no layout shift
// when the face swaps in. Both are measured by Core Web Vitals, which is a ranking input.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
  themeColor: '#0b0b0c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
