/**
 * Next uses this for URLs that match no route so the response can be a true **404**
 * (see `experimental.globalNotFound` in `next.config.mjs`). UI matches `app/not-found.tsx`.
 */
import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: "404 | LUPFR Entertainment",
	description: "Page not found.",
	robots: {
		index: false,
		follow: false,
	},
}

export { default } from "./not-found"
