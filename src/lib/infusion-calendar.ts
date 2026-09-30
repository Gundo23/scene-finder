const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]
const weekdayNumbers: Record<string, number> = {
  sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3, thu: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5, sat: 6, saturday: 6,
}

export type InfusionEvent = {
  href: string
  text: string
  event_date: string
  start_time: null
  raw: string
  image_url: null
  method: string
}

function decodeText(value: string) {
  return value
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex: string, decimal: string) => {
      const code = Number.parseInt(hex || decimal, hex ? 16 : 10)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
    })
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/gi, (entity) => ({
      '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'",
      '&lt;': '<', '&gt;': '>',
    })[entity.toLowerCase()] || ' ')
    .replace(/\s+/g, ' ').trim()
}

function monthAndYear(pageUrl: string, today: string) {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'infusionblackpool.co.uk') return null
    const match = url.pathname.match(/^\/events\/([a-z]+)\/?$/i)
    const month = match ? months.indexOf(match[1].toLowerCase()) : -1
    if (month < 0) return null
    const currentYear = Number(today.slice(0, 4))
    const currentMonth = Number(today.slice(5, 7)) - 1
    const distance = (month - currentMonth + 12) % 12
    if (distance > 3) return null
    return { month, year: currentYear + (month < currentMonth ? 1 : 0) }
  } catch { return null }
}

export function infusionMonthLinks(html: string, baseUrl: string, today: string) {
  const links = new Set<string>()
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    try {
      const url = new URL(decodeText(match[2]), baseUrl)
      if (monthAndYear(url.href, today)) links.add(url.href)
    } catch { /* Ignore malformed or off-site navigation. */ }
  }
  return [...links].sort()
}

function eventLines(html: string) {
  const blocks = html
    .replace(/<(?:script|style|svg)\b[^>]*>[\s\S]*?<\/\s*(?:script|style|svg)\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(?:h[1-6]|p|div|li|span|section|article)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return blocks.split(/\n/).map(decodeText).filter(Boolean)
}

function cleanTitle(value: string) {
  return value
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .replace(/\s+[—–-]\s+(?:MON(?:DAY)?|TUES?(?:DAY)?|WEDS?(?:NESDAY)?|THURS?(?:DAY)?|FRI(?:DAY)?|SAT(?:URDAY)?|SUN(?:DAY)?)\s+\d{1,2}(?:ST|ND|RD|TH)?\s+[A-Z]+$/i, '')
    .replace(/^BEHIND THE WALL\s*-\s*/i, 'BEHIND THE WALL - ')
    .replace(/^SEDUCTION SATURDAY\s+LACE/i, 'SEDUCTION SATURDAY: LACE')
    .replace(/\s+/g, ' ').trim()
}

export function parseInfusionMonth(html: string, pageUrl: string, today: string): InfusionEvent[] {
  const calendar = monthAndYear(pageUrl, today)
  if (!calendar) return []
  const lines = eventLines(html)
  const results: InfusionEvent[] = []
  const seen = new Set<string>()
  for (let i = 0; i < lines.length - 2; i++) {
    const weekday = weekdayNumbers[lines[i].toLowerCase()]
    if (weekday === undefined) continue
    const dayMatch = lines[i + 1].match(/^(\d{1,2})(?:st|nd|rd|th)$/i)
    if (!dayMatch) continue
    const date = new Date(Date.UTC(calendar.year, calendar.month, Number(dayMatch[1])))
    if (date.getUTCMonth() !== calendar.month || date.getUTCDay() !== weekday) continue
    const eventDate = date.toISOString().slice(0, 10)
    if (eventDate < today) continue
    const title = cleanTitle(lines[i + 2])
    if (!title || title.length < 4 || title.length > 150 || weekdayNumbers[title.toLowerCase()] !== undefined) continue
    const description = lines[i + 3] || ''
    // The October 23 listing calls itself Friday while its description says
    // "This Saturday". Hold contradictory source dates rather than guessing.
    const describedDay = description.match(/\bthis\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i)?.[1]
    if (describedDay && weekdayNumbers[describedDay.toLowerCase()] !== weekday) continue
    const key = `${eventDate}|${title.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({ href: pageUrl, text: title, event_date: eventDate, start_time: null,
      raw: description ? `${title}. ${description}` : title, image_url: null,
      method: 'infusion-monthly-calendar' })
  }
  return results
}
