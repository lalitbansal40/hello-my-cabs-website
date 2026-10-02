import { Skeleton } from '@/components/site/Skeleton';

/**
 * A route, city or vehicle page on its way — shaped like its dark hero and the fare table
 * under it, so nothing jumps when it arrives. These pages are prerendered; this shows only
 * in the moment a link inside the site is fetching one that is not in the browser yet.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="hero-ground h-72 sm:h-80" />
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-gutter py-12">
        <Skeleton className="h-9 w-64" />
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
