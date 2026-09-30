import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDv8Calendar } from '../src/lib/dv8-calendar.ts'

const url = 'https://dv8club.co.uk/'
const html = `
<!-- <div class="dv8-featured-event"><h2>Editor example</h2></div> -->
<div class="dv8-featured-event"><h2>Past party</h2><h3>Saturday 19th September 2026</h3></div>
<div class="dv8-featured-event"><h2>Purple Events: Early Halloween Party</h2>
  <h3>Saturday 24th October 2026</h3></div>
<div class="dv8-featured-event dv8-past-event"><h2>Old party</h2><h3>Saturday 31st October 2026</h3></div>
<div class="dv8-regular-events">
  <div class="event-item"><strong>Every Saturday</strong><span>DV8 Open Night</span></div>
  <div class="event-item"><strong>First Saturday</strong><span>DV8 Bi Night</span></div>
  <div class="event-item"><strong>Last Saturday</strong><span>Cubs &amp; Cougars</span></div>
  <div class="event-item"><strong>Third Friday</strong><span>Glitter Gurlz</span></div>
  <div class="event-item"><strong>Last Friday</strong><span>Club XS</span></div>
  <div class="event-item"><strong>Special Events</strong><span>Hosted throughout the year</span></div>
</div>`

test('renews a rolling calendar from published DV8 recurrence rules', () => {
  const events = parseDv8Calendar(html, url, '2026-09-30')
  assert.deepEqual(events.filter((event) => event.event_date <= '2026-10-31')
    .map(({ text, event_date }) => [event_date, text]), [
      ['2026-10-03', 'DV8 Bi Night'],
      ['2026-10-10', 'DV8 Open Night'],
      ['2026-10-16', 'Glitter Gurlz'],
      ['2026-10-17', 'DV8 Open Night'],
      ['2026-10-24', 'Purple Events: Early Halloween Party'],
      ['2026-10-30', 'Club XS'],
      ['2026-10-31', 'Cubs & Cougars'],
    ])
  assert.ok(events.some((event) => event.event_date === '2026-12-19'))
  assert.ok(events.every((event) => event.href === url && event.event_date >= '2026-09-30'))
})

test('refuses source pages from other sites and invalid or contradictory dates', () => {
  assert.deepEqual(parseDv8Calendar(html, 'https://other.example/', '2026-09-30'), [])
  assert.deepEqual(parseDv8Calendar(html, url, '2026-09-31'), [])
  const bad = '<div class="dv8-featured-event"><h2>Incorrect date</h2><h3>Friday 24th October 2026</h3></div>'
  assert.deepEqual(parseDv8Calendar(bad, url, '2026-09-30'), [])
})
