"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { LINKS } from "@/lib/links"
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
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {decoded.split("").map((char, i) => (
        <span key={i} className="inline-block" style={{ WebkitUserSelect: "none", userSelect: "none" }}>
          {char}
        </span>
      ))}
    </span>
  )
}

const PRESET_INQUIRY_EVENT = "presetInquiry"
const LUPFR_EMAIL = "will@lupfr.com"
const POPUP_DISMISSED_KEY = "lupfr-phone-popup-dismissed"
const POPUP_SUBMITTED_KEY = "lupfr-phone-popup-submitted"
const POPUP_SUBMITTED_COOKIE = "lupfr_phone_popup_submitted"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${value}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

function isValidPhone(phone: string): boolean {
  return /^[0-9+()\-\s]{7,24}$/.test(phone)
}

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
    const cleanPhone = contactListPhone.replace(/\s+/g, " ").trim()

    if (!cleanName || !cleanPhone) {
      toast.error("Name and phone number are required.")
      return
    }
    if (!isValidPhone(cleanPhone)) {
      toast.error("Please enter a valid phone number.")
      return
    }

    setIsContactListSubmitting(true)
    try {
      const res = await fetch("/api/phone-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, phone: cleanPhone }),
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

      window.localStorage.setItem(POPUP_DISMISSED_KEY, "1")
      window.localStorage.setItem(POPUP_SUBMITTED_KEY, "1")
      setCookie(POPUP_SUBMITTED_COOKIE, "1")
      toast.success("You are on the contact list.")
      setContactListName("")
      setContactListPhone("")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsContactListSubmitting(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-card/30">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[200px]" />

      <ScrollReveal variant="up" className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">Get In Touch</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            <GoldShineText scrollTargetRef={ref}>Let&apos;s Create</GoldShineText>
            <br />
            <span className="text-muted-foreground">Something</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 sm:gap-12 lg:gap-16">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Ready to elevate your event?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you&apos;re planning a corporate event, looking for DJ talent, or want to partner on a production—we&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Mail size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email us</p>
                  <a href="mailto:will@lupfr.com" className="text-foreground hover:text-accent transition-colors">
                    will@lupfr.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Based in</p>
                  <p className="text-foreground">San Francisco, CA</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
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

            {/* Social Links */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">Follow the movement</p>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.name}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type – label and tabs match section fold (gold-accent eyebrow + card-style borders) */}
              <div>
                <label className="block text-gold-accent uppercase tracking-[0.3em] text-sm mb-3">
                  What can we help with?
                </label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-3 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition-[border-color,background-color,color] min-h-[44px] sm:min-h-0 ${
                        selectedType === type
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground bg-card/50"
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

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Company / Venue (optional)</label>
                <input
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  placeholder="Your organization"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Budget (optional)</label>
                <input
                  name="budget"
                  type="text"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  placeholder="Budget range or amount"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Tell us more</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors resize-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Share details about your event, project, or inquiry..."
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 btn-metallic-gold font-semibold uppercase tracking-wider rounded-full hover:opacity-95 transition-opacity disabled:opacity-50 min-w-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
              <p className="text-gold-accent uppercase tracking-[0.25em] text-xs mb-2">Join the contact list</p>
              <h3 className="font-serif text-2xl font-bold tracking-tight mb-4">Stay in the loop</h3>
              <form onSubmit={handleContactListSubmit} className="space-y-4">
                <div>
                  <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Name</label>
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={contactListName}
                    onChange={(e) => setContactListName(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="Mike Lubich"
                  />
                </div>
                <div>
                  <label className="block text-gold-accent/90 uppercase tracking-[0.2em] text-xs mb-2">Phone number</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={contactListPhone}
                    onChange={(e) => setContactListPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="4152750094"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isContactListSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-3 btn-metallic-gold font-semibold uppercase tracking-wider rounded-full hover:opacity-95 transition-opacity disabled:opacity-50"
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
