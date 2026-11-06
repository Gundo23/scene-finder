import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseAnnexCalendar } from '../src/lib/annex-calendar.ts'

const html = readFileSync(new URL('./fixtures/annex-calendar.html', import.meta.url), 'utf8')
const url = 'https://theannex.org.uk/3-month-to-view-calendar/'

test('extracts each official November and December occurrence with its own date, time and detail', () => {
  const events = parseAnnexCalendar(html, url, '2026-11-06')
  assert.equal(events.length, 27)
  assert.deepEqual(events.filter((event) => event.event_date === '2026-11-06')
    .map(({ text, start_time }) => [text, start_time]), [
      ['FAB FRiDAY SPA n PLAY DAYTIME', '11:00'],
      ['MORE! MORE! MORE!', '20:00'],
    ])
  assert.ok(events.some((event) => event.event_date === '2026-12-27' &&
    event.text === 'VJ’s BETWiXMAS DRESS DOWN HANGOUT!' && event.start_time === '12:00'))
  assert.ok(events.some((event) => event.event_date === '2026-12-31' &&
    event.text === 'SWiNGiNG NYE ANNEX BLOWOUT!' && event.start_time === '20:30'))
  assert.ok(events.every((event) => !/ADVANCED PARTY CALENDAR|CLUB PROMO/i.test(event.text)))
})

test('rejects a wrong calendar URL, weekday mismatch and external event link', () => {
  assert.deepEqual(parseAnnexCalendar(html, 'https://theannex.org.uk/club-news-2026/', '2026-11-06'), [])
  const wrongDay = html.replace('Friday 6th:', 'Thursday 6th:')
  assert.equal(parseAnnexCalendar(wrongDay, url, '2026-11-06').length, 26)
  const offsite = html.replace('https://theannex.org.uk/more-more-amour/', 'https://example.org/more-more-amour/')
  assert.equal(parseAnnexCalendar(offsite, url, '2026-11-06').length, 26)
})

test('does not roll an old undated month into a distant future year', () => {
  assert.deepEqual(parseAnnexCalendar(html, url, '2027-01-01'), [])
})
