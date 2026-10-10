import type { Metadata } from 'next';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { CITY_IMAGES, LICENSE_URL } from '@/content/city-images';
import { cityTitle } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Photo credits',
  description: 'Who took the photographs of the cities on this site, and the licence each is used under.',
  alternates: { canonical: '/photo-credits' },
  // A list of names and licences — worth a link, not a search result.
  robots: { index: false, follow: true },
};

/**
 * The credit every city photograph asks for (content/city-images.ts). CC BY and CC BY-SA
 * require the author, the licence and the source to be named, and any change to be said;
 * the files here are cropped and resized from the originals, so this page says that too.
 */
export default function PhotoCreditsPage() {
  return (
    <DocPage
      title="Photo credits"
      intro="The photographs of the cities on this site are from Wikimedia Commons, used under the licence each one was published with."
      path="/photo-credits"
    >
      <DocSection title="The cities">
        <ul className="space-y-3">
          {CITY_IMAGES.map((c) => (
            <li key={c.key}>
              <strong>{cityTitle(c.key)}</strong> — {c.alt}. Photo by {c.credit},{' '}
              <a href={LICENSE_URL[c.license]} rel="license noopener" target="_blank">
                {c.license}
              </a>
              , from{' '}
              <a href={c.sourceUrl} rel="noopener" target="_blank">
                Wikimedia Commons
              </a>
              .
            </li>
          ))}
        </ul>
      </DocSection>
      <DocSection title="What we changed">
        <p>
          Each photograph is cropped to 4:3 and made smaller for the web. Nothing else is
          changed. Where a licence is CC BY-SA, our cropped version is shared under the same
          licence.
        </p>
      </DocSection>
    </DocPage>
  );
}
