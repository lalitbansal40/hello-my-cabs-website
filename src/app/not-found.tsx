import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-2xl font-bold">Ye page nahi mila</h1>
      <p className="mt-2 text-muted">Ho sakta hai link purana ho.</p>
      <Link className="mt-6 inline-block font-semibold text-accent" href="/">
        Home par jaayein
      </Link>
    </main>
  );
}
