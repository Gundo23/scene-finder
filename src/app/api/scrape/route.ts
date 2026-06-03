import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SOURCES = 80
const MAX_PAGES_PER_SOURCE = 3
const MAX_EVENTS_RETURNED = 100
const FETCH_TIMEOUT_MS = 10000

const EVENT_KEYWORDS = [
  'event',
  'events',
  'ticket',
  'tickets',
  'book',
  'booking',
  'party',
  'club night',
  'night',
  'social',
  'munch',
  'calendar',
  'whats-on',
  'whatson',
  'workshop',
  'meet',
  'play',
  'fetish',
  'kink',
  'swing',
  'swingers',
  'party night',
]

const PAGE_HINTS = [
  '/events',
  '/event',
  '/calendar',
  '/whats-on',
  '/whatson',
  '/tickets',
  '/book',
  '/booking',
  '?tribe-bar-date=',
  '?eventDisplay=',
]

function cleanText(value: string | null | undefined) {
  if (!value) return ''

  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
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
    href.startsWith('javascript:')
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
    return new URL(a).hostname.replace(/^www\./, '') === new URL(b).hostname.replace(/^www\./, '')
  } catch {
    return false
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

function cleanEventName(title: string) {
  let cleaned = cleanText(title)
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

function extractMetaImage(html: string, baseUrl: string) {
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

  if (og) return absoluteUrl(baseUrl, og)

  const twitter =
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]

  if (twitter) return absoluteUrl(baseUrl, twitter)

  return null
}

function extractFirstImage(html: string, baseUrl: string) {
  const image =
    html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
    html.match(/<img[^>]+data-src=["']([^"']+)["']/i)?.[1]

  return absoluteUrl(baseUrl, image)
}

function extractLinks(html: string, baseUrl: string) {
  const links: { href: string; text: string }[] = []
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match

  while ((match = regex.exec(html)) !== null) {
    const href = absoluteUrl(baseUrl, match[1])
    const text = cleanText(match[2])

    if (!href) continue

    links.push({ href, text })
  }

  return links
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
                ? absoluteUrl(baseUrl, node.image[0])
                : absoluteUrl(baseUrl, node.image),
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

async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    console.log('SCRAPING:', url)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SceneFinderBot/3.0; +https://scene-finder.local)',
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
  const normalised = normalizeTitle(input.event_name)

  const { data: existingByUrl } = await supabaseAdmin
    .from('events')
    .select('event_id')
    .eq('venue_id', input.venue_id)
    .eq('ticket_url', input.ticket_url)
    .maybeSingle()

  if (existingByUrl) {
    const { error } = await supabaseAdmin
      .from('events')
      .update({
        event_name: input.event_name,
        event_date: input.event_date,
        start_time: input.start_time,
        description: input.description,
        image_url: input.image_url,
        source_url: input.source_url,
        status: 'published',
      })
      .eq('event_id', existingByUrl.event_id)

    return { action: error ? 'error' : 'updated', error }
  }

  if (input.event_date) {
    const { data: existingByTitleDate } = await supabaseAdmin
      .from('events')
      .select('event_id, event_name')
      .eq('venue_id', input.venue_id)
      .eq('event_date', input.event_date)

    const duplicate = existingByTitleDate?.find(
      (event) => normalizeTitle(event.event_name) === normalised
    )

    if (duplicate) {
      const { error } = await supabaseAdmin
        .from('events')
        .update({
          ticket_url: input.ticket_url,
          description: input.description,
          image_url: input.image_url,
          source_url: input.source_url,
          status: 'published',
        })
        .eq('event_id', duplicate.event_id)

      return { action: error ? 'error' : 'updated', error }
    }
  }

  const { error } = await supabaseAdmin.from('events').insert({
    venue_id: input.venue_id,
    event_name: input.event_name,
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

  const found: any[] = []
  const errors: any[] = []

  for (const source of sources || []) {
    console.log('SOURCE START:', source.source_url)

    const queue = [source.source_url]
    const seenPages = new Set<string>()

    while (queue.length && seenPages.size < MAX_PAGES_PER_SOURCE) {
      const pageUrl = queue.shift()

      if (!pageUrl || seenPages.has(pageUrl)) continue
      if (!sameDomain(source.source_url, pageUrl)) continue

      seenPages.add(pageUrl)
      checkedPages++

      const html = await fetchHtml(pageUrl)

      if (!html) {
        failed++
        timedOutOrEmpty++
        continue
      }

      try {
        const pageImage = extractMetaImage(html, pageUrl) || extractFirstImage(html, pageUrl)
        const pageText = cleanText(html).slice(0, 5000)
        const jsonLdEvents = extractJsonLdEvents(html, pageUrl)

        for (const event of jsonLdEvents) {
          if (!event.name || event.name.length < 3) continue

          candidatesFound++

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: cleanEventName(event.name),
            event_date: event.date || extractDate(`${event.name} ${event.description}`),
            start_time: event.start_time || extractTime(`${event.name} ${event.description}`),
            description: event.description || event.name,
            ticket_url: event.url || pageUrl,
            image_url: event.image_url || pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else {
            failed++
            if (errors.length < 20) {
              errors.push({
                venue_id: source.venue_id,
                url: event.url || pageUrl,
                error: result.error?.message,
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED) {
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

        const links = extractLinks(html, pageUrl)

        for (const link of links) {
          const combined = `${link.href} ${link.text}`

          if (
            sameDomain(source.source_url, link.href) &&
            looksLikeUsefulPage(combined) &&
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

          const eventName = cleanEventName(link.text)
          const eventDate = extractDate(`${link.text} ${link.href}`)
          const startTime = extractTime(`${link.text} ${pageText}`)

          if (!eventName || eventName.length < 4 || eventName.toLowerCase() === 'events') {
            skipped++
            continue
          }

          candidatesFound++

          let eventHtml: string | null = null
          let imageUrl = pageImage
          let description = link.text

          if (sameDomain(source.source_url, link.href)) {
            eventHtml = await fetchHtml(link.href)

            if (eventHtml) {
              imageUrl =
                extractMetaImage(eventHtml, link.href) ||
                extractFirstImage(eventHtml, link.href) ||
                pageImage

              description = cleanText(
                eventHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
                  ?.[1] || link.text
              )
            }
          }

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: eventName,
            event_date: eventDate || extractDate(eventHtml || pageText),
            start_time: startTime,
            description,
            ticket_url: link.href,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
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

          if (found.length < MAX_EVENTS_RETURNED) {
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
    skipped,
    failed,
    timedOutOrEmpty,
    found,
    errors,
  })
}