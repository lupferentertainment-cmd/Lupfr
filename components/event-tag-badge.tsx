"use client"

import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { getEventTag, type EventItem } from "@/lib/events"
import { cn } from "@/lib/utils"

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
    <span suppressHydrationWarning className={cn(tag.pillClass, className)}>
      <h4 suppressHydrationWarning className={tag.textClass}>
        {tag.label}
      </h4>
    </span>
  )
}
