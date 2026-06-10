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

  if (tags.size === 0 && event.event_type) tags.add(cleanText(event.event_type))
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
      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_30%)]" />

        <section className="relative mx-auto max-w-4xl">
          <div className="rounded-3xl border border-blue-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-blue-950/30 ring-1 ring-purple-500/20">
            <p className="text-zinc-300">Event not found.</p>

            <Link
              href="/events"
              className="mt-5 inline-flex items-center rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/20"
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
  const eventDescription = event.description ? cleanText(event.description) : ''
  const venueName = venue?.name ? cleanText(venue.name) : ''
  const venueCity = venue?.city_area ? cleanText(venue.city_area) : ''
  const venueRegion = venue?.region ? cleanText(venue.region) : ''
  const locationText = [venueCity, venueRegion].filter(Boolean).join(' • ')

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-3 pb-28 pt-5 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.13),transparent_30%)]" />

      <section className="relative mx-auto max-w-5xl">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-xl border border-blue-500/30 bg-zinc-950/80 px-4 py-2 text-sm font-semibold text-zinc-200 shadow-lg shadow-blue-950/20 transition hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-200"
          >
            ← Back to Events
          </Link>

          {venue && (
            <Link
              href={`/venue/${venue.venue_id}`}
              className="inline-flex items-center rounded-xl border border-purple-500/30 bg-zinc-950/80 px-4 py-2 text-sm font-semibold text-zinc-200 shadow-lg shadow-purple-950/20 transition hover:border-purple-400 hover:bg-purple-500/10 hover:text-purple-200"
            >
              View Venue
            </Link>
          )}
        </div>

        <article className="mt-6 overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/30 shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20">
          {event.image_url && (
            <div className="relative">
              <img
                src={event.image_url}
                alt={eventName}
                className="h-64 w-full object-cover sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              {eventTags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-blue-400/50 bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-200 shadow-sm shadow-blue-950/40"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-4 max-w-4xl break-words text-4xl font-black tracking-tight text-white sm:text-5xl">
              {eventName}
            </h1>

            {venueName && (
              <p className="mt-3 text-lg font-bold text-blue-300">
                {venueName}
              </p>
            )}

            <div className="mt-7 grid gap-3 rounded-2xl border border-zinc-800/90 bg-black/50 p-4 shadow-inner shadow-black/50 sm:grid-cols-3 sm:p-5">
              <div className="rounded-2xl border border-blue-500/20 bg-zinc-900/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Location
                </p>
                <p className="mt-2 font-semibold text-zinc-100">
                  📍 {locationText || 'Location TBC'}
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-zinc-900/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Date
                </p>
                <p className="mt-2 font-semibold text-zinc-100">
                  🗓️ {formatDate(event.event_date)}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-500/20 bg-zinc-900/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Time
                </p>
                <p className="mt-2 font-semibold text-zinc-100">
                  🕘 {eventTime}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-500/20 bg-black/45 p-4 shadow-lg shadow-blue-950/10 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Event Information
              </p>

              <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                <p>✓ Listed from venue event data</p>
                <p>
                  ✓ Official source available:{' '}
                  {event.source_url || event.ticket_url ? 'Yes' : 'Not listed'}
                </p>
                <p>✓ Venue page available: {venue ? 'Yes' : 'Not listed'}</p>
                <p>🔄 Last Updated: {formatDate(today)}</p>
              </div>
            </div>

            {eventDescription && (
              <div className="mt-6 rounded-2xl border border-purple-500/20 bg-black/45 p-4 shadow-lg shadow-purple-950/10 sm:p-5">
                <h2 className="text-xl font-black text-white">About this event</h2>
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
                  className="inline-flex items-center rounded-xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/40 transition hover:scale-[1.02] hover:from-blue-400 hover:to-purple-500"
                >
                  Open Official Event ↗
                </a>
              )}

              {event.source_url && !event.ticket_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/40 transition hover:scale-[1.02] hover:from-blue-400 hover:to-purple-500"
                >
                  Open Original Source ↗
                </a>
              )}

              {venue && (
                <Link
                  href={`/venue/${venue.venue_id}`}
                  className="inline-flex items-center rounded-xl border border-blue-500/30 bg-zinc-950/80 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  View Venue Page
                </Link>
              )}

              {venue?.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-purple-500/30 bg-zinc-950/80 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-purple-400 hover:bg-purple-500/10 hover:text-purple-200"
                >
                  Venue Website ↗
                </a>
              )}

              {event.source_url && event.ticket_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950/80 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
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