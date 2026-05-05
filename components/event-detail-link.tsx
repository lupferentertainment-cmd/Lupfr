"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"
import { eventDetailPath } from "@/lib/events"
import { cn } from "@/lib/utils"

const PENDING_RESET_MS = 4000

export function EventDetailLink({
    slug,
    children,
    className,
    ariaLabel,
}: {
    slug: string
    children: ReactNode
    className?: string
    ariaLabel?: string
}) {
    const router = useRouter()
    const href = eventDetailPath(slug)
    const hasPrefetchedRef = useRef(false)
    const pendingTimerRef = useRef<number | null>(null)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        hasPrefetchedRef.current = false
    }, [href])

    useEffect(() => {
        return () => {
            if (pendingTimerRef.current !== null) {
                window.clearTimeout(pendingTimerRef.current)
            }
        }
    }, [])

    const prefetchRoute = useCallback(() => {
        if (hasPrefetchedRef.current) return
        hasPrefetchedRef.current = true
        router.prefetch(href)
    }, [href, router])

    const markPending = useCallback(() => {
        setIsPending(true)
        if (pendingTimerRef.current !== null) {
            window.clearTimeout(pendingTimerRef.current)
        }
        pendingTimerRef.current = window.setTimeout(() => {
            setIsPending(false)
            pendingTimerRef.current = null
        }, PENDING_RESET_MS)
    }, [])

    const handlePointerEnter = () => {
        prefetchRoute()
    }

    const handleFocus = () => {
        prefetchRoute()
    }

    const handleTouchStart = () => {
        markPending()
        prefetchRoute()
    }

    const handlePointerDown = () => {
        markPending()
        prefetchRoute()
    }

    const handleClick = () => {
        markPending()
        prefetchRoute()
    }

    const clearPending = () => {
        if (pendingTimerRef.current !== null) {
            window.clearTimeout(pendingTimerRef.current)
            pendingTimerRef.current = null
    }
        setIsPending(false)
    }

    return (
        <Link
            href={href}
            prefetch
            aria-label={ariaLabel}
            data-pending={isPending ? "true" : "false"}
            className={cn(
                "block touch-manipulation motion-safe:transition-[opacity,transform] motion-safe:duration-100 motion-safe:ease-out",
                "active:scale-[0.99] data-[pending=true]:scale-[0.99] data-[pending=true]:opacity-80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                className
            )}
            onPointerEnter={handlePointerEnter}
            onFocus={handleFocus}
            onTouchStart={handleTouchStart}
            onPointerDown={handlePointerDown}
            onPointerCancel={clearPending}
            onBlur={clearPending}
            onClick={handleClick}
        >
            {children}
        </Link>
    )
}