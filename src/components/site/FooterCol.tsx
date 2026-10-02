'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { Icon } from './Icons';

/**
 * One block of footer links. On a phone it is a row you open — three lists of seven links
 * each made the footer 1,400px under every page, longer than most of the pages above it.
 * From `sm` up it is always open, as before.
 *
 * The links stay in the page either way (hidden, not absent): they are how a crawler finds
 * every route and city page, which is the reason this footer carries them at all.
 */
export function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-white/10 sm:border-0">
      <h3 className="text-label font-bold uppercase text-white/40">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-12 w-full items-center justify-between uppercase sm:pointer-events-none sm:min-h-0"
        >
          {title}
          <Icon.plus
            className={`h-4 w-4 transition-transform sm:hidden ${open ? 'rotate-45' : ''}`}
          />
        </button>
      </h3>
      <ul id={id} className={`${open ? 'flex' : 'hidden'} mt-1 flex-col pb-3 text-body text-white/55 sm:flex sm:pb-0`}>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="flex min-h-11 items-center py-1 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
