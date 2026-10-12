type OfficialEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: string
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function plainText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39|lt|gt);/gi, (value) => ({
      '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>',
    })[value.toLowerCase()] || value)
    .replace(/\s+/g, ' ').trim()
}

function datedHeading(value: string, today: string) {
  const match = plainText(value).match(/(?:(?:mon|tues|wednes|thurs|fri|satur|sun)day\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?\b/i)
  if (!match || (match.index || 0) > 100) return null
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()]
  if (!month) return null
  const currentYear = Number(today.slice(0, 4))
  const year = match[3] ? Number(match[3]) : currentYear
  const date = `${year}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}`
  const parsed = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null
  // Undated years are ambiguous. Do not guess that a past listing is next year's event.
  if (date < today || date > new Date(Date.parse(`${today}T12:00:00Z`) + 120 * 86400000).toISOString().slice(0, 10)) return null
  return date
}

function timeFromText(value: string) {
  const match = plainText(value).match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i)
  if (!match) return null
  const hour = (Number(match[1]) % 12) + (match[3].toLowerCase() === 'pm' ? 12 : 0)
  return `${String(hour).padStart(2, '0')}:${match[2] || '00'}`
}

function calendarKind(venueId: string, pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '')
    if (venueId === 'jaydees_colmworth_bedfordshire' && host === 'jaydeesclub.com' && path === '/events') return 'jaydees'
    if (venueId === 'the_private_club_birmingham_birmingham' && host === 'theprivateclub.com' && path === '/gangbang-party-birmingham') return 'private-club'
  } catch { /* Invalid URL. */ }
  return null
}

export function isOfficialHeadingCalendar(venueId: string, pageUrl: string) {
  return calendarKind(venueId, pageUrl) !== null
}

export function parseOfficialHeadingCalendar(html: string, venueId: string, pageUrl: string, today: string): OfficialEvent[] {
  const kind = calendarKind(venueId, pageUrl)
  if (!kind) return []
  const headings = [...html.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
  const events: OfficialEvent[] = []
  const seen = new Set<string>()
  for (let index = 0; index < headings.length && events.length < 40; index++) {
    const heading = plainText(headings[index][2])
    // WordPress image tags can exceed 1,500 characters. Strip complete markup
    // before limiting the text, or a truncated <img>/<section> becomes a title.
    const body = html.slice((headings[index].index || 0) + headings[index][0].length,
      headings[index + 1]?.index || html.length)
    const bodyText = plainText(body).slice(0, 1500)
    const date = kind === 'jaydees' ? datedHeading(bodyText.slice(0, 140), today) : datedHeading(heading, today)
    if (!date) continue
    const title = kind === 'jaydees' ? heading : bodyText.split(/[.!?]/)[0].trim().slice(0, 96)
    if (title.length < 6 || /^(?:book|apply|contact|learn more|events|this month)/i.test(title)) continue
    const key = `${date}|${title.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    events.push({
      href: `${pageUrl.split('#')[0]}#${encodeURIComponent(`${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}`,
      text: title, event_date: date, start_time: timeFromText(body),
      raw: bodyText.slice(0, 400), image_url: null, method: `${kind}-heading-calendar`,
    })
  }
  return events
}

// Rank only navigation to an official calendar on the same host. An event's
// detail link or a similar venue's external calendar must never be auto-added.
export function officialCalendarNavigation(html: string, pageUrl: string): string[] {
  let base: URL
  try { base = new URL(pageUrl) } catch { return [] }
  const results: string[] = []
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL
    try { url = new URL(match[1].replace(/&amp;/g, '&'), base) } catch { continue }
    if (url.origin !== base.origin || !/^https?:$/.test(url.protocol)) continue
    const path = url.pathname.replace(/\/+$/, '').toLowerCase()
    if (!/^\/(?:events?|event-calendar|calendar|diary|whats-on|whatson|party-calendar|party-dates|dates)(?:\/)?$/.test(path)) continue
    if (!/\b(?:events?|calendar|diary|what'?s on|parties|dates)\b/i.test(plainText(match[2]))) continue
    url.hash = ''
    url.search = ''
    if (url.href !== base.href && !results.includes(url.href)) results.push(url.href)
    if (results.length === 2) break
  }
  return results
}
