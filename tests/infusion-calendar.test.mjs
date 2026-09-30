import test from 'node:test'
import assert from 'node:assert/strict'
import { infusionMonthLinks, parseInfusionMonth } from '../src/lib/infusion-calendar.ts'

const origin = 'https://www.infusionblackpool.co.uk/events/'

test('discovers only upcoming official month pages, including the new year', () => {
  const html = `
    <a href="/events/december/">December</a>
    <a href="/events/january/">January</a>
    <a href="/events/february/">February</a>
    <a href="/events/june/">June</a>
    <a href="https://elsewhere.example/events/january/">Wrong venue</a>`
  assert.deepEqual(infusionMonthLinks(html, origin, '2026-12-15'), [
    `${origin}december/`, `${origin}february/`, `${origin}january/`,
  ])
})

test('reads future dated titles, skips a contradictory date, and matches existing titles', () => {
  const html = `
    <h3>Thurs</h3><p>1st</p><h3>GREEDY GIRLS</h3><p>Official event.</p>
    <h3>Fri</h3><p>23rd</p><h3>CURVES &amp; CONFIDENCE</h3><p>This Saturday we celebrate.</p>
    <h3>Fri</h3><p>30th</p><h3>😈 BAD INFLUENCE — FRIDAY 30TH OCTOBER 😈</h3><p>Official event.</p>
    <h3>Sat</h3><p>31st</p><h3>HEAVEN SENT — SATURDAY 31ST OCTOBER 😇</h3><p>Official event.</p>`
  const events = parseInfusionMonth(html, `${origin}october/`, '2026-09-29')
  assert.deepEqual(events.map(({ text, event_date }) => [text, event_date]), [
    ['GREEDY GIRLS', '2026-10-01'],
    ['BAD INFLUENCE', '2026-10-30'],
    ['HEAVEN SENT', '2026-10-31'],
  ])
  assert.deepEqual(parseInfusionMonth(html, `${origin}october/`, '2026-11-01'), [])
})

test('refuses a date with the wrong weekday or an off-site event page', () => {
  const html = '<h3>Saturday</h3><p>1st</p><h3>A made-up event</h3>'
  assert.deepEqual(parseInfusionMonth(html, `${origin}october/`, '2026-09-29'), [])
  assert.deepEqual(parseInfusionMonth(html, 'https://elsewhere.example/events/october/', '2026-09-29'), [])
})
