import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import VenueLikeButton from '@/app/components/VenueLikeButton'
import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const REGIONS = [
  'North East',
  'North West',
  'Yorkshire and the Humber',
  'East Midlands',
  'West Midlands',
  'East of England',
  'London',
  'South East',
]

const CITIES = [
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

  let query = supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, postcode, website, category, image_url, like_count'
    )

  if (cleanedSearch) {
    query = query.or(
      [
        `name.ilike.%${cleanedSearch}%`,
        `city_area.ilike.%${cleanedSearch}%`,
        `region.ilike.%${cleanedSearch}%`,
        `postcode.ilike.%${cleanedSearch}%`,
        `postcode.ilike.%${postcodeSearch}%`,
      ].join(',')
    )
  }

  if (city) {
    query = query.ilike('city_area', `%${city}%`)
  }

  if (region) {
    query = query.ilike('region', `%${region}%`)
  }

  const [
    { data: venues, error },
    { count: venueCount },
    { count: eventCount },
    upcomingEventCountByVenue,
  ] = await Promise.all([
    query,
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

  const hasFilters = Boolean(search || city || region)

  const sortedVenues = [...(venues || [])].sort((a, b) => {
    const aEventCount = upcomingEventCountByVenue.get(a.venue_id) || 0
    const bEventCount = upcomingEventCountByVenue.get(b.venue_id) || 0

    if (bEventCount !== aEventCount) {
      return bEventCount - aEventCount
    }

    return cleanText(a.name || '').localeCompare(cleanText(b.name || ''))
  })

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
              {CITIES.map((cityName) => (
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
              {REGIONS.map((regionName) => (
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
              const venueRegion = cleanText(venue.region || '')
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
