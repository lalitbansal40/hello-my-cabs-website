import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/lib/schema';
import { fitDescription, fitTitle } from '@/lib/seo';
import { GUIDES, guideBySlug, guidePath } from '@/content/guides';
import { OneWayOrRoundTrip } from '@/components/guides/OneWayOrRoundTrip';
import { GroupVehicle } from '@/components/guides/GroupVehicle';

export const revalidate = 86_400;
// Only the guides that are written. A guessed slug is a 404, not an empty article.
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

const BODIES: Record<string, () => Promise<React.ReactNode>> = {
  'one-way-or-round-trip': OneWayOrRoundTrip,
  'group-travel-which-vehicle': GroupVehicle,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  const title = fitTitle(g.title, [' | Hello My Cab']);
  return {
    title: { absolute: title },
    description: fitDescription(g.description),
    alternates: { canonical: guidePath(g.slug) },
    openGraph: { type: 'article', title: g.title, url: guidePath(g.slug) },
  };
}

const long = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  const Body = g ? BODIES[g.slug] : undefined;
  if (!g || !Body) notFound();

  const others = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: g.title,
          description: g.description,
          path: guidePath(g.slug),
          published: g.published,
          updated: g.updated,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: g.title, path: guidePath(g.slug) },
        ])}
      />
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 lg:pb-20 lg:pt-16">
          <nav
            aria-label="Breadcrumb"
            className="text-small text-white/45 [&_a]:-my-3 [&_a]:inline-block [&_a]:py-3"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-white">
              Guides
            </Link>
          </nav>
          <h1 className="font-display mt-6 text-balance text-h1">{g.title}</h1>
          <p className="mt-5 max-w-xl text-pretty text-lead text-white/75">{g.description}</p>
          <p className="mt-8 border-t border-white/10 pt-6 text-label uppercase text-white/40">
            {g.updated === g.published
              ? `Published ${long(g.published)}`
              : `Updated ${long(g.updated)}`}
            {' · '}Fares from our own fare table
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-16 lg:pt-20">
        <article className="guide">{await Body()}</article>

        {others.length > 0 ? (
          <aside className="mt-20 border-t border-line pt-10">
            <h2 className="font-display text-h3">More guides</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={guidePath(o.slug)}
                    className="flex min-h-11 items-center text-body font-semibold text-forest hover:text-accent"
                  >
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
