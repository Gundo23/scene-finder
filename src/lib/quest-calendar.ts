export const QUEST_CALENDAR_URL = 'https://questswingersclub.uk/events/'

type QuestEvent = {
  href: string
  text: string
  event_date: string
  start_time: string
  raw: string
}

function clean(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (whole, code: string) => {
      const point = code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : Number(code)
      return point <= 0x10ffff ? String.fromCodePoint(point) : whole
    }).replace(/\s+/g, ' ').trim()
}

function detailUrl(value: string, base: string): string | null {
  try {
    const url = new URL(clean(value), base)
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        url.hostname.replace(/^www\./, '') !== 'questswingersclub.uk' ||
        url.pathname.replace(/\/+$/, '') !== '/all-events' ||
        !/^[1-9]\d*$/.test(url.searchParams.get('event') || '') ||
        [...url.searchParams.keys()].some((key) => key !== 'event')) return null
    return `https://questswingersclub.uk/all-events/?event=${url.searchParams.get('event')}`
  } catch { return null }
}

/** Quest's replacement calendar pairs an event link with its full local timestamp.
 * Read only that adjacent metadata, never dates/times buried in descriptions.
 * Empty/changed HTML returns no candidates; the route records a failed page.
 */
export function parseQuestCalendar(html: string, pageUrl: string, today: string): QuestEvent[] {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        url.hostname.replace(/^www\./, '') !== 'questswingersclub.uk' ||
        url.pathname.replace(/\/+$/, '') !== '/events') return []
  } catch { return [] }
  const rendered = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const links = [...rendered.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ match, href: detailUrl(match[1], pageUrl) })).filter((item) => item.href)
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december']
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const events: QuestEvent[] = []
  const seen = new Set<string>()
  const horizon = new Date(`${today}T12:00:00Z`)
  horizon.setUTCDate(horizon.getUTCDate() + 120)
  if (Number.isNaN(horizon.getTime())) return []
  for (let index = 0; index < links.length; index++) {
    const { match, href } = links[index]
    const title = clean(match[2]).replace(/[-–]\s*\d{1,2}-\d{1,2}-20\d{2}\s*$/, '').trim()
    if (title.length < 3 || title.length > 150 || /^(?:view details|clear all|closed\b|cancelled\b|private event\b|\d{1,2}:\d{2})/i.test(title)) continue
    const after = rendered.slice(match.index! + match[0].length, links[index + 1]?.match.index ?? rendered.length)
    // The title link is followed by optional venue label and canonical timestamp.
    const metadata = clean(after).match(/^(?:Quest\s+)?(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+([A-Za-z]+)\s+(\d{1,2}),\s+(20\d{2})\s+(\d{2}):([0-5]\d)\b/i)
    if (!metadata || Number(metadata[5]) > 23 || /schema\.org\/EventCancelled|\bdata-status=["']cancelled/i.test(after)) continue
    const month = months.indexOf(metadata[2].toLowerCase()) + 1
    const date = `${metadata[4]}-${String(month).padStart(2, '0')}-${metadata[3].padStart(2, '0')}`
    const calendar = new Date(`${date}T12:00:00Z`)
    if (!month || Number.isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date ||
        weekdays[calendar.getUTCDay()].toLowerCase() !== metadata[1].toLowerCase() ||
        date < today || calendar > horizon) continue
    const key = `${href}|${date}`
    if (seen.has(key)) continue
    seen.add(key)
    events.push({ href: href!, text: title, event_date: date,
      start_time: `${metadata[5]}:${metadata[6]}`, raw: `${title}. Official Quest calendar listing.` })
    if (events.length === 150) break
  }
  return events
}
