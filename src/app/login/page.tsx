import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { getCurrentUser } from '@/lib/session';
import { safeNextPath } from '@/lib/next-path';
import { SignInForm } from '@/components/SignInForm';

// A sign-in page has nothing to rank for and should not compete with the pages that do.
// It is not in the sitemap either.
export const metadata: Metadata = {
  title: 'Sign in · Hello My Cab',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const next = safeNextPath(q.next);

  // Already signed in — there is nothing to do here, whatever the account: drivers and
  // admins book and see their trips on this site too (2 Oct 2026).
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <>
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-12 sm:pb-16">
          <h1 className="font-display text-h1 text-balance">
            Sign in
          </h1>
          <p className="mt-4 text-lead max-w-md text-white/70 text-pretty">
            Your number is your account. We send a code — there is no password to remember.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-md px-5 pb-24 pt-12">
        <SignInForm next={next} />
      </main>

      <Footer />
    </>
  );
}
