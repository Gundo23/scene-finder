export type NerosEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: string | null
  method: string
}

const DAY_MS = 86_400_000

function plain(value: string) {
  return value.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|#160);/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()
}

function validToday(value: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function nerosPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '').toLowerCase() !== 'nerossauna.com') return null
    return { url, path: url.pathname.replace(/\/+$/, '').toLowerCase() || '/' }
  } catch {
    return null
  }
}

export function isNerosAllowedPage(pageUrl: string | null | undefined) {
  const page = nerosPage(String(pageUrl || ''))
  return Boolean(page && [
    '/sauna-events',
    '/biphoria-bisexual-event-at-neros-sauna',
    '/naked-thursdays-at-neros-sauna',
  ].includes(page.path))
}

export function discoverNerosEventPages() {
  return [
    'https://nerossauna.com/sauna-events/',
    'https://nerossauna.com/biphoria-bisexual-event-at-neros-sauna/',
    'https://nerossauna.com/naked-thursdays-at-neros-sauna/',
  ]
}

function addWeekly(events: NerosEvent[], pageUrl: string, today: string, weekday: number,
  title: string, startTime: string, raw: string) {
  const start = new Date(`${today}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() + (weekday - start.getUTCDay() + 7) % 7)
  const end = new Date(`${today}T00:00:00Z`).getTime() + 84 * DAY_MS

  for (let time = start.getTime(); time <= end; time += 7 * DAY_MS) {
    events.push({ href: pageUrl, text: title, event_date: new Date(time).toISOString().slice(0, 10),
      start_time: startTime, raw, image_url: null, method: 'neros-published-recurrence' })
  }
}

export function parseNerosSchedule(html: string, pageUrl: string, today: string): NerosEvent[] {
  const page = nerosPage(pageUrl)
  if (!page || !isNerosAllowedPage(pageUrl) || !validToday(today)) return []

  const text = plain(html).toLowerCase()
  if (!text.includes("nero's sauna") || !text.includes('bury')) return []

  const events: NerosEvent[] = []

  if (page.path === '/biphoria-bisexual-event-at-neros-sauna' &&
      text.includes('weekly mixed event') && /thu(?:rsday)?\s+11am\s*[–-]\s*midnight/.test(text)) {
    addWeekly(events, page.url.href, today, 4, 'Biphoria at Neros Sauna', '11:00',
      'Official Neros page publishes Biphoria every Thursday, 11am to midnight.')
  }

  if (page.path === '/naked-thursdays-at-neros-sauna' &&
      text.includes('naked sauna day fridays') && text.includes('friday from 11:00am to 7:00pm')) {
    addWeekly(events, page.url.href, today, 5, 'Naked Sauna Day', '11:00',
      'Official Neros page publishes Naked Sauna Day every Friday, 11am to 7pm.')
  }

  if (page.path === '/sauna-events' && text.includes('last tuesday') &&
      text.includes('t-girl tuesday') && /last tuesday of the month,?\s*11am\s*[–-]\s*7pm/.test(text)) {
    const cursor = new Date(`${today}T00:00:00Z`)
    const end = cursor.getTime() + 84 * DAY_MS
    for (let month = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
      month.getTime() <= end; month.setUTCMonth(month.getUTCMonth() + 1)) {
      const occurrence = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0))
      while (occurrence.getUTCDay() !== 2) occurrence.setUTCDate(occurrence.getUTCDate() - 1)
      const date = occurrence.toISOString().slice(0, 10)
      if (date < today || occurrence.getTime() > end) continue
      events.push({ href: page.url.href, text: 'T-Girl Tuesday', event_date: date,
        start_time: '11:00', raw: 'Official Neros page publishes T-Girl Tuesday on the last Tuesday of each month, 11am to 7pm.',
        image_url: null, method: 'neros-published-recurrence' })
    }
  }

  return events
}
