import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The link may be out of date.</p>
      <Link className="mt-6 inline-block font-semibold text-accent" href="/">
        Go to home
      </Link>
    </main>
  );
}
