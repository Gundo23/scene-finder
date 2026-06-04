import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SOURCES = 80
const MAX_PAGES_PER_SOURCE = 5
const MAX_EVENTS_RETURNED = 150
const FETCH_TIMEOUT_MS = 10000

const EVENT_KEYWORDS = [
  'event',
  'events',
  'ticket',
  'tickets',
  'party',
  'club night',
  'night',
  'social',
  'munch',
  'calendar',
  'whats-on',
  'whatson',
  'workshop',
  'fetish',
  'kink',
  'swing',
  'swingers',
  'play party',
  'theme night',
  'newbie',
  'couples',
  'members night',
]

const PAGE_HINTS = [
  '/events',
  '/event',
  '/calendar',
  '/whats-on',
  '/whatson',
  '/tickets',
  '/club-nights',
  '/parties',
  '/party',
]

const JUNK_URL_PARTS = [
  '/contact',
  '/contact-us',
  '/privacy',
  '/privacy-policy',
  '/cookie',
  '/cookies',
  '/terms',
  '/terms-and-conditions',
  '/faq',
  '/faqs',
  '/about',
  '/about-us',
  '/gallery',
  '/photos',
  '/login',
  '/log-in',
  '/register',
  '/sign-up',
  '/account',
  '/membership',
  '/memberships',
  '/etiquette',
  '/dress-code',
  '/accommodation',
  '/directions',
  '/location',
  '/opening-times',
  '/rules',
  '/links',
  '/testimonials',
  '/blog',
  '/news',
  '/shop',
  '/cart',
  '/checkout',
  '/basket',
  '/fetish-guide',
  '/fetish-membership',
  '/fetish-events-and-cost',
  '?ical=1',
  '/?ical=1',
]

const JUNK_TITLES = [
  'book now',
  'booking',
  'join guestlist',
  'guestlist',
  'get in touch',
  'contact',
  'contact us',
  'view all events',
  'view events',
  'all events',
  'events',
  'home',
  'about',
  'about us',
  'gallery',
  'privacy',
  'privacy policy',
  'cookies',
  'cookie policy',
  'terms',
  'terms and conditions',
  'login',
  'log in',
  'register',
  'sign up',
  'menu',
  'read more',
  'find this book',
  'create account',
  'edit',
  'watch',
  'history',
  'faq',
  'faqs',
  'membership',
  'memberships',
  'rules',
  'etiquette',
  'dress code',
  'accommodation',
  'directions',
  'location',
  'opening times',
  'testimonials',
  'links',
]

function cleanText(value: string | null | undefined) {
  if (!value) return ''

  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, '')
    .replace(/&raquo;/g, '')
    .replace(/&#171;/g, '')
    .replace(/&#187;/g, '')
    .replace(/&#39;/g, "'")
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteUrl(base: string, href: string | null | undefined) {
  if (!href) return null

  if (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#') ||
    href.startsWith('javascript:') ||
    href.startsWith('data:')
  ) {
    return null
  }

  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function sameDomain(a: string, b: string) {
  try {
    return (
      new URL(a).hostname.replace(/^www\./, '') ===
      new URL(b).hostname.replace(/^www\./, '')
    )
  } catch {
    return false
  }
}

function isJunkUrl(url: string) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.toLowerCase()

    return JUNK_URL_PARTS.some((part) => path.includes(part))
  } catch {
    return true
  }
}

function looksLikeEvent(value: string) {
  const lower = value.toLowerCase()
  return EVENT_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function looksLikeUsefulPage(value: string) {
  const lower = value.toLowerCase()
  return PAGE_HINTS.some((hint) => lower.includes(hint)) || looksLikeEvent(lower)
}

function normalizeTitle(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isJunkTitle(title: string) {
  const cleaned = normalizeTitle(title)

  if (!cleaned) return true
  if (cleaned.length < 6) return true
  if (cleaned.includes('<') || cleaned.includes('>')) return true
  if (cleaned.includes('")')) return true
  if (/^\d+$/.test(cleaned)) return true
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)$/i.test(cleaned)) return true

  return JUNK_TITLES.some((junk) => cleaned === junk || cleaned.includes(junk))
}

function cleanEventName(title: string) {
  let cleaned = cleanText(title)
    .replace(/[«»]/g, '')
    .replace(/^\+\s*/g, '')
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/gi, '')
    .replace(/\b\d{1,2}(st|nd|rd|th)?\b/gi, '')
    .replace(
      /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/gi,
      ''
    )
    .replace(/\b20\d{2}\b/g, '')
    .replace(/\b\d{1,2}:\d{2}\b/g, '')
    .replace(/\b\d{1,2}(am|pm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const cutMarkers = [
    ' buy tickets',
    ' book now',
    ' tickets',
    ' read more',
    ' more info',
    ' details',
    ' find out more',
  ]

  for (const marker of cutMarkers) {
    const index = cleaned.toLowerCase().indexOf(marker)
    if (index > 4) cleaned = cleaned.slice(0, index).trim()
  }

  return cleaned || cleanText(title) || 'Untitled Event'
}

function extractDate(value: string) {
  const text = cleanText(value)
  const currentYear = new Date().getFullYear()

  const monthMap: Record<string, string> = {
    jan: '01',
    january: '01',
    feb: '02',
    february: '02',
    mar: '03',
    march: '03',
    apr: '04',
    april: '04',
    may: '05',
    jun: '06',
    june: '06',
    jul: '07',
    july: '07',
    aug: '08',
    august: '08',
    sep: '09',
    sept: '09',
    september: '09',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  }

  let match = text.match(
    /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(20\d{2})?\b/i
  )

  if (match) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[3].toLowerCase()]
    const year = match[4] || String(currentYear)
    return `${year}-${month}-${day}`
  }

  match = text.match(
    /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(st|nd|rd|th)?\s*(20\d{2})?\b/i
  )

  if (match) {
    const month = monthMap[match[1].toLowerCase()]
    const day = match[2].padStart(2, '0')
    const year = match[4] || String(currentYear)
    return `${year}-${month}-${day}`
  }

  match = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`

  match = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/)
  if (match) {
    return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
  }

  match = text.match(/\b(\d{1,2})\/(\d{1,2})\b/)
  if (match) {
    return `${currentYear}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
  }

  return null
}

function extractTime(value: string) {
  const text = cleanText(value)
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)

  if (!match) return null

  let hour = Number(match[1])
  const minute = match[2] || '00'
  const meridian = match[3].toLowerCase()

  if (meridian === 'pm' && hour < 12) hour += 12
  if (meridian === 'am' && hour === 12) hour = 0

  return `${String(hour).padStart(2, '0')}:${minute}`
}

function validImageUrl(url: string | null) {
  if (!url) return null

  const lower = url.toLowerCase()

  if (lower.includes('favicon')) return null
  if (lower.endsWith('.svg')) return null
  if (lower.endsWith('.gif')) return null

  return url
}

function extractMetaImage(html: string, baseUrl: string) {
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

  if (og) return validImageUrl(absoluteUrl(baseUrl, og))

  const twitter =
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]

  if (twitter) return validImageUrl(absoluteUrl(baseUrl, twitter))

  return null
}

function extractFirstImage(html: string, baseUrl: string) {
  const images = [
    ...html.matchAll(/<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+)["'][^>]*>/gi),
  ]

  for (const match of images) {
    const image = validImageUrl(absoluteUrl(baseUrl, match[1]))
    if (!image) continue

    const lower = image.toLowerCase()
    if (lower.includes('logo')) continue
    if (lower.includes('icon')) continue
    if (lower.includes('avatar')) continue

    return image
  }

  return null
}

function extractBestImage(html: string, baseUrl: string) {
  return extractMetaImage(html, baseUrl) || extractFirstImage(html, baseUrl)
}

function extractLinks(html: string, baseUrl: string) {
  const links: { href: string; text: string; raw: string }[] = []
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match

  while ((match = regex.exec(html)) !== null) {
    const href = absoluteUrl(baseUrl, match[1])
    const text = cleanText(match[2])
    const raw = match[0]

    if (!href) continue

    links.push({ href, text, raw })
  }

  return links
}

function extractPageTitle(html: string) {
  return (
    cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) ||
    cleanText(html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]) ||
    cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])
  )
}

function extractMetaDescription(html: string) {
  return (
    cleanText(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]) ||
    cleanText(html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1])
  )
}

function extractDateFromHtml(html: string) {
  const timeDate =
    html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i)?.[1] ||
    html.match(/datetime=["']([^"']+)["']/i)?.[1]

  if (timeDate) {
    const date = String(timeDate).slice(0, 10)
    if (/^20\d{2}-\d{2}-\d{2}$/.test(date)) return date
  }

  return extractDate(cleanText(html).slice(0, 6000))
}

function extractCalendarDateFromRaw(raw: string) {
  const datetime =
    raw.match(/datetime=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-date=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-start=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-event-date=["']([^"']+)["']/i)?.[1]

  if (datetime) {
    const date = String(datetime).slice(0, 10)
    if (/^20\d{2}-\d{2}-\d{2}$/.test(date)) return date
  }

  return extractDate(raw)
}

function extractJsonLdEvents(html: string, baseUrl: string) {
  const events: any[] = []
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        const graph = item['@graph'] || [item]

        for (const node of graph) {
          const type = node['@type']

          if (type === 'Event' || type?.includes?.('Event')) {
            events.push({
              name: cleanText(node.name),
              description: cleanText(node.description),
              date: node.startDate ? String(node.startDate).slice(0, 10) : null,
              start_time: node.startDate ? String(node.startDate).slice(11, 16) : null,
              url: absoluteUrl(baseUrl, node.url) || baseUrl,
              image_url: Array.isArray(node.image)
                ? validImageUrl(absoluteUrl(baseUrl, node.image[0]))
                : validImageUrl(absoluteUrl(baseUrl, node.image)),
            })
          }
        }
      }
    } catch {
      continue
    }
  }

  return events
}

function extractCalendarEventLinks(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    raw: string
  }[] = []

  const links = extractLinks(html, baseUrl)

  for (const link of links) {
    const combined = `${link.href} ${link.text} ${link.raw}`.toLowerCase()

    const looksCalendarEvent =
      combined.includes('tribe_events') ||
      combined.includes('eventon') ||
      combined.includes('mec-event') ||
      combined.includes('eo-event') ||
      combined.includes('calendar') ||
      combined.includes('fc-event') ||
      combined.includes('event-title') ||
      combined.includes('event_item') ||
      combined.includes('/event/') ||
      combined.includes('/events/')

    if (!looksCalendarEvent) continue
    if (isJunkUrl(link.href)) continue

    const title =
      link.text ||
      cleanText(link.raw.match(/title=["']([^"']+)["']/i)?.[1]) ||
      cleanText(link.raw.match(/aria-label=["']([^"']+)["']/i)?.[1])

    if (isJunkTitle(title)) continue

    candidates.push({
      href: link.href,
      text: title,
      event_date: extractCalendarDateFromRaw(link.raw),
      raw: link.raw,
    })
  }

  return candidates
}

async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    console.log('SCRAPING:', url)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SceneFinderBot/4.0; +https://scene-finder.local)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.log('FAILED:', response.status, url)
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      console.log('SKIPPED NON-HTML:', url)
      return null
    }

    return await response.text()
  } catch (err: any) {
    clearTimeout(timeout)
    console.log('FETCH ERROR:', url, err?.name || err?.message || 'Unknown error')
    return null
  }
}

async function updateVenueImageIfEmpty(venueId: string, imageUrl: string | null) {
  if (!imageUrl) return { updated: false, error: null }

  const { data: venue, error: venueError } = await supabaseAdmin
    .from('venues')
    .select('venue_id, image_url')
    .eq('venue_id', venueId)
    .maybeSingle()

  if (venueError || !venue) return { updated: false, error: venueError }
  if (venue.image_url) return { updated: false, error: null }

  const { error } = await supabaseAdmin
    .from('venues')
    .update({ image_url: imageUrl })
    .eq('venue_id', venueId)

  return { updated: !error, error }
}

function eventDedupeKey(venueId: string, eventName: string, eventDate: string | null, ticketUrl: string) {
  const cleanName = normalizeTitle(cleanEventName(eventName))
  const cleanDate = eventDate || 'no-date'

  try {
    const parsed = new URL(ticketUrl)
    const cleanPath = parsed.pathname.replace(/\/$/, '')
    return `${venueId}|${cleanDate}|${cleanName}|${cleanPath}`
  } catch {
    return `${venueId}|${cleanDate}|${cleanName}|${ticketUrl}`
  }
}


function shouldSaveEvent(input: {
  event_name: string
  event_date: string | null
  ticket_url: string
  description: string | null
}) {
  const eventName = cleanEventName(input.event_name)

  if (isJunkTitle(eventName)) return false
  if (isJunkUrl(input.ticket_url)) return false

  const lowerUrl = input.ticket_url.toLowerCase()
  if (lowerUrl.includes('google.com/calendar')) return false
  if (lowerUrl.includes('ical=1')) return false
  if (lowerUrl.includes('action=template')) return false

  const combined = `${eventName} ${input.description || ''} ${input.ticket_url}`

  if (!looksLikeEvent(combined) && !input.event_date) return false

  return true
}

async function upsertEvent(input: {
  venue_id: string
  event_name: string
  event_date: string | null
  start_time: string | null
  description: string | null
  ticket_url: string
  image_url: string | null
  source_url: string
}) {
  const eventName = cleanEventName(input.event_name)
  const normalised = normalizeTitle(eventName)

  if (
    !shouldSaveEvent({
      ...input,
      event_name: eventName,
    })
  ) {
    return { action: 'skipped', error: null }
  }

  const { data: existingByUrl } = await supabaseAdmin
    .from('events')
    .select('event_id')
    .eq('venue_id', input.venue_id)
    .eq('ticket_url', input.ticket_url)
    .limit(10)

  if (existingByUrl && existingByUrl.length > 0) {
    const keeper = existingByUrl[0]
    const duplicates = existingByUrl.slice(1)

    if (duplicates.length > 0) {
      await supabaseAdmin
        .from('events')
        .delete()
        .in(
          'event_id',
          duplicates.map((event) => event.event_id)
        )
    }

    const { error } = await supabaseAdmin
      .from('events')
      .update({
        event_name: eventName,
        event_date: input.event_date,
        start_time: input.start_time,
        description: input.description,
        image_url: input.image_url,
        source_url: input.source_url,
        status: 'published',
      })
      .eq('event_id', keeper.event_id)

    return { action: error ? 'error' : 'updated', error }
  }

  if (input.event_date) {
    const { data: existingByTitleDate } = await supabaseAdmin
      .from('events')
      .select('event_id, event_name')
      .eq('venue_id', input.venue_id)
      .eq('event_date', input.event_date)

    const duplicates =
      existingByTitleDate?.filter(
        (event) => normalizeTitle(event.event_name) === normalised
      ) || []

    if (duplicates.length > 0) {
      const keeper = duplicates[0]
      const extras = duplicates.slice(1)

      if (extras.length > 0) {
        await supabaseAdmin
          .from('events')
          .delete()
          .in(
            'event_id',
            extras.map((event) => event.event_id)
          )
      }

      const { error } = await supabaseAdmin
        .from('events')
        .update({
          ticket_url: input.ticket_url,
          description: input.description,
          image_url: input.image_url,
          source_url: input.source_url,
          status: 'published',
        })
        .eq('event_id', keeper.event_id)

      return { action: error ? 'error' : 'updated', error }
    }
  }

  const { error } = await supabaseAdmin.from('events').insert({
    venue_id: input.venue_id,
    event_name: eventName,
    event_date: input.event_date,
    start_time: input.start_time,
    event_type: 'Club Night',
    description: input.description,
    ticket_url: input.ticket_url,
    image_url: input.image_url,
    source_url: input.source_url,
    status: 'published',
  })

  return { action: error ? 'error' : 'created', error }
}

export async function GET() {
  const startedAt = Date.now()

  const { data: sources, error } = await supabaseAdmin
    .from('event_sources')
    .select('source_id, venue_id, source_url, active')
    .eq('active', true)
    .limit(MAX_SOURCES)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let checkedPages = 0
  let candidatesFound = 0
  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let timedOutOrEmpty = 0
  let venueImagesUpdated = 0

  const found: any[] = []
  const errors: any[] = []
  const runSeen = new Set<string>()

  for (const source of sources || []) {
    console.log('SOURCE START:', source.source_url)

    const queue = [source.source_url]
    const seenPages = new Set<string>()

    while (queue.length && seenPages.size < MAX_PAGES_PER_SOURCE) {
      const pageUrl = queue.shift()

      if (!pageUrl || seenPages.has(pageUrl)) continue
      if (!sameDomain(source.source_url, pageUrl)) continue
      if (isJunkUrl(pageUrl)) continue

      seenPages.add(pageUrl)
      checkedPages++

      const html = await fetchHtml(pageUrl)

      if (!html) {
        failed++
        timedOutOrEmpty++
        continue
      }

      try {
        const pageImage = extractBestImage(html, pageUrl)

        if (pageImage) {
          const venueImageResult = await updateVenueImageIfEmpty(
            source.venue_id,
            pageImage
          )

          if (venueImageResult.updated) venueImagesUpdated++
        }

        const pageText = cleanText(html).slice(0, 8000)
        const jsonLdEvents = extractJsonLdEvents(html, pageUrl)
        const calendarLinks = extractCalendarEventLinks(html, pageUrl)
        const links = extractLinks(html, pageUrl)

        for (const event of jsonLdEvents) {
          candidatesFound++

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: event.name,
            event_date: event.date || extractDate(`${event.name} ${event.description}`),
            start_time: event.start_time || extractTime(`${event.name} ${event.description}`),
            description: event.description || event.name,
            ticket_url: event.url || pageUrl,
            image_url: event.image_url || pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(event.name),
              event_date: event.date,
              event_url: event.url || pageUrl,
              image_url: event.image_url || pageImage,
              method: 'json-ld',
            })
          }
        }

        for (const calendarEvent of calendarLinks) {
          candidatesFound++

          let eventHtml: string | null = null
          let title = calendarEvent.text
          let description = calendarEvent.text
          let imageUrl = pageImage
          let eventDate = calendarEvent.event_date
          let startTime = extractTime(calendarEvent.raw)

          if (sameDomain(source.source_url, calendarEvent.href)) {
            eventHtml = await fetchHtml(calendarEvent.href)

            if (eventHtml) {
              title = extractPageTitle(eventHtml) || title
              description = extractMetaDescription(eventHtml) || cleanText(eventHtml).slice(0, 300)
              imageUrl = extractBestImage(eventHtml, calendarEvent.href) || pageImage
              eventDate = eventDate || extractDateFromHtml(eventHtml)
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))
            }
          }

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: calendarEvent.href,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: eventDate,
              event_url: calendarEvent.href,
              image_url: imageUrl,
              method: 'calendar-link',
            })
          }
        }

        for (const link of links) {
          const combined = `${link.href} ${link.text} ${link.raw}`

          if (
            sameDomain(source.source_url, link.href) &&
            looksLikeUsefulPage(combined) &&
            !isJunkUrl(link.href) &&
            !seenPages.has(link.href) &&
            !queue.includes(link.href) &&
            queue.length + seenPages.size < MAX_PAGES_PER_SOURCE
          ) {
            queue.push(link.href)
          }

          if (!looksLikeEvent(combined)) {
            skipped++
            continue
          }

          if (isJunkUrl(link.href)) {
            skipped++
            continue
          }

          const eventName = cleanEventName(link.text)

          if (isJunkTitle(eventName)) {
            skipped++
            continue
          }

          let eventHtml: string | null = null
          let imageUrl = pageImage
          let description = link.text
          let eventDate = extractDate(`${link.text} ${link.href}`)
          let startTime = extractTime(`${link.text} ${pageText}`)

          if (sameDomain(source.source_url, link.href)) {
            eventHtml = await fetchHtml(link.href)

            if (eventHtml) {
              const detailTitle = extractPageTitle(eventHtml)
              const detailDescription = extractMetaDescription(eventHtml)
              const detailDate = extractDateFromHtml(eventHtml)

              imageUrl = extractBestImage(eventHtml, link.href) || pageImage
              description = detailDescription || description
              eventDate = eventDate || detailDate
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))

              if (detailTitle && !isJunkTitle(detailTitle)) {
                description = detailDescription || description
              }
            }
          }

          candidatesFound++

          const dedupeKey = eventDedupeKey(source.venue_id, eventName, eventDate, link.href)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: eventName,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: link.href,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else {
            failed++
            if (errors.length < 20) {
              errors.push({
                venue_id: source.venue_id,
                event_name: eventName,
                event_url: link.href,
                error: result.error?.message,
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: eventName,
              event_date: eventDate,
              event_url: link.href,
              image_url: imageUrl,
              method: 'link-scan',
            })
          }
        }
      } catch (err: any) {
        failed++

        if (errors.length < 20) {
          errors.push({
            venue_id: source.venue_id,
            source_url: pageUrl,
            error: err?.message || 'Unknown scrape error',
          })
        }
      }
    }

    console.log('SOURCE DONE:', source.source_url)
  }

  return Response.json({
    message: 'Scrape finished',
    runtime_seconds: Math.round((Date.now() - startedAt) / 1000),
    limits: {
      max_sources: MAX_SOURCES,
      max_pages_per_source: MAX_PAGES_PER_SOURCE,
      fetch_timeout_ms: FETCH_TIMEOUT_MS,
    },
    checked_sources: sources?.length || 0,
    checked_pages: checkedPages,
    candidates_found: candidatesFound,
    events_created: created,
    events_updated: updated,
    venue_images_updated: venueImagesUpdated,
    skipped,
    failed,
    timedOutOrEmpty,
    found,
    errors,
  })
}