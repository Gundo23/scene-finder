import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'

export const revalidate = 0

type VenueAuditStatus = {
  label: string
  level: number
  className: string
  reason: string
}

function clean(value: string | null | undefined) {
  return cleanText(value || '')
}

function formatVenueType(value: string | null | undefined) {
  const kind = clean(value).toLowerCase()

  const labels: Record<string, string> = {
    fixed_venue: 'Fixed venue',
    event_series: 'Event series',
    multi_location: 'Multi-location',
    private_location: 'Private location',
    lead: 'Lead / directory record',
    closed: 'Closed',
    needs_split: 'Needs split',
    needs_review: 'Needs review',
  }

  return labels[kind] || (kind ? kind.replace(/_/g, ' ') : 'Needs review')
}

function statusForVenue(venue: any): VenueAuditStatus {
  const kind = clean(venue.location_kind).toLowerCase()
  const postcode = clean(venue.postcode)
  const addressLine1 = clean(venue.address_line_1)
  const canonicalRegion = clean(venue.canonical_region)

  if (!venue.address_locked) {
    return {
      label: 'UNLOCKED',
      level: 7,
      className: 'border-red-400/50 bg-red-500/20 text-red-100',
      reason: 'Location protection is not enabled for this record.',
    }
  }

  if (kind === 'fixed_venue') {
    if (
      venue.address_verified &&
      addressLine1 &&
      postcode &&
      canonicalRegion
    ) {
      return {
        label: 'Verified address',
        level: 1,
        className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
        reason: 'Full fixed-venue address and postcode are verified and locked.',
      }
    }

    return {
      label: 'Fixed venue review',
      level: 6,
      className: 'border-red-400/40 bg-red-500/15 text-red-200',
      reason: 'This is a fixed venue but its full address is not completely verified.',
    }
  }

  if (kind === 'needs_split') {
    return {
      label: 'Needs split',
      level: 6,
      className: 'border-red-400/40 bg-red-500/15 text-red-200',
      reason: 'This record represents more than one venue and should be split before assigning addresses.',
    }
  }

  if (kind === 'needs_review') {
    return {
      label: 'Needs review',
      level: 5,
      className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
      reason: clean(venue.address_notes) || 'Location classification still needs manual review.',
    }
  }

  if (kind === 'private_location') {
    return {
      label: 'Private location',
      level: 2,
      className: 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200',
      reason: 'The exact address is intentionally not stored as a public permanent venue address.',
    }
  }

  if (kind === 'multi_location') {
    return {
      label: 'Multi-location',
      level: 2,
      className: 'border-violet-400/40 bg-violet-500/15 text-violet-200',
      reason: 'This listing covers multiple locations. Individual events should carry their own address.',
    }
  }

  if (kind === 'event_series') {
    return {
      label: 'Event series',
      level: 2,
      className: 'border-blue-400/40 bg-blue-500/15 text-blue-200',
      reason: 'This is an event series rather than one permanent physical venue.',
    }
  }

  if (kind === 'lead') {
    return {
      label: 'Lead',
      level: 3,
      className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
      reason: 'Directory/lead record; a permanent public street address is not required.',
    }
  }

  if (kind === 'closed') {
    return {
      label: 'Closed',
      level: 3,
      className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
      reason: 'Closed venue retained for data history.',
    }
  }

  return {
    label: 'Review',
    level: 5,
    className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    reason: 'Unknown v15 location classification.',
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return clean(value)

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fullPublicAddress(venue: any) {
  const kind = clean(venue.location_kind).toLowerCase()
  const visibility = clean(venue.address_visibility).toLowerCase()

  if (kind !== 'fixed_venue' || visibility !== 'public') {
    if (kind === 'private_location') return 'Private / not publicly stored'
    if (kind === 'multi_location') return 'Event-specific locations'
    if (kind === 'event_series') return 'Event-specific location'
    if (kind === 'lead') return 'No permanent venue address'
    if (kind === 'closed') return 'Historical record'
    if (kind === 'needs_split') return 'Split record before assigning address'
    return '—'
  }

  const parts = [
    venue.address_line_1,
    venue.address_line_2,
    venue.locality,
    venue.postal_town,
    venue.county,
    venue.postcode,
    venue.country,
  ]
    .map((value) => clean(value))
    .filter(Boolean)

  return parts.join(', ') || '—'
}

export default async function LocationAuditPage() {
  const { data, error } = await supabase
    .from('venues')
    .select(
      [
        'venue_id',
        'name',
        'city_area',
        'region',
        'postcode',
        'canonical_city',
        'canonical_region',
        'admin_district',
        'country',
        'latitude',
        'longitude',
        'location_verified',
        'location_source',
        'location_verified_at',
        'location_verification_error',
        'status',
        'location_kind',
        'address_line_1',
        'address_line_2',
        'locality',
        'postal_town',
        'county',
        'address_visibility',
        'address_verified',
        'address_confidence',
        'address_source_name',
        'address_source_url',
        'address_verified_at',
        'address_notes',
        'address_locked',
      ].join(', ')
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

  const venues = ((data || []) as any[]).map((venue: any) => ({
    ...venue,
    audit: statusForVenue(venue),
  }))

  venues.sort((a, b) => {
    if (b.audit.level !== a.audit.level) return b.audit.level - a.audit.level
    return clean(a.name).localeCompare(clean(b.name))
  })

  const lockedCount = venues.filter((venue) => venue.address_locked).length

  const fixedVerifiedCount = venues.filter(
    (venue) =>
      clean(venue.location_kind).toLowerCase() === 'fixed_venue' &&
      venue.address_verified &&
      Boolean(clean(venue.address_line_1)) &&
      Boolean(clean(venue.postcode))
  ).length

  const nonFixedCount = venues.filter(
    (venue) => clean(venue.location_kind).toLowerCase() !== 'fixed_venue'
  ).length

  const eventSeriesCount = venues.filter(
    (venue) => clean(venue.location_kind).toLowerCase() === 'event_series'
  ).length

  const multiLocationCount = venues.filter(
    (venue) => clean(venue.location_kind).toLowerCase() === 'multi_location'
  ).length

  const needsAttentionCount = venues.filter(
    (venue) =>
      !venue.address_locked ||
      ['needs_review', 'needs_split'].includes(clean(venue.location_kind).toLowerCase()) ||
      (clean(venue.location_kind).toLowerCase() === 'fixed_venue' &&
        !venue.address_verified)
  ).length

  return (
    <main className="min-h-screen bg-zinc-950 px-3 py-6 text-white sm:px-6 sm:py-10">
      <section className="mx-auto max-w-[1600px]">
        <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-blue-950/30 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
            Scene Finder Admin
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Venue Address & Location Audit
          </h1>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400 sm:text-base">
            v15 is the source of truth. Fixed physical venues use curated verified
            street addresses and postcodes. Event series, private locations and
            multi-location organisers are deliberately not given a fake permanent
            street address. Locked records are protected from normal scraper
            overwrites.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Records</p>
              <p className="mt-1 text-2xl font-black">{venues.length}</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-300">
                Verified fixed
              </p>
              <p className="mt-1 text-2xl font-black">{fixedVerifiedCount}</p>
            </div>

            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300">Locked</p>
              <p className="mt-1 text-2xl font-black">
                {lockedCount}/{venues.length}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-blue-300">
                Event series
              </p>
              <p className="mt-1 text-2xl font-black">{eventSeriesCount}</p>
            </div>

            <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-300">
                Multi-location
              </p>
              <p className="mt-1 text-2xl font-black">{multiLocationCount}</p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Needs attention
              </p>
              <p className="mt-1 text-2xl font-black">{needsAttentionCount}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            {nonFixedCount} records are intentionally classified as non-fixed
            locations rather than being assigned invented permanent addresses.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-xl">
          <table className="w-full min-w-[1650px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/90 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">v15 status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Full address</th>
                <th className="px-4 py-3">City / Region</th>
                <th className="px-4 py-3">Postcode</th>
                <th className="px-4 py-3">Protected</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Verified</th>
              </tr>
            </thead>

            <tbody>
              {venues.map((venue) => {
                const sourceName = clean(venue.address_source_name)
                const sourceUrl = clean(venue.address_source_url)
                const city = clean(venue.canonical_city || venue.postal_town || venue.city_area)
                const region = clean(venue.canonical_region || venue.region)

                return (
                  <tr
                    key={venue.venue_id}
                    className="border-b border-zinc-900 align-top"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/venue/${venue.venue_id}`}
                        className="font-bold text-blue-200 hover:text-blue-100"
                      >
                        {clean(venue.name) || 'Venue'}
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

                      <p className="mt-2 max-w-[310px] text-xs leading-5 text-zinc-500">
                        {venue.audit.reason}
                      </p>

                      {venue.address_notes && (
                        <p className="mt-1 max-w-[310px] text-[11px] leading-5 text-zinc-600">
                          {clean(venue.address_notes)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 font-semibold text-zinc-200">
                      {formatVenueType(venue.location_kind)}
                    </td>

                    <td className="max-w-[390px] px-4 py-4 text-zinc-300">
                      <p className="leading-6">{fullPublicAddress(venue)}</p>

                      {venue.address_verified &&
                        clean(venue.location_kind).toLowerCase() === 'fixed_venue' && (
                          <p className="mt-1 text-xs font-semibold text-emerald-300">
                            Verified full address
                          </p>
                        )}
                    </td>

                    <td className="px-4 py-4 text-zinc-300">
                      <p>{city || '—'}</p>
                      <p className="mt-1 text-xs text-zinc-500">{region || '—'}</p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-zinc-200">
                      {clean(venue.postcode) || '—'}
                    </td>

                    <td className="px-4 py-4">
                      {venue.address_locked ? (
                        <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-200">
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-200">
                          UNLOCKED
                        </span>
                      )}
                    </td>

                    <td className="max-w-[260px] px-4 py-4 text-xs text-zinc-400">
                      {sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-300 hover:text-blue-200"
                        >
                          {sourceName || 'Open source'} ↗
                        </a>
                      ) : (
                        <span>{sourceName || clean(venue.location_source) || '—'}</span>
                      )}

                      {venue.address_confidence && (
                        <p className="mt-1 text-[11px] text-zinc-600">
                          Confidence: {clean(venue.address_confidence)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-500">
                      {formatDateTime(
                        venue.address_verified_at || venue.location_verified_at
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-400">
          <p>
            Scraper attempts to change a locked location are retained by the v15
            database protection in{' '}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-300">
              venue_location_change_candidates
            </code>{' '}
            rather than replacing the approved address.
          </p>
        </div>
      </section>
    </main>
  )
}
