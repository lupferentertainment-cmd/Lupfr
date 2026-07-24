import { redirect } from "next/navigation"
import { isAdminConfigured, requireAdminSession } from "@/lib/admin-auth"
import { AdminLoginForm } from "@/components/admin/login-form"

export default async function AdminLoginPage() {
  if (!isAdminConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="font-condensed text-3xl font-extrabold uppercase tracking-wide">
          Admin unavailable
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Set <code className="text-zinc-200">ADMIN_PASSWORD</code> and{" "}
          <code className="text-zinc-200">ADMIN_SESSION_SECRET</code> in the environment.
        </p>
      </main>
    )
  }

  const session = await requireAdminSession()
  if (session) redirect("/admin")

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500/90">
        LUPFR operator
      </p>
      <h1 className="mt-2 font-condensed text-4xl font-extrabold uppercase tracking-wide">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Password-protected portal for traffic analytics and ops links.
      </p>
      <AdminLoginForm />
    </main>
  )
}
