/**
 * Pillar / motif icon set for the brand landing pages — transcribed from
 * LUPFR Website Design v5's `BPI` + `BPICONS` tables (owner, 2026-11-17).
 * 24px viewBox, 1.5 stroke, drawn in the brand's accent colour.
 */
const PATHS: Record<string, string[]> = {
  sailboat: ["M12 3v13", "M12 4l6 10h-6", "M11 6l-5 8h5", "M3 18c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0"],
  sunset: ["M7 14a5 5 0 0 1 10 0", "M12 4v3M4.9 7.9l1.4 1.4M19.1 7.9l-1.4 1.4M2 14h2M20 14h2", "M3 18c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0"],
  anchor: ["M12 7v14", "M8 11h8", "M5 14a7 7 0 0 0 14 0"],
  wave: ["M2 9c2 1.6 4 1.6 6 0s4-1.6 6 0 4 1.6 6 0", "M2 15c2 1.6 4 1.6 6 0s4-1.6 6 0 4 1.6 6 0"],
  building: ["M4 21V8l8-5 8 5v13", "M9 21v-6h6v6", "M2 21h20"],
  disc: ["M12 6.5a5.5 5.5 0 0 1 5.5 5.5"],
  mic: ["M5 11a7 7 0 0 0 14 0", "M12 18v3M9 21h6"],
  spot: ["M8 3h8l-2 6h-4z", "M10 9l-5 12M14 9l5 12", "M4 21h16"],
  tree: ["M12 3l6 9h-3l4 6H5l4-6H6z", "M12 18v3"],
  pin: ["M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"],
  sun: ["M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"],
  mountain: ["M2 20l7-12 4 6 3-4 6 10z", "M7.2 11l1.8 1.5 1.6-1.4"],
  mug: ["M5 9h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z", "M16 11h1.5a2.5 2.5 0 0 1 0 5H16", "M9 3c-1 1.2 1 2 0 3.5M12.5 3c-1 1.2 1 2 0 3.5"],
  snow: ["M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7", "M9.5 3.5L12 5l2.5-1.5M9.5 20.5L12 19l2.5 1.5"],
  gondola: ["M2 4l20 4", "M12 6v4", "M7 14h10"],
  tower: ["M9.5 7h1M13.5 7h1M9.5 11h1M13.5 11h1M9.5 15h1M13.5 15h1", "M3 21h18"],
  glass: ["M8 3h8l-1 7a3 3 0 0 1-6 0z", "M12 13v8M8.5 21h7"],
  case: ["M9 7V5h6v2", "M3 13h18"],
  phones: ["M4 15v-3a8 8 0 0 1 16 0v3"],
  waves: ["M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"],
}

/** Shapes that are not plain paths (circles / rects). Keyed by icon name. */
const SHAPES: Record<string, React.ReactNode> = {
  anchor: <circle cx="12" cy="5" r="2" />,
  disc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  mic: <rect x="9" y="3" width="6" height="11" rx="3" />,
  pin: <circle cx="12" cy="10" r="2.5" />,
  sun: <circle cx="12" cy="12" r="4" />,
  gondola: <rect x="7" y="10" width="10" height="9" rx="2" />,
  tower: <rect x="6" y="3" width="12" height="18" />,
  case: <rect x="3" y="7" width="18" height="13" rx="2" />,
  phones: (
    <>
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
}

/** Four icons per brand: pillars 1-3, then the "motif" used by the format line and photo disc. */
export const BRAND_PILLAR_ICONS: Record<string, string[]> = {
  seaside: ["sailboat", "sunset", "anchor", "wave"],
  inside: ["building", "disc", "spot", "mic"],
  outside: ["tree", "pin", "sun", "tree"],
  skiside: ["mountain", "mug", "gondola", "snow"],
  highrise: ["tower", "glass", "case", "tower"],
  soundcheck: ["mic", "phones", "waves", "phones"],
}

export function brandIconName(brandKey: string, index: number): string | undefined {
  return BRAND_PILLAR_ICONS[brandKey]?.[index]
}

export function BrandPillarIcon({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      data-icon={name}
    >
      {SHAPES[name]}
      {(PATHS[name] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
