export type TownhouseLocationEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
}

function clean(value: string) {
  return value.replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&').replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

/** Current Svelte calendar: each link contains its own title and ISO start. */
export function parseTownhouseCalendar(html: string, pageUrl: string, today: string): TownhouseLocationEvent[] {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'townhouseswingers.com' ||
        url.pathname.replace(/\/+$/, '') !== '/events') return []
  } catch { return [] }
  const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const events: TownhouseLocationEvent[] = []
  const seen = new Set<string>()
  for (const card of rendered.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL
    try { url = new URL(card[1], pageUrl) } catch { continue }
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'townhouseswingers.com') continue
    const pathDate = url.pathname.match(/^\/events\/(\d{2})-([a-z]{3})-(20\d{2})\/[^/]+\/?$/i)
    if (!pathDate) continue
    const title = clean(card[2].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || '')
    const start = card[2].match(/<time\b[^>]*datetime=["'](20\d{2}-\d{2}-\d{2})T([0-2]\d:[0-5]\d):\d{2}(?:Z|[+-]\d{2}:\d{2})["']/i)
    if (!title || title.length > 150 || !start || Number(start[2].slice(0, 2)) > 23 ||
        /^(details coming soon|private party|test event)/i.test(title)) continue
    const date = new Date(`${start[1]}T12:00:00Z`)
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== start[1] || start[1] < today) continue
    const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(pathDate[2].toLowerCase()) + 1
    if (start[1] !== `${pathDate[3]}-${String(month).padStart(2, '0')}-${pathDate[1]}`) continue
    const href = url.href
    const key = `${start[1]}|${title.toLowerCase()}|${href}`
    if (seen.has(key)) continue
    seen.add(key)
    const description = clean(card[2].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || title)
    events.push({ href, text: title, event_date: start[1], start_time: start[2], raw: description })
  }
  return events
}

export function parseTownhouseLocation(html: string, pageUrl: string, today: string): TownhouseLocationEvent[] {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'townhouseswingers.com' ||
        url.pathname.replace(/\/+$/, '') !== '/event-location/townhouse') return []
  } catch { return [] }

  const starts = [...html.matchAll(/<div\b[^>]*class=["'][^"']*\beventon_list_event\b[^"']*["'][^>]*>/gi)]
  const events: TownhouseLocationEvent[] = []
  const seen = new Set<string>()

  for (let index = 0; index < starts.length; index++) {
    const block = html.slice(starts[index].index!, starts[index + 1]?.index ?? html.length)
    if (/\bcancelled\b/i.test(starts[index][0]) || /schema\.org\/EventCancelled/i.test(block)) continue
    const title = clean(block.match(/<span\b[^>]*class=["'][^"']*\bevoet_title\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
    if (!title || title.length > 150 || /^(details coming soon|private party|test event)/i.test(title)) continue

    const start = block.match(/<meta\b[^>]*itemprop=["']startDate["'][^>]*content=["'](20\d{2})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2})[^"']*["']/i)
    if (!start) continue
    const date = new Date(Date.UTC(Number(start[1]), Number(start[2]) - 1, Number(start[3])))
    if (date.getUTCFullYear() !== Number(start[1]) || date.getUTCMonth() + 1 !== Number(start[2]) ||
        date.getUTCDate() !== Number(start[3])) continue
    const eventDate = date.toISOString().slice(0, 10)
    if (eventDate < today) continue

    const rawUrl = block.match(/<a\b[^>]*itemprop=["']url["'][^>]*href=["']([^"']+)["']/i)?.[1]
    if (!rawUrl) continue
    let href: string
    try {
      const eventUrl = new URL(rawUrl, pageUrl)
      if (eventUrl.protocol !== 'https:' || eventUrl.hostname.replace(/^www\./, '') !== 'townhouseswingers.com' ||
          !eventUrl.pathname.startsWith('/events/')) continue
      href = eventUrl.href
    } catch { continue }

    const time = `${start[4].padStart(2, '0')}:${start[5]}`
    if (Number(start[4]) > 23 || Number(start[5]) > 59) continue
    const key = `${title.toLowerCase()}|${eventDate}|${href}`
    if (seen.has(key)) continue
    seen.add(key)
    events.push({ href, text: title, event_date: eventDate,
      start_time: time, raw: `${title}. Official Townhouse event listing.` })
  }

  return events.sort((a, b) => a.event_date.localeCompare(b.event_date))
}
