export const DECADANCE_CALENDAR_URL = 'https://www.decadanceswingersclub.com/what-s-on-at-decadance'

const HOST = 'decadanceswingersclub.com'
const EVENT_PATH = /^\/what-s-on-at-decadance\/events-coming-soon\/(\d{1,2})-(\d{1,2})-([a-z0-9-]+)\/?$/i

function canonicalUrl(value: string, base = DECADANCE_CALENDAR_URL) {
  try {
    const url = new URL(value, base)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '').toLowerCase() !== HOST) return null
    url.hash = ''
    return url.toString()
  } catch { return null }
}

function visibleText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date.toISOString().slice(0, 10)
}

function eventDate(day: number, month: number, text: string, today: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today)) return null
  const todayDate = new Date(`${today}T12:00:00Z`)
  if (!Number.isFinite(todayDate.getTime()) || todayDate.toISOString().slice(0, 10) !== today) return null
  const yearMatch = text.match(new RegExp(`\\b${day}(?:st|nd|rd|th)?\\s+[A-Za-z]+\\s+(20\\d{2})\\b`, 'i'))
  const year = yearMatch ? Number(yearMatch[1]) : todayDate.getUTCFullYear()
  const result = isoDate(year, month, day)
  if (!result) return null
  const event = new Date(`${result}T12:00:00Z`)
  if (event.getTime() - todayDate.getTime() > 370 * 86400000 || event < todayDate) return null
  return result
}

function startTime(text: string) {
  const match = text.match(/(?:from|time\s*:?|\b)(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2] || '0')
  if (hour < 1 || hour > 12 || minute > 59) return null
  if (match[3].toLowerCase() === 'pm' && hour !== 12) hour += 12
  if (match[3].toLowerCase() === 'am' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function titleFromPage(html: string, slug: string) {
  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
  const title = visibleText(titleTag).split(/\s+\/\s+Events Coming Soon/i)[0]
    .replace(/^\s*\d{1,2}\s*[/-]\s*\d{1,2}\s*/i, '').trim()
  if (title.length >= 5) return title
  return slug.split('-').filter(Boolean).map(word =>
    word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)
  ).join(' ')
}

export function isDecadanceSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  if (venueId === 'decadance_rochdale_greater_manchester') return true
  try { return new URL(sourceUrl || '').hostname.replace(/^www\./, '').toLowerCase() === HOST }
  catch { return false }
}

export function decadanceCandidatePatternText(input: {
  venueId: string | null | undefined
  ticketUrl: string | null | undefined
  eventDate: string | null | undefined
  eventName: string | null | undefined
  description: string | null | undefined
}) {
  const combined = `${input.eventName || ''} ${input.description || ''} ${input.ticketUrl || ''}`
  if (input.venueId !== 'decadance_rochdale_greater_manchester' || !input.eventDate) return combined

  const canonical = canonicalUrl(input.ticketUrl || '')
  if (!canonical || !EVENT_PATH.test(new URL(canonical).pathname)) return combined

  // Decadance's page shell places navigation text (for example "Contact Us"
  // and "Private Hire") ahead of the event copy. The global junk filter must
  // still inspect the verified event title, but not that unrelated page shell.
  return input.eventName || ''
}

export function decadanceEventLinks(html: string, pageUrl: string, today: string) {
  const base = canonicalUrl(pageUrl)
  if (!base || new URL(base).pathname.replace(/\/+$/, '') !== '/what-s-on-at-decadance') return []
  const text = visibleText(html)
  if (!/\bDECADANCE\b/i.test(text) || !/\bRochdale\b/i.test(text)) return []
  const links = new Set<string>()
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const url = canonicalUrl(match[1], base)
    if (!url) continue
    const parsed = new URL(url)
    const event = parsed.pathname.match(EVENT_PATH)
    if (!event || !eventDate(Number(event[1]), Number(event[2]), text, today)) continue
    links.add(url)
  }
  return [...links]
}

export function parseDecadanceEvent(html: string, pageUrl: string, today: string) {
  const canonical = canonicalUrl(pageUrl)
  if (!canonical) return []
  const match = new URL(canonical).pathname.match(EVENT_PATH)
  if (!match) return []
  const text = visibleText(html)
  if (!/\bDECADANCE\b/i.test(text) || !/\bRochdale\b/i.test(text) ||
      /\b(?:cancelled|canceled|event cancelled|event canceled)\b/i.test(text)) return []
  const date = eventDate(Number(match[1]), Number(match[2]), text, today)
  if (!date) return []
  const title = titleFromPage(html, match[3])
  if (!title || /^(?:Events Coming Soon|What's on at DECADANCE)$/i.test(title)) return []
  return [{
    href: canonical, text: title, event_date: date, start_time: startTime(text),
    raw: text.slice(0, 500), image_url: null, method: 'decadance-official-detail',
  }]
}
