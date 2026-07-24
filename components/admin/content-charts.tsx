"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const CHART_COLORS = ["#d4a017", "#8b7355", "#c4c4c4", "#6b7280", "#a16207", "#78716c"]

type EventSlice = { name: string; count: number }
type GenreSlice = { genre: string; count: number }

export function AdminContentCharts({
  eventStatus,
  genreBreakdown,
}: {
  eventStatus: EventSlice[]
  genreBreakdown: GenreSlice[]
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="border border-zinc-800 p-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Events · upcoming vs past
        </h3>
        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventStatus}>
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

      <div className="border border-zinc-800 p-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Artists · by genre
        </h3>
        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genreBreakdown}
                dataKey="count"
                nameKey="genre"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
              >
                {genreBreakdown.map((entry, index) => (
                  <Cell
                    key={entry.genre}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#09090b",
                  border: "1px solid #3f3f46",
                  borderRadius: 2,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          {genreBreakdown.slice(0, 8).map((entry, index) => (
            <li key={entry.genre} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-sm"
                style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              {entry.genre} ({entry.count})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
