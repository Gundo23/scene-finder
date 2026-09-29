import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

type TextItem = { str: string; x: number; y: number }
export type Route69CalendarEvent = {
  href: string
  text: string
  event_date: string
  start_time: string | null
  raw: string
  image_url: null
  method: string
}

const months = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function route69CalendarLinks(html: string, baseUrl: string, today: string) {
  const links = new Set<string>()
  const normalized = html.replace(/&amp;/gi, '&').replace(/\\\//g, '/')
  for (const match of normalized.matchAll(/(?:https?:)?\/\/[^\s"'<>]+?\.pdf(?:\?[^\s"'<>]*)?/gi)) {
    try {
      const url = new URL(match[0], baseUrl)
      if (url.hostname !== 'img1.wsimg.com' || !/^\/blobby\/go\/[^/]+\/R69Events[A-Z]{3}\d{4}[A-Z]?\.pdf$/i.test(url.pathname)) continue
      const file = url.pathname.match(/R69Events([A-Z]{3})(\d{4})[A-Z]?\.pdf$/i)
      const month = file && months.findIndex((name) => name.slice(0, 3) === file[1].toUpperCase())
      if (month === null || month === undefined || month < 0 || !file) continue
      const monthDistance = (Number(file[2]) - Number(today.slice(0, 4))) * 12 +
        month - (Number(today.slice(5, 7)) - 1)
      if (monthDistance < 0 || monthDistance > 11) continue
      links.add(url.href)
    } catch { /* Ignore malformed and off-site PDF links. */ }
  }
  return [...links].sort().slice(0, 6)
}

function collapseSpacedLetters(value: string) {
  return value.replace(/\b(?:[A-Z] ){2,}[A-Z]\b/g, (word) => word.replace(/ /g, ''))
}

export async function parseRoute69CalendarPdf(
  data: Uint8Array, pdfUrl: string, today: string
): Promise<Route69CalendarEvent[]> {
  const document = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise
  try {
    if (document.numPages !== 1) throw new Error('Unexpected Route69 calendar page count')
    const content = await (await document.getPage(1)).getTextContent()
    const items: TextItem[] = content.items.flatMap((item) => {
      if (!('str' in item) || !item.str.trim() || !('transform' in item)) return []
      return [{ str: item.str.trim(), x: item.transform[4], y: item.transform[5] }]
    })
    const header = items.map((item) => item.str).join(' ').match(/\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(20\d{2})\b/i)
    if (!header) throw new Error('Route69 calendar month missing')
    const monthIndex = months.indexOf(header[1].toUpperCase())
    const year = Number(header[2])
    const fileMonth = months.findIndex((name) => name.slice(0, 3).toLowerCase() === pdfUrl.match(/R69Events([A-Z]{3})\d{4}/i)?.[1]?.toLowerCase())
    if (fileMonth !== monthIndex || !pdfUrl.includes(String(year))) throw new Error('Route69 PDF month differs from its filename')

    const columns = weekdays.map((name) => items.find((item) => item.str === name && item.x > 250))
    if (columns.some((item) => !item)) throw new Error('Route69 calendar weekday grid missing')
    const headingY = columns[0]!.y
    const days = items.filter((item) => /^\d{1,2}$/.test(item.str) && item.x > 260 && item.y < headingY - 8 && item.y > 65)
    const rows = [...new Set(days.map((day) => Math.round(day.y / 5) * 5))].sort((a, b) => b - a)
    if (rows.length < 4 || rows.length > 6) throw new Error('Unexpected Route69 calendar grid')

    const events: Route69CalendarEvent[] = []
    const seen = new Set<string>()
    for (const day of days) {
      const dayNumber = Number(day.str)
      const date = new Date(Date.UTC(year, monthIndex, dayNumber))
      if (date.getUTCMonth() !== monthIndex) continue
      const weekday = (date.getUTCDay() + 6) % 7
      // Dates and event text start roughly 22 points left of weekday headings.
      const x = columns[weekday]!.x - 22
      if (Math.abs(day.x - x) > 30) continue
      const eventDate = date.toISOString().slice(0, 10)
      if (eventDate < today) continue
      const row = rows.findIndex((value) => Math.abs(value - day.y) <= 5)
      if (row < 0) continue
      const nextY = rows[row + 1] ?? 65
      const rightEdge = columns[weekday + 1] ? columns[weekday + 1]!.x - 29 : x + 80
      const cell = items.filter((item) => item.x >= x - 8 && item.x < rightEdge && item.y < day.y - 6 && item.y > nextY + 7)
        .sort((a, b) => b.y - a.y || a.x - b.x)
      const time = cell.find((item) => /^(?:[1258]|10)PM$/i.test(item.str))?.str.toUpperCase()
      if (!time) continue
      const titleItems = cell.filter((item) => !/^(?:\d{1,2}(?:AM|PM)|-|CLOSED)$/i.test(item.str))
      const title = collapseSpacedLetters(titleItems.map((item) => item.str).join(' '))
        .replace(/\s+/g, ' ').trim()
      if (!title || /^(?:CLUB CLOSED|OPENING TIMES|MERRY CHRISTMAS)$/i.test(title)) continue
      const key = `${eventDate}|${title.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      events.push({ href: pdfUrl, text: title, event_date: eventDate,
        start_time: time === '2PM' ? '14:00' : time === '5PM' ? '17:00' : '20:00',
        raw: `${header[1]} ${year} calendar: ${title}`, image_url: null,
        method: 'route69-pdf-calendar' })
    }
    // The October 2026 PDF prints HALLOWEEN WEEKEND across two date cells.
    const octoberFriday = events.find((event) => event.text === 'HALLOWEEK')
    const octoberSaturday = events.find((event) => event.text === 'WEENEND')
    if (monthIndex === 9 && octoberFriday && octoberSaturday &&
        Number(octoberSaturday.event_date.slice(-2)) === Number(octoberFriday.event_date.slice(-2)) + 1) {
      octoberFriday.text = octoberSaturday.text = 'Halloween Weekend'
      octoberFriday.raw = octoberSaturday.raw = `OCTOBER ${year} calendar: Halloween Weekend`
    }
    const calendarMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    if (events.length === 0 && calendarMonth > today.slice(0, 7)) {
      throw new Error('No named future events in Route69 calendar')
    }
    return events
  } finally {
    await document.destroy()
  }
}
