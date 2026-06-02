import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      event_id,
      venue_id,
      event_name,
      event_date,
      start_time,
      end_time,
      event_type,
      description,
      ticket_url,
      source_url,
      status
    `)
    .eq('event_id', id)
    .single()

  if (error || !event) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <section className="mx-auto max-w-4xl">
          <p>Event not found.</p>
          <Link href="/events" className="mt-4 inline-block text-blue-400">
            ← Back to events
          </Link>
        </section>
      </main>
    )
  }

  const { data: venue } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website')
    .eq('venue_id', event.venue_id)
    .single()

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/events" className="text-sm text-blue-400">
          ← Back to events
        </Link>

        <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-medium text-blue-400">
            {event.event_type || 'Event'}
          </p>

          <h1 className="mt-2 text-4xl font-bold">{event.event_name}</h1>

          <p className="mt-4 text-zinc-300">
            {event.event_date}
            {event.start_time ? ` • ${event.start_time}` : ''}
            {event.end_time ? ` - ${event.end_time}` : ''}
          </p>

          {venue && (
            <p className="mt-4 text-zinc-400">
              Venue:{' '}
              <Link
                href={`/venue/${venue.venue_id}`}
                className="text-blue-400"
              >
                {venue.name}
              </Link>{' '}
              • {venue.city_area} • {venue.region}
            </p>
          )}

          <p className="mt-3 text-sm text-zinc-500">
            Status: {event.status || 'unknown'}
          </p>

          {event.description && (
            <p className="mt-6 whitespace-pre-line text-zinc-300">
              {event.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white"
              >
                Open event link
              </a>
            )}

            {event.source_url && (
              <a
                href={event.source_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 hover:text-white"
              >
                Source
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}