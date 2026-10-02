"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"
import { isValidEmail, isValidPhone } from "@/lib/contact-input"
import {
  PHONE_LIST_DISMISSED_KEY,
  PHONE_LIST_SUBMITTED_COOKIE,
  PHONE_LIST_SUBMITTED_KEY,
  setPhoneListCookie,
  setPhoneListPreference,
} from "@/lib/phone-list-preferences"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { TextReveal } from "@/components/text-reveal"
import { getServices } from "@/lib/data/services"

// 2026-10-02 fix, round 4 (owner: "remove event, the first should just be
// service") — this used to be the tile-picker labels for a dedicated "What
// are you planning?" step 1; that step is gone (see STEP_LABELS below), but
// the label set is kept to validate the preset-inquiry event artists.tsx's
// "Submit Your Mix" link still dispatches — that's an external preset, not
// a wizard step, and still works without the step it used to land on.
const inquiryTypes = [
  "Book an Event",
  "Corporate Event",
  "Talent Booking",
  "Submit Your Mix",
  "Venue Partnership",
  "Private Event",
  "Sponsorship",
  "Other",
]
const services = getServices()

/**
 * 2026-10-02 — "Start Planning" literal design-file port (owner: "how can
 * we get the actual claude file I built onto the website" / "continue on
 * everything"). The design's `#contact` section is a guided intake wizard
 * (services → size → budget → when/where → contact info) with a progress
 * nav and a live "brief" summary sentence, ending in a confirmation screen
 * — not the single-step form this used to be. Rebuilt as that wizard, kept
 * wired to the same real `/api/contact` endpoint (now additively extended
 * with the new optional fields below) with the same mailto fallback on
 * failure, and kept the preset-inquiry event (`components/artists.tsx`'s
 * "Submit Your Mix" link) and the separate "Join the contact list" card
 * untouched. Header kicker/heading/subtext are deliberately left as they
 * were — the design's own copy change there isn't a functional gap, just a
 * word choice, so it's not worth the churn of re-verifying every test that
 * pins today's exact heading text.
 *
 * Guest-count and budget are presented as generic ranges (not real figures
 * from anywhere) — the design's own tiles are Coda template placeholders
 * too, so a reasonable generic bucket is not a fabricated fact, just a
 * UI convenience, same reasoning as the artists bento grid's size cycle.
 * "Services needed" IS real data — `lib/data/services.ts`.
 *
 * Round 4 fix (owner report: "remove event, the first should just be
 * service") — the design file's own `stepLabels` (LUPFR Website v3.dc.html:
 * `['EVENT','SERVICES','SIZE','BUDGET','PLACE & DATE','CONTACT']`) still
 * leads with a dedicated "What are you planning?" tile-picker step; the
 * owner is deliberately overriding that here, so it's dropped and Services
 * is now step 1 of 5 (was step 2 of 6). See resolveInquiryType() below for
 * what replaced that step's job of setting the required `inquiryType`
 * field the backend/email template still needs.
 */

const STEP_LABELS = ["Services", "Size", "Budget", "Place & Date", "Contact"] as const
type Step = 1 | 2 | 3 | 4 | 5 | 6

const GUEST_BUCKETS = [
  { label: "1–50", sub: "Intimate" },
  { label: "50–150", sub: "Mid-size" },
  { label: "150–400", sub: "Large" },
  { label: "400+", sub: "Flagship" },
] as const

const BUDGET_BUCKETS = [
  { label: "Under $5K", sub: "Starter" },
  { label: "$5K–15K", sub: "Standard" },
  { label: "$15K–50K", sub: "Premium" },
  { label: "$50K–150K", sub: "Large-scale" },
  { label: "$150K+", sub: "Flagship" },
] as const

// LUPFR's own two real markets (About/footer copy) — not an exhaustive
// service area, so "Flexible / Other" covers everything else honestly.
const CITY_OPTIONS = ["Los Angeles", "San Francisco", "Flexible / Other"] as const

const PRESET_INQUIRY_EVENT = "presetInquiry"
const LUPFR_EMAIL = "will@lupfr.com"

interface WizardPayload {
  inquiryType: string
  name: string
  email: string
  company?: string
  budget?: string
  message: string
  phone?: string
  services?: string[]
  guestCount?: string
  eventDate?: string
  flexibleDate?: boolean
  city?: string
  venue?: string
}

function openContactMailto(payload: WizardPayload) {
  const subject = encodeURIComponent(`[LUPFR] ${payload.inquiryType} – ${payload.name}`)
  const lines = [
    `Inquiry: ${payload.inquiryType}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.company ? `Company: ${payload.company}` : null,
    payload.services?.length ? `Services: ${payload.services.join(", ")}` : null,
    payload.guestCount ? `Guests: ${payload.guestCount}` : null,
    payload.budget ? `Budget: ${payload.budget}` : null,
    payload.eventDate || payload.flexibleDate
      ? `When: ${payload.eventDate ?? ""}${payload.flexibleDate ? " (flexible)" : ""}`
      : null,
    payload.city ? `City: ${payload.city}` : null,
    payload.venue ? `Venue/neighborhood: ${payload.venue}` : null,
  ].filter((line): line is string => Boolean(line))
  const body = encodeURIComponent(`${lines.join("\n")}\n\nMessage:\n${payload.message}`)
  window.location.href = `mailto:${LUPFR_EMAIL}?subject=${subject}&body=${body}`
}

/**
 * Round 4 fix — `/api/contact` requires a non-empty `inquiryType` (see
 * app/api/contact/route.ts), which used to come straight from the removed
 * "What are you planning?" step. `planType` can still arrive directly from
 * the "Submit Your Mix" preset-inquiry event (artists.tsx), which bypasses
 * the wizard steps entirely and keeps working unchanged. Otherwise this
 * falls back to the real services the visitor picked in the new step 1 —
 * still a genuine category, not a fabricated one — and only reaches the
 * generic label if they skipped that too.
 */
function resolveInquiryType(planType: string | null, planServices: string[]): string {
  if (planType) return planType
  if (planServices.length) return planServices.join(", ")
  return "Event Inquiry"
}

/** The design's live-updating "brief" sentence, built only from the visitor's own answers. */
function buildBrief(a: {
  planType: string | null
  planServices: string[]
  guestCount: string | null
  budget: string | null
  eventDate: string
  flexibleDate: boolean
  city: string | null
  venue: string
}): string {
  const typePart = a.planType ? a.planType.toLowerCase() : "an event"
  const guestsPart = a.guestCount ? `${a.guestCount} guests` : "a guest count we'll figure out together"
  const cityPart = a.city && a.city !== "Flexible / Other" ? a.city : a.venue.trim() || "LA or SF"
  const whenPart = a.eventDate
    ? `${a.eventDate}${a.flexibleDate ? " (flexible)" : ""}`
    : a.flexibleDate
      ? "a flexible date"
      : "a date we'll figure out together"
  const budgetPart = a.budget ? `a budget of ${a.budget}` : "a budget to be discussed"
  const svcPart = a.planServices.length ? a.planServices.join(", ") : "your full production"
  return `We're planning ${typePart} for ${guestsPart} in ${cityPart}, around ${whenPart}, with ${budgetPart}. We need ${svcPart}.`
}

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })

  const [step, setStep] = useState<Step>(1)
  const [planType, setPlanType] = useState<string | null>(null)
  const [planServices, setPlanServices] = useState<string[]>([])
  const [guestCount, setGuestCount] = useState<string | null>(null)
  const [budget, setBudget] = useState<string | null>(null)
  const [eventDate, setEventDate] = useState("")
  const [flexibleDate, setFlexibleDate] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const [venue, setVenue] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [contactListName, setContactListName] = useState("")
  const [contactListEmail, setContactListEmail] = useState("")
  const [contactListPhone, setContactListPhone] = useState("")
  const [isContactListSubmitting, setIsContactListSubmitting] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail && inquiryTypes.includes(detail)) setPlanType(detail)
    }
    window.addEventListener(PRESET_INQUIRY_EVENT, handler)
    return () => window.removeEventListener(PRESET_INQUIRY_EVENT, handler)
  }, [])

  function toggleService(title: string) {
    setPlanServices((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]))
  }

  function resetWizard() {
    setStep(1)
    setPlanType(null)
    setPlanServices([])
    setGuestCount(null)
    setBudget(null)
    setEventDate("")
    setFlexibleDate(false)
    setCity(null)
    setVenue("")
    setName("")
    setEmail("")
    setCompany("")
    setPhone("")
    setNotes("")
  }

  function goNext() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s))
  }

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s))
  }

  async function handleWizardSubmit() {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanName || !cleanEmail) {
      toast.error("Name and email are required.")
      return
    }
    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }

    const brief = buildBrief({ planType, planServices, guestCount, budget, eventDate, flexibleDate, city, venue })
    const payload: WizardPayload = {
      inquiryType: resolveInquiryType(planType, planServices),
      name: cleanName,
      email: cleanEmail,
      company: company.trim() || undefined,
      budget: budget ?? undefined,
      message: notes.trim() || brief,
      phone: phone.trim() || undefined,
      services: planServices.length ? planServices : undefined,
      guestCount: guestCount ?? undefined,
      eventDate: eventDate || undefined,
      flexibleDate: flexibleDate || undefined,
      city: city ?? undefined,
      venue: venue.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        toast.error("Form not configured. Opening your email client to send to LUPFR instead.")
        openContactMailto(payload)
        return
      }
      toast.success("Your brief is on its way!")
      setStep(6)
    } catch {
      toast.error("Network error. Opening your email client to send to LUPFR instead.")
      openContactMailto(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const cleanName = contactListName.replace(/\s+/g, " ").trim()
    const cleanEmail = contactListEmail.replace(/\s+/g, "").trim().toLowerCase()
    const cleanPhone = contactListPhone.replace(/\s+/g, " ").trim()

    if (!cleanName) {
      toast.error("Name is required.")
      return
    }
    if (!cleanEmail && !cleanPhone) {
      toast.error("Please provide an email or phone number.")
      return
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      toast.error("Please enter a valid phone number.")
      return
    }

    setIsContactListSubmitting(true)
    try {
      const res = await fetch("/api/phone-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          ...(cleanEmail && { email: cleanEmail }),
          ...(cleanPhone && { phone: cleanPhone }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          typeof data?.error === "string" && data.error.length > 0
            ? data.error
            : "Unable to save your number right now."
        toast.error(message)
        return
      }

      setPhoneListPreference(PHONE_LIST_DISMISSED_KEY)
      setPhoneListPreference(PHONE_LIST_SUBMITTED_KEY)
      setPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)
      toast.success("You are on the contact list.")
      setContactListName("")
      setContactListEmail("")
      setContactListPhone("")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsContactListSubmitting(false)
    }
  }

  const brief = buildBrief({ planType, planServices, guestCount, budget, eventDate, flexibleDate, city, venue })

  return (
    <section
      id="contact"
      ref={ref}
      className="lupfr-section-pad relative overflow-hidden bg-card/30 px-4 sm:px-6 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-accent/5 blur-[140px]" />
        <div className="absolute right-0 top-1/2 h-[340px] w-[340px] -translate-y-1/2 rounded-full bg-gold-accent/10 blur-[130px]" />
      </div>

      <ScrollReveal variant="up" className="container relative z-10 mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 max-w-4xl text-center sm:mb-10 md:mb-12"
        >
          {/* 2026-10-02 fix (owner report: "lets create something needs to be
              fixed"): the design file's real `#contact` ("Start Planning")
              kicker/heading is "INQUIRIES" / "Start Planning" — this had kept
              the pre-redesign "Get in touch" / "Let's Create Something" copy
              on purpose (see docs/DESIGN.md) to avoid breaking a couple of
              pinned copy assertions, but the owner is now flagging that copy
              directly against the design file, which overrides that call. */}
          <p className="lupfr-section-kicker mb-4">Inquiries</p>
          <h2 className="mb-5 lupfr-heading-split-leading">
            <GoldShineText scrollTargetRef={ref}>Start</GoldShineText>{" "}
            <span className="lupfr-heading-subline">Planning</span>
          </h2>
          {/* "Ready to elevate" card retired; its copy lives here under the heading (owner request, 2026-07-02). */}
          <TextReveal
            text="Whether you're planning a corporate event, looking for DJ talent, or want to partner on a production, we'd love to hear from you."
            className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          />
          <div className="mt-5 inline-flex rounded-full border border-gold-accent/35 bg-gold-accent/10 px-3 py-1 text-xs tracking-normal text-gold-accent">
            Five quick steps. We&apos;ll take it from there.
          </div>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="rounded-md border border-border/80 bg-card/70 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.07),0_20px_48px_-8px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7 md:p-8">
              {step !== 6 ? (
                <div role="tablist" aria-label="Start Planning steps" className="relative mb-7 grid grid-cols-3 gap-y-5 sm:grid-cols-5">
                  <span aria-hidden className="absolute left-0 right-0 top-5 h-px bg-border" />
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 h-px bg-[var(--gold)] transition-[width] duration-300"
                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                  />
                  {STEP_LABELS.map((label, i) => {
                    const n = i + 1
                    const isActive = step === n
                    const isDone = step > n
                    return (
                      <button
                        key={label}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setStep(n as Step)}
                        className="relative z-[1] flex min-w-0 flex-col items-start gap-1.5 bg-transparent px-0 text-left"
                      >
                        <span className={`font-mono text-[10px] tracking-[0.12em] ${isActive || isDone ? "text-gold-accent" : "text-muted-foreground"}`}>
                          {String(n).padStart(2, "0")}
                        </span>
                        <span className={`font-mono text-[9.5px] uppercase tracking-[0.12em] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="min-h-[220px]"
              >
                  {step === 1 ? (
                    <div>
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <h3 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          What do you need from us?
                        </h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          Select all that apply
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {services.map((service) => {
                          const Icon = service.icon
                          const isChecked = planServices.includes(service.title)
                          return (
                            <button
                              key={service.title}
                              type="button"
                              onClick={() => toggleService(service.title)}
                              aria-pressed={isChecked}
                              className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-left transition-colors ${
                                isChecked ? "border-accent bg-accent/10" : "border-border bg-secondary hover:border-accent/50"
                              }`}
                            >
                              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-gold-accent/40 bg-background">
                                <Icon size={15} className="text-gold-accent" aria-hidden />
                              </span>
                              <span className="flex-1 text-sm text-foreground">{service.title}</span>
                              <span className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[3px] border ${isChecked ? "border-accent bg-accent text-background" : "border-border"}`}>
                                {isChecked ? <Check size={11} aria-hidden /> : null}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div>
                      <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        How big is it?
                      </h3>
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Estimated guests
                      </span>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {GUEST_BUCKETS.map(({ label, sub }) => {
                          const isActive = guestCount === label
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setGuestCount(label)}
                              aria-pressed={isActive}
                              className={`flex flex-col gap-1 rounded-sm border px-4 py-3.5 text-left transition-colors ${
                                isActive ? "border-accent bg-accent/10" : "border-border bg-secondary hover:border-accent/50"
                              }`}
                            >
                              <span className="font-serif text-lg font-bold text-foreground">{label}</span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{sub}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div>
                      <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        What&apos;s the budget?
                      </h3>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {BUDGET_BUCKETS.map(({ label, sub }) => {
                          const isActive = budget === label
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setBudget(label)}
                              aria-pressed={isActive}
                              className={`flex flex-col gap-1 rounded-sm border px-4 py-3.5 text-left transition-colors ${
                                isActive ? "border-accent bg-accent/10" : "border-border bg-secondary hover:border-accent/50"
                              }`}
                            >
                              <span className="font-serif text-lg font-bold text-foreground">{label}</span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{sub}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          When and where?
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Date</span>
                            <input
                              type="date"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFlexibleDate((v) => !v)}
                            aria-pressed={flexibleDate}
                            className="flex items-center gap-2"
                          >
                            <span className={`relative h-[18px] w-[30px] rounded-full transition-colors ${flexibleDate ? "bg-accent" : "bg-border"}`}>
                              <span
                                className="absolute top-[2px] h-[14px] w-[14px] rounded-full bg-background transition-[left]"
                                style={{ left: flexibleDate ? 14 : 2 }}
                              />
                            </span>
                            <span className="text-sm text-muted-foreground">Flexible</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">City</span>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          {CITY_OPTIONS.map((label) => {
                            const isActive = city === label
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => setCity(label)}
                                aria-pressed={isActive}
                                className={`rounded-sm border px-4 py-3.5 text-left text-sm transition-colors ${
                                  isActive ? "border-accent bg-accent/10 text-foreground" : "border-border bg-secondary text-foreground hover:border-accent/50"
                                }`}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          Venue or neighborhood (optional)
                        </label>
                        <input
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          placeholder="Rooftop, yacht, our office..."
                          className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ) : null}

                  {step === 5 ? (
                    <div className="space-y-4">
                      <h3 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Who should we talk to?
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Name</label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                            placeholder="you@company.com"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Company (optional)</label>
                          <input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                            placeholder="Company or organization"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Phone (optional)</label>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Anything else? (optional)</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                          placeholder="The vibe you're after, must-haves, questions..."
                        />
                      </div>
                    </div>
                  ) : null}

                  {step === 6 ? (
                    <div className="flex flex-col items-start gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] text-background">
                        <Check size={22} aria-hidden />
                      </span>
                      <h3 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Your brief is on its way.
                      </h3>
                      <p className="max-w-md text-sm text-muted-foreground">
                        Thanks, {name.trim().split(" ")[0] || "there"}. Someone from the LUPFR team will reply within
                        two business days to talk through ideas, venues and next steps.
                      </p>
                      <div className="w-full rounded-sm border border-gold-accent/35 bg-gold-accent/5 p-5">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-accent">Your brief</p>
                        <p className="font-serif text-base leading-relaxed text-foreground">{brief}</p>
                      </div>
                      <button
                        type="button"
                        onClick={resetWizard}
                        className="border-b border-gold-accent font-mono text-[10.5px] uppercase tracking-[0.12em] text-gold-accent"
                      >
                        Start another brief
                      </button>
                    </div>
                  ) : null}
                </motion.div>

              {step !== 6 ? (
                <div className="mt-6 rounded-sm border border-gold-accent/30 bg-gold-accent/5 p-4">
                  <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold-accent">Your brief</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{brief}</p>
                </div>
              ) : null}

              {step !== 6 ? (
                <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground ${step === 1 ? "invisible" : ""}`}
                  >
                    <ArrowLeft size={13} aria-hidden /> Back
                  </button>
                  {step < 5 ? (
                    <motion.button
                      type="button"
                      onClick={goNext}
                      className="btn-metallic-gold flex items-center gap-2 rounded-full px-6 py-3 font-semibold tracking-normal transition-opacity"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    >
                      Next <ArrowRight size={16} aria-hidden />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleWizardSubmit}
                      disabled={isSubmitting}
                      className="btn-metallic-gold flex items-center gap-2 rounded-full px-6 py-3 font-semibold tracking-normal transition-opacity disabled:opacity-50"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    >
                      {isSubmitting ? "Sending..." : <>Send Brief <ArrowRight size={16} aria-hidden /></>}
                    </motion.button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-md border border-border/80 bg-card/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.07),0_20px_48px_-8px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7">
              <p className="mb-2 text-xs tracking-tight text-gold-accent">Join the contact list</p>
              <h3 className="mb-1 font-serif text-2xl font-bold tracking-tight">Stay in the loop</h3>
              <p className="mb-5 text-sm text-muted-foreground">Get priority updates for events, bookings, and announcements.</p>
              <form onSubmit={handleContactListSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Name</label>
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={contactListName}
                    onChange={(e) => setContactListName(e.target.value)}
                    className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={contactListEmail}
                      onChange={(e) => setContactListEmail(e.target.value)}
                      className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Phone number</label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={contactListPhone}
                      onChange={(e) => setContactListPhone(e.target.value)}
                      className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isContactListSubmitting}
                  className="btn-metallic-gold flex w-full items-center justify-center gap-3 rounded-full px-8 py-3 font-semibold tracking-normal transition-opacity hover:opacity-95 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                >
                  {isContactListSubmitting ? "Saving..." : "Join"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  )
}
