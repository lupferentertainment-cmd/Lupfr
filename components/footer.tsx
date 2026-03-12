"use client"

import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"

const footerLinks = {
  company: [
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ],
  social: [
    { name: "Instagram", href: "#" },
    { name: "TikTok", href: "#" },
    { name: "Spotify", href: "#" },
    { name: "YouTube", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative pt-24 pb-8 px-6 bg-background border-t border-border">
      <div className="container mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block text-3xl font-bold tracking-tighter mb-6">
              <span className="text-foreground">LUPFR</span>
              <span className="text-accent">.</span>
            </a>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-6">
              San Francisco&apos;s premier house music event production company. Creating unforgettable experiences on the Bay and beyond.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Stay in the loop</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get notified about upcoming events and exclusive presales.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-full text-sm focus:border-accent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <motion.button
                type="submit"
                className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Lupfer Entertainment. All rights reserved.</span>
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
            onClick={scrollToTop}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            whileHover={{ y: -2 }}
          >
            <span className="text-sm">Back to top</span>
            <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </div>

        {/* Large Brand Text */}
        <motion.div
          className="mt-16 text-center overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[12vw] font-bold tracking-tighter text-muted/10 leading-none select-none">
            LUPFR
          </h2>
        </motion.div>
      </div>
    </footer>
  )
}
