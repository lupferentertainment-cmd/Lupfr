import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const LOGO_RELATIVE = join('public', 'logos', 'will_logo.png')

export async function readLogoDataUri(): Promise<string> {
  const buf = await readFile(join(process.cwd(), LOGO_RELATIVE))
  return `data:image/png;base64,${buf.toString('base64')}`
}

type OgBrandPreviewProps = {
  logoSrc: string
  tagline: string
}

/** JSX tree for `next/og` ImageResponse — Satori-compatible inline styles only. */
export function OgBrandPreview({ logoSrc, tagline }: OgBrandPreviewProps) {
  return (
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
          gap: 28,
        }}
      >
        <img src={logoSrc} width={300} height={300} alt="" />
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '0.14em',
          }}
        >
          LUPFR ENTERTAINMENT
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#a1a1aa',
            maxWidth: 680,
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          {tagline}
        </div>
      </div>
    </div>
  )
}
