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

export default async function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const today = getTodayString()

  const { data: venue, error } = await supabase
    .from('venues')
    .select(
      'venue_id, name, city_area, region, website, notes, postcode, latitude, longitude'
    )
    .eq('venue_id', id)
    .single()

  if (error || !venue) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <section className="mx-auto max-w-5xl">
          <p>Venue not found.</p>
          <Link href="/" className="mt-4 inline-block text-blue-400">
            ← Back to venues
          </Link>
        </section>
      </main>
    )
  }

  const { data: events } = await supabase
    .from('events')
    .select(
      'event_id, event_name, event_date, start_time, event_type, description, ticket_url, status, image_url'
    )
    .eq('venue_id', venue.venue_id)
    .or(`event_date.gte.${today},event_date.is.null`)
    .order('event_date', { ascending: true, nullsFirst: false })

  const sortedEvents = events || []

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="text-sm text-blue-400">
            ← Back to venues
          </Link>

          <Link href="/events" className="text-sm text-blue-400">
            Browse all events
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-medium text-blue-400">Venue</p>

          <h1 className="mt-2 text-4xl font-bold">{venue.name}</h1>

          <p className="mt-3 text-zinc-400">
            {venue.city_area} • {venue.region}
          </p>

          {venue.postcode && (
            <p className="mt-2 text-sm text-zinc-500">
              Postcode: {venue.postcode}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white"
              >
                Visit website
              </a>
            )}

            <Link
              href={`/events?city=${encodeURIComponent(venue.city_area || '')}`}
              className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 hover:text-white"
            >
              More events in {venue.city_area}
            </Link>
          </div>

          {venue.notes && <p className="mt-6 text-zinc-300">{venue.notes}</p>}
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Upcoming events</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {sortedEvents.length} upcoming events listed for this venue
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
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

                      <h3 className="text-2xl font-semibold hover:text-blue-400">
                        {event.event_name}
                      </h3>

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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-400">
                No upcoming events listed for this venue.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}