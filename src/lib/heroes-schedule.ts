export const HEROES_CALENDAR_URL = 'https://www.heroessauna.co.uk/'

function visibleText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp);|&#(?:160|38);/gi, ' ')
    .replace(/\s+/g, ' ').trim()
}

// Expand only the weekly rule currently published in the venue's Events section.
// Opening hours do not establish event start times.
export function parseHeroesSchedule(html: string, pageUrl: string, today: string) {
  try {
    const url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'heroessauna.co.uk' ||
        url.pathname !== '/') return []
  } catch { return [] }
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
  const text = visibleText(visible)
  if (!/\bHeroes\b/i.test(text) || !/\bStourbridge\b/i.test(text)) return []
  const headings = [...visible.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
  const heading = headings.findIndex(match => /^events$/i.test(visibleText(match[1])))
  if (heading < 0) return []
  const start = headings[heading].index! + headings[heading][0].length
  const section = visibleText(visible.slice(start, headings[heading + 1]?.index))
  if (!/^Every Thursday and Sunday we host a Dare\s*2\s*Bare\b/i.test(section) ||
      /\b(?:cancelled|canceled|suspended|no longer|not running|on hold)\b/i.test(section)) return []
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today)) return []
  const first = new Date(`${today}T12:00:00Z`)
  if (!Number.isFinite(first.getTime()) || first.toISOString().slice(0, 10) !== today) return []
  const events = []
  for (let day = 0; day < 42; day++) {
    const date = new Date(first)
    date.setUTCDate(date.getUTCDate() + day)
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 4) continue
    events.push({
      href: `${HEROES_CALENDAR_URL}#events`, text: 'Dare 2 Bare',
      event_date: date.toISOString().slice(0, 10), start_time: null,
      raw: 'Heroes Health Club, Stourbridge: Dare 2 Bare, published every Thursday and Sunday. Event start time not specified.',
      image_url: null, method: 'heroes-published-weekly',
    })
  }
  return events
}

// The former official Gentry domain served unrelated gambling content on 20 Oct.
// Do not treat a successful HTTP response as a verified venue page.
export function venueSourceIdentityError(venueId: string, pageUrl: string, html: string) {
  if (venueId !== 'gentry_spa_kingston_upon_hull') return null
  let host: string
  try { host = new URL(pageUrl).hostname.replace(/^www\./, '') } catch { return null }
  if (host !== 'gentryhull.com') return null
  const text = visibleText(html)
  return /\bGentry\b/i.test(text) && /\bHull\b/i.test(text) &&
    !/\b(?:mariototo|slot gacor|situs slot|daftar akun)\b/i.test(text)
    ? null : 'Gentry Hull source no longer verifies venue identity; existing events preserved'
}
