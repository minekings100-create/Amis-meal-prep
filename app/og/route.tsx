import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const BG = '#0f1410';
const ACCENT = '#7cc24f';
const ACCENT_DARK = '#4a8a3c';
const INK_LIGHT = 'rgba(255,255,255,0.85)';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.slice(0, 80) ?? 'AMIS Meals';
  const subtitle =
    searchParams.get('subtitle')?.slice(0, 120) ??
    'Vers, hoog-eiwit, uit Maastricht';
  const eyebrow = searchParams.get('eyebrow')?.slice(0, 40);
  const image = searchParams.get('image');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: BG,
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top brand stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DARK} 50%, ${ACCENT} 100%)`,
          }}
        />

        {/* Soft accent glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            bottom: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: ACCENT,
            opacity: 0.18,
            filter: 'blur(4px)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 80,
            width: '100%',
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em' }}>AMIS</span>
            <span
              style={{
                fontSize: 14,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              meals
            </span>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: image ? 720 : 1040 }}>
            {eyebrow && (
              <span
                style={{
                  fontSize: 18,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: ACCENT,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {eyebrow}
              </span>
            )}
            <h1
              style={{
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                color: 'white',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 30,
                  marginTop: 24,
                  color: INK_LIGHT,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 18,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span>amismeals.nl</span>
            <span style={{ fontFamily: 'monospace' }}>Maastricht · NL</span>
          </div>
        </div>

        {/* Optional product image — circular plate-style on the right */}
        {image && (
          <div
            style={{
              position: 'absolute',
              right: 60,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 380,
              height: 380,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `4px solid ${ACCENT}`,
              display: 'flex',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              width={380}
              height={380}
              alt=""
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
