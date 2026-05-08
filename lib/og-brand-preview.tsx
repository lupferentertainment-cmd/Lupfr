import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CSSProperties, HTMLAttributes } from 'react'

const LOGO_RELATIVE = join('public', 'logos', 'will_logo.png')

export async function readLogoDataUri(): Promise<string> {
  const buf = await readFile(join(process.cwd(), LOGO_RELATIVE))
  return `data:image/png;base64,${buf.toString('base64')}`
}

type OgBrandPreviewProps = {
  logoSrc: string
  tagline: string
}

const OG_ROOT_PROPS = {
  style: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0d12',
    fontFamily: 'system-ui, sans-serif',
  } satisfies CSSProperties,
} satisfies HTMLAttributes<HTMLDivElement>

const OG_STACK_PROPS = {
  style: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
  } satisfies CSSProperties,
} satisfies HTMLAttributes<HTMLDivElement>

const OG_TITLE_PROPS = {
  style: {
    fontSize: 34,
    fontWeight: 700,
    color: '#fafafa',
    letterSpacing: '0.14em',
  } satisfies CSSProperties,
} satisfies HTMLAttributes<HTMLDivElement>

const OG_TAGLINE_PROPS = {
  style: {
    fontSize: 24,
    color: '#a1a1aa',
    maxWidth: 680,
    textAlign: 'center',
    lineHeight: 1.45,
  } satisfies CSSProperties,
} satisfies HTMLAttributes<HTMLDivElement>

/** JSX tree for `next/og` ImageResponse — Satori-compatible inline styles only. */
export function OgBrandPreview({ logoSrc, tagline }: OgBrandPreviewProps) {
  return (
    <div {...OG_ROOT_PROPS}>
      <div {...OG_STACK_PROPS}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse requires plain img tags. */}
        <img src={logoSrc} width={300} height={300} alt="" />
        <div {...OG_TITLE_PROPS}>
          LUPFR ENTERTAINMENT
        </div>
        <div {...OG_TAGLINE_PROPS}>
          {tagline}
        </div>
      </div>
    </div>
  )
}
