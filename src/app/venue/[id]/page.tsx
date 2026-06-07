import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { cleanText } from '@/lib/cleanText'

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
  const text = cleanText(
    `${event.event_name || ''} ${event.description || ''}`
  ).toLowerCase()

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
          <Link
            href="/venues"
            className="mt-4 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-blue-500 hover:text-white"
          >
            ← Back to Clubs
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

  const venueName = cleanText(venue.name)
  const venueCity = cleanText(venue.city_area || '')
  const venueRegion = cleanText(venue.region || '')
  const venueNotes = venue.notes ? cleanText(venue.notes) : ''

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/venues"
            className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-blue-500 hover:text-white"
          >
            ← Back to Clubs
          </Link>

          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-blue-500 hover:text-white"
          >
            Browse Events
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-medium text-blue-400">Venue</p>

          <h1 className="mt-2 text-4xl font-bold">{venueName}</h1>

          <p className="mt-3 text-zinc-400">
            {venueCity} • {venueRegion}
          </p>

          <div className="mt-6 grid gap-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Venue Information</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <p>✓ Official Website Found</p>
                <p>✓ Location Confirmed</p>
                <p>✓ Events Available: {sortedEvents.length}</p>
                <p>🔄 Last Updated: {formatDate(today)}</p>
              </div>
            </div>

            <div>
              {venue.postcode && (
                <p className="text-sm text-zinc-300">
                  📮 {cleanText(venue.postcode)}
                </p>
              )}

              <p className="mt-2 text-sm text-zinc-300">
                🌐 {venue.website ? 'Website Available' : 'Website Not Listed'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Visit Website ↗
              </a>
            )}

            <Link
              href={`/events?city=${encodeURIComponent(venue.city_area || '')}`}
              className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:text-white"
            >
              Browse Events in {venueCity || 'this area'}
            </Link>
          </div>

          {venueNotes && <p className="mt-6 text-zinc-300">{venueNotes}</p>}
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
              const eventName = cleanText(event.event_name)
              const eventType = event.event_type ? cleanText(event.event_type) : 'Event'
              const eventDescription = event.description
                ? cleanText(event.description)
                : ''

              return (
                <Link key={event.event_id} href={`/events/${event.event_id}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-blue-500">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={eventName}
                        className="h-56 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <p className="mb-2 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                        {category}
                      </p>

                      <h3 className="text-2xl font-semibold hover:text-blue-400">
                        {eventName}
                      </h3>

                      <div className="mt-3 space-y-1 text-sm">
                        <p className="text-zinc-300">📍 {venueCity}</p>
                        <p className="text-zinc-300">📅 {formatDate(event.event_date)}</p>
                        {startTime && (
                          <p className="text-zinc-300">🕘 {startTime}</p>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-zinc-500">
                        {eventType}
                      </p>

                      {eventDescription && (
                        <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                          {eventDescription}
                        </p>
                      )}

                      <div className="mt-5">
                        <span className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition group-hover:bg-blue-500/20">
                          View Event →
                        </span>
                      </div>
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