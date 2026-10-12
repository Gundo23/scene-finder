import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStructuredEvents } from '../src/lib/structured-events.ts'

test('extracts future events from nested graphs, lists, and image objects', () => {
  const html = `<script data-source="calendar" type="application/ld+json">${JSON.stringify({
    '@type': 'WebPage',
    mainEntity: { '@type': 'ItemList', itemListElement: [
      { '@type': 'ListItem', item: {
        '@type': ['Event', 'MusicEvent'], name: 'Newbie Social',
        startDate: '2026-11-05T20:30:00+00:00', url: '/event/newbie-social',
        image: { '@type': 'ImageObject', contentUrl: '/images/newbie.webp' },
      } },
      { '@type': 'ListItem', item: { '@type': 'SocialEvent', name: 'Winter Party',
        startDate: '2026-12-02', url: '/event/winter-party' } },
    ] },
  })}</script>`
  const events = parseStructuredEvents(html, 'https://club.example/events/', '2026-10-12')
  assert.deepEqual(events.map((event) => [event.name, event.date]), [
    ['Newbie Social', '2026-11-05'], ['Winter Party', '2026-12-02'],
  ])
  assert.equal(events[0].start_time, '20:30')
  assert.equal(events[0].url, 'https://club.example/event/newbie-social')
  assert.equal(events[0].image_url, 'https://club.example/images/newbie.webp')
})

test('rejects past, impossible, cancelled, unrelated and undated listings', () => {
  const payload = { '@graph': [
    { '@type': 'Event', name: 'Past', startDate: '2026-10-11' },
    { '@type': 'Event', name: 'Impossible', startDate: '2026-11-31' },
    { '@type': 'Event', name: 'Cancelled', startDate: '2026-11-22',
      eventStatus: 'https://schema.org/EventCancelled' },
    { '@type': 'Event', name: 'No date' },
    { '@type': 'Product', name: 'Party package', startDate: '2026-11-20' },
    { '@type': 'Event', name: 'Real party', startDate: '2026-11-20' },
  ] }
  const html = `<script type="application/ld+json">bad JSON</script>
    <script type="application/ld+json">${JSON.stringify(payload)}</script>`
  assert.deepEqual(parseStructuredEvents(html, 'https://club.example/', '2026-10-12')
    .map((event) => event.name), ['Real party'])
})
