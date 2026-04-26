"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { toast } from "sonner"
import { isValidPhone } from "@/lib/contact-input"
import { getCookieConsentAccepted } from "@/lib/cookie-consent"

const POPUP_DISMISSED_KEY = "lupfr-phone-popup-dismissed"
const POPUP_SUBMITTED_KEY = "lupfr-phone-popup-submitted"
const POPUP_DISMISSED_COOKIE = "lupfr_phone_popup_dismissed"
const POPUP_SUBMITTED_COOKIE = "lupfr_phone_popup_submitted"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const SHOW_DELAY_MS = 2500

function hasCookie(name: string): boolean {
    if (typeof document === "undefined") return false
    return document.cookie.split(";").some((chunk) => chunk.trim().startsWith(`${name}=`))
}

function setPhoneListCookie(name: string, value: string): void {
    if (!getCookieConsentAccepted() || typeof document === "undefined") return
    document.cookie = `${name}=${value}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

export function PhoneListPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const dismissed = window.localStorage.getItem(POPUP_DISMISSED_KEY) === "1"
        const submitted = window.localStorage.getItem(POPUP_SUBMITTED_KEY) === "1"
        const dismissedByCookie = hasCookie(POPUP_DISMISSED_COOKIE)
        const submittedByCookie = hasCookie(POPUP_SUBMITTED_COOKIE)
        if (dismissed || submitted || dismissedByCookie || submittedByCookie) return

        const timer = window.setTimeout(() => {
            setIsOpen(true)
        }, SHOW_DELAY_MS)

        return () => window.clearTimeout(timer)
    }, [])

    const closePopup = useCallback(() => {
        window.localStorage.setItem(POPUP_DISMISSED_KEY, "1")
        setPhoneListCookie(POPUP_DISMISSED_COOKIE, "1")
        setIsOpen(false)
    }, [])

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closePopup()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen, closePopup])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const cleanName = name.replace(/\s+/g, " ").trim()
        const cleanPhone = phone.replace(/\s+/g, " ").trim()

        if (!cleanName || !cleanPhone) {
            toast.error("Name and phone number are required.")
            return
        }

        if (!isValidPhone(cleanPhone)) {
            toast.error("Please enter a valid phone number.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/phone-list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: cleanName, phone: cleanPhone }),
            })
            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                const error =
                    typeof data?.error === "string" && data.error.length > 0
                        ? data.error
                        : "Unable to save your number right now."
                toast.error(error)
                return
            }

            window.localStorage.setItem(POPUP_SUBMITTED_KEY, "1")
            setPhoneListCookie(POPUP_SUBMITTED_COOKIE, "1")
            setIsOpen(false)
            toast.success("You are on the contact list.")
            setName("")
            setPhone("")
        } catch {
            toast.error("Network error. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    data-lupfr-phone-list-open="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] p-4 sm:p-6"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePopup()
                    }}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Join the contact list"
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="mx-auto mt-[10vh] w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-gold-accent tracking-tight text-xs">Join the contact list</p>
                                <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground">
                                    Stay in the loop
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closePopup}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="contact-list-name" className="mb-1.5 block text-xs tracking-normal text-gold-accent/90">
                                    Name
                                </label>
                                <input
                                    id="contact-list-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-list-phone" className="mb-1.5 block text-xs tracking-normal text-gold-accent/90">
                                    Phone number
                                </label>
                                <input
                                    id="contact-list-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                                    placeholder="(415) 555-0100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-full btn-metallic-gold px-5 py-3 font-semibold tracking-normal disabled:opacity-60"
                            >
                                {isSubmitting ? "Saving..." : "Join"}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}
