import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import Icon from '@/app/components/Icon'
import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EVENT_BATCH_SIZE = 40

function cleanDisplayText(value: string | null | undefined) {
  if (!value) return ''
  return cleanText(cleanText(String(value)))
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (match, entity: string) => {
      const codePoint = Number.parseInt(entity.replace(/^x/i, ''), /^x/i.test(entity) ? 16 : 10)
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match
    })
    .replace(/&(?:rsquo|lsquo);/gi, "'")
    .replace(/&(?:rdquo|ldquo);/gi, '"')
    .replace(/&hellip;/gi, '…')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\\[rnt]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanDescription(value: string | null | undefined) {
  return cleanDisplayText(value)
    .replace(/^click\s+(?:on\s+)?(?:the\s+)?icon\s+for\s+(?:more\s+)?(?:details|information|info)\b[.!:;\s-]*/i, '')
    .trim()
}

function publicUrl(value: string | null | undefined) {
  try {
    const url = new URL(cleanDisplayText(value))
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function formatDate(value: string | null) {
  if (!value) return 'Date to be confirmed'
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed'
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London',
  })
}

function formatTime(value: string | null) {
  const time = cleanDisplayText(value).slice(0, 5)
  return time && time !== '00:00' ? time : 'Time to be confirmed'
}

function getTodayString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function uniqueDisplayParts(values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  return values.map(cleanDisplayText).filter((value) => {
    if (!value || seen.has(value.toLowerCase())) return false
    seen.add(value.toLowerCase())
    return true
  })
}

function cleanVenueNotes(value: string | null | undefined) {
  return cleanDisplayText(value).split('|').map((part) => part.trim()).filter((part) => {
    return part && !/(?:confidence|waze listing|companies house result|source:|lead source|scrape)/i.test(part)
  }).join(' ')
}

function getLocationKindLabel(kind: string) {
  const labels: Record<string, string> = {
    fixed_venue: 'Club & venue',
    event_series: 'Event organiser',
    multi_location: 'Multiple locations',
    private_location: 'Private location',
    closed: 'Closed / inactive',
    lead: 'Directory listing',
  }
  return labels[kind] || 'Venue listing'
}

function getReturnHref(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate || candidate.length > 2048 || !candidate.startsWith('/') || candidate.startsWith('//')) return '/venues'
  try {
    const url = new URL(candidate, 'https://www.scenefinder.co.uk')
    if (url.origin !== 'https://www.scenefinder.co.uk' || !/^\/(?:venues|events)(?:\/[^/]+)?$/.test(url.pathname)) return '/venues'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/venues'
  }
}

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ show?: string | string[]; from?: string | string[] }>
}) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const show = Array.isArray(query.show) ? query.show[0] : query.show
  const requestedEventLimit = Number.parseInt(show || '', 10)
  const returnHref = getReturnHref(query.from)
  const today = getTodayString()

  const { data: venue, error } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, canonical_city, canonical_region, country, website, notes, image_url, postcode, location_kind, address_line_1, address_line_2, locality, postal_town, county, address_visibility, address_verified')
    .eq('venue_id', id)
    .single()

  if (error || !venue) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-6xl rounded-3xl border border-blue-500/20 bg-zinc-900/70 p-7">
          <h1 className="text-2xl font-bold">This venue isn’t available</h1>
          <p className="mt-2 text-zinc-400">Try again shortly, or explore other clubs and venues.</p>
          <Link href={returnHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200">
            <Icon name="arrow-left" className="h-4 w-4" /> Back to results
          </Link>
        </section>
      </main>
    )
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('event_id, venue_id, organiser_id, event_name, event_date, start_time, event_type, description, ticket_url, status, image_url, event_location_name, event_locality, event_postal_town, event_location_verified, event_address_visibility')
    .or(`venue_id.eq.${venue.venue_id},organiser_id.eq.${venue.venue_id}`)
    .eq('is_published', true)
    .or(`event_date.gte.${today},event_date.is.null`)
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('start_time', { ascending: true, nullsFirst: false })
    .order('event_id', { ascending: true })

  const sortedEvents = events || []
  const linkedProfileIds = [...new Set(sortedEvents.flatMap((event) =>
    [event.venue_id, event.organiser_id].filter((value): value is string => Boolean(value))
  ))]
  const { data: linkedProfiles } = linkedProfileIds.length
    ? await supabase.from('venues').select('venue_id, name, canonical_city, city_area').in('venue_id', linkedProfileIds)
    : { data: [] }
  const profileById = new Map((linkedProfiles || []).map((profile) => [profile.venue_id, profile]))
  const visibleEventLimit = Number.isFinite(requestedEventLimit)
    ? Math.min(Math.max(requestedEventLimit, EVENT_BATCH_SIZE), Math.max(sortedEvents.length, EVENT_BATCH_SIZE))
    : EVENT_BATCH_SIZE
  const visibleEvents = sortedEvents.slice(0, visibleEventLimit)
  const hiddenEventCount = Math.max(sortedEvents.length - visibleEvents.length, 0)
  const nextEventDisplayLimit = Math.min(visibleEventLimit + EVENT_BATCH_SIZE, sortedEvents.length)

  const venueName = cleanDisplayText(venue.name) || 'Venue'
  const venueCity = cleanDisplayText(venue.canonical_city || venue.postal_town || venue.city_area)
  const venueRegion = cleanDisplayText(venue.canonical_region || venue.region)
  const area = uniqueDisplayParts([venueCity, venueRegion]).join(' · ')
  const venueNotes = cleanVenueNotes(venue.notes)
  const venueWebsite = publicUrl(venue.website)
  const locationKind = cleanDisplayText(venue.location_kind || 'needs_review').toLowerCase()
  const addressVisibility = cleanDisplayText(venue.address_visibility || 'city_only').toLowerCase()

  // A map link must never reveal an unverified, private or travelling address.
  const canShowPublicAddress =
    locationKind === 'fixed_venue' &&
    addressVisibility === 'public' &&
    venue.address_verified === true
  const venueAddress = canShowPublicAddress
    ? uniqueDisplayParts([venue.address_line_1, venue.address_line_2, venue.locality, venue.postal_town, venue.canonical_city, venue.county, venue.canonical_region, venue.postcode, venue.country]).join(', ')
    : ''
  const mapsHref = venueAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`
    : ''
  const nearbyQuery = new URLSearchParams()
  if (canShowPublicAddress && venue.postcode) nearbyQuery.set('search', cleanDisplayText(venue.postcode))
  else if (venueCity) nearbyQuery.set('city', venueCity)
  else if (venueRegion) nearbyQuery.set('region', venueRegion)
  const nearbyHref = `/venues${nearbyQuery.size ? `?${nearbyQuery}` : ''}`
  const nearbyEventsHref = `/events${venueCity ? `?city=${encodeURIComponent(venueCity)}` : venueRegion ? `?region=${encodeURIComponent(venueRegion)}` : ''}`

  const locationMessage = locationKind === 'event_series' || locationKind === 'multi_location'
    ? 'Locations vary. Check each event for its venue and address.'
    : locationKind === 'private_location' || addressVisibility === 'private'
      ? 'The exact address is private. Check with the organiser before travelling.'
      : locationKind === 'closed'
        ? 'This location is listed as closed or inactive.'
        : 'A verified public address is not available yet. Check the official website before travelling.'
  const venueAboutText = locationKind === 'event_series'
    ? `${venueName} is an event organiser${venueCity ? ` associated with ${venueCity}` : ''}. Event locations can vary.`
    : locationKind === 'multi_location'
      ? `${venueName} operates across multiple locations. The individual event listing has the relevant venue details.`
      : `${venueName} is listed in ${area || 'the UK'}.`

  const currentQuery = new URLSearchParams()
  if (visibleEventLimit > EVENT_BATCH_SIZE) currentQuery.set('show', String(visibleEventLimit))
  if (query.from) currentQuery.set('from', returnHref)
  const currentVenueHref = `/venue/${encodeURIComponent(id)}${currentQuery.size ? `?${currentQuery}` : ''}`
  const nextQuery = new URLSearchParams(currentQuery)
  nextQuery.set('show', String(nextEventDisplayLimit))
  const firstNewEvent = sortedEvents[visibleEventLimit]?.event_id
  const showMoreHref = `/venue/${encodeURIComponent(id)}?${nextQuery}#${firstNewEvent ? `event-${encodeURIComponent(firstNewEvent)}` : 'upcoming-events'}`
  const reportQuery = new URLSearchParams({
    type: 'incorrect_information',
    message: `Venue: ${venueName}\nhttps://www.scenefinder.co.uk/venue/${encodeURIComponent(id)}\n\nWhat needs updating?\n`,
  })
  const actionClass = 'flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm'

  return (
    <main className="relative min-h-screen bg-zinc-950 px-4 pb-8 pt-5 text-white sm:px-6 sm:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl">
        <Link href={returnHref} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-blue-200">
          <Icon name="arrow-left" className="h-4 w-4" /> Back to results
        </Link>

        <section aria-labelledby="venue-name" className="overflow-hidden rounded-3xl border border-blue-400/25 bg-gradient-to-br from-blue-950/25 via-zinc-900/90 to-purple-950/20 shadow-xl shadow-blue-950/15">
          <div className="h-px bg-gradient-to-r from-blue-400/70 via-purple-400/70 to-pink-400/50" />
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">{getLocationKindLabel(locationKind)}</p>
                <h1 id="venue-name" className="mt-2 break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{venueName}</h1>
                {area && <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">{area}</p>}
              </div>
              {venue.image_url && (
                <div className="hidden h-20 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 p-2 sm:flex">
                  <FallbackImage src={venue.image_url} fallbackSrc="/images/scene-finder-logo-transparent.png" alt="" className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3 border-t border-white/8 pt-4">
              <Icon name="pin" className={`mt-0.5 h-5 w-5 shrink-0 ${canShowPublicAddress ? 'text-emerald-300' : 'text-zinc-400'}`} />
              <div className="min-w-0">
                {canShowPublicAddress && venueAddress ? (
                  <>
                    <address className="not-italic text-sm leading-6 text-zinc-200">{venueAddress}</address>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300"><Icon name="check" className="h-3.5 w-3.5" /> Address verified</p>
                  </>
                ) : <p className="text-sm leading-6 text-zinc-400">{locationMessage}</p>}
              </div>
            </div>

            <nav aria-label="Venue actions" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {mapsHref ? (
                <a href={mapsHref} target="_blank" rel="noreferrer" className={`${actionClass} border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20`}>
                  <Icon name="map" className="h-4 w-4" /> Map <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span aria-disabled="true" title="No verified public address is available" className={`${actionClass} border-zinc-800 bg-zinc-950/40 text-zinc-500`}>
                  <Icon name="map" className="h-4 w-4" /> Map unavailable
                </span>
              )}
              <a href="#upcoming-events" className={`${actionClass} border-purple-400/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20`}>
                <Icon name="calendar" className="h-4 w-4" /> Events
                {!eventsError && <span className="rounded-md bg-purple-400/10 px-1.5 text-xs">{sortedEvents.length}</span>}
              </a>
              {venueWebsite ? (
                <a href={venueWebsite} target="_blank" rel="noreferrer" className={`${actionClass} border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20`}>
                  <Icon name="external" className="h-4 w-4" /> Website <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span aria-disabled="true" className={`${actionClass} border-zinc-800 bg-zinc-950/40 text-zinc-500`}>
                  <Icon name="external" className="h-4 w-4" /> Website unlisted
                </span>
              )}
              <Link href={nearbyHref} className={`${actionClass} border-pink-400/30 bg-pink-500/10 text-pink-200 hover:bg-pink-500/20`}>
                <Icon name="clubs" className="h-4 w-4" /> Nearby clubs
              </Link>
            </nav>

            <details className="group mt-4 border-t border-white/8 pt-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-300 [&::-webkit-details-marker]:hidden">
                About this {locationKind === 'event_series' ? 'organiser' : 'venue'}
                <Icon name="chevron-down" className="h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
              </summary>
              <div className="max-w-3xl space-y-3 pb-2 text-sm leading-7 text-zinc-400">
                <p>{venueAboutText}</p>
                {venueNotes && <p>{venueNotes}</p>}
              </div>
            </details>
          </div>
        </section>

        <section id="upcoming-events" aria-labelledby="events-heading" className="mt-8 scroll-mt-5 sm:mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
            <div>
              <h2 id="events-heading" className="text-2xl font-bold tracking-tight">Upcoming events</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {eventsError ? 'Please try again shortly.' : hiddenEventCount > 0 ? `Showing ${visibleEvents.length} of ${sortedEvents.length} events` : `${sortedEvents.length} event${sortedEvents.length === 1 ? '' : 's'} listed`}
              </p>
            </div>
            <Link href={nearbyEventsHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">
              Explore nearby events <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {eventsError ? (
              <div role="alert" className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-6 text-sm text-amber-100">Event information is temporarily unavailable. Please try again shortly.</div>
            ) : visibleEvents.length ? visibleEvents.map((event) => {
              const eventName = cleanDisplayText(event.event_name) || 'Event'
              const description = cleanDescription(event.description)
              const eventType = cleanDisplayText(event.event_type).replace(/_/g, ' ')
              const ticketUrl = publicUrl(event.ticket_url)
              const host = profileById.get(event.venue_id)
              const organiser = event.organiser_id ? profileById.get(event.organiser_id) : null
              const hostArea = cleanDisplayText(host?.canonical_city || host?.city_area)
              const visibility = cleanDisplayText(event.event_address_visibility).toLowerCase()
              const eventLocation = event.event_location_verified && visibility === 'public'
                ? uniqueDisplayParts([event.event_location_name, event.event_locality, event.event_postal_town]).join(', ') || hostArea
                : hostArea
              const eventHref = `/events/${encodeURIComponent(event.event_id)}?from=${encodeURIComponent(`${currentVenueHref}#event-${encodeURIComponent(event.event_id)}`)}`
              const currentProfileHref = (profileId: string) => `/venue/${encodeURIComponent(profileId)}?from=${encodeURIComponent(returnHref)}`

              return (
                <article key={event.event_id} id={`event-${encodeURIComponent(event.event_id)}`} className="group scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/65 transition hover:border-blue-400/35 sm:flex">
                  {event.image_url && (
                    <Link href={eventHref} tabIndex={-1} aria-hidden="true" className="flex h-52 items-center justify-center border-b border-white/6 bg-black/25 p-3 sm:h-auto sm:w-52 sm:shrink-0 sm:border-r sm:border-b-0 lg:w-60">
                      <FallbackImage src={event.image_url} fallbackSrc="/images/scene-finder-logo-transparent.png" alt="" className="h-full max-h-60 w-full object-contain" />
                    </Link>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium sm:text-sm">
                      <span className="inline-flex items-center gap-1.5 text-blue-200"><Icon name="calendar" className="h-4 w-4" />{formatDate(event.event_date)}</span>
                      <span className="inline-flex items-center gap-1.5 text-zinc-400"><Icon name="clock" className="h-4 w-4" />{formatTime(event.start_time)}</span>
                    </div>
                    <h3 className="mt-3 break-words text-xl font-bold leading-snug tracking-tight sm:text-2xl"><Link href={eventHref} className="transition hover:text-blue-200">{eventName}</Link></h3>
                    <p className="mt-2 flex items-start gap-1.5 text-sm leading-6 text-zinc-400"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" /><span>{eventLocation || 'Location to be confirmed'}</span></p>
                    {organiser && organiser.venue_id !== host?.venue_id && (
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {host && <>At <Link href={currentProfileHref(host.venue_id)} className="text-blue-200 hover:underline">{cleanDisplayText(host.name)}</Link> · </>}
                        By <Link href={currentProfileHref(organiser.venue_id)} className="text-blue-200 hover:underline">{cleanDisplayText(organiser.name)}</Link>
                      </p>
                    )}
                    {description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{description}</p>}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={eventHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20">View event <Icon name="arrow-right" className="h-4 w-4" /></Link>
                        {ticketUrl && <a href={ticketUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white">Tickets / booking <Icon name="external" className="h-3.5 w-3.5" /><span className="sr-only">(opens in a new tab)</span></a>}
                      </div>
                      {eventType && <span className="rounded-full border border-purple-400/20 bg-purple-500/5 px-2.5 py-1 text-xs text-purple-200">{eventType}</span>}
                    </div>
                  </div>
                </article>
              )
            }) : (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 px-6 py-9 text-center">
                <h3 className="text-lg font-semibold">No upcoming events listed</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">Check the venue’s website for announcements, or find another event in the area.</p>
                <Link href={nearbyEventsHref} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200">Find nearby events <Icon name="arrow-right" className="h-4 w-4" /></Link>
              </div>
            )}
          </div>

          {hiddenEventCount > 0 && (
            <div className="mt-6 text-center">
              <Link href={showMoreHref} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20">Show {Math.min(EVENT_BATCH_SIZE, hiddenEventCount)} more events <Icon name="chevron-down" className="h-4 w-4" /></Link>
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/8 pt-4 text-xs leading-6 text-zinc-500">
          <p>Check the official event details before travelling or booking.</p>
          <Link href={`/submit/contact?${reportQuery}`} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-zinc-400 hover:text-blue-200"><Icon name="support" className="h-3.5 w-3.5" /> Report an issue</Link>
        </div>
      </div>
    </main>
  )
}
