import { Button } from '../ui/Button';
import { SignOutButton } from './SignOutButton';
import { company } from '@/lib/company';

const PLAY_STORE =
  'https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app';

/**
 * What a driver or an admin sees if they sign in here.
 *
 * Their account works — the sign-in genuinely succeeds — but every page it was meant to
 * reach is customer-only and answers 403. Left alone that is the worst version of this:
 * signed in, and nothing on the screen. So it is said plainly, with the app they actually
 * want, rather than discovered one empty page later.
 */
export function NotACustomer({ role }: { role: string }) {
  const isDriver = role === 'DRIVER';

  return (
    <div className="rounded-[1.5rem] border border-line bg-surface-raised p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <h2 className="font-display text-h3">
        {isDriver ? 'This is a driver account' : 'This is a staff account'}
      </h2>
      <p className="mt-4 text-body text-ink-soft">
        {isDriver
          ? 'You are signed in, but this site is for customers booking a trip. Duties, your wallet and your trips are all in the driver app.'
          : 'You are signed in, but this site is for customers booking a trip. Your work is in the admin app.'}
      </p>

      {isDriver ? (
        <a href={PLAY_STORE} target="_blank" rel="noreferrer" className="mt-6 inline-block">
          <Button>Open the driver app</Button>
        </a>
      ) : null}

      <p className="mt-6 text-small text-muted">
        Booking a cab for yourself? Sign in with your own number instead, or call{' '}
        <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
          {company.phone}
        </a>
        .
      </p>

      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
