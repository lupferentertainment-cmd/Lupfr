/**
 * Home-page hash-scroll helpers.
 *
 * The home page defers its lower sections behind estimated-height placeholders.
 * Navigating straight to a deferred section used to mount only that section, so
 * the deferred sections *above* it stayed wrong-height placeholders and the
 * target's scroll position drifted while async chunks loaded — a cascade of
 * blind timers then chased the moving target for ~2s ("takes forever to scroll").
 *
 * Two helpers fix that:
 *  - `deferredSectionShouldMountForHash` mounts every deferred section at or above
 *    the target so the target is positioned against real heights.
 *  - `realignHashTargetUntilStable` re-aligns the target across animation frames
 *    only until its position stops drifting (or the user takes over), instead of
 *    firing a fixed ladder of setTimeouts.
 */

/** Deferred home sections, ordered top-to-bottom as they appear on the page. */
export const DEFERRED_SECTION_IDS = ["about", "team", "contact"] as const

export type DeferredSectionId = (typeof DEFERRED_SECTION_IDS)[number]

function hashToId(hash: string): string {
  return hash.startsWith("#") ? hash.slice(1) : hash
}

/**
 * Whether a deferred section should render its real content for the current hash.
 * True when the hash targets this section OR any deferred section below it: the
 * target's final scroll position depends on the real height of everything above.
 */
export function deferredSectionShouldMountForHash(id: string, hash: string): boolean {
  const selfIndex = DEFERRED_SECTION_IDS.indexOf(id as DeferredSectionId)
  const targetIndex = DEFERRED_SECTION_IDS.indexOf(hashToId(hash) as DeferredSectionId)
  if (selfIndex === -1 || targetIndex === -1) return false
  return targetIndex >= selfIndex
}

export interface RealignHashTargetOptions {
  getHash?: () => string
  /** Current top of the target relative to the viewport, or null if unmounted. */
  getTargetTop?: (id: string) => number | null
  scrollToTarget?: (id: string) => void
  requestFrame?: (cb: FrameRequestCallback) => number
  cancelFrame?: (handle: number) => void
  now?: () => number
  /** Attach a "user is scrolling" listener; return a detach function. */
  addUserScrollListener?: (onIntent: () => void) => () => void
  /**
   * Continuous time (ms) the target must hold still before it's considered
   * settled. Must outlast the gap between staggered deferred-chunk loads above
   * the target — a frame-count check can falsely settle during a lull between
   * chunk arrivals and leave the target shoved off-screen.
   */
  stableMs?: number
  /** Movement (px) below which the target counts as still. */
  tolerancePx?: number
  /** Hard cap so a never-settling layout cannot loop forever. */
  maxDurationMs?: number
}

const USER_SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
])

function defaultGetTargetTop(id: string): number | null {
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect().top : null
}

function defaultScrollToTarget(id: string): void {
  document.getElementById(id)?.scrollIntoView({ block: "start" })
}

function defaultAddUserScrollListener(onIntent: () => void): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (USER_SCROLL_KEYS.has(e.key)) onIntent()
  }
  window.addEventListener("wheel", onIntent, { passive: true })
  window.addEventListener("touchmove", onIntent, { passive: true })
  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("wheel", onIntent)
    window.removeEventListener("touchmove", onIntent)
    window.removeEventListener("keydown", onKeyDown)
  }
}

/**
 * Keep the hash target aligned to the top of the viewport until its position
 * stops drifting (deferred chunks finished loading), then stop. Also stops when
 * the hash no longer targets this section, when the user starts scrolling, or at
 * a hard time cap. Returns a cancel function (call it on unmount).
 */
export function realignHashTargetUntilStable(
  id: string,
  options: RealignHashTargetOptions = {}
): () => void {
  const getHash = options.getHash ?? (() => window.location.hash)
  const getTargetTop = options.getTargetTop ?? defaultGetTargetTop
  const scrollToTarget = options.scrollToTarget ?? defaultScrollToTarget
  const requestFrame = options.requestFrame ?? window.requestAnimationFrame.bind(window)
  const cancelFrame = options.cancelFrame ?? window.cancelAnimationFrame.bind(window)
  const now =
    options.now ??
    (() => (typeof performance !== "undefined" ? performance.now() : Date.now()))
  const addUserScrollListener = options.addUserScrollListener ?? defaultAddUserScrollListener
  const stableMs = options.stableMs ?? 400
  const tolerancePx = options.tolerancePx ?? 1
  const maxDurationMs = options.maxDurationMs ?? 12000

  const start = now()
  let cancelled = false
  let lastTop: number | null = null
  let stableSince: number | null = null
  let frameHandle = 0

  const stop = () => {
    if (cancelled) return
    cancelled = true
    cancelFrame(frameHandle)
    detachUserScroll()
  }

  const detachUserScroll = addUserScrollListener(stop)

  const tick = () => {
    if (cancelled) return
    if (hashToId(getHash()) !== id) return stop()
    if (now() - start >= maxDurationMs) return stop()

    const top = getTargetTop(id)
    if (top === null) {
      // Target not mounted yet — keep polling without scrolling.
      lastTop = null
      stableSince = null
      frameHandle = requestFrame(tick)
      return
    }

    if (lastTop !== null && Math.abs(top - lastTop) <= tolerancePx) {
      // Holding still — settle only after it stays put for a continuous window,
      // so a lull between staggered chunk loads above the target doesn't end it.
      if (stableSince === null) stableSince = now()
      if (now() - stableSince >= stableMs) return stop()
      lastTop = top
      frameHandle = requestFrame(tick)
      return
    }

    // First frame or the target drifted — re-align and restart the stability window.
    scrollToTarget(id)
    stableSince = null
    lastTop = getTargetTop(id)
    frameHandle = requestFrame(tick)
  }

  frameHandle = requestFrame(tick)
  return stop
}
