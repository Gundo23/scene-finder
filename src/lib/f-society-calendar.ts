import type { StructuredEvent } from './structured-events'

const months = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december']

function clean(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

/** Tie metadata to the next-event card, never to a past/recommended event. */
export function parseFSocietyNextEvent(html: string, pageUrl: string, today: string,
  structured: StructuredEvent[]) {
  if (!/^https:\/\/(?:www\.)?f-society\.uk\/events\/?$/i.test(pageUrl)) return []
  const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const card = rendered.match(/<span[^>]*>Next Event<\/span>([\s\S]*?)<\/section>/i)?.[1]
  if (!card) return []
  const title = clean(card.match(/<h3[^>]*class=["'][^"']*\bbuy-ticket__title\b[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '')
  const link = card.match(/<a\b[^>]*href=["'](\/events\/[a-z0-9-]+)["'][^>]*>\s*View Event Details?\b/i)?.[1]
  if (!title || title.length > 160 || !link) return []
  const href = new URL(link, pageUrl).href
  const metadata = structured.filter((event) => event.url === href &&
    event.name.toLowerCase() === title.toLowerCase())
  // Conflicting metadata is evidence for review, not a choice of a convenient date.
  const unique = new Map(metadata.map((event) => [`${event.date}|${event.start_time}`, event]))
  if (unique.size > 1) return []
  const event = [...unique.values()][0]
  const visibleDate = clean(card).match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i)
  let date = event?.date
  if (visibleDate) {
    const month = months.indexOf(visibleDate[3].toLowerCase()) + 1
    const explicitDate = `${visibleDate[4]}-${String(month).padStart(2, '0')}-${visibleDate[2].padStart(2, '0')}`
    const parsed = new Date(`${explicitDate}T12:00:00Z`)
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== explicitDate ||
        parsed.getUTCDay() !== ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(visibleDate[1].toLowerCase()) ||
        (date && date !== explicitDate)) return []
    date = explicitDate
  }
  if (!date || date < today) return []
  const time = clean(card).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
  return [{ href, text: title, event_date: date,
    start_time: event?.start_time || (time ? `${time[1].padStart(2, '0')}:${time[2]}` : null),
    raw: `${title} at Zerox, Newcastle upon Tyne, ${date}`,
    image_url: event?.image_url || null, method: 'f-society-next-event' }]
}
