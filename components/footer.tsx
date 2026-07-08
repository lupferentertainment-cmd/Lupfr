"use client"

import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { MotionScheduleCallCta } from "@/components/schedule-call-cta-motion"
import { ProtectedPhone } from "@/components/protected-phone"
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
import { BLOG_PUBLIC_ACCESS_ENABLED } from "@/lib/site"

const companyLinksBase = [
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Blog", href: "/blog" },
    { name: "Services", href: "#services" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "#contact" },
] as const

const footerLinks = {
  // Blog remains authored in source, but is hidden while public access is disabled.
  company: companyLinksBase.filter((link) => BLOG_PUBLIC_ACCESS_ENABLED || link.href !== "/blog"),
  social: [
    { name: "Instagram", href: LINKS.instagram },
    { name: "TikTok", href: LINKS.tiktok },
    { name: "YouTube", href: LINKS.youtube },
    { name: "LinkedIn", href: LINKS.linkedin },
  ],
  legal: [
    { name: "Privacy & cookies", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

const ease = [0.22, 1, 0.36, 1] as const

export function Footer() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })
  const companyHref = (href: string) => {
    if (href.startsWith("/")) return href
    return isHome ? href : `/${href}`
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [contactListSubmitting, setContactListSubmitting] = useState(false)
  const [contactListName, setContactListName] = useState("")
  const [contactListEmail, setContactListEmail] = useState("")
  const [contactListPhone, setContactListPhone] = useState("")

  const handleContactListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const cleanName = contactListName.replace(/\s+/g, " ").trim()
    const cleanEmail = contactListEmail.replace(/\s+/g, "").trim().toLowerCase()
    const cleanPhone = contactListPhone.replace(/\s+/g, " ").trim()

    if (!cleanName || !cleanEmail || !cleanPhone) {
      toast.error("Name, email, and phone number are required.")
      return
    }
    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }
    if (!isValidPhone(cleanPhone)) {
      toast.error("Please enter a valid phone number.")
      return
    }

    setContactListSubmitting(true)
    try {
      const res = await fetch("/api/phone-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: cleanPhone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof data?.error === "string" && data.error.length > 0
          ? data.error
          : "Unable to save your contact info right now."
        toast.error(message)
        return
      }

      setPhoneListPreference(PHONE_LIST_DISMISSED_KEY)
      setPhoneListPreference(PHONE_LIST_SUBMITTED_KEY)
      setPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)
      toast.success("You're on the list! We'll be in touch.")
      setContactListName("")
      setContactListEmail("")
      setContactListPhone("")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setContactListSubmitting(false)
    }
  }

  return (
    <footer ref={ref} className="relative pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 bg-background border-t border-border overflow-hidden">
      {/* Premium top hairline: gold gradient rule that fades at both edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden />
      {/* Soft gold ambience anchored to the bottom-left brand corner */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />

      <ScrollReveal variant="up" amountOut={0.9} exitY={-40} className="relative container mx-auto max-w-7xl">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 sm:gap-y-14 mb-14 sm:mb-16">
          {/* Brand */}
          <motion.div
            className="md:col-span-2 lg:col-span-5"
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
          >
            <Link href={isHome ? "#" : "/"} className="inline-block mb-6" aria-label="LUPFR home">
              <LupfrLogoImage width={400} height={132} sizes="280px" className="h-24 sm:h-28 w-auto object-contain" />
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
              California&apos;s premier music event production company. Creating unforgettable experiences across SF, LA, and beyond.
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-7">
              <motion.a
                href="mailto:will@lupfr.com"
                className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                whileHover={{ x: 2 }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary/60 text-accent transition-colors group-hover:border-accent/40">
                  <Mail size={15} aria-hidden />
                </span>
                <span className="group-hover:underline underline-offset-4">will@lupfr.com</span>
              </motion.a>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary/60 text-accent">
                  <MapPin size={15} aria-hidden />
                </span>
                <span>Based in SF &amp; LA, California</span>
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary/60 text-accent">
                  <Phone size={15} aria-hidden />
                </span>
                <ProtectedPhone />
              </p>
            </div>

            <MotionScheduleCallCta
              tone="on-surface"
              size="md"
              className="mb-7 w-full sm:w-auto self-start justify-center sm:justify-start"
              whileHover={{ y: -2 }}
            />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {footerLinks.social.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease }}
          >
            <h4 className="lupfr-heading-eyebrow mb-6">Company</h4>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link, i) => (
                <li key={link.name}>
                  <motion.a
                    href={companyHref(link.href)}
                    className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" aria-hidden />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12, ease }}
          >
            <div className="rounded-2xl border border-border bg-secondary/40 p-6 backdrop-blur-sm">
              <h4 className="lupfr-heading-eyebrow mb-2">Stay in the loop</h4>
              <p className="text-muted-foreground text-sm mb-5">
                Get notified about upcoming events and exclusive presales.
              </p>
              <form onSubmit={handleContactListSubmit} className="space-y-2.5">
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Name"
                  value={contactListName}
                  onChange={(e) => setContactListName(e.target.value)}
                  disabled={contactListSubmitting}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-full text-sm focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-70 transition-shadow"
                />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  value={contactListEmail}
                  onChange={(e) => setContactListEmail(e.target.value)}
                  disabled={contactListSubmitting}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-full text-sm focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-70 transition-shadow"
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Phone number"
                  value={contactListPhone}
                  onChange={(e) => setContactListPhone(e.target.value)}
                  disabled={contactListSubmitting}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-full text-sm focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-70 transition-shadow"
                />
                <motion.button
                  type="submit"
                  disabled={contactListSubmitting}
                  className="w-full px-4 py-2.5 btn-metallic-gold rounded-full font-medium disabled:opacity-70"
                  aria-label="Join contact list"
                  whileHover={contactListSubmitting ? undefined : { scale: 1.02 }}
                  whileTap={contactListSubmitting ? undefined : { scale: 0.98 }}
                >
                  {contactListSubmitting ? "Joining…" : "Join the list"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.2, ease }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} <GoldShineText scrollTargetRef={ref}>LUPFR Entertainment</GoldShineText>. All rights reserved.</span>
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-foreground transition-colors hidden md:inline"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Back to top"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">Back to top</span>
            <motion.span
              className="grid size-8 place-items-center rounded-full border border-border bg-secondary/60 text-accent transition-colors group-hover:border-accent/40"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowUp size={16} />
            </motion.span>
          </motion.button>
        </motion.div>

        <p className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground/80">
          Made with{" "}
          <span className="text-accent/90" aria-hidden>♥</span>
          {" "}by{" "}
          <a
            href="https://mishalubich.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors underline underline-offset-2"
          >
            Misha Lubich
          </a>
        </p>

      </ScrollReveal>
    </footer>
  )
}
