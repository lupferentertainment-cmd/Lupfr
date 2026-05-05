import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PRIVACY_AND_COOKIES_COPY } from "@/lib/legal-copy"
import { SITE_URL } from "@/lib/site"

const title = "Privacy & cookies"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description:
    "How LUPFR uses browser storage, cookies, and form data on lupfr.com.",
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip">
      <Navigation />
      <div className="container mx-auto max-w-2xl flex-1 px-4 py-24 sm:py-32">
        <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {PRIVACY_AND_COOKIES_COPY}
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          See also{" "}
          <Link
            href="/terms"
            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>
      <Footer />
    </main>
  )
}
