const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december']
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export type DominiumEvent = {
  href: string
  text: string
  event_date: string
  start_time: null
  raw: string
  image_url: null
  method: 'dominium-official-card'
}

function plain(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&#038;/gi, '&').replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ').trim()
}

function officialDetail(value: string) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null
    if (host === 'dominiumvita.com' && /^\/latest-events\/[a-z0-9-]+\/?$/.test(url.pathname)) return url.toString()
    if (host === 'themandrake.com' && /^\/event\/[a-z0-9-]+\/?$/.test(url.pathname)) return url.toString()
  } catch { /* Ignore invalid booking links. */ }
  return null
}

function dateFromCard(value: string, today: string) {
  const match = value.toLowerCase().match(/^(?:(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s*-\s*\d{1,2}(?:st|nd|rd|th)?)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(20\d{2}))?$/)
  if (!match || !/^20\d{2}-\d{2}-\d{2}$/.test(today)) return null
  const month = MONTHS.indexOf(match[3])
  const day = Number(match[2])
  const years = match[4] ? [Number(match[4])] : [Number(today.slice(0, 4)), Number(today.slice(0, 4)) + 1]
  for (const year of years) {
    const date = new Date(Date.UTC(year, month, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) continue
    if (match[1] && WEEKDAYS[date.getUTCDay()] !== match[1]) continue
    const iso = date.toISOString().slice(0, 10)
    // An undated year suffix cannot justify rolling a stale card far ahead.
    if (iso < today || (!match[4] && Date.parse(iso) - Date.parse(today) > 180 * 86400000)) continue
    return iso
  }
  return null
}

export function parseDominiumCalendar(html: string, pageUrl: string, today: string): DominiumEvent[] {
  let page: URL
  try { page = new URL(pageUrl) } catch { return [] }
  if (page.protocol !== 'https:' || page.hostname.replace(/^www\./, '') !== 'dominiumvita.com' ||
      !['/events', '/events/ibiza'].includes(page.pathname.replace(/\/+$/, ''))) return []

  const markers = [...html.matchAll(/<div[^>]*class="[^"]*\bev_slider_link\b[^"]*"[^>]*>/gi)]
  const found: DominiumEvent[] = []
  const seen = new Set<string>()
  for (let i = 0; i < markers.length; i++) {
    const card = html.slice(markers[i].index, markers[i + 1]?.index ?? html.length).slice(0, 5000)
    const title = card.match(/<h1[^>]*class="[^"]*\bev_slider_heading\b[^"]*"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/i)
    const dates = [...card.matchAll(/<div[^>]*class="[^"]*\bev_slider_meta_txt\b[^"]*"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)]
    const link = card.match(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]{0,400}?Full Details/i)
    if (!title || !link) continue
    const name = plain(title[1])
    const date = dates.map((part) => dateFromCard(plain(part[1]), today)).find(Boolean)
    const href = officialDetail(link[1])
    if (!name || !date || !href) continue
    const key = `${date}|${href}`
    if (seen.has(key)) continue
    seen.add(key)
    found.push({ href, text: name, event_date: date, start_time: null,
      raw: name, image_url: null, method: 'dominium-official-card' })
  }
  return found
}
