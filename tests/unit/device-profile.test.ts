import { describe, expect, it } from "vitest"

import { isLikelyLowComputeDevice, shouldUseDesktopExperience } from "@/lib/device-profile"

describe("device profile", () => {
  it("marks save-data as low-compute", () => {
    expect(isLikelyLowComputeDevice({ saveData: true })).toBe(true)
  })

  it("marks very slow network tiers as low-compute", () => {
    expect(isLikelyLowComputeDevice({ effectiveType: "2g" })).toBe(true)
    expect(isLikelyLowComputeDevice({ effectiveType: "slow-2g" })).toBe(true)
  })

  it("requires multiple weak signals for conservative low-compute detection", () => {
    expect(isLikelyLowComputeDevice({ hardwareConcurrency: 4 })).toBe(false)
    expect(isLikelyLowComputeDevice({ deviceMemory: 4 })).toBe(false)
    expect(
      isLikelyLowComputeDevice({
        hardwareConcurrency: 4,
        deviceMemory: 4,
      })
    ).toBe(true)
  })

  it("keeps stronger desktop profiles out of low-compute mode", () => {
    expect(
      isLikelyLowComputeDevice({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        effectiveType: "4g",
      })
    ).toBe(false)
  })

  it("uses lighter path until both desktop and non-low-compute are confirmed", () => {
    expect(shouldUseDesktopExperience({ isMobile: undefined, isLowCompute: undefined })).toBe(false)
    expect(shouldUseDesktopExperience({ isMobile: false, isLowCompute: undefined })).toBe(false)
    expect(shouldUseDesktopExperience({ isMobile: false, isLowCompute: true })).toBe(false)
    expect(shouldUseDesktopExperience({ isMobile: true, isLowCompute: false })).toBe(false)
    expect(shouldUseDesktopExperience({ isMobile: false, isLowCompute: false })).toBe(true)
  })
})
