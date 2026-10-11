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

/** The width the headline has: the card, less the red edge and the padding either side. */
const HEADLINE_WIDTH = 1200 - 28 - 2 * 84;

/**
 * The size one line of the headline can take without wrapping: 80px for a short route, smaller
 * for "Delhi Airport → Dehradun". An average glyph of this face is a little over half its size.
 */
function oneLineSize(text: string): number {
  return Math.min(80, Math.floor(HEADLINE_WIDTH / (text.length * 0.56)));
}

export function OgCard({
  eyebrow,
  headline,
  accent,
  facts,
  inline = false,
}: {
  eyebrow: string;
  headline: string;
  accent?: string;
  facts: string[];
  /** The headline and the accent on ONE line — "Jaipur → Delhi" (10 Oct 2026). */
  inline?: boolean;
}) {
  if (inline && accent) {
    const size = oneLineSize(`${headline} ${accent}`);
    return (
      <Frame eyebrow={eyebrow} facts={facts}>
        <div
          style={{ display: 'flex', fontSize: size, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}
        >
          <span>{headline}</span>
          <span style={{ color: RED, marginLeft: size * 0.28 }}>{accent}</span>
        </div>
      </Frame>
    );
  }
  return (
    <Frame eyebrow={eyebrow} facts={facts}>
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
    </Frame>
  );
}

/** Everything around the headline: the red edge, the mark, the eyebrow, the facts. */
function Frame({
  eyebrow,
  facts,
  children,
}: {
  eyebrow: string;
  facts: string[];
  children: React.ReactNode;
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
          {children}
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

/** One city on a route card: its name, and its photo as a data URL (or none). */
export interface OgCity {
  name: string;
  photo: string | null;
}

/**
 * Photo size by how many cities share the row — two big, four small. Kept to about 100k
 * pixels of photo in all: the card is a PNG, and past ~300 KB WhatsApp drops the picture
 * from the preview.
 */
const PHOTO = {
  1: { w: 300, h: 225 },
  2: { w: 256, h: 192 },
  3: { w: 216, h: 162 },
  4: { w: 168, h: 126 },
} as const;

/**
 * A route's card with each city's photo (owner, 12 Oct 2026: "Jaipur to Jodhpur — sirf naam
 * dikh raha hai, photo bhi dikhni chahiye"). The cities in a row, an arrow between them, each
 * name under its photo; the route and the price beneath. A city with no photo gets a red tile
 * with its name — never an empty box. The photos are Wikimedia Commons (CC BY / BY-SA), so
 * the card credits them in its corner (/photo-credits has the authors).
 */
export function OgRouteCard({
  eyebrow,
  cities,
  facts,
}: {
  eyebrow: string;
  cities: OgCity[];
  facts: string[];
}) {
  const shown = cities.slice(0, 4);
  const box = PHOTO[Math.max(1, shown.length) as 1 | 2 | 3 | 4];
  const route = shown.map((c) => c.name).join(' → ');
  // One line, leaving the credit its ~270px on the right.
  const size = Math.min(56, Math.floor((HEADLINE_WIDTH - 270) / (route.length * 0.56)));
  const credited = shown.some((c) => c.photo);
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
      <div style={{ width: 28, height: '100%', background: RED, display: 'flex' }} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 64px 34px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CarMark width={160} />
            <div style={{ display: 'flex', fontSize: 30, letterSpacing: -1 }}>
              <span>hello</span>
              <span style={{ color: RED }}>my</span>
              <span>cab</span>
              <span style={{ color: RED, fontSize: 24, marginTop: 5 }}>.com</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#5f5a5a', letterSpacing: 3 }}>
            {eyebrow.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {shown.map((c, i) => (
            <div key={`${c.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {i > 0 ? (
                <div style={{ display: 'flex', fontSize: 40, color: '#9a9494' }}>→</div>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {c.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Satori draws <img>, not next/image
                  <img
                    src={c.photo}
                    width={box.w}
                    height={box.h}
                    alt=""
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: box.w,
                      height: box.h,
                      borderRadius: 20,
                      background: RED,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: Math.round(box.w / 7),
                      fontWeight: 700,
                    }}
                  >
                    {c.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: size, fontWeight: 700, letterSpacing: -1.5 }}>
              {shown.map((c, i) => (
                // Satori trims a leading space, so the arrow is spaced with margins.
                <span
                  key={`${c.name}-${i}`}
                  style={{ display: 'flex', color: i === shown.length - 1 && i > 0 ? RED : INK }}
                >
                  {i > 0 ? (
                    <span style={{ margin: `0 ${Math.round(size * 0.25)}px`, color: INK }}>→</span>
                  ) : null}
                  {c.name}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              {facts.map((f) => (
                <div key={f} style={{ display: 'flex', fontSize: 28, color: '#5f5a5a' }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
          {credited ? (
            <div style={{ display: 'flex', flexShrink: 0, marginLeft: 24, fontSize: 16, color: '#9a9494', whiteSpace: 'nowrap' }}>
              Photos: Wikimedia Commons
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
