/**
 * Wall-clock budgets for pure data helpers (catches accidental O(n²) or heavy work on hot paths).
 * Warm up before timing; use generous ceilings so CI VMs do not flake.
 */
import { describe, expect, it } from "vitest"
import {
  GALLERY_PHOTOS,
  type GalleryPhoto,
} from "@/lib/data/gallery"
import { groupGalleryByDateISO } from "@/lib/gallery-date"
import { galleryCircularPreloadIndices, galleryLinearPreloadIndices } from "@/lib/gallery-nav"
import { getPastEvents, getUpcomingEvents } from "@/lib/events"

/** Fixed “now” in America/Los_Angeles (matches events unit tests). */
const fixedNow = new Date("2026-04-01T20:00:00-07:00")

function warmup(iterations: number, fn: () => void): void {
  for (let i = 0; i < iterations; i += 1) {
    fn()
  }
}

/** Total milliseconds for `count` calls after warmup. */
function bulkElapsedMs(count: number, fn: () => void): number {
  warmup(10, fn)
  const t0 = performance.now()
  for (let i = 0; i < count; i += 1) {
    fn()
  }
  return performance.now() - t0
}

function bestBulkElapsedMs(samples: number, count: number, fn: () => void): number {
  let best = Number.POSITIVE_INFINITY
  for (let i = 0; i < samples; i += 1) {
    best = Math.min(best, bulkElapsedMs(count, fn))
  }
  return best
}

describe("data layer performance budgets", () => {
  it("getUpcomingEvents + getPastEvents on real YAML-backed data", () => {
    const iterations = 1_200
    const ms = bestBulkElapsedMs(3, iterations, () => {
      getUpcomingEvents(fixedNow)
      getPastEvents(fixedNow)
    })
    expect(ms).toBeLessThan(700)
  })

  it("groupGalleryByDateISO over full GALLERY_PHOTOS", () => {
    const iterations = 500
    const ms = bulkElapsedMs(iterations, () => {
      groupGalleryByDateISO(GALLERY_PHOTOS)
    })
    expect(ms).toBeLessThan(300)
  })

  it("gallery preload indices at large synthetic length (O(radius) per call)", () => {
    const length = 2_000
    const index = 1_000
    const radius = 2
    const iterations = 5_000
    const ms = bulkElapsedMs(iterations, () => {
      galleryCircularPreloadIndices(length, index, radius)
      galleryLinearPreloadIndices(length, index, radius)
    })
    expect(ms).toBeLessThan(500)
  })

  it("groupGalleryByDateISO scales roughly linearly with row count", () => {
    const base = GALLERY_PHOTOS[0] as GalleryPhoto | undefined
    expect(base).toBeDefined()
    const small: GalleryPhoto[] = Array.from({ length: 80 }, (_, i) => ({
      ...base!,
      id: 100_000 + i,
      src: `${base!.src}-${i}`,
    }))
    const large: GalleryPhoto[] = Array.from({ length: 800 }, (_, i) => ({
      ...base!,
      id: 200_000 + i,
      src: `${base!.src}-L-${i}`,
    }))
    warmup(3, () => {
      groupGalleryByDateISO(small)
      groupGalleryByDateISO(large)
    })
    // Compare equal total work to avoid tiny-input timer noise on CI VMs.
    const tSmall = bestBulkElapsedMs(3, 800, () => {
      groupGalleryByDateISO(small)
    })
    const tLarge = bestBulkElapsedMs(3, 80, () => {
      groupGalleryByDateISO(large)
    })

    // Large input should stay within a broad constant-factor bound for equal row volume.
    expect(tLarge).toBeLessThan(tSmall * 20 + 50)
  })
})
