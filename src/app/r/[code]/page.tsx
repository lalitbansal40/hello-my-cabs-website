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
  /** The trip's time as the funnel carries it — "2026-10-12T06:00", IST. */
  when?: string;
  returnWhen?: string;
  hours?: number;
}

/**
 * The time to reopen the fares page at: the enquiry's own, or — when that has passed, or the
 * lead is too old to have one — the same time tomorrow. The fares page cannot price a trip
 * without a time, and "Something is missing" is no way to answer a follow-up message.
 */
function reopenAt(when?: string): string {
  const nowIst = new Date(Date.now() + 330 * 60_000);
  const valid = when && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(when) ? when : undefined;
  if (valid && new Date(`${valid}:00Z`).getTime() > nowIst.getTime() + 60 * 60_000) return valid;
  const clock = valid ? valid.slice(11) : '09:00';
  const tomorrow = new Date(nowIst.getTime() + 24 * 3600_000).toISOString().slice(0, 10);
  return `${tomorrow}T${clock}`;
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
  if (lead.pickupCity) p.set('when', reopenAt(lead.when));
  // A return time only when the trip still has its own (a new day changes the return too).
  if (lead.returnWhen && lead.when && reopenAt(lead.when) === lead.when) p.set('returnWhen', lead.returnWhen);
  if (lead.hours) p.set('hours', String(lead.hours));

  // The quote is still good: straight back to the step they left, price and all.
  if (lead.quoteId && !lead.quoteExpired) {
    p.set('quoteId', lead.quoteId);
    redirect(`/booking/details?${p}`);
  }

  // The price has run out. Same trip, new price — never an empty form.
  redirect(p.toString() ? `/booking?${p}` : '/');
}
