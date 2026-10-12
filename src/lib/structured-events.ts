export type StructuredEvent = {
  name: string
  description: string
  date: string
  start_time: string | null
  url: string
  image_url: string | null
}

type JsonRecord = Record<string, unknown>

function record(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, ' ').trim()
}

function absoluteHttpUrl(value: unknown, baseUrl: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim(), baseUrl)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

function firstUrl(value: unknown, baseUrl: string): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = firstUrl(item, baseUrl)
      if (url) return url
    }
    return null
  }
  if (record(value)) return firstUrl(value.url || value.contentUrl || value['@id'], baseUrl)
  return absoluteHttpUrl(value, baseUrl)
}

function eventDate(value: unknown): { date: string; start_time: string | null } | null {
  if (typeof value !== 'string') return null
  const match = value.match(/^(20\d{2})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!match) return null
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  const calendar = new Date(Date.UTC(year, month - 1, day))
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() + 1 !== month ||
      calendar.getUTCDate() !== day) return null
  const hours = Number(match[4]), minutes = Number(match[5])
  const time = match[4] && hours < 24 && minutes < 60 ? `${match[4]}:${match[5]}` : null
  return { date: `${match[1]}-${match[2]}-${match[3]}`, start_time: time }
}

function isEvent(value: unknown) {
  const types = Array.isArray(value) ? value : [value]
  return types.some((type) => typeof type === 'string' &&
    /^(?:https?:\/\/schema\.org\/)?[a-z]*Event$/i.test(type))
}

function cancelledOrPostponed(value: unknown) {
  return typeof value === 'string' && /Event(?:Cancelled|Postponed)$/i.test(value)
}

/** Read explicit, dated schema.org events only; page text never supplies missing dates. */
export function parseStructuredEvents(html: string, baseUrl: string, today: string): StructuredEvent[] {
  const events: StructuredEvent[] = []
  const seen = new Set<string>()
  const scripts = /<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi
  let script: RegExpExecArray | null

  function visit(value: unknown, depth = 0) {
    if (depth > 6 || events.length >= 200) return
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1)
      return
    }
    if (!record(value)) return

    if (isEvent(value['@type']) && !cancelledOrPostponed(value.eventStatus)) {
      const title = text(value.name)
      const start = eventDate(value.startDate)
      if (title && start && start.date >= today) {
        const url = firstUrl(value.url, baseUrl) || firstUrl(value['@id'], baseUrl) || baseUrl
        const key = `${title.toLowerCase()}|${start.date}|${url}`
        if (!seen.has(key)) {
          seen.add(key)
          events.push({ name: title, description: text(value.description),
            date: start.date, start_time: start.start_time, url,
            image_url: firstUrl(value.image, baseUrl) })
        }
      }
    }

    // These schema.org containers commonly wrap Event nodes. Avoid recursing
    // through arbitrary metadata, which can bring in unrelated recommendations.
    for (const field of ['@graph', 'mainEntity', 'itemListElement', 'item', 'event', 'subEvent']) {
      visit(value[field], depth + 1)
    }
  }

  while ((script = scripts.exec(html))) {
    try { visit(JSON.parse(script[1])) } catch { /* Other valid scripts can still be read. */ }
  }
  return events
}
