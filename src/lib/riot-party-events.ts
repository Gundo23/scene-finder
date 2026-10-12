export type RiotPartyEvent = {
  href: string
  text: string
  event_date: string
  start_time: null
  raw: string
  image_url: null
  method: 'riot-party-outsavvy-organiser'
}

const months: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

function textFromHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&#039;/gi, "'")
    .replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function dateFromListing(value: string) {
  const match = textFromHtml(value).match(
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/i
  )
  if (!match) return null
  const year = Number(match[3])
  const month = months[match[2].toLowerCase()]
  const day = Number(match[1])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Only Riot's own organiser listing is accepted. This page includes recent
// events by other organisers, so every card must also have a Riot title and
// an explicit future date. No dates or event IDs are hardcoded.
export function parseRiotPartyOrganiser(html: string, today: string): RiotPartyEvent[] {
  if (!/<h1[^>]*>\s*Riot Party UK\s*<\/h1>/i.test(html)) return []

  const events: RiotPartyEvent[] = []
  const seen = new Set<string>()
  const anchors = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  while ((match = anchors.exec(html))) {
    let url: URL
    try { url = new URL(match[1], 'https://www.outsavvy.com') } catch { continue }
    if (!['outsavvy.com', 'www.outsavvy.com'].includes(url.hostname.toLowerCase()) ||
        !/^\/event\/\d+\/[a-z0-9-]+\/?$/i.test(url.pathname)) continue

    const card = match[2]
    if (!/class=["'][^"']*event-feed\b/i.test(card)) continue
    const title = textFromHtml(card.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i)?.[1] || '')
    if (!/^Riot(?:\s|$)/i.test(title)) continue

    const date = dateFromListing(card)
    if (!date || date < today || seen.has(url.href)) continue
    seen.add(url.href)

    const address = textFromHtml(card.match(
      /<div[^>]*class=["'][^"']*\baddress\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    )?.[1] || '')

    events.push({ href: url.href, text: title, event_date: date,
      start_time: null, raw: `${title}. ${date}. ${address}. Riot Party UK on OutSavvy.`,
      image_url: null, method: 'riot-party-outsavvy-organiser' })
  }

  return events
}
