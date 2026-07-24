"use client"

import { useEffect, useState } from "react"
import type { ContactRow } from "@/lib/supabase-server"

type ContactsResponse = {
  configured: boolean
  contacts: ContactRow[]
  sheetUrl: string | null
  error?: string
}

export function AdminContactsPanel({ sheetUrl: initialSheetUrl }: { sheetUrl: string | null }) {
  const [data, setData] = useState<ContactsResponse>({
    configured: false,
    contacts: [],
    sheetUrl: initialSheetUrl,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/admin/api/contacts", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as ContactsResponse
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) {
          setData({
            configured: false,
            contacts: [],
            sheetUrl: initialSheetUrl,
            error: "Could not load contacts.",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialSheetUrl])

  const sheetUrl = data.sheetUrl || initialSheetUrl

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap gap-3">
        {sheetUrl ? (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-sm border border-amber-500/50 bg-amber-500/10 px-5 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-amber-400"
          >
            Open contacts Sheet →
          </a>
        ) : null}
        {data.configured ? (
          <a
            href="/admin/api/contacts/export"
            className="inline-flex rounded-sm border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-amber-500/50 hover:text-amber-400"
          >
            Download contacts CSV
          </a>
        ) : null}
      </div>

      {sheetUrl ? (
        <div className="overflow-hidden border border-zinc-800">
          <iframe
            title="Contacts Google Sheet"
            src={sheetUrl}
            className="h-[420px] w-full bg-zinc-950"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <p className="border-t border-zinc-800 px-3 py-2 text-xs text-zinc-500">
            Sheet embed requires the document to allow viewing. Use Open / CSV if the iframe is blank.
          </p>
        </div>
      ) : null}

      {loading ? <p className="text-sm text-zinc-500">Loading contacts store…</p> : null}

      {!loading && data.error ? (
        <p className="rounded-sm border border-zinc-800 px-4 py-3 text-sm text-zinc-400">
          {data.error}
        </p>
      ) : null}

      {!loading && !data.configured ? (
        <p className="rounded-sm border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
          Contacts store not configured. Set <code className="text-zinc-200">SUPABASE_URL</code> +{" "}
          <code className="text-zinc-200">SUPABASE_SERVICE_ROLE_KEY</code> (dual-write from
          phone-list). Optional <code className="text-zinc-200">ADMIN_CONTACTS_SHEET_URL</code> for
          Sheet embed.
        </p>
      ) : null}

      {!loading && data.configured && data.contacts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No contacts in Supabase yet. New phone-list signups dual-write here after Sheets accepts
          them.
        </p>
      ) : null}

      {!loading && data.contacts.length > 0 ? (
        <div className="overflow-x-auto border border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.map((row) => (
                <tr key={row.id} className="border-b border-zinc-900 text-zinc-300">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.email || "—"}</td>
                  <td className="px-3 py-2">{row.phone || "—"}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-500">
                    {row.submitted_at.slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
