import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''

  let query = supabase
    .from('events')
    .select(`
      event_id,
      event_name,
      event_date,
      start_time,
      event_type,
      ticket_url,
      status,
      venues (
        venue_id,
        name,
        city_area,
        region
      )
    `)
    .order('event_date')

  if (search) {
    query = query.or(
      `event_name.ilike.%${search}%,event_type.ilike.%${search}%,description.ilike.%${search}%`
    )
  }

  const { data: events, error } = await query

  if (error) {
    return <main className="p-8">Error loading events: {error.message}</main>
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-blue-400">
          ← Back to venues
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Events</h1>
        <p className="mt-3 text-zinc-300">
          Search upcoming events across venues.
        </p>

        <form className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <label className="block text-sm font-medium text-zinc-300">
            Search events
          </label>

          <div className="mt-2 flex gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Try social, club night, Leeds..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-5 py-2 font-medium text-white"
            >
              Search
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Showing {events?.length || 0} events
        </p>

        <div className="mt-6 grid gap-4">
          {events && events.length > 0 ? (
            events.map((event) => {
              const venue = Array.isArray(event.venues)
                ? event.venues[0]
                : event.venues

              return (
                <article
                  key={event.event_id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <h2 className="text-xl font-semibold">{event.event_name}</h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    {event.event_date}
                    {event.start_time ? ` • ${event.start_time}` : ''}
                  </p>

                  {venue && (
                    <p className="mt-2 text-sm text-zinc-400">
                      <Link
                        href={`/venue/${venue.venue_id}`}
                        className="text-blue-400"
                      >
                        {venue.name}
                      </Link>{' '}
                      • {venue.city_area} • {venue.region}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-zinc-500">
                    {event.event_type} • {event.status}
                  </p>

                  {event.ticket_url && (
                    <a
                      href={event.ticket_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-medium text-blue-400"
                    >
                      Event link →
                    </a>
                  )}
                </article>
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