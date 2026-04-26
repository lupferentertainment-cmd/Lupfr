import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Single breakpoint for “phone / small tablet” vs “laptop & desktop” behavior across the site.
 *
 * - **`true`**: viewport width under 768px — use lighter paths (e.g. hero poster-only, no top scroll bar).
 * - **`false`**: width ≥ 768px — **full** UX unchanged: dual hero videos, parallax, scroll-linked shine,
 *   scroll progress bar, etc. This is intentional: laptop behavior is not deprecated or globally removed.
 * - **`undefined`**: before the first client layout read — treat like “not desktop-confirmed” (same safe
 *   subtree as mobile until `useLayoutEffect` runs) to avoid hydration mismatch.
 */
export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useLayoutEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
