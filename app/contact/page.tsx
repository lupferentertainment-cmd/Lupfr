import type { Metadata } from "next"
import { StartPlanning } from "@/components/start-planning"
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
      <div className="pt-16 sm:pt-20">
        <StartPlanning />
      </div>
      <Footer />
    </main>
  )
}
