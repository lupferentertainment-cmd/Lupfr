"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { LINKS } from "@/lib/links"
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

const socialLinks = [
  { name: "Instagram", href: LINKS.instagram },
  { name: "TikTok", href: LINKS.tiktok },
  { name: "YouTube", href: LINKS.youtube },
]

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

// Phone stored as char codes so it's not plain text in source or initial HTML; decoded and rendered client-side only.
const PHONE_CHAR_CODES = [53, 48, 51, 45, 52, 48, 55, 45, 54, 49, 48, 57]

function ProtectedPhone() {
  const [decoded, setDecoded] = useState<string | null>(null)
  useEffect(() => {
    setDecoded(String.fromCharCode(...PHONE_CHAR_CODES))
  }, [])
  if (!decoded) return <span className="inline-block min-w-[10ch]" aria-hidden />
  return (
    <span
      className="select-none inline-flex items-center gap-0.5 text-foreground"
      aria-label={`Phone: ${decoded}`}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      {decoded.split("").map((char, i) => (
        <span key={i} className="inline-block select-none">
          {char}
        </span>
      ))}
    </span>
  )
}

const PRESET_INQUIRY_EVENT = "presetInquiry"
const LUPFR_EMAIL = "will@lupfr.com"

function openContactMailto(payload: {
  inquiryType: string
  name: string
  email: string
  company?: string
  budget?: string
  message: string
}) {
  const subject = encodeURIComponent(`[LUPFR] ${payload.inquiryType} – ${payload.name}`)
  const body = encodeURIComponent(
    `Inquiry: ${payload.inquiryType}\nName: ${payload.name}\nEmail: ${payload.email}\n` +
    (payload.company ? `Company: ${payload.company}\n` : "") +
    (payload.budget ? `Budget: ${payload.budget}\n` : "") +
    `\nMessage:\n${payload.message}`
  )
  window.location.href = `mailto:${LUPFR_EMAIL}?subject=${subject}&body=${body}`
}

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactListName, setContactListName] = useState("")
  const [contactListEmail, setContactListEmail] = useState("")
  const [contactListPhone, setContactListPhone] = useState("")
  const [isContactListSubmitting, setIsContactListSubmitting] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail && inquiryTypes.includes(detail)) setSelectedType(detail)
    }
    window.addEventListener(PRESET_INQUIRY_EVENT, handler)
    return () => window.removeEventListener(PRESET_INQUIRY_EVENT, handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedType) {
      toast.error("Please select an inquiry type.")
      return
    }
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      inquiryType: selectedType,
      name: (formData.get("name") as string)?.trim() ?? "",
      email: (formData.get("email") as string)?.trim() ?? "",
      company: (formData.get("company") as string)?.trim() || undefined,
      budget: (formData.get("budget") as string)?.trim() || undefined,
      message: (formData.get("message") as string)?.trim() ?? "",
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("Form not configured. Opening your email client to send to LUPFR instead.")
        openContactMailto(payload)
        return
      }
      toast.success("Message sent! We'll get back to you soon.")
      form.reset()
      setSelectedType(null)
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

  return (
    <section
      id="contact"
      ref={ref}
      className="relative overflow-hidden bg-card/30 px-4 py-20 sm:px-6 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-accent/5 blur-[140px]" />
        <div className="absolute right-0 top-1/2 h-[340px] w-[340px] -translate-y-1/2 rounded-full bg-gold-accent/10 blur-[130px]" />
      </div>

      <ScrollReveal variant="up" className="container relative z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-4xl text-center sm:mb-12 md:mb-16"
        >
          <p className="mb-4 text-sm tracking-tight text-gold-accent">Get in touch</p>
          <h2 className="mb-5 lupfr-heading-split-leading">
            <GoldShineText scrollTargetRef={ref}>Let&apos;s Create</GoldShineText>
            <br />
            <span className="lupfr-heading-subline">Something</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tell us what you&apos;re building and we&apos;ll shape the right sound, talent, and production plan around it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          <motion.aside
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur">
              <h3 className="mb-4 text-2xl font-bold">Ready to elevate your event?</h3>
              <p className="leading-relaxed text-muted-foreground">
                Whether you&apos;re planning a corporate event, looking for DJ talent, or want to partner on a production, we&apos;d love to hear from you.
              </p>
              <div className="mt-5 inline-flex rounded-full border border-gold-accent/35 bg-gold-accent/10 px-3 py-1 text-xs tracking-normal text-gold-accent">
                Typical response in 24 hours
              </div>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <Mail size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email us</p>
                    <a href="mailto:will@lupfr.com" className="text-foreground transition-colors hover:text-accent">
                      will@lupfr.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <MapPin size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Based in</p>
                    <p className="text-foreground">San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <Phone size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call us</p>
                    <p className="text-foreground">
                      <ProtectedPhone />
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 border-t border-border/70 pt-5">
                <p className="mb-3 text-sm text-muted-foreground">Follow the movement</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-secondary px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {social.name}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 lg:col-span-8"
          >
            <div className="rounded-3xl border border-border/80 bg-card/70 p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium tracking-tight text-gold-accent">
                    What can we help with?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {inquiryTypes.map((type) => (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`min-h-[44px] rounded-2xl border px-3 py-2.5 text-xs transition-[border-color,background-color,color] sm:min-h-0 sm:px-4 sm:text-sm ${selectedType === type
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-card/50 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{ scale: selectedType === type ? 1.02 : 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">
                      Company / Venue (optional)
                    </label>
                    <input
                      name="company"
                      type="text"
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="Your organization"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Budget (optional)</label>
                    <input
                      name="budget"
                      type="text"
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="Budget range or amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs tracking-normal text-gold-accent/90">Tell us more</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                    placeholder="Share details about your event, project, or inquiry..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-metallic-gold group flex min-w-0 w-full items-center justify-center gap-3 rounded-full px-8 py-4 font-semibold tracking-normal transition-opacity hover:opacity-95 disabled:opacity-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7">
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
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
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
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
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
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
                      placeholder="(415) 555-0100"
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
