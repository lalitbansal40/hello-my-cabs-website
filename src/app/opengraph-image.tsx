import { ImageResponse } from 'next/og';

/**
 * The card that appears when the site is shared.
 *
 * Generated rather than exported from a design file so it cannot fall out of date with the
 * brand — and a link with no card looks abandoned next to one that has it.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Hello My Cab — outstation cabs across India';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 84,
          background: 'linear-gradient(160deg, #10402F 0%, #0B2C22 60%, #08211A 100%)',
          color: 'white',
          fontFamily: 'serif',
        }}
      >
        <svg width="72" height="72" viewBox="0 0 32 32">
          <path
            d="M6 24c0-7 4-10 10-10s10-3 10-10"
            fill="none"
            stroke="#00C26E"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="0.1 5.2"
          />
          <circle cx="6" cy="24" r="3.6" fill="#00C26E" />
          <circle cx="26" cy="4" r="3.6" fill="none" stroke="#00C26E" strokeWidth="2.6" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 86, lineHeight: 1.02, letterSpacing: -2 }}>Every road.</div>
          <div style={{ fontSize: 86, lineHeight: 1.02, letterSpacing: -2, color: '#00C26E' }}>
            One honest price.
          </div>
          <div style={{ marginTop: 34, fontSize: 30, color: 'rgba(255,255,255,0.62)' }}>
            Outstation cabs across India · hellomycabs.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
