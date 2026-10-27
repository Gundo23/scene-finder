export const ATLANTIS_CALENDAR_URL = 'https://www.atlantisevolution.co.uk/'
export const SWEATBOX_CALENDAR_URL = 'https://www.sweatboxsoho.com/events/'

type PublishedEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: string
}

function visibleText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp);|&#(?:160|38);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function validToday(today: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today)) return null
  const date = new Date(`${today}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === today ? date : null
}

function officialPage(pageUrl: string, host: string, path?: string) {
  try {
    const url = new URL(pageUrl)
    return url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === host &&
      (!path || url.pathname.replace(/\/+$/, '') === path.replace(/\/+$/, ''))
  } catch {
    return false
  }
}

function dateForPublishedDay(day: number, month: number, today: Date) {
  let year = today.getUTCFullYear()
  let candidate = new Date(Date.UTC(year, month - 1, day, 12))
  // Only bridge an ordinary Dec/Jan schedule boundary. Never turn a stale
  // yearless listing into an event many months into the following year.
  if (today.getUTCMonth() >= 10 && month <= 2 && candidate.getTime() < today.getTime()) {
    year++
    candidate = new Date(Date.UTC(year, month - 1, day, 12))
  }
  return candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
    ? candidate.toISOString().slice(0, 10) : null
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

export function parseAtlantisSchedule(html: string, pageUrl: string, today: string): PublishedEvent[] {
  if (!officialPage(pageUrl, 'atlantisevolution.co.uk')) return []
  const current = validToday(today)
  if (!current) return []
  const text = visibleText(html)
  if (!/\batlantis\s*EVOLUTION\b/i.test(text) || !/\bBurslem\b/i.test(text) || !/\bStoke on Trent\b/i.test(text)) return []
  if (/\b(?:events? cancelled|events? canceled|club closed|no events)\b/i.test(text)) return []
  const publishedYear = Number(text.match(/\bLAST\s+UPDATE\s*:\s+\d{1,2}\s+\w+\s+(20\d{2})\b/i)?.[1])
  if (!publishedYear) return []

  const pattern = /\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\s*\|\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/gi
  const occurrences = [...text.matchAll(pattern)].map(match => {
    const month = MONTHS[match[5].slice(0, 3).toLowerCase()]
    const candidate = month && new Date(Date.UTC(publishedYear, month - 1, Number(match[4]), 12))
    const eventDate = candidate && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === Number(match[4])
      ? candidate.toISOString().slice(0, 10) : null
    return { match, eventDate, index: match.index, end: match.index + match[0].length }
  })

  // The live page places the Halloween heading before, after, or between the
  // two date rows depending on which repeated layout block is rendered. Bind
  // it only to the nearest consecutive pair so later ordinary dates do not
  // inherit a page-wide theme.
  const halloweenDates = new Set<string>()
  for (const theme of text.matchAll(/HALLOWEEN SCREAMS(?:\s+ALL)?\s+WEEKEND/gi)) {
    const themeStart = theme.index
    const themeEnd = theme.index + theme[0].length
    const nearby = occurrences
      .filter(item => item.eventDate)
      .map(item => ({
        ...item,
        distance: item.end < themeStart ? themeStart - item.end : item.index > themeEnd ? item.index - themeEnd : 0,
      }))
      .filter(item => item.distance <= 240)
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .filter((item, index, items) => items.findIndex(other => other.eventDate === item.eventDate) === index)
    const pairs = nearby.flatMap((first, firstIndex) => nearby.slice(firstIndex + 1).map(second => [first, second] as const))
      .filter(([first, second]) => Math.abs(
        new Date(`${first.eventDate}T12:00:00Z`).getTime() - new Date(`${second.eventDate}T12:00:00Z`).getTime(),
      ) === 86_400_000)
      .sort((a, b) => {
        const totalA = a[0].distance + a[1].distance
        const totalB = b[0].distance + b[1].distance
        return totalA - totalB || Math.max(a[0].distance, a[1].distance) - Math.max(b[0].distance, b[1].distance)
      })
    pairs[0]?.forEach(item => halloweenDates.add(item.eventDate!))
  }

  const events: PublishedEvent[] = []
  const seen = new Set<string>()
  for (const { match, eventDate } of occurrences) {
    if (!eventDate || eventDate < today || seen.has(eventDate)) continue
    seen.add(eventDate)
    let hour = Number(match[1]) % 12
    if (match[3].toLowerCase() === 'pm') hour += 12
    events.push({
      href: `${ATLANTIS_CALENDAR_URL}#events`,
      text: halloweenDates.has(eventDate) ? 'Halloween Screams Weekend' : 'Atlantis Evolution event',
      event_date: eventDate,
      start_time: `${String(hour).padStart(2, '0')}:${match[2] || '00'}`,
      raw: `Official Atlantis Evolution schedule for ${eventDate} in Stoke-on-Trent.`,
      image_url: null,
      method: 'atlantis-published-schedule',
    })
  }
  return events
}

export function parseSweatboxSchedule(html: string, pageUrl: string, today: string): PublishedEvent[] {
  if (!officialPage(pageUrl, 'sweatboxsoho.com', '/events')) return []
  const first = validToday(today)
  if (!first) return []
  const text = visibleText(html)
  if (!/\bSweatbox\b/i.test(text) || !/\bSoho\b|\bCentral London\b/i.test(text)) return []
  if (/\b(?:events? cancelled|events? canceled|events? suspended|no longer running)\b/i.test(text)) return []

  const rules = [
    { day: 1, name: 'Hard Up Mondays', proof: /Every Monday\s+Hard Up Mondays\b/i, start: null },
    { day: 2, name: 'Towel Free Tuesdays', proof: /Every Tuesday\s+Towel Free Tuesdays[\s\S]{0,240}?4pm to midnight/i, start: '16:00' },
    { day: 3, name: 'Mid Week Foam Party', proof: /Every Wednesday\s+Mid Week Foam Party[\s\S]{0,240}?8pm till 10pm/i, start: '20:00' },
    { day: 4, name: 'Hard Up Thursdays', proof: /Every Thursday\s+Hard Up Thursdays\b/i, start: null },
    { day: 0, name: 'Naked Workout', proof: /Every Sunday\s+Naked Workout[\s\S]{0,240}?2pm\s*-\s*4pm/i, start: '14:00' },
  ].filter(rule => rule.proof.test(text))
  if (rules.length === 0) return []

  const events: PublishedEvent[] = []
  for (let offset = 0; offset < 42; offset++) {
    const date = new Date(first)
    date.setUTCDate(date.getUTCDate() + offset)
    const rule = rules.find(item => item.day === date.getUTCDay())
    if (!rule) continue
    const eventDate = date.toISOString().slice(0, 10)
    events.push({
      href: SWEATBOX_CALENDAR_URL,
      text: rule.name,
      event_date: eventDate,
      start_time: rule.start,
      raw: `Official Sweatbox Soho weekly programme: ${rule.name}.`,
      image_url: null,
      method: 'sweatbox-published-weekly',
    })
  }
  return events
}

export function parseUntamedListing(html: string, pageUrl: string, today: string): PublishedEvent[] {
  if (!officialPage(pageUrl, 'untamednights.co.uk', '/events-tickets')) return []
  const current = validToday(today)
  if (!current) return []
  const page = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
  const text = visibleText(page)
  if (!/\bEvents and tickets\b/i.test(text) || !/\bUntamed nights\b/i.test(text)) return []
  const events: PublishedEvent[] = []
  const seen = new Set<string>()
  // Wix's visible list items keep title, date, location and detail URL together.
  // Flat page text can prepend the introduction or the previous card's CTA.
  for (const match of page.matchAll(/<li\b[^>]*data-hook=["']side-by-side-item["'][^>]*>([\s\S]*?)<\/li>/gi)) {
    const card = match[1]
    const anchor = card.match(/<a\b([^>]*data-hook=["']title["'][^>]*)>([\s\S]*?)<\/a>/i)
    const title = visibleText(anchor?.[2] || '')
    const href = anchor?.[1].match(/\bhref=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/gi, '&') || ''
    const dateText = visibleText(card.match(/<[^>]+data-hook=["']short-date["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '')
    const location = visibleText(card.match(/<[^>]+data-hook=["']short-location["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '')
    const date = dateText.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i)
    if (!date || !title || title.length > 100 || /^(?:Buy Tickets|Share|Multiple Dates)$/i.test(title) ||
        !/^(?:Bournemouth|Canvas|Confirmed after ticket purchase)$/i.test(location) ||
        /\b(?:cancelled|canceled|postponed)\b/i.test(visibleText(card))) continue
    const month = MONTHS[date[3].toLowerCase()]
    const eventDate = month && dateForPublishedDay(Number(date[2]), month, current)
    if (!eventDate || eventDate < today ||
        new Date(`${eventDate}T12:00:00Z`).getUTCDay() !== ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(date[1].toLowerCase()) ||
        !isUntamedDetailCandidate({ venue_id: 'untamed_nights_bournemouth', event_date: eventDate, ticket_url: href }) ||
        seen.has(href)) continue
    seen.add(href)
    events.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: null,
      raw: `Official Untamed Nights listing for ${eventDate}; detail-page enrichment may add the time.`,
      image_url: null,
      method: 'untamed-official-listing',
    })
  }
  return events
}

export function parseUntamedDetail(html: string, pageUrl: string, today: string): PublishedEvent[] {
  const current = validToday(today)
  if (!current) return []

  let currentSlug = ''
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'untamednights.co.uk' ||
        !/^\/event-details\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(url.pathname) ||
        url.username || url.password || url.port || url.search || url.hash) return []
    currentSlug = url.pathname.replace(/^\/event-details\//, '').replace(/\/$/, '')
  } catch {
    return []
  }

  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
  const title = visibleText(visible.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
  const fullDate = visibleText(visible.match(/<[^>]+data-hook=["']event-full-date["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '')
  const location = visibleText(visible.match(/<[^>]+data-hook=["']event-full-location["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '')
  const first = fullDate.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2}),\s*(\d{1,2}):([0-5]\d)\b/i)
  if (!title || title.length > 100 || /\b(?:cancelled|canceled|postponed)\b/i.test(title) ||
      !first || !/\bBournemouth\b/i.test(location)) return []

  const firstMonth = MONTHS[first[2].slice(0, 3).toLowerCase()]
  const firstDate = firstMonth && validToday(`${first[3]}-${String(firstMonth).padStart(2, '0')}-${first[1].padStart(2, '0')}`)
  if (!firstDate || firstDate.toISOString().slice(0, 10) < today) return []

  const events: PublishedEvent[] = []
  const seen = new Set<string>()
  const append = (slug: string, eventDate: string, startTime: string) => {
    const href = `https://www.untamednights.co.uk/event-details/${slug}`
    if (!isUntamedDetailCandidate({
      venue_id: 'untamed_nights_bournemouth', event_date: eventDate, ticket_url: href,
    })) return
    const key = `${eventDate}|${href}`
    if (seen.has(key)) return
    seen.add(key)
    events.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: `${title}. Official Untamed Nights detail occurrence for ${eventDate} in Bournemouth.`,
      image_url: null,
      method: 'untamed-official-detail',
    })
  }

  const firstIso = firstDate.toISOString().slice(0, 10)
  append(currentSlug, firstIso, `${first[4].padStart(2, '0')}:${first[5]}`)

  // Wix publishes every other occurrence in hydration data with both a
  // date-bearing slug and a human-readable day/date/time. Require the two to
  // agree, so an unrelated date elsewhere in the page cannot become an event.
  const seriesSlug = currentSlug.replace(/-20\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/, '')
  const hydrated = html.replace(/\\"/g, '"').replace(/&quot;/gi, '"')
  const suggestion = /["']slug["']\s*:\s*["']([^"']+)["'][\s\S]{0,240}?["']shortStartDateTime["']\s*:\s*["'](Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,\s*(\d{1,2}):([0-5]\d)["']/gi
  for (const match of hydrated.matchAll(suggestion)) {
    const slug = match[1]
    const parts = slug.match(/^(.*)-(20\d{2})-(\d{2})-(\d{2})-(\d{2})-([0-5]\d)$/)
    if (!parts || parts[1] !== seriesSlug) continue
    const eventDate = `${parts[2]}-${parts[3]}-${parts[4]}`
    const candidate = validToday(eventDate)
    const month = MONTHS[match[4].slice(0, 3).toLowerCase()]
    if (!candidate || eventDate < today || Number(parts[3]) !== month ||
        Number(parts[4]) !== Number(match[3]) || Number(parts[5]) !== Number(match[5]) ||
        parts[6] !== match[6] || candidate.getUTCDay() !==
          ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(match[2].toLowerCase())) continue
    append(slug, eventDate, `${parts[5]}:${parts[6]}`)
  }

  return events.sort((a, b) => a.event_date.localeCompare(b.event_date))
}

// Only URL text is exempted from the generic "details" junk word. Titles and
// descriptions still pass every existing publication and quality guard.
export function isUntamedDetailCandidate(input: {
  venue_id?: string | null; event_date?: string | null; ticket_url?: string | null
}) {
  if (input.venue_id !== 'untamed_nights_bournemouth' || !validToday(input.event_date || '')) return false
  try {
    const url = new URL(input.ticket_url || '')
    return url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === 'untamednights.co.uk' &&
      !url.username && !url.password && !url.port && !url.search && !url.hash &&
      /^\/event-details\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(url.pathname)
  } catch { return false }
}
