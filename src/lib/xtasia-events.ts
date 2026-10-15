export type XtasiaEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
}

const months: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}
const weekdays: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

function plain(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#38;|&#038;/gi, '&').replace(/&#39;|&#039;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim()
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date
}

// The official What's On page has one dated listing per /events/YYYYMMDD/slug
// link. Never infer a year or recurrence from the undated "Today" previews.
export function parseXtasiaEvents(html: string, pageUrl: string, today: string): XtasiaEvent[] {
  let page: URL
  try {
    page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.hostname.replace(/^www\./, '') !== 'xtasia.co.uk' ||
        page.pathname.replace(/\/+$/, '') !== '/events') return []
  } catch { return [] }
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today) ||
      isoDate(Number(today.slice(0, 4)), Number(today.slice(5, 7)), Number(today.slice(8, 10)))?.toISOString().slice(0, 10) !== today) return []

  const start = new Date(`${today}T00:00:00Z`).getTime()
  // A rolling three months covers the runway without flooding the existing
  // venue with a whole year's events in one scrape.
  const end = start + 90 * 86400000
  const markup = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  const anchors = [...markup.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)]
  const events = new Map<string, XtasiaEvent>()
  let previous = 0

  for (const anchor of anchors) {
    const index = anchor.index ?? 0
    let href: URL
    try {
      href = new URL(anchor[1].replace(/&amp;/gi, '&'), page)
    } catch { continue }
    const match = href.pathname.match(/^\/events\/(20\d{2})(\d{2})(\d{2})\/([a-z0-9-]+)\/?$/i)
    if (href.protocol !== 'https:' || href.hostname.replace(/^www\./, '') !== 'xtasia.co.uk' ||
        !match || href.search || href.hash) continue

    const eventDate = isoDate(Number(match[1]), Number(match[2]), Number(match[3]))
    if (!eventDate || eventDate.getTime() < start || eventDate.getTime() > end) continue

    // The link text is "View Event". Restrict the title and full date to the
    // preceding listing, bounded by the previous dated-event link.
    const block = markup.slice(Math.max(previous, index - 2400), index)
    previous = index
    const dated = [...plain(block).matchAll(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?:day)?\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2})\b/gi)].at(-1)
    if (!dated || Number(dated[2]) !== eventDate.getUTCDate() ||
        months[dated[3].slice(0, 3).toLowerCase()] !== eventDate.getUTCMonth() + 1 ||
        Number(dated[4]) !== eventDate.getUTCFullYear() ||
        weekdays[dated[1].slice(0, 3).toLowerCase()] !== eventDate.getUTCDay()) continue

    const headings = [...block.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
    const title = plain(headings.at(-1)?.[1] || '')
    if (!title || title.length > 130 || /^(?:view event|events|what'?s on|explore what'?s on|\w{3}\s+\d{1,2}\s+\w{3})$/i.test(title) ||
        /<|>|\bclosed\b/i.test(title)) continue

    const time = plain(block).match(/\b(?:20\d{2})\s+(\d{1,2}):(\d{2})(am|pm)\b/i)
    const hour = time ? Number(time[1]) % 12 + (time[3].toLowerCase() === 'pm' ? 12 : 0) : null
    const key = `${eventDate.toISOString().slice(0, 10)}|${title.toLowerCase()}`
    events.set(key, {
      href: href.href,
      text: title,
      event_date: eventDate.toISOString().slice(0, 10),
      start_time: hour === null ? null : `${String(hour).padStart(2, '0')}:${time![2]}`,
      raw: `${title}. ${plain(block).slice(-300)}`,
    })
  }

  return [...events.values()].sort((a, b) => a.event_date.localeCompare(b.event_date))
}
