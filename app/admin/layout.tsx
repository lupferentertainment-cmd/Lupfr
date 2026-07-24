import type { Metadata } from "next"
import type { ReactNode } from "react"

/** Admin auth depends on runtime ADMIN_* env — never bake “unavailable” at build. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-zinc-100" data-admin-shell="true">
      {children}
    </div>
  )
}
