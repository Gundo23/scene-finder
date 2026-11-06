import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parsePenthouseCalendar } from '../src/lib/penthouse-calendar.ts'
import { parseEcclesiaCalendar } from '../src/lib/ecclesia-calendar.ts'

const fixture = name => readFileSync(new URL(`./fixtures/${name}-2026-11-06.html`, import.meta.url), 'utf8')

test('Penthouse reads the official upcoming objects, never a neighbouring date or poster', () => {
  const html = fixture('penthouse')
  const url = 'https://penthouse-playrooms.co.uk/events'
  const events = parsePenthouseCalendar(html, url, '2026-11-06')
  assert.deepEqual(events.map(({ text, event_date, start_time, href }) => [text, event_date, start_time, href]), [
    ['Wicked Wednesday - Daytime Play Party', '2026-12-16', '11:00', 'https://penthouse-playrooms.co.uk/event/2098'],
    ['KTX - Kinky Tease Xtreme Play Event', '2026-12-27', '12:00', 'https://penthouse-playrooms.co.uk/event/2088'],
    ['New Years Eve Party -', '2026-12-31', '19:00', 'https://penthouse-playrooms.co.uk/event/2127'],
  ])
  assert.deepEqual(parsePenthouseCalendar(html, url, '2026-12-27').map(e => e.text),
    ['KTX - Kinky Tease Xtreme Play Event', 'New Years Eve Party -'])
  assert.deepEqual(parsePenthouseCalendar(html, 'https://other.example/events', '2026-11-06'), [])
  assert.deepEqual(parsePenthouseCalendar(html.replace('"upcomingEvents":', '"pastEvents2":'), url, '2026-11-06'), [])
  assert.deepEqual(parsePenthouseCalendar(html.replace('"starts_at":"2026-12-27T12:00:00', '"starts_at":"2026-02-30T12:00:00'), url, '2026-11-06')
    .map(e => e.text), [events[0].text, events[2].text])
})

test('Ecclesia binds the official card heading to its own date and URL', () => {
  const html = fixture('ecclesia')
  const url = 'https://www.ecclesiaglasgow.com/upcoming-events/'
  const events = parseEcclesiaCalendar(html, url, '2026-11-06')
  assert.deepEqual(events.map(({ text, event_date, start_time, href }) => [text, event_date, start_time, href]), [
    ['Speed Dating', '2026-12-05', '20:00', 'https://www.ecclesiaglasgow.com/event/5th-december-2026/'],
    ['LGBT Night: Christmas Special', '2026-12-11', '20:00', 'https://www.ecclesiaglasgow.com/event/11th-december-2026/'],
    ['Sins & Sleigh Bells', '2026-12-12', '21:00', 'https://www.ecclesiaglasgow.com/event/12th-december-2026/'],
  ])
  assert.deepEqual(parseEcclesiaCalendar(html + html, url, '2026-11-06'), events)
  assert.deepEqual(parseEcclesiaCalendar(html, url, '2026-12-06').map(e => e.text), ['LGBT Night: Christmas Special', 'Sins & Sleigh Bells'])
  assert.deepEqual(parseEcclesiaCalendar(html, 'https://www.ecclesiaglasgow.com/event_listing_category/socials/', '2026-11-06'), [])
  assert.deepEqual(parseEcclesiaCalendar(html.replace('data-start="2026-12-05"', 'data-start="2026-12-32"'), url, '2026-11-06')
    .map(e => e.text), ['LGBT Night: Christmas Special', 'Sins & Sleigh Bells'])
})

test('the route uses only these dedicated calendars and one official page per venue', () => {
  const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  assert.match(route, /source\.venue_id === 'penthouse_playrooms_dunstable'\) return \['https:\/\/penthouse-playrooms\.co\.uk\/events'\]/)
  assert.match(route, /source\.venue_id === 'ecclesia_glasgow'\) return \['https:\/\/www\.ecclesiaglasgow\.com\/upcoming-events\/'\]/)
  assert.match(route, /source\.venue_id === 'penthouse_playrooms_dunstable' \|\|\s+source\.venue_id === 'ecclesia_glasgow'/)
  assert.doesNotMatch(route, /fetchPenthouseBundleEvents|extractPenthouseEventsFromText/)
})
