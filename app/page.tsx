import type { Metadata } from "next"
import { HomePage } from "@/components/home-page"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

export default function Page() {
  return <HomePage />
}
