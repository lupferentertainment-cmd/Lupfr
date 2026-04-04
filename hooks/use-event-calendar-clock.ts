"use client"

import { useEffect, useState } from "react"

/**
 * Current instant, refreshed on an interval so upcoming / today / past labels and
 * carousel buckets can update after local (server) midnight without a full reload.
 */
export function useEventCalendarClock(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = globalThis.setInterval(() => {
      setNow(new Date())
    }, intervalMs)
    return () => globalThis.clearInterval(id)
  }, [intervalMs])

  return now
}
