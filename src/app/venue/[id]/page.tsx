import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: venue, error } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website, notes')
    .eq('venue_id', id)
    .single()

  if (error || !venue) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <p>Venue not found.</p>
        <Link href="/" className="text-blue-400">
          ← Back to venues
        </Link>
      </main>
    )
  }

  const { data: events } = await supabase
    .from('events')
    .select('event_id, event_name, event_date, start_time, event_type, ticket_url, status')
    .eq('venue_id', venue.venue_id)
    .order('event_date')

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-blue-400">
          ← Back to venues
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-4xl font-bold">{venue.name}</h1>

          <p className="mt-3 text-zinc-400">
            {venue.city_area} • {venue.region}
          </p>

          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-lg bg-blue-500 px-4 py-2 font-medium text-white"
            >
              Visit website
            </a>
          )}

          {venue.notes && (
            <p className="mt-6 text-zinc-300">{venue.notes}</p>
          )}
        </div>

        <h2 className="mt-10 text-2xl font-bold">Upcoming events</h2>

        <div className="mt-4 grid gap-4">
          {events && events.length > 0 ? (
            events.map((event) => (
              <article
                key={event.event_id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <h3 className="text-xl font-semibold">{event.event_name}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {event.event_date} {event.start_time ? `• ${event.start_time}` : ''}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
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
            ))
          ) : (
            <p className="text-zinc-400">No events added yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}