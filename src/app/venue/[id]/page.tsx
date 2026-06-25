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

function getEventDateBadge(date: string | null) {
  if (!date) {
    return {
      day: 'TBC',
      month: 'DATE',
      weekday: '',
    }
  }

  const eventDate = new Date(`${date}T00:00:00`)

  return {
    day: eventDate.toLocaleDateString('en-GB', { day: 'numeric' }),
    month: eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    weekday: eventDate.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(),
  }
}

function formatTime(time: string | null) {
  if (!time) return null

  const normalizedTime = time.trim()
  const displayTime = normalizedTime.slice(0, 5)

  // Many scrapers/database rows use 00:00:00 as a placeholder when no
  // real start time was confirmed. Do not show fake midnight times on cards.
  if (displayTime === '00:00') return null

  return displayTime
}

function decodeHtmlEntities(value: string) {
  const entities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }

  return value.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith('#x')) {
      const codePoint = Number.parseInt(entity.slice(2), 16)

      try {
        return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
      } catch {
        return match
      }
    }

    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10)

      try {
        return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
      } catch {
        return match
      }
    }

    return entities[entity.toLowerCase()] || match
  })
}

function cleanDisplayText(value: string | null | undefined) {
  if (!value) return ''

  let text = String(value)

  // Decode twice so encoded tags like &lt;p&gt; become real tags before stripping.
  text = decodeHtmlEntities(decodeHtmlEntities(text))

  return cleanText(text)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\\[rnt]/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getEventCategory(event: any) {
  const text = cleanDisplayText(
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

function getCategoryPillClass(category: string) {
  const lower = category.toLowerCase()

  if (lower.includes('club')) {
    return 'border-purple-400/40 bg-purple-500/15 text-purple-200 shadow-purple-500/10'
  }

  if (lower.includes('social') || lower.includes('greedy') || lower.includes('single')) {
    return 'border-pink-400/40 bg-pink-500/15 text-pink-200 shadow-pink-500/10'
  }

  if (lower.includes('sauna')) {
    return 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200 shadow-cyan-500/10'
  }

  if (lower.includes('fetish') || lower.includes('kink') || lower.includes('bdsm')) {
    return 'border-red-400/40 bg-red-500/15 text-red-200 shadow-red-500/10'
  }

  if (lower.includes('party')) {
    return 'border-amber-400/40 bg-amber-500/15 text-amber-200 shadow-amber-500/10'
  }

  return 'border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-blue-500/10'
}

function cleanVenueNotes(notes: string | null | undefined) {
  if (!notes) return ''

  return cleanDisplayText(notes)
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const lower = part.toLowerCase()

      if (lower.includes('confidence:')) return false
      if (lower.startsWith('confidence')) return false
      if (lower.includes('waze listing')) return false
      if (lower.includes('companies house result')) return false
      if (lower.includes('source:')) return false
      if (lower.includes('lead source')) return false
      if (lower.includes('scrape')) return false

      return true
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
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
    .eq('is_published', true)
    .or(`event_date.gte.${today},event_date.is.null`)
    .order('event_date', { ascending: true, nullsFirst: false })

  const sortedEvents = events || []

  const venueName = cleanDisplayText(venue.name)
  const venueCity = cleanDisplayText(venue.city_area || '')
  const venueRegion = cleanDisplayText(venue.region || '')
  const venuePostcode = cleanDisplayText(venue.postcode || '')
  const venueNotes = cleanVenueNotes(venue.notes)
  const hasWebsite = Boolean(venue.website)
  const hasLocation = Boolean(venueCity || venueRegion || venuePostcode)
  const hasEvents = sortedEvents.length > 0

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent" />

          <div className="relative p-4 sm:p-7">
            <h1 className="break-words text-3xl font-bold sm:text-4xl">
              {venueName}
            </h1>

            {(venueCity || venueRegion) && (
              <p className="mt-3 text-zinc-400">
                {[venueCity, venueRegion].filter(Boolean).join(' • ')}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Link
                href={`/venues?city=${encodeURIComponent(venue.city_area || '')}`}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/75 p-3 shadow-lg sm:p-4 shadow-black/30 transition hover:-translate-y-1 hover:border-pink-500/70 hover:bg-zinc-900"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 rounded-full border border-pink-400/30 bg-pink-500/15 text-xl shadow-lg sm:text-2xl shadow-pink-500/10">
                      📍
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wide sm:mt-4 sm:text-xs text-pink-300">
                      Clubs nearby
                    </p>
                    <p className="mt-1 text-sm font-bold text-white sm:text-base">
                      {[venueCity, venueRegion].filter(Boolean).join(', ') || 'UK'}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 sm:mt-2 sm:text-xs sm:leading-5">
                      Explore clubs in this area
                    </p>
                  </div>
                  <span className="mt-1 text-xl text-zinc-500 sm:mt-2 sm:text-2xl transition group-hover:translate-x-1 group-hover:text-pink-300">
                    ›
                  </span>
                </div>
              </Link>

              {venue.website ? (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/75 p-3 shadow-lg sm:p-4 shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400/70 hover:bg-zinc-900"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 rounded-full border border-cyan-400/30 bg-cyan-500/15 text-xl shadow-lg sm:text-2xl shadow-cyan-500/10">
                        🌐
                      </div>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide sm:mt-4 sm:text-xs text-cyan-300">
                        Official website
                      </p>
                      <p className="mt-1 text-sm font-bold text-white sm:text-base">
                        Visit Website
                      </p>
                      <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 sm:mt-2 sm:text-xs sm:leading-5">
                        Open the venue's official site
                      </p>
                    </div>
                    <span className="mt-1 text-xl text-zinc-500 sm:mt-2 sm:text-2xl transition group-hover:translate-x-1 group-hover:text-cyan-300">
                      ›
                    </span>
                  </div>
                </a>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 shadow-lg sm:p-4 shadow-black/30">
                  <div className="inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 rounded-full border border-zinc-700 bg-zinc-900 text-2xl">
                    🌐
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide sm:mt-4 sm:text-xs text-zinc-500">
                    Official website
                  </p>
                  <p className="mt-1 text-sm font-bold text-white sm:text-base">
                    Not Listed Yet
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-zinc-500 sm:mt-2 sm:text-xs sm:leading-5">
                    Website details are being checked
                  </p>
                </div>
              )}

              <Link
                href={`/venue/${venue.venue_id}`}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/75 p-3 shadow-lg sm:p-4 shadow-black/30 transition hover:-translate-y-1 hover:border-purple-400/70 hover:bg-zinc-900"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 rounded-full border border-purple-400/30 bg-purple-500/15 text-xl shadow-lg sm:text-2xl shadow-purple-500/10">
                      📅
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wide sm:mt-4 sm:text-xs text-purple-300">
                      Venue events
                    </p>
                    <p className="mt-1 text-sm font-bold text-white sm:text-base">
                      {sortedEvents.length} Upcoming Event{sortedEvents.length === 1 ? '' : 's'}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 sm:mt-2 sm:text-xs sm:leading-5">
                      View all events at this venue
                    </p>
                  </div>
                  <span className="mt-1 text-xl text-zinc-500 sm:mt-2 sm:text-2xl transition group-hover:translate-x-1 group-hover:text-purple-300">
                    ›
                  </span>
                </div>
              </Link>

              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/75 p-3 shadow-lg sm:p-4 shadow-black/30">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
                <div className="relative">
                  <div className="inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 rounded-full border border-amber-400/30 bg-amber-500/15 text-xl shadow-lg sm:text-2xl shadow-amber-500/10">
                    ✨
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide sm:mt-4 sm:text-xs text-amber-300">
                    Last updated
                  </p>
                  <p className="mt-1 text-sm font-bold text-white sm:text-base">
                    {formatDate(today)}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 sm:mt-2 sm:text-xs sm:leading-5">
                    Information up to date
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:flex sm:flex-wrap sm:gap-4">
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/40"
                >
                  🌐 Visit Website ↗
                </a>
              )}

              <Link
                href={`/venues?city=${encodeURIComponent(venue.city_area || '')}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/70 bg-zinc-950/70 px-3 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm text-zinc-100 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-zinc-900 hover:text-white"
              >
                📅 View Events →
              </Link>
            </div>

            <div className="mt-5 border-t border-zinc-800/80 pt-5 sm:mt-7 sm:pt-7">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/65 p-4 shadow-lg shadow-black/20 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                About this venue
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
                {venueName} is a lifestyle venue based in {venueCity || 'the UK'}
                {venueRegion ? `, ${venueRegion}` : ''}. The venue hosts regular social
                events, club nights and community gatherings throughout the year.
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Browse upcoming events below or visit the venue website for the latest information.
              </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-4 sm:mt-10">
          <div>
            <h2 className="text-2xl font-bold">Upcoming events</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {sortedEvents.length} upcoming event{sortedEvents.length === 1 ? '' : 's'} listed for this venue
            </p>
          </div>

          <Link
            href={`/venues?city=${encodeURIComponent(venue.city_area || '')}`}
            className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:text-white"
          >
            Search nearby events
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const startTime = formatTime(event.start_time)
              const category = getEventCategory(event)
              const eventName = cleanDisplayText(event.event_name)
              const eventType = event.event_type ? cleanDisplayText(event.event_type) : 'Event'
              const eventDescription = event.description
                ? cleanDisplayText(event.description)
                : ''
              const dateBadge = getEventDateBadge(event.event_date)

              return (
                <Link key={event.event_id} href={`/events/${event.event_id}`} className="group block cursor-pointer">
                  <article className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-xl shadow-blue-950/25 ring-1 ring-purple-500/10 transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-blue-500/20">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_30%)] opacity-75 transition group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-6 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400/50 to-transparent" />
                    <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 text-4xl text-zinc-600 transition group-hover:translate-x-1 group-hover:text-blue-300 sm:block">
                      ›
                    </div>
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={eventName}
                        className="h-48 w-full object-cover sm:h-56"
                      />
                    )}

                    <div className="relative p-4 sm:p-5">
                      <div className="absolute right-4 top-4 z-20 flex h-[94px] w-[74px] flex-col items-center justify-center rounded-2xl border border-purple-400/50 bg-zinc-950/85 text-center shadow-lg shadow-purple-500/25 ring-1 ring-white/5 backdrop-blur sm:right-5 sm:top-5 sm:h-[106px] sm:w-[82px]">
                        <p className="text-3xl font-black leading-none text-white sm:text-4xl">
                          {dateBadge.day}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.35em] text-purple-100 sm:text-xs">
                          {dateBadge.month}
                        </p>
                        <div className="my-2 h-px w-10 bg-zinc-700/80" />
                        {dateBadge.weekday ? (
                          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-zinc-200 sm:text-xs">
                            {dateBadge.weekday}
                          </p>
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-zinc-500 sm:text-xs">
                            TBC
                          </p>
                        )}
                      </div>

                      <div className="mb-3 flex max-w-[calc(100%-5.75rem)] flex-wrap gap-2 sm:max-w-[calc(100%-6.5rem)]">
                        <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold shadow-lg ${getCategoryPillClass(category)}`}>
                          🏷 {category}
                        </p>

                        {eventType && eventType !== 'Event' && (
                          <p className="inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200 shadow-lg shadow-purple-500/10">
                            {eventType}
                          </p>
                        )}
                      </div>

                      <h3 className="break-words pr-24 text-xl font-extrabold text-white transition group-hover:text-blue-200 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.45)] sm:pr-28 sm:text-2xl lg:text-3xl">
                        {eventName}
                      </h3>

                      <div className="mt-3 grid gap-2 pr-24 text-xs text-zinc-300 sm:grid-cols-3 sm:pr-28 sm:text-sm">
                        <p>📍 {venueCity || venueRegion || 'Location TBC'}</p>
                        <p>📅 {formatDate(event.event_date)}</p>
                        <p>🕘 {startTime || 'Time TBC'}</p>
                      </div>

                      {eventDescription && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                          {eventDescription}
                        </p>
                      )}

                      <div className="mt-5 flex items-center text-sm font-semibold text-blue-300 opacity-80 transition group-hover:translate-x-1 group-hover:text-blue-200">
                        Tap anywhere on this card to view details →
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
