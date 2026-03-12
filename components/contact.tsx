"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Send, Mail, MapPin, ArrowRight } from "lucide-react"

const inquiryTypes = [
  "Book an Event",
  "Talent Booking",
  "Venue Partnership",
  "Private Event",
  "Sponsorship",
  "Other",
]

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => setIsSubmitting(false), 2000)
  }

  return (
    <section id="contact" ref={ref} className="py-32 px-6 relative overflow-hidden bg-card/30">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[200px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-accent uppercase tracking-[0.3em] text-sm mb-4">Get In Touch</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            Let&apos;s Create<br />
            <span className="text-muted-foreground">Something</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                  <a href="mailto:hello@lupfr.com" className="text-foreground hover:text-accent transition-colors">
                    hello@lupfr.com
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
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">Follow the movement</p>
              <div className="flex items-center gap-4">
                {["Instagram", "TikTok", "Spotify"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">What can we help with?</label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        selectedType === type
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Email</label>
                  <input
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
                  type="text"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                  placeholder="Your organization"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Tell us more</label>
                <textarea
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
      </div>
    </section>
  )
}
