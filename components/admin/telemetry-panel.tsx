"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TelemetryRow } from "@/lib/supabase-server"

type TelemetryResponse = {
  configured: boolean
  events: TelemetryRow[]
  byName: Array<{ name: string; count: number }>
  error?: string
}

export function AdminTelemetryPanel() {
  const [data, setData] = useState<TelemetryResponse>({
    configured: false,
    events: [],
    byName: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/admin/api/telemetry", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as TelemetryResponse
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) {
          setData({
            configured: false,
            events: [],
            byName: [],
            error: "Could not load telemetry.",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="mt-4 text-sm text-zinc-500">Loading impressions / clicks…</p>
  }

  if (!data.configured) {
    return (
      <p className="mt-4 rounded-sm border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
        {data.error ||
          "Set Supabase env vars to collect consent-gated page impressions and CTA clicks via POST /api/telemetry."}
      </p>
    )
  }

  return (
    <div className="mt-5 space-y-6">
      {data.byName.length > 0 ? (
        <div className="border border-zinc-800 p-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Event counts (recent window)
          </h3>
          <div className="mt-3 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byName}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: 2,
                  }}
                />
                <Bar dataKey="count" fill="#d4a017" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          No telemetry events yet. Public pages send impressions/CTA clicks after cookie consent.
        </p>
      )}

      {data.events.length > 0 ? (
        <div className="overflow-x-auto border border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Label</th>
              </tr>
            </thead>
            <tbody>
              {data.events.slice(0, 40).map((row) => (
                <tr key={row.id} className="border-b border-zinc-900 text-zinc-300">
                  <td className="px-3 py-2 tabular-nums text-zinc-500">
                    {row.created_at.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-3 py-2">{row.event_name}</td>
                  <td className="px-3 py-2">{row.path || "—"}</td>
                  <td className="px-3 py-2">{row.label || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
