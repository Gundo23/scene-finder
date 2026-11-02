// Ignite's Elementor/EWPE calendar publishes explicit day/month/year fields.
// Never infer occurrences from a recurring title or a date-looking URL slug.
function officialUrl(value: string, base?: string) {
  try {
    const url = new URL(value, base)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'club-ignite.co.uk') return null
    url.hash = ''
    return url
  } catch { return null }
}

function text(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&#(?:0*38|x26);|&amp;/gi, '&')
    .replace(/&#(?:8217|x2019);|&rsquo;/gi, "'").replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function visibleHtml(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, '')
}

export function parseIgniteElementorCalendar(html: string, pageUrl: string, today: string) {
  const page = officialUrl(pageUrl)
  if (!page || !/^\/events(?:-new)?\/?$/.test(page.pathname) || !/^20\d{2}-\d{2}-\d{2}$/.test(today)) return []
  const source = visibleHtml(html)
  const starts = [...source.matchAll(/<div\b[^>]*class\s*=\s*["'][^"']*\bewpe-events-schedule\b[^"']*["'][^>]*>/gi)]
  const events = []
  const seen = new Set<string>()
  for (let index = 0; index < starts.length; index++) {
    const card = source.slice(starts[index].index, starts[index + 1]?.index)
    const field = (name: string) => text(card.match(new RegExp(`<span\\b[^>]*class\\s*=\\s*["'][^"']*\\bewpe-ev-${name}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/span>`, 'i'))?.[1] || '')
    const day = field('day'), year = field('yr')
    const month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(field('mo').toLowerCase()) + 1
    if (!/^\d{1,2}$/.test(day) || !/^20\d{2}$/.test(year) || !month) continue
    const date = `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`
    const instant = new Date(`${date}T12:00:00Z`)
    if (!Number.isFinite(instant.getTime()) || instant.toISOString().slice(0, 10) !== date || date < today) continue
    const heading = card.match(/<a\b([^>]*)>\s*<h[1-6]\b[^>]*class\s*=\s*["'][^"']*\bewpe-event-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>\s*<\/a>/i)
    if (!heading) continue
    const href = heading[1].match(/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
    const url = href && officialUrl(href[1] || href[2] || href[3], pageUrl)
    const title = text(heading[2])
    if (!url || !/^\/events\/[^/?#]+\/?$/.test(url.pathname) || !title || /\bcancell?ed\b/i.test(title)) continue
    const key = `${url.href.replace(/\/$/, '')}|${date}`
    if (seen.has(key)) continue
    seen.add(key)
    events.push({ href: url.href, text: title, event_date: date, start_time: null,
      raw: `${title}. Official Ignite calendar date ${date}.`, image_url: null, method: 'ignite-elementor-calendar' })
  }
  return events
}

// Only the matching official Event's local startDate supplies a time. Avoid
// admission deadlines, end times and unrelated JSON-LD events on the page.
export function parseIgniteDetailTime(html: string, pageUrl: string, eventDate: string): string | null {
  const page = officialUrl(pageUrl)
  if (!page || !/^\/events\/[^/]+\/?$/.test(page.pathname)) return null
  const visit = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null
    if (Array.isArray(value)) {
      for (const item of value) { const result = visit(item); if (result) return result }
      return null
    }
    const node = value as Record<string, unknown>
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
    if (types.includes('Event') && typeof node.url === 'string' && typeof node.startDate === 'string') {
      const url = officialUrl(node.url)
      const start = node.startDate.match(/^(20\d{2}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?(?:Z|[+-]\d{2}:\d{2})?$/)
      if (url && url.pathname.replace(/\/$/, '') === page.pathname.replace(/\/$/, '') && start?.[1] === eventDate) return `${start[2]}:${start[3]}`
    }
    return visit(node['@graph'])
  }
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const result = visit(JSON.parse(script[1])); if (result) return result } catch { /* try the next JSON-LD block */ }
  }
  return null
}
