const months: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

// The current Cupids calendar links to /events/?event=<id>, not /events/<slug>.
export function cupidsEventDetailLinks(html: string, pageUrl: string) {
  const links = new Set<string>()
  const anchors = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = anchors.exec(html)) !== null) {
    try {
      const url = new URL(match[1].replace(/&amp;/gi, '&'), pageUrl)
      if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'cupidsswingersclub.co.uk' ||
          url.pathname.replace(/\/+$/, '') !== '/events' ||
          !/^\d+$/.test(url.searchParams.get('event') || '')) continue
      url.hash = ''
      links.add(url.href)
    } catch {
      // Ignore malformed links on the official listing.
    }
  }
  return [...links]
}

export function cupidsDetailDate(html: string) {
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
  // Use the start date after "Date"; the next date can be an overnight end date.
  const match = text.match(/\bDate\s*(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+)?(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d{2})\b/i)
  if (!match) return null
  const month = months[match[2].slice(0, 3).toLowerCase()]
  if (!month) return null
  const date = `${match[3]}-${month}-${match[1].padStart(2, '0')}`
  const parsed = new Date(`${date}T12:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date : null
}
