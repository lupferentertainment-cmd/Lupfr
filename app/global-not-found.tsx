import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import "./globals.css"

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: "404 | LUPFR Entertainment",
	description: "Page not found.",
	robots: {
		index: false,
		follow: false,
	},
}

export default function GlobalNotFound() {
	return (
		<html lang="en" className="dark">
			<body className="min-h-screen bg-background text-foreground font-sans antialiased">
				<main className="relative min-h-screen overflow-x-clip flex flex-col items-center justify-center px-4 py-24 text-center">
					<p className="text-gold-accent tracking-tight text-xs sm:text-sm mb-4">404</p>
					<h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4">
						Page not found
					</h1>
					<p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
						This URL isn&apos;t on our site. Head back home or open Events from the menu.
					</p>
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global 404 bypasses the normal App Router tree. */}
					<a href="/" className="inline-flex items-center justify-center px-8 py-4 btn-metallic-gold font-semibold tracking-normal rounded-full">
						Back to home
					</a>
				</main>
			</body>
		</html>
	)
}
