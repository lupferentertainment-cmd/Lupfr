"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("will@lupfr.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        setError(body?.error ?? "Sign-in failed.")
        return
      }
      router.replace("/admin")
      router.refresh()
    } catch {
      setError("Sign-in failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="admin-login-form">
      <label className="block text-sm">
        <span className="text-zinc-400">Username</span>
        <input
          name="username"
          type="email"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-sm border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-500/60"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-400">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-sm border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-500/60"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-amber-500/90 px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
