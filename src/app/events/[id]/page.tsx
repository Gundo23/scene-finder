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

function formatEventTime(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) return `${startTime} - ${endTime}`
  if (startTime) return startTime
  return 'Time TBC'
}

function getEventTags(event: any) {
  const text = cleanText(
    `${event.event_name || ''} ${event.description || ''} ${event.event_type || ''}`
  ).toLowerCase()

  const compactText = text.replace(/[^a-z0-9]/g, '')
  const tags = new Set<string>()

  if (
    text.includes('newbie') ||
    text.includes('newcomer') ||
    text.includes('first time') ||
    text.includes('beginner')
  ) {
    tags.add('Newbie Friendly')
  }

  if (text.includes('couple')) tags.add('Couples')

  if (
    text.includes('single men') ||
    text.includes('single man') ||
    text.includes('single male') ||
    text.includes('single guy') ||
    text.includes('single gent')
  ) {
    tags.add('Single Men Welcome')
  }

  if (
    text.includes('single women') ||
    text.includes('single woman') ||
    text.includes('single female') ||
    text.includes('single ladies') ||
    text.includes('single lady')
  ) {
    tags.add('Single Women Welcome')
  }

  if (text.includes('bbw') || text.includes('curvy')) tags.add('Curvy / BBW')
  if (text.includes('interracial') || text.includes('black magic')) tags.add('Interracial')
  if (text.includes('greedy girl')) tags.add('Greedy Girls')
  if (text.includes('bi') || text.includes('bisexual')) tags.add('Bi')
  if (text.includes('hotwife') || text.includes('hot wife')) tags.add('Hotwife')
  if (text.includes('cuckold') || text.includes('cuck')) tags.add('Cuckold')
  if (text.includes('fetish')) tags.add('Fetish')

  if (
    text.includes('kink') ||
    text.includes('bdsm') ||
    compactText.includes('bdsm') ||
    text.includes('bondage') ||
    text.includes('domination') ||
    text.includes('dominance') ||
    text.includes('submission') ||
    text.includes('submissive') ||
    text.includes('dom/sub') ||
    text.includes('dom sub') ||
    text.includes('d/s')
  ) {
    tags.add('Kink')
  }

  if (
    text.includes('bdsm') ||
    compactText.includes('bdsm') ||
    text.includes('bondage') ||
    text.includes('discipline') ||
    text.includes('dominance') ||
    text.includes('domination') ||
    text.includes('submission') ||
    text.includes('submissive')
  ) {
    tags.add('BDSM')
  }

  if (text.includes('social')) tags.add('Social')
  if (text.includes('munch')) tags.add('Munch')
  if (text.includes('party')) tags.add('Party')
  if (text.includes('club night')) tags.add('Club Night')
  if (text.includes('play party')) tags.add('Play Party')
  if (text.includes('sauna')) tags.add('Sauna')
  if (text.includes('workshop')) tags.add('Workshop')
  if (text.includes('weekender') || text.includes('weekend')) tags.add('Weekender')
  if (text.includes('festival') || text.includes('fest')) tags.add('Festival')

  if (tags.size === 0 && event.event_type) {
    tags.add(cleanText(event.event_type))
  }

  if (tags.size === 0) tags.add('Event')

  return [...tags]
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const today = getTodayString()

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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-300">Event not found.</p>

            <Link
              href="/events"
              className="mt-5 inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
            >
              ← Back to Events
            </Link>
          </div>
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
  const eventTime = formatEventTime(startTime, endTime)
  const eventTags = getEventTags(event)

  const eventName = cleanText(event.event_name || 'Untitled event')
  const eventType = cleanText(event.event_type || 'Event')
  const eventDescription = event.description ? cleanText(event.description) : ''
  const venueName = venue?.name ? cleanText(venue.name) : ''
  const venueCity = venue?.city_area ? cleanText(venue.city_area) : ''
  const venueRegion = venue?.region ? cleanText(venue.region) : ''
  const locationText = [venueCity, venueRegion].filter(Boolean).join(' • ')

  return (
    <main className="min-h-screen bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
          >
            ← Back to Events
          </Link>

          {venue && (
            <Link
              href={`/venue/${venue.venue_id}`}
              className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
            >
              View Venue
            </Link>
          )}
        </div>

        <article className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {event.image_url && (
            <img
              src={event.image_url}
              alt={eventName}
              className="h-64 w-full object-cover sm:h-80"
            />
          )}

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {eventTags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-4 break-words text-3xl font-bold tracking-tight sm:text-5xl">
              {eventName}
            </h1>

            {venueName && (
              <p className="mt-3 text-base font-medium text-blue-300 sm:text-lg">
                {venueName}
              </p>
            )}

            <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-3 sm:p-5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Location</p>
                <p className="mt-2 font-medium text-zinc-100">
                  📍 {locationText || 'Location TBC'}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Date</p>
                <p className="mt-2 font-medium text-zinc-100">
                  📅 {formatDate(event.event_date)}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Time</p>
                <p className="mt-2 font-medium text-zinc-100">
                  🕘 {eventTime}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Event Information
              </p>

              <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                <p>✓ Listed from venue event data</p>
                <p>✓ Official source available: {event.source_url || event.ticket_url ? 'Yes' : 'Not listed'}</p>
                <p>✓ Venue page available: {venue ? 'Yes' : 'Not listed'}</p>
                <p>🔄 Last Updated: {formatDate(today)}</p>
              </div>
            </div>

            {eventDescription && (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                <h2 className="text-xl font-bold">About this event</h2>
                <p className="mt-4 whitespace-pre-line break-words leading-7 text-zinc-300">
                  {eventDescription}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Open Official Event ↗
                </a>
              )}

              {event.source_url && !event.ticket_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Open Original Source ↗
                </a>
              )}

              {venue && (
                <Link
                  href={`/venue/${venue.venue_id}`}
                  className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  View Venue Page
                </Link>
              )}

              {venue?.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  Venue Website ↗
                </a>
              )}

              {event.source_url && event.ticket_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  Original Source ↗
                </a>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-zinc-500">
              Scene Finder is an independent directory. Always check the official venue or event source before travelling, booking, or attending.
            </p>
          </div>
        </article>
      </section>
    </main>
  )
}
