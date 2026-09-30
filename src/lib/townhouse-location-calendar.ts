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
