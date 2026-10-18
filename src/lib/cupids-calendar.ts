const months: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

export const CUPIDS_CALENDAR_URL = 'https://cupidsswingersclub.co.uk/events/'

function plain(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ').replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex: string, decimal: string) => {
      const code = parseInt(hex || decimal, hex ? 16 : 10)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
    }).replace(/\s+/g, ' ').trim()
}

function realDate(value: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function cupidsCanonicalDetailUrl(value: string) {
  try {
    const url = new URL(plain(value))
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
        url.hostname.replace(/^www\./, '') !== 'cupidsswingersclub.co.uk' ||
        url.pathname.replace(/\/+$/, '') !== '/events' ||
        [...url.searchParams.keys()].length !== 1 || !/^[1-9]\d*$/.test(url.searchParams.get('event') || '')) return null
    return `${CUPIDS_CALENDAR_URL}?event=${url.searchParams.get('event')}`
  } catch { return null }
}

// MOTD is a published event name, not page chrome. Keep its short-title
// exception bound to this venue, a real date and the official numeric detail URL.
export function isVerifiedCupidsShortTitle(input: {
  venue_id: string; event_name: string; event_date: string | null; ticket_url: string
}) {
  return input.venue_id === 'cupids_health_club_swinton_manchester' &&
    input.event_name.trim() === 'MOTD' && Boolean(input.event_date && realDate(input.event_date)) &&
    Boolean(cupidsCanonicalDetailUrl(input.ticket_url))
}

type CupidsEvent = { href: string; text: string; event_date: string; start_time: string | null;
  raw: string; image_url: null; method: string }

/** Read explicit dates, titles, URLs and local start times from the same current
 * WordPress card. No detail-page fan-out, recurrence projection or year inference.
 */
export function parseCupidsCalendar(html: string, pageUrl: string, today: string): CupidsEvent[] {
  try {
    const page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.username || page.password || page.port || page.search || page.hash ||
        page.hostname.replace(/^www\./, '') !== 'cupidsswingersclub.co.uk' ||
        page.pathname.replace(/\/+$/, '') !== '/events' || !realDate(today)) return []
  } catch { return [] }
  const lastDay = new Date(Date.parse(`${today}T12:00:00Z`) + 120 * 86400000).toISOString().slice(0, 10)
  const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  const events = new Map<string, CupidsEvent>()
  const shortDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London',
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  for (const match of rendered.matchAll(/<article\b(?=[^>]*\bdata-cpef-event-card\b)(?=[^>]*\bdata-event-date=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/article>/gi)) {
    const eventDate = match[1]
    if (!realDate(eventDate) || eventDate < today || eventDate > lastDay) continue
    const card = match[2]
    const anchor = card.match(/<a\b(?=[^>]*\bclass=["'][^"']*\bcpef-card-link\b[^"']*["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i)
    let href: string | null = null
    try {
      if (anchor) href = cupidsCanonicalDetailUrl(new URL(plain(anchor[1]), pageUrl).href)
    } catch { /* Ignore malformed card URLs. */ }
    const title = plain(card.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || '')
    const row = card.match(/<div\b[^>]*class=["'][^"']*\bcpef-card-date-row\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || ''
    const time = row.match(/<time\b[^>]*datetime=["']([^"']+)["'][^>]*>([\s\S]*?)<\/time>/i)
    if (!href || !title || title.length > 150 || (title.length < 6 && title !== 'MOTD') ||
        /^(?:cancelled\b|closed\b|view event$)/i.test(title) || !time || time[1] !== eventDate ||
        plain(time[2]) !== shortDate.format(new Date(`${eventDate}T12:00:00Z`)).replace(/,/g, '')) continue
    const timeText = plain(row.match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
    const start = timeText.match(/^(\d{1,2}):([0-5]\d)\s*(am|pm)\s*[–—-]/i)
    const hour = start ? Number(start[1]) : 0
    const startTime = start && hour >= 1 && hour <= 12
      ? `${String(hour % 12 + (start[3].toLowerCase() === 'pm' ? 12 : 0)).padStart(2, '0')}:${start[2]}` : null
    const event = { href, text: title, event_date: eventDate, start_time: startTime,
      raw: `${title}. Official Cupids Swingers Club event listing for ${eventDate}.`,
      image_url: null, method: 'cupids-official-calendar-card' }
    // Conflicting duplicates are not evidence for a preferred title or time.
    const previous = events.get(href)
    if (previous && JSON.stringify(previous) !== JSON.stringify(event)) return []
    events.set(href, event)
  }
  return [...events.values()].sort((a, b) => a.event_date.localeCompare(b.event_date))
}

// The current Cupids calendar links to /events/?event=<id>, not /events/<slug>.
export function cupidsEventDetailLinks(html: string, pageUrl: string) {
  const links = new Set<string>()
  const anchors = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = anchors.exec(html)) !== null) {
    try {
      const url = new URL(match[1].replace(/&amp;/gi, '&'), pageUrl)
      if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'cupidsswingersclub.co.uk' ||
          url.pathname.replace(/\/+$/, '') !== '/events' ||
          !/^\d+$/.test(url.searchParams.get('event') || '')) continue
      url.hash = ''
      links.add(url.href)
    } catch {
      // Ignore malformed links on the official listing.
    }
  }
  return [...links]
}

export function cupidsDetailDate(html: string) {
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
  // Use the start date after "Date"; the next date can be an overnight end date.
  const match = text.match(/\bDate\s*(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+)?(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d{2})\b/i)
  if (!match) return null
  const month = months[match[2].slice(0, 3).toLowerCase()]
  if (!month) return null
  const date = `${match[3]}-${month}-${match[1].padStart(2, '0')}`
  const parsed = new Date(`${date}T12:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date : null
}
