import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { GUIDE_IMAGES } from '@/lib/images';
import { DocPage } from '@/components/site/DocPage';
import { IconTile } from '@/components/site/IconTile';
import { Icon } from '@/components/site/Icons';
import { GUIDES, guidePath } from '@/content/guides';

export const metadata: Metadata = {
  title: { absolute: 'Guides — Outstation Taxi Questions Answered' },
  description:
    'Plain answers to the questions that come before a booking — one way or round trip, which vehicle for a group — worked out from our own fares.',
  alternates: { canonical: '/guides' },
};

export default function GuidesIndex() {
  return (
    <DocPage
      title="Guides"
      intro="The questions that come before a booking, answered with the figures rather than with advice. Every number is from the fare table the route pages use."
      path="/guides"
    >
      {/* Two abreast from `sm` up, and each one a card that answers a tap. A stacked list
          of two items on a page this wide read as an afterthought. */}
      <ul className="reveal grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li
            key={g.slug}
            className="row-lift rounded-2xl border border-line bg-surface-raised p-6"
          >
            {/* The guide's cover (lib/images GUIDE_IMAGES); the icon where there is none. */}
            {GUIDE_IMAGES[g.slug] ? (
              <div className="relative -mx-2 -mt-2 mb-5 aspect-[3/2] overflow-hidden rounded-xl">
                <Image
                  src={GUIDE_IMAGES[g.slug].src}
                  alt={GUIDE_IMAGES[g.slug].alt}
                  fill
                  sizes="(min-width: 768px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <IconTile>
                <Icon.route className="h-5 w-5" />
              </IconTile>
            )}
            <Link
              href={guidePath(g.slug)}
              className="font-display text-h3 text-forest hover:text-accent"
            >
              {g.title}
            </Link>
            <p className="mt-2 max-w-measure text-pretty text-body text-muted">{g.description}</p>
          </li>
        ))}
      </ul>
    </DocPage>
  );
}
