export type BacchusEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: string
}

const months = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december']
const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function plain(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#0?38;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'").replace(/\s+/g, ' ').trim()
}

/** Month heading + weekday/day + event heading, without a description-length limit. */
export function parseBacchusCalendar(html: string, pageUrl: string, today: string): BacchusEvent[] {
  let url: URL
  try {
    url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'clubbacchusdundee.uk' ||
        url.pathname.replace(/\/+$/, '') !== '/events') return []
  } catch { return [] }
  const todayDate = new Date(`${today}T12:00:00Z`)
  if (!Number.isFinite(todayDate.getTime()) || todayDate.toISOString().slice(0, 10) !== today) return []
  const rendered = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const headings = [...rendered.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
  const events: BacchusEvent[] = []
  const seen = new Set<string>()
  let month = 0
  let year = Number(today.slice(0, 4))

  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index]
    const titleWithTime = plain(heading[2])
    if (heading[1] === '2') {
      const monthHeading = titleWithTime.match(/^([a-z]+)(?:\s+(20\d{2}))?$/i)
      month = monthHeading ? months.indexOf(monthHeading[1].toLowerCase()) + 1 : 0
      year = monthHeading?.[2] ? Number(monthHeading[2]) : Number(today.slice(0, 4))
      continue
    }
    if (!month) continue
    const previous = headings[index - 1]
    const before = plain(rendered.slice(previous ? previous.index! + previous[0].length : 0, heading.index))
    const dateLabel = before.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s*$/i)
    if (!dateLabel) continue
    const day = Number(dateLabel[2])
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day ||
        date.getUTCDay() !== weekdays.indexOf(dateLabel[1].toLowerCase())) continue
    const eventDate = date.toISOString().slice(0, 10)
    if (eventDate < today) continue
    const time = titleWithTime.match(/\b(1[0-2]|0?[1-9])(?:[:.]([0-5]\d))?\s*(am|pm)\b/i)
    const title = (time ? titleWithTime.slice(0, time.index) : titleWithTime).replace(/\s*[-–—]\s*$/, '').trim()
    if (title.length < 5 || title.length > 160 || /\b(?:cancelled|canceled|postponed|closed|test event)\b/i.test(title)) continue
    const key = `${eventDate}|${title.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    const startTime = time ? `${String(Number(time[1]) % 12 + (time[3].toLowerCase() === 'pm' ? 12 : 0)).padStart(2, '0')}:${time[2] || '00'}` : null
    events.push({ href: url.href, text: title, event_date: eventDate, start_time: startTime,
      raw: `${dateLabel[0]}. ${titleWithTime}. Official Club Bacchus ${year} calendar.`,
      image_url: null, method: 'club-bacchus-heading-calendar' })
  }
  return events
}
