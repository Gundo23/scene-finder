export type SwampEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
}

const months: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

export function parseSwampDates(html: string, pageUrl: string, today: string): SwampEvent[] {
  let url: URL
  try {
    url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'swampinbristol.org.uk' ||
        !/^\/20\d{2}-dates\/?$/.test(url.pathname)) return []
  } catch { return [] }
  const year = Number(url.pathname.slice(1, 5))
  const todayDate = new Date(`${today}T00:00:00Z`)
  if (!Number.isFinite(todayDate.getTime()) || todayDate.toISOString().slice(0, 10) !== today) return []

  const content = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(?:p|div|li|br|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&ndash;|&#8211;/gi, '–').replace(/&mdash;|&#8212;/gi, '—')
    .replace(/[ \t]+/g, ' ')
  if (!new RegExp(`\\b${year} Dates\\b`, 'i').test(content)) return []

  const events: SwampEvent[] = []
  const seen = new Set<string>()
  for (const line of content.split(/\n+/)) {
    const match = line.trim().match(/^SUNDAY\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2})(?:st|nd|rd|th)?\s*[–—-]\s*(.+)$/i)
    if (!match) continue
    const month = months[match[1].toLowerCase()]
    const day = Number(match[2])
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day || date.getUTCDay() !== 0 || date < todayDate) continue
    const raw = match[3].trim()
    const title = raw.split(/\s+@\s*\d/i)[0].split(/\.\s+Optional\b/i)[0].trim()
    if (!title || title.length > 130) continue
    const time = raw.match(/@\s*(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)/i)
    const hour = time ? Number(time[1]) % 12 + (time[3].toLowerCase() === 'pm' ? 12 : 0) : null
    const eventDate = date.toISOString().slice(0, 10)
    if (seen.has(eventDate)) continue
    seen.add(eventDate)
    events.push({ href: url.href, text: title, event_date: eventDate,
      start_time: hour === null ? null : `${String(hour).padStart(2, '0')}:${time![2] || '00'}`,
      raw: `${title}. ${raw}. Official SWAMP in Bristol ${year} dates.` })
  }
  return events
}
