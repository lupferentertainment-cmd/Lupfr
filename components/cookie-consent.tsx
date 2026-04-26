"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    acceptCookieConsent,
    getCookieConsentAccepted,
    LUPFR_CONSENT_EVENT,
} from "@/lib/cookie-consent"
import { PRIVACY_AND_COOKIES_BANNER_COPY } from "@/lib/legal-copy"
import { cn } from "@/lib/utils"

/**
 * First-visit notice for cookies / local storage. Vercel Analytics and
 * contact-list preference cookies are enabled only after Accept.
 */
export function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (getCookieConsentAccepted()) return
        setVisible(true)
    }, [])

    useEffect(() => {
        const onConsent = () => setVisible(false)
        window.addEventListener(LUPFR_CONSENT_EVENT, onConsent)
        return () => window.removeEventListener(LUPFR_CONSENT_EVENT, onConsent)
    }, [])

    if (!visible) return null

    return (
        <div
            role="region"
            aria-label="Cookie notice"
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[110] border-t border-border bg-card/95 px-4 py-4",
                "backdrop-blur-sm shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
            )}
        >
            <div className="container mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
                <div
                    className={cn(
                        "min-h-0 flex-1 space-y-2 pr-1",
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
                            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
                        >
                            Privacy
                        </Link>
                        {" · "}
                        <Link
                            href="/terms"
                            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
                        >
                            Terms
                        </Link>
                    </p>
                </div>
                <div className="flex shrink-0 flex-col justify-end sm:justify-center">
                <button
                    type="button"
                    onClick={() => {
                        acceptCookieConsent()
                        setVisible(false)
                    }}
                    className="w-full rounded-full btn-metallic-gold px-6 py-2.5 text-sm font-semibold tracking-normal sm:w-auto"
                >
                    Accept
                </button>
                </div>
            </div>
        </div>
    )
}
