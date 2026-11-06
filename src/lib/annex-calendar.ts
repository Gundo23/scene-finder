const MONTHS: Record<string, number> = {
  JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
  JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
}
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export type AnnexEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: 'annex-official-calendar'
}

function plain(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#038;/gi, '&').replace(/&#8217;|&rsquo;/gi, '’')
    .replace(/\s+/g, ' ').trim()
}

function startTime(text: string) {
  const match = text.match(/\b(1[0-2]|0?[1-9])(?:[.:]([0-5]\d))?\s*(am|pm)\b/i)
  if (!match) return null
  const hour = (Number(match[1]) % 12) + (match[3].toLowerCase() === 'pm' ? 12 : 0)
  return `${String(hour).padStart(2, '0')}:${match[2] || '00'}`
}

export function parseAnnexCalendar(html: string, pageUrl: string, today: string): AnnexEvent[] {
  try {
    const page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.hostname.replace(/^www\./, '') !== 'theannex.org.uk' ||
      page.pathname.replace(/\/+$/, '') !== '/3-month-to-view-calendar') return []
  } catch { return [] }
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today)) return []

  const found: AnnexEvent[] = []
  const seen = new Set<string>()
  const sections = [...html.matchAll(/<strong>\s*(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*<\/strong>[\s\S]{0,300}?<ul\b[^>]*class="[^"]*wp-block-list[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi)]
  for (const section of sections) {
    const month = MONTHS[section[1].toUpperCase()]
    for (const item of section[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const text = plain(item[1])
      const dateMatch = text.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?:\s*/i)
      if (!dateMatch) continue
      const day = Number(dateMatch[2])
      const links = [...item[1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
      const linkedTitle = links.find((link) => plain(link[2]).length >= 4)
      const unlinkedTitle = text.slice(dateMatch[0].length).split('~')[0].trim()
      if (!linkedTitle && (unlinkedTitle.length < 8 || unlinkedTitle.length > 100)) continue
      let href: string
      try {
        if (!linkedTitle) {
          href = `${pageUrl}#${month}-${day}-${unlinkedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        } else {
          const url = new URL(linkedTitle[1], pageUrl)
          if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'theannex.org.uk' ||
            url.username || url.password || url.search || url.hash) continue
          href = url.toString()
        }
      } catch { continue }
      const title = linkedTitle ? plain(linkedTitle[2]) : unlinkedTitle
      for (const year of [Number(today.slice(0, 4)), Number(today.slice(0, 4)) + 1]) {
        const date = new Date(Date.UTC(year, month - 1, day))
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
          date.getUTCDate() !== day || WEEKDAYS[date.getUTCDay()] !== dateMatch[1].toLowerCase()) continue
        const iso = date.toISOString().slice(0, 10)
        if (iso < today || Date.parse(iso) - Date.parse(today) > 120 * 86400000) continue
        const time = startTime(text.slice(dateMatch[0].length))
        const key = `${iso}|${title.toLowerCase()}|${time}`
        if (seen.has(key)) break
        seen.add(key)
        found.push({ href, text: title, event_date: iso, start_time: time,
          raw: text, image_url: null, method: 'annex-official-calendar' })
        break
      }
    }
  }
  return found
}
