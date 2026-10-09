'use client';

import { useState } from 'react';
import { RATING_TAGS } from '@/lib/review-rules';

/**
 * The rating itself: overall stars (needed), the driver's and the car's own (optional), and
 * what went well. No name, no comment box — the website shows a summary of these numbers and
 * nothing about who gave them.
 *
 * After any rating, high or low, the same thanks and the same Google review link: asking only
 * the happy ones to review on Google is review gating, which Google forbids.
 */
export function RateForm({ token, googleReviewUrl }: { token: string; googleReviewUrl: string | null }) {
  const [stars, setStars] = useState(0);
  const [driverStars, setDriverStars] = useState<number | null>(null);
  const [cabStars, setCabStars] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    if (!stars) {
      setError('Please choose the stars for your trip.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token,
          rating: {
            stars,
            ...(driverStars ? { driverStars } : {}),
            ...(cabStars ? { cabStars } : {}),
            ...(tags.length ? { tags } : {}),
          },
        }),
      });
      const body = await res.json().catch(() => null);
      if (body?.ok || body?.error?.code === 'ALREADY_RATED') setDone(true);
      else setError(body?.error?.message ?? 'We could not save that. Please try again.');
    } catch {
      setError('We could not save that just now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-surface-raised p-6 sm:p-8">
        <p className="font-display text-title font-bold">Thank you for rating your trip.</p>
        <p className="mt-2 text-body text-muted">It helps the next traveller choose, and helps us do better.</p>
        {googleReviewUrl ? (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-white hover:bg-accent-dark"
          >
            Also review us on Google
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-surface-raised p-6 sm:p-8">
      <StarRow label="Your trip" value={stars} onChange={(v) => setStars(v ?? 0)} big />
      <div className="mt-6 grid gap-3">
        <StarRow label="Driver" value={driverStars} onChange={setDriverStars} />
        <StarRow label="Cab" value={cabStars} onChange={setCabStars} />
      </div>

      <p className="mt-8 text-body font-semibold text-ink">What went well? (optional)</p>
      <ul className="mt-3 flex flex-wrap gap-2.5">
        {RATING_TAGS.map((t) => {
          const on = tags.includes(t.key);
          return (
            <li key={t.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setTags((x) => (on ? x.filter((k) => k !== t.key) : [...x, t.key]))}
                className={`min-h-11 rounded-full border px-4 text-small font-semibold ${
                  on ? 'border-accent bg-accent text-white' : 'border-line text-ink hover:border-ink'
                }`}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p role="alert" className="mt-6 text-small font-semibold text-accent">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Submit rating'}
      </button>
    </div>
  );
}

/** Five tappable stars; tapping the chosen one again clears an optional row. */
function StarRow({
  label,
  value,
  onChange,
  big = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  big?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-24 shrink-0 font-semibold text-ink ${big ? 'text-title' : 'text-body'}`}>{label}</span>
      <div role="radiogroup" aria-label={`${label} rating`} className="flex">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value != null && n <= value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              onClick={() => onChange(value === n && !big ? null : n)}
              className={`grid min-h-11 min-w-11 place-items-center ${big ? 'text-[2rem]' : 'text-[1.5rem]'} leading-none ${
                filled ? 'text-gold' : 'text-line'
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}
