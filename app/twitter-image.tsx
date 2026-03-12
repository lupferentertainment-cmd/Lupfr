import { ImageResponse } from 'next/og'

export const alt = 'Lupfer Entertainment | SF House Music Events & Talent Curation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d12',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.3em',
              color: '#c9a227',
              textTransform: 'uppercase',
            }}
          >
            San Francisco House Music
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            LUPFER
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #fafafa, #c9a227, #fafafa)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            ENTERTAINMENT
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#71717a',
              maxWidth: 560,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Boat parties, rooftop events, warehouse sessions.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
