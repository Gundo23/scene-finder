import test from 'node:test'
import assert from 'node:assert/strict'
import { parseTownhouseLocation } from '../src/lib/townhouse-location-calendar.ts'

const url = 'https://townhouseswingers.com/event-location/townhouse/'
const event = (title, date, href, state = '') => `
<div class="eventon_list_event ${state}" itemscope itemtype="http://schema.org/Event">
  <a itemprop='url' href='${href}'></a>
  <meta itemprop='startDate' content="${date}" />
  <span class="evoet_title evcal_desc2">${title}</span>
</div>`

test('renews from the official venue location with dated EventON rows', () => {
  const html = [
    event('Past', '2026-09-29T20:00+0:00', '/events/past/'),
    event('Couples &amp; Single Ladies', '2026-10-3T20:00+0:00', '/events/couples/'),
    event('Next party', '2026-11-7T19:30+0:00', 'https://townhouseswingers.com/events/next/'),
    event('Couples &amp; Single Ladies', '2026-10-3T20:00+0:00', '/events/couples/'),
  ].join('')
  assert.deepEqual(parseTownhouseLocation(html, url, '2026-09-30')
    .map(({ text, event_date, start_time, href }) => [text, event_date, start_time, href]), [
      ['Couples & Single Ladies', '2026-10-03', '20:00', 'https://townhouseswingers.com/events/couples/'],
      ['Next party', '2026-11-07', '19:30', 'https://townhouseswingers.com/events/next/'],
    ])
})

test('rejects a changed source, offsite links and invalid dates', () => {
  const html = event('Other event', '2026-10-03T20:00+0:00', 'https://other.example/events/one/') +
    event('Invalid date', '2026-02-31T20:00+0:00', '/events/two/') +
    event('Cancelled party', '2026-10-03T20:00+0:00', '/events/three/', 'cancelled')
  assert.deepEqual(parseTownhouseLocation(html, url, '2026-09-30'), [])
  assert.deepEqual(parseTownhouseLocation(event('Party', '2026-10-03T20:00+0:00', '/events/one/'),
    'https://other.example/event-location/townhouse/', '2026-09-30'), [])
})
