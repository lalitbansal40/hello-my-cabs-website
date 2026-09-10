'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Field, Input, PhoneInput } from './ui/Field';
import { useOtp } from '@/lib/useOtp';
import { isValidMobile } from '@/lib/phone';
import { NotACustomer } from './site/NotACustomer';

/**
 * Two steps: a number, then the code that was sent to it.
 *
 * There is no separate sign-up. The same verify creates the account when the number is
 * new, so a second path would only be a second thing to explain and a second place to get
 * lost. The one thing a new account needs is a name, and it is asked for HERE — alongside
 * the code, before it is submitted — because the backend deletes the code the moment it
 * matches and only then notices a name is missing. Asking afterwards would leave somebody
 * holding a code that no longer exists.
 */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  /** Set when the account that just signed in is not a customer's — see NotACustomer. */
  const [otherRole, setOtherRole] = useState<string | null>(null);
  const { stage, setStage, busy, error, setError, cooldown, isNewUser, sendCode, verifyCode } =
    useOtp();

  async function onSendCode() {
    if (!isValidMobile(phone)) return setError('Enter a 10-digit mobile number');
    await sendCode(phone);
  }

  async function onVerify() {
    if (isNewUser && !name.trim()) return setError('Please enter your name');
    const signedIn = await verifyCode(phone, code, isNewUser ? name : undefined);
    if (!signedIn) return;

    // A driver's or an admin's account signs in here perfectly well, and then every page
    // it was signed in to reach answers 403. Say so instead of sending them into it.
    if (signedIn.role !== 'CUSTOMER') {
      setOtherRole(signedIn.role);
      return;
    }

    router.push(next);
    // The header and any signed-in page are server-rendered, so they have to be told.
    router.refresh();
  }

  if (otherRole) return <NotACustomer role={otherRole} />;

  return (
    <div className="rounded-[1.5rem] border border-line bg-surface-raised p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex flex-col gap-5">
        <Field
          label="Mobile number"
          htmlFor="phone"
          hint={stage === 'phone' ? 'We will send a code to this number' : undefined}
        >
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            disabled={stage === 'code'}
          />
        </Field>

        {stage === 'code' ? (
          <>
            {/* Only a number the backend has never seen needs this. */}
            {isNewUser ? (
              <Field label="Your name" htmlFor="name" hint="So the driver knows who to look for">
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            ) : null}

            <Field
              label="Code"
              htmlFor="code"
              hint={cooldown > 0 ? `Resend in ${cooldown}s` : 'You can resend the code'}
            >
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </Field>
          </>
        ) : null}

        {error ? <p className="text-danger text-small">{error}</p> : null}

        {stage === 'phone' ? (
          <Button onClick={onSendCode} disabled={busy}>
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button onClick={onVerify} disabled={busy || code.length < 4}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button variant="ghost" onClick={onSendCode} disabled={busy || cooldown > 0}>
              Resend
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // Wrong number typed — going back must clear the code, or the next
                // attempt submits a code that belongs to the previous number.
                setStage('phone');
                setCode('');
                setError('');
              }}
              disabled={busy}
            >
              Change number
            </Button>
          </div>
        )}

        <p className="text-faint text-small">
          Trouble signing in? Call{' '}
          <a className="font-semibold text-ink hover:text-accent" href="tel:+919667111921">
            +91 96671 11921
          </a>
          .
        </p>
      </div>
    </div>
  );
}
