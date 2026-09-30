const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const weekdays: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

export type Dv8Event = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: string | null
  method: string
}

function plain(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function isoDate(year: number, month: number, day: number, weekday?: number) {
  const date = new Date(Date.UTC(year, month, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month ||
      date.getUTCDate() !== day || (weekday !== undefined && date.getUTCDay() !== weekday)) return null
  return date.toISOString().slice(0, 10)
}

function recurringSchedule(value: string) {
  const match = value.match(/^(Every|First|Third|Last)\s+(Friday|Saturday)$/i)
  if (!match) return null
  return { occurrence: match[1].toLowerCase(), weekday: weekdays[match[2].toLowerCase()] }
}

function occursOn(date: Date, occurrence: string) {
  const day = date.getUTCDate()
  if (occurrence === 'every') return true
  if (occurrence === 'first') return day <= 7
  if (occurrence === 'third') return day >= 15 && day <= 21
  const nextWeek = new Date(date.getTime() + 7 * 86400000)
  return nextWeek.getUTCMonth() !== date.getUTCMonth()
}

export function parseDv8Calendar(html: string, pageUrl: string, today: string): Dv8Event[] {
  let url: URL
  try {
    url = new URL(pageUrl)
    if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== 'dv8club.co.uk' ||
        url.pathname !== '/') return []
  } catch { return [] }
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today) ||
      isoDate(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, Number(today.slice(8, 10))) !== today) return []

  // The page contains instructions for editors in HTML comments, including a
  // sample past-event class. They are not event listings.
  const page = html.replace(/<!--[\s\S]*?-->/g, '')
  const end = new Date(`${today}T00:00:00Z`).getTime() + 84 * 86400000
  const events = new Map<string, Dv8Event>()
  const featuredStarts = [...page.matchAll(/<div\b[^>]*class=["'][^"']*\bdv8-featured-event\b[^"']*["'][^>]*>/gi)]
  for (let i = 0; i < featuredStarts.length; i++) {
    const start = featuredStarts[i]
    if (/\bdv8-past-event\b/i.test(start[0])) continue
    const regularStart = page.indexOf('dv8-regular-events', start.index!)
    const blockEnd = featuredStarts[i + 1]?.index ?? (regularStart >= 0 ? regularStart : page.length)
    const block = page.slice(start.index! + start[0].length, blockEnd)
    const title = plain(block.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || '')
    const dateText = plain(block.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '')
    const dateParts = dateText.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})$/i)
    if (!dateParts || !title || title.length > 150) continue
    const month = months.indexOf(dateParts[3].toLowerCase())
    if (month < 0) continue
    const date = isoDate(Number(dateParts[4]), month, Number(dateParts[2]), weekdays[dateParts[1].toLowerCase()])
    if (!date || date < today) continue
    // Published, explicitly dated specials take precedence over generic open
    // nights on the same day. Keep specials beyond the rolling horizon.
    events.set(date, { href: url.href, text: title, event_date: date,
      start_time: null, raw: `${title}. ${dateText}. Listed on DV8 Club's official site.`,
      image_url: null, method: 'dv8-featured' })
  }

  const rules: { title: string; occurrence: string; weekday: number }[] = []
  const regularSection = page.split(/<div\b[^>]*class=["']dv8-regular-events["'][^>]*>/i)[1] || ''
  for (const match of regularSection.matchAll(/<div\b[^>]*class=["']event-item["'][^>]*>([\s\S]*?)<\/div>/gi)) {
    const schedule = plain(match[1].match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i)?.[1] || '')
    const title = plain(match[1].match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
    const rule = recurringSchedule(schedule)
    if (rule && title && title.length <= 150) rules.push({ title, ...rule })
  }

  for (let day = new Date(`${today}T00:00:00Z`).getTime(); day <= end; day += 86400000) {
    const date = new Date(day)
    const key = date.toISOString().slice(0, 10)
    if (events.has(key)) continue
    // Specific themed nights replace the generic Saturday open night.
    const applicable = rules.filter((rule) => rule.weekday === date.getUTCDay() && occursOn(date, rule.occurrence))
    const rule = applicable.find((item) => item.occurrence !== 'every') || applicable[0]
    if (!rule) continue
    events.set(key, { href: url.href, text: rule.title, event_date: key,
      start_time: null, raw: `${rule.title}. ${rule.occurrence} ${Object.keys(weekdays).find((name) => weekdays[name] === rule.weekday)} at DV8 Club, according to its official recurring schedule.`,
      image_url: null, method: 'dv8-recurring' })
  }

  return [...events.values()].sort((a, b) => a.event_date.localeCompare(b.event_date))
}
