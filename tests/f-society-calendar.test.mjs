import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFSocietyNextEvent } from '../src/lib/f-society-calendar.ts'
import { parseStructuredEvents } from '../src/lib/structured-events.ts'

const url = 'https://f-society.uk/events'
const href = `${url}/fetish-fright-night`
const title = 'F-Society: Social - Fetish Fright Night'
const event = (overrides = {}) => ({ '@type': 'Event', name: title,
  startDate: '2026-10-30T19:00:00+00:00', url: href, ...overrides })
const card = (date = '', link = '/events/fetish-fright-night') => `<section>
  <span>Next Event</span><h3 class="buy-ticket__title">${title}</h3>
  <p>7:00 PM - 12:00 AM ${date}</p><a href="${link}">View Event Details</a></section>`
const html = (body, records) => body + `<script type="application/ld+json">${JSON.stringify(records)}</script>`
const parse = (value) => parseFSocietyNextEvent(value, url, '2026-10-15',
  parseStructuredEvents(value, url, '2026-10-15'))

test('uses matching current metadata when the new next-event card hides its date', () => {
  const events = parse(html(card(), [event(), event({ name: 'Another event', url: '/events/other' })]))
  assert.equal(events.length, 1)
  assert.equal(events[0].event_date, '2026-10-30')
  assert.equal(events[0].start_time, '19:00')
  assert.equal(events[0].href, href)
})

test('does not borrow the previous event date after the next card ends', () => {
  assert.deepEqual(parse(card() + '<section>Friday 30 October 2026</section>'), [])
})

test('rejects wrong URL, title, cancelled, past, conflicting dates and offsite source', () => {
  for (const item of [event({ url: '/events/other' }), event({ name: 'Other title' }),
    event({ eventStatus: 'https://schema.org/EventCancelled' }), event({ startDate: '2025-10-31T19:00:00Z' })]) {
    assert.deepEqual(parse(html(card(), item)), [])
  }
  assert.deepEqual(parse(html(card(), [event(), event({ startDate: '2026-11-27T19:00:00Z' })])), [])
  assert.deepEqual(parse(html(card('Friday 31 October 2025'), event())), [])
  assert.deepEqual(parseFSocietyNextEvent(html(card(), event()), 'https://other.example/events', '2026-10-15', []), [])
})

test('retains the earlier explicit weekday-validated calendar format', () => {
  const result = parse(card('Friday 30 October 2026').replace('7:00 PM', '21:00'))
  assert.equal(result[0].event_date, '2026-10-30')
  assert.equal(result[0].start_time, '21:00')
  assert.deepEqual(parse(card('Thursday 30 October 2026')), [])
})
