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
  if (new URL(canonical).pathname.replace(/\/+$/, '') === '/what-s-on-at-decadance') {
    return parseDecadanceDatedProgramme(html, canonical, today)
  }
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

/** Read explicit calendar cards; do not expand the weekly programme by recurrence. */
export function parseDecadanceDatedProgramme(html: string, pageUrl: string, today: string) {
  const base = canonicalUrl(pageUrl)
  if (!base || new URL(base).pathname.replace(/\/+$/, '') !== '/what-s-on-at-decadance' ||
      !/^20\d{2}-\d{2}-\d{2}$/.test(today)) return []
  const now = new Date(`${today}T12:00:00Z`)
  if (!Number.isFinite(now.getTime()) || now.toISOString().slice(0, 10) !== today) return []
  const page = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, '')
  const text = visibleText(page)
  if (!/\bDECADANCE\b/i.test(text) || !/\bRochdale\b/i.test(text)) return []
  const year = Number(text.match(/Copyright\s*(?:©|&copy;|&#169;)\s*(20\d{2})\s+Decadance/i)?.[1])
  if (year !== now.getUTCFullYear()) return []
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const programmes: Record<string, { title: string; day: number }> = {
    '/new-regular-weekly-lineup/monday-funday': { title: 'Monday Funday', day: 1 },
    '/what-s-on-at-decadance/regular-weekly-lineup/midweek-at-the-madhouse': { title: 'Midweek at the Madhouse', day: 3 },
    '/new-regular-weekly-lineup/sexxxy-saturday': { title: 'SeXXXy Saturday', day: 6 },
    '/what-s-on-at-decadance/regular-weekly-lineup/sunday-sunday-service': { title: 'Sunday Service', day: 0 },
  }
  const headings = [...page.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
  const seen = new Set<string>()
  const events = []
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    const label = visibleText(heading[1]).match(/^(\d{1,2})(?:st|nd|rd|th)\s+([a-z]+)$/i)
    if (!label) continue
    const month = months.indexOf(label[2].toLowerCase()) + 1
    const date = month && isoDate(year, month, Number(label[1]))
    if (!date || date < today || new Date(`${date}T12:00:00Z`).getTime() - now.getTime() > 90 * 86400000) continue
    const block = page.slice(heading.index! + heading[0].length, headings[i + 1]?.index ?? page.length)
    if (/\b(?:closed|cancelled|canceled|postponed|TBC)\b/i.test(visibleText(block))) continue
    const links = [...block.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
      .map(match => canonicalUrl(match[1], base)).filter((url): url is string => Boolean(url))
    // A published special owns its date; preserve the existing detail parser.
    if (links.some(url => new URL(url).pathname.includes('/events-coming-soon/'))) continue
    const candidates = [...new Set(links)].filter(url => programmes[new URL(url).pathname.replace(/\/+$/, '')])
    if (candidates.length !== 1) continue
    const programme = programmes[new URL(candidates[0]).pathname.replace(/\/+$/, '')]
    if (new Date(`${date}T12:00:00Z`).getUTCDay() !== programme.day || seen.has(date)) continue
    seen.add(date)
    events.push({ href: base, text: programme.title, event_date: date, start_time: null,
      raw: `${programme.title}. Official Decadance Rochdale calendar for ${date}.`,
      image_url: null, method: 'decadance-dated-programme' })
  }
  return events
}
