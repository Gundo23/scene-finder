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
      image_url,
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

  const startTime = formatTime(event.start_time)
  const endTime = formatTime(event.end_time)

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap gap-4">
          <Link href="/events" className="text-sm text-blue-400">
            ← Back to events
          </Link>

          {venue && (
            <Link href={`/venue/${venue.venue_id}`} className="text-sm text-blue-400">
              ← Back to venue
            </Link>
          )}
        </div>

        <article className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.event_name}
              className="h-80 w-full object-cover"
            />
          )}

          <div className="p-6">
            <p className="text-sm font-medium text-blue-400">
              {event.event_type || 'Event'}
            </p>

            <h1 className="mt-2 text-4xl font-bold">{event.event_name}</h1>

            <div className="mt-6 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-zinc-500">Date</p>
                <p className="mt-1 font-medium text-zinc-100">
                  {formatDate(event.event_date)}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Time</p>
                <p className="mt-1 font-medium text-zinc-100">
                  {startTime
                    ? `${startTime}${endTime ? ` - ${endTime}` : ''}`
                    : 'Time TBC'}
                </p>
              </div>

              {venue && (
                <>
                  <div>
                    <p className="text-sm text-zinc-500">Venue</p>
                    <Link
                      href={`/venue/${venue.venue_id}`}
                      className="mt-1 inline-block font-medium text-blue-400"
                    >
                      {venue.name}
                    </Link>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">Location</p>
                    <p className="mt-1 font-medium text-zinc-100">
                      {venue.city_area} • {venue.region}
                    </p>
                  </div>
                </>
              )}
            </div>

            <p className="mt-4 text-sm text-zinc-500">
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

              {venue?.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 hover:text-white"
                >
                  Venue website
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
          </div>
        </article>
      </section>
    </main>
  )
}