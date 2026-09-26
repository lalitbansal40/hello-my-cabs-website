import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { FunnelShell } from '@/components/site/FunnelShell';
import { company } from '@/lib/company';

/**
 * The link inside the follow-up message.
 *
 * Its whole job is to put somebody back where they stopped. A reminder that opens an
 * empty form is worse than no reminder — they already typed all of this once.
 *
 * The quote behind the enquiry lives for thirty minutes and the message arrives after
 * five, so it is usually still alive; when it is not, they land on the same trip with a
 * fresh price rather than on the home page.
 */
export const dynamic = 'force-dynamic';
// A link meant for one person is not a search result.
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Lead {
  name?: string;
  quoteId?: string;
  quoteExpired?: boolean;
  tripType?: string;
  vehicleType?: string;
  pickupCity?: string;
  dropCity?: string;
  pickupAddress?: string;
  fareRupees?: number;
}

export default async function ResumeBooking({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  let lead: Lead | null = null;
  try {
    const res = await fetch(`${env.apiBaseUrl}/public/lead/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    const body = await res.json().catch(() => null);
    if (body?.ok) lead = body.data as Lead;
  } catch {
    /* handled below — a dead backend must not throw a stack trace at a customer */
  }

  if (!lead) {
    return (
      <FunnelShell
        title="This link has expired"
        subtitle="Enquiry links work for a few days. Start again — it takes a minute."
      >
        <div className="flex flex-col gap-3">
          <Link className="font-semibold text-accent" href="/">
            Book a cab
          </Link>
          <a className="font-semibold text-muted hover:text-ink" href={company.phoneHref}>
            Or call {company.phone}
          </a>
        </div>
      </FunnelShell>
    );
  }

  const p = new URLSearchParams();
  if (lead.tripType) p.set('tripType', lead.tripType);
  if (lead.pickupCity) p.set('pickup', lead.pickupCity);
  if (lead.dropCity) p.set('drop', lead.dropCity);
  if (lead.vehicleType) p.set('vehicleType', lead.vehicleType);

  // The quote is still good: straight back to the step they left, price and all.
  if (lead.quoteId && !lead.quoteExpired) {
    p.set('quoteId', lead.quoteId);
    redirect(`/booking/details?${p}`);
  }

  // The price has run out. Same trip, new price — never an empty form.
  redirect(p.toString() ? `/booking?${p}` : '/');
}
