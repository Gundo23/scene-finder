import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseDominiumCalendar } from '../src/lib/dominium-calendar.ts'

const html = readFileSync(new URL('./fixtures/dominium-events.html', import.meta.url), 'utf8')
const url = 'https://dominiumvita.com/events/'

test('binds title, date and detail URL within each official card and removes duplicate tabs', () => {
  const events = parseDominiumCalendar(html, url, '2026-11-06')
  assert.deepEqual(events.map(({ text, event_date, href }) => [text, event_date, href]), [
    ['HIDDEN DEVIANCE', '2026-11-21', 'https://dominiumvita.com/latest-events/hidden-deviance/'],
    ['MANDRAKE SALON: ROPES & BEYOND', '2026-11-26', 'https://themandrake.com/event/ropes-and-beyond-london/'],
    ['THE BIRTHDAY BALL', '2026-12-12', 'https://dominiumvita.com/latest-events/the-birthday-ball/'],
    ['IBIZA EROS 2027', '2027-05-28', 'https://dominiumvita.com/latest-events/ibiza-eros-2027/'],
  ])
})

test('rejects a changed listing URL, wrong weekday and unsupported booking domain', () => {
  assert.deepEqual(parseDominiumCalendar(html, 'https://dominiumvita.com/', '2026-11-06'), [])
  assert.equal(parseDominiumCalendar(html.replaceAll('Saturday 21st November', 'Friday 21st November'), url, '2026-11-06').length, 3)
  assert.equal(parseDominiumCalendar(html.replaceAll('https://themandrake.com/event/ropes-and-beyond-london/', 'https://example.org/event/ropes-and-beyond-london/'), url, '2026-11-06').length, 3)
})

test('does not roll stale yearless cards into a distant future year', () => {
  const events = parseDominiumCalendar(html, url, '2026-12-13')
  assert.deepEqual(events.map((event) => event.event_date), ['2027-05-28'])
})

test('extracts the official Ibiza category when the main listing omits its card', () => {
  const category = html.slice(html.indexOf('IBIZA EROS 2027') - 600)
  const events = parseDominiumCalendar(category, 'https://dominiumvita.com/events/ibiza/', '2026-11-06')
  assert.ok(events.some((event) => event.text === 'IBIZA EROS 2027' && event.event_date === '2027-05-28'))
})
