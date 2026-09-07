import { Skeleton } from '@/components/site/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Skeleton className="h-12 w-1/2" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}
