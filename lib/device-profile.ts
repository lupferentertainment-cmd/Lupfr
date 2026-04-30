export const MOBILE_BREAKPOINT = 768
const LOW_COMPUTE_CORE_THRESHOLD = 4
const LOW_COMPUTE_MEMORY_GB_THRESHOLD = 4
const WEAK_SIGNAL_THRESHOLD = 2

type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g"

export type DeviceComputeSignals = {
  hardwareConcurrency?: number
  deviceMemory?: number
  saveData?: boolean
  effectiveType?: EffectiveConnectionType | string
}

export type DeviceModeSignals = {
  isMobile: boolean | undefined
  isLowCompute: boolean | undefined
}

export function isLikelyLowComputeDevice({
  hardwareConcurrency,
  deviceMemory,
  saveData,
  effectiveType,
}: DeviceComputeSignals): boolean {
  if (saveData === true) return true
  if (effectiveType === "slow-2g" || effectiveType === "2g") return true

  let weakSignalCount = 0
  if (
    typeof hardwareConcurrency === "number" &&
    hardwareConcurrency > 0 &&
    hardwareConcurrency <= LOW_COMPUTE_CORE_THRESHOLD
  ) {
    weakSignalCount += 1
  }
  if (
    typeof deviceMemory === "number" &&
    deviceMemory > 0 &&
    deviceMemory <= LOW_COMPUTE_MEMORY_GB_THRESHOLD
  ) {
    weakSignalCount += 1
  }
  if (effectiveType === "3g") {
    weakSignalCount += 1
  }

  return weakSignalCount >= WEAK_SIGNAL_THRESHOLD
}

/**
 * Enable desktop-heavy motion/video only after both signals are known and favorable.
 * Unknown detection state defaults to the lighter path.
 */
export function shouldUseDesktopExperience({ isMobile, isLowCompute }: DeviceModeSignals): boolean {
  return isMobile === false && isLowCompute === false
}
