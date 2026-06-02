import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''

  const { data: events } = await supabase
    .from('events')
    .select(`
      event_id,
      event_name,
      event_date,
      start_time,
      event_type,
      ticket_url,
      status,
      venue_id
    `)
    .order('event_date')

  const { data: venues } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region')

  const venueMap = new Map(
    venues?.map((v) => [v.venue_id, v]) || []
  )

  const filteredEvents =
    events?.filter((event) => {
      const venue = venueMap.get(event.venue_id)

      const text = `
        ${event.event_name || ''}
        ${event.event_type || ''}
        ${venue?.name || ''}
        ${venue?.city_area || ''}
        ${venue?.region || ''}
      `.toLowerCase()

      return text.includes(search.toLowerCase())
    }) || []

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm font-medium text-blue-400"
        >
          ← Back to venues
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Events</h1>

        <p className="mt-4 text-zinc-300">
          Search upcoming events across venues.
        </p>

        <form className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <label className="block text-sm font-medium text-zinc-300">
            Search events
          </label>

          <div className="mt-3 flex gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Try social, club night, Leeds..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-6 py-2 font-medium"
            >
              Search
            </button>
          </div>
        </form>

        <p className="mt-8 text-zinc-400">
          Showing {filteredEvents.length} events
        </p>

        <div className="mt-6 grid gap-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const venue = venueMap.get(event.venue_id)

              return (
                <Link
                  key={event.event_id}
                  href={`/events/${event.event_id}`}
                >
                  <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-blue-500">
                    <h2 className="text-xl font-semibold">
                      {event.event_name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                      {event.event_date}
                      {event.start_time
                        ? ` • ${event.start_time}`
                        : ''}
                    </p>

                    {venue && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {venue.name} • {venue.city_area} • {venue.region}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-zinc-500">
                      {event.event_type} • {event.status}
                    </p>

                    <p className="mt-4 text-sm font-medium text-blue-400">
                      View event →
                    </p>
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