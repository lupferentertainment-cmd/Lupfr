import * as React from 'react'

import { isLikelyLowComputeDevice, MOBILE_BREAKPOINT } from "@/lib/device-profile"

type NetworkInformationLike = {
  saveData?: boolean
  effectiveType?: string
  addEventListener?: (type: "change", listener: () => void) => void
  removeEventListener?: (type: "change", listener: () => void) => void
}

function getNetworkInformation(nav: Navigator): NetworkInformationLike | undefined {
  const extended = nav as Navigator & {
    connection?: NetworkInformationLike
    mozConnection?: NetworkInformationLike
    webkitConnection?: NetworkInformationLike
  }
  return extended.connection ?? extended.mozConnection ?? extended.webkitConnection
}

function detectLowComputeDevice(nav: Navigator): boolean {
  const connection = getNetworkInformation(nav)
  const navigatorWithDeviceMemory = nav as Navigator & { deviceMemory?: number }
  return isLikelyLowComputeDevice({
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: navigatorWithDeviceMemory.deviceMemory,
    saveData: connection?.saveData,
    effectiveType: connection?.effectiveType,
  })
}

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

/**
 * Detects "lesser compute" devices (low memory/CPU and constrained network) so desktop-width
 * devices can opt into lighter experiences without being treated as mobile by viewport alone.
 */
export function useIsLowComputeDevice(): boolean | undefined {
  const [isLowCompute, setIsLowCompute] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const connection = getNetworkInformation(window.navigator)
    const onChange = () => {
      setIsLowCompute(detectLowComputeDevice(window.navigator))
    }
    connection?.addEventListener?.("change", onChange)
    onChange()
    return () => {
      connection?.removeEventListener?.("change", onChange)
    }
  }, [])

  return isLowCompute
}
