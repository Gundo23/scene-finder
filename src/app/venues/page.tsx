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

  let query = supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, website, category, image_url, like_count'
    )
    .order('name')

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city_area.ilike.%${search}%,region.ilike.%${search}%`
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
    { data: upcomingVenueEvents },
  ] = await Promise.all([
    query,
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('venue_id')
      .or(`event_date.gte.${today},event_date.is.null`),
  ])

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        Error loading venues: {error.message}
      </main>
    )
  }

  const hasFilters = Boolean(search || city || region)

  const upcomingEventCountByVenue = new Map<string, number>()

  upcomingVenueEvents?.forEach((event) => {
    if (!event.venue_id) return

    upcomingEventCountByVenue.set(
      event.venue_id,
      (upcomingEventCountByVenue.get(event.venue_id) || 0) + 1
    )
  })

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-blue-950/35 via-zinc-950 to-zinc-950 p-4 shadow-2xl shadow-blue-950/10 sm:p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
              Scene Finder
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),rgba(24,24,27,0.92)_45%,rgba(9,9,11,1)_100%)] px-5 py-7 text-center sm:px-10 sm:py-9">
            <div className="mx-auto flex max-w-3xl flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                Discover the scene
              </p>

              <div className="mt-5 flex justify-center">
                <FallbackImage
                  src="/images/home-hero.jpg"
                  fallbackSrc="/images/venue-placeholder.jpg"
                  alt="Scene Finder"
                  className="h-36 w-36 object-contain sm:h-44 sm:w-44"
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

        <form className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search Leeds, Blackpool, Quest..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400 sm:w-auto"
            >
              Search
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <select
              name="city"
              defaultValue={city}
              className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-3 text-sm text-white sm:px-3 sm:text-base"
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
              className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-3 text-sm text-white sm:px-3 sm:text-base"
            >
              <option value="">Search by Region</option>
              {REGIONS.map((regionName) => (
                <option key={regionName} value={regionName}>
                  {regionName}
                </option>
              ))}
            </select>

            {hasFilters && (
              <div className="col-span-2">
                <Link
                  href="/venues"
                  className="block rounded-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            {hasFilters ? 'Search results' : 'Featured venues'}
          </h2>

          <p className="shrink-0 text-sm text-zinc-400">
            {venues?.length || 0} found
          </p>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
          {venues && venues.length > 0 ? (
            venues.map((venue) => {
              const category = formatCategory(venue.category)
              const venueName = cleanText(venue.name || 'Venue')
              const venueCity = cleanText(venue.city_area || '')
              const venueRegion = cleanText(venue.region || '')
              const upcomingEventCount = upcomingEventCountByVenue.get(venue.venue_id) || 0

              return (
                <article
                  key={venue.venue_id}
                  className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-blue-500"
                >
                  <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                    <FallbackImage
                      src={venue.image_url}
                      fallbackSrc="/images/venue-placeholder.jpg"
                      alt={venueName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 p-3 sm:p-4">
                    {category && (
                      <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                        <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                          {category}
                        </p>
                      </div>
                    )}

                    <Link href={`/venue/${venue.venue_id}`}>
                      <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug hover:text-blue-400 sm:text-lg">
                        {venueName}
                      </h3>
                    </Link>

                    <p className="mt-2 truncate text-xs text-zinc-400 sm:text-sm">
                      {venueCity || 'UK'}{venueRegion ? ` • ${venueRegion}` : ''}
                    </p>

                    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        Venue Information
                      </p>

                      <div className="mt-2 space-y-1 text-xs text-zinc-300 sm:text-sm">
                        <p>{venue.website ? '✓ Official Website Found' : 'Website Not Listed'}</p>
                        <p>{venueCity || venueRegion ? '✓ Location Confirmed' : 'Location Being Reviewed'}</p>
                        <p>✓ Events Available: {upcomingEventCount}</p>
                      </div>
                    </div>

                    <div className="relative z-50 mt-3 flex w-fit items-center">
                      <VenueLikeButton
                        venueId={venue.venue_id}
                        initialLikeCount={venue.like_count || 0}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4">
                      <Link
                        href={`/venue/${venue.venue_id}`}
                        className="inline-flex items-center justify-center rounded-full border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/20 hover:text-white"
                      >
                        View details
                      </Link>

                      {venue.website && (
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                        >
                          Website
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
