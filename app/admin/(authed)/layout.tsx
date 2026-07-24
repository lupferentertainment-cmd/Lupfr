import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { isAdminConfigured, requireAdminSession } from "@/lib/admin-auth"

export default async function AdminAuthedLayout({ children }: { children: ReactNode }) {
  if (!isAdminConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
        <h1 className="font-condensed text-3xl font-extrabold uppercase">Admin unavailable</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Missing <code className="text-zinc-200">ADMIN_PASSWORD</code> or{" "}
          <code className="text-zinc-200">ADMIN_SESSION_SECRET</code>.
        </p>
      </main>
    )
  }

  const session = await requireAdminSession()
  if (!session) redirect("/admin/login")

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500/90">
            LUPFR operator
          </p>
          <h1 className="mt-1 font-condensed text-3xl font-extrabold uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Signed in as {session.username}</p>
        </div>
        <AdminLogoutButton />
      </header>
      {children}
    </div>
  )
}
