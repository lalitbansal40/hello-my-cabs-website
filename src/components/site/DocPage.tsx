import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { JsonLd, breadcrumbSchema } from '@/lib/schema';

/**
 * The shell every written page uses — policies, contact, about.
 *
 * These pages exist because somebody is deciding whether to trust us with money, so they
 * cannot look like an afterthought bolted onto a designed site. They get the same dark
 * masthead and the same ivory ground as everything else; only the hero is short, because
 * there is nothing to sell here.
 *
 * The header is dark, so it needs something dark beneath it. That is the whole reason the
 * hero band exists on a page that is otherwise prose.
 */
export function DocPage({
  title,
  intro,
  updated,
  path,
  children,
}: {
  title: string;
  intro: string;
  /** Omitted on pages that are not a policy — About and Contact do not need a date. */
  updated?: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: title, path },
        ])}
      />
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 lg:pb-20 lg:pt-16">
          <nav aria-label="Breadcrumb" className="text-white/45 text-small [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{title}</span>
          </nav>

          <h1 className="font-display text-h1 mt-6 text-balance">
            {title}
          </h1>
          <p className="mt-5 text-lead max-w-xl text-white/75 text-pretty">{intro}</p>
          {updated ? (
            <p className="mt-8 text-label border-t border-white/10 pt-6 uppercase text-white/40">
              Last updated {updated}
            </p>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-16 lg:pt-20">{children}</main>

      <Footer />
    </>
  );
}

/** A titled block of prose. Kept here so every policy page breaks identically. */
export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-9 first:border-t-0 first:pt-0 [&+&]:mt-12">
      <h2 className="font-display text-h3 text-balance">
        {title}
      </h2>
      <div className="mt-5 text-body flex flex-col gap-4 text-ink-soft max-w-measure text-pretty">
        {children}
      </div>
    </section>
  );
}
