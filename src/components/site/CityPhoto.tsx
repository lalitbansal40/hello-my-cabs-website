'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * A city photo that is not asked for until the page has finished loading.
 *
 * `loading="lazy"` was not enough: the banner sits inside the first screen, so the browser
 * fetched both photos straight away, and they queued in front of the fonts and scripts the
 * heading waits on — every route page lost a point and up to 0.2 s of LCP (Lighthouse, 10
 * Oct 2026). Until then the box is already its final size, so nothing moves when the photo
 * arrives (CLS 0), and without JavaScript the empty box is all there is.
 */
export function CityPhoto({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const go = () => {
      const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 200));
      idle(() => setShow(true));
    };
    if (document.readyState === 'complete') go();
    else {
      window.addEventListener('load', go, { once: true });
      return () => window.removeEventListener('load', go);
    }
  }, []);

  return show ? (
    <Image src={src} alt={alt} width={640} height={480} sizes={sizes} className={className} />
  ) : (
    <div role="img" aria-label={alt} className={className} />
  );
}
