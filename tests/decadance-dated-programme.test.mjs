import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDecadanceEvent, DECADANCE_CALENDAR_URL } from '../src/lib/decadance-calendar.ts'

const card = (date, href, extra = '') => `<h3>${date}</h3><div><a href="${href}"><picture><img alt="" src="poster.png"></picture></a>${extra}</div>`
const page = body => `<h1>What's on at DECADANCE Rochdale</h1>${body}<footer>Copyright © 2026 Decadance Swingers Club</footer>`
const parse = html => parseDecadanceEvent(html, DECADANCE_CALENDAR_URL, '2026-10-30')

test('reads explicit dated programme links including December without projecting missing days', () => {
  const html = page(card('21st November', '/new-regular-weekly-lineup/sexxxy-saturday') +
    card('22th November', '/what-s-on-at-decadance/regular-weekly-lineup/sunday-sunday-service') +
    card('23rd November', '/new-regular-weekly-lineup/monday-funday') +
    card('2nd December', '/what-s-on-at-decadance/regular-weekly-lineup/midweek-at-the-madhouse'))
  assert.deepEqual(parse(html).map(e => [e.text, e.event_date]), [
    ['SeXXXy Saturday', '2026-11-21'], ['Sunday Service', '2026-11-22'],
    ['Monday Funday', '2026-11-23'], ['Midweek at the Madhouse', '2026-12-02'],
  ])
  assert.ok(parse(html).every(e => e.start_time === null))
  assert.deepEqual(parse(html.replace('2026 Decadance', '2025 Decadance')), [])
})

test('rejects wrong weekdays, offsite links, closed/TBC dates and special-event conflicts', () => {
  assert.deepEqual(parse(page(card('22th November', '/new-regular-weekly-lineup/sexxxy-saturday'))), [])
  assert.deepEqual(parse(page(card('21st November', 'https://example.com/new-regular-weekly-lineup/sexxxy-saturday'))), [])
  for (const extra of ['Closed', 'Details TBC', 'Cancelled', '<a href="/what-s-on-at-decadance/events-coming-soon/21-11-special">Special</a>']) {
    assert.deepEqual(parse(page(card('21st November', '/new-regular-weekly-lineup/sexxxy-saturday', extra))), [])
  }
  assert.deepEqual(parse(page('<script>' + card('21st November', '/new-regular-weekly-lineup/sexxxy-saturday') + '</script>')), [])
})
