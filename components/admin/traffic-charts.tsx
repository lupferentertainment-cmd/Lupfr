"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AdminTrafficAnalytics } from "@/lib/vercel-web-analytics"

const empty: AdminTrafficAnalytics = {
  configured: false,
  daily: [],
  topPaths: [],
  totals: { pageviews: 0, visitors: 0 },
  since: "",
  until: "",
}

export function AdminTrafficCharts() {
  const [data, setData] = useState<AdminTrafficAnalytics>(empty)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/admin/api/analytics", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as AdminTrafficAnalytics
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) {
          setData({
            ...empty,
            configured: false,
            error: "Could not load Vercel Analytics.",
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
    return <p className="mt-4 text-sm text-zinc-500">Loading traffic from Vercel…</p>
  }

  if (!data.configured || data.error) {
    return (
      <p className="mt-4 rounded-sm border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
        {data.error ||
          "Set LUPFR_VERCEL_API_TOKEN (+ project/team ids) in Vercel to embed live traffic here. No placeholder numbers are shown."}
      </p>
    )
  }

  if (data.daily.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-500">
        Vercel Analytics returned no rows for {data.since} → {data.until}.
      </p>
    )
  }

  return (
    <div className="mt-5 space-y-6">
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Pageviews
          </p>
          <p className="font-condensed text-3xl font-extrabold tabular-nums">
            {data.totals.pageviews}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Visitors
          </p>
          <p className="font-condensed text-3xl font-extrabold tabular-nums">
            {data.totals.visitors}
          </p>
        </div>
        <p className="self-end text-xs text-zinc-500">
          {data.since} → {data.until} (Vercel Web Analytics API)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-zinc-800 p-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Daily pageviews
          </h3>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#d4a017"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-zinc-800 p-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Top paths
          </h3>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topPaths} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" allowDecimals={false} stroke="#a1a1aa" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="path"
                  width={90}
                  stroke="#a1a1aa"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: 2,
                  }}
                />
                <Bar dataKey="pageviews" fill="#d4a017" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
