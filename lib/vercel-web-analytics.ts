export type DailyTrafficPoint = {
  day: string
  pageviews: number
  visitors: number
}

export type PathTrafficPoint = {
  path: string
  pageviews: number
  visitors: number
}

export type AdminTrafficAnalytics = {
  configured: boolean
  daily: DailyTrafficPoint[]
  topPaths: PathTrafficPoint[]
  totals: { pageviews: number; visitors: number }
  error?: string
  since: string
  until: string
}

const DEFAULT_PROJECT_ID = "prj_NDjByqwNysZOQDlx9lmO7CkQASBc"
const DEFAULT_TEAM_ID = "team_CcitcXHm1mAGX3McZPYNuOtm"

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? ""
}

export function isVercelAnalyticsConfigured(): boolean {
  return Boolean(readEnv("LUPFR_VERCEL_API_TOKEN") && readEnv("LUPFR_VERCEL_PROJECT_ID"))
}

function projectId(): string {
  return readEnv("LUPFR_VERCEL_PROJECT_ID") || DEFAULT_PROJECT_ID
}

function teamId(): string {
  return readEnv("LUPFR_VERCEL_TEAM_ID") || DEFAULT_TEAM_ID
}

function dayStamp(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function defaultAnalyticsWindow(now = new Date()): { since: string; until: string } {
  const untilDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const sinceDate = new Date(untilDate)
  sinceDate.setUTCDate(sinceDate.getUTCDate() - 21)
  return { since: dayStamp(sinceDate), until: dayStamp(untilDate) }
}

async function vercelGet(path: string, params: Record<string, string>): Promise<Response> {
  const token = readEnv("LUPFR_VERCEL_API_TOKEN")
  const url = new URL(`https://api.vercel.com${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export async function fetchAdminTrafficAnalytics(options?: {
  since?: string
  until?: string
}): Promise<AdminTrafficAnalytics> {
  const window = {
    since: options?.since ?? defaultAnalyticsWindow().since,
    until: options?.until ?? defaultAnalyticsWindow().until,
  }

  if (!isVercelAnalyticsConfigured()) {
    return {
      configured: false,
      daily: [],
      topPaths: [],
      totals: { pageviews: 0, visitors: 0 },
      since: window.since,
      until: window.until,
      error: "Set LUPFR_VERCEL_API_TOKEN and LUPFR_VERCEL_PROJECT_ID to load traffic.",
    }
  }

  const base = {
    projectId: projectId(),
    teamId: teamId(),
    since: window.since,
    until: window.until,
  }

  try {
    const [countRes, dailyRes, pathsRes] = await Promise.all([
      vercelGet("/v1/query/web-analytics/visits/count", base),
      vercelGet("/v1/query/web-analytics/visits/aggregate", {
        ...base,
        by: "day",
        limit: "30",
      }),
      vercelGet("/v1/query/web-analytics/visits/aggregate", {
        ...base,
        by: "requestPath",
        limit: "10",
      }),
    ])

    if (!countRes.ok || !dailyRes.ok || !pathsRes.ok) {
      const status = !countRes.ok
        ? countRes.status
        : !dailyRes.ok
          ? dailyRes.status
          : pathsRes.status
      return {
        configured: true,
        daily: [],
        topPaths: [],
        totals: { pageviews: 0, visitors: 0 },
        since: window.since,
        until: window.until,
        error: `Vercel Analytics API returned ${status}.`,
      }
    }

    const countJson = (await countRes.json()) as {
      data?: { pageviews?: number; visitors?: number }
    }
    const dailyJson = (await dailyRes.json()) as {
      data?: Array<{ timestamp?: string; pageviews?: number; visitors?: number }>
    }
    const pathsJson = (await pathsRes.json()) as {
      data?: Array<{ requestPath?: string; pageviews?: number; visitors?: number }>
    }

    const daily: DailyTrafficPoint[] = (dailyJson.data ?? [])
      .map((row) => ({
        day: (row.timestamp ?? "").slice(0, 10),
        pageviews: asNumber(row.pageviews),
        visitors: asNumber(row.visitors),
      }))
      .filter((row) => Boolean(row.day))
      .sort((a, b) => a.day.localeCompare(b.day))

    const topPaths: PathTrafficPoint[] = (pathsJson.data ?? [])
      .map((row) => ({
        path: row.requestPath || "(unknown)",
        pageviews: asNumber(row.pageviews),
        visitors: asNumber(row.visitors),
      }))
      .filter((row) => row.path.length > 0)

    return {
      configured: true,
      daily,
      topPaths,
      totals: {
        pageviews: asNumber(countJson.data?.pageviews),
        visitors: asNumber(countJson.data?.visitors),
      },
      since: window.since,
      until: window.until,
    }
  } catch (error) {
    return {
      configured: true,
      daily: [],
      topPaths: [],
      totals: { pageviews: 0, visitors: 0 },
      since: window.since,
      until: window.until,
      error: error instanceof Error ? error.message : "Analytics fetch failed.",
    }
  }
}
