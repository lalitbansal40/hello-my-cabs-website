import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

/**
 * What an hourly booking actually includes.
 *
 * The widget used to offer a choice of 4, 8, 10 or 12 hours. There is only one package —
 * eight hours and eighty kilometres today — and anything longer is billed as extra hours
 * on top of it, so four hours cost exactly what eight cost. The dropdown was selling a
 * decision the price does not follow.
 *
 * The numbers live in the pricing config and change there, so the widget asks rather than
 * carrying its own copy. Cached for a day: this is configuration, not a live price.
 */
export const revalidate = 86_400;

export async function GET() {
  const packages = await api.localPackages().catch(() => []);
  if (!packages.length) return NextResponse.json({ package: null });

  // Every vehicle shares the included hours and kilometres; only the fare differs, and the
  // vehicle is chosen on the next step. The cheapest is what "from" means here.
  const cheapest = packages.reduce((a, b) => (b.baseFareRupees < a.baseFareRupees ? b : a));
  return NextResponse.json({
    package: {
      includedHours: cheapest.includedHours,
      includedKm: cheapest.includedKm,
      fromRupees: cheapest.baseFareRupees,
      extraPerHour: cheapest.extraPerHour,
    },
  });
}
