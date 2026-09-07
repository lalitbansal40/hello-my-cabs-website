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
          <nav aria-label="Breadcrumb" className="text-[13px] text-white/45">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{title}</span>
          </nav>

          <h1 className="font-display mt-6 text-[2.5rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-white/75">{intro}</p>
          {updated ? (
            <p className="mt-8 border-t border-white/10 pt-6 text-[13px] uppercase tracking-[0.12em] text-white/40">
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
      <h2 className="font-display text-[1.6rem] leading-[1.2] tracking-[-0.02em] sm:text-[2rem]">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-4 text-[16px] leading-[1.7] text-ink-soft">
        {children}
      </div>
    </section>
  );
}
