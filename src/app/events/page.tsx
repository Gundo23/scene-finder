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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    type?: string
    region?: string
    city?: string
  }>
}) {
  const params = await searchParams

  const search = params.search || ''
  const type = params.type || ''
  const region = params.region || ''
  const city = params.city || ''

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true, nullsFirst: false })

  const { data: venues } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region')

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
        !city || venue?.city_area?.toLowerCase() === city.toLowerCase()

      return searchMatch && typeMatch && regionMatch && cityMatch
    })
    .sort((a, b) => {
      if (a.event_date && !b.event_date) return -1
      if (!a.event_date && b.event_date) return 1
      if (!a.event_date && !b.event_date) return 0

      return (
        new Date(a.event_date).getTime() -
        new Date(b.event_date).getTime()
      )
    })

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-medium text-blue-400">
          ← Back to venues
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Events</h1>

        <p className="mt-4 text-lg text-zinc-300">
          Search by keyword, event type, town/city, venue, or region.
        </p>

        <form className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Keyword
              </label>
              <input
                name="search"
                defaultValue={search}
                placeholder="Curvy, couples, Leeds..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Event type
              </label>
              <select
                name="type"
                defaultValue={type}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Region
              </label>
              <select
                name="region"
                defaultValue={region}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Town / City
              </label>
              <select
                name="city"
                defaultValue={city}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              >
                <option value="">All Towns</option>

                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white"
              >
                Search
              </button>
            </div>
          </div>

          {(search || type || region || city) && (
            <Link
              href="/events"
              className="mt-4 inline-block text-sm text-blue-400"
            >
              Clear filters
            </Link>
          )}
        </form>

        <p className="mt-8 text-zinc-400">
          Showing {filteredEvents?.length || 0} events
        </p>

        <div className="mt-6 grid gap-4">
          {filteredEvents && filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const venue = venueMap.get(event.venue_id)
              const startTime = formatTime(event.start_time)
              const category = getEventCategory(event)

              return (
                <Link key={event.event_id} href={`/events/${event.event_id}`}>
                  <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-blue-500">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.event_name}
                        className="h-56 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <p className="mb-2 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                        {category}
                      </p>

                      <h2 className="text-2xl font-semibold">
                        {event.event_name}
                      </h2>

                      {venue && (
                        <p className="mt-2 text-sm font-medium text-blue-400">
                          {venue.name}
                        </p>
                      )}

                      {venue && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {venue.city_area} • {venue.region}
                        </p>
                      )}

                      <p className="mt-3 text-sm text-zinc-400">
                        {formatDate(event.event_date)}
                        {startTime ? ` • ${startTime}` : ''}
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        {event.event_type} • {event.status}
                      </p>

                      {event.description && (
                        <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                          {event.description}
                        </p>
                      )}

                      <p className="mt-4 text-sm font-medium text-blue-400">
                        View event →
                      </p>
                    </div>
                  </article>
                </Link>
              )
            })
          ) : (
            <p className="text-zinc-400">No events found.</p>
          )}
        </div>
      </section>
    </main>
  )
}