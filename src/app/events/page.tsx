import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function formatDate(date: string | null) {
  if (!date) return 'Date TBC'

  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(time: string | null) {
  if (!time) return null
  return time.slice(0, 5)
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getEventCategory(event: any) {
  const text = `${event.event_name || ''} ${event.description || ''}`.toLowerCase()

  if (text.includes('newbie')) return 'Newbie'
  if (text.includes('bbw') || text.includes('curvy')) return 'Curvy / BBW'
  if (text.includes('interracial') || text.includes('black magic')) return 'Interracial'
  if (text.includes('greedy girl')) return 'Greedy Girls'
  if (text.includes('couple')) return 'Couples'
  if (text.includes('bi')) return 'Bi'
  if (text.includes('fetish')) return 'Fetish'
  if (text.includes('kink')) return 'Kink'
  if (text.includes('social')) return 'Social'
  if (text.includes('sauna')) return 'Sauna'

  return 'General'
}

function distanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const radius = 3958.8
  const toRadians = (value: number) => (value * Math.PI) / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return radius * c
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    type?: string
    region?: string
    city?: string
    distance?: string
  }>
}) {
  const params = await searchParams

  const search = params.search || ''
  const type = params.type || ''
  const region = params.region || ''
  const city = params.city || ''
  const distance = params.distance || ''
  const today = getTodayString()

  const selectedDistance = distance ? Number(distance) : null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .or(`event_date.gte.${today},event_date.is.null`)
    .order('event_date', { ascending: true, nullsFirst: false })
    .limit(1000)

  const { data: venues } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, latitude, longitude')

  const venueMap = new Map(
    venues?.map((venue) => [venue.venue_id, venue]) || []
  )

  const cities = [
    ...new Set(
      venues
        ?.map((venue) => venue.city_area)
        .filter(Boolean)
        .sort()
    ),
  ]

  const selectedCityVenues =
    city && venues
      ? venues.filter(
          (venue) =>
            venue.city_area?.toLowerCase() === city.toLowerCase() &&
            venue.latitude &&
            venue.longitude
        )
      : []

  const cityCentre =
    selectedCityVenues.length > 0
      ? {
          latitude:
            selectedCityVenues.reduce(
              (sum, venue) => sum + Number(venue.latitude),
              0
            ) / selectedCityVenues.length,
          longitude:
            selectedCityVenues.reduce(
              (sum, venue) => sum + Number(venue.longitude),
              0
            ) / selectedCityVenues.length,
        }
      : null

  const filteredEvents = events
    ?.filter((event) => {
      const venue = venueMap.get(event.venue_id)
      const searchTerm = search.toLowerCase()
      const category = getEventCategory(event)

      const searchMatch =
        !search ||
        event.event_name?.toLowerCase().includes(searchTerm) ||
        event.event_type?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.ticket_url?.toLowerCase().includes(searchTerm) ||
        event.source_url?.toLowerCase().includes(searchTerm) ||
        venue?.name?.toLowerCase().includes(searchTerm) ||
        venue?.city_area?.toLowerCase().includes(searchTerm) ||
        venue?.region?.toLowerCase().includes(searchTerm)

      const typeMatch =
        !type || category.toLowerCase() === type.toLowerCase()

      const regionMatch =
        !region || venue?.region?.toLowerCase() === region.toLowerCase()

      const cityMatch =
        !city ||
        !selectedDistance ||
        venue?.city_area?.toLowerCase() === city.toLowerCase()

      const distanceMatch =
        !city ||
        !selectedDistance ||
        !cityCentre ||
        (venue?.latitude &&
          venue?.longitude &&
          distanceInMiles(
            cityCentre.latitude,
            cityCentre.longitude,
            Number(venue.latitude),
            Number(venue.longitude)
          ) <= selectedDistance)

      return searchMatch && typeMatch && regionMatch && cityMatch && distanceMatch
    })
    .sort((a, b) => {
      if (a.event_date && !b.event_date) return -1
      if (!a.event_date && b.event_date) return 1
      if (!a.event_date && !b.event_date) return 0

      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    })

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <Link href="/" className="text-sm font-medium text-blue-400">
          ← Back to venues
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Upcoming Events
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-lg">
            Search by keyword, event type, town/city, distance, venue, or region.
          </p>
        </div>

        <form className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Keyword
              </label>
              <input
                name="search"
                defaultValue={search}
                placeholder="Curvy, couples, Leeds..."
                className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Event type
              </label>
              <select
                name="type"
                defaultValue={type}
                className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Types</option>
                <option value="Newbie">Newbie</option>
                <option value="Couples">Couples</option>
                <option value="Curvy / BBW">Curvy / BBW</option>
                <option value="Interracial">Interracial</option>
                <option value="Greedy Girls">Greedy Girls</option>
                <option value="Bi">Bi</option>
                <option value="Fetish">Fetish</option>
                <option value="Kink">Kink</option>
                <option value="Social">Social</option>
                <option value="Sauna">Sauna</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Region
              </label>
              <select
                name="region"
                defaultValue={region}
                className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Regions</option>
                <option value="North West">North West</option>
                <option value="North East">North East</option>
                <option value="Yorkshire">Yorkshire</option>
                <option value="Midlands">Midlands</option>
                <option value="South East">South East</option>
                <option value="South West">South West</option>
                <option value="London">London</option>
                <option value="Wales">Wales</option>
                <option value="Scotland">Scotland</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Town / City
              </label>
              <select
                name="city"
                defaultValue={city}
                className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Towns</option>

                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Distance
              </label>
              <select
                name="distance"
                defaultValue={distance}
                className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
              </select>
            </div>

            <div className="flex min-w-0 items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white"
              >
                Search
              </button>
            </div>
          </div>

          {(search || type || region || city || distance) && (
            <Link
              href="/events"
              className="mt-4 inline-block text-sm text-blue-400"
            >
              Clear filters
            </Link>
          )}

          {city && selectedDistance && !cityCentre && (
            <p className="mt-4 text-sm text-amber-300">
              Distance search is not available for this town yet because no
              venue coordinates have been found there.
            </p>
          )}

          {city && selectedDistance && cityCentre && (
            <p className="mt-4 text-sm text-zinc-400">
              Distance results only include venues with known coordinates.
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Showing {filteredEvents?.length || 0} upcoming events
        </p>

        <div className="mt-4 grid w-full grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents && filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const venue = venueMap.get(event.venue_id)
              const startTime = formatTime(event.start_time)
              const category = getEventCategory(event)

              const milesAway =
                cityCentre && selectedDistance && venue?.latitude && venue?.longitude
                  ? distanceInMiles(
                      cityCentre.latitude,
                      cityCentre.longitude,
                      Number(venue.latitude),
                      Number(venue.longitude)
                    )
                  : null

              return (
                <Link
                  key={event.event_id}
                  href={`/events/${event.event_id}`}
                  className="block min-w-0"
                >
                  <article className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 hover:border-blue-500">
                    <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                      <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
  <img
    src={event.image_url || '/images/venue-placeholder.jpg'}
    alt={event.event_name}
    className="h-full w-full object-cover"
  />
</div>

                    </div>

                    <div className="min-w-0 p-3 sm:p-4">
                      <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                        <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                          {category}
                        </p>

                        {milesAway !== null && (
                          <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                            {milesAway.toFixed(1)} miles away
                          </p>
                        )}
                      </div>

                      <h2 className="line-clamp-2 break-words text-base font-semibold leading-snug sm:text-lg">
                        {event.event_name}
                      </h2>

                      {venue && (
                        <p className="mt-2 truncate text-sm font-medium text-blue-400">
                          {venue.name}
                        </p>
                      )}

                      {venue && (
                        <p className="mt-1 truncate text-xs text-zinc-400 sm:text-sm">
                          {venue.city_area} • {venue.region}
                        </p>
                      )}

                      <p className="mt-2 break-words text-xs font-medium text-zinc-300 sm:text-sm">
                        {formatDate(event.event_date)}
                        {startTime ? ` • ${startTime}` : ''}
                      </p>

                      {event.description && (
                        <p className="mt-2 line-clamp-2 break-words text-xs text-zinc-400 sm:text-sm">
                          {event.description}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-medium text-blue-400">
                        View event →
                      </p>
                    </div>
                  </article>
                </Link>
              )
            })
          ) : (
            <p className="text-zinc-400">No upcoming events found.</p>
          )}
        </div>
      </section>
    </main>
  )
}