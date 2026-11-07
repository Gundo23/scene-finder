import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import Icon from '@/app/components/Icon'
import { cleanText } from '@/lib/cleanText'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

function publicUrl(value: string | null | undefined) {
  try {
    const url = new URL(cleanDisplayText(value))
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function uniqueDisplayParts(values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  return values.map(cleanDisplayText).filter((value) => {
    if (!value || seen.has(value.toLowerCase())) return false
    seen.add(value.toLowerCase())
    return true
  })
}

function descriptionParagraphs(value: string | null | undefined) {
  if (!value) return []
  const raw = String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(?:p|div|li|h[1-6])>|<br\s*\/?>/gi, '\n')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
  const paragraphs = raw.split(/\n+/).map(cleanDisplayText).filter(Boolean)
  if (paragraphs.length) {
    paragraphs[0] = paragraphs[0].replace(/^click\s+(?:on\s+)?(?:the\s+)?icon\s+for\s+(?:more\s+)?(?:details|information|info)\b[.!:;\s-]*/i, '').trim()
  }
  return paragraphs.filter(Boolean)
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
  // Imported midnight values often mean that the source supplied no time.
  return time && time !== '00:00' ? time : null
}

function getReturnHref(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate || candidate.length > 4096 || !candidate.startsWith('/') || candidate.startsWith('//')) return '/events'
  try {
    const url = new URL(candidate, 'https://www.scenefinder.co.uk')
    if (url.origin !== 'https://www.scenefinder.co.uk' || !/^\/(?:venues|events|venue\/[^/]+)$/.test(url.pathname)) return '/events'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/events'
  }
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ from?: string | string[] }>
}) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const returnHref = getReturnHref(query.from)
  const backLabel = returnHref.startsWith('/venue/') ? 'Back to venue' : 'Back to results'
  const { data: event, error } = await supabase
    .from('events')
    .select('event_id, venue_id, organiser_id, event_name, event_date, start_time, end_time, event_type, description, ticket_url, source_url, image_url, status, event_location_name, event_address_line_1, event_address_line_2, event_locality, event_postal_town, event_county, event_postcode, event_country, event_location_verified, event_address_visibility')
    .eq('event_id', id)
    .eq('is_published', true)
    .single()

  if (error || !event) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-6xl rounded-3xl border border-blue-500/20 bg-zinc-900/70 p-7">
          <h1 className="text-2xl font-bold">This event isn’t available</h1>
          <p className="mt-2 text-zinc-400">The listing may have changed. Browse the latest events to find another date.</p>
          <Link href={returnHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200"><Icon name="arrow-left" className="h-4 w-4" />{backLabel}</Link>
        </section>
      </main>
    )
  }

  const profileIds = [...new Set([event.venue_id, event.organiser_id].filter((value): value is string => Boolean(value)))]
  const { data: profiles } = profileIds.length
    ? await supabase.from('venues')
        .select('venue_id, name, canonical_city, city_area, canonical_region, region, website, image_url, location_kind, address_visibility, address_verified, address_line_1, address_line_2, locality, postal_town, county, postcode, country')
        .in('venue_id', profileIds)
    : { data: [] }
  const venue = profiles?.find((profile) => profile.venue_id === event.venue_id)
  const organiser = profiles?.find((profile) => profile.venue_id === event.organiser_id)

  const eventName = cleanDisplayText(event.event_name) || 'Untitled event'
  const eventType = cleanDisplayText(event.event_type).replace(/_/g, ' ')
  const paragraphs = descriptionParagraphs(event.description)
  const startTime = formatTime(event.start_time)
  const endTime = formatTime(event.end_time)
  const eventTime = startTime ? `${startTime}${endTime ? ` – ${endTime}` : ''}` : 'Time to be confirmed'
  const venueName = cleanDisplayText(venue?.name)
  const organiserName = cleanDisplayText(organiser?.name)
  const venueCity = cleanDisplayText(venue?.canonical_city || venue?.city_area)
  const venueRegion = cleanDisplayText(venue?.canonical_region || venue?.region)
  const hostArea = uniqueDisplayParts([venueCity, venueRegion]).join(', ')
  const ticketUrl = publicUrl(event.ticket_url)
  const sourceUrl = publicUrl(event.source_url)
  const venueWebsite = publicUrl(venue?.website)
  const bookingHref = ticketUrl || sourceUrl || venueWebsite
  const bookingLabel = ticketUrl ? 'Tickets / booking' : sourceUrl ? 'View event website' : 'Visit venue website'
  const eventVisibility = cleanDisplayText(event.event_address_visibility).toLowerCase()
  const eventIsPrivate = eventVisibility === 'private'
  const canShowEventAddress = event.event_location_verified === true && eventVisibility === 'public'
  const hasEventLocation = uniqueDisplayParts([
    event.event_location_name, event.event_address_line_1, event.event_address_line_2,
    event.event_locality, event.event_postal_town, event.event_county, event.event_postcode,
  ]).length > 0
  const canShowVenueAddress = !eventIsPrivate && !hasEventLocation &&
    venue?.location_kind === 'fixed_venue' && venue?.address_visibility === 'public' && venue?.address_verified === true
  const publicAddress = canShowEventAddress
    ? uniqueDisplayParts([event.event_location_name, event.event_address_line_1, event.event_address_line_2, event.event_locality, event.event_postal_town, event.event_county, event.event_postcode]).join(', ')
    : canShowVenueAddress
      ? uniqueDisplayParts([venue?.address_line_1, venue?.address_line_2, venue?.locality, venue?.postal_town, venue?.canonical_city, venue?.county, venue?.postcode]).join(', ')
      : ''
  const generalEventArea = event.event_location_verified && !eventIsPrivate
    ? uniqueDisplayParts([event.event_locality, event.event_postal_town]).join(', ')
    : ''
  const locationText = publicAddress || generalEventArea || hostArea || 'Location to be confirmed'
  const mapsHref = publicAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(publicAddress)}`
    : null
  const profileHref = (profileId: string) => `/venue/${encodeURIComponent(profileId)}?from=${encodeURIComponent(returnHref.startsWith('/venue/') ? '/events' : returnHref)}`
  const reportQuery = new URLSearchParams({
    type: 'incorrect_information',
    message: `Event: ${eventName}\nhttps://www.scenefinder.co.uk/events/${encodeURIComponent(id)}\n\nWhat needs updating?\n`,
  })

  return (
    <main className="relative min-h-screen bg-zinc-950 px-4 pb-8 pt-5 text-white sm:px-6 sm:pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl">
        <Link href={returnHref} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-blue-200"><Icon name="arrow-left" className="h-4 w-4" />{backLabel}</Link>

        <article className="overflow-hidden rounded-3xl border border-blue-400/25 bg-gradient-to-br from-blue-950/25 via-zinc-900/90 to-purple-950/20 shadow-xl shadow-blue-950/15">
          <div className="h-px bg-gradient-to-r from-blue-400/70 via-purple-400/70 to-pink-400/50" />
          <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="order-1 p-5 sm:p-7 md:order-2 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">{eventType || 'Event'}</p>
              <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{eventName}</h1>
              {venue && (
                <Link href={profileHref(venue.venue_id)} className="mt-3 inline-flex min-h-7 items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-blue-200">
                  {venueName} <Icon name="arrow-right" className="h-3.5 w-3.5 shrink-0" />
                </Link>
              )}
              {organiser && organiser.venue_id !== venue?.venue_id && <p className="mt-1 text-xs leading-6 text-zinc-400">Organised by <Link href={profileHref(organiser.venue_id)} className="text-purple-200 hover:underline">{organiserName}</Link></p>}

              <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-white/10 py-4">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-zinc-400"><Icon name="calendar" className="h-4 w-4 text-blue-300" />Date</dt>
                  <dd className="mt-1.5 text-sm font-semibold leading-6 text-zinc-100">{event.event_date ? <time dateTime={event.event_date}>{formatDate(event.event_date)}</time> : 'Date to be confirmed'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-zinc-400"><Icon name="clock" className="h-4 w-4 text-purple-300" />Time</dt>
                  <dd className="mt-1.5 text-sm font-semibold leading-6 text-zinc-100">{eventTime}</dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2.5">
                <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-pink-300" />
                <div className="min-w-0">
                  <p className="text-sm leading-6 text-zinc-300">{locationText}</p>
                  {eventIsPrivate ? <p className="mt-1 text-xs leading-5 text-zinc-500">The organiser shares the exact address privately.</p> : mapsHref && <a href={mapsHref} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Open map <Icon name="external" className="h-3 w-3" /><span className="sr-only">(opens in a new tab)</span></a>}
                </div>
              </div>

              <div className="mt-6">
                {bookingHref ? (
                  <>
                    <a href={bookingHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-500 hover:to-purple-500">
                      {bookingLabel} <Icon name="external" className="h-4 w-4" /><span className="sr-only">(opens in a new tab)</span>
                    </a>
                    <p className="mt-2 text-center text-xs leading-5 text-zinc-500">Opens {new URL(bookingHref).hostname.replace(/^www\./, '')}</p>
                  </>
                ) : <p className="rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-zinc-400">Booking details haven’t been listed yet. Check with the venue or organiser.</p>}
              </div>
            </div>

            <div className="order-2 flex items-center justify-center border-t border-white/8 bg-black/25 p-4 md:order-1 md:border-t-0 md:border-r md:p-6">
              <FallbackImage src={event.image_url} fallbackSources={[venue?.image_url, organiser?.image_url]} fallbackSrc="/images/home-hero.jpg" alt={`${eventName} artwork`} loading="eager" fetchPriority="high" className="h-64 w-full object-contain sm:h-80 md:h-full md:max-h-[480px]" />
            </div>
          </div>
        </article>

        <section aria-labelledby="about-event" className="mt-8 max-w-3xl sm:mt-10">
          <h2 id="about-event" className="text-xl font-bold tracking-tight sm:text-2xl">About this event</h2>
          {paragraphs.length ? (
            <div className="mt-4 space-y-4 break-words text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : <p className="mt-3 text-sm leading-7 text-zinc-400">More details haven’t been added yet. Visit the event website for the latest information.</p>}
        </section>

        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            {sourceUrl && sourceUrl !== bookingHref && <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-zinc-400 hover:text-blue-200">Original event listing <Icon name="external" className="h-3.5 w-3.5" /><span className="sr-only">(opens in a new tab)</span></a>}
            {venueWebsite && venueWebsite !== bookingHref && venueWebsite !== sourceUrl && <a href={venueWebsite} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-zinc-400 hover:text-blue-200">Venue website <Icon name="external" className="h-3.5 w-3.5" /><span className="sr-only">(opens in a new tab)</span></a>}
            <Link href={`/submit/contact?${reportQuery}`} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-zinc-400 hover:text-blue-200"><Icon name="support" className="h-3.5 w-3.5" />Report an issue</Link>
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-zinc-500">Check entry requirements, times and the latest information with the venue or organiser before travelling or booking.</p>
        </div>
      </div>
    </main>
  )
}
