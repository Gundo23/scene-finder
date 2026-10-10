import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePartnersCalendar } from '../src/lib/partners-calendar.ts'

const page = `
<h2>Upcoming events at Partners.</h2>
<div class="partners-event-board">
  <div class="partners-event-month-heading partners-event-month-heading--compact"><p>October 2026</p></div>
  <article class="partners-event-detail-card"><div class="partners-event-detail-card__top">
    <span class="partners-event-date">Friday 9th October</span></div>
    <h3>NEWBIES &amp; NOT SO’S</h3><dl><div><dt>Times</dt><dd>8pm–3am</dd></div></dl>
    <div class="partners-event-description"><p>A friendly night.</p></div>
  </article>
  <article class="partners-event-detail-card"><span class="partners-event-date">Saturday 10th October</span>
    <h3>SECRET DESIRES</h3><dl><div><dt>Times</dt><dd>8pm–3am</dd></div></dl></article>
  <div class="partners-event-month-heading"><p>November 2026</p></div>
  <article class="partners-event-detail-card"><span class="partners-event-date">Sunday 1st November</span>
    <h3>SPOOKTACULAR</h3><dl><div><dt>Times</dt><dd>8pm–1am</dd></div></dl></article>
</div>`

test('reads each official event card with its month and filters expired dates', () => {
  const events = parsePartnersCalendar(page, 'https://partnersswingersclub.com/events/', '2026-10-10')
  assert.deepEqual(events.map((event) => [event.event_date, event.text, event.start_time]), [
    ['2026-10-10', 'SECRET DESIRES', '20:00'],
    ['2026-11-01', 'SPOOKTACULAR', '20:00'],
  ])
  assert.ok(events.every((event) => event.href === 'https://partnersswingersclub.com/events/'))
  assert.deepEqual(parsePartnersCalendar(page, 'https://other.example/events/', '2026-10-10'), [])
})
