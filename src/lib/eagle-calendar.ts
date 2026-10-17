export const EAGLE_CALENDAR_URL = 'https://www.eaglelondon.com/'

// This is the official event name, not an accidentally captured start time.
export function isEagleNumericTitle(value: string) {
  return value.trim() === '80:20'
}

export function isVerifiedEagleNumericTitle(input: {
  venue_id: string; event_name: string; event_date: string | null; ticket_url: string
}) {
  if (input.venue_id !== 'eagle_london_london' || !isEagleNumericTitle(input.event_name) ||
      !input.event_date || !/^20\d{2}-\d{2}-\d{2}$/.test(input.event_date)) return false
  const date = new Date(`${input.event_date}T12:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== input.event_date) return false
  try {
    const url = new URL(input.ticket_url)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      url.hostname.replace(/^www\./, '') === 'eaglelondon.com' && !url.search && !url.hash &&
      /^\/event-details\/80-20-\d+\/?$/.test(url.pathname)
  } catch { return false }
}

type RecordValue = Record<string, unknown>
type EagleEvent = { href: string; text: string; event_date: string; start_time: string; raw: string }
const record = (value: unknown): value is RecordValue => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function plain(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex: string, decimal: string) => {
      const code = parseInt(hex || decimal, hex ? 16 : 10)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
    }).replace(/\s+/g, ' ').trim()
}

function officialDetail(value: string, page: URL) {
  try {
    const url = new URL(plain(value), page)
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        url.hostname.replace(/^www\./, '') !== 'eaglelondon.com' || url.search || url.hash ||
        !/^\/event-details\/[a-z0-9][a-z0-9-]*\/?$/i.test(url.pathname)) return null
    return `https://www.eaglelondon.com${url.pathname.replace(/\/+$/, '')}`
  } catch { return null }
}

/** Pair Wix's explicit event timestamps with the same visible first-party card.
 * No recurrence projection, year inference, arbitrary object traversal or JS execution.
 */
export function parseEagleCalendar(html: string, pageUrl: string, today: string): EagleEvent[] {
  let page: URL
  try {
    page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.username || page.password || page.port ||
        page.hostname.replace(/^www\./, '') !== 'eaglelondon.com' ||
        page.pathname.replace(/\/+$/, '') !== '') return []
  } catch { return [] }
  const start = new Date(`${today}T00:00:00Z`)
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today) || Number.isNaN(start.getTime()) ||
      start.toISOString().slice(0, 10) !== today) return []
  const lastDay = new Date(start.getTime() + 120 * 86400000).toISOString().slice(0, 10)
  const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const cards = new Map<string, { title: string; date: string }>()
  for (const card of rendered.matchAll(/<li\b[^>]*\bdata-hook=["']events-card["'][^>]*>([\s\S]*?)<\/li>/gi)) {
    const title = card[1].match(/<a\b(?=[^>]*\bdata-hook=["']title["'])(?=[^>]*\shref=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/a>/i)
    const date = card[1].match(/<[^>]*\bdata-hook=["']short-date["'][^>]*>([\s\S]*?)<\//i)
    if (!title || !date) continue
    const href = officialDetail(title[1], page)
    if (href) cards.set(href, { title: plain(title[2]), date: plain(date[1]) })
  }
  const local = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const shortDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London',
    weekday: 'short', day: '2-digit', month: 'short' })
  const events = new Map<string, EagleEvent>()
  for (const script of html.matchAll(/<script\b(?=[^>]*\btype=["']application\/json["'])(?=[^>]*\bid=["']wix-warmup-data["'])[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: unknown
    try { data = JSON.parse(script[1]) } catch { continue }
    if (!record(data) || !record(data.appsWarmupData)) continue
    for (const app of Object.values(data.appsWarmupData)) {
      if (!record(app)) continue
      for (const widget of Object.values(app)) {
        if (!record(widget) || !record(widget.events) || !Array.isArray(widget.events.events)) continue
        for (const event of widget.events.events.slice(0, 200)) {
          if (!record(event) || event.status !== 0 || typeof event.publishedDate !== 'string' ||
              !Number.isFinite(Date.parse(event.publishedDate)) || typeof event.title !== 'string' ||
              typeof event.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(event.slug) ||
              !record(event.scheduling) || !record(event.scheduling.config)) continue
          const schedule = event.scheduling.config
          if (schedule.scheduleTbd !== false || schedule.timeZoneId !== 'Europe/London' ||
              typeof schedule.startDate !== 'string' || !/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(schedule.startDate)) continue
          const date = new Date(schedule.startDate)
          if (Number.isNaN(date.getTime()) || date.toISOString() !== schedule.startDate) continue
          const href = officialDetail(`/event-details/${event.slug}`, page)
          const card = href ? cards.get(href) : null
          const title = plain(event.title)
          if (!href || !card || title !== card.title || title.length < 3 || title.length > 150 ||
              /^(?:cancelled\b|closed\b|our nights$|clear all$)/i.test(title) ||
              card.date !== shortDate.format(date)) continue
          const parts = Object.fromEntries(local.formatToParts(date).map(({ type, value }) => [type, value]))
          const eventDate = `${parts.year}-${parts.month}-${parts.day}`
          if (eventDate < today || eventDate > lastDay) continue
          events.set(href, { href, text: title, event_date: eventDate,
            start_time: `${parts.hour}:${parts.minute}`, raw: `${title}. Official Eagle London event listing.` })
        }
      }
    }
  }
  return [...events.values()].sort((a, b) => a.event_date.localeCompare(b.event_date))
}
