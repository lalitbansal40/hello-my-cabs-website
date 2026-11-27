'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * GA4, only on public pages (27 Nov 2026). Pages whose URL carries a token or a person's
 * booking — the driver survey, the rating link, short links, bookings, login — never load it,
 * so no token reaches a third party.
 */
const PRIVATE = /^\/(driver|rate|r|c|bookings?|login|api)(\/|$)/;

export function Ga4({ id }: { id: string }) {
  const path = usePathname() ?? '/';
  if (PRIVATE.test(path)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(id)},{anonymize_ip:true});`}
      </Script>
    </>
  );
}
