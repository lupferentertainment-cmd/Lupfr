"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { toast } from "sonner"
import { LINKS } from "@/lib/links"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

const footerLinks = {
  company: [
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ],
  social: [
    { name: "Instagram", href: LINKS.instagram },
    { name: "TikTok", href: LINKS.tiktok },
    { name: "YouTube", href: LINKS.youtube },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
}

const ease = [0.22, 1, 0.36, 1] as const
const LUPFR_EMAIL = "will@lupfr.com"

export function Footer() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const companyHref = (hash: string) => (isHome ? hash : `/${hash}`)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (new FormData(form).get("email") as string)?.trim()
    if (!email) {
      toast.error("Please enter your email.")
      return
    }
    setNewsletterSubmitting(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("Signup not configured. Opening email to send to LUPFR instead.")
        const subject = encodeURIComponent("[LUPFR] Newsletter signup")
        const body = encodeURIComponent(`Please add me to the LUPFR mailing list:\n\nEmail: ${email}`)
        window.location.href = `mailto:${LUPFR_EMAIL}?subject=${subject}&body=${body}`
        return
      }
      toast.success("You're on the list! We'll be in touch.")
      form.reset()
    } catch {
      toast.error("Network error. Opening email to send to LUPFR instead.")
      const subject = encodeURIComponent("[LUPFR] Newsletter signup")
      const body = encodeURIComponent(`Please add me to the LUPFR mailing list:\n\nEmail: ${email}`)
      window.location.href = `mailto:${LUPFR_EMAIL}?subject=${subject}&body=${body}`
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  return (
    <footer ref={ref} className="relative pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 bg-background border-t border-border">
      <ScrollReveal variant="up" amountOut={0.9} exitY={-40} className="container mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
          >
            <Link href={isHome ? "#" : "/"} className="inline-block mb-6" aria-label="LUPFR home">
              <Image
                src="/logos/will_logo.png"
                alt="LUPFR"
                width={200}
                height={66}
                sizes="140px"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-6">
              San Francisco&apos;s premier music event production company. Creating unforgettable experiences in the Bay and beyond.
            </p>
            <motion.a
              href="mailto:will@lupfr.com"
              className="text-accent hover:underline text-sm mb-4 inline-block"
              whileHover={{ y: -2 }}
            >
              will@lupfr.com
            </motion.a>
            <div className="flex items-center gap-4">
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
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={link.name}>
                  <motion.a
                    href={companyHref(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12, ease }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Stay in the loop</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get notified about upcoming events and exclusive presales.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                disabled={newsletterSubmitting}
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-full text-sm focus:border-accent focus:outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-70"
              />
              <motion.button
                type="submit"
                disabled={newsletterSubmitting}
                className="px-4 py-2 btn-metallic-gold rounded-full font-medium disabled:opacity-70"
                aria-label="Join newsletter"
                whileHover={newsletterSubmitting ? undefined : { scale: 1.05 }}
                whileTap={newsletterSubmitting ? undefined : { scale: 0.95 }}
              >
                {newsletterSubmitting ? "..." : "Join"}
              </motion.button>
            </form>
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
              <a 
                key={link.name}
                href={link.href}
                className="hover:text-foreground transition-colors hidden md:inline"
              >
                {link.name}
              </a>
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
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowUp size={16} />
            </motion.span>
          </motion.button>
        </motion.div>

        <p className="mt-6 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground/80">
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
