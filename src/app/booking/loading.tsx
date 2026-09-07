import { Skeleton } from '@/components/site/Skeleton';

/**
 * Pricing a trip means a round trip to the fare service, and on a slow connection that is
 * several seconds during which the page would otherwise sit unchanged. People read a
 * frozen page as a broken one and leave — which is a booking lost to a spinner that was
 * never drawn.
 *
 * Shaped like the vehicle list it replaces, so the layout does not jump when it arrives.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-[14px] text-muted">Working out your fare…</p>
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
