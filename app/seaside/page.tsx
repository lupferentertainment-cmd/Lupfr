import type { Metadata } from "next"
import { Anton, Inter } from "next/font/google"
import { SeasideLanding } from "@/components/seaside/seaside-landing"
import { SEASIDE_URL } from "@/lib/site"

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const title = "SEA // SIDE — An Offshore Music Experience"
const description =
    "An invite-only offshore music experience aboard private yachts. Curated artists, premier production, unseen vibes — presented by LUPFR Entertainment, Long Beach CA."
const ogImage = `${SEASIDE_URL}/seaside/hero-golden.webp`

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: SEASIDE_URL },
    openGraph: {
        title,
        description,
        url: SEASIDE_URL,
        type: "website",
        siteName: "SEA // SIDE",
        images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function SeasidePage() {
    return (
        <div className={`${anton.variable} ${inter.variable}`}>
            <SeasideLanding />
        </div>
    )
}
