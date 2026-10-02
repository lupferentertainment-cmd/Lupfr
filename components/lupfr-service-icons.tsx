/**
 * 2026-10-02 fix, round 2 (owner screenshots of the Claude design file:
 * "it should align everything to that"). The design file's own icon set for
 * Services / "Services Delivered" is a fixed table of hand-drawn SVG path
 * strings (`ICONS` in LUPFR Website v3.dc.html's render function) — not
 * Lucide icons. The site's first ports of these sections approximated them
 * with the nearest-looking Lucide icon, which is how a January-2026 pass
 * produced icon mismatches Will had to flag by screenshot. Transcribing the
 * design's own path data directly removes that whole class of drift: these
 * six paths ARE the design file's icons, byte for byte.
 *
 * Used by data/services.yml's icon field (via lib/data/services.ts) for the
 * home Services section + /services pages, and by claude-home-experiences.tsx
 * for the "Services Delivered" badges on each case study — both read from
 * the same design-file `ICONS` table, so a single source here keeps them
 * from drifting apart again.
 */
import type { SVGProps } from "react"

/** Shaped like Lucide's icon components (size/strokeWidth/className props)
 * so these drop into any spot already typed for a LucideIcon, without
 * actually depending on lucide-react's exact (ForwardRefExoticComponent)
 * type. */
export type ServiceIconComponent = (props: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) => React.JSX.Element

export const SERVICE_ICON_PATHS = {
  hospitality: "M8 2h8l-1 8a3 3 0 0 1-6 0z M12 13v8 M8 21h8",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  music: "M9 18V5l11-2v13 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M17 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  pin: "M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  production: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  camera: "M3 7h4l2-3h6l2 3h4v13H3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
} as const

export type ServiceIconKey = keyof typeof SERVICE_ICON_PATHS

/** A plain `<path d>` from SERVICE_ICON_PATHS, wrapped as a Lucide-shaped
 * component (size/strokeWidth/className props) so it drops into any spot
 * that already expects a LucideIcon, e.g. lib/data/services.ts's ICON_MAP. */
function makeServiceIcon(path: string) {
  return function ServiceIcon({ size = 18, strokeWidth = 1.6, ...rest }: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        <path d={path} />
      </svg>
    )
  }
}

export const HospitalityIcon = makeServiceIcon(SERVICE_ICON_PATHS.hospitality)
export const SparkIcon = makeServiceIcon(SERVICE_ICON_PATHS.spark)
export const ServiceMusicIcon = makeServiceIcon(SERVICE_ICON_PATHS.music)
export const ServicePinIcon = makeServiceIcon(SERVICE_ICON_PATHS.pin)
export const ServiceProductionIcon = makeServiceIcon(SERVICE_ICON_PATHS.production)
export const ServiceCameraIcon = makeServiceIcon(SERVICE_ICON_PATHS.camera)

/** Standalone badge render for inline use (claude-home-experiences.tsx's
 * "Services Delivered" list), independent of the ICON_MAP/LucideIcon typing
 * lib/data/services.ts needs. */
export function ServiceIcon({ icon, className, size = 16, strokeWidth = 1.6 }: { icon: ServiceIconKey; className?: string; size?: number; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={SERVICE_ICON_PATHS[icon]} />
    </svg>
  )
}
