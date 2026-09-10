'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

/**
 * Cancelling, in two deliberate steps.
 *
 * Nothing here can be undone, so the figures come first: what will be kept and what comes
 * back, taken from the backend rather than worked out again on this page. A customer who
 * cancels and then finds a charge they were not shown has been treated badly, and the
 * numbers are already computed on the server that will apply them.
 */
export function CancelBooking({
  id,
  preview,
}: {
  id: string;
  /** null when the preview could not be fetched — the figures are then not claimed. */
  preview: { paidOnline: number; cancellationFee: number; refundAmount: number } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rupees = (paise: number) => `₹${Math.round((paise ?? 0) / 100).toLocaleString('en-IN')}`;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-small text-danger hover:underline inline-flex min-h-11 items-center"
      >
        Cancel this booking
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
      <p className="font-bold">Cancel this booking?</p>

      {preview ? (
        <div className="mt-4 text-body flex flex-col gap-2">
          {preview.paidOnline > 0 ? (
            <>
              <Line label="You paid online" value={rupees(preview.paidOnline)} />
              <Line label="Cancellation fee" value={rupees(preview.cancellationFee)} />
              <Line label="Refund to you" value={rupees(preview.refundAmount)} strong />
            </>
          ) : (
            <p className="text-ink-soft">
              Nothing was paid online, so cancelling costs you nothing.
            </p>
          )}
        </div>
      ) : (
        // Better to say the figures are unknown than to guess them on a screen that is
        // about to take money.
        <p className="mt-4 text-body text-ink-soft">
          We could not load the cancellation charges just now. Please call us instead.
        </p>
      )}

      <div className="mt-5">
        <Field label="Reason (optional)" htmlFor="reason">
          <Input
            id="reason"
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      </div>

      {error ? <p className="mt-3 text-small text-danger">{error}</p> : null}

      <p className="mt-4 text-small text-muted">This cannot be undone.</p>

      {/* Full width and stacked on a phone, side by side from sm. Wrapping left "Cancel
          the booking" on its own line and "Keep it" beside nothing, which read as one
          button and one stray link. */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
        <Button
          variant="danger"
          disabled={busy || !preview}
          onClick={async () => {
            setBusy(true);
            setError('');
            try {
              const res = await fetch(`/api/bookings/${id}/cancel`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ reason }),
              });
              const body = await res.json().catch(() => null);
              if (!body?.ok) {
                setError(body?.error?.message ?? 'We could not cancel this booking');
                return;
              }
              // The page is server-rendered, so it has to be asked again to show the
              // cancelled state and the figures that came with it.
              router.refresh();
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Cancelling…' : 'Yes, cancel it'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
          Keep the booking
        </Button>
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={strong ? 'font-bold' : 'font-semibold'}>{value}</span>
    </div>
  );
}
