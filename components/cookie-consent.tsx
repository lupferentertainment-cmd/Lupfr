"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    acceptCookieConsent,
    getCookieConsentAccepted,
    LUPFR_CONSENT_EVENT,
} from "@/lib/cookie-consent"
import { PRIVACY_AND_COOKIES_BANNER_COPY } from "@/lib/legal-copy"
import { cn } from "@/lib/utils"

const COOKIE_NOTICE_DELAY_MS = 4500

/**
 * First-visit notice for cookies / local storage. Vercel Analytics and
 * contact-list preference cookies are enabled only after Accept.
 */
export function CookieConsent() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)
    const isAdminRoute =
        typeof pathname === "string" &&
        (pathname === "/admin" || pathname.startsWith("/admin/"))

    useEffect(() => {
        if (isAdminRoute) return
        if (getCookieConsentAccepted()) return
        const timeoutId = window.setTimeout(
            () => setVisible(true),
            COOKIE_NOTICE_DELAY_MS
        )
        return () => window.clearTimeout(timeoutId)
    }, [isAdminRoute])

    useEffect(() => {
        const onConsent = () => setVisible(false)
        window.addEventListener(LUPFR_CONSENT_EVENT, onConsent)
        return () => window.removeEventListener(LUPFR_CONSENT_EVENT, onConsent)
    }, [])

    if (isAdminRoute || !visible) return null

    return (
        <div
            role="region"
            aria-label="Cookie notice"
            className={cn(
                "fixed left-1/2 z-[110] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2",
                "bottom-[max(1rem,env(safe-area-inset-bottom))] rounded-md border border-border/80",
                "bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-md"
            )}
        >
            <div className="flex flex-col gap-4">
                <div
                    className={cn(
                        "min-h-0 space-y-2 pr-1",
                        "text-xs text-muted-foreground sm:text-sm"
                    )}
                >
                    <h2 className="text-sm font-semibold text-foreground sm:text-base">
                        Privacy &amp; cookies
                    </h2>
                    <p className="leading-relaxed">{PRIVACY_AND_COOKIES_BANNER_COPY}</p>
                    <p className="text-[0.7rem] text-muted-foreground/90 sm:text-xs">
                        <Link
                            href="/privacy"
                            prefetch={false}
                            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
                        >
                            Privacy
                        </Link>
                        {" · "}
                        <Link
                            href="/terms"
                            prefetch={false}
                            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
                        >
                            Terms
                        </Link>
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            acceptCookieConsent()
                            setVisible(false)
                        }}
                        className="min-w-28 rounded-md btn-metallic-gold px-6 py-2.5 text-sm font-semibold tracking-normal"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}
