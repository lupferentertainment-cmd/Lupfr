import type { Metadata } from "next"
import { Careers } from "@/components/careers"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Careers",
  description:
    "Join LUPFR Entertainment — open roles in talent, events, and marketing across Los Angeles and San Francisco.",
  alternates: { canonical: `${SITE_URL}/careers` },
}

export default function CareersPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <h1 className="sr-only">Careers</h1>
      <div className="pt-32 sm:pt-36 md:pt-40 pb-20">
        <Careers />
      </div>
      <Footer />
    </main>
  )
}
