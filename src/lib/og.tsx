/**
 * The card a shared link shows (Open Graph), in the brand's red and black — one design for
 * the home page and every landing page, so the two can never drift apart.
 *
 * Satori (what ImageResponse draws with) supports flexbox only, and every element with more
 * than one child needs `display: flex` — hence the explicit styles on everything.
 */
const RED = '#D83028';
const INK = '#201818';

/** The car from src/app/icon.svg, at OG size. */
function CarMark({ width }: { width: number }) {
  return (
    <svg width={width} height={width / 4} viewBox="0 0 120 30">
      <path d="M10 14.2C32 .2 80-1.4 114 16.8 82 5 34 5.4 10 15.8Z" fill={RED} />
      <path d="M28.5 14.2C42 3.6 78 3.6 94 14.6Z" fill={INK} />
      <path d="M3 14.2 104 16l14 2.2-14-.2-101 .4Z" fill={RED} />
      <path d="M5.5 6.8 11.5 6.6 20 14.6h-5.2Z" fill={RED} />
      <path d="M14.5 19.4c9.5.6 18 3.2 23 7.6-6.5-3.2-14.5-5.2-23-5.9Z" fill={RED} />
      <path d="M100.5 19.6c7.5.8 13.3 3.2 16.5 7.4-4.6-3-10.4-4.9-16.5-5.8Z" fill={RED} />
    </svg>
  );
}

export function OgCard({
  eyebrow,
  headline,
  accent,
  facts,
}: {
  eyebrow: string;
  headline: string;
  accent?: string;
  facts: string[];
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#ffffff',
        color: INK,
        fontFamily: 'sans-serif',
      }}
    >
      {/* The red edge — what makes it read as this company in a row of link previews. */}
      <div style={{ width: 28, height: '100%', background: RED, display: 'flex' }} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CarMark width={220} />
            <div style={{ display: 'flex', fontSize: 40, letterSpacing: -1 }}>
              <span>hello</span>
              <span style={{ color: RED }}>my</span>
              <span>cab</span>
              <span style={{ color: RED, fontSize: 32, marginTop: 7 }}>.com</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#5f5a5a', letterSpacing: 3 }}>
            {eyebrow.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {headline}
          </div>
          {accent ? (
            <div
              style={{
                display: 'flex',
                fontSize: 80,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2,
                color: RED,
              }}
            >
              {accent}
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 28, marginTop: 30 }}>
            {facts.map((f) => (
              <div key={f} style={{ display: 'flex', fontSize: 30, color: '#5f5a5a' }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
