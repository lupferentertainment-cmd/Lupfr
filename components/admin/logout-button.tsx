"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function AdminLogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onLogout() {
    setPending(true)
    try {
      await fetch("/admin/api/logout", { method: "POST" })
      router.replace("/admin/login")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:border-zinc-500 disabled:opacity-60"
    >
      {pending ? "…" : "Log out"}
    </button>
  )
}
