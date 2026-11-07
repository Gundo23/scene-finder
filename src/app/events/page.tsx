import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Form from 'next/form'
import Icon from '@/app/components/Icon'
import { addDays, getTodayString, getWeekendRange } from '@/lib/discovery-dates'
import { shouldShowPublicVenue } from '@/lib/venue-visibility'
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
  address_verified: boolean | null
  category: string | null
  status: string | null
  image_url: string | null
}

type EventRow = {
  event_id: string
  organiser_id: string | null
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
    if (venue.address_visibility !== 'public' || venue.address_verified !== true) continue
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

function isTonightEvent(event: EventRow, today: string) {
  if (event.event_date !== today) return false

  const start = cleanText(event.start_time || '').slice(0, 5)
  return !start || start === '00:00' || start >= '17:00'
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : ''
}

function httpUrl(value: string | null | undefined) {
  try {
    const url = new URL((value || '').trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

type SearchFilters = {
  search: string
  timing: string
  category: string
  city: string
  region: string
  date_from: string
  date_to: string
  event_type: string
  page: string
}

const timingOptions = [
  { value: '', label: 'All dates' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'next7', label: 'Next 7 days' },
]

const categoryOptions = [
  { value: 'clubs', label: 'Clubs' },
  { value: 'saunas', label: 'Saunas' },
  { value: 'kink', label: 'Kink & fetish' },
]

const fieldClass =
  'min-h-12 w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-white transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const param = (name: string) => {
    const value = params[name]
    return cleanText(Array.isArray(value) ? value[0] || '' : value || '')
  }

  const search = param('search')
  const city = param('city')
  const region = param('region')
  const category = categoryOptions.some((option) => option.value === param('category'))
    ? param('category')
    : ''
  const dateFrom = validDate(param('date_from'))
  const dateTo = validDate(param('date_to'))
  // A chosen date range takes precedence over a previous quick-date shortcut.
  const timing = !dateFrom && !dateTo && timingOptions.some((option) => option.value === param('timing'))
    ? param('timing')
    : ''
  const eventType = param('event_type')
  const requestedPage = Number(param('page') || '1')
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const today = getTodayString()
  const next7End = addDays(today, 6)
  const weekend = getWeekendRange(today)
  const invalidDateRange = Boolean(dateFrom && dateTo && dateTo < dateFrom)
  const invalidDateInput = Boolean(
    (param('date_from') && !dateFrom) || (param('date_to') && !dateTo)
  )
  const postcodeSearchAttempt = looksLikeUkPostcodeSearch(search)

  const [
    { data: venueData, error: venueError },
    { data: eventTypeData, error: eventTypeError },
    postcodeOrigin,
  ] = await Promise.all([
    supabase
      .from('venues')
      .select(
        'venue_id, name, city_area, region, canonical_city, canonical_region, postcode, latitude, longitude, location_kind, address_visibility, address_verified, category, status, image_url'
      )
      .order('name', { ascending: true })
      .limit(5000),
    supabase
      .from('events')
      .select('event_type')
      .eq('is_published', true)
      .gte('event_date', today)
      .not('event_type', 'is', null)
      .limit(5000),
    postcodeSearchAttempt ? resolvePostcodeOrigin(search) : Promise.resolve(null),
  ])

  if (venueError) console.error('Error loading event locations:', venueError.message)
  if (eventTypeError) console.error('Error loading event types:', eventTypeError.message)

  const venues = ((venueData || []) as VenueRow[]).filter(shouldShowPublicVenue)
  const venueById = new Map(venues.map((venue) => [venue.venue_id, venue]))
  const cityOptions = uniqueSorted([...venues.map(getCanonicalVenueCity), city])
  const regionOptions = uniqueSorted([...FALLBACK_REGIONS, region])
  const eventTypeOptions = uniqueSorted([
    ...(eventTypeData || []).map((item: { event_type: string | null }) => item.event_type),
    eventType,
  ])

  const venueCoordinatesById = postcodeOrigin
    ? await resolveVenueCoordinates(venues)
    : new Map<string, { latitude: number; longitude: number }>()
  const distanceMilesByVenue = new Map<string, number>()

  if (postcodeOrigin) {
    for (const venue of venues) {
      const coordinates = venueCoordinatesById.get(venue.venue_id)
      if (coordinates) {
        distanceMilesByVenue.set(venue.venue_id, distanceMilesBetween(postcodeOrigin, coordinates))
      }
    }
  }

  const hasVenueFilters = Boolean(city || region || category || postcodeSearchAttempt)
  const eligibleVenueIds = venues.filter((venue) => {
    if (city && normaliseFilterValue(getCanonicalVenueCity(venue)) !== normaliseFilterValue(city)) return false
    if (region && normaliseFilterValue(getCanonicalVenueRegion(venue)) !== normaliseFilterValue(region)) return false
    if (!venueMatchesQuickCategory(venue, category)) return false
    if (postcodeSearchAttempt) {
      if (!postcodeOrigin) return false
      const distance = distanceMilesByVenue.get(venue.venue_id)
      if (distance === undefined || distance > POSTCODE_SEARCH_RADIUS_MILES) return false
    }
    return true
  }).map((venue) => venue.venue_id)

  const eventSelect =
    'event_id, venue_id, organiser_id, event_name, event_date, start_time, event_type, description, ticket_url, image_url, event_location_name, event_locality, event_postal_town, event_postcode, event_country, event_location_verified, event_address_visibility'

  const createEventQuery = (countOnly = false) => {
    let query = supabase
      .from('events')
      .select(countOnly ? 'event_id' : eventSelect, countOnly ? { count: 'exact', head: true } : {})
      .eq('is_published', true)
      .gte('event_date', today)

    if (hasVenueFilters) query = query.in('venue_id', eligibleVenueIds)
    if (eventType) query = query.eq('event_type', eventType)

    if (timing === 'tonight') {
      query = query.eq('event_date', today)
        .or('start_time.is.null,start_time.eq.00:00:00,start_time.gte.17:00:00')
    } else if (timing === 'weekend') {
      query = query.gte('event_date', weekend.start).lte('event_date', weekend.end)
    } else if (timing === 'next7') {
      query = query.lte('event_date', next7End)
    } else {
      if (dateFrom) query = query.gte('event_date', dateFrom)
      if (dateTo) query = query.lte('event_date', dateTo)
    }

    if (search && !postcodeSearchAttempt) query = query.ilike('event_name', `%${search}%`)
    return query
  }

  let events: EventRow[] = []
  let filteredCount = 0
  let loadError = Boolean(venueError)
  let safePage = 1
  let totalPages = 1

  if (!loadError && !invalidDateRange && (!hasVenueFilters || eligibleVenueIds.length > 0)) {
    // Count before choosing the range: an old/bookmarked page number must never
    // render an empty page while claiming to show the last page of results.
    const { count, error: countError } = await createEventQuery(true)
    if (countError) {
      console.error('Error counting events:', countError.message)
      loadError = true
    } else {
      filteredCount = count || 0
      totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE))
      safePage = Math.min(page, totalPages)
      if (filteredCount > 0) {
        const from = (safePage - 1) * PAGE_SIZE
        const { data, error } = await createEventQuery()
          .order('event_date', { ascending: true, nullsFirst: false })
          .order('start_time', { ascending: true, nullsFirst: false })
          .order('event_name', { ascending: true })
          .order('event_id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1)
        if (error) {
          console.error('Error loading events:', error.message)
          loadError = true
        } else {
          events = (data || []) as unknown as EventRow[]
        }
      }
    }
  }

  const makeFilterHref = (updates: Partial<SearchFilters>) => {
    const next: SearchFilters = {
      search, timing, category, city, region,
      date_from: dateFrom, date_to: dateTo, event_type: eventType, page: '',
      ...updates,
    }
    const query = new URLSearchParams()
    for (const [name, value] of Object.entries(next)) {
      if (value && !(name === 'page' && value === '1')) query.set(name, value)
    }
    return query.size ? `/events?${query.toString()}` : '/events'
  }

  const currentHref = makeFilterHref({ page: String(safePage) })
  const fromQuery = `?from=${encodeURIComponent(currentHref)}`
  const timingLabel = timingOptions.find((option) => option.value === timing)?.label || 'All upcoming'
  const categoryLabel = categoryOptions.find((option) => option.value === category)?.label
  const advancedFilterCount = [city, region, category, eventType, dateFrom || dateTo].filter(Boolean).length
  const activeFilters: Array<{ label: string; href: string }> = [
    ...(search ? [{
      label: postcodeOrigin ? `Within ${POSTCODE_SEARCH_RADIUS_MILES} miles of ${postcodeOrigin.label}` : `Search: ${search}`,
      href: makeFilterHref({ search: '' }),
    }] : []),
    ...(timing ? [{ label: timingLabel, href: makeFilterHref({ timing: '' }) }] : []),
    ...(categoryLabel ? [{ label: categoryLabel, href: makeFilterHref({ category: '' }) }] : []),
    ...(city ? [{ label: city, href: makeFilterHref({ city: '' }) }] : []),
    ...(region ? [{ label: region, href: makeFilterHref({ region: '' }) }] : []),
    ...(eventType ? [{ label: eventType, href: makeFilterHref({ event_type: '' }) }] : []),
    ...(dateFrom || dateTo ? [{
      label: `${dateFrom ? formatDate(dateFrom) : 'Any date'} – ${dateTo ? formatDate(dateTo) : 'onwards'}`,
      href: makeFilterHref({ date_from: '', date_to: '' }),
    }] : []),
  ]
  const hasFilters = activeFilters.length > 0

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-8 pt-6 text-white sm:px-6 sm:pt-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-300">Scene Finder</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Events</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Club nights, socials & more.</p>
          </div>
          <Link href="/" aria-label="Scene Finder home" className="shrink-0 rounded-xl">
            <FallbackImage src="/images/scene-finder-logo-transparent.png" fallbackSrc="/images/home-hero.jpg" alt="" className="h-20 w-24 object-contain sm:h-24 sm:w-28" loading="eager" />
          </Link>
        </header>

        <section aria-label="Find events" className="overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/20 shadow-xl shadow-blue-950/15">
          <Form action="/events" scroll={false} className="p-4 sm:p-5">
            <label htmlFor="event-search" className="sr-only">Search events by name or postcode</label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"><Icon name="search" /></span>
                <input
                  key={`search-${search}`}
                  id="event-search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Event or postcode"
                  autoComplete="off"
                  className={`${fieldClass} pl-11`}
                />
              </div>
              <button type="submit" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:brightness-110 sm:px-6">
                Search
              </button>
            </div>
            {timing && <input type="hidden" name="timing" value={timing} />}

            <div aria-label="When" className="mt-4 grid grid-cols-4 gap-1.5 sm:flex sm:gap-2">
              {timingOptions.map((option) => {
                const active = timing === option.value && !dateFrom && !dateTo
                return (
                  <Link key={option.label}
                    href={makeFilterHref({ timing: option.value, date_from: '', date_to: '' })}
                    scroll={false}
                    aria-current={active ? 'true' : undefined}
                    className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-2 py-2 text-center text-xs font-semibold leading-4 transition sm:px-4 sm:text-sm ${quickChipClass(active)}`}
                  >{option.label}</Link>
                )
              })}
            </div>

            <details key={currentHref} className="group mt-4 border-t border-zinc-800/80 pt-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-zinc-300 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2"><Icon name="filter" className="h-4 w-4 text-blue-300" />Filters{advancedFilterCount > 0 && <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-200">{advancedFilterCount}</span>}</span>
                <span className="inline-flex items-center gap-2 text-xs font-normal text-zinc-400"><span className="hidden sm:inline">Location, type & dates</span><Icon name="chevron-down" className="h-4 w-4 transition group-open:rotate-180" /></span>
              </summary>
              <div className="grid grid-cols-1 gap-4 pb-2 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>City or area</span>
                  <select key={`city-${city}`} name="city" defaultValue={city} className={fieldClass}>
                    <option value="">Any city</option>
                    {cityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>Region</span>
                  <select key={`region-${region}`} name="region" defaultValue={region} className={fieldClass}>
                    <option value="">Any region</option>
                    {regionOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>Venue type</span>
                  <select key={`category-${category}`} name="category" defaultValue={category} className={fieldClass}>
                    <option value="">All venue types</option>
                    {categoryOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>Event type</span>
                  <select key={`type-${eventType}`} name="event_type" defaultValue={eventType} className={fieldClass}>
                    <option value="">All event types</option>
                    {eventTypeOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>From date</span>
                  <input key={`from-${dateFrom}`} type="date" name="date_from" defaultValue={dateFrom} min={today} className={fieldClass} />
                </label>
                <label className="min-w-0 space-y-2 text-xs font-semibold text-zinc-400">
                  <span>Until date</span>
                  <input key={`to-${dateTo}`} type="date" name="date_to" defaultValue={dateTo} min={dateFrom || today} className={fieldClass} />
                </label>
                <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4 sm:col-span-2 lg:col-span-3">
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/15 px-5 py-2.5 text-sm font-bold text-blue-100 transition hover:bg-blue-500/25">Apply filters</button>
                  <Link href="/events" className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-zinc-400 hover:text-white">Reset all</Link>
                  {timing && <p className="text-xs leading-5 text-zinc-500 sm:ml-auto">Choosing dates replaces “{timingLabel}”.</p>}
                </div>
              </div>
            </details>
          </Form>
        </section>

        {hasFilters && (
          <div aria-label="Active filters" className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilters.map(({ label, href }) => (
              <Link key={label} href={href} scroll={false} aria-label={`Remove filter: ${label}`} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 py-2 pl-3.5 pr-3 text-xs text-zinc-200 transition hover:border-blue-400/60 hover:bg-blue-500/10">
                <span className="truncate">{label}</span><Icon name="close" className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              </Link>
            ))}
            <Link href="/events" scroll={false} className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-blue-300 hover:text-blue-200">Clear all</Link>
          </div>
        )}

        {postcodeSearchAttempt && !postcodeOrigin && (
          <p role="status" className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200">We couldn’t find that postcode. Try a full postcode or a postcode area, such as M1.</p>
        )}
        {invalidDateInput && (
          <p role="status" className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200">One of the dates was not recognised. Choose a date using Filters.</p>
        )}

        <section id="event-results" aria-labelledby="results-heading" className="mt-7 scroll-mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="results-heading" className="text-xl font-bold tracking-tight sm:text-2xl">{hasFilters ? 'Your results' : 'Upcoming events'}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {loadError ? 'Events are temporarily unavailable' : `${filteredCount.toLocaleString('en-GB')} event${filteredCount === 1 ? '' : 's'} found`}
                {!loadError && filteredCount > 0 && <span className="text-zinc-500"> · Soonest first</span>}
              </p>
            </div>
            {!loadError && filteredCount > PAGE_SIZE && <p className="text-xs text-zinc-400">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredCount)}</p>}
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-blue-500/20 bg-zinc-900/50 px-5 py-10 text-center">
              <Icon name="calendar" className="mx-auto h-8 w-8 text-blue-300" />
              <h3 className="mt-4 text-xl font-bold">We couldn’t load the events</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">Please try again. Your search and filters have been kept.</p>
              <a href={currentHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400">Try again</a>
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const venue = venueById.get(event.venue_id)
                const organiser = event.organiser_id ? venueById.get(event.organiser_id) : null
                const eventName = cleanText(event.event_name || '') || 'Event details'
                const venueName = cleanText(venue?.name || '') || 'Venue to be confirmed'
                const eventLocation = getEventLocation(event, venue)
                const distance = venue ? distanceMilesByVenue.get(venue.venue_id) : undefined
                const isTonight = isTonightEvent(event, today)
                const detailsHref = `/events/${encodeURIComponent(event.event_id)}${fromQuery}`
                const ticketUrl = httpUrl(event.ticket_url)
                const typeLabel = cleanText(event.event_type || '')

                return (
                  <article key={event.event_id} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-zinc-900 to-zinc-950 transition duration-200 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-950/30">
                    <Link href={detailsHref} aria-label={`View ${eventName}`} className="block aspect-[16/10] overflow-hidden border-b border-zinc-800/70 bg-zinc-950/80">
                      <FallbackImage src={event.image_url || venue?.image_url} fallbackSrc="/images/home-hero.jpg" alt={eventName} className="h-full w-full object-contain p-3" />
                    </Link>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-blue-200">
                        <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="h-3.5 w-3.5" /><time dateTime={event.event_date || undefined}>{formatDate(event.event_date)}</time></span>
                        <span className="inline-flex items-center gap-1.5 text-zinc-400"><Icon name="clock" className="h-3.5 w-3.5" />{formatTime(event.start_time)}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight sm:text-xl"><Link href={detailsHref} className="line-clamp-2 hover:text-blue-200">{eventName}</Link></h3>
                      {venue ? <Link href={`/venue/${encodeURIComponent(venue.venue_id)}${fromQuery}`} className="mt-2 w-fit max-w-full text-sm font-semibold text-zinc-300 hover:text-blue-200">{venueName}</Link> : <p className="mt-2 text-sm text-zinc-400">{venueName}</p>}
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-zinc-400"><Icon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{eventLocation}{postcodeOrigin && distance !== undefined && <span className="text-emerald-300"> · {formatDistanceMiles(distance)}</span>}</span></p>
                      {(isTonight || typeLabel) && <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">{isTonight && <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-purple-200">Tonight</span>}{typeLabel && <span className="text-zinc-500">{typeLabel}</span>}</div>}
                      {organiser && organiser.venue_id !== venue?.venue_id && <Link href={`/venue/${encodeURIComponent(organiser.venue_id)}${fromQuery}`} className="mt-2 inline-flex min-h-8 items-center text-xs text-zinc-400 hover:text-blue-200">Hosted by {cleanText(organiser.name || 'Travelling organiser')}</Link>}
                      <div className="mt-auto flex gap-2 pt-5">
                        <Link href={detailsHref} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-blue-500/15 px-3 py-2.5 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25">Details <Icon name="arrow-right" className="h-4 w-4" /></Link>
                        {ticketUrl && <a href={ticketUrl} target="_blank" rel="noreferrer noopener" aria-label={`Tickets and booking for ${eventName} (opens in a new tab)`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-purple-400/60 hover:bg-purple-500/10">Tickets <Icon name="external" className="h-3.5 w-3.5" /></a>}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center sm:py-14">
              <Icon name="search" className="mx-auto h-8 w-8 text-blue-300" />
              <h3 className="mt-4 text-xl font-bold">{invalidDateRange ? 'Check your dates' : 'No events match just yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{invalidDateRange ? 'The end date needs to be on or after the start date. Open Filters to change your dates.' : 'Try another area, widen your dates, or remove a filter above.'}</p>
              <Link href="/events" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-blue-500/15 px-5 py-2.5 text-sm font-semibold text-blue-100 hover:bg-blue-500/25">See all upcoming events <Icon name="arrow-right" className="h-4 w-4" /></Link>
            </div>
          )}

          {!loadError && totalPages > 1 && (
            <nav aria-label="Event result pages" className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
              {safePage > 1 ? <Link href={`${makeFilterHref({ page: String(safePage - 1) })}#event-results`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-blue-400/50"><Icon name="arrow-left" className="h-4 w-4" />Previous</Link> : <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm text-zinc-600"><Icon name="arrow-left" className="h-4 w-4" />Previous</span>}
              <span className="text-xs text-zinc-400" aria-current="page">Page {safePage} of {totalPages}</span>
              {safePage < totalPages ? <Link href={`${makeFilterHref({ page: String(safePage + 1) })}#event-results`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/40 bg-blue-500/15 px-4 py-2.5 text-sm font-semibold text-blue-100 hover:bg-blue-500/25">Next<Icon name="arrow-right" className="h-4 w-4" /></Link> : <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm text-zinc-600">Next<Icon name="arrow-right" className="h-4 w-4" /></span>}
            </nav>
          )}
        </section>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-zinc-500">Check the official event page for entry requirements, prices and any last-minute changes.</p>
      </div>
    </main>
  )
}
