import { Skeleton } from '@/components/site/Skeleton';

/** The confirmation is fetched with the session token, so it is never cached. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-muted text-small">Fetching your booking…</p>
      <Skeleton className="mt-6 h-12 w-2/3" />
      <Skeleton className="mt-6 h-56 w-full" />
    </div>
  );
}
