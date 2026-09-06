import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/** Ask the backend to send an OTP. Proxied so the site keeps to one origin. */
export async function POST(request: Request) {
  const { phone } = await request.json();
  const res = await fetch(`${env.apiBaseUrl}/auth/otp/request`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone }),
    cache: 'no-store',
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
