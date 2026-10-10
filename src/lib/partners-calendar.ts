type PartnersEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: string
}

const months: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
}

function textOf(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim()
}

export function parsePartnersCalendar(html: string, pageUrl: string, today: string): PartnersEvent[] {
  let url: URL
  try { url = new URL(pageUrl) } catch { return [] }
  if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'partnersswingersclub.com' ||
      url.pathname.replace(/\/+$/, '') !== '/events' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(today)) return []

  const events: PartnersEvent[] = []
  const blocks = /<div\b[^>]*class=["'][^"']*partners-event-month-heading[^"']*["'][^>]*>[\s\S]*?<\/div>|<article\b[^>]*class=["'][^"']*partners-event-detail-card[^"']*["'][^>]*>[\s\S]*?<\/article>/gi
  let year = ''
  let month = ''
  let block: RegExpExecArray | null
  while ((block = blocks.exec(html)) !== null) {
    if (block[0].startsWith('<div')) {
      const heading = textOf(block[0]).match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i)
      year = heading?.[2] || ''
      month = heading ? months[heading[1].toLowerCase()] : ''
      continue
    }
    if (!year || !month) continue
    const card = block[0]
    const dateText = textOf(card.match(/<span\b[^>]*class=["'][^"']*partners-event-date[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
    const date = dateText.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\b/i)
    const title = textOf(card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '')
    if (!date || months[date[2].toLowerCase()] !== month || !title) continue
    const eventDate = `${year}-${month}-${date[1].padStart(2, '0')}`
    const parsedDate = new Date(`${eventDate}T12:00:00Z`)
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== eventDate ||
        eventDate < today) continue
    const timeText = textOf(card.match(/<dd\b[^>]*>([\s\S]*?)<\/dd>/i)?.[1] || '')
    const time = timeText.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
    const hour = time ? Number(time[1]) : 0
    const startTime = time && hour >= 1 && hour <= 12
      ? `${String(hour % 12 + (time[3].toLowerCase() === 'pm' ? 12 : 0)).padStart(2, '0')}:${time[2] || '00'}`
      : null
    const description = textOf(card.match(/<div\b[^>]*class=["'][^"']*partners-event-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '')
    events.push({ href: 'https://partnersswingersclub.com/events/', text: title,
      event_date: eventDate, start_time: startTime,
      raw: description || `${title} at Partners Swingers Club on ${eventDate}`,
      image_url: null, method: 'partners-official-calendar' })
  }
  return events
}
