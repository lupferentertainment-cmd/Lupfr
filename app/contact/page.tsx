import type { Metadata } from "next"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Contact",
  description:
    "Get in touch with LUPFR Entertainment for bookings, events, talent, and partnerships.",
  alternates: { canonical: `${SITE_URL}/contact` },
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <h1 className="sr-only">Contact</h1>
      <div className="pt-32 sm:pt-36 md:pt-40 pb-20">
        <Contact />
      </div>
      <Footer />
    </main>
  )
}
