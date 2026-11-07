import { supabase } from '@/lib/supabase'
import { eventProfileIds } from '@/lib/event-profiles'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import VenueLikeButton from '@/app/components/VenueLikeButton'
import { cleanText } from '@/lib/cleanText'
import { shouldShowPublicVenue } from '@/lib/venue-visibility'
import { getTodayString, addDays, getWeekendRange } from '@/lib/discovery-dates'
import Icon from '@/app/components/Icon'
import Form from 'next/form'
import VenueDiscoveryMap from '@/app/components/VenueDiscoveryMap'
export const dynamic = 'force-dynamic'
export const revalidate = 0
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
const FALLBACK_CITIES = [
  'Bath',
  'Birmingham',
  'Bradford',
  'Brighton and Hove',
  'Bristol',
  'Cambridge',
  'Canterbury',
  'Carlisle',
  'Chelmsford',
  'Chester',
  'Chichester',
  'Colchester',
  'Coventry',
  'Derby',
  'Doncaster',
  'Durham',
  'Ely',
  'Exeter',
  'Gloucester',
  'Hereford',
  'Kingston upon Hull',
  'Lancaster',
  'Leeds',
  'Leicester',
  'Lichfield',
  'Lincoln',
  'Liverpool',
  'London',
  'Manchester',
  'Milton Keynes',
  'Newcastle upon Tyne',
  'Norwich',
  'Nottingham',
  'Oxford',
  'Peterborough',
  'Plymouth',
  'Portsmouth',
  'Preston',
  'Ripon',
  'St Albans',
  'Salford',
  'Salisbury',
  'Sheffield',
  'Southampton',
  'Southend-on-Sea',
  'Stoke-on-Trent',
  'Sunderland',
  'Truro',
  'Wakefield',
  'Wells',
  'Westminster',
  'Winchester',
  'Wolverhampton',
  'Worcester',
  'York',
  'Aberdeen',
  'Dundee',
  'Dunfermline',
  'Edinburgh',
  'Glasgow',
  'Inverness',
  'Perth',
  'Stirling',
  'Bangor',
  'Cardiff',
  'Newport',
  'St Asaph',
  'St Davids',
  'Swansea',
  'Wrexham',
]
function getNextSevenDaysRange(today: string) {
  return { start: today, end: addDays(today, 6) }
}
function formatShortDate(date: string | null | undefined) {
  if (!date) return 'TBC'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
function formatPostcodeSearch(value: string) {
  const compact = value.toUpperCase().replace(/\s+/g, '')
  if (compact.length <= 3) {
    return compact
  }
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
}
const POSTCODE_SEARCH_RADIUS_MILES = 30
type GeoPoint = {
  latitude: number
  longitude: number
  label: string
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
    if (latitude === null || longitude === null) {
      return null
    }
    return {
      latitude,
      longitude,
      label: cleanText(result?.postcode || result?.outcode || value).toUpperCase(),
    }
  } catch (error) {
    console.error('Postcode lookup failed:', error)
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
  if (value < 0.1) return '<0.1 miles'
  if (value < 10) return `${value.toFixed(1)} miles`
  return `${Math.round(value)} miles`
}
async function resolveVenueCoordinates(
  venues: Array<{
    venue_id?: string | null
    postcode?: string | null
    latitude?: number | string | null
    longitude?: number | string | null
    location_kind?: string | null
    address_visibility?: string | null
    address_verified?: boolean | null
  }>
) {
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
        if (
          !postcodeKey ||
          latitude === null ||
          longitude === null
        ) {
          continue
        }
        for (const venueId of missingByPostcode.get(postcodeKey) || []) {
          coordinatesByVenueId.set(venueId, { latitude, longitude })
        }
      }
    } catch (error) {
      console.error('Venue postcode batch lookup failed:', error)
    }
  }
  return coordinatesByVenueId
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
// Search regions must use one canonical UK region value. Do not let free-text
// database values such as "North West London" accidentally match "North West".
const VENUE_REGION_OVERRIDES: Record<string, string> = {
  house_of_poitier_sutton: 'London',
}
const CITY_REGION_HINTS: Record<string, string> = {
  // North East
  durham: 'North East',
  'newcastle upon tyne': 'North East',
  newcastle: 'North East',
  sunderland: 'North East',
  gateshead: 'North East',
  middlesbrough: 'North East',
  darlington: 'North East',
  // North West
  blackpool: 'North West',
  bolton: 'North West',
  burnley: 'North West',
  carlisle: 'North West',
  chester: 'North West',
  crewe: 'North West',
  lancaster: 'North West',
  liverpool: 'North West',
  macclesfield: 'North West',
  manchester: 'North West',
  oldham: 'North West',
  preston: 'North West',
  rochdale: 'North West',
  runcorn: 'North West',
  salford: 'North West',
  stockport: 'North West',
  swinton: 'North West',
  warrington: 'North West',
  wigan: 'North West',
  // Yorkshire and the Humber
  bradford: 'Yorkshire and the Humber',
  doncaster: 'Yorkshire and the Humber',
  halifax: 'Yorkshire and the Humber',
  harrogate: 'Yorkshire and the Humber',
  huddersfield: 'Yorkshire and the Humber',
  'kingston upon hull': 'Yorkshire and the Humber',
  hull: 'Yorkshire and the Humber',
  leeds: 'Yorkshire and the Humber',
  ripon: 'Yorkshire and the Humber',
  sheffield: 'Yorkshire and the Humber',
  wakefield: 'Yorkshire and the Humber',
  york: 'Yorkshire and the Humber',
  // East Midlands
  derby: 'East Midlands',
  leicester: 'East Midlands',
  lincoln: 'East Midlands',
  northampton: 'East Midlands',
  nottingham: 'East Midlands',
  'west bridgford': 'East Midlands',
  // West Midlands
  birmingham: 'West Midlands',
  coventry: 'West Midlands',
  dudley: 'West Midlands',
  hereford: 'West Midlands',
  lichfield: 'West Midlands',
  solihull: 'West Midlands',
  'stoke on trent': 'West Midlands',
  'west bromwich': 'West Midlands',
  wolverhampton: 'West Midlands',
  worcester: 'West Midlands',
  // East of England
  bedford: 'East of England',
  cambridge: 'East of England',
  chelmsford: 'East of England',
  colchester: 'East of England',
  ely: 'East of England',
  ipswich: 'East of England',
  luton: 'East of England',
  norwich: 'East of England',
  peterborough: 'East of England',
  'st albans': 'East of England',
  'southend on sea': 'East of England',
  // London
  london: 'London',
  westminster: 'London',
  sutton: 'London',
  croydon: 'London',
  bromley: 'London',
  camden: 'London',
  'south london': 'London',
  'north london': 'London',
  'east london': 'London',
  'west london': 'London',
  'central london': 'London',
  // South East
  'brighton and hove': 'South East',
  brighton: 'South East',
  canterbury: 'South East',
  chichester: 'South East',
  guildford: 'South East',
  maidstone: 'South East',
  'milton keynes': 'South East',
  oxford: 'South East',
  portsmouth: 'South East',
  reading: 'South East',
  slough: 'South East',
  southampton: 'South East',
  winchester: 'South East',
  // South West
  bath: 'South West',
  bournemouth: 'South West',
  bristol: 'South West',
  cheltenham: 'South West',
  exeter: 'South West',
  gloucester: 'South West',
  plymouth: 'South West',
  salisbury: 'South West',
  swindon: 'South West',
  truro: 'South West',
  wells: 'South West',
  // Scotland
  aberdeen: 'Scotland',
  dundee: 'Scotland',
  dunfermline: 'Scotland',
  edinburgh: 'Scotland',
  glasgow: 'Scotland',
  inverness: 'Scotland',
  perth: 'Scotland',
  stirling: 'Scotland',
  // Wales
  bangor: 'Wales',
  cardiff: 'Wales',
  newport: 'Wales',
  'st asaph': 'Wales',
  'st davids': 'Wales',
  swansea: 'Wales',
  wrexham: 'Wales',
  // Northern Ireland
  belfast: 'Northern Ireland',
  lisburn: 'Northern Ireland',
  'londonderry derry': 'Northern Ireland',
  derry: 'Northern Ireland',
}
const REGION_ALIASES: Record<string, string> = {
  'north east': 'North East',
  'north east england': 'North East',
  northeast: 'North East',
  'north west': 'North West',
  'north west england': 'North West',
  northwest: 'North West',
  'yorkshire and the humber': 'Yorkshire and the Humber',
  yorkshire: 'Yorkshire and the Humber',
  'east midlands': 'East Midlands',
  'west midlands': 'West Midlands',
  'east of england': 'East of England',
  london: 'London',
  'greater london': 'London',
  'south east': 'South East',
  'south east england': 'South East',
  southeast: 'South East',
  'south west': 'South West',
  'south west england': 'South West',
  southwest: 'South West',
  scotland: 'Scotland',
  wales: 'Wales',
  'northern ireland': 'Northern Ireland',
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
function getLocationParts(value: string | null | undefined) {
  return cleanText(value || '')
    .split(/\s*(?:\/|\||•|,|;|–|—)\s*/)
    .map((part) => normaliseFilterValue(part))
    .filter(Boolean)
}
function getCanonicalStoredRegion(value: string | null | undefined) {
  const normalized = normaliseFilterValue(value)
  if (!normalized) return ''
  // "North West London", "South East London", etc. are London, not UK regions.
  if (normalized.includes('london')) return 'London'
  return REGION_ALIASES[normalized] || ''
}
function getCanonicalVenueRegion(venue: {
  venue_id?: string | null
  city_area?: string | null
  region?: string | null
  canonical_region?: string | null
}) {
  const verifiedRegion = getCanonicalStoredRegion(venue.canonical_region)
  if (verifiedRegion) return verifiedRegion
  const venueId = cleanText(venue.venue_id || '').toLowerCase()
  const explicitOverride = VENUE_REGION_OVERRIDES[venueId]
  if (explicitOverride) return explicitOverride
  const cityParts = getLocationParts(venue.city_area)
  for (const cityPart of cityParts) {
    const cityRegion = CITY_REGION_HINTS[cityPart]
    if (cityRegion) return cityRegion
  }
  const fullCity = normaliseFilterValue(venue.city_area)
  const fullCityRegion = CITY_REGION_HINTS[fullCity]
  if (fullCityRegion) return fullCityRegion
  return getCanonicalStoredRegion(venue.region)
}
function getCanonicalVenueCity(venue: {
  city_area?: string | null
  canonical_city?: string | null
}) {
  return cleanText(venue.canonical_city || venue.city_area || '')
}
function containsWholeLocationPhrase(haystack: string, needle: string) {
  if (!haystack || !needle) return false
  return ` ${haystack} `.includes(` ${needle} `)
}
function venueMatchesFilters(
  venue: {
    venue_id?: string | null
    name?: string | null
    city_area?: string | null
    region?: string | null
    canonical_city?: string | null
    canonical_region?: string | null
    postcode?: string | null
    category?: string | null
  },
  filters: {
    search: string
    city: string
    region: string
    postcodeSearch: string
  }
) {
  const searchTerm = normaliseFilterValue(filters.search)
  const selectedCity = normaliseFilterValue(filters.city)
  const selectedRegion = normaliseFilterValue(filters.region)
  const postcodeSearch = normaliseFilterValue(filters.postcodeSearch)
  const venueId = normaliseFilterValue(venue.venue_id)
  const venueName = normaliseFilterValue(venue.name)
  const venueCity = normaliseFilterValue(getCanonicalVenueCity(venue))
  const canonicalVenueRegion = getCanonicalVenueRegion(venue)
  const venueRegion = normaliseFilterValue(canonicalVenueRegion)
  const venuePostcode = normaliseFilterValue(venue.postcode)
  const venueCategory = normaliseFilterValue(venue.category)
  const searchMatch =
    !searchTerm ||
    venueName.includes(searchTerm) ||
    venueId.includes(searchTerm) ||
    venueCity.includes(searchTerm) ||
    venueRegion.includes(searchTerm) ||
    venueCategory.includes(searchTerm) ||
    venuePostcode.includes(searchTerm) ||
    (!!postcodeSearch && venuePostcode.includes(postcodeSearch))
  const cityMatch = !selectedCity || venueCity === selectedCity
  // Exact after canonicalisation: no more "North West London" matching "North West".
  const regionMatch = !selectedRegion || venueRegion === selectedRegion
  return searchMatch && cityMatch && regionMatch
}
type VenueEventDiscovery = {
  error: string | null
  upcomingEventCountByVenue: Map<string, number>
  nextEventDateByVenue: Map<string, string>
  tonightVenueIds: Set<string>
  nextSevenDaysVenueIds: Set<string>
  weekendVenueIds: Set<string>
  socialVenueIds: Set<string>
  newbieVenueIds: Set<string>
  bdsmVenueIds: Set<string>
}
async function fetchVenueEventDiscovery(today: string, timing: string): Promise<VenueEventDiscovery> {
  const upcomingEventCountByVenue = new Map<string, number>()
  const nextEventDateByVenue = new Map<string, string>()
  const tonightVenueIds = new Set<string>()
  const nextSevenDaysVenueIds = new Set<string>()
  const weekendVenueIds = new Set<string>()
  const weekend = getWeekendRange(today)
  const socialVenueIds = new Set<string>()
  const newbieVenueIds = new Set<string>()
  const bdsmVenueIds = new Set<string>()
  const nextSevenDays = getNextSevenDaysRange(today)
  const pageSize = 1000
  let lastEventId: string | null = null
  while (true) {
    let query = supabase
      .from('events')
      .select('event_id, venue_id, organiser_id, event_name, event_type, event_date, start_time')
      .eq('is_published', true)
      .or(`event_date.gte.${today},event_date.is.null`)
      .order('event_id', { ascending: true })
      .limit(pageSize)
    if (lastEventId) query = query.gt('event_id', lastEventId)
    const { data, error } = await query
    if (error || !data) {
      const message = error?.message || 'Event query returned no data'
      console.error('Error loading venue event discovery data:', message)
      return {
        error: message,
        upcomingEventCountByVenue: new Map(),
        nextEventDateByVenue: new Map(),
        tonightVenueIds: new Set(),
        nextSevenDaysVenueIds: new Set(),
        weekendVenueIds: new Set(),
        socialVenueIds: new Set(),
        newbieVenueIds: new Set(),
        bdsmVenueIds: new Set(),
      }
    }
    data?.forEach((originalEvent) => {
      if (!originalEvent.venue_id) return
      for (const profileId of eventProfileIds(originalEvent)) {
      const event = { ...originalEvent, venue_id: profileId }
      upcomingEventCountByVenue.set(
        event.venue_id,
        (upcomingEventCountByVenue.get(event.venue_id) || 0) + 1
      )
      if (!event.event_date) continue
      const eventStartTime = String(event.start_time || '').slice(0, 5)
      const isTonightTime =
        !eventStartTime || eventStartTime === '00:00' || eventStartTime >= '17:00'
      const isTonight = event.event_date === today && isTonightTime
      const isWeekend = event.event_date >= weekend.start && event.event_date <= weekend.end
      const isNextSevenDays = event.event_date >= nextSevenDays.start && event.event_date <= nextSevenDays.end
      const matchesTiming = !timing ||
        (timing === 'tonight' && isTonight) ||
        (timing === 'weekend' && isWeekend) ||
        (timing === 'next7days' && isNextSevenDays)
      const eventTopic = `${event.event_name || ''} ${event.event_type || ''}`.toLowerCase()
      if (matchesTiming) {
        if (/\bsocials?\b|\bmunch(?:es)?\b|\bmeet(?:up|s)?\b/.test(eventTopic)) socialVenueIds.add(event.venue_id)
        if (/\bnewb(?:ie|ies)\b|\bnewcomers?\b|\bfirst[ -]timers?\b/.test(eventTopic)) newbieVenueIds.add(event.venue_id)
        if (/\bbdsm\b|\bbondage\b/.test(eventTopic)) bdsmVenueIds.add(event.venue_id)
      }
      if (isWeekend) {
        weekendVenueIds.add(event.venue_id)
      }
      const existingNextDate = nextEventDateByVenue.get(event.venue_id)
      if (!existingNextDate || event.event_date < existingNextDate) {
        nextEventDateByVenue.set(event.venue_id, event.event_date)
      }
      if (isTonight) {
        tonightVenueIds.add(event.venue_id)
      }
      if (isNextSevenDays) {
        nextSevenDaysVenueIds.add(event.venue_id)
      }
      }
    })
    if (!data || data.length < pageSize) {
      break
    }
    lastEventId = data[data.length - 1].event_id
  }
  return {
    error: null,
    upcomingEventCountByVenue,
    nextEventDateByVenue,
    tonightVenueIds,
    nextSevenDaysVenueIds,
    weekendVenueIds,
    socialVenueIds,
    newbieVenueIds,
    bdsmVenueIds,
  }
}
function formatCategory(category: string | null | undefined) {
  const cleanedCategory = cleanText(category || '')
  if (!cleanedCategory) return null
  const lowerCategory = cleanedCategory.toLowerCase()
  if (
    lowerCategory === 'lead' ||
    lowerCategory === 'unknown' ||
    lowerCategory === 'uncategorised' ||
    lowerCategory === 'uncategorized'
  ) {
    return null
  }
  return cleanedCategory
}
function getVenueCategoryPillClass(category: string | null) {
  const lower = (category || '').toLowerCase()
  if (lower.includes('sauna')) {
    return 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200 shadow-cyan-500/10'
  }
  if (lower.includes('swing') || lower.includes('club')) {
    return 'border-pink-400/40 bg-pink-500/15 text-pink-200 shadow-pink-500/10'
  }
  if (lower.includes('fetish') || lower.includes('kink') || lower.includes('bdsm')) {
    return 'border-red-400/40 bg-red-500/15 text-red-200 shadow-red-500/10'
  }
  if (lower.includes('social')) {
    return 'border-purple-400/40 bg-purple-500/15 text-purple-200 shadow-purple-500/10'
  }
  return 'border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-blue-500/10'
}
function venueMatchesQuickCategory(
  venue: {
    name?: string | null
    category?: string | null
    venue_id?: string | null
  },
  quickCategory: string,
  eventVenueIds: Set<string>,
  timing: string
) {
  if (!quickCategory) return true
  if (timing && ['socials', 'newbie', 'bdsm'].includes(quickCategory)) {
    return Boolean(venue.venue_id && eventVenueIds.has(venue.venue_id))
  }
  const text = normaliseFilterValue(`${venue.category || ''} ${venue.name || ''}`)
  if (quickCategory === 'clubs') {
    return /\bclub\b|swing|lifestyle/.test(text) && !/sauna|spa/.test(text)
  }
  if (quickCategory === 'saunas') {
    return text.includes('sauna') || text.includes('spa')
  }
  if (quickCategory === 'kink') {
    return text.includes('kink') || text.includes('fetish') || text.includes('bdsm')
  }
  if (quickCategory === 'socials') {
    return text.includes('social') || text.includes('munch') || text.includes('meet') ||
      (!!venue.venue_id && eventVenueIds.has(venue.venue_id))
  }
  if (quickCategory === 'newbie') {
    return text.includes('newbie') || text.includes('newcomer') ||
      (!!venue.venue_id && eventVenueIds.has(venue.venue_id))
  }
  if (quickCategory === 'bdsm') {
    return text.includes('bdsm') || text.includes('bondage') ||
      (!!venue.venue_id && eventVenueIds.has(venue.venue_id))
  }
  return true
}
function quickChipClass(active: boolean) {
  return active
    ? 'border-blue-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
    : 'border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-blue-400/70 hover:bg-blue-500/10 hover:text-blue-100'
}
export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    city?: string
    region?: string
    category?: string
    timing?: string
    sort?: string
    view?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const city = params.city || ''
  const region = params.region || ''
  const category = params.category || ''
  const sort = params.sort === 'popular' ? 'popular' : 'recommended'
  const timing = ['tonight', 'weekend', 'next7days'].includes(params.timing || '') ? params.timing! : ''
  const view = params.view === 'map' ? 'map' : params.view === 'grid' ? 'grid' : 'list'
  const parsedPage = Number(params.page)
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const PAGE_SIZE = 24
  const today = getTodayString()
  const cleanedSearch = search.trim()
  const postcodeSearch = formatPostcodeSearch(cleanedSearch)
  const venueQuery = supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, canonical_city, canonical_region, admin_district, country, location_verified, postcode, latitude, longitude, location_kind, address_visibility, address_verified, website, category, status, image_url, like_count'
    )
    .order('name', { ascending: true })
    .limit(5000)
  const postcodeSearchAttempt = looksLikeUkPostcodeSearch(cleanedSearch)
  const [
    { data: venues, error },
    eventDiscovery,
    postcodeOrigin,
  ] = await Promise.all([
    venueQuery,
    fetchVenueEventDiscovery(today, timing),
    postcodeSearchAttempt ? resolvePostcodeOrigin(cleanedSearch) : Promise.resolve(null),
  ])
  if (error) {
    console.error('Error loading venues:', error.message)
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-6xl rounded-3xl border border-blue-500/20 bg-zinc-900/60 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Venues are temporarily unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Please try again in a moment. Your search has been kept in the address bar.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/venues" className="inline-flex min-h-11 items-center rounded-xl bg-blue-500/15 px-5 text-sm font-semibold text-blue-100">Try again</Link>
            <Link href="/events" className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 px-5 text-sm text-zinc-200">Browse events</Link>
          </div>
        </section>
      </main>
    )
  }
  const {
    error: eventDiscoveryError,
    upcomingEventCountByVenue,
    nextEventDateByVenue,
    tonightVenueIds,
    nextSevenDaysVenueIds,
    weekendVenueIds,
    socialVenueIds,
    newbieVenueIds,
    bdsmVenueIds,
  } = eventDiscovery
  const venueCoordinatesById = (postcodeOrigin || view === 'map')
    ? await resolveVenueCoordinates((venues || []) as any[])
    : new Map<string, { latitude: number; longitude: number }>()
  const distanceMilesByVenue = new Map<string, number>()
  if (postcodeOrigin) {
    for (const venue of venues || []) {
      if (!venue.venue_id) continue
      const coordinates = venueCoordinatesById.get(venue.venue_id)
      if (!coordinates) continue
      distanceMilesByVenue.set(
        venue.venue_id,
        distanceMilesBetween(postcodeOrigin, coordinates)
      )
    }
  }
  const hasFilters = Boolean(search || city || region || category || timing)
  const hasAdvancedFilters = Boolean(city || region || category)
  const allPublicVenues = (venues || []).filter(shouldShowPublicVenue)
  const matchingEventVenues = category === 'socials' ? socialVenueIds
    : category === 'newbie' ? newbieVenueIds
      : category === 'bdsm' ? bdsmVenueIds : new Set<string>()
  const publicVenues = [...(venues || [])].filter((venue) => {
    if (!shouldShowPublicVenue(venue)) return false
    if (
      !venueMatchesFilters(venue, {
        search: postcodeOrigin ? '' : cleanedSearch,
        city,
        region,
        postcodeSearch: postcodeOrigin ? '' : postcodeSearch,
      })
    ) {
      return false
    }
    if (postcodeSearchAttempt) {
      if (!postcodeOrigin) return false
      const distanceMiles = distanceMilesByVenue.get(venue.venue_id)
      if (
        distanceMiles === undefined ||
        distanceMiles > POSTCODE_SEARCH_RADIUS_MILES
      ) {
        return false
      }
    }
    if (!venueMatchesQuickCategory(venue, category, matchingEventVenues, timing)) {
      return false
    }
    if (!eventDiscoveryError && timing === 'tonight' && !tonightVenueIds.has(venue.venue_id)) {
      return false
    }
    if (!eventDiscoveryError && timing === 'weekend' && !weekendVenueIds.has(venue.venue_id)) return false
    if (!eventDiscoveryError && timing === 'next7days' && !nextSevenDaysVenueIds.has(venue.venue_id)) {
      return false
    }
    return true
  })
  const sortedVenues = publicVenues.sort((a, b) => {
    if (sort === 'popular') {
      const likesDifference = (b.like_count || 0) - (a.like_count || 0)
      if (likesDifference !== 0) return likesDifference
    }

    if (postcodeOrigin) {
      const aDistance = distanceMilesByVenue.get(a.venue_id) ?? Number.POSITIVE_INFINITY
      const bDistance = distanceMilesByVenue.get(b.venue_id) ?? Number.POSITIVE_INFINITY
      if (aDistance !== bDistance) {
        return aDistance - bDistance
      }
    }
    const aNextDate = nextEventDateByVenue.get(a.venue_id) || '9999-12-31'
    const bNextDate = nextEventDateByVenue.get(b.venue_id) || '9999-12-31'
    if (aNextDate !== bNextDate) {
      return aNextDate.localeCompare(bNextDate)
    }
    const aEventCount = upcomingEventCountByVenue.get(a.venue_id) || 0
    const bEventCount = upcomingEventCountByVenue.get(b.venue_id) || 0
    if (bEventCount !== aEventCount) {
      return bEventCount - aEventCount
    }
    return cleanText(a.name || '').localeCompare(cleanText(b.name || ''))
  })
  const optionVenues = allPublicVenues
  const totalPages = Math.max(1, Math.ceil(sortedVenues.length / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const visibleVenues = sortedVenues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const cityOptions = uniqueSorted([
    ...FALLBACK_CITIES,
    ...optionVenues.map((venue) => getCanonicalVenueCity(venue)),
  ])
  // Region choices are canonical only; do not expose arbitrary DB region strings.
  const regionOptions = FALLBACK_REGIONS
  const makeFilterHref = (
    updates: Partial<{
      search: string
      city: string
      region: string
      category: string
      timing: string
      sort: string
      view: string
      page: string
    }>
  ) => {
    const next = {
      search,
      city,
      region,
      category,
      timing,
      sort,
      view,
      page: '',
      ...updates,
    }
    const query = new URLSearchParams()
    if (next.search) query.set('search', next.search)
    if (next.city) query.set('city', next.city)
    if (next.region) query.set('region', next.region)
    if (next.category) query.set('category', next.category)
    if (next.timing) query.set('timing', next.timing)
    if (next.sort === 'popular') query.set('sort', 'popular')
    if (next.view === 'list' || next.view === 'map') query.set('view', next.view)
    if (Number(next.page) > 1) query.set('page', next.page)
    const queryString = query.toString()
    return queryString ? `/venues?${queryString}` : '/venues'
  }

  // Only verified public fixed venues receive exact postcode-derived pins.
  // Other active profiles can be shown at city-centre level, never at a
  // guessed street address. Closed listings and unverified leads stay off-map.
  const cityProfiles = view === 'map' ? sortedVenues.filter((venue) =>
    ['event_series', 'multi_location', 'private_location'].includes(venue.location_kind || '') &&
    Boolean(getCanonicalVenueCity(venue))
  ) : []
  const cityNames = [...new Set(cityProfiles.map((venue) => getCanonicalVenueCity(venue)))].slice(0, 70)
  const cityCoordinates = new Map<string, { latitude: number; longitude: number }>()
  if (cityNames.length) {
    // Bound concurrency and cache approximate town-level geocoding.
    for (let i = 0; i < cityNames.length; i += 8) {
      await Promise.all(cityNames.slice(i, i + 8).map(async (cityName) => {
        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json&countryCode=GB`,
            { next: { revalidate: 86400 } }
          )
          if (!response.ok) return
          const data = await response.json()
          const match = (data.results || []).find((item: { name?: string; latitude?: number; longitude?: number }) =>
            normaliseFilterValue(item.name) === normaliseFilterValue(cityName) &&
            finiteCoordinate(item.latitude) !== null && finiteCoordinate(item.longitude) !== null
          )
          if (match) cityCoordinates.set(cityName, { latitude: Number(match.latitude), longitude: Number(match.longitude) })
        } catch (error) { console.error('Town-level map lookup unavailable:', cityName, error) }
      }))
    }
  }
  const mapVenues = sortedVenues.flatMap((venue) => {
    const isFixedPublic = venue.location_kind === 'fixed_venue' &&
      venue.address_visibility === 'public' && venue.address_verified === true
    const town = getCanonicalVenueCity(venue)
    const coordinates = isFixedPublic
      ? venueCoordinatesById.get(venue.venue_id)
      : ['event_series', 'multi_location', 'private_location'].includes(venue.location_kind || '')
        ? cityCoordinates.get(town) : undefined
    if (!coordinates || Math.abs(coordinates.latitude) > 90 || Math.abs(coordinates.longitude) > 180) return []
    return [{
      id: venue.venue_id,
      name: cleanText(venue.name || 'Venue'),
      area: town,
      lat: coordinates.latitude,
      lng: coordinates.longitude,
      approximate: !isFixedPublic,
      href: `/venue/${encodeURIComponent(venue.venue_id)}?from=${encodeURIComponent(makeFilterHref({ page: '' }))}`,
    }]
  }).slice(0, 350)

  const currentHref = makeFilterHref({ page: String(page) })
  const categories = [
    { value: '', label: 'All types' },
    { value: 'clubs', label: 'Clubs' },
    { value: 'saunas', label: 'Saunas & spas' },
    { value: 'kink', label: 'Kink & fetish' },
    { value: 'socials', label: 'Socials & munches' },
    { value: 'newbie', label: 'Newcomer events' },
    { value: 'bdsm', label: 'BDSM' },
  ]
  const timings = [
    { value: '', label: 'Any date' },
    { value: 'tonight', label: 'Tonight' },
    { value: 'weekend', label: 'This weekend' },
    { value: 'next7days', label: 'Next 7 days' },
  ]
  const activeFilters = [
    ...(search ? [{ key: 'search', label: postcodeOrigin ? `Within 30 miles of ${postcodeOrigin.label}` : search }] : []),
    ...(city ? [{ key: 'city', label: city }] : []),
    ...(region ? [{ key: 'region', label: region }] : []),
    ...(category ? [{ key: 'category', label: categories.find((item) => item.value === category)?.label || category }] : []),
    ...(timing ? [{ key: 'timing', label: timings.find((item) => item.value === timing)?.label || timing }] : []),
  ]
  const controlClass = 'min-h-12 w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-base text-white transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-8 pt-6 text-white sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">Scene Finder</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Clubs & venues</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Find your place in the scene.</p>
          </div>
          <Link href="/" aria-label="Scene Finder home" className="shrink-0 rounded-xl">
            <FallbackImage src="/images/scene-finder-logo-transparent.png" fallbackSrc="/images/home-hero.jpg" alt="" className="h-20 w-24 object-contain sm:h-24 sm:w-28" loading="eager" />
          </Link>
        </header>

        <section aria-label="Find a venue" className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-950/25 via-zinc-900/70 to-purple-950/25 p-4 shadow-lg shadow-blue-950/10 sm:p-5">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
          <Form action="/venues" scroll={false}>
            <label htmlFor="venue-search" className="sr-only">Search venues by name, town or postcode</label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300" />
                <input id="venue-search" key={search} name="search" type="search" defaultValue={search} placeholder="Venue, town or postcode" className={`${controlClass} pl-11`} />
              </div>
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:brightness-110 sm:px-6">Search</button>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">Enter a UK postcode to find venues within 30 miles.</p>
            {timing && <input type="hidden" name="timing" value={timing} />}
            {sort === 'popular' && <input type="hidden" name="sort" value="popular" />}
            {view !== 'grid' && <input type="hidden" name="view" value={view} />}

            <div aria-label="Filter by event date" className="mt-4 grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-4 sm:flex sm:gap-2">
              {timings.map((item) => (
                <Link key={item.value} href={makeFilterHref({ timing: item.value })} scroll={false} aria-current={timing === item.value ? 'true' : undefined} className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-2 py-2 text-center text-xs font-semibold leading-4 transition sm:px-4 sm:text-sm ${quickChipClass(timing === item.value)}`}>{item.label}</Link>
              ))}
            </div>

            <details key={`${city}|${region}|${category}`} open={hasAdvancedFilters} className="group mt-3 border-t border-white/10">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-zinc-200 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2"><Icon name="filter" className="h-4 w-4 text-blue-300" />City, region & type{hasAdvancedFilters && <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-200">{[city, region, category].filter(Boolean).length}</span>}</span>
                <Icon name="chevron-down" className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
              </summary>
              <div className="grid gap-4 pb-1 pt-2 sm:grid-cols-3">
                <label htmlFor="venue-city" className="space-y-2 text-xs font-semibold text-zinc-300"><span>City or town</span>
                  <select id="venue-city" name="city" defaultValue={city} className={controlClass}>
                    <option value="">Any city or town</option>
                    {cityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label htmlFor="venue-region" className="space-y-2 text-xs font-semibold text-zinc-300"><span>Region</span>
                  <select id="venue-region" name="region" defaultValue={region} className={controlClass}>
                    <option value="">Any region</option>
                    {regionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label htmlFor="venue-type" className="space-y-2 text-xs font-semibold text-zinc-300"><span>Type or event theme</span>
                  <select id="venue-type" name="category" defaultValue={category} className={controlClass}>
                    {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <div className="flex items-center gap-3 sm:col-span-3">
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-500/15 px-5 text-sm font-bold text-blue-100 transition hover:bg-blue-500/25">Apply filters</button>
                  {hasFilters && <Link href={makeFilterHref({ search: '', city: '', region: '', category: '', timing: '' })} scroll={false} className="inline-flex min-h-11 items-center px-2 text-sm text-zinc-400 hover:text-white">Clear all</Link>}
                </div>
              </div>
            </details>
          </Form>
        </section>

        {hasFilters && (
          <nav aria-label="Active venue filters" className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Link key={filter.key} href={makeFilterHref({ [filter.key]: '' })} scroll={false} aria-label={`Remove ${filter.label} filter`} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-medium text-blue-100 transition hover:border-blue-400/60">
                <span className="truncate">{filter.label}</span><Icon name="close" className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ))}
            <Link href={makeFilterHref({ search: '', city: '', region: '', category: '', timing: '' })} scroll={false} className="inline-flex min-h-11 items-center px-2 text-xs text-zinc-400 underline underline-offset-4 hover:text-white">Clear all</Link>
          </nav>
        )}

        {eventDiscoveryError && <p role="alert" className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">Event dates are temporarily unavailable. You can still browse venues and their official websites. Please try again shortly to use date filters.</p>}

        <section id="results" aria-labelledby="venues-heading" className="mt-7 scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div>
              <h2 id="venues-heading" className="text-xl font-bold tracking-tight">{hasFilters ? 'Your matches' : 'Explore venues'} <span className="ml-1 text-base font-normal text-zinc-400">({sortedVenues.length})</span></h2>
              <p className="mt-1 text-xs text-zinc-400">{sort === 'popular' ? 'Most hearts first' : postcodeOrigin ? 'Nearest venues first' : 'Ordered by the next upcoming event'}</p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-4">
              <nav aria-label="Sort venues" className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
                {[{ value: 'recommended', label: 'Recommended' }, { value: 'popular', label: 'Most popular' }].map((item) => (
                  <Link key={item.value} href={makeFilterHref({ sort: item.value })} scroll={false} aria-current={sort === item.value ? 'true' : undefined} className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${sort === item.value ? item.value === 'popular' ? 'bg-pink-500/15 text-pink-200' : 'bg-blue-500/15 text-blue-200' : 'text-zinc-400 hover:text-white'}`}>
                    {item.value === 'popular' && <Icon name="heart" className="h-4 w-4" />}{item.label}
                  </Link>
                ))}
              </nav>
              <nav aria-label="Venue view" className="flex shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
                <Link href={makeFilterHref({ view: 'grid', page: String(page) })} scroll={false} aria-label="Grid view" aria-current={view === 'grid' ? 'true' : undefined} className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition ${view === 'grid' ? 'bg-blue-500/15 text-blue-200' : 'text-zinc-400 hover:text-white'}`}><Icon name="grid" className="h-4 w-4" /></Link>
                <Link href={makeFilterHref({ view: 'list', page: String(page) })} scroll={false} aria-label="Compact list view" aria-current={view === 'list' ? 'true' : undefined} className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition ${view === 'list' ? 'bg-blue-500/15 text-blue-200' : 'text-zinc-400 hover:text-white'}`}><Icon name="list" className="h-4 w-4" /></Link>
                <Link href={makeFilterHref({ view: 'map', page: '' })} scroll={false} aria-label="Map view" aria-current={view === 'map' ? 'true' : undefined} className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition ${view === 'map' ? 'bg-blue-500/15 text-blue-200' : 'text-zinc-400 hover:text-white'}`}><Icon name="map" className="h-4 w-4" /></Link>
              </nav>
            </div>
          </div>

          {view === 'map' ? (
            <VenueDiscoveryMap venues={mapVenues} totalMatches={sortedVenues.length} />
          ) : visibleVenues.length ? (
            <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
              {visibleVenues.map((venue) => {
                const venueCategory = formatCategory(venue.category)
                const venueName = cleanText(venue.name || 'Venue')
                const venueCity = cleanText(venue.city_area || venue.canonical_city || '')
                const venueRegion = getCanonicalVenueRegion(venue) || cleanText(venue.region || '')
                const location = Array.from(new Set([venueCity, venueRegion].filter(Boolean))).join(' · ') || 'Location to be confirmed'
                const count = upcomingEventCountByVenue.get(venue.venue_id) || 0
                const nextDate = nextEventDateByVenue.get(venue.venue_id)
                const distance = distanceMilesByVenue.get(venue.venue_id)
                const detailHref = `/venue/${encodeURIComponent(venue.venue_id)}?from=${encodeURIComponent(currentHref)}`
                return (
                  <article key={venue.venue_id} className={`group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-purple-950/10 transition hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-950/15 ${view === 'grid' ? 'flex h-full min-w-0 flex-col' : 'flex min-w-0 gap-0'}`}>
                    <Link href={detailHref} tabIndex={-1} aria-hidden="true" className={view === 'grid' ? 'relative block aspect-[16/9] overflow-hidden border-b border-white/5 bg-zinc-950' : 'relative flex w-24 shrink-0 items-center justify-center overflow-hidden border-r border-white/5 bg-zinc-950 sm:w-44'}>
                      <FallbackImage src={venue.image_url} fallbackSrc="/images/venue-placeholder.jpg" alt="" className={view === 'grid' ? 'h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]' : 'max-h-40 w-full object-contain p-2 sm:p-4'} />
                      {tonightVenueIds.has(venue.venue_id) && <span className={`absolute rounded-full border border-blue-400/30 bg-zinc-950/90 px-2.5 py-1 text-[10px] font-bold text-blue-200 ${view === 'grid' ? 'left-3 top-3' : 'bottom-2 left-1/2 -translate-x-1/2'}`}>Tonight</span>}
                    </Link>
                    <div className={`flex min-w-0 flex-1 flex-col ${view === 'grid' ? 'p-4 sm:p-5' : 'p-3 sm:p-5'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {venueCategory && <p title={venueCategory} className="mb-1.5 truncate text-[11px] font-semibold text-purple-300">{venueCategory}</p>}
                          <h3 className={`font-bold leading-snug tracking-tight ${view === 'grid' ? 'text-xl' : 'text-base sm:text-xl'}`}><Link href={detailHref} className="line-clamp-2 break-words rounded transition hover:text-blue-200">{venueName}</Link></h3>
                        </div>
                        <VenueLikeButton venueId={venue.venue_id} venueName={venueName} initialLikeCount={venue.like_count || 0} />
                      </div>
                      <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-zinc-400"><Icon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0">{location}</span></p>
                      {distance !== undefined && <p className="mt-1 text-xs font-medium text-emerald-300">{formatDistanceMiles(distance)} away</p>}
                      <div className={`mt-auto pt-4 ${view === 'list' ? 'sm:flex sm:items-center sm:justify-between sm:gap-4' : ''}`}>
                        <p className="flex items-center gap-2 text-xs text-zinc-300"><Icon name="calendar" className="h-4 w-4 shrink-0 text-cyan-300" />{eventDiscoveryError ? 'Event dates unavailable' : nextDate ? <>Next event <span className="font-semibold text-white">{formatShortDate(nextDate)}</span></> : count > 0 ? 'Event dates to be confirmed' : 'No upcoming events listed'}</p>
                        <div className={`mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3 ${view === 'list' ? 'flex-wrap sm:mt-0 sm:shrink-0 sm:flex-nowrap sm:border-0 sm:pt-0' : ''}`}>
                          <Link href={detailHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 text-xs font-bold text-blue-100 transition hover:border-blue-400/60 hover:bg-blue-500/20">View venue<Icon name="arrow-right" className="h-4 w-4" /></Link>
                          {!eventDiscoveryError && count > 0 && <Link href={`${detailHref}#upcoming-events`} className="inline-flex min-h-11 items-center rounded-lg px-1 text-xs font-semibold text-cyan-300 hover:text-cyan-100">{count} event{count === 1 ? '' : 's'}</Link>}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-10 text-center">
              <Icon name="search" className="mx-auto mb-4 h-8 w-8 text-blue-300" />
              <h3 className="text-lg font-bold">{postcodeSearchAttempt && !postcodeOrigin ? 'We couldn’t find that postcode' : 'No venues match just yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{postcodeSearchAttempt ? postcodeOrigin ? `Try widening your search. We found no public venues within ${POSTCODE_SEARCH_RADIUS_MILES} miles of ${postcodeOrigin.label} with these filters.` : 'Try a full UK postcode or an area such as M40, B1 or SW1.' : 'Try another city, a different date or fewer filters.'}</p>
              <Link href={makeFilterHref({ search: '', city: '', region: '', category: '', timing: '' })} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500/15 px-5 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25">Browse all venues<Icon name="arrow-right" className="h-4 w-4" /></Link>
            </div>
          )}

          {view !== 'map' && totalPages > 1 && (
            <nav aria-label="Venue pages" className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
              <p className="text-xs text-zinc-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedVenues.length)} of {sortedVenues.length} venues</p>
              <div className="flex items-center gap-3">
                {page > 1 ? <Link href={`${makeFilterHref({ page: String(page - 1) })}#results`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-3 text-sm text-zinc-200 hover:border-blue-400"><Icon name="arrow-left" className="h-4 w-4" />Previous</Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-800 px-3 text-sm text-zinc-600"><Icon name="arrow-left" className="h-4 w-4" />Previous</span>}
                <span className="text-xs text-zinc-400">{page} / {totalPages}</span>
                {page < totalPages ? <Link href={`${makeFilterHref({ page: String(page + 1) })}#results`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 text-sm text-blue-100 hover:bg-blue-500/20">Next<Icon name="arrow-right" className="h-4 w-4" /></Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-800 px-3 text-sm text-zinc-600">Next<Icon name="arrow-right" className="h-4 w-4" /></span>}
              </div>
            </nav>
          )}
        </section>
      </div>
    </main>
  )
}
