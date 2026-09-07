'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';

/**
 * The last resort. A funnel that dies on an unexpected error takes the booking with it, so
 * there is always a way back rather than a blank page — and it says outright that nothing
 * has been booked, which is the one thing a person needs to know at that moment.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        Please try again in a moment — your booking has not been made.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" onClick={() => router.push('/')}>
          Home
        </Button>
      </div>
    </main>
  );
}
