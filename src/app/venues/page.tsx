import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import VenueLikeButton from '@/app/components/VenueLikeButton'

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

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; region?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const city = params.city || ''
  const region = params.region || ''

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
  ] = await Promise.all([
    query,
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
  ])

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        Error loading venues: {error.message}
      </main>
    )
  }

  const hasFilters = Boolean(search || city || region)

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
                  className="block rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  Clear Filters
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
            venues.map((venue) => (
              <article
                key={venue.venue_id}
                className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-blue-500"
              >
                <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                  <FallbackImage
                    src={venue.image_url}
                    fallbackSrc="/images/venue-placeholder.jpg"
                    alt={venue.name || 'Venue'}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 p-3 sm:p-4">
                  {venue.category && (
                    <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                      <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                        {venue.category}
                      </p>
                    </div>
                  )}

                  <Link href={`/venue/${venue.venue_id}`}>
                    <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug hover:text-blue-400 sm:text-lg">
                      {venue.name}
                    </h3>
                  </Link>

                  <p className="mt-2 truncate text-xs text-zinc-400 sm:text-sm">
                    {venue.city_area} • {venue.region}
                  </p>

                  <div className="relative z-50 mt-3 flex w-fit items-center">
                    <VenueLikeButton
                      venueId={venue.venue_id}
                      initialLikeCount={venue.like_count || 0}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4">
                    <Link
                      href={`/venue/${venue.venue_id}`}
                      className="text-sm font-medium text-blue-400"
                    >
                      View details →
                    </Link>

                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-zinc-400 hover:text-white"
                      >
                        Website ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-zinc-400">No venues found.</p>
          )}
        </div>
      </section>
    </main>
  )
}
