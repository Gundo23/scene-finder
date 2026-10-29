export const MA1_BUNKER_SCHEDULE_URL = 'https://www.sewellandmarbury.co.uk/ma1home18.html'

type PublishedEvent = {
  href: string
  text: string
  event_date: string
  start_time: string
  raw: string
  image_url: null
  method: string
}

function visibleText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp);|&#(?:160|38);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function validToday(today: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(today)) return null
  const date = new Date(`${today}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === today ? date : null
}

function isOfficialPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    return url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === 'sewellandmarbury.co.uk' &&
      url.pathname.replace(/\/+$/, '').toLowerCase() === '/ma1home18.html' &&
      !url.username && !url.password && !url.port && !url.search && !url.hash
  } catch {
    return false
  }
}

type Rule = {
  name: string
  weekday: number
  ordinal?: number
  months?: number[]
  start: string
  proof: RegExp
  untilYear?: number
}

function ordinalInMonth(date: Date) {
  return Math.floor((date.getUTCDate() - 1) / 7) + 1
}

export function parseMa1BunkerSchedule(html: string, pageUrl: string, today: string): PublishedEvent[] {
  if (!isOfficialPage(pageUrl)) return []
  const first = validToday(today)
  if (!first) return []
  const text = visibleText(html)
  if (!/MA1:\s*The Bunker,\s*215-221 City Road,\s*London,\s*EC1V 1JN/i.test(text) ||
      !/Sewell and Marbury[\s\S]{0,120}events operate with permission of MA1:\s*Bunker/i.test(text) ||
      /\b(?:MA1|The Bunker)\s+(?:has\s+)?(?:closed permanently|ceased trading)\b/i.test(text)) return []

  const rules: Rule[] = [
    { name: 'London Jack Off Club', weekday: 1, start: '18:00', proof: /Every Monday 6pm to 10pm[\s\S]{0,300}?original club for men who like Jacking Off/i },
    { name: 'ClubCP', weekday: 2, start: '18:00', proof: /Tuesday 6pm to 10pm[\s\S]{0,120}?ClubCP returns every Tuesday/i },
    { name: 'Buff', weekday: 3, start: '18:00', proof: /Every Wednesday 6pm to 10pm[\s\S]{0,120}?Buff hosts their midweek session/i },
    { name: 'Buff', weekday: 5, start: '18:00', proof: /Every Friday 6pm to 10pm[\s\S]{0,120}?Buff is one/i },
    { name: 'Buff', weekday: 0, start: '18:00', proof: /Every Sunday 6pm to (?:10pm|Midnight)[\s\S]{0,180}?Buff on Sunday/i },
    { name: 'Boyz & Sirs', weekday: 6, start: '14:00', proof: /Saturday afternoon 2pm to 6pm[\s\S]{0,120}?Boyz\s*&\s*Sirs/i },
    { name: 'Blackout', weekday: 6, start: '18:00', proof: /Saturday evening 6pm to 10pm[\s\S]{0,120}?club [“\"]?Blackout/i },
    { name: 'Bearbait', weekday: 4, ordinal: 1, start: '18:00', proof: /1\s*st Thursday of the month 6pm to 10pm[\s\S]{0,160}?Bearbait/i },
    { name: 'SM-Gays', weekday: 4, ordinal: 3, start: '18:00', proof: /3\s*rd Thursday of the month 6pm to 11pm[\s\S]{0,120}?SM-Gays/i },
    { name: 'Stripped', weekday: 6, ordinal: 1, start: '22:00', proof: /1\s*st Saturday of the month 10pm-4am[\s\S]{0,100}?Stripped/i },
    { name: 'Roadworks', weekday: 6, ordinal: 2, start: '22:00', untilYear: 2026, proof: /2\s*nd Saturday of the month 10pm to 4am[\s\S]{0,100}?Roadwiorks is FREE in Hi-Viz for the rest of 2026/i },
    { name: 'Fitladz/Fitdadz', weekday: 6, ordinal: 4, start: '22:00', proof: /4\s*th Saturday of the month 10pm to 4am[\s\S]{0,100}?Fitladz\/Fitdadz/i },
    { name: 'Sukit', weekday: 0, ordinal: 1, start: '14:00', proof: /1\s*st Sunday of the month 2pm to 6pm[\s\S]{0,180}?called [“\"]?Sukit/i },
    { name: 'Rimpack', weekday: 0, ordinal: 3, start: '14:00', proof: /3\s*rd Sunday of the month 2pm to 6pm[\s\S]{0,100}?Rimpack/i },
    { name: 'Buff & London Jack Off Club', weekday: 0, ordinal: 4, start: '14:00', proof: /4\s*th Sunday of the month 2pm to 6pm[\s\S]{0,100}?Buff\s*&\s*London Jack Off Club/i },
    { name: 'Rimpack', weekday: 0, ordinal: 5, start: '14:00', proof: /5\s*th Sunday of the month[\s\S]{0,100}?Rimpack/i },
    { name: 'GBU', weekday: 5, ordinal: 1, start: '22:00', proof: /1\s*st Friday of the month 10pm to 4am[\s\S]{0,80}?GBU returns/i },
    { name: 'House of Sheba', weekday: 5, ordinal: 2, start: '22:30', proof: /2\s*nd Friday of the month 10\.30pm-4\.30am[\s\S]{0,100}?House of Sheba/i },
    { name: 'Roma Trans', weekday: 5, ordinal: 4, start: '22:00', proof: /4\s*th Friday of the month 10pm to 4am[\s\S]{0,120}?Roma Trans/i },
    { name: 'Rubberslut', weekday: 5, ordinal: 5, start: '22:00', proof: /5\s*th Friday of the month 10pm to 4am[\s\S]{0,100}?Rubberslut/i },
    { name: 'Eastern Promise', weekday: 3, ordinal: 2, start: '18:00', proof: /2\s*nd Wednesday of the month 6pm to 10pm[\s\S]{0,100}?Eastern Promise/i },
    { name: 'Buff Blackout Edition', weekday: 3, ordinal: 3, start: '18:00', proof: /3\s*rd Wednesday of the month[\s\S]{0,100}?Buff Blackout Edition/i },
    { name: 'Mandem-DL', weekday: 3, ordinal: 4, start: '18:00', proof: /4\s*th Wednesday of the month[\s\S]{0,100}?Mandem-DL/i },
  ].filter(rule => rule.proof.test(text))

  const events: PublishedEvent[] = []
  const seen = new Set<string>()
  for (let offset = 0; offset < 42; offset++) {
    const date = new Date(first)
    date.setUTCDate(first.getUTCDate() + offset)
    for (const rule of rules) {
      if (date.getUTCDay() !== rule.weekday || (rule.ordinal && ordinalInMonth(date) !== rule.ordinal) ||
          (rule.months && !rule.months.includes(date.getUTCMonth() + 1)) ||
          (rule.untilYear && date.getUTCFullYear() > rule.untilYear)) continue
      const eventDate = date.toISOString().slice(0, 10)
      const key = `${rule.name}|${eventDate}|${rule.start}`
      if (seen.has(key)) continue
      seen.add(key)
      events.push({
        href: MA1_BUNKER_SCHEDULE_URL,
        text: rule.name,
        event_date: eventDate,
        start_time: rule.start,
        raw: `Official MA1: The Bunker programme: ${rule.name}.`,
        image_url: null,
        method: 'ma1-bunker-published-schedule',
      })
    }
  }

  const exact = text.match(/5\s*th Saturday\s+10pm to 4am\s*\(31\s*st October 2026\)[\s\S]{0,180}?Gooniversity/i)
  if (exact && today <= '2026-10-31') {
    events.push({
      href: MA1_BUNKER_SCHEDULE_URL,
      text: 'Gooniversity',
      event_date: '2026-10-31',
      start_time: '22:00',
      raw: 'Official MA1: The Bunker programme: Gooniversity.',
      image_url: null,
      method: 'ma1-bunker-explicit-date',
    })
  }

  return events.sort((a, b) => a.event_date.localeCompare(b.event_date) || a.start_time.localeCompare(b.start_time) || a.text.localeCompare(b.text))
}
