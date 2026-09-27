import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 40
const POSTCODE_SEARCH_RADIUS_MILES = 30

const FALLBACK_REGIONS = [
  'North East',
  'North West',
  'Yorkshire and the Humber',
  'East Midlands',
  'West Midlands',
  'East of England',
  'London',
  'South East',
  'South West',
  'Scotland',
  'Wales',
  'Northern Ireland',
]

type VenueRow = {
  venue_id: string
  name: string | null
  city_area: string | null
  region: string | null
  canonical_city: string | null
  canonical_region: string | null
  postcode: string | null
  latitude: number | string | null
  longitude: number | string | null
  location_kind: string | null
  address_visibility: string | null
  category: string | null
  status: string | null
  image_url: string | null
}

type EventRow = {
  event_id: string
  venue_id: string
  event_name: string | null
  event_date: string | null
  start_time: string | null
  event_type: string | null
  description: string | null
  ticket_url: string | null
  image_url: string | null
  event_location_name: string | null
  event_locality: string | null
  event_postal_town: string | null
  event_postcode: string | null
  event_country: string | null
  event_location_verified: boolean | null
  event_address_visibility: string | null
}

type GeoPoint = {
  latitude: number
  longitude: number
  label: string
}

function getTodayString() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return new Date().toISOString().split('T')[0]
  }

  return `${year}-${month}-${day}`
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split('T')[0]
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'Date TBC'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return cleanText(date)

  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value: string | null | undefined) {
  const cleaned = cleanText(value || '').slice(0, 5)
  if (!cleaned || cleaned === '00:00') return 'Time TBC'
  return cleaned
}

function formatPostcodeSearch(value: string) {
  const compact = value.toUpperCase().replace(/\s+/g, '')
  if (compact.length <= 3) return compact
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
}

function finiteCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function compactPostcode(value: string | null | undefined) {
  return cleanText(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function looksLikeUkPostcodeSearch(value: string | null | undefined) {
  const compact = compactPostcode(value)
  if (!compact) return false

  const outwardCode = /^[A-Z]{1,2}\d[A-Z\d]?$/
  const fullPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/

  return outwardCode.test(compact) || fullPostcode.test(compact)
}

async function resolvePostcodeOrigin(value: string): Promise<GeoPoint | null> {
  const compact = compactPostcode(value)
  if (!looksLikeUkPostcodeSearch(compact)) return null

  const fullPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)
  const endpoint = fullPostcode
    ? `https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`
    : `https://api.postcodes.io/outcodes/${encodeURIComponent(compact)}`

  try {
    const response = await fetch(endpoint, { cache: 'no-store' })
    if (!response.ok) return null

    const payload = await response.json()
    const result = payload?.result
    const latitude = finiteCoordinate(result?.latitude)
    const longitude = finiteCoordinate(result?.longitude)

    if (latitude === null || longitude === null) return null

    return {
      latitude,
      longitude,
      label: cleanText(result?.postcode || result?.outcode || value).toUpperCase(),
    }
  } catch (error) {
    console.error('Event postcode lookup failed:', error)
    return null
  }
}

function distanceMilesBetween(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusMiles = 3958.7613

  const latitude1 = toRadians(origin.latitude)
  const latitude2 = toRadians(destination.latitude)
  const latitudeDelta = toRadians(destination.latitude - origin.latitude)
  const longitudeDelta = toRadians(destination.longitude - origin.longitude)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDelta / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMiles * c
}

function formatDistanceMiles(value: number) {
  if (value < 0.1) return '<0.1 miles away'
  if (value < 10) return `${value.toFixed(1)} miles away`
  return `${Math.round(value)} miles away`
}

async function resolveVenueCoordinates(venues: VenueRow[]) {
  const coordinatesByVenueId = new Map<
    string,
    { latitude: number; longitude: number }
  >()

  const missingByPostcode = new Map<string, string[]>()

  for (const venue of venues) {
    if (!venue.venue_id) continue
    if (venue.location_kind !== 'fixed_venue') continue
    if (venue.address_visibility && venue.address_visibility !== 'public') continue
    if (!venue.postcode) continue

    const latitude = finiteCoordinate(venue.latitude)
    const longitude = finiteCoordinate(venue.longitude)

    if (latitude !== null && longitude !== null) {
      coordinatesByVenueId.set(venue.venue_id, { latitude, longitude })
      continue
    }

    const postcodeKey = compactPostcode(venue.postcode)
    if (!postcodeKey) continue

    const venueIds = missingByPostcode.get(postcodeKey) || []
    venueIds.push(venue.venue_id)
    missingByPostcode.set(postcodeKey, venueIds)
  }

  const missingPostcodes = [...missingByPostcode.keys()]

  for (let index = 0; index < missingPostcodes.length; index += 100) {
    const batch = missingPostcodes.slice(index, index + 100)

    try {
      const response = await fetch(
        'https://api.postcodes.io/postcodes?filter=postcode,longitude,latitude',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcodes: batch }),
          cache: 'no-store',
        }
      )

      if (!response.ok) continue

      const payload = await response.json()

      for (const item of payload?.result || []) {
        const postcodeKey = compactPostcode(item?.query)
        const latitude = finiteCoordinate(item?.result?.latitude)
        const longitude = finiteCoordinate(item?.result?.longitude)

        if (!postcodeKey || latitude === null || longitude === null) continue

        for (const venueId of missingByPostcode.get(postcodeKey) || []) {
          coordinatesByVenueId.set(venueId, { latitude, longitude })
        }
      }
    } catch (error) {
      console.error('Event venue postcode batch lookup failed:', error)
    }
  }

  return coordinatesByVenueId
}

function normaliseFilterValue(value: string | null | undefined) {
  return cleanText(value || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getCanonicalVenueCity(venue: VenueRow) {
  return cleanText(venue.canonical_city || venue.city_area || '')
}

function getCanonicalVenueRegion(venue: VenueRow) {
  const canonical = cleanText(venue.canonical_region || '')
  if (canonical) return canonical

  const stored = cleanText(venue.region || '')
  const normalized = normaliseFilterValue(stored)

  if (normalized.includes('london')) return 'London'

  const exact = FALLBACK_REGIONS.find(
    (region) => normaliseFilterValue(region) === normalized
  )

  return exact || stored
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => cleanText(value || ''))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
}

function shouldShowPublicVenue(venue: VenueRow) {
  const name = cleanText(venue.name || '').toLowerCase()
  const category = cleanText(venue.category || '').toLowerCase()
  const status = cleanText(venue.status || '').toLowerCase()

  const blockedStatuses = [
    'tbc',
    'closed',
    'inactive',
    'removed',
    'deleted',
    'permanently closed',
    'permanent closed',
  ]

  if (blockedStatuses.includes(status)) return false
  if (category.includes('lead')) return false
  if (status.includes('lead')) return false
  if (name.startsWith('about ')) return false
  if (name === 'about us') return false
  if (name === 'adult club') return false
  if (name.endsWith(' social lead')) return false
  if (name.includes('/ social lead')) return false
  if (name.includes('swingers club lead')) return false
  if (name.includes('kink munch / social lead')) return false

  return true
}

function venueMatchesQuickCategory(venue: VenueRow, quickCategory: string) {
  if (!quickCategory) return true

  const text = normaliseFilterValue(`${venue.category || ''} ${venue.name || ''}`)

  if (quickCategory === 'clubs') {
    return (
      text.includes('club') ||
      text.includes('swing') ||
      text.includes('lifestyle') ||
      text.includes('playroom')
    )
  }

  if (quickCategory === 'saunas') {
    return text.includes('sauna') || text.includes('spa')
  }

  if (quickCategory === 'kink') {
    return text.includes('kink') || text.includes('fetish') || text.includes('bdsm')
  }

  return true
}

function quickChipClass(active: boolean) {
  return active
    ? 'border-blue-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
    : 'border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-blue-400/70 hover:bg-blue-500/10 hover:text-blue-100'
}

function getVenueCategoryPillClass(category: string | null | undefined) {
  const lower = cleanText(category || '').toLowerCase()

  if (lower.includes('sauna') || lower.includes('spa')) {
    return 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
  }

  if (lower.includes('swing') || lower.includes('club') || lower.includes('lifestyle')) {
    return 'border-pink-400/40 bg-pink-500/15 text-pink-200'
  }

  if (lower.includes('fetish') || lower.includes('kink') || lower.includes('bdsm')) {
    return 'border-red-400/40 bg-red-500/15 text-red-200'
  }

  return 'border-blue-400/40 bg-blue-500/15 text-blue-200'
}

function getEventLocation(event: EventRow, venue: VenueRow | undefined) {
  const visibility = cleanText(event.event_address_visibility || '').toLowerCase()

  if (event.event_location_verified && visibility !== 'private') {
    const publicEventParts = uniqueSorted([
      event.event_location_name,
      event.event_locality,
      event.event_postal_town,
    ])

    if (publicEventParts.length > 0) {
      return publicEventParts.join(' • ')
    }
  }

  return getCanonicalVenueCity(
    venue ||
      ({
        canonical_city: null,
        city_area: null,
      } as VenueRow)
  ) || 'Location TBC'
}

function getEventCategoryLabel(venue: VenueRow | undefined) {
  const category = cleanText(venue?.category || '')
  return category || 'Event'
}

function isTonightEvent(event: EventRow, today: string) {
  if (event.event_date !== today) return false

  const start = cleanText(event.start_time || '').slice(0, 5)
  return !start || start === '00:00' || start >= '17:00'
}

function cleanDescription(value: string | null | undefined) {
  return cleanText(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    timing?: string
    category?: string
    city?: string
    region?: string
    date_from?: string
    date_to?: string
    event_type?: string
    page?: string
  }>
}) {
  const params = await searchParams

  const search = cleanText(params.search || '')
  const timing = cleanText(params.timing || '')
  const category = cleanText(params.category || '')
  const city = cleanText(params.city || '')
  const region = cleanText(params.region || '')
  const dateFrom = cleanText(params.date_from || '')
  const dateTo = cleanText(params.date_to || '')
  const eventType = cleanText(params.event_type || '')
  const requestedPage = Number.parseInt(params.page || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const today = getTodayString()
  const next7End = addDays(today, 6)

  const postcodeSearchAttempt = looksLikeUkPostcodeSearch(search)
  const postcodeOrigin = postcodeSearchAttempt
    ? await resolvePostcodeOrigin(search)
    : null

  const [
    { data: venueData, error: venueError },
    { data: eventTypeData, error: eventTypeError },
    { count: totalPublishedEventCount },
  ] = await Promise.all([
    supabase
      .from('venues')
      .select(
        'venue_id, name, city_area, region, canonical_city, canonical_region, postcode, latitude, longitude, location_kind, address_visibility, category, status, image_url'
      )
      .order('name', { ascending: true })
      .limit(5000),
    supabase
      .from('events')
      .select('event_type')
      .eq('is_published', true)
      .not('event_type', 'is', null)
      .limit(5000),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
  ])

  if (venueError) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        Error loading event locations: {venueError.message}
      </main>
    )
  }

  if (eventTypeError) {
    console.error('Error loading event types:', eventTypeError.message)
  }

  const venues = ((venueData || []) as VenueRow[]).filter(shouldShowPublicVenue)
  const venueById = new Map(venues.map((venue) => [venue.venue_id, venue]))

  const cityOptions = uniqueSorted(venues.map((venue) => getCanonicalVenueCity(venue)))
  const regionOptions = FALLBACK_REGIONS
  const eventTypeOptions = uniqueSorted(
    (eventTypeData || []).map((item: any) => item.event_type)
  )

  const venueCoordinatesById = postcodeOrigin
    ? await resolveVenueCoordinates(venues)
    : new Map<string, { latitude: number; longitude: number }>()

  const distanceMilesByVenue = new Map<string, number>()

  if (postcodeOrigin) {
    for (const venue of venues) {
      const coordinates = venueCoordinatesById.get(venue.venue_id)
      if (!coordinates) continue

      distanceMilesByVenue.set(
        venue.venue_id,
        distanceMilesBetween(postcodeOrigin, coordinates)
      )
    }
  }

  const hasVenueFilters = Boolean(city || region || category || postcodeSearchAttempt)

  const eligibleVenues = venues.filter((venue) => {
    if (city) {
      if (
        normaliseFilterValue(getCanonicalVenueCity(venue)) !==
        normaliseFilterValue(city)
      ) {
        return false
      }
    }

    if (region) {
      if (
        normaliseFilterValue(getCanonicalVenueRegion(venue)) !==
        normaliseFilterValue(region)
      ) {
        return false
      }
    }

    if (!venueMatchesQuickCategory(venue, category)) {
      return false
    }

    if (postcodeSearchAttempt) {
      if (!postcodeOrigin) return false

      const distance = distanceMilesByVenue.get(venue.venue_id)
      if (
        distance === undefined ||
        distance > POSTCODE_SEARCH_RADIUS_MILES
      ) {
        return false
      }
    }

    return true
  })

  const eligibleVenueIds = eligibleVenues.map((venue) => venue.venue_id)

  const eventSelect =
    'event_id, venue_id, event_name, event_date, start_time, event_type, description, ticket_url, image_url, event_location_name, event_locality, event_postal_town, event_postcode, event_country, event_location_verified, event_address_visibility'

  let eventQuery = supabase
    .from('events')
    .select(eventSelect, { count: 'exact' })
    .eq('is_published', true)
    .gte('event_date', today)

  if (hasVenueFilters) {
    if (eligibleVenueIds.length === 0) {
      eventQuery = eventQuery.in('venue_id', ['__no_matching_venue__'])
    } else {
      eventQuery = eventQuery.in('venue_id', eligibleVenueIds)
    }
  }

  if (eventType) {
    eventQuery = eventQuery.eq('event_type', eventType)
  }

  if (timing === 'tonight') {
    eventQuery = eventQuery.eq('event_date', today)
  } else if (timing === 'next7') {
    eventQuery = eventQuery
      .gte('event_date', today)
      .lte('event_date', next7End)
  } else {
    if (dateFrom) {
      eventQuery = eventQuery.gte('event_date', dateFrom)
    }

    if (dateTo) {
      eventQuery = eventQuery.lte('event_date', dateTo)
    }
  }

  if (search && !postcodeSearchAttempt) {
    eventQuery = eventQuery.ilike('event_name', `%${search}%`)
  }

  eventQuery = eventQuery
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('start_time', { ascending: true, nullsFirst: false })
    .order('event_name', { ascending: true })

  let events: EventRow[] = []
  let filteredCount = 0

  if (timing === 'tonight') {
    const { data, error } = await eventQuery.limit(1000)

    if (error) {
      return (
        <main className="min-h-screen bg-zinc-950 p-8 text-white">
          Error loading events: {error.message}
        </main>
      )
    }

    const tonightEvents = ((data || []) as EventRow[]).filter((event) =>
      isTonightEvent(event, today)
    )

    filteredCount = tonightEvents.length
    const startIndex = (page - 1) * PAGE_SIZE
    events = tonightEvents.slice(startIndex, startIndex + PAGE_SIZE)
  } else {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await eventQuery.range(from, to)

    if (error) {
      return (
        <main className="min-h-screen bg-zinc-950 p-8 text-white">
          Error loading events: {error.message}
        </main>
      )
    }

    events = (data || []) as EventRow[]
    filteredCount = count || 0
  }

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const hasAdvancedFilters = Boolean(
    city || region || dateFrom || dateTo || eventType
  )
  const hasFilters = Boolean(
    search || timing || category || hasAdvancedFilters
  )

  const makeFilterHref = (
    updates: Partial<{
      search: string
      timing: string
      category: string
      city: string
      region: string
      date_from: string
      date_to: string
      event_type: string
      page: string
    }>
  ) => {
    const next = {
      search,
      timing,
      category,
      city,
      region,
      date_from: dateFrom,
      date_to: dateTo,
      event_type: eventType,
      page: '',
      ...updates,
    }

    const query = new URLSearchParams()

    if (next.search) query.set('search', next.search)
    if (next.timing) query.set('timing', next.timing)
    if (next.category) query.set('category', next.category)
    if (next.city) query.set('city', next.city)
    if (next.region) query.set('region', next.region)
    if (next.date_from) query.set('date_from', next.date_from)
    if (next.date_to) query.set('date_to', next.date_to)
    if (next.event_type) query.set('event_type', next.event_type)
    if (next.page && next.page !== '1') query.set('page', next.page)

    const queryString = query.toString()
    return queryString ? `/events?${queryString}` : '/events'
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 pb-24 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.1),transparent_28%)]" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">
              Scene Finder
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">
              Find events
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Find UK lifestyle, club, sauna and kink events by date, type or postcode.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                {totalPublishedEventCount || 0} events
              </span>
              <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                Updated daily
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-3 shadow-xl shadow-blue-950/20 ring-1 ring-purple-500/10 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              Quick find
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              See what is happening tonight, over the next 7 days, or by venue type.
            </p>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={makeFilterHref({
                timing: timing === 'tonight' ? '' : 'tonight',
                date_from: '',
                date_to: '',
              })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${quickChipClass(timing === 'tonight')}`}
            >
              Tonight
            </Link>

            <Link
              href={makeFilterHref({
                timing: timing === 'next7' ? '' : 'next7',
                date_from: '',
                date_to: '',
              })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${quickChipClass(timing === 'next7')}`}
            >
              Next 7 days
            </Link>

            <Link
              href={makeFilterHref({
                category: category === 'clubs' ? '' : 'clubs',
              })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${quickChipClass(category === 'clubs')}`}
            >
              Clubs
            </Link>

            <Link
              href={makeFilterHref({
                category: category === 'saunas' ? '' : 'saunas',
              })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${quickChipClass(category === 'saunas')}`}
            >
              Saunas
            </Link>

            <Link
              href={makeFilterHref({
                category: category === 'kink' ? '' : 'kink',
              })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${quickChipClass(category === 'kink')}`}
            >
              Kink
            </Link>
          </div>

          <form className="mt-4">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="Event or postcode..."
                aria-label="Search events by name or postcode"
                className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none sm:text-base"
              />

              <button
                type="submit"
                className="rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 sm:px-6"
              >
                Search
              </button>
            </div>

            {timing && <input type="hidden" name="timing" value={timing} />}
            {category && <input type="hidden" name="category" value={category} />}

            <details
              className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/60"
              open={hasAdvancedFilters}
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-zinc-200 marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  <span>Advanced filters</span>
                  <span className="text-blue-300">
                    {hasAdvancedFilters ? 'Active' : 'Open'}
                  </span>
                </span>
              </summary>

              <div className="grid grid-cols-1 gap-3 border-t border-zinc-800 p-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  name="city"
                  defaultValue={city}
                  className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white"
                >
                  <option value="">Any city</option>
                  {cityOptions.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>

                <select
                  name="region"
                  defaultValue={region}
                  className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white"
                >
                  <option value="">Any region</option>
                  {regionOptions.map((regionName) => (
                    <option key={regionName} value={regionName}>
                      {regionName}
                    </option>
                  ))}
                </select>

                <select
                  name="event_type"
                  defaultValue={eventType}
                  className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white"
                >
                  <option value="">Any event type</option>
                  {eventTypeOptions.map((typeName) => (
                    <option key={typeName} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  name="date_from"
                  defaultValue={dateFrom}
                  aria-label="Events from date"
                  className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white"
                />

                <input
                  type="date"
                  name="date_to"
                  defaultValue={dateTo}
                  aria-label="Events to date"
                  className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-sm text-white"
                />

                <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-5">
                  <button
                    type="submit"
                    className="rounded-2xl border border-blue-400/70 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                  >
                    Apply filters
                  </button>

                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-blue-500 hover:text-white"
                  >
                    Clear all
                  </Link>
                </div>
              </div>
            </details>
          </form>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {postcodeOrigin && (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                  Within {POSTCODE_SEARCH_RADIUS_MILES} miles of {postcodeOrigin.label}
                </span>
              )}

              {postcodeSearchAttempt && !postcodeOrigin && (
                <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-amber-200">
                  Postcode not recognised
                </span>
              )}

              {timing === 'tonight' && (
                <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 text-blue-200">
                  Tonight
                </span>
              )}

              {timing === 'next7' && (
                <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1.5 text-purple-200">
                  Next 7 days
                </span>
              )}

              {category && (
                <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-3 py-1.5 text-pink-200">
                  {category === 'clubs'
                    ? 'Clubs'
                    : category === 'saunas'
                      ? 'Saunas'
                      : 'Kink'}
                </span>
              )}

              {city && (
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200">
                  {city}
                </span>
              )}

              {region && (
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200">
                  {region}
                </span>
              )}

              {eventType && (
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200">
                  {eventType}
                </span>
              )}

              {(dateFrom || dateTo) && timing !== 'tonight' && timing !== 'next7' && (
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200">
                  {dateFrom || 'Any date'} → {dateTo || 'Any date'}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              Events
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {hasFilters ? 'Search results' : 'Upcoming events'}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {filteredCount} event{filteredCount === 1 ? '' : 's'} found
            </p>
          </div>

          {filteredCount > PAGE_SIZE && (
            <p className="text-xs font-semibold text-zinc-500">
              Page {safePage} of {totalPages}
            </p>
          )}
        </div>

        {events.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const venue = venueById.get(event.venue_id)
              const eventName = cleanText(event.event_name || '') || 'Untitled event'
              const venueName = cleanText(venue?.name || '') || 'Venue TBC'
              const venueCategory = getEventCategoryLabel(venue)
              const description = cleanDescription(event.description)
              const eventLocation = getEventLocation(event, venue)
              const distance = venue
                ? distanceMilesByVenue.get(venue.venue_id)
                : undefined
              const cardImage = event.image_url || venue?.image_url || '/images/home-hero.jpg'
              const isTonight = isTonightEvent(event, today)

              return (
                <article
                  key={event.event_id}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-950/40"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                    <FallbackImage
                      src={cardImage}
                      fallbackSrc="/images/home-hero.jpg"
                      alt={eventName}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {isTonight && (
                        <span className="rounded-full border border-blue-300/60 bg-blue-500/90 px-2.5 py-1 text-[11px] font-black text-white shadow-lg">
                          Tonight
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getVenueCategoryPillClass(
                          venue?.category
                        )}`}
                      >
                        {venueCategory}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
                      <span>{formatDate(event.event_date)}</span>
                      <span>•</span>
                      <span>{formatTime(event.start_time)}</span>
                    </div>

                    <h3 className="mt-2 text-xl font-black leading-tight text-white">
                      {eventName}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-blue-200">
                      {venueName}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      📍 {eventLocation}
                    </p>

                    {postcodeOrigin && distance !== undefined && (
                      <p className="mt-1 text-xs font-bold text-emerald-300">
                        {formatDistanceMiles(distance)}
                      </p>
                    )}

                    {event.event_type && (
                      <div className="mt-3">
                        <span className="rounded-full border border-zinc-700 bg-zinc-950/70 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                          {cleanText(event.event_type)}
                        </span>
                      </div>
                    )}

                    {description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                        {description}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Link
                        href={`/events/${event.event_id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-blue-400/60 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                      >
                        View details →
                      </Link>

                      {event.ticket_url ? (
                        <a
                          href={event.ticket_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-blue-500 hover:text-white"
                        >
                          Tickets / booking ↗
                        </a>
                      ) : (
                        <Link
                          href={`/venue/${event.venue_id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-blue-500 hover:text-white"
                        >
                          View venue →
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 text-center">
            <h3 className="text-xl font-black">No events found</h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Try a nearby postcode, widen the date range, or remove one of the filters.
            </p>

            <Link
              href="/events"
              className="mt-5 inline-flex rounded-2xl border border-blue-400/60 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
            >
              Clear filters
            </Link>
          </div>
        )}

        {filteredCount > PAGE_SIZE && (
          <nav className="mt-8 flex items-center justify-center gap-3">
            {safePage > 1 ? (
              <Link
                href={makeFilterHref({ page: String(safePage - 1) })}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-blue-500 hover:text-white"
              >
                ← Previous
              </Link>
            ) : (
              <span className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-600">
                ← Previous
              </span>
            )}

            <span className="text-sm font-semibold text-zinc-400">
              {safePage} / {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={makeFilterHref({ page: String(safePage + 1) })}
                className="rounded-2xl border border-blue-400/60 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-600">
                Next →
              </span>
            )}
          </nav>
        )}

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-5 text-zinc-500">
          Scene Finder is an independent directory. Always check the official venue
          or event source before travelling, booking or attending.
        </p>
      </section>
    </main>
  )
}
