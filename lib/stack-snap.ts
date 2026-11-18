/**
 * Card-by-card snapping for the sticky "Featured Experiences" stack (Round 16).
 *
 * The cards pin one over another (`position: sticky`, `top = 92 + index * 16`). Card `i` sits fully
 * "in focus" at the scroll position where its natural (unstuck) top meets its sticky top. Those scroll
 * positions are the snap stops; everything here is pure so it can be unit-tested without a browser.
 */

/** Scroll offsets (px from the top of the document) at which each card is fully in focus. */
export function stackPositions(containerDocTop: number, pitch: number, stickyTops: readonly number[]): number[] {
  return stickyTops.map((sticky, i) => Math.round(containerDocTop + i * pitch - sticky))
}

/**
 * The scroll offset a wheel/key/swipe step in `dir` (1 = down, -1 = up) should snap to, or `null` when
 * the page should scroll normally (above the zone, past the last card, or no stops).
 *
 * - Down: from `entryPx` above the first card through to the last card; the last card then lets the page
 *   leave the section naturally.
 * - Up: mirror image, so scrolling back up from below lands on the last card before stepping through.
 * `tolerancePx` treats "almost on a stop" as on it, so a 3px drift never re-snaps to the same card.
 */
export function snapTarget(scrollY: number, dir: 1 | -1, positions: readonly number[], entryPx: number, tolerancePx = 8): number | null {
  const first = positions[0]
  const last = positions[positions.length - 1]
  if (first === undefined || last === undefined) return null
  if (dir === 1) {
    if (scrollY >= last - tolerancePx || scrollY < first - entryPx) return null
    return positions.find((p) => p > scrollY + tolerancePx) ?? null
  }
  if (scrollY <= first + tolerancePx || scrollY > last + entryPx) return null
  return [...positions].reverse().find((p) => p < scrollY - tolerancePx) ?? null
}

/**
 * Trackpad inertia keeps firing wheel events for a second after the fingers lift, with shrinking deltas.
 * After a snap's lock expires, only a pause in events or a delta that grows again counts as a new gesture.
 */
export function isFreshWheel(prevAbsDelta: number, absDelta: number, gapMs: number): boolean {
  return gapMs > 80 || absDelta > prevAbsDelta + 2
}
