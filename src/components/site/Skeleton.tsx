/**
 * A block that stands in for content while the server is still fetching it.
 *
 * The point is that it holds the same space the real thing will take, so nothing jumps
 * when the content lands. It also respects reduced motion — a pulsing page is exactly the
 * kind of thing that setting exists to stop.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-alt motion-reduce:animate-none ${className}`}
      aria-hidden
    />
  );
}
