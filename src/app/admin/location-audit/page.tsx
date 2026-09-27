import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sameLocationValue(a: string | null | undefined, b: string | null | undefined) {
  return cleanText(a || '').toLowerCase() === cleanText(b || '').toLowerCase()
}

function statusForVenue(venue: any) {
  const postcode = cleanText(venue.postcode || '')
  const canonicalRegion = cleanText(venue.canonical_region || '')
  const storedRegion = cleanText(venue.region || '')
  const error = cleanText(venue.location_verification_error || '')
  const source = cleanText(venue.location_source || '')

  if (venue.location_verified && postcode && canonicalRegion) {
    if (storedRegion && !sameLocationValue(storedRegion, canonicalRegion)) {
      return {
        label: 'Mismatch',
        level: 4,
        className: 'border-red-400/40 bg-red-500/15 text-red-200',
        reason: `Stored region "${storedRegion}" differs from verified region "${canonicalRegion}".`,
      }
    }

    return {
      label: 'Verified',
      level: 1,
      className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
      reason: 'Postcode and region have been verified.',
    }
  }

  if (canonicalRegion && source === 'city-region-fallback') {
    return {
      label: 'Indexed',
      level: 2,
      className: 'border-blue-400/40 bg-blue-500/15 text-blue-200',
      reason: 'Region is indexed from the stored city/area. Exact postcode is not verified.',
    }
  }

  if (error === 'multi_location_or_uk_wide_review') {
    return {
      label: 'Multi-location',
      level: 3,
      className: 'border-violet-400/40 bg-violet-500/15 text-violet-200',
      reason: 'This listing covers more than one location and should not be forced into one region.',
    }
  }

  if (!postcode && !canonicalRegion) {
    return {
      label: 'Needs location',
      level: 4,
      className: 'border-red-400/40 bg-red-500/15 text-red-200',
      reason: 'No safe canonical region or postcode could be assigned automatically.',
    }
  }

  if (error) {
    return {
      label: 'Review',
      level: 3,
      className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
      reason: error.replace(/_/g, ' '),
    }
  }

  return {
    label: 'Unverified',
    level: 3,
    className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    reason: 'Location data exists but has not been postcode-verified.',
  }
}

function formatVerifiedAt(value: string | null | undefined) {
  if (!value) return 'Never'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return cleanText(value)

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function LocationAuditPage() {
  const { data, error } = await supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, postcode, canonical_city, canonical_region, admin_district, country, latitude, longitude, location_verified, location_source, location_verified_at, location_verification_error, status'
    )
    .order('name', { ascending: true })
    .limit(5000)

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-black">Location Audit</h1>
          <p className="mt-4 text-red-300">Error loading venues: {error.message}</p>
        </section>
      </main>
    )
  }

  const venues = (data || []).map((venue) => ({
    ...venue,
    audit: statusForVenue(venue),
  }))

  venues.sort((a, b) => {
    if (b.audit.level !== a.audit.level) return b.audit.level - a.audit.level
    return cleanText(a.name || '').localeCompare(cleanText(b.name || ''))
  })

  const verifiedCount = venues.filter((venue) => venue.audit.label === 'Verified').length
  const indexedCount = venues.filter((venue) => venue.audit.label === 'Indexed').length
  const multiLocationCount = venues.filter(
    (venue) => venue.audit.label === 'Multi-location'
  ).length
  const needsAttentionCount = venues.filter((venue) =>
    ['Needs location', 'Review', 'Mismatch', 'Unverified'].includes(venue.audit.label)
  ).length

  return (
    <main className="min-h-screen bg-zinc-950 px-3 py-6 text-white sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-blue-950/30 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
            Scene Finder Admin
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Venue Location Audit</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Verified locations use postcode data. Indexed locations use a safe city/region fallback
            so public region search still works when an exact postcode is unavailable.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Venues</p>
              <p className="mt-1 text-2xl font-black">{venues.length}</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-300">Verified</p>
              <p className="mt-1 text-2xl font-black">{verifiedCount}</p>
            </div>

            <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-blue-300">Indexed</p>
              <p className="mt-1 text-2xl font-black">{indexedCount}</p>
            </div>

            <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-300">Multi-location</p>
              <p className="mt-1 text-2xl font-black">{multiLocationCount}</p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">Needs attention</p>
              <p className="mt-1 text-2xl font-black">{needsAttentionCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-xl">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/90 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Postcode</th>
                <th className="px-4 py-3">City / Area</th>
                <th className="px-4 py-3">Stored region</th>
                <th className="px-4 py-3">Indexed region</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>

            <tbody>
              {venues.map((venue) => (
                <tr key={venue.venue_id} className="border-b border-zinc-900 align-top">
                  <td className="px-4 py-4">
                    <Link
                      href={`/venue/${venue.venue_id}`}
                      className="font-bold text-blue-200 hover:text-blue-100"
                    >
                      {cleanText(venue.name || 'Venue')}
                    </Link>
                    <p className="mt-1 max-w-[260px] break-all text-xs text-zinc-600">
                      {venue.venue_id}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${venue.audit.className}`}
                    >
                      {venue.audit.label}
                    </span>
                    <p className="mt-2 max-w-[300px] text-xs leading-5 text-zinc-500">
                      {venue.audit.reason}
                    </p>
                  </td>

                  <td className="px-4 py-4 font-semibold text-zinc-200">
                    {cleanText(venue.postcode || '') || '—'}
                  </td>

                  <td className="px-4 py-4 text-zinc-300">
                    {cleanText(venue.canonical_city || venue.city_area || '') || '—'}
                  </td>

                  <td className="px-4 py-4 text-zinc-400">
                    {cleanText(venue.region || '') || '—'}
                  </td>

                  <td className="px-4 py-4 font-semibold text-white">
                    {cleanText(venue.canonical_region || '') || '—'}
                  </td>

                  <td className="px-4 py-4 text-zinc-400">
                    {cleanText(venue.admin_district || '') || '—'}
                  </td>

                  <td className="px-4 py-4 text-xs text-zinc-400">
                    {cleanText(venue.location_source || '') || '—'}
                  </td>

                  <td className="px-4 py-4 text-xs text-zinc-500">
                    {formatVerifiedAt(venue.location_verified_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
