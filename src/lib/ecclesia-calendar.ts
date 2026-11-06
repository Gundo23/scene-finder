export type EcclesiaEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: string | null
  method: string
}

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || ''
}

function text(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&#0*38;|&#x26;/gi, '&')
    .replace(/&#0*39;|&#x27;/gi, "'").replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ').trim()
}

/** Bind each WordPress event card's own heading, date and detail URL. */
export function parseEcclesiaCalendar(html: string, pageUrl: string, today: string): EcclesiaEvent[] {
  let url: URL
  try {
    url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname !== 'www.ecclesiaglasgow.com' ||
        url.pathname !== '/upcoming-events/') return []
  } catch {
    return []
  }
  const events: EcclesiaEvent[] = []
  const seen = new Set<string>()
  // data-search may contain unescaped '>' characters; do not use the first '>'
  // as the end of an article's opening tag.
  for (const match of html.matchAll(/<article\b(?=[\s\S]{0,200}\becclesia-event-card\b)[\s\S]*?<\/article>/gi)) {
    const card = match[0]
    const date = attribute(card, 'data-start')
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || date < today ||
        Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) continue
    const name = card.match(/<h3\b[^>]*class=["'][^"']*\bwpem-heading-text\b[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i)
    const link = card.match(/<a\b[^>]*class=["'][^"']*\becclesia-event-card-link\b[^"']*["'][^>]*>/i)
    const title = text(name?.[1] || '')
    if (!title || title.length > 140 || !link) continue
    let href: URL
    try {
      href = new URL(attribute(link[0], 'href'), url)
      if (href.protocol !== 'https:' || href.hostname !== url.hostname ||
          !/^\/event\/[a-z0-9-]+\/?$/i.test(href.pathname)) continue
    } catch {
      continue
    }
    const key = `${date}|${href.href}`
    if (seen.has(key)) continue
    seen.add(key)

    const clock = text(card.match(/<span\b[^>]*class=["'][^"']*\bwpem-event-date-time-text\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
      .match(/@\s*(\d{1,2}):(\d{2})\s*(am|pm)/i)
    const hour = clock ? (Number(clock[1]) % 12) + (clock[3].toLowerCase() === 'pm' ? 12 : 0) : null
    const start_time = hour !== null && Number(clock?.[2]) < 60
      ? `${String(hour).padStart(2, '0')}:${clock?.[2]}` : null
    const image = card.match(/background-image:\s*url\(['"](https:\/\/[^'"]+)['"]\)/i)?.[1] || null
    events.push({ href: href.href, text: title, event_date: date, start_time,
      raw: title, image_url: image, method: 'ecclesia-official-card' })
  }
  return events.sort((a, b) => a.event_date.localeCompare(b.event_date) ||
    (a.start_time || '').localeCompare(b.start_time || '') || a.href.localeCompare(b.href))
}
