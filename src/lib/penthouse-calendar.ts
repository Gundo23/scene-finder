export type PenthouseEvent = {
  href: string
  text: string
  event_date: string
  start_time: string
  raw: string
  image_url: string | null
  method: string
}

/** The /events Inertia payload owns this venue's programme. Nearby JSON and
 * image URLs describe other cards and must never supply another event's date. */
export function parsePenthouseCalendar(html: string, pageUrl: string, today: string): PenthouseEvent[] {
  let url: URL
  try {
    url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname !== 'penthouse-playrooms.co.uk' ||
        url.pathname.replace(/\/+$/, '') !== '/events') return []
  } catch {
    return []
  }

  const script = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .find((match) => /\bdata-page=["']app["']/.test(match[1]) &&
      /\btype=["']application\/json["']/.test(match[1]))
  if (!script) return []

  let payload: unknown
  try {
    payload = JSON.parse(script[2])
  } catch {
    return []
  }
  if (!payload || typeof payload !== 'object' || !('component' in payload) ||
      payload.component !== 'Penthouse/pages/Events' || !('props' in payload)) return []
  const props = payload.props
  if (!props || typeof props !== 'object' || !('upcomingEvents' in props) ||
      !Array.isArray(props.upcomingEvents)) return []

  const events: PenthouseEvent[] = []
  const seen = new Set<number>()
  for (const value of props.upcomingEvents) {
    if (!value || typeof value !== 'object') continue
    const event = value as Record<string, unknown>
    const id = event.id
    const title = event.title
    const start = event.starts_at
    if (!Number.isSafeInteger(id) || Number(id) <= 0 ||
        typeof title !== 'string' || title.trim().length < 5 || title.length > 140 ||
        typeof start !== 'string' || seen.has(Number(id)) || event.is_hidden === true) continue

    const match = start.match(/^(20\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (!match) continue
    const date = `${match[1]}-${match[2]}-${match[3]}`
    const calendar = new Date(`${date}T00:00:00Z`)
    if (Number.isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date ||
        Number(match[4]) > 23 || Number(match[5]) > 59 || date < today) continue

    seen.add(Number(id))
    const image = typeof event.image_url === 'string' ? event.image_url : ''
    events.push({
      href: new URL(`/event/${id}`, url).href,
      text: title.trim(),
      event_date: date,
      start_time: `${match[4]}:${match[5]}`,
      raw: typeof event.description === 'string' ? event.description : title.trim(),
      image_url: /^https:\/\//i.test(image) ? image : null,
      method: 'penthouse-official-upcoming',
    })
  }
  return events
}
