import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import VenueLikeButton from '@/app/components/VenueLikeButton'
import { cleanText } from '@/lib/cleanText'
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
function getTodayString() {
  return new Date().toISOString().split('T')[0]
}
function formatPostcodeSearch(value: string) {
  const compact = value.toUpperCase().replace(/\s+/g, '')
  if (compact.length <= 3) {
    return compact
  }
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
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
async function fetchUpcomingEventCountByVenue(today: string) {
  const upcomingEventCountByVenue = new Map<string, number>()
  const pageSize = 1000
  let from = 0
  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('events')
      .select('venue_id')
      .or(`event_date.gte.${today},event_date.is.null`)
      .range(from, to)
    if (error) {
      console.error('Error loading venue event counts:', error.message)
      break
    }
    data?.forEach((event) => {
      if (!event.venue_id) return
      upcomingEventCountByVenue.set(
        event.venue_id,
        (upcomingEventCountByVenue.get(event.venue_id) || 0) + 1
      )
    })
    if (!data || data.length < pageSize) {
      break
    }
    from += pageSize
  }
  return upcomingEventCountByVenue
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
function shouldShowPublicVenue(venue: {
  name?: string | null
  category?: string | null
  status?: string | null
}) {
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
export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; region?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const city = params.city || ''
  const region = params.region || ''
  const today = getTodayString()
  const cleanedSearch = search.trim()
  const postcodeSearch = formatPostcodeSearch(cleanedSearch)
  const venueQuery = supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, canonical_city, canonical_region, admin_district, country, location_verified, postcode, website, category, status, image_url, like_count'
    )
    .order('name', { ascending: true })
    .limit(5000)
  const [
    { data: venues, error },
    { data: filterOptionVenues, error: filterOptionsError },
    { count: venueCount },
    { count: eventCount },
    upcomingEventCountByVenue,
  ] = await Promise.all([
    venueQuery,
    supabase
      .from('venues')
      .select('venue_id, name, city_area, region, canonical_city, canonical_region, category, status')
      .order('name', { ascending: true })
      .limit(5000),
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    fetchUpcomingEventCountByVenue(today),
  ])
  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        Error loading venues: {error.message}
      </main>
    )
  }
  if (filterOptionsError) {
    console.error('Error loading venue filter options:', filterOptionsError.message)
  }
  const hasFilters = Boolean(search || city || region)
  const publicVenues = [...(venues || [])].filter((venue) => {
    return (
      shouldShowPublicVenue(venue) &&
      venueMatchesFilters(venue, {
        search: cleanedSearch,
        city,
        region,
        postcodeSearch,
      })
    )
  })
  const sortedVenues = publicVenues.sort((a, b) => {
    const aEventCount = upcomingEventCountByVenue.get(a.venue_id) || 0
    const bEventCount = upcomingEventCountByVenue.get(b.venue_id) || 0
    if (bEventCount !== aEventCount) {
      return bEventCount - aEventCount
    }
    return cleanText(a.name || '').localeCompare(cleanText(b.name || ''))
  })
  const optionVenues = [...(filterOptionVenues || [])].filter((venue) => shouldShowPublicVenue(venue))
  const cityOptions = uniqueSorted([
    ...FALLBACK_CITIES,
    ...optionVenues.map((venue) => getCanonicalVenueCity(venue)),
  ])
  // Region choices are canonical only; do not expose arbitrary DB region strings.
  const regionOptions = FALLBACK_REGIONS
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 pb-24 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
              Scene Finder
            </p>
          </div>
          <div className="relative mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60 px-5 py-7 text-center shadow-xl shadow-black/30 sm:px-10 sm:py-9">
            <div className="relative mx-auto flex max-w-3xl flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                Discover the scene
              </p>
              <div className="mt-5 flex justify-center">
                <FallbackImage
                  src="/images/scene-finder-logo-transparent.png"
                  fallbackSrc="/images/home-hero.jpg"
                  alt="Scene Finder"
                  className="h-40 w-40 object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.16)] sm:h-52 sm:w-52"
                />
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                Search clubs, socials, saunas, kink nights and lifestyle events across the UK.
              </p>
              <div className="mt-4 flex flex-nowrap items-center justify-center gap-2">
                <span className="whitespace-nowrap rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-200 sm:px-3 sm:text-sm">
                  {venueCount || 0} Venues
                </span>
                <span className="whitespace-nowrap rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-200 sm:px-3 sm:text-sm">
                  {eventCount || 0} Events
                </span>
                <span className="whitespace-nowrap rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:px-3 sm:text-sm">
                  Updated Daily
                </span>
              </div>
            </div>
          </div>
        </div>
        <form className="mt-5 w-full rounded-3xl border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-3 shadow-xl shadow-blue-950/20 ring-1 ring-purple-500/10 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              name="city"
              defaultValue={city}
              className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-2 py-3 text-sm text-white sm:px-3 sm:text-base"
            >
              <option value="">Search by City</option>
              {cityOptions.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
            <select
              name="region"
              defaultValue={region}
              className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-2 py-3 text-sm text-white sm:px-3 sm:text-base"
            >
              <option value="">Search by Region</option>
              {regionOptions.map((regionName) => (
                <option key={regionName} value={regionName}>
                  {regionName}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search Leeds, Blackpool, Quest..."
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 sm:w-auto"
            >
              Search
            </button>
          </div>
          {hasFilters && (
            <div className="mt-4">
              <Link
                href="/venues"
                className="block rounded-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
              >
                Clear filters
              </Link>
            </div>
          )}
        </form>
        <div className="mt-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold">
            {hasFilters ? 'Search results' : 'Featured venues'}
          </h2>
          <p className="shrink-0 text-sm text-zinc-400">
            {sortedVenues.length} found
          </p>
        </div>
        <div className="mt-5 grid w-full grid-cols-1 gap-5 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
          {sortedVenues.length > 0 ? (
            sortedVenues.map((venue) => {
              const category = formatCategory(venue.category)
              const venueName = cleanText(venue.name || 'Venue')
              const venueCity = cleanText(venue.city_area || '')
              const venueRegion = getCanonicalVenueRegion(venue) || cleanText(venue.region || '')
              const upcomingEventCount = upcomingEventCountByVenue.get(venue.venue_id) || 0
              return (
                <article
                  key={venue.venue_id}
                  className="group relative h-full min-w-0 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-xl shadow-blue-950/25 ring-1 ring-purple-500/10 transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-blue-500/20"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.13),transparent_30%)] opacity-80 transition group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-6 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400/50 to-transparent" />
                  <div className="relative h-32 w-full overflow-hidden bg-zinc-950 sm:h-44">
                    <FallbackImage
                      src={venue.image_url}
                      fallbackSrc="/images/venue-placeholder.jpg"
                      alt={venueName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative min-w-0 p-4 sm:p-5">
                    {category && (
                      <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                        <p className={`max-w-full truncate rounded-full border px-3 py-1 text-[11px] font-bold shadow-lg ${getVenueCategoryPillClass(category)}`}>
                          {category}
                        </p>
                      </div>
                    )}
                    <Link href={`/venue/${venue.venue_id}`}>
                      <h3 className="line-clamp-2 break-words text-xl font-extrabold leading-snug text-white transition group-hover:text-blue-200 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.35)] sm:text-2xl">
                        {venueName}
                      </h3>
                    </Link>
                    <p className="mt-2 truncate text-xs text-zinc-400 sm:text-sm">
                      {venueCity || 'UK'}{venueRegion ? ` • ${venueRegion}` : ''}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-2xl border border-pink-400/20 bg-pink-500/10 p-2">
                        <p className="text-lg">📍</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-pink-200">
                          Area
                        </p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-white">
                          {venueCity || venueRegion || 'UK'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-2">
                        <p className="text-lg">🌐</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                          Website ↗
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-white">
                          {venue.website ? 'Listed' : 'TBC'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-2">
                        <p className="text-lg">📅</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-purple-200">
                          Events
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-white">
                          {upcomingEventCount}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-50 mt-3 flex w-fit items-center">
                      <VenueLikeButton
                        venueId={venue.venue_id}
                        initialLikeCount={venue.like_count || 0}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href={`/venue/${venue.venue_id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-blue-400/70 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-200 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white"
                      >
                        View venue →
                      </Link>
                      {venue.website && (
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-200 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-500/20 hover:text-white"
                        >
                          Website ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <p className="text-zinc-400">No venues found.</p>
          )}
        </div>
      </section>
    </main>
  )
}
