import Link from "next/link"
import { AdminContentCharts } from "@/components/admin/content-charts"
import { AdminContactsPanel } from "@/components/admin/contacts-panel"
import { AdminTelemetryPanel } from "@/components/admin/telemetry-panel"
import { AdminTrafficCharts } from "@/components/admin/traffic-charts"
import {
  artistGenreBreakdown,
  eventStatusBreakdown,
  getAdminContactsSheetUrl,
  ADMIN_EXPORT_RESOURCES,
} from "@/lib/admin-export"
import { ARTISTS } from "@/lib/data/artists"
import { getBrands } from "@/lib/data/brands"
import { GALLERY_PHOTOS } from "@/lib/data/gallery"
import { getServices } from "@/lib/data/services"
import { DRIVE_GALLERY_ROOT_FOLDER_ID } from "@/lib/drive-gallery"
import { EVENTS, getUpcomingEvents } from "@/lib/events"
import { VERCEL_ANALYTICS_URL } from "@/lib/admin-auth"

const EXPORT_LABELS: Record<(typeof ADMIN_EXPORT_RESOURCES)[number], string> = {
  events: "Download events CSV",
  artists: "Download artists CSV",
  services: "Download services CSV",
  brands: "Download brands CSV",
  partners: "Download partners CSV",
}

export default function AdminDashboardPage() {
  const upcoming = getUpcomingEvents().length
  const contactsSheetUrl = getAdminContactsSheetUrl()
  const eventStatus = eventStatusBreakdown()
  const genreBreakdown = artistGenreBreakdown()
  const counts = [
    { label: "Events (all)", value: EVENTS.length },
    { label: "Upcoming events", value: upcoming },
    { label: "Artists", value: ARTISTS.length },
    { label: "Services", value: getServices().length },
    { label: "Brands", value: getBrands().length },
    { label: "Gallery photos (repo)", value: GALLERY_PHOTOS.length },
  ]

  return (
    <div className="space-y-12">
      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Website traffic
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Live series from the{" "}
          <strong className="font-medium text-zinc-200">Vercel Web Analytics API</strong> (real
          pageviews / visitors — never invented). Deep-link remains available if you want the full
          Vercel UI.
        </p>
        <a
          href={VERCEL_ANALYTICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex rounded-sm bg-amber-500/90 px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider text-zinc-950"
        >
          Open Vercel Analytics →
        </a>
        <AdminTrafficCharts />
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          Public site loads <code className="text-zinc-400">@vercel/analytics</code> + Speed
          Insights via <code className="text-zinc-400">DeferredAnalytics</code> after cookie
          consent. Admin fetch uses <code className="text-zinc-400">LUPFR_VERCEL_API_TOKEN</code>.
        </p>
      </section>

      <section aria-labelledby="telemetry-heading">
        <h2 id="telemetry-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Impressions &amp; clicks
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          First-party events from <code className="text-zinc-300">POST /api/telemetry</code> after
          cookie consent (page impressions + key CTA clicks). Stored in Supabase for this portal.
        </p>
        <AdminTelemetryPanel />
      </section>

      <section aria-labelledby="contacts-heading">
        <h2 id="contacts-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Contacts / phone list
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Google Sheets remains the source of record via the webhook. New signups also dual-write to
          Supabase so this table / CSV works in-portal.
        </p>
        <AdminContactsPanel sheetUrl={contactsSheetUrl} />
      </section>

      <section aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Content snapshot
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Read-only counts and charts from build-time generated data (Recharts).
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {counts.map((item) => (
            <li
              key={item.label}
              className="flex items-baseline justify-between border border-zinc-800 px-4 py-3"
            >
              <span className="text-sm text-zinc-400">{item.label}</span>
              <span className="font-condensed text-2xl font-extrabold tabular-nums">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
        <AdminContentCharts eventStatus={eventStatus} genreBreakdown={genreBreakdown} />
      </section>

      <section aria-labelledby="exports-heading">
        <h2 id="exports-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Downloads
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          One-click CSV of site content (requires admin session). Contacts CSV is under Contacts
          above when Supabase is configured.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {ADMIN_EXPORT_RESOURCES.map((resource) => (
            <a
              key={resource}
              href={`/admin/api/export/${resource}`}
              className="rounded-sm border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-amber-500/50 hover:text-amber-400"
            >
              {EXPORT_LABELS[resource]}
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="ops-heading">
        <h2 id="ops-heading" className="font-condensed text-2xl font-extrabold uppercase">
          Ops links
        </h2>
        <ul className="mt-5 space-y-3">
          <li>
            <a
              href={VERCEL_ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400/90 underline-offset-4 hover:underline"
            >
              Vercel Analytics
            </a>
            <span className="ml-2 text-xs text-zinc-500">Full dashboard UI</span>
          </li>
          <li>
            <a
              href={`https://drive.google.com/drive/folders/${DRIVE_GALLERY_ROOT_FOLDER_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400/90 underline-offset-4 hover:underline"
            >
              Google Drive gallery
            </a>
            <span className="ml-2 text-xs text-zinc-500">Live album folders</span>
          </li>
          <li>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400/90 underline-offset-4 hover:underline"
            >
              Resend dashboard
            </a>
            <span className="ml-2 text-xs text-zinc-500">Contact + newsletter</span>
          </li>
          <li>
            <a
              href="https://supabase.com/dashboard/project/wteradopcqalpetjadkh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400/90 underline-offset-4 hover:underline"
            >
              Supabase (contacts + telemetry)
            </a>
            <span className="ml-2 text-xs text-zinc-500">Ops data store</span>
          </li>
          <li>
            <a
              href="https://github.com/lupferentertainment-cmd/Lupfr/blob/dev/docs/RUNBOOK.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-400/90 underline-offset-4 hover:underline"
            >
              GitHub RUNBOOK
            </a>
            <span className="ml-2 text-xs text-zinc-500">Operator procedures</span>
          </li>
          <li>
            <Link href="/" className="text-sm text-amber-400/90 underline-offset-4 hover:underline">
              Public site
            </Link>
            <span className="ml-2 text-xs text-zinc-500">Marketing homepage</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="soon-heading">
        <h2
          id="soon-heading"
          className="font-condensed text-2xl font-extrabold uppercase text-zinc-500"
        >
          Coming soon
        </h2>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-600">
          <li>Content edit (CMS) — not in MVP</li>
          <li>Multi-user accounts</li>
          <li>Historical Sheet import into Supabase</li>
        </ul>
      </section>
    </div>
  )
}
