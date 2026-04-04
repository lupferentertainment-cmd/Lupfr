"use client"

import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { getEventTag, type EventItem } from "@/lib/events"

/** Client badge so label updates from Upcoming → Today’s Event → Past across midnight (LUPFR TZ). */
export function EventTagBadge({
  event,
  className = "",
}: {
  event: EventItem
  className?: string
}) {
  const now = useEventCalendarClock()
  const tag = getEventTag(event, now)
  return (
    <span suppressHydrationWarning className={`${tag.color} ${className}`.trim()}>
      {tag.label}
    </span>
  )
}
