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
    `${event.event_name || ''} ${event.description || ''} ${event.event_type || ''}`
  ).toLowerCase()

  if (text.includes('newbie') || text.includes('first time')) return 'Newbie Friendly'
  if (text.includes('bbw') || text.includes('curvy')) return 'Curvy / BBW'
  if (text.includes('interracial') || text.includes('black magic')) return 'Interracial'
  if (text.includes('greedy girl')) return 'Greedy Girls'
  if (text.includes('single men') || text.includes('single male') || text.includes('single guy')) return 'Single Men Welcome'
  if (text.includes('single women') || text.includes('single ladies') || text.includes('single female')) return 'Single Women Welcome'
  if (text.includes('couple')) return 'Couples'
  if (text.includes('bi') || text.includes('bisexual')) return 'Bi'
  if (text.includes('fetish')) return 'Fetish'
  if (text.includes('kink') || text.includes('bdsm') || text.includes('bondage')) return 'Kink / BDSM'
  if (text.includes('social') || text.includes('munch')) return 'Social'
  if (text.includes('sauna')) return 'Sauna'
  if (text.includes('party')) return 'Party'

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
  const venuePostcode = cleanText(venue.postcode || '')
  const venueNotes = venue.notes ? cleanText(venue.notes) : ''
  const hasWebsite = Boolean(venue.website)
  const hasLocation = Boolean(venueCity || venueRegion || venuePostcode)
  const hasEvents = sortedEvents.length > 0

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 sm:py-10">
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-blue-400">Venue</p>

            <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
              {venueName}
            </h1>

            {(venueCity || venueRegion) && (
              <p className="mt-3 text-zinc-400">
                {[venueCity, venueRegion].filter(Boolean).join(' • ')}
              </p>
            )}

            <div className="mt-6 grid gap-4 rounded-2xl border border-zinc-700 bg-zinc-950 p-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Venue Information
                </p>

                <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                  <p>
                    {hasWebsite ? '✓ Official Website Found' : 'Website not listed yet'}
                  </p>
                  <p>
                    {hasEvents
                      ? `✓ Events Available: ${sortedEvents.length}`
                      : 'Events not currently listed'}
                  </p>
                  <p>{hasLocation ? '✓ Location Confirmed' : 'Location being reviewed'}</p>
                  <p>🔄 Last Updated: {formatDate(today)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Quick Facts
                </p>

                <div className="mt-3 space-y-2 text-sm text-zinc-300">
                  {venuePostcode && <p>📮 {venuePostcode}</p>}
                  <p>🌐 {hasWebsite ? 'Website Available' : 'Website Not Listed'}</p>
                  <p>📅 {sortedEvents.length} Upcoming Event{sortedEvents.length === 1 ? '' : 's'}</p>
                </div>
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
                  Visit Official Website ↗
                </a>
              )}

              <Link
                href={`/events?city=${encodeURIComponent(venue.city_area || '')}`}
                className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:text-white"
              >
                Browse Events in {venueCity || 'this area'}
              </Link>
            </div>

            {venueNotes && (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  About this venue
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
                  {venueNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Upcoming events</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {sortedEvents.length} upcoming event{sortedEvents.length === 1 ? '' : 's'} listed for this venue
            </p>
          </div>

          <Link
            href={`/events?city=${encodeURIComponent(venue.city_area || '')}`}
            className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:text-white"
          >
            Search nearby events
          </Link>
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
                        className="h-48 w-full object-cover sm:h-56"
                      />
                    )}

                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <p className="inline-flex rounded-full border border-blue-900 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-200">
                          🏷 {category}
                        </p>

                        {eventType && eventType !== 'Event' && (
                          <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                            {eventType}
                          </p>
                        )}
                      </div>

                      <h3 className="break-words text-xl font-semibold group-hover:text-blue-400 sm:text-2xl">
                        {eventName}
                      </h3>

                      <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
                        <p>📍 {venueCity || venueRegion || 'Location TBC'}</p>
                        <p>📅 {formatDate(event.event_date)}</p>
                        <p>🕘 {startTime || 'Time TBC'}</p>
                      </div>

                      {eventDescription && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                          {eventDescription}
                        </p>
                      )}

                      <div className="mt-5">
                        <span className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition group-hover:bg-blue-500 group-hover:text-white">
                          View Event Details →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-300">No upcoming events listed for this venue.</p>
              <p className="mt-2 text-sm text-zinc-500">
                Check the venue website for the latest announcements or browse other events nearby.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
