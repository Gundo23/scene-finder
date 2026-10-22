import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseAtlantisSchedule, parseSweatboxSchedule, parseUntamedListing } from '../src/lib/published-schedules.ts'

const scraperRoute = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')

test('Atlantis extracts only future dated sessions from its verified official page', () => {
  const html = `<h1>atlantisEVOLUTION</h1><p>Burslem Stoke on Trent</p><p>LAST UPDATE: 18 October 2026</p>
    <p>9pm | Friday 23 October | 2am 9pm | Saturday 24 October | 2am
    the HALLOWEEN SCREAMS WEEKEND 9pm | Friday 30 October | 2am
    9pm | Saturday 31 October | 2am</p>`
  const events = parseAtlantisSchedule(html, 'https://www.atlantisevolution.co.uk/', '2026-10-22')
  assert.deepEqual(events.map(event => event.event_date), ['2026-10-23', '2026-10-24', '2026-10-30', '2026-10-31'])
  assert.ok(events.every(event => event.text === 'Halloween Screams Weekend' && event.start_time === '21:00'))
  assert.deepEqual(parseAtlantisSchedule(html.replace('Burslem Stoke on Trent', 'Elsewhere'), 'https://www.atlantisevolution.co.uk/', '2026-10-22'), [])
  assert.deepEqual(parseAtlantisSchedule(html, 'https://www.atlantisevolution.co.uk/', '2026-12-22'), [])
  assert.deepEqual(parseAtlantisSchedule(html, 'https://example.com/', '2026-10-22'), [])
})

test('Sweatbox expands only the exact weekly programme published on its events page', () => {
  const html = `<h1>Sweatbox Soho</h1><p>Central London</p>
    <h2>Every Monday</h2><h3>Hard Up Mondays</h3>
    <h2>Every Tuesday</h2><h3>Towel Free Tuesdays</h3><p>every Tuesday, 4pm to midnight!</p>
    <h2>Every Wednesday</h2><h3>Mid Week Foam Party</h3><p>8pm till 10pm</p>
    <h2>Every Thursday</h2><h3>Hard Up Thursdays</h3>
    <h2>Every Sunday</h2><h3>Naked Workout</h3><p>Every Sunday from 2pm - 4pm</p>`
  const events = parseSweatboxSchedule(html, 'https://www.sweatboxsoho.com/events/', '2026-10-22')
  assert.equal(events.length, 30)
  assert.deepEqual(events.slice(0, 4).map(event => [event.event_date, event.text]), [
    ['2026-10-22', 'Hard Up Thursdays'], ['2026-10-25', 'Naked Workout'],
    ['2026-10-26', 'Hard Up Mondays'], ['2026-10-27', 'Towel Free Tuesdays'],
  ])
  assert.equal(events.find(event => event.text === 'Mid Week Foam Party').start_time, '20:00')
  assert.deepEqual(parseSweatboxSchedule(html.replace('Every Tuesday', 'Some Tuesdays'), 'https://www.sweatboxsoho.com/events/', '2026-10-22').filter(event => event.text === 'Towel Free Tuesdays'), [])
})

test('Untamed listing is a safe fallback when dynamic detail-link discovery is incomplete', () => {
  const html = `<h1>Events and tickets</h1><p>Untamed nights</p>
    <h2>House of Hades: The Final Gate</h2><p>Fri 30 Oct</p><p>Bournemouth</p>
    <p>Multiple Dates</p><h2>The Social at UN</h2><p>Wed 04 Nov</p><p>Canvas</p>
    <h2>Canvas 4 Yule</h2><p>Sun 27 Dec</p><p>Confirmed after ticket purchase</p>`
  const events = parseUntamedListing(html, 'https://www.untamednights.co.uk/events-tickets', '2026-10-22')
  assert.deepEqual(events.map(event => event.event_date), ['2026-10-30', '2026-11-04', '2026-12-27'])
  assert.deepEqual(events.map(event => event.text), ['House of Hades: The Final Gate', 'The Social at UN', 'Canvas 4 Yule'])
  assert.deepEqual(parseUntamedListing(html, 'https://untamednights.co.uk/other', '2026-10-22'), [])
})

test('scraper routes all three repaired venues through the dedicated parsers', () => {
  assert.match(scraperRoute, /venueId === 'untamed_nights_bournemouth' \|\|/)
  assert.match(scraperRoute, /return listingEvents\.length > 0 \? listingEvents : extractUntamedNightsEvent/)
  assert.match(scraperRoute, /return parseAtlantisSchedule\(html, pageUrl, londonToday\(\)\)/)
  assert.match(scraperRoute, /return parseSweatboxSchedule\(html, pageUrl, londonToday\(\)\)/)
})
