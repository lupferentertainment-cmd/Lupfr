"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { LINKS } from "@/lib/links"
import { ScrollReveal } from "@/components/scroll-reveal"

const socialLinks = [
  { name: "Instagram", href: LINKS.instagram },
  { name: "TikTok", href: LINKS.tiktok },
  { name: "YouTube", href: LINKS.youtube },
]

const inquiryTypes = [
  "Book an Event",
  "Talent Booking",
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

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast.error(data.error ?? "Failed to send message. Please try again.")
        return
      }
      toast.success("Message sent! We'll get back to you soon.")
      form.reset()
      setSelectedType(null)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-32 px-6 relative overflow-hidden bg-card/30">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[200px]" />

      <ScrollReveal variant="up" className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">Get In Touch</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            <span className="inline-block heading-metallic-gold">Let&apos;s Create</span>
            <br />
            <span className="text-muted-foreground">Something</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">What can we help with?</label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        selectedType === type
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: selectedType === type ? 1.02 : 1,
                        boxShadow: selectedType === type ? "0 0 20px oklch(0.72 0.14 88 / 0.25)" : "none",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Email</label>
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
                <label className="block text-sm text-muted-foreground mb-2">Company / Venue (optional)</label>
                <input
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  placeholder="Your organization"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Tell us more</label>
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
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-semibold uppercase tracking-wider rounded-full hover:bg-foreground transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.03, boxShadow: "0 0 32px oklch(0.72 0.14 88 / 0.35)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  )
}
