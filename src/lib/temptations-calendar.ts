// The Events Calendar limits its list view to ten entries. Follow only the
// official "Next Events" link so later confirmed dates stay in the directory.
export type TemptationsEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
}

function plain(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#038;/gi, '&').replace(/&#39;|&#039;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim()
}

export function parseTemptationsCalendar(html: string, pageUrl: string, today: string): TemptationsEvent[] {
  let page: URL
  try {
    page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.hostname.replace(/^www\./, '') !== 'temptations2.co.uk' ||
        !/^\/events\/(?:list\/page\/[2-4]\/?)?$/.test(page.pathname)) return []
  } catch { return [] }
  const now = new Date(`${today}T00:00:00Z`)
  if (!Number.isFinite(now.getTime()) || now.toISOString().slice(0, 10) !== today) return []

  const markup = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const cards = markup.match(/<article\b[^>]*class=["'][^"']*\btribe-events-calendar-list__event\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi) || []
  const events = new Map<string, TemptationsEvent>()
  for (const card of cards) {
    const heading = card.match(/<h[2-4]\b[^>]*>[\s\S]*?<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)
    const date = card.match(/<time\b[^>]*\bdatetime=["'](20\d{2}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?[^"']*["']/i)
    if (!heading || !date) continue
    let href: URL
    try { href = new URL(heading[1].replace(/&amp;/gi, '&'), page) } catch { continue }
    if (href.protocol !== 'https:' || href.hostname.replace(/^www\./, '') !== 'temptations2.co.uk' ||
        !/^\/event\/[^/]+\/?$/.test(href.pathname)) continue

    const value = new Date(`${date[1]}T00:00:00Z`)
    if (!Number.isFinite(value.getTime()) || value.toISOString().slice(0, 10) !== date[1] || value < now) continue
    const title = plain(heading[2])
    if (!title || title.length > 150 || /^(?:events|view event)$/i.test(title)) continue
    const key = `${date[1]}|${title.toLowerCase()}`
    events.set(key, { href: href.href, text: title, event_date: date[1],
      start_time: date[2] || null, raw: plain(card).slice(0, 450) })
  }
  return [...events.values()].sort((a, b) => a.event_date.localeCompare(b.event_date))
}

export function nextTemptationsPage(html: string, pageUrl: string): string | null {
  let page: URL
  try {
    page = new URL(pageUrl)
    if (page.protocol !== 'https:' || page.hostname.replace(/^www\./, '') !== 'temptations2.co.uk') return null
  } catch { return null }
  const current = page.pathname.match(/^\/events\/(?:list\/page\/(\d+)\/?)?$/)
  if (!current) return null
  const currentPage = Number(current[1] || 1)
  if (currentPage >= 4) return null
  for (const anchor of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = anchor[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!/next events/i.test(label) && !/tribe-events-c-nav__next/i.test(anchor[0])) continue
    try {
      const target = new URL(anchor[1].replace(/&amp;/gi, '&'), page)
      const next = target.pathname.match(/^\/events\/list\/page\/(\d+)\/?$/)
      if (target.protocol === 'https:' && target.hostname.replace(/^www\./, '') === 'temptations2.co.uk' &&
          !target.search && !target.hash && next && Number(next[1]) === currentPage + 1) return target.href
    } catch { /* Ignore unrelated or malformed links. */ }
  }
  return null
}
