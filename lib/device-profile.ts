export const MOBILE_BREAKPOINT = 768

type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g"

export type DeviceComputeSignals = {
  hardwareConcurrency?: number
  deviceMemory?: number
  saveData?: boolean
  effectiveType?: EffectiveConnectionType | string
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
  if (typeof hardwareConcurrency === "number" && hardwareConcurrency > 0 && hardwareConcurrency <= 4) {
    weakSignalCount += 1
  }
  if (typeof deviceMemory === "number" && deviceMemory > 0 && deviceMemory <= 4) {
    weakSignalCount += 1
  }
  if (effectiveType === "3g") {
    weakSignalCount += 1
  }

  return weakSignalCount >= 2
}
