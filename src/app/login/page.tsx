import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { getCurrentUser } from '@/lib/session';
import { safeNextPath } from '@/lib/next-path';
import { SignInForm } from '@/components/SignInForm';
import { NotACustomer } from '@/components/site/NotACustomer';

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

  // Already signed in — there is nothing to do here. Unless the account is not a
  // customer's, in which case sending them on lands them on a page that answers 403.
  const user = await getCurrentUser();
  if (user && user.role === 'CUSTOMER') redirect(next);

  return (
    <>
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-12 sm:pb-16">
          <h1 className="font-display text-[2.25rem] leading-[1.08] tracking-[-0.03em] sm:text-[3rem]">
            {user ? 'Signed in' : 'Sign in'}
          </h1>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-white/70">
            {user
              ? 'You are signed in, but not as a customer.'
              : 'Your number is your account. We send a code — there is no password to remember.'}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-md px-5 pb-24 pt-12">
        {user ? <NotACustomer role={user.role} /> : <SignInForm next={next} />}
      </main>

      <Footer />
    </>
  );
}
