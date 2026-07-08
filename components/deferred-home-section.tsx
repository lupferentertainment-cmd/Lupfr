"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import {
  deferredSectionShouldMountForHash,
  realignHashTargetUntilStable,
} from "@/lib/hash-scroll"

const DEFERRED_SECTION_ROOT_MARGIN_DESKTOP = "1400px 0px"
const DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "900px 0px"

function deferredSectionRootMargin(): string {
  if (window.matchMedia("(max-width: 767px)").matches) {
    return DEFERRED_SECTION_ROOT_MARGIN_MOBILE
  }
  return DEFERRED_SECTION_ROOT_MARGIN_DESKTOP
}

/**
 * A below-the-fold home section that renders an estimated-height placeholder
 * until it should mount its real content. It mounts when the current hash targets
 * this section OR any deferred section below it (so the target lands against real
 * heights — see `lib/hash-scroll.ts`), or when it scrolls into view. Once mounted
 * it runs the bounded realign loop; only the section the hash actually targets
 * scrolls, others bail out on the first frame.
 */
export function DeferredHomeSection({
  id,
  estimatedHeightClassName,
  children,
}: {
  id: string
  estimatedHeightClassName: string
  children: ReactNode
}) {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  // Decide synchronously so a hash-targeted section (or any section above the
  // target) renders its real height on first paint — no placeholder flash and no
  // drifting scroll position for the deferred chunks above the target to chase.
  const [shouldMount, setShouldMount] = useState(
    () => typeof window !== "undefined" && deferredSectionShouldMountForHash(id, window.location.hash)
  )

  useEffect(() => {
    if (shouldMount) return

    const node = anchorRef.current
    if (!node || !("IntersectionObserver" in window)) {
      const timeoutId = window.setTimeout(() => setShouldMount(true), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true)
          observer.disconnect()
        }
      },
      { rootMargin: deferredSectionRootMargin() }
    )

    observer.observe(node)

    const onHashChange = () => {
      if (deferredSectionShouldMountForHash(id, window.location.hash)) {
        setShouldMount(true)
        observer.disconnect()
      }
    }
    window.addEventListener("hashchange", onHashChange)

    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", onHashChange)
    }
  }, [id, shouldMount])

  useEffect(() => {
    if (!shouldMount) return
    // Only the section the hash actually targets re-aligns; sections mounted
    // solely to give the target real height above it bail out on the first frame.
    const cancel = realignHashTargetUntilStable(id)
    return cancel
  }, [id, shouldMount])

  if (shouldMount) return <>{children}</>

  return (
    <div
      id={id}
      ref={anchorRef}
      className={estimatedHeightClassName}
      aria-hidden="true"
    />
  )
}
